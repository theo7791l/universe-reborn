import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../api/index.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [loading, setLoading] = useState(true)

  // Restaurer la session depuis localStorage au montage
  useEffect(() => {
    const token = localStorage.getItem('ur_access_token')
    if (!token) { setLoading(false); return }
    api.get('/api/auth/me')
      .then(r => setUser(r.data))
      .catch(() => { localStorage.removeItem('ur_access_token'); setUser(null) })
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (username, password) => {
    const r = await api.post('/api/auth/login', { username, password })
    localStorage.setItem('ur_access_token',  r.data.access_token)
    localStorage.setItem('ur_refresh_token', r.data.refresh_token)
    setUser(r.data.user)
    return r.data.user
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('ur_access_token')
    localStorage.removeItem('ur_refresh_token')
    setUser(null)
  }, [])

  const register = useCallback(async (username, password, playKey) => {
    const r = await api.post('/api/register', {
      username,
      password,
      confirm_password: password,
      play_key: playKey,
      agree: true,
    })
    return r.data
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
