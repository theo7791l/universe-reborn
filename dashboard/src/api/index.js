// Client API centralisé pour le dashboard admin
// Gestion automatique du JWT + refresh token
import axios from 'axios'

const BASE = import.meta.env.VITE_API_URL ?? ''

const api = axios.create({ baseURL: BASE })

// Injecter le token d’accès à chaque requête
api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('ur_dash_access')
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

// Refresh automatique si 401
let refreshing = false
let queue = []

api.interceptors.response.use(
  res => res,
  async err => {
    const orig = err.config
    if (err.response?.status === 401 && !orig._retry) {
      orig._retry = true
      if (refreshing) {
        return new Promise((resolve, reject) => {
          queue.push({ resolve, reject })
        }).then(token => { orig.headers.Authorization = `Bearer ${token}`; return api(orig) })
          .catch(e => Promise.reject(e))
      }
      refreshing = true
      const refresh = localStorage.getItem('ur_dash_refresh')
      if (!refresh) { window.location.href = '/login'; return Promise.reject(err) }
      try {
        const r = await axios.post(`${BASE}/api/auth/refresh`, {}, {
          headers: { Authorization: `Bearer ${refresh}` }
        })
        const newToken = r.data.access_token
        localStorage.setItem('ur_dash_access', newToken)
        queue.forEach(p => p.resolve(newToken))
        queue = []
        orig.headers.Authorization = `Bearer ${newToken}`
        return api(orig)
      } catch (e) {
        queue.forEach(p => p.reject(e))
        queue = []
        localStorage.removeItem('ur_dash_access')
        localStorage.removeItem('ur_dash_refresh')
        window.location.href = '/login'
        return Promise.reject(e)
      } finally {
        refreshing = false
      }
    }
    return Promise.reject(err)
  }
)

export default api
