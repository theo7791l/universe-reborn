import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import axios from 'axios'

const AuthContext = createContext(null)

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:2005'

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)   // { id, username, gm_level, email }
  const [loading, setLoading] = useState(true)   // true pendant la vérification initiale

  // Axëns instance avec cookie/session
  const api = axios.create({
    baseURL: API,
    withCredentials: true,
  })

  // Vérifier si une session existe au montage
  useEffect(() => {
    api.get('/api/auth/me')
      .then(r => setUser(r.data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (username, password) => {
    const r = await api.post('/api/auth/login', { username, password })
    setUser(r.data)
    return r.data
  }, [])

  const logout = useCallback(async () => {
    await api.post('/api/auth/logout').catch(() => {})
    setUser(null)
  }, [])

  const isAdmin = user?.gm_level >= 9
  const isMod   = user?.gm_level >= 4

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAdmin, isMod, api }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
