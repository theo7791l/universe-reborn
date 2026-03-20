import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { Gamepad2, User, Lock, LogIn, AlertCircle, Loader2 } from 'lucide-react'

export default function Login() {
  const { login } = useAuth()
  const navigate  = useNavigate()
  const [form,    setForm]    = useState({ username: '', password: '' })
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(form.username, form.password)
      navigate('/overview', { replace: true })
    } catch (err) {
      setError(
        err?.response?.data?.message ??
        'Identifiants incorrects ou accès insuffisant.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#0a0a14]">
      {/* Fond étoilé subtil */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 60 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width:   Math.random() * 2 + 1 + 'px',
              height:  Math.random() * 2 + 1 + 'px',
              top:     Math.random() * 100 + '%',
              left:    Math.random() * 100 + '%',
              opacity: Math.random() * 0.4 + 0.1,
            }}
          />
        ))}
      </div>

      <div className="relative w-full max-w-md">
        <div className="card p-8 flex flex-col gap-7">

          {/* Header */}
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-900 flex items-center justify-center shadow-xl shadow-violet-500/30">
              <Gamepad2 size={32} className="text-white" />
            </div>
            <div className="text-center">
              <h1 className="font-title text-lg font-black uppercase tracking-widest">
                <span className="text-white">UNIVERSE </span>
                <span className="text-violet-400">REBORN</span>
              </h1>
              <p className="text-gray-400 text-xs mt-1 uppercase tracking-widest">Dashboard Admin</p>
            </div>
          </div>

          {/* Erreur */}
          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded px-4 py-3 text-red-400 text-sm animate-fade-in">
              <AlertCircle size={15} className="shrink-0" />
              {error}
            </div>
          )}

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="label">Nom d’utilisateur</label>
              <div className="relative">
                <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  className="input-icon"
                  placeholder="Admin"
                  value={form.username}
                  onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                  required
                  autoFocus
                />
              </div>
            </div>

            <div>
              <label className="label">Mot de passe</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="password"
                  className="input-icon"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn-primary justify-center mt-1" disabled={loading}>
              {loading
                ? <><Loader2 size={15} className="animate-spin" /> Connexion...</>
                : <><LogIn size={15} /> Se connecter</>
              }
            </button>
          </form>

          <p className="text-center text-xs text-gray-600">
            Accès réservé aux comptes avec GM Level ≥ 4
          </p>
        </div>
      </div>
    </div>
  )
}
