import { useState, useEffect, useCallback } from 'react'
import { getMe, logout as apiLogout } from '../api/auth'

const TOKEN_KEY = 'dx_token'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) {
      setLoading(false)
      return
    }
    getMe(token)
      .then(data => setUser(data.user))
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY)
        setToken(null)
      })
      .finally(() => setLoading(false))
  }, [token])

  const signIn = useCallback((newToken, userData) => {
    localStorage.setItem(TOKEN_KEY, newToken)
    setToken(newToken)
    setUser(userData)
  }, [])

  const signOut = useCallback(async () => {
    const t = localStorage.getItem(TOKEN_KEY)
    if (t) {
      try { await apiLogout(t) } catch {}
    }
    localStorage.removeItem(TOKEN_KEY)
    setToken(null)
    setUser(null)
  }, [])

  return { user, token, loading, signIn, signOut }
}
