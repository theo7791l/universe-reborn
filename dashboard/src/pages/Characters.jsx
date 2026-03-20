import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Search, Filter, Eye, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'

const FACTIONS = ['Paradox', 'Assembly', 'Sentinel', 'Venture League']
const FACTION_BADGE = {
  'Paradox':       'badge-violet',
  'Assembly':      'badge-blue',
  'Sentinel':      'badge-green',
  'Venture League':'badge-orange',
}

const MOCK_CHARS = Array.from({ length: 58 }, (_, i) => ({
  id: 300 + i,
  name: [
    'Starfall','Frostbite','Crixus','Galactus','Ironclad',
    'NovaBlade','SteelFang','AuroraX','PhantomKai','LightBolt',
    'Vortex','CryptoKnight','BlazeFist','ShadowMind','NeonEdge',
  ][i % 15] + (i > 14 ? `_${i}` : ''),
  account_id:   1800 - Math.floor(i / 2),
  account_name: ['CosmicBrick','StarForge99','BrickSmith','VoidWalker','NinjaLord'][i % 5],
  faction:   FACTIONS[i % 4],
  level:     Math.max(1, 45 - i),
  coins:     Math.floor(Math.random() * 50000),
  uscore:    Math.floor(Math.random() * 500000),
  world:     ['Avant Gardens','Nimbus Station','Nexus Tower','Crux Prime','Gnarled Forest'][i % 5],
  last_seen: new Date(Date.now() - i * 3600000 * 5).toLocaleDateString('fr-FR'),
}))

const PER_PAGE = 15

export default function Characters() {
  const [search,  setSearch]  = useState('')
  const [faction, setFaction] = useState('all')
  const [page,    setPage]    = useState(1)

  const filtered = useMemo(() => {
    let list = MOCK_CHARS
    if (search)         list = list.filter(c =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.account_name.toLowerCase().includes(search.toLowerCase()) ||
      String(c.id).includes(search)
    )
    if (faction !== 'all') list = list.filter(c => c.faction === faction)
    return list
  }, [search, faction])

  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  return (
    <div className="flex flex-col gap-6 animate-fade-in">

      <div className="page-header">
        <div>
          <h1 className="page-title">Personnages</h1>
          <p className="page-subtitle">{MOCK_CHARS.length} personnages enregistrés</p>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input className="input-icon" placeholder="Rechercher par nom, compte, ID..." value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }} />
        </div>
        <select className="select min-w-[180px]" value={faction}
          onChange={e => { setFaction(e.target.value); setPage(1) }}>
          <option value="all">Toutes les factions</option>
          {FACTIONS.map(f => <option key={f} value={f}>{f}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="card">
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>#ID</th>
                <th>Nom</th>
                <th>Compte</th>
                <th>Faction</th>
                <th>Niveau</th>
                <th>Coins</th>
                <th>U-Score</th>
                <th>Dernier monde</th>
                <th>Vu</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 && (
                <tr><td colSpan={10} className="text-center text-gray-500 py-10">Aucun personnage trouvé</td></tr>
              )}
              {paged.map(c => (
                <tr key={c.id}>
                  <td className="text-gray-500 font-mono text-xs">#{c.id}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded bg-[#1e1e3a] flex items-center justify-center text-violet-400 text-xs font-bold">
                        {c.name[0]}
                      </div>
                      <span className="text-white font-medium text-sm">{c.name}</span>
                    </div>
                  </td>
                  <td>
                    <Link to={`/accounts/${c.account_id}`} className="text-violet-400 hover:text-violet-300 text-xs transition-colors">
                      {c.account_name}
                    </Link>
                  </td>
                  <td><span className={FACTION_BADGE[c.faction]}>{c.faction}</span></td>
                  <td className="text-white font-semibold">{c.level}</td>
                  <td className="text-yellow-400 font-semibold">{c.coins.toLocaleString()}</td>
                  <td className="text-violet-300 text-xs">{(c.uscore/1000).toFixed(0)}k</td>
                  <td className="text-gray-400 text-xs">{c.world}</td>
                  <td className="text-gray-500 text-xs">{c.last_seen}</td>
                  <td>
                    <div className="flex items-center gap-1">
                      <Link to={`/characters/${c.id}`} className="btn-icon" title="Détail"><Eye size={14} /></Link>
                      <button className="btn-icon text-red-400" title="Supprimer"><Trash2 size={14} /></button>
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
              <button className="btn-icon" disabled={page===1} onClick={() => setPage(p=>p-1)}><ChevronLeft size={14}/></button>
              {Array.from({length: Math.min(totalPages,5)},(_,i)=>i+1).map(p=>(
                <button key={p} onClick={()=>setPage(p)}
                  className={`w-7 h-7 rounded text-xs font-bold transition-colors ${p===page?'bg-violet-600 text-white':'text-gray-400 hover:bg-[#1e1e3a]'}`}>{p}</button>
              ))}
              <button className="btn-icon" disabled={page===totalPages} onClick={() => setPage(p=>p+1)}><ChevronRight size={14}/></button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
