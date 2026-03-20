import { useState, useMemo, useRef, useEffect } from 'react'
import { ScrollText, Search, Filter, Download, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react'

const LOG_TYPES = ['INFO', 'WARN', 'ERROR', 'DEBUG', 'AUTH']
const LOG_COLORS = {
  INFO:  'text-blue-400',
  WARN:  'text-yellow-400',
  ERROR: 'text-red-400',
  DEBUG: 'text-gray-500',
  AUTH:  'text-violet-400',
}
const LOG_BADGE = {
  INFO:  'badge-blue',
  WARN:  'badge-yellow',
  ERROR: 'badge-red',
  DEBUG: 'badge-gray',
  AUTH:  'badge-violet',
}

const MOCK_LOGS = Array.from({ length: 120 }, (_, i) => {
  const types = ['INFO','INFO','INFO','WARN','ERROR','DEBUG','AUTH']
  const type = types[i%7]
  const msgs = {
    INFO:  ['Client connecté : CosmicBrick (ID 1800)', 'Zone chargée : Avant Gardens', 'Serveur prêt. 42 joueurs en ligne.', 'Sauvegarde automatique effectuée.'],
    WARN:  ['Tentative de reconnexion rapide (ID 1795)', 'Charge CPU élevée : 78%', 'Latence anormale détectée pour BrickSmith'],
    ERROR: ['Crash client : NinjaLord (ID 1790)', 'Timeout de zone : Crux Prime', 'Erreur SQL : duplicate entry'],
    DEBUG: ['Packet reçu : 0x0053 (client 1800)', 'Tick serveur : 20ms', 'Cache flush effectué'],
    AUTH:  ['Connexion réussie : VoidWalker', 'Tentative échouée : user=admin', 'Déconnexion : StarForge'],
  }
  const msgArr = msgs[type]
  return {
    id: i,
    type,
    message: msgArr[i % msgArr.length],
    time: new Date(Date.now() - i * 30000).toLocaleTimeString('fr-FR', {hour:'2-digit',minute:'2-digit',second:'2-digit'}),
    date: new Date(Date.now() - i * 30000).toLocaleDateString('fr-FR'),
  }
})

const PER_PAGE = 30

export default function Logs() {
  const [logs,    ]        = useState(MOCK_LOGS)
  const [search,  setSearch]  = useState('')
  const [typeFilter,setTypeF]= useState('all')
  const [autoScroll,setAuto] = useState(true)
  const [page,    setPage]    = useState(1)
  const bottomRef = useRef(null)

  useEffect(() => {
    if (autoScroll) bottomRef.current?.scrollIntoView()
  }, [logs, autoScroll])

  const filtered = useMemo(() => {
    let list = logs
    if (search)           list = list.filter(l => l.message.toLowerCase().includes(search.toLowerCase()))
    if (typeFilter!=='all') list = list.filter(l => l.type === typeFilter)
    return list
  }, [logs, search, typeFilter])

  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const paged = filtered.slice((page-1)*PER_PAGE, page*PER_PAGE)

  const exportLogs = () => {
    const txt = filtered.map(l => `[${l.date} ${l.time}] [${l.type}] ${l.message}`).join('\n')
    const blob = new Blob([txt], {type:'text/plain'})
    const a = document.createElement('a'); a.href=URL.createObjectURL(blob)
    a.download=`logs_${new Date().toISOString().slice(0,10)}.txt`; a.click()
  }

  const counts = Object.fromEntries(LOG_TYPES.map(t=>[t, logs.filter(l=>l.type===t).length]))

  return (
    <div className="flex flex-col gap-6 animate-fade-in">

      <div className="page-header">
        <div>
          <h1 className="page-title">Logs Serveur</h1>
          <p className="page-subtitle">{logs.length} entrées · {counts.ERROR} erreur{counts.ERROR>1?'s':''}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportLogs} className="btn-secondary"><Download size={14}/> Exporter</button>
          <button onClick={()=>setPage(1)} className="btn-secondary"><RefreshCw size={14}/> Actualiser</button>
        </div>
      </div>

      {/* Stat badges */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={()=>{setTypeF('all');setPage(1)}}
          className={`px-3 py-1.5 rounded text-xs font-bold transition-colors ${
            typeFilter==='all' ? 'bg-violet-600 text-white' : 'bg-[#1e1e3a] text-gray-400 hover:text-white'
          }`}>Tous ({logs.length})</button>
        {LOG_TYPES.map(t=>(
          <button key={t}
            onClick={()=>{setTypeF(t);setPage(1)}}
            className={`px-3 py-1.5 rounded text-xs font-bold transition-colors ${
              typeFilter===t ? 'bg-violet-600 text-white' : 'bg-[#1e1e3a] text-gray-400 hover:text-white'
            }`}>
            {t} ({counts[t]})
          </button>
        ))}
      </div>

      {/* Recherche */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"/>
        <input className="input-icon" placeholder="Rechercher dans les logs..." value={search}
          onChange={e=>{setSearch(e.target.value);setPage(1)}}/>
      </div>

      {/* Log viewer */}
      <div className="card bg-[#0a0a14] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table font-mono text-xs">
            <thead>
              <tr>
                <th className="w-28">Date</th>
                <th className="w-20">Heure</th>
                <th className="w-20">Type</th>
                <th>Message</th>
              </tr>
            </thead>
            <tbody>
              {paged.length===0 && <tr><td colSpan={4} className="text-center text-gray-500 py-10">Aucune entrée</td></tr>}
              {paged.map(l=>(
                <tr key={l.id} className="hover:bg-[#0f0f1e]">
                  <td className="text-gray-600">{l.date}</td>
                  <td className="text-gray-600">{l.time}</td>
                  <td><span className={LOG_BADGE[l.type]}>{l.type}</span></td>
                  <td className={`${LOG_COLORS[l.type]} font-mono`}>{l.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div ref={bottomRef}/>
        </div>
        {totalPages>1&&(
          <div className="flex items-center justify-between px-4 py-3 border-t border-[#1e1e3a]">
            <p className="text-xs text-gray-500">{filtered.length} entrées · page {page}/{totalPages}</p>
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
