import { useState, useMemo } from 'react'
import {
  Key, Plus, Copy, Check, ToggleLeft, ToggleRight,
  Trash2, Search, Filter, ChevronLeft, ChevronRight,
  RefreshCw, Download
} from 'lucide-react'

function genKey() {
  const seg = () => Math.random().toString(36).substring(2,6).toUpperCase()
  return `${seg()}-${seg()}-${seg()}-${seg()}`
}

const MOCK_KEYS = Array.from({ length: 38 }, (_, i) => ({
  id: i + 1,
  key: genKey(),
  active: i % 5 !== 0,
  used_by: i % 3 === 0 ? null : { id: 1800 - i, username: ['CosmicBrick','StarForge','BrickSmith','VoidWalker','NinjaLord'][i%5] },
  created_at: new Date(Date.now() - i * 86400000 * 2).toLocaleDateString('fr-FR'),
  created_by: 'AdminReborn',
  used_at: i % 3 === 0 ? null : new Date(Date.now() - i * 3600000 * 12).toLocaleDateString('fr-FR'),
}))

const PER_PAGE = 15

export default function PlayKeys() {
  const [keys,    setKeys]    = useState(MOCK_KEYS)
  const [search,  setSearch]  = useState('')
  const [filter,  setFilter]  = useState('all') // all | active | inactive | used | unused
  const [page,    setPage]    = useState(1)
  const [copied,  setCopied]  = useState(null)
  const [genCount,setGenCount]= useState(1)
  const [toast,   setToast]   = useState(null)

  const showToast = (msg, ok=true) => { setToast({msg,ok}); setTimeout(()=>setToast(null),3000) }

  const filtered = useMemo(() => {
    let list = keys
    if (search) list = list.filter(k =>
      k.key.toLowerCase().includes(search.toLowerCase()) ||
      k.used_by?.username.toLowerCase().includes(search.toLowerCase())
    )
    if (filter === 'active')   list = list.filter(k => k.active)
    if (filter === 'inactive') list = list.filter(k => !k.active)
    if (filter === 'used')     list = list.filter(k => k.used_by)
    if (filter === 'unused')   list = list.filter(k => !k.used_by)
    return list
  }, [keys, search, filter])

  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const paged = filtered.slice((page-1)*PER_PAGE, page*PER_PAGE)

  const copyKey = (key) => {
    navigator.clipboard.writeText(key).catch(()=>{})
    setCopied(key)
    setTimeout(()=>setCopied(null), 2000)
  }

  const toggleKey = (id) => {
    setKeys(ks => ks.map(k => k.id === id ? {...k, active: !k.active} : k))
    const k = keys.find(k=>k.id===id)
    showToast(`Clé ${k.active ? 'désactivée' : 'activée'}.`)
  }

  const deleteKey = (id) => {
    setKeys(ks => ks.filter(k => k.id !== id))
    showToast('Clé supprimée.', false)
  }

  const generateKeys = () => {
    const news = Array.from({length: genCount}, (_, i) => ({
      id: Date.now() + i,
      key: genKey(),
      active: true,
      used_by: null,
      created_at: new Date().toLocaleDateString('fr-FR'),
      created_by: 'AdminReborn',
      used_at: null,
    }))
    setKeys(ks => [...news, ...ks])
    showToast(`${genCount} clé${genCount>1?'s':''} générée${genCount>1?'s':''}.`)
  }

  const exportCsv = () => {
    const rows = ['id,key,active,used_by,created_at', ...keys.map(k =>
      `${k.id},${k.key},${k.active},${k.used_by?.username??''},${k.created_at}`
    )].join('\n')
    const blob = new Blob([rows], {type:'text/csv'})
    const a = document.createElement('a'); a.href=URL.createObjectURL(blob)
    a.download='play_keys.csv'; a.click()
  }

  const stats = {
    total:    keys.length,
    active:   keys.filter(k=>k.active).length,
    used:     keys.filter(k=>k.used_by).length,
    unused:   keys.filter(k=>!k.used_by && k.active).length,
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in">

      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-xl text-sm font-semibold animate-fade-in ${
          toast.ok ? 'bg-green-600/90 text-white' : 'bg-red-600/90 text-white'
        }`}>{toast.msg}</div>
      )}

      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Play Keys</h1>
          <p className="page-subtitle">{stats.total} clés · {stats.used} utilisées · {stats.unused} disponibles</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={exportCsv} className="btn-secondary"><Download size={14}/> Exporter CSV</button>
        </div>
      </div>

      {/* Stat mini-cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {label:'Total',      value:stats.total,  color:'text-white'},
          {label:'Actives',    value:stats.active, color:'text-green-400'},
          {label:'Utilisées',  value:stats.used,   color:'text-violet-400'},
          {label:'Disponibles',value:stats.unused, color:'text-yellow-400'},
        ].map(s=>(
          <div key={s.label} className="stat-card">
            <Key size={16} className={`${s.color} mb-1`}/>
            <p className={`stat-value ${s.color}`}>{s.value}</p>
            <p className="stat-label">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Générateur */}
      <div className="card p-5">
        <p className="section-title flex items-center gap-2"><Plus size={14} className="text-violet-400"/>Générer des clés</p>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-400">Quantité :</label>
            <input type="number" min={1} max={100} value={genCount}
              onChange={e=>setGenCount(Math.max(1,Math.min(100,parseInt(e.target.value)||1)))}
              className="input w-20 text-center"
            />
          </div>
          <button onClick={generateKeys} className="btn-primary">
            <RefreshCw size={14}/> Générer {genCount} clé{genCount>1?'s':''}
          </button>
        </div>
      </div>

      {/* Filtres + recherche */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"/>
          <input className="input-icon" placeholder="Rechercher clé ou utilisateur..." value={search}
            onChange={e=>{setSearch(e.target.value);setPage(1)}}/>
        </div>
        <select className="select min-w-[160px]" value={filter}
          onChange={e=>{setFilter(e.target.value);setPage(1)}}>
          <option value="all">Toutes</option>
          <option value="active">Actives</option>
          <option value="inactive">Désactivées</option>
          <option value="used">Utilisées</option>
          <option value="unused">Disponibles</option>
        </select>
      </div>

      {/* Table */}
      <div className="card">
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>#</th><th>Clé</th><th>Statut</th><th>Utilisée par</th><th>Création</th><th>Utilisée le</th><th></th></tr></thead>
            <tbody>
              {paged.length===0 && <tr><td colSpan={7} className="text-center text-gray-500 py-10">Aucune clé</td></tr>}
              {paged.map(k => (
                <tr key={k.id}>
                  <td className="text-gray-500 font-mono text-xs">#{k.id}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-white tracking-wider">{k.key}</span>
                      <button onClick={()=>copyKey(k.key)} className="btn-icon p-1" title="Copier">
                        {copied===k.key ? <Check size={12} className="text-green-400"/> : <Copy size={12}/>}
                      </button>
                    </div>
                  </td>
                  <td>{k.active ? <span className="badge-green">Active</span> : <span className="badge-red">Désactivée</span>}</td>
                  <td>{k.used_by
                    ? <span className="text-violet-400 text-xs">{k.used_by.username}</span>
                    : <span className="text-gray-600 text-xs">— Disponible</span>}
                  </td>
                  <td className="text-gray-500 text-xs">{k.created_at}</td>
                  <td className="text-gray-500 text-xs">{k.used_at ?? '—'}</td>
                  <td>
                    <div className="flex items-center gap-1">
                      <button onClick={()=>toggleKey(k.id)} className="btn-icon" title={k.active?'Désactiver':'Activer'}>
                        {k.active
                          ? <ToggleRight size={16} className="text-green-400"/>
                          : <ToggleLeft  size={16} className="text-gray-500"/>}
                      </button>
                      {!k.used_by && (
                        <button onClick={()=>deleteKey(k.id)} className="btn-icon text-red-400" title="Supprimer">
                          <Trash2 size={14}/>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-[#1e1e3a]">
            <p className="text-xs text-gray-500">{filtered.length} résultats · page {page}/{totalPages}</p>
            <div className="flex items-center gap-1">
              <button className="btn-icon" disabled={page===1} onClick={()=>setPage(p=>p-1)}><ChevronLeft size={14}/></button>
              {Array.from({length:Math.min(totalPages,5)},(_,i)=>i+1).map(p=>(
                <button key={p} onClick={()=>setPage(p)}
                  className={`w-7 h-7 rounded text-xs font-bold transition-colors ${p===page?'bg-violet-600 text-white':'text-gray-400 hover:bg-[#1e1e3a]'}`}>{p}</button>
              ))}
              <button className="btn-icon" disabled={page===totalPages} onClick={()=>setPage(p=>p+1)}><ChevronRight size={14}/></button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
