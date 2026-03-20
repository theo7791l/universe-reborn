import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Gamepad2, Mail, Lock, LogIn } from 'lucide-react'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })

  const handleSubmit = e => {
    e.preventDefault()
    // TODO: connecter à l’API DarkflameServer
    alert('Connexion à venir — API non connectée.')
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-24">
      <div className="w-full max-w-md">
        <div className="card p-8 flex flex-col gap-6">

          {/* Logo */}
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-800 flex items-center justify-center shadow-lg shadow-violet-500/30">
              <Gamepad2 size={28} className="text-white" />
            </div>
            <div className="text-center">
              <h1 className="font-title text-xl font-black uppercase tracking-widest">
                <span className="text-white">UNIVERSE</span>
                <span className="text-violet-400"> REBORN</span>
              </h1>
              <p className="text-gray-400 text-sm mt-1">Connectez-vous à votre compte</p>
            </div>
          </div>

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Email</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="email"
                  placeholder="votre@email.com"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  required
                  className="w-full bg-[#0d0d1a] border border-[#1e1e3a] rounded pl-9 pr-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Mot de passe</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="password"
                  placeholder="Votre mot de passe"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  required
                  className="w-full bg-[#0d0d1a] border border-[#1e1e3a] rounded pl-9 pr-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>
            </div>

            <button type="submit" className="btn-primary justify-center mt-2">
              <LogIn size={15} /> Se connecter
            </button>
          </form>

          <p className="text-center text-xs text-gray-500">
            Pas encore de compte ?{' '}
            <Link to="/register" className="text-violet-400 hover:text-violet-300 transition-colors font-semibold">
              Créer un compte
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
