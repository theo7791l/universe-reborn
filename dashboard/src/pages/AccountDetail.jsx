import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft, ShieldBan, ShieldCheck, Mail,
  Lock, Unlock, UserCircle2, Key, Edit3,
  Save, X, AlertTriangle, CheckCircle2, Trash2
} from 'lucide-react'

// Mock — à remplacer par GET /api/accounts/:id
const MOCK_ACCOUNT = {
  id: 1800,
  username: 'CosmicBrick',
  email: 'cosmicbrick@mail.com',
  gm_level: 0,
  banned: false,
  locked: false,
  email_verified: true,
  created_at: '01/01/2026',
  last_login: '20/03/2026',
  play_key: 'PK-1000',
  characters: [
    { id: 201, name: 'Starfall',  faction: 'Paradox',   level: 41, coins: 9383 },
    { id: 202, name: 'Frostbite', faction: 'Assembly',  level: 22, coins: 1204 },
  ],
  sanctions: [
    { type: 'warn', reason: 'Langage inapproprié', date: '10/02/2026', by: 'ModChief' },
  ],
}

function ConfirmModal({ title, message, danger, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="card p-6 w-full max-w-sm flex flex-col gap-4 animate-fade-in">
        <div className="flex items-center gap-3">
          <AlertTriangle size={20} className={danger ? 'text-red-400' : 'text-yellow-400'} />
          <h3 className="font-bold text-white">{title}</h3>
        </div>
        <p className="text-sm text-gray-400">{message}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="btn-secondary">Annuler</button>
          <button
            onClick={onConfirm}
            className={danger ? 'btn-danger' : 'btn-primary'}
          >Confirmer</button>
        </div>
      </div>
    </div>
  )
}

export default function AccountDetail() {
  const { id }  = useParams()
  const account = MOCK_ACCOUNT // TODO: fetch by id

  const [banned,  setBanned]  = useState(account.banned)
  const [locked,  setLocked]  = useState(account.locked)
  const [gmLevel, setGmLevel] = useState(account.gm_level)
  const [editing, setEditing] = useState(false)
  const [editGm,  setEditGm]  = useState(String(account.gm_level))
  const [modal,   setModal]   = useState(null) // { type, ... }
  const [toast,   setToast]   = useState(null)

  const showToast = (msg, ok = true) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3000)
  }

  const handleBan = () => setModal({ type: 'ban' })
  const handleUnban = () => setModal({ type: 'unban' })
  const confirmBan = () => {
    setBanned(true); setModal(null)
    showToast(`${account.username} a été banni.`)
  }
  const confirmUnban = () => {
    setBanned(false); setModal(null)
    showToast(`${account.username} a été débanni.`, true)
  }

  const handleLock = () => {
    setLocked(l => !l)
    showToast(locked ? 'Compte déverrouillé.' : 'Compte verrouillé.')
  }

  const handleSaveGm = () => {
    setGmLevel(parseInt(editGm))
    setEditing(false)
    showToast('GM Level mis à jour.')
  }

  const handleResetPw = () => setModal({ type: 'resetpw' })
  const confirmResetPw = () => {
    setModal(null)
    showToast('Email de réinitialisation envoyé.')
  }

  const handleDelete = () => setModal({ type: 'delete' })
  const confirmDelete = () => {
    setModal(null)
    showToast('Compte supprimé.', false)
    // TODO: redirect
  }

  const statusBadge = banned
    ? <span className="badge-red">Banni</span>
    : locked
    ? <span className="badge-yellow">Verrouillé</span>
    : <span className="badge-green">Actif</span>

  return (
    <div className="flex flex-col gap-6 animate-fade-in">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-xl text-sm font-semibold animate-fade-in ${
          toast.ok ? 'bg-green-600/90 text-white' : 'bg-red-600/90 text-white'
        }`}>
          <CheckCircle2 size={15} /> {toast.msg}
        </div>
      )}

      {/* Modal */}
      {modal?.type === 'ban'    && <ConfirmModal danger title="Bannir ce compte" message={`Bannir définitivement ${account.username} ?`} onConfirm={confirmBan} onCancel={() => setModal(null)} />}
      {modal?.type === 'unban'  && <ConfirmModal title="Débannir ce compte" message={`Rétablir l’accès de ${account.username} ?`} onConfirm={confirmUnban} onCancel={() => setModal(null)} />}
      {modal?.type === 'resetpw'&& <ConfirmModal title="Reset mot de passe" message="Envoyer un email de réinitialisation ?" onConfirm={confirmResetPw} onCancel={() => setModal(null)} />}
      {modal?.type === 'delete' && <ConfirmModal danger title="Supprimer le compte" message="Cette action est irréversible. Toutes les données seront perdues." onConfirm={confirmDelete} onCancel={() => setModal(null)} />}

      {/* Back + header */}
      <div>
        <Link to="/accounts" className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-violet-400 transition-colors mb-4">
          <ArrowLeft size={14} /> Retour aux comptes
        </Link>
        <div className="page-header">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-300 font-black text-xl font-title">
              {account.username[0].toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="page-title">{account.username}</h1>
                {statusBadge}
              </div>
              <p className="page-subtitle">
                #{account.id} · {account.email}
                {account.email_verified
                  ? <span className="text-green-400 ml-2 text-xs">✓ Email vérifié</span>
                  : <span className="text-yellow-400 ml-2 text-xs">⚠ Email non vérifié</span>
                }
              </p>
            </div>
          </div>

          {/* Actions principales */}
          <div className="flex flex-wrap gap-2">
            {banned
              ? <button onClick={handleUnban}  className="btn-success"><ShieldCheck size={14} /> Débannir</button>
              : <button onClick={handleBan}    className="btn-danger"> <ShieldBan   size={14} /> Bannir</button>
            }
            <button onClick={handleLock}   className="btn-secondary">
              {locked ? <Unlock size={14} /> : <Lock size={14} />}
              {locked ? 'Déverrouiller' : 'Verrouiller'}
            </button>
            <button onClick={handleResetPw} className="btn-secondary"><Mail size={14} /> Reset MDP</button>
            <button onClick={handleDelete}  className="btn-danger">   <Trash2 size={14} /> Supprimer</button>
          </div>
        </div>
      </div>

      {/* Infos + GM Level */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        {/* Infos générales */}
        <div className="card p-5">
          <p className="section-title">Informations</p>
          <dl className="flex flex-col gap-3">
            {[
              ['ID',               `#${account.id}`],
              ['Pseudo',           account.username],
              ['Email',            account.email],
              ['Play Key',         account.play_key],
              ['Création',         account.created_at],
              ['Dernière connexion', account.last_login],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between text-sm">
                <dt className="text-gray-500">{k}</dt>
                <dd className="text-white font-medium">{v}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* GM Level */}
        <div className="card p-5">
          <p className="section-title">Rôle & Permissions</p>
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-400">GM Level</span>
            {!editing ? (
              <div className="flex items-center gap-2">
                <span className="font-title font-black text-white text-xl">{gmLevel}</span>
                <button onClick={() => { setEditing(true); setEditGm(String(gmLevel)) }} className="btn-icon">
                  <Edit3 size={14} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <input
                  type="number" min={0} max={9}
                  value={editGm}
                  onChange={e => setEditGm(e.target.value)}
                  className="input w-20 text-center"
                />
                <button onClick={handleSaveGm} className="btn-icon text-green-400"><Save size={14} /></button>
                <button onClick={() => setEditing(false)} className="btn-icon text-red-400"><X size={14} /></button>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-1.5 text-xs text-gray-500">
            {[
              [0, 'Joueur normal'],
              [1, 'Joueur de confiance'],
              [4, 'Modérateur'],
              [9, 'Administrateur'],
            ].map(([lvl, desc]) => (
              <div key={lvl} className={`flex items-center gap-2 px-3 py-1.5 rounded ${
                gmLevel === lvl ? 'bg-violet-600/20 text-violet-300' : ''
              }`}>
                <span className="font-mono font-bold w-4">{lvl}</span>
                <span>{desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Personnages */}
      <div className="card p-5">
        <p className="section-title flex items-center gap-2">
          <UserCircle2 size={14} className="text-violet-400" />
          Personnages ({account.characters.length})
        </p>
        {account.characters.length === 0 ? (
          <p className="text-gray-500 text-sm">Aucun personnage créé.</p>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>#ID</th><th>Nom</th><th>Faction</th><th>Niveau</th><th>Coins</th><th></th></tr></thead>
              <tbody>
                {account.characters.map(c => (
                  <tr key={c.id}>
                    <td className="text-gray-500 font-mono text-xs">#{c.id}</td>
                    <td className="text-white font-medium">{c.name}</td>
                    <td><span className="badge-violet">{c.faction}</span></td>
                    <td className="text-white font-semibold">{c.level}</td>
                    <td className="text-yellow-400 font-semibold">{c.coins.toLocaleString()}</td>
                    <td>
                      <Link to={`/characters/${c.id}`} className="btn-icon">
                        <Eye size={14} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Historique sanctions */}
      <div className="card p-5">
        <p className="section-title flex items-center gap-2">
          <AlertTriangle size={14} className="text-red-400" />
          Historique des sanctions ({account.sanctions.length})
        </p>
        {account.sanctions.length === 0 ? (
          <p className="text-gray-500 text-sm">Aucune sanction.</p>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Type</th><th>Raison</th><th>Date</th><th>Par</th></tr></thead>
              <tbody>
                {account.sanctions.map((s, i) => (
                  <tr key={i}>
                    <td><span className="badge-yellow capitalize">{s.type}</span></td>
                    <td className="text-gray-300">{s.reason}</td>
                    <td className="text-gray-500 text-xs">{s.date}</td>
                    <td className="text-violet-400 text-sm">{s.by}</td>
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
