import axios from 'axios'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://16.16.77.123/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

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
  return response.data
}

export default apiClient