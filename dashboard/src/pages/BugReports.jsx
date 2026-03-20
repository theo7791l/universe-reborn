import { useState, useMemo } from 'react'
import {
  Bug, Search, Eye, Check, X, Clock,
  AlertTriangle, ChevronLeft, ChevronRight,
  MessageSquare, Tag
} from 'lucide-react'
import { Link } from 'react-router-dom'

const CATEGORIES = ['Gameplay', 'UI', 'Réseau', 'Crash', 'Progression', 'Chat', 'Autre']

const MOCK_BUGS = Array.from({ length: 31 }, (_, i) => ({
  id: 200 + i,
  title: [
    'Crash au chargement de Crux Prime',
    'Inventaire vide après reconnexion',
    'Mission bloquée à Avant Gardens',
    'Ping anormalement élevé sur Nimbus Station',
    'Personnage bloqué dans la géométrie',
    'Bouton de faction non fonctionnel',
    'Chat global ne s\'affiche pas',
    'Drop d\'items dupliqués après mort',
    'Écran noir au changement de zone',
    'Sons manquants dans le hub principal',
  ][i % 10],
  category:    CATEGORIES[i % 7],
  reporter:    { id: 1800-i, username: ['CosmicBrick','StarForge','BrickSmith','VoidWalker','NinjaLord'][i%5] },
  status:      i%4===0?'open': i%4===1?'progress': i%4===2?'resolved':'wont_fix',
  priority:    i%3===0?'high': i%3===1?'medium':'low',
  description: 'Le jeu plante avec une erreur fatale lorsque le joueur tente d\'entrer dans la zone. Le problème se reproduit à chaque tentative. Version client : 1.10.64.',
  steps:       '1. Se connecter
2. Aller vers la porte de Crux Prime
3. Cliquer sur Entrer
4. Crash immédiat',
  date:        new Date(Date.now()-i*3600000*6).toLocaleDateString('fr-FR'),
  comments:    Math.floor(Math.random()*5),
}))

const STATUS_CFG = {
  open:      { badge:'badge-red',    label:'Ouvert'    },
  progress:  { badge:'badge-yellow', label:'En cours'  },
  resolved:  { badge:'badge-green',  label:'Résolu'    },
  wont_fix:  { badge:'badge-gray',   label:'Won\'t Fix' },
}
const PRIORITY_CFG = {
  high:   { badge:'badge-red',    label:'Haute'  },
  medium: { badge:'badge-yellow', label:'Moyenne'},
  low:    { badge:'badge-blue',   label:'Basse'  },
}

const PER_PAGE = 12

function BugModal({ bug, onClose, onUpdate }) {
  const [status,   setStatus]   = useState(bug.status)
  const [priority, setPriority] = useState(bug.priority)
  const [comment,  setComment]  = useState('')

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="card p-6 w-full max-w-2xl flex flex-col gap-5 animate-fade-in my-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={STATUS_CFG[status].badge}>{STATUS_CFG[status].label}</span>
              <span className={PRIORITY_CFG[priority].badge}>{PRIORITY_CFG[priority].label}</span>
              <span className="badge-blue">{bug.category}</span>
            </div>
            <h3 className="font-bold text-white text-base">{bug.title}</h3>
            <p className="text-xs text-gray-500 mt-1">
              #{bug.id} · Signalé par
              <Link to={`/accounts/${bug.reporter.id}`} onClick={onClose} className="text-violet-400 ml-1">{bug.reporter.username}</Link>
              · {bug.date}
            </p>
          </div>
          <button onClick={onClose} className="btn-icon shrink-0"><X size={16}/></button>
        </div>

        <div className="bg-[#0d0d1a] border border-[#1e1e3a] rounded p-4">
          <p className="text-xs text-gray-400 uppercase tracking-wider font-bold mb-2">Description</p>
          <p className="text-sm text-gray-300 leading-relaxed">{bug.description}</p>
        </div>

        <div className="bg-[#0d0d1a] border border-[#1e1e3a] rounded p-4">
          <p className="text-xs text-gray-400 uppercase tracking-wider font-bold mb-2">Étapes de reproduction</p>
          <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono">{bug.steps}</pre>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Statut</label>
            <select className="select" value={status} onChange={e=>setStatus(e.target.value)}>
              {Object.entries(STATUS_CFG).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Priorité</label>
            <select className="select" value={priority} onChange={e=>setPriority(e.target.value)}>
              {Object.entries(PRIORITY_CFG).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="label">Commentaire interne</label>
          <textarea className="input resize-none h-20" placeholder="Notes pour l'équipe..." value={comment} onChange={e=>setComment(e.target.value)}/>
        </div>

        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="btn-secondary">Annuler</button>
          <button onClick={()=>onUpdate(bug.id, status, priority)} className="btn-primary"><Check size={14}/> Enregistrer</button>
        </div>
      </div>
    </div>
  )
}

export default function BugReports() {
  const [bugs,    setBugs]    = useState(MOCK_BUGS)
  const [search,  setSearch]  = useState('')
  const [status,  setStatus]  = useState('all')
  const [priority,setPriority]= useState('all')
  const [category,setCategory]= useState('all')
  const [page,    setPage]    = useState(1)
  const [modal,   setModal]   = useState(null)
  const [toast,   setToast]   = useState(null)

  const showToast = msg => { setToast(msg); setTimeout(()=>setToast(null),3000) }

  const filtered = useMemo(() => {
    let list = bugs
    if (search)           list = list.filter(b => b.title.toLowerCase().includes(search.toLowerCase()) || b.reporter.username.toLowerCase().includes(search.toLowerCase()))
    if (status   !=='all') list = list.filter(b => b.status   === status)
    if (priority !=='all') list = list.filter(b => b.priority === priority)
    if (category !=='all') list = list.filter(b => b.category === category)
    return list
  }, [bugs, search, status, priority, category])

  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const paged = filtered.slice((page-1)*PER_PAGE, page*PER_PAGE)

  const handleUpdate = (id, newStatus, newPriority) => {
    setBugs(bs => bs.map(b => b.id===id ? {...b, status:newStatus, priority:newPriority} : b))
    setModal(null)
    showToast('Bug report mis à jour.')
  }

  const counts = Object.fromEntries(Object.keys(STATUS_CFG).map(k=>[k, bugs.filter(b=>b.status===k).length]))

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {toast && <div className="fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-lg bg-green-600/90 text-white text-sm font-semibold shadow-xl animate-fade-in">{toast}</div>}
      {modal && <BugModal bug={modal} onClose={()=>setModal(null)} onUpdate={handleUpdate}/>}

      <div className="page-header">
        <div>
          <h1 className="page-title">Bug Reports</h1>
          <p className="page-subtitle">{counts.open} ouvert{counts.open>1?'s':''} · {bugs.length} total</p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(STATUS_CFG).map(([k,v])=>(
          <button key={k} onClick={()=>{setStatus(k);setPage(1)}}
            className={`stat-card text-left transition-all ${status===k?'border-violet-500/60':''}`}>
            <Bug size={16} className={`mb-1 ${k==='open'?'text-red-400':k==='progress'?'text-yellow-400':k==='resolved'?'text-green-400':'text-gray-400'}`}/>
            <p className="stat-value">{counts[k]}</p>
            <p className="stat-label">{v.label}</p>
          </button>
        ))}
      </div>

      {/* Filtres */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="relative lg:col-span-2">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"/>
          <input className="input-icon" placeholder="Rechercher titre ou auteur..." value={search} onChange={e=>{setSearch(e.target.value);setPage(1)}}/>
        </div>
        <select className="select" value={status} onChange={e=>{setStatus(e.target.value);setPage(1)}}>
          <option value="all">Tous les statuts</option>
          {Object.entries(STATUS_CFG).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
        </select>
        <select className="select" value={priority} onChange={e=>{setPriority(e.target.value);setPage(1)}}>
          <option value="all">Toutes priorités</option>
          {Object.entries(PRIORITY_CFG).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>

      {/* Filtre catégorie */}
      <div className="flex gap-2 flex-wrap">
        {['all',...CATEGORIES].map(c=>(
          <button key={c} onClick={()=>{setCategory(c);setPage(1)}}
            className={`px-3 py-1 rounded text-xs font-bold transition-colors ${category===c?'bg-violet-600 text-white':'bg-[#1e1e3a] text-gray-400 hover:text-white'}`}>
            {c==='all'?'Toutes catégories':c}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="card">
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>#</th><th>Titre</th><th>Catégorie</th><th>Priorité</th><th>Statut</th><th>Auteur</th><th>Date</th><th></th></tr></thead>
            <tbody>
              {paged.length===0 && <tr><td colSpan={8} className="text-center text-gray-500 py-10">Aucun rapport</td></tr>}
              {paged.map(b=>(
                <tr key={b.id}>
                  <td className="text-gray-500 font-mono text-xs">#{b.id}</td>
                  <td className="text-white font-medium text-sm max-w-[220px] truncate">{b.title}</td>
                  <td><span className="badge-blue">{b.category}</span></td>
                  <td><span className={PRIORITY_CFG[b.priority].badge}>{PRIORITY_CFG[b.priority].label}</span></td>
                  <td><span className={STATUS_CFG[b.status].badge}>{STATUS_CFG[b.status].label}</span></td>
                  <td><Link to={`/accounts/${b.reporter.id}`} className="text-violet-400 hover:text-violet-300 text-xs">{b.reporter.username}</Link></td>
                  <td className="text-gray-500 text-xs">{b.date}</td>
                  <td>
                    <div className="flex items-center gap-1">
                      <button onClick={()=>setModal(b)} className="btn-icon" title="Détail"><Eye size={14}/></button>
                      {b.status==='open'&&<button onClick={()=>handleUpdate(b.id,'resolved',b.priority)} className="btn-icon text-green-400" title="Résoudre"><Check size={14}/></button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages>1&&(
          <div className="flex items-center justify-between px-4 py-3 border-t border-[#1e1e3a]">
            <p className="text-xs text-gray-500">{filtered.length} résultats · page {page}/{totalPages}</p>
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
    </div>
  )
}
