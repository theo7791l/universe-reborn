import { useState, useEffect } from 'react'
import { User, Shield, Key, UserCircle2, Lock, AlertTriangle, CheckCircle, Eye, EyeOff, Bug } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import api from '../api/index.js'

export default function PlayerDashboard() {
  const { user } = useAuth()
  const [profile,      setProfile]      = useState(null)
  const [characters,   setCharacters]   = useState([])
  const [loading,      setLoading]      = useState(true)
  const [pwForm,       setPwForm]       = useState({ current: '', newPw: '', confirm: '' })
  const [pwShow,       setPwShow]       = useState(false)
  const [pwStatus,     setPwStatus]     = useState(null)
  const [bugForm,      setBugForm]      = useState({ title: '', body: '' })
  const [bugStatus,    setBugStatus]    = useState(null)
  const [bugLoading,   setBugLoading]   = useState(false)
  const [pwLoading,    setPwLoading]    = useState(false)

  useEffect(() => {
    Promise.all([
      api.get('/player/me'),
      api.get('/admin/characters?per_page=10&account=' + (user?.id ?? '')),
    ])
      .then(([profileRes, charsRes]) => {
        setProfile(profileRes.data)
        setCharacters(charsRes.data.characters || [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [user])

  const handleChangePw = async () => {
    if (pwForm.newPw !== pwForm.confirm)
      return setPwStatus({ type: 'error', msg: 'Les mots de passe ne correspondent pas.' })
    if (pwForm.newPw.length < 8)
      return setPwStatus({ type: 'error', msg: 'Minimum 8 caractères requis.' })
    setPwLoading(true)
    setPwStatus(null)
    try {
      await api.post('/player/change-password', {
        current_password: pwForm.current,
        new_password:     pwForm.newPw,
      })
      setPwStatus({ type: 'success', msg: 'Mot de passe mis à jour avec succès.' })
      setPwForm({ current: '', newPw: '', confirm: '' })
    } catch (e) {
      setPwStatus({ type: 'error', msg: e.response?.data?.error || 'Erreur lors du changement.' })
    } finally { setPwLoading(false) }
  }

  const handleBugReport = async () => {
    if (!bugForm.title.trim() || !bugForm.body.trim())
      return setBugStatus({ type: 'error', msg: 'Titre et description sont requis.' })
    setBugLoading(true)
    setBugStatus(null)
    try {
      await api.post('/bug-reports', bugForm)
      setBugStatus({ type: 'success', msg: 'Signalement envoyé. Merci !' })
      setBugForm({ title: '', body: '' })
    } catch (e) {
      setBugStatus({ type: 'error', msg: e.response?.data?.error || 'Erreur lors de l\'envoi.' })
    } finally { setBugLoading(false) }
  }

  if (loading) return (
    <div className="flex justify-center py-20">
      <span className="w-10 h-10 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin"/>
    </div>
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-title">Mon espace joueur</h1>
        <p className="text-gray-400 text-sm mt-1">Gérez votre compte et signalez des bugs</p>
      </div>

      {/* Profil */}
      <div className="card p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-violet-600 to-purple-800 flex items-center justify-center text-xl font-bold">
            {user?.username?.[0]?.toUpperCase() ?? '?'}
          </div>
          <div>
            <h2 className="text-white font-bold text-lg">{user?.username}</h2>
            <p className="text-gray-400 text-sm">GM Level {profile?.gm_level ?? 0}</p>
          </div>
          <div className="ml-auto flex flex-col gap-1 text-right">
            {profile?.banned && (
              <span className="badge-red flex items-center gap-1"><AlertTriangle size={12}/> Banni</span>
            )}
            {profile?.locked && (
              <span className="badge-yellow flex items-center gap-1"><Lock size={12}/> Verrouillé</span>
            )}
            {!profile?.banned && !profile?.locked && (
              <span className="badge-green flex items-center gap-1"><CheckCircle size={12}/> Actif</span>
            )}
          </div>
        </div>
        <dl className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          {[
            ['Compte créé', profile?.created_at ?? '—'],
            ['Dernière co.', profile?.last_login ?? '—'],
            ['Personnages', characters.length],
            ['Play Key', profile?.play_key_used ?? '—'],
          ].map(([k, v]) => (
            <div key={k} className="bg-[#0d0d1a] rounded-lg p-3">
              <dt className="text-xs text-gray-400 uppercase tracking-wider mb-1">{k}</dt>
              <dd className="text-white font-medium">{v}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Personnages */}
      {characters.length > 0 && (
        <div className="card p-6">
          <h2 className="font-semibold text-white flex items-center gap-2 mb-4">
            <UserCircle2 size={16} className="text-violet-400"/> Mes personnages
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {characters.map(c => (
              <div key={c.id} className="bg-[#0d0d1a] border border-[#1e1e3a] rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-violet-700 flex items-center justify-center text-sm font-bold">{c.name[0]}</div>
                  <div>
                    <p className="text-white font-medium text-sm">{c.name}</p>
                    <p className="text-gray-500 text-xs">Dernière zone : {c.last_zone ?? 'Inconnue'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Changer mot de passe */}
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-white flex items-center gap-2">
            <Key size={16} className="text-violet-400"/> Changer le mot de passe
          </h2>

          {pwStatus && (
            <div className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
              pwStatus.type === 'success' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
            }`}>
              {pwStatus.type === 'success' ? <CheckCircle size={14}/> : <AlertTriangle size={14}/>}
              {pwStatus.msg}
            </div>
          )}

          {[['Mot de passe actuel', 'current'], ['Nouveau mot de passe', 'newPw'], ['Confirmer', 'confirm']].map(([label, key]) => (
            <div key={key}>
              <label className="text-xs text-gray-400 uppercase tracking-wider mb-1 block">{label}</label>
              <div className="relative">
                <input
                  type={pwShow ? 'text' : 'password'}
                  value={pwForm[key]}
                  onChange={e => setPwForm(f => ({ ...f, [key]: e.target.value }))}
                  className="input w-full pr-10"
                />
                {key === 'newPw' && (
                  <button
                    onClick={() => setPwShow(s => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {pwShow ? <EyeOff size={14}/> : <Eye size={14}/>}
                  </button>
                )}
              </div>
            </div>
          ))}

          <button
            onClick={handleChangePw}
            disabled={pwLoading}
            className="btn-primary w-full flex justify-center items-center gap-2"
          >
            {pwLoading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>}
            Mettre à jour
          </button>
        </div>

        {/* Signaler un bug */}
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-white flex items-center gap-2">
            <Bug size={16} className="text-violet-400"/> Signaler un bug
          </h2>

          {bugStatus && (
            <div className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
              bugStatus.type === 'success' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
            }`}>
              {bugStatus.type === 'success' ? <CheckCircle size={14}/> : <AlertTriangle size={14}/>}
              {bugStatus.msg}
            </div>
          )}

          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wider mb-1 block">Titre *</label>
            <input
              type="text" maxLength={100}
              placeholder="Desc. courte du problème..."
              value={bugForm.title}
              onChange={e => setBugForm(f => ({ ...f, title: e.target.value }))}
              className="input w-full"
            />
          </div>

          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wider mb-1 block">Description *</label>
            <textarea
              rows={4} maxLength={1000}
              placeholder="Décrivez le bug, les étapes pour le reproduire..."
              value={bugForm.body}
              onChange={e => setBugForm(f => ({ ...f, body: e.target.value }))}
              className="input w-full resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">{bugForm.body.length}/1000</p>
          </div>

          <button
            onClick={handleBugReport}
            disabled={bugLoading}
            className="btn-primary w-full flex justify-center items-center gap-2"
          >
            {bugLoading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>}
            Envoyer le signalement
          </button>
        </div>
      </div>
    </div>
  )
}
