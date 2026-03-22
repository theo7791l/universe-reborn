import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, ShieldBan, ShieldCheck, Lock, Unlock,
  UserCircle2, Edit3, Save, X, AlertTriangle,
  CheckCircle2, Trash2, VolumeX, Volume2, Eye, Loader2
} from 'lucide-react'
import api from '../api/index.js'

function ConfirmModal({ title, message, danger, onConfirm, onCancel, extra }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="card p-6 w-full max-w-sm flex flex-col gap-4 animate-fade-in">
        <div className="flex items-center gap-3">
          <AlertTriangle size={20} className={danger ? 'text-red-400' : 'text-yellow-400'} />
          <h3 className="font-bold text-white">{title}</h3>
        </div>
        <p className="text-sm text-gray-400">{message}</p>
        {extra}
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel}  className="btn-secondary">Annuler</button>
          <button onClick={onConfirm} className={danger ? 'btn-danger' : 'btn-primary'}>Confirmer</button>
        </div>
      </div>
    </div>
  )
}

export default function AccountDetail() {
  const { id }      = useParams()
  const navigate    = useNavigate()
  const [account,  setAccount]  = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState('')
  const [modal,    setModal]    = useState(null)
  const [toast,    setToast]    = useState(null)
  const [editing,  setEditing]  = useState(false)
  const [editGm,   setEditGm]   = useState('0')
  const [banReason, setBanReason] = useState('')
  const [muteDays,  setMuteDays]  = useState('1')

  const showToast = (msg, ok = true) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3000)
  }

  const load = () => {
    setLoading(true)
    api.get(`/api/admin/accounts/${id}`)
      .then(r => { setAccount(r.data); setEditGm(String(r.data.account.gm_level)) })
      .catch(() => setError('Compte introuvable.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [id])

  const act = async (fn, successMsg, reload = true) => {
    try {
      await fn()
      showToast(successMsg)
      if (reload) load()
    } catch (e) {
      showToast(e.response?.data?.error ?? 'Erreur.', false)
    }
  }

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-violet-400" size={32} /></div>
  if (error)   return <div className="card p-6 text-red-400 flex items-center gap-2"><AlertTriangle size={16} />{error}</div>

  const { account: acc, characters } = account
  const statusBadge = acc.banned
    ? <span className="badge-red">Banni</span>
    : acc.locked
    ? <span className="badge-yellow">Verrouillé</span>
    : (acc.mute_expire && acc.mute_expire > Date.now()/1000)
    ? <span className="badge-yellow">Muté</span>
    : <span className="badge-green">Actif</span>

  const isMuted = acc.mute_expire && acc.mute_expire > Date.now()/1000

  return (
    <div className="flex flex-col gap-6 animate-fade-in">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-xl text-sm font-semibold animate-fade-in ${
          toast.ok ? 'bg-green-600/90 text-white' : 'bg-red-600/90 text-white'
        }`}><CheckCircle2 size={15} /> {toast.msg}</div>
      )}

      {/* Modals */}
      {modal?.type === 'ban' && (
        <ConfirmModal danger title="Bannir ce compte" message={`Bannir ${acc.name} ?`}
          extra={
            <input className="input" placeholder="Raison (optionnel)" value={banReason}
              onChange={e => setBanReason(e.target.value)} />
          }
          onConfirm={() => act(() => api.post(`/api/admin/accounts/${id}/ban`, { reason: banReason }), `${acc.name} banni.`)}
          onCancel={() => setModal(null)} />
      )}
      {modal?.type === 'unban' && (
        <ConfirmModal title="Débannir" message={`Rétablir l'accès de ${acc.name} ?`}
          onConfirm={() => act(() => api.post(`/api/admin/accounts/${id}/unban`), `${acc.name} débanni.`)}
          onCancel={() => setModal(null)} />
      )}
      {modal?.type === 'delete' && (
        <ConfirmModal danger title="Supprimer le compte" message="Action irréversible. Tous les personnages seront effacés."
          onConfirm={async () => {
            try {
              await api.delete(`/api/admin/accounts/${id}`)
              showToast('Compte supprimé.')
              navigate('/accounts')
            } catch (e) { showToast(e.response?.data?.error ?? 'Erreur.', false) }
            setModal(null)
          }}
          onCancel={() => setModal(null)} />
      )}
      {modal?.type === 'mute' && (
        <ConfirmModal title={isMuted ? 'Démuter' : 'Muter'}
          message={isMuted ? `Retirer le mute de ${acc.name} ?` : `Muter ${acc.name} pour combien de jours ?`}
          extra={!isMuted && (
            <input type="number" min="1" max="365" className="input" value={muteDays}
              onChange={e => setMuteDays(e.target.value)} placeholder="Jours" />
          )}
          onConfirm={() => {
            const expire = isMuted ? 0 : Math.floor(Date.now()/1000) + parseInt(muteDays)*86400
            act(() => api.post(`/api/admin/accounts/${id}/mute`, { expire }), isMuted ? 'Mute retiré.' : `${acc.name} muté.`)
            setModal(null)
          }}
          onCancel={() => setModal(null)} />
      )}

      {/* Header */}
      <div>
        <Link to="/accounts" className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-violet-400 transition-colors mb-4">
          <ArrowLeft size={14} /> Retour aux comptes
        </Link>
        <div className="page-header">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-300 font-black text-xl font-title">
              {acc.name[0].toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="page-title">{acc.name}</h1>
                {statusBadge}
                <span className="badge-violet text-xs">GM{acc.gm_level}</span>
              </div>
              <p className="page-subtitle">#{acc.id} · Création : {acc.created_at ? new Date(acc.created_at).toLocaleDateString('fr-FR') : '?'}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {acc.banned
              ? <button onClick={() => { setModal({ type:'unban' }) }} className="btn-success"><ShieldCheck size={14} /> Débannir</button>
              : <button onClick={() => { setBanReason(''); setModal({ type:'ban' }) }} className="btn-danger"><ShieldBan size={14} /> Bannir</button>
            }
            <button onClick={() => act(() => api.post(`/api/admin/accounts/${id}/lock`), acc.locked ? 'Compte déverrouillé.' : 'Compte verrouillé.')} className="btn-secondary">
              {acc.locked ? <Unlock size={14}/> : <Lock size={14}/>}
              {acc.locked ? 'Déverrouiller' : 'Verrouiller'}
            </button>
            <button onClick={() => setModal({ type:'mute' })} className="btn-secondary">
              {isMuted ? <Volume2 size={14}/> : <VolumeX size={14}/>}
              {isMuted ? 'Démuter' : 'Muter'}
            </button>
            <button onClick={() => setModal({ type:'delete' })} className="btn-danger"><Trash2 size={14} /> Supprimer</button>
          </div>
        </div>
      </div>

      {/* Infos + GM Level */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="card p-5">
          <p className="section-title">Informations</p>
          <dl className="flex flex-col gap-3">
            {[
              ['ID',              `#${acc.id}`],
              ['Pseudo',          acc.name],
              ['Play Key ID',     acc.play_key_id ?? '—'],
              ['Création',        acc.created_at ? new Date(acc.created_at).toLocaleDateString('fr-FR') : '—'],
              ['Mute expire',     acc.mute_expire && acc.mute_expire > 0 ? new Date(acc.mute_expire*1000).toLocaleString('fr-FR') : 'Aucun'],
            ].map(([k,v]) => (
              <div key={k} className="flex justify-between text-sm">
                <dt className="text-gray-500">{k}</dt>
                <dd className="text-white font-medium">{v}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="card p-5">
          <p className="section-title">Rôle & Permissions</p>
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-400">GM Level</span>
            {!editing ? (
              <div className="flex items-center gap-2">
                <span className="font-title font-black text-white text-xl">{acc.gm_level}</span>
                <button onClick={() => setEditing(true)} className="btn-icon"><Edit3 size={14} /></button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <input type="number" min={0} max={9} value={editGm}
                  onChange={e => setEditGm(e.target.value)} className="input w-20 text-center" />
                <button onClick={() => act(() => api.post(`/api/admin/accounts/${id}/setgm`, { level: parseInt(editGm) }), 'GM level mis à jour.').then(() => setEditing(false))} className="btn-icon text-green-400"><Save size={14}/></button>
                <button onClick={() => setEditing(false)} className="btn-icon text-red-400"><X size={14}/></button>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-1.5 text-xs text-gray-500">
            {[[0,'Joueur normal'],[1,'Joueur de confiance'],[4,'Modérateur'],[9,'Administrateur']].map(([lvl,desc]) => (
              <div key={lvl} className={`flex items-center gap-2 px-3 py-1.5 rounded ${
                acc.gm_level === lvl ? 'bg-violet-600/20 text-violet-300' : ''
              }`}>
                <span className="font-mono font-bold w-4">{lvl}</span><span>{desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Personnages */}
      <div className="card p-5">
        <p className="section-title flex items-center gap-2"><UserCircle2 size={14} className="text-violet-400" />Personnages ({characters?.length ?? 0})</p>
        {!characters?.length ? (
          <p className="text-gray-500 text-sm">Aucun personnage créé.</p>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>#ID</th><th>Nom</th><th>Zone</th><th>Niveau</th><th>U-Score</th><th>Coins</th><th></th></tr></thead>
              <tbody>
                {characters.map(c => (
                  <tr key={c.id}>
                    <td className="text-gray-500 font-mono text-xs">#{c.id}</td>
                    <td className="text-white font-medium">{c.name}</td>
                    <td className="text-gray-400 text-sm">{c.zone}</td>
                    <td className="text-white font-semibold">{c.level}</td>
                    <td className="text-violet-400 font-semibold">{(c.uscore||0).toLocaleString()}</td>
                    <td className="text-yellow-400 font-semibold">{(c.coins||0).toLocaleString()}</td>
                    <td><Link to={`/characters/${c.id}`} className="btn-icon"><Eye size={14}/></Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
