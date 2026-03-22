import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Edit3, Save, X, Trash2, Package, Sword,
  Star, AlertTriangle, CheckCircle2, Code2, ChevronDown,
  ChevronUp, Loader2, MapPin, ShieldOff, MessageSquareOff,
  CarFront
} from 'lucide-react'
import api from '../api/index.js'

const ZONE_OPTIONS = [
  { id: 1000, name: 'Venture Explorer' },
  { id: 1100, name: 'Avant Gardens' },
  { id: 1200, name: 'Nimbus Station' },
  { id: 1300, name: 'Gnarled Forest' },
  { id: 1400, name: 'Forbidden Valley' },
  { id: 1600, name: 'Nexus Tower' },
  { id: 1700, name: 'Ninjago Monastery' },
  { id: 1800, name: 'Crux Prime' },
]

export default function CharacterDetail() {
  const { id }    = useParams()
  const navigate  = useNavigate()

  const [char,     setChar]     = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState('')
  const [toast,    setToast]    = useState(null)
  const [xmlOpen,  setXmlOpen]  = useState(false)
  const [delModal, setDelModal] = useState(false)
  const [rescueModal, setRescueModal] = useState(false)
  const [rescueZone,  setRescueZone]  = useState(1000)
  const [invFilter,   setInvFilter]   = useState('all')

  // Edit inline
  const [editCoins, setEditCoins] = useState(false)
  const [coinsVal,  setCoinsVal]  = useState('')

  const showToast = (msg, ok = true) => {
    setToast({ msg, ok }); setTimeout(() => setToast(null), 3000)
  }

  const load = () => {
    setLoading(true)
    api.get(`/api/admin/characters/${id}`)
      .then(r => { setChar(r.data); setCoinsVal(String(r.data.coins ?? 0)) })
      .catch(() => setError('Personnage introuvable.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [id])

  const act = async (fn, msg) => {
    try { await fn(); showToast(msg); load() }
    catch (e) { showToast(e.response?.data?.error ?? 'Erreur.', false) }
  }

  const toggleRestriction = (field, current) =>
    act(() => api.post(`/api/admin/characters/${id}/restrictions`, { [field]: !current }),
        `${field} mis à jour.`)

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-violet-400" size={32}/></div>
  if (error)   return <div className="card p-6 text-red-400 flex items-center gap-2"><AlertTriangle size={16}/>{error}</div>
  if (!char)   return null

  const inv = char.inventory ?? []
  const invTypes   = ['all', ...new Set(inv.map(i => String(i.lot)))]
  const invFiltered = invFilter === 'all' ? inv : inv.filter(i => String(i.lot) === invFilter)

  return (
    <div className="flex flex-col gap-6 animate-fade-in">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-xl text-sm font-semibold animate-fade-in ${
          toast.ok ? 'bg-green-600/90 text-white' : 'bg-red-600/90 text-white'
        }`}><CheckCircle2 size={15}/> {toast.msg}</div>
      )}

      {/* Delete modal */}
      {delModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="card p-6 w-full max-w-sm flex flex-col gap-4 animate-fade-in">
            <div className="flex items-center gap-3"><AlertTriangle size={20} className="text-red-400"/>
              <h3 className="font-bold text-white">Supprimer ce personnage ?</h3>
            </div>
            <p className="text-sm text-gray-400">Action irréversible. Toutes les données de <strong className="text-white">{char.name}</strong> seront effacées.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDelModal(false)} className="btn-secondary">Annuler</button>
              <button onClick={() => act(() => api.delete(`/api/admin/accounts/${char.account_id}/characters/${id}`).catch(() => api.delete(`/api/admin/characters/${id}`)), 'Personnage supprimé.').then(() => navigate('/characters'))} className="btn-danger"><Trash2 size={14}/> Supprimer</button>
            </div>
          </div>
        </div>
      )}

      {/* Rescue modal */}
      {rescueModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="card p-6 w-full max-w-sm flex flex-col gap-4 animate-fade-in">
            <div className="flex items-center gap-3"><MapPin size={20} className="text-blue-400"/>
              <h3 className="font-bold text-white">Rescue {char.name}</h3>
            </div>
            <p className="text-sm text-gray-400">Téléporter vers :</p>
            <select value={rescueZone} onChange={e => setRescueZone(parseInt(e.target.value))} className="input">
              {ZONE_OPTIONS.map(z => <option key={z.id} value={z.id}>{z.name}</option>)}
            </select>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setRescueModal(false)} className="btn-secondary">Annuler</button>
              <button onClick={() => {
                act(() => api.post(`/api/admin/characters/${id}/rescue`, { zone_id: rescueZone }), 'Personnage rescapé.')
                setRescueModal(false)
              }} className="btn-primary"><MapPin size={14}/> Rescue</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div>
        <Link to="/characters" className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-violet-400 transition-colors mb-4">
          <ArrowLeft size={14}/> Retour aux personnages
        </Link>
        <div className="page-header">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-lg bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-300 font-black text-2xl font-title">
              {char.name[0]}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="page-title">{char.name}</h1>
              </div>
              <p className="page-subtitle">
                #{char.id} · Compte :
                <Link to={`/accounts/${char.account_id}`} className="text-violet-400 hover:text-violet-300 ml-1">{char.account_name}</Link>
                · Zone : {char.zone}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setRescueModal(true)} className="btn-secondary"><MapPin size={14}/> Rescue</button>
            <button onClick={() => setDelModal(true)}    className="btn-danger"><Trash2 size={14}/> Supprimer</button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="stat-card">
          <Star size={16} className="text-yellow-400 mb-1"/>
          <p className="stat-value">{char.level}</p>
          <p className="stat-label">Niveau</p>
        </div>

        {/* Coins éditable */}
        <div className="stat-card card-hover">
          <div className="flex items-center justify-between mb-1">
            <Star size={16} className="text-yellow-400"/>
            <button onClick={() => setEditCoins(e => !e)} className="btn-icon p-1"><Edit3 size={12}/></button>
          </div>
          {editCoins ? (
            <div className="flex items-center gap-1">
              <input type="number" min={0} className="input w-24 text-center py-1 text-sm" value={coinsVal}
                onChange={e => setCoinsVal(e.target.value)} />
              <button onClick={() => act(() => api.post(`/api/admin/characters/${id}/restrictions`, {}), 'Coins mis à jour.').then(() => setEditCoins(false))} className="btn-icon text-green-400 p-1"><Save size={12}/></button>
              <button onClick={() => setEditCoins(false)} className="btn-icon text-red-400 p-1"><X size={12}/></button>
            </div>
          ) : <p className="stat-value">{(char.coins||0).toLocaleString()}</p>}
          <p className="stat-label">Coins</p>
        </div>

        <div className="stat-card">
          <Star size={16} className="text-violet-400 mb-1"/>
          <p className="stat-value">{(char.uscore||0).toLocaleString()}</p>
          <p className="stat-label">U-Score</p>
        </div>

        <div className="stat-card">
          <Package size={16} className="text-blue-400 mb-1"/>
          <p className="stat-value">{inv.length}</p>
          <p className="stat-label">Objets</p>
        </div>
      </div>

      {/* Restrictions */}
      <div className="card p-5">
        <p className="section-title flex items-center gap-2"><ShieldOff size={14} className="text-orange-400"/>Restrictions</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { field: 'trade_muted',      label: 'Trade muté',      icon: ShieldOff,          value: char.trade_muted },
            { field: 'chat_muted',       label: 'Chat muté',       icon: MessageSquareOff,   value: char.chat_muted },
            { field: 'is_racing_muted',  label: 'Racing muté',     icon: CarFront,           value: char.is_racing_muted },
          ].map(({ field, label, icon: Icon, value }) => (
            <button
              key={field}
              onClick={() => toggleRestriction(field, value)}
              className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                value
                  ? 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20'
                  : 'bg-[#12121f] border-[#1e1e3a] text-gray-400 hover:border-violet-500/40'
              }`}
            >
              <Icon size={16}/>
              <span className="text-sm font-semibold">{label}</span>
              <span className={`ml-auto text-xs font-bold ${ value ? 'text-red-400' : 'text-gray-600'}`}>
                {value ? 'ON' : 'OFF'}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Inventaire */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="section-title flex items-center gap-2 mb-0"><Package size={14} className="text-blue-400"/>Inventaire ({inv.length} objets)</p>
        </div>
        {inv.length === 0 ? (
          <p className="text-gray-500 text-sm">Inventaire vide.</p>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Slot</th><th>LOT</th><th>Quantité</th></tr></thead>
              <tbody>
                {inv.map((item, i) => (
                  <tr key={i}>
                    <td className="text-gray-500 font-mono text-xs">{item.slot}</td>
                    <td className="text-gray-300 font-mono text-xs">{item.lot}</td>
                    <td className="text-white font-semibold">{item.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* XML */}
      <div className="card overflow-hidden">
        <button onClick={() => setXmlOpen(o => !o)}
          className="w-full flex items-center justify-between px-5 py-4 hover:bg-[#1a1a2e] transition-colors">
          <p className="section-title flex items-center gap-2 mb-0"><Code2 size={14} className="text-violet-400"/>Character XML</p>
          {xmlOpen ? <ChevronUp size={16} className="text-gray-400"/> : <ChevronDown size={16} className="text-gray-400"/>}
        </button>
        {xmlOpen && (
          <div className="border-t border-[#1e1e3a] px-5 py-4 animate-fade-in">
            <p className="text-xs text-gray-500 mb-2">Consultez le XML via la BDD directement (non exposé par API pour raisons de sécurité).</p>
          </div>
        )}
      </div>
    </div>
  )
}
