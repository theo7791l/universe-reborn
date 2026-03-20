import { useState, useMemo } from 'react'
import {
  Shield, Search, Eye, Check, X,
  AlertTriangle, Clock, ChevronLeft, ChevronRight,
  MessageSquare, User, Calendar
} from 'lucide-react'
import { Link } from 'react-router-dom'

const MOCK_REPORTS = Array.from({length: 24}, (_, i) => ({
  id: 500 + i,
  reporter:  { id: 1800-i, username: ['CosmicBrick','StarForge','BrickSmith','VoidWalker','NinjaLord'][i%5] },
  reported:  { id: 1700-i, username: ['MaelstromKing','ToxicBrick','BanMe99','SpamBot','CheaterX'][i%5] },
  reason:    [
    'Langage inapproprié en jeu',
    'Triche / exploitation de bug',
    'Harcèlement d’un autre joueur',
    'Nom de personnage offensant',
    'Spam de messages en chat',
    'Comportement toxique persistant',
  ][i%6],
  status:    i%4===0 ? 'resolved' : i%4===1 ? 'progress' : i%4===2 ? 'dismissed' : 'open',
  date:      new Date(Date.now()-i*3600000*8).toLocaleDateString('fr-FR'),
  notes:     i%4===0 ? 'Avertissement envoyé. Joueur informé.' : '',
}))

const STATUS_CONFIG = {
  open:      { badge: 'badge-red',    label: 'Ouvert',    icon: AlertTriangle },
  progress:  { badge: 'badge-yellow', label: 'En cours',  icon: Clock         },
  resolved:  { badge: 'badge-green',  label: 'Résolu',    icon: Check         },
  dismissed: { badge: 'badge-gray',   label: 'Ignoré',    icon: X             },
}

const PER_PAGE = 12

function DetailModal({ report, onClose, onUpdate }) {
  const [status, setStatus] = useState(report.status)
  const [notes,  setNotes]  = useState(report.notes)

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="card p-6 w-full max-w-lg flex flex-col gap-5 animate-fade-in">
        <div className="flex items-center justify-between">
          <h3 className="font-title text-sm font-black uppercase tracking-widest text-white">Signalement #{report.id}</h3>
          <button onClick={onClose} className="btn-icon"><X size={16}/></button>
        </div>

        <div className="flex flex-col gap-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Signalant</span>
            <Link to={`/accounts/${report.reporter.id}`} onClick={onClose} className="text-violet-400 hover:text-violet-300">{report.reporter.username}</Link>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Signalié</span>
            <Link to={`/accounts/${report.reported.id}`} onClick={onClose} className="text-red-400 hover:text-red-300">{report.reported.username}</Link>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Date</span>
            <span className="text-white">{report.date}</span>
          </div>
          <div className="bg-[#0d0d1a] border border-[#1e1e3a] rounded p-3">
            <p className="text-xs text-gray-400 mb-1 uppercase tracking-wider font-bold">Motif</p>
            <p className="text-white text-sm">{report.reason}</p>
          </div>
        </div>

        <div>
          <label className="label">Statut</label>
          <select className="select" value={status} onChange={e=>setStatus(e.target.value)}>
            {Object.entries(STATUS_CONFIG).map(([k,v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">Notes de modération</label>
          <textarea
            className="input resize-none h-24"
            placeholder="Action prise, contexte..."
            value={notes}
            onChange={e=>setNotes(e.target.value)}
          />
        </div>

        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="btn-secondary">Annuler</button>
          <button onClick={()=>onUpdate(report.id, status, notes)} className="btn-primary">
            <Check size={14}/> Enregistrer
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Moderation() {
  const [reports, setReports] = useState(MOCK_REPORTS)
  const [search,  setSearch]  = useState('')
  const [filter,  setFilter]  = useState('all')
  const [page,    setPage]    = useState(1)
  const [modal,   setModal]   = useState(null)
  const [toast,   setToast]   = useState(null)

  const showToast = msg => { setToast(msg); setTimeout(()=>setToast(null),3000) }

  const filtered = useMemo(() => {
    let list = reports
    if (search) list = list.filter(r =>
      r.reporter.username.toLowerCase().includes(search.toLowerCase()) ||
      r.reported.username.toLowerCase().includes(search.toLowerCase()) ||
      r.reason.toLowerCase().includes(search.toLowerCase())
    )
    if (filter !== 'all') list = list.filter(r => r.status === filter)
    return list
  }, [reports, search, filter])

  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const paged = filtered.slice((page-1)*PER_PAGE, page*PER_PAGE)

  const handleUpdate = (id, status, notes) => {
    setReports(rs => rs.map(r => r.id===id ? {...r, status, notes} : r))
    setModal(null)
    showToast('Signalement mis à jour.')
  }

  const quickAction = (id, status) => {
    setReports(rs => rs.map(r => r.id===id ? {...r, status} : r))
    showToast(`Signalement ${status==='resolved'?'résolu':'ignoré'}.`)
  }

  const counts = Object.fromEntries(
    Object.keys(STATUS_CONFIG).map(k => [k, reports.filter(r=>r.status===k).length])
  )

  return (
    <div className="flex flex-col gap-6 animate-fade-in">

      {toast && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-lg bg-green-600/90 text-white text-sm font-semibold shadow-xl animate-fade-in">
          {toast}
        </div>
      )}
      {modal && <DetailModal report={modal} onClose={()=>setModal(null)} onUpdate={handleUpdate}/>}

      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Modération</h1>
          <p className="page-subtitle">{counts.open} signalement{counts.open>1?'s':''} ouvert{counts.open>1?'s':''}</p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(STATUS_CONFIG).map(([k,v]) => {
          const Icon = v.icon
          return (
            <button key={k} onClick={()=>{setFilter(k);setPage(1)}}
              className={`stat-card text-left transition-all ${filter===k?'border-violet-500/60':''}`}>
              <Icon size={16} className={`mb-1 ${
                k==='open'?'text-red-400':k==='progress'?'text-yellow-400':k==='resolved'?'text-green-400':'text-gray-400'
              }`}/>
              <p className="stat-value">{counts[k]}</p>
              <p className="stat-label">{v.label}</p>
            </button>
          )
        })}
      </div>

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"/>
          <input className="input-icon" placeholder="Rechercher joueur ou motif..." value={search}
            onChange={e=>{setSearch(e.target.value);setPage(1)}}/>
        </div>
        <select className="select min-w-[160px]" value={filter}
          onChange={e=>{setFilter(e.target.value);setPage(1)}}>
          <option value="all">Tous les statuts</option>
          {Object.entries(STATUS_CONFIG).map(([k,v])=>(
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="card">
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>#</th><th>Signalant</th><th>Signalé</th><th>Motif</th><th>Statut</th><th>Date</th><th></th></tr></thead>
            <tbody>
              {paged.length===0 && <tr><td colSpan={7} className="text-center text-gray-500 py-10">Aucun signalement</td></tr>}
              {paged.map(r => {
                const cfg = STATUS_CONFIG[r.status]
                return (
                  <tr key={r.id}>
                    <td className="text-gray-500 font-mono text-xs">#{r.id}</td>
                    <td>
                      <Link to={`/accounts/${r.reporter.id}`} className="text-violet-400 hover:text-violet-300 text-sm">
                        {r.reporter.username}
                      </Link>
                    </td>
                    <td>
                      <Link to={`/accounts/${r.reported.id}`} className="text-red-400 hover:text-red-300 text-sm font-semibold">
                        {r.reported.username}
                      </Link>
                    </td>
                    <td className="text-gray-300 text-xs max-w-[200px] truncate">{r.reason}</td>
                    <td><span className={cfg.badge}>{cfg.label}</span></td>
                    <td className="text-gray-500 text-xs">{r.date}</td>
                    <td>
                      <div className="flex items-center gap-1">
                        <button onClick={()=>setModal(r)} className="btn-icon" title="Détail"><Eye size={14}/></button>
                        {r.status==='open' && <>
                          <button onClick={()=>quickAction(r.id,'resolved')} className="btn-icon text-green-400" title="Résoudre"><Check size={14}/></button>
                          <button onClick={()=>quickAction(r.id,'dismissed')} className="btn-icon text-gray-400" title="Ignorer"><X size={14}/></button>
                        </>}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {totalPages>1 && (
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
