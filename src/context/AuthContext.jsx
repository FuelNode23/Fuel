import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import apiClient, { DRAFT_TOKEN_KEY } from '../api/client.js'

const AuthContext = createContext(null)

const INACTIVITY_LIMIT_MS = 30 * 60 * 1000 // 30 minutes
const ACTIVITY_EVENTS = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart']

// Cookies aren't how this app stores its session (that's localStorage, see
// persistSession below), but logout is still the right place to sweep any
// that do exist - e.g. ones a browser extension, ad blocker, or a future
// API change might drop on this origin - so a "log out" always leaves the
// browser holding nothing tied to the account. Expires each cookie for
// both "/" and the current path since a cookie set without an explicit
// path defaults to the path it was set from, not "/".
function clearAllCookies() {
  if (typeof document === 'undefined' || !document.cookie) return
  document.cookie.split(';').forEach((entry) => {
    const name = entry.split('=')[0].trim()
    if (!name) return
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=${window.location.pathname}`
  })
}

export function AuthProvider({ children }) {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const inactivityTimerRef = useRef(null)

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    const token = localStorage.getItem('token')
    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser))
      } catch {
        localStorage.removeItem('user')
        localStorage.removeItem('token')
      }
    }
    setLoading(false)
  }, [])

  const persistSession = (authResponse) => {
    const { token, ...userInfo } = authResponse
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(userInfo))
    setUser(userInfo)
  }

  const login = useCallback(async (email, password) => {
    const { data } = await apiClient.post('/auth/login', { email, password })
    persistSession(data)
    return data
  }, [])

  const register = useCallback(async (email, password, fullName) => {
    const { data } = await apiClient.post('/auth/register', { email, password, fullName })
    persistSession(data)
    return data
  }, [])

  // Creates the real account for a draft session (see IdentityGate /
  // Account) - the first moment a password exists for this email. Uses
  // the draft token stashed by client.js's startOnboarding, sent as its
  // own header rather than the standard Authorization flow. Clears that
  // draft token on success since it's no longer needed - `user` is now
  // set via the same persistSession path login/register use. phoneNumber
  // is optional - a blank one is fine, and axios/JSON.stringify drop an
  // undefined value from the request body entirely.
  const completeRegistration = useCallback(async (password, phoneNumber) => {
    const draftToken = sessionStorage.getItem(DRAFT_TOKEN_KEY)
    const { data } = await apiClient.post(
      '/auth/complete-registration',
      { password, phoneNumber },
      { headers: { 'X-Draft-Token': draftToken } }
    )
    persistSession(data)
    sessionStorage.removeItem(DRAFT_TOKEN_KEY)
    return data
  }, [])

  // Saves the athlete-hub "Contact details" card's phone number. Unlike
  // login/register/completeRegistration, the backend response here has no
  // token (it's updating a field on the existing session, not issuing a
  // new one) - merge it into the current user object in place instead of
  // going through persistSession.
  const updateContactDetails = useCallback(async (phoneNumber) => {
    const { data } = await apiClient.put('/auth/contact-details', { phoneNumber })
    setUser((prev) => {
      const updated = { ...prev, ...data }
      localStorage.setItem('user', JSON.stringify(updated))
      return updated
    })
    return data
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    clearAllCookies()
    setUser(null)
  }, [])

  // Auto-logout after 30 minutes with no mouse/keyboard/touch activity
  // anywhere in the app. Only tracked while a session is active - an
  // anonymous visitor has no session to protect.
  useEffect(() => {
    if (!user) return

    const resetTimer = () => {
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current)
      inactivityTimerRef.current = setTimeout(() => {
        logout()
        navigate('/login')
      }, INACTIVITY_LIMIT_MS)
    }

    ACTIVITY_EVENTS.forEach((event) => window.addEventListener(event, resetTimer))
    resetTimer()

    return () => {
      ACTIVITY_EVENTS.forEach((event) => window.removeEventListener(event, resetTimer))
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current)
    }
  }, [user, logout, navigate])

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, completeRegistration, updateContactDetails, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return ctx
}
