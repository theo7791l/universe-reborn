import { useState, useMemo } from 'react'
import {
  Home, Search, Eye, Check, X, Clock,
  ChevronLeft, ChevronRight, MapPin, Star, Trash2
} from 'lucide-react'
import { Link } from 'react-router-dom'

const ZONES = ['Avant Gardens', 'Nimbus Station', 'Nexus Tower', 'Gnarled Forest', 'Forbidden Valley', 'Starbase 3001']

const MOCK_PROPS = Array.from({ length: 29 }, (_, i) => ({
  id: 600 + i,
  name: [
    'Base Paradox Prime', 'Tour de Guet Sentinel', 'Atelier Assembly',
    'Camp Venture', 'Nexus HQ', 'Bunker Maelstrom', 'Jardin Céleste',
    'Forteresse du Vide', 'Station Orbitale', 'Ruines Anciennes',
  ][i % 10],
  owner:     { id: 1800-i, username: ['CosmicBrick','StarForge','BrickSmith','VoidWalker','NinjaLord'][i%5] },
  zone:      ZONES[i % 6],
  status:    i%4===0?'pending': i%4===1?'approved': i%4===2?'rejected':'private',
  models:    Math.floor(Math.random()*120)+5,
  rating:    (Math.random()*5).toFixed(1),
  last_updated: new Date(Date.now()-i*3600000*10).toLocaleDateString('fr-FR'),
  featured:  i % 8 === 0,
}))

const STATUS_CFG = {
  pending:  { badge:'badge-yellow', label:'En attente' },
  approved: { badge:'badge-green',  label:'Approuvée'  },
  rejected: { badge:'badge-red',    label:'Rejetée'    },
  private:  { badge:'badge-gray',   label:'Privée'     },
}

const PER_PAGE = 12

function PropModal({ prop, onClose, onAction }) {
  const [status,  setStatus]  = useState(prop.status)
  const [reason,  setReason]  = useState('')

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="card p-6 w-full max-w-lg flex flex-col gap-5 animate-fade-in">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={STATUS_CFG[status].badge}>{STATUS_CFG[status].label}</span>
              {prop.featured && <span className="badge-yellow">⭐ Featured</span>}
            </div>
            <h3 className="font-bold text-white">{prop.name}</h3>
            <p className="text-xs text-gray-500 mt-1">
              #{prop.id} · Propriétaire :
              <Link to={`/accounts/${prop.owner.id}`} onClick={onClose} className="text-violet-400 ml-1">{prop.owner.username}</Link>
            </p>
          </div>
          <button onClick={onClose} className="btn-icon"><X size={16}/></button>
        </div>

        <dl className="grid grid-cols-2 gap-3 text-sm">
          {[
            ['Zone',         prop.zone],
            ['Modèles',      prop.models],
            ['Note',         `${prop.rating} / 5`],
            ['Mis à jour',   prop.last_updated],
          ].map(([k,v])=>(
            <div key={k} className="bg-[#0d0d1a] border border-[#1e1e3a] rounded p-3">
              <dt className="text-xs text-gray-500 uppercase tracking-wider">{k}</dt>
              <dd className="text-white font-semibold mt-1">{v}</dd>
            </div>
          ))}
        </dl>

        <div>
          <label className="label">Changer le statut</label>
          <select className="select" value={status} onChange={e=>setStatus(e.target.value)}>
            {Object.entries(STATUS_CFG).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
          </select>
        </div>

        {(status==='rejected') && (
          <div>
            <label className="label">Raison du rejet</label>
            <textarea className="input resize-none h-20" placeholder="Expliquer pourquoi..." value={reason} onChange={e=>setReason(e.target.value)}/>
          </div>
        )}

        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="btn-secondary">Annuler</button>
          {status==='approved' && <button onClick={()=>onAction(prop.id,'approved')} className="btn-success"><Check size={14}/> Approuver</button>}
          {status==='rejected' && <button onClick={()=>onAction(prop.id,'rejected',reason)} className="btn-danger"><X size={14}/> Rejeter</button>}
          {status!=='approved'&&status!=='rejected' && <button onClick={()=>onAction(prop.id,status)} className="btn-primary"><Check size={14}/> Enregistrer</button>}
        </div>
      </div>
    </div>
  )
}

export default function Properties() {
  const [props,   setProps]   = useState(MOCK_PROPS)
  const [search,  setSearch]  = useState('')
  const [filter,  setFilter]  = useState('all')
  const [zone,    setZone]    = useState('all')
  const [page,    setPage]    = useState(1)
  const [modal,   setModal]   = useState(null)
  const [toast,   setToast]   = useState(null)

  const showToast = (msg, ok=true) => { setToast({msg,ok}); setTimeout(()=>setToast(null),3000) }

  const filtered = useMemo(() => {
    let list = props
    if (search)         list = list.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.owner.username.toLowerCase().includes(search.toLowerCase()))
    if (filter!=='all') list = list.filter(p => p.status===filter)
    if (zone!=='all')   list = list.filter(p => p.zone===zone)
    return list
  }, [props, search, filter, zone])

  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const paged = filtered.slice((page-1)*PER_PAGE, page*PER_PAGE)

  const handleAction = (id, status, reason='') => {
    setProps(ps => ps.map(p => p.id===id ? {...p, status} : p))
    setModal(null)
    showToast(status==='approved' ? 'Propriété approuvée !' : status==='rejected' ? 'Propriété rejetée.' : 'Propriété mise à jour.', status!=='rejected')
  }

  const deleteProp = (id) => {
    setProps(ps => ps.filter(p => p.id!==id))
    showToast('Propriété supprimée.', false)
  }

  const counts = Object.fromEntries(Object.keys(STATUS_CFG).map(k=>[k, props.filter(p=>p.status===k).length]))

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-xl text-sm font-semibold animate-fade-in ${
          toast.ok?'bg-green-600/90 text-white':'bg-red-600/90 text-white'
        }`}>{toast.msg}</div>
      )}
      {modal && <PropModal prop={modal} onClose={()=>setModal(null)} onAction={handleAction}/>}

      <div className="page-header">
        <div>
          <h1 className="page-title">Propriétés</h1>
          <p className="page-subtitle">{counts.pending} en attente d'approbation · {props.length} total</p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(STATUS_CFG).map(([k,v])=>(
          <button key={k} onClick={()=>{setFilter(k);setPage(1)}}
            className={`stat-card text-left transition-all ${filter===k?'border-violet-500/60':''}`}>
            <Home size={16} className={`mb-1 ${k==='pending'?'text-yellow-400':k==='approved'?'text-green-400':k==='rejected'?'text-red-400':'text-gray-400'}`}/>
            <p className="stat-value">{counts[k]}</p>
            <p className="stat-label">{v.label}</p>
          </button>
        ))}
      </div>

      {/* Filtres */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative sm:col-span-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"/>
          <input className="input-icon" placeholder="Nom ou propriétaire..." value={search} onChange={e=>{setSearch(e.target.value);setPage(1)}}/>
        </div>
        <select className="select" value={filter} onChange={e=>{setFilter(e.target.value);setPage(1)}}>
          <option value="all">Tous les statuts</option>
          {Object.entries(STATUS_CFG).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
        </select>
        <select className="select" value={zone} onChange={e=>{setZone(e.target.value);setPage(1)}}>
          <option value="all">Toutes les zones</option>
          {ZONES.map(z=><option key={z} value={z}>{z}</option>)}
        </select>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {paged.length===0 && <p className="text-gray-500 text-sm col-span-3 text-center py-10">Aucune propriété trouvée</p>}
        {paged.map(p => (
          <div key={p.id} className="card-hover p-4 flex flex-col gap-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={STATUS_CFG[p.status].badge}>{STATUS_CFG[p.status].label}</span>
                  {p.featured && <span className="badge-yellow">⭐</span>}
                </div>
                <h3 className="text-white font-semibold text-sm leading-snug">{p.name}</h3>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={()=>setModal(p)} className="btn-icon" title="Gérer"><Eye size={14}/></button>
                <button onClick={()=>deleteProp(p.id)} className="btn-icon text-red-400" title="Supprimer"><Trash2 size={14}/></button>
              </div>
            </div>

            <div className="flex flex-col gap-1.5 text-xs">
              <div className="flex items-center gap-1.5 text-gray-400">
                <MapPin size={11}/>
                <span>{p.zone}</span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-400">
                <Home size={11}/>
                <span>{p.models} modèles</span>
              </div>
              <div className="flex items-center gap-1.5 text-yellow-400">
                <Star size={11}/>
                <span>{p.rating} / 5</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#1e1e3a]">
              <Link to={`/accounts/${p.owner.id}`} className="text-violet-400 hover:text-violet-300 text-xs">
                {p.owner.username}
              </Link>
              {p.status==='pending' && (
                <div className="flex gap-1">
                  <button onClick={()=>handleAction(p.id,'approved')} className="btn-success px-2 py-1 text-xs">
                    <Check size={11}/> Approuver
                  </button>
                  <button onClick={()=>handleAction(p.id,'rejected')} className="btn-danger px-2 py-1 text-xs">
                    <X size={11}/> Rejeter
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages>1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-500">{filtered.length} propriétés · page {page}/{totalPages}</p>
          <div className="flex items-center gap-1">
            <button className="btn-icon" disabled={page===1} onClick={()=>setPage(p=>p-1)}><ChevronLeft size={14}/></button>
            {Array.from({length:Math.min(totalPages,5)},(_,i)=>i+1).map(p=>(
              <button key={p} onClick={()=>setPage(p)} className={`w-7 h-7 rounded text-xs font-bold transition-colors ${p===page?'bg-violet-600 text-white':'text-gray-400 hover:bg-[#1e1e3a]'}`}>{p}</button>
            ))}
            <button className="btn-icon" disabled={page===totalPages} onClick={()=>setPage(p=>p+1)}><ChevronRight size={14}/></button>
          </div>
        </div>
      )}
    </div>
  )
}
