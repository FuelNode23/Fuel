import axios from 'axios'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://app.fuelnode.fr/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// The draft token (from startOnboarding) is deliberately kept separate from
// the real session token in localStorage - it's sent as its own header
// (see generateDraftProtocol/AuthContext.completeRegistration), never
// through the standard Authorization flow real sessions use. Holding it in
// sessionStorage rather than AuthContext's `user` state is intentional:
// there is no "logged in" state during the draft phase at all.
export const DRAFT_TOKEN_KEY = 'draftToken'

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
    return Promise.reject(error)
  }
)

/**
 * Single call: submit onboarding answers, backend calls Claude, and the
 * AI-generated protocol comes back as JSON in this same response.
 * This is the ONLY place protocol generation happens — OnboardingFlow
 * calls this once on "Finish", and the result is carried forward via
 * navigate() state + sessionStorage. Nothing else should call the
 * generation endpoint again for the same submission.
 *
 * Response shape (snake_case, straight from Claude — see
 * Protocoladapters.js for the full confirmed field list): {
 * protocol_version, generated_date, language, athlete_summary,
 * macro_targets, diet_protocol, fueling_protocol,
 * active_specialist_protocols, weekly_box_contents,
 * box_total_products, box_french_brand_percentage, assembly_notes,
 * science_cards, protocol_changelog, assumptions_made,
 * missing_data_flags }.
 *
 * @param {object} userData - collected onboarding answers
 * @returns {Promise<object>} protocol JSON, shape above
 */
export async function submitOnboarding(userData) {
  const response = await apiClient.post('/protocol/generate-with-profile', userData)
  
  console.log('submitOnboarding response:', response.data) // Log the response data for debugging
  return response.data
}

/**
 * Onboarding doesn't require login first - a visitor can fill out all 11
 * steps anonymously. If "Finish" hits a 401, OnboardingFlow stashes the
 * collected answers under this sessionStorage key and sends the user to
 * register/login instead of submitting. Call this right after a
 * successful login/register so that submission actually happens once
 * there's a real session, instead of stranding the user on a blank
 * dashboard after they already did all the work.
 *
 * @param {(path: string, options?: object) => void} navigate - react-router navigate
 * @returns {Promise<boolean>} true if a pending submission was found and handled
 */
export async function completePendingOnboarding(navigate) {
  const pending = sessionStorage.getItem('pendingOnboarding')
  if (!pending) return false

  sessionStorage.removeItem('pendingOnboarding')
  const userData = JSON.parse(pending)

  try {
    const onboardingResult = await submitOnboarding(userData)
    sessionStorage.setItem('protocolHandoff', JSON.stringify({ onboardingResult, userData }))
    navigate('/protocol', { state: { onboardingResult, userData } })
  } catch {
    // Now authenticated, but generation itself failed (500, network, etc.) -
    // same fallback OnboardingFlow uses: preserve answers, let Protocol's
    // retry flow handle it, instead of losing everything a second time.
    sessionStorage.setItem('protocolHandoff', JSON.stringify({ userData, saveFailed: true }))
    navigate('/protocol', { state: { userData, saveFailed: true } })
  }

  return true
}

/**
 * Persists the plan/box-variant chosen on the Subscriptions page for the
 * current authenticated user. No billing exists yet - this only records
 * the choice, via POST /api/subscription.
 *
 * @param {string} plan - one of the Subscriptions.jsx PLANS keys (free/amateur/performance/elite)
 * @param {string|null} boxVariant - one of boxVariants.js's keys (international/value/french), or null
 * @returns {Promise<object>} { plan, boxVariant, updatedAt }
 */
export async function saveSubscription(plan, boxVariant) {
  const response = await apiClient.post('/subscription', { plan, boxVariant })
  return response.data
}

/**
 * Fetches the current user's saved subscription choice. Rejects with a 404
 * (via the response) if nothing has been selected yet - callers should
 * treat that as "no active plan", not an error to surface.
 *
 * @returns {Promise<object>} { plan, boxVariant, updatedAt }
 */
export async function getSubscription() {
  const response = await apiClient.get('/subscription/me')
  return response.data
}

/**
 * The athlete's most recently generated protocol, persisted at
 * registration time (see AuthContext.completeRegistration /
 * saveGeneratedProtocol) - used as a fallback source for Protocol.jsx and
 * Weeklybox.jsx when there's no in-session handoff (sessionStorage/
 * navigate state), e.g. a fresh login on a new device/tab, or after
 * sessionStorage was cleared. `responseJson` is a JSON *string* (raw
 * TEXT column on the backend), not already parsed - see Protocoladapters.js's
 * header comment for the exact shape once parsed. Rejects with a 404 if
 * nothing has ever been generated - callers should treat that as "empty",
 * same as no handoff.
 *
 * @returns {Promise<object>} the full NutritionProtocol row, including
 *   nested `athleteProfile` (backend shape, not onboarding's userData shape)
 */
export async function getLatestProtocol() {
  const response = await apiClient.get('/protocol/latest')
  return response.data
}

/**
 * Per-tier prices computed server-side from the athlete's actual generated
 * box and the real product catalog (see UserSubscriptionService), not the
 * static numbers in Subscriptions.jsx's PLANS array. Rejects (via the
 * response) with a 404 if no protocol has been generated yet - callers
 * should fall back to the static prices in that case.
 *
 * @param {string|null} boxVariant - one of boxVariants.js's keys (international/value/french);
 *   only "international" changes the total (real substitute products), value/french price
 *   the same as the base box since they're pure re-sorts of the same items.
 * @returns {Promise<object>} { free, amateur, performance, elite } (numbers, EUR)
 */
export async function getSubscriptionPricing(boxVariant) {
  const response = await apiClient.get('/subscription/pricing', {
    params: boxVariant ? { boxVariant } : undefined,
  })
  return response.data
}

/**
 * Starts real Stripe Checkout for the plan already saved via
 * saveSubscription (see StripeCheckoutService) - a hosted, redirect-based
 * flow, so the only thing to do with the result is send the browser to it
 * (window.location.href = url), not render anything from it directly.
 * Rejects with a 400 (via the response) if the saved plan is "free"
 * (nothing to pay for) or no plan was saved yet.
 *
 * @returns {Promise<object>} { url }
 */
export async function createCheckoutSession() {
  const response = await apiClient.post('/subscription/checkout')
  return response.data
}

/**
 * Identity capture with no account created - see AuthService (backend) for
 * the full deferred-auth design. Returns a draft token and stores it in
 * sessionStorage under DRAFT_TOKEN_KEY; this is NOT "being logged in" -
 * AuthContext's `user` stays null until completeRegistration succeeds.
 * Rejects with a 409 (via the response) if this email already has a real
 * account - callers should show an inline login prompt in that case, not a
 * generic error.
 *
 * @param {string} email
 * @param {string} fullName
 * @returns {Promise<object>} { draftToken, email, fullName }
 */
export async function startOnboarding(email, fullName) {
  const { data } = await apiClient.post('/auth/start', { email, fullName })
  sessionStorage.setItem(DRAFT_TOKEN_KEY, data.draftToken)
  return data
}

/**
 * Generates a protocol for an athlete with no account yet, using the draft
 * token from startOnboarding - sent as its own header, deliberately never
 * through the standard Authorization flow real sessions use (this is a
 * different axios call shape from every other function in this file for
 * exactly that reason). Saves nothing server-side; the result is held
 * entirely client-side until completeRegistration + saveGeneratedProtocol
 * persist it for real.
 *
 * @param {object} profileRequest - same shape submitOnboarding already sends
 * @returns {Promise<object>} protocol JSON, same shape submitOnboarding returns
 */
export async function generateDraftProtocol(profileRequest) {
  const draftToken = sessionStorage.getItem(DRAFT_TOKEN_KEY)
  const response = await apiClient.post('/protocol/generate-draft', profileRequest, {
    headers: { 'X-Draft-Token': draftToken },
  })
  return response.data
}

/**
 * Persists a protocol already generated during the draft phase - call
 * right after completeRegistration + PUT /api/athletes/profile succeed, so
 * the box the athlete already reviewed is exactly what gets saved with no
 * second Claude call. Normal authenticated call (real session token via
 * the usual interceptor), no draft token involved.
 *
 * @param {object} protocolJson - the object returned by generateDraftProtocol
 * @returns {Promise<object>} the saved NutritionProtocol row
 */
export async function saveGeneratedProtocol(protocolJson) {
  const response = await apiClient.post('/protocol/save-generated', {
    protocolJson: JSON.stringify(protocolJson),
  })
  return response.data
}

/**
 * Emails a 6-digit sign-in code to the given address (see
 * EmailOtpController). No session or draft token involved - stateless,
 * unlike verifying, which is AuthContext.verifyOtp instead since a correct
 * code for an existing account logs the visitor in.
 *
 * @param {string} email
 * @returns {Promise<void>}
 */
export async function sendOtp(email) {
  await apiClient.post('/otp/send', { email })
}

/**
 * Every real catalog product sharing a given protocol_slot, best-scored
 * first - what the weekly box's "swap for an equivalent" picker lists
 * (see WeeklyBox.jsx's ProductSwapPicker). Unlike the /catalog/international
 * and /catalog/french lookups, not scoped to one origin.
 *
 * @param {string} slot - a box item's protocol_slot (e.g. "DURING_ISOTONIC")
 * @returns {Promise<object[]>} [{ id, brand, productName, brandOrigin, ... }]
 */
export async function getCatalogBySlot(slot) {
  const response = await apiClient.get(`/catalog/slot/${encodeURIComponent(slot)}`)
  return response.data
}

/**
 * Replaces one weekly-box item with a real catalog alternative sharing the
 * same protocol_slot, persisted on the athlete's current saved protocol -
 * not just a client-side reorder like the International/French box views.
 * Normal authenticated call.
 *
 * currentProductName disambiguates which item to replace when a box has
 * more than one item sharing the same slot (confirmed this happens on
 * real generated boxes) - slot alone isn't always unique.
 *
 * @param {string} protocolSlot
 * @param {string} currentProductName
 * @param {number} catalogProductId
 * @returns {Promise<object>} the updated box item, same shape as any other
 *   weekly_box_contents entry (product_name, brand, brand_origin, quantity,
 *   protocol_slot, why_this_product: null, storage_note: null)
 */
export async function swapBoxItem(protocolSlot, currentProductName, catalogProductId) {
  const response = await apiClient.put('/protocol/box-item', {
    protocolSlot,
    currentProductName,
    catalogProductId,
  })
  return response.data
}

export default apiClient