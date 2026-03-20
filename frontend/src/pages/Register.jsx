import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Gamepad2, User, Mail, Lock, Key, UserPlus } from 'lucide-react'

export default function Register() {
  const [form, setForm] = useState({
    pseudo: '', email: '', password: '', confirm: '', playKey: '',
  })
  const [error, setError] = useState('')

  const handleSubmit = e => {
    e.preventDefault()
    if (form.password !== form.confirm) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }
    if (form.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.')
      return
    }
    setError('')
    // TODO: connecter à l’API DarkflameServer
    alert('Inscription à venir — API non connectée.')
  }

  const field = (label, name, type, placeholder, Icon) => (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-bold uppercase tracking-widest text-gray-400">{label}</label>
      <div className="relative">
        <Icon size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          type={type}
          placeholder={placeholder}
          value={form[name]}
          onChange={e => setForm(f => ({ ...f, [name]: e.target.value }))}
          required
          className="w-full bg-[#0d0d1a] border border-[#1e1e3a] rounded pl-9 pr-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 transition-colors"
        />
      </div>
    </div>
  )

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
              <p className="text-gray-400 text-sm mt-1">Créez votre compte Universe Reborn</p>
            </div>
          </div>

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {field('Pseudo',               'pseudo',   'text',     'Votre pseudo',              User)}
            {field('Email',                'email',    'email',    'votre@email.com',            Mail)}
            {field('Mot de passe',         'password', 'password', 'Minimum 6 caractères',       Lock)}
            {field('Confirmer le mot de passe', 'confirm', 'password', 'Répétez le mot de passe', Lock)}

            {/* Play Key */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Clé d’accès (Play Key)</label>
              <div className="relative">
                <Key size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  placeholder="XXXX-XXXX-XXXX-XXXX"
                  value={form.playKey}
                  onChange={e => setForm(f => ({ ...f, playKey: e.target.value }))}
                  required
                  className="w-full bg-[#0d0d1a] border border-[#1e1e3a] rounded pl-9 pr-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 transition-colors font-mono"
                />
              </div>
              <p className="text-xs text-gray-500">
                Obtenez une clé gratuitement sur notre{' '}
                <a href="#" className="text-violet-400 hover:text-violet-300 transition-colors">Discord</a>.
              </p>
            </div>

            {error && (
              <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded px-3 py-2">
                {error}
              </p>
            )}

            <button type="submit" className="btn-primary justify-center mt-2">
              <UserPlus size={15} /> Créer mon compte
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
