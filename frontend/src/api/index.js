// Client API centralisé pour la vitrine
import axios from 'axios'

const BASE = import.meta.env.VITE_API_URL ?? ''

const api = axios.create({
  baseURL: BASE,
  withCredentials: false,
})

// Injecter le token JWT si présent
api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('ur_access_token')
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

export default api
