import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Gamepad2, User, Lock, Key, UserPlus, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'

export default function Register() {
  const { register } = useAuth()
  const navigate     = useNavigate()
  const [form, setForm] = useState({ username: '', password: '', confirm: '', playKey: '' })
  const [error,   setError]   = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirm) { setError('Les mots de passe ne correspondent pas.'); return }
    if (form.password.length < 8)       { setError('Mot de passe trop court (8 caractères minimum).'); return }
    setLoading(true)
    try {
      await register(form.username, form.password, form.playKey.toUpperCase())
      setSuccess(true)
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      setError(err.response?.data?.error ?? 'Erreur lors de l\'inscription.')
    } finally {
      setLoading(false)
    }
  }

  const field = (label, name, type, placeholder, Icon) => (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-bold uppercase tracking-widest text-gray-400">{label}</label>
      <div className="relative">
        <Icon size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          type={type} placeholder={placeholder} value={form[name]} required
          onChange={e => setForm(f => ({ ...f, [name]: e.target.value }))}
          className="w-full bg-[#0d0d1a] border border-[#1e1e3a] rounded pl-9 pr-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 transition-colors"
        />
      </div>
    </div>
  )

  if (success) return (
    <div className="min-h-screen flex items-center justify-center px-4 py-24">
      <div className="card p-8 flex flex-col items-center gap-4 max-w-md w-full">
        <CheckCircle2 size={48} className="text-green-400" />
        <h2 className="font-title font-black text-xl text-white uppercase">Compte créé !</h2>
        <p className="text-gray-400 text-sm text-center">Redirection vers la connexion…</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-24">
      <div className="w-full max-w-md">
        <div className="card p-8 flex flex-col gap-6">

          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-800 flex items-center justify-center shadow-lg shadow-violet-500/30">
              <Gamepad2 size={28} className="text-white" />
            </div>
            <div className="text-center">
              <h1 className="font-title text-xl font-black uppercase tracking-widest">
                <span className="text-white">UNIVERSE</span>
                <span className="text-violet-400"> REBORN</span>
              </h1>
              <p className="text-gray-400 text-sm mt-1">Créez votre compte Universe Reborn</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {field('Pseudo',                    'username', 'text',     'Votre pseudo (3–32 caractères)',  User)}
            {field('Mot de passe',              'password', 'password', 'Minimum 8 caractères',            Lock)}
            {field('Confirmer le mot de passe', 'confirm',  'password', 'Répétez le mot de passe',          Lock)}

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Clé d’accès (Play Key)</label>
              <div className="relative">
                <Key size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text" placeholder="XXXX-XXXX-XXXX-XXXX" required
                  value={form.playKey}
                  onChange={e => setForm(f => ({ ...f, playKey: e.target.value }))}
                  className="w-full bg-[#0d0d1a] border border-[#1e1e3a] rounded pl-9 pr-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 transition-colors font-mono"
                />
              </div>
              <p className="text-xs text-gray-500">
                Obtenez une clé gratuitement sur notre{' '}
                <a href="#" className="text-violet-400 hover:text-violet-300 transition-colors">Discord</a>.
              </p>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded px-3 py-2">
                <AlertCircle size={13} /> {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary justify-center mt-2 disabled:opacity-60">
              {loading ? <Loader2 size={15} className="animate-spin" /> : <UserPlus size={15} />}
              Créer mon compte
            </button>
          </form>

          <p className="text-center text-xs text-gray-500">
            Déjà un compte ?{' '}
            <Link to="/login" className="text-violet-400 hover:text-violet-300 transition-colors font-semibold">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
