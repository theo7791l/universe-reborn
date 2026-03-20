import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Search, Filter, UserPlus, ChevronLeft, ChevronRight,
  ShieldBan, ShieldCheck, Eye, MoreVertical
} from 'lucide-react'

// Mock data — remplacer par appel API GET /api/accounts
const MOCK_ACCOUNTS = Array.from({ length: 42 }, (_, i) => ({
  id: 1800 - i,
  username: [
    'CosmicBrick', 'StarForge99', 'MaelstromKing', 'BrickSmith', 'VoidWalker',
    'NinjaLord', 'GalacticPirate', 'BoltRunner', 'PhantomKai', 'LightBolt',
    'AdminReborn', 'ModChief', 'SteelFang', 'AuroraX', 'NovaBlade',
  ][i % 15] + (i > 14 ? `_${i}` : ''),
  email: `player${1800 - i}@mail.com`,
  gm_level: i === 10 ? 9 : i === 11 ? 4 : 0,
  banned: [3, 7, 22, 35].includes(i),
  locked: [15, 28].includes(i),
  email_verified: i % 3 !== 0,
  created_at: new Date(Date.now() - i * 86400000 * 3).toLocaleDateString('fr-FR'),
  last_login:  new Date(Date.now() - i * 3600000  * 7).toLocaleDateString('fr-FR'),
  characters:  Math.floor(Math.random() * 4),
  play_key:    `PK-${String(1000 + i).padStart(4,'0')}`,
}))

const PER_PAGE = 15

export default function Accounts() {
  const [search,  setSearch]  = useState('')
  const [filter,  setFilter]  = useState('all') // all | banned | gm | unverified
  const [page,    setPage]    = useState(1)

  const filtered = useMemo(() => {
    let list = MOCK_ACCOUNTS
    if (search) list = list.filter(a =>
      a.username.toLowerCase().includes(search.toLowerCase()) ||
      a.email.toLowerCase().includes(search.toLowerCase()) ||
      String(a.id).includes(search)
    )
    if (filter === 'banned')     list = list.filter(a => a.banned)
    if (filter === 'gm')         list = list.filter(a => a.gm_level > 0)
    if (filter === 'unverified') list = list.filter(a => !a.email_verified)
    return list
  }, [search, filter])

  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  const gmBadge = lvl => {
    if (lvl >= 9) return <span className="badge-violet">Admin</span>
    if (lvl >= 4) return <span className="badge-blue">Mod</span>
    return <span className="text-gray-600">—</span>
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in">

      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Comptes</h1>
          <p className="page-subtitle">{MOCK_ACCOUNTS.length} comptes enregistrés</p>
        </div>
        <button className="btn-primary">
          <UserPlus size={15} /> Nouveau compte
        </button>
      </div>

      {/* Filtres + recherche */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            className="input-icon"
            placeholder="Rechercher par pseudo, email, ID..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
          />
        </div>
        <div className="relative">
          <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <select
            className="select pl-9 pr-8 min-w-[160px]"
            value={filter}
            onChange={e => { setFilter(e.target.value); setPage(1) }}
          >
            <option value="all">Tous les comptes</option>
            <option value="banned">Bannis</option>
            <option value="gm">Staff (GM)</option>
            <option value="unverified">Email non vérifié</option>
          </select>
        </div>
      </div>

      {/* Tableau */}
      <div className="card">
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>#ID</th>
                <th>Pseudo</th>
                <th>Email</th>
                <th>Rôle</th>
                <th>Persos</th>
                <th>Statut</th>
                <th>Création</th>
                <th>Dernière connexion</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 && (
                <tr><td colSpan={9} className="text-center text-gray-500 py-10">Aucun compte trouvé</td></tr>
              )}
              {paged.map(a => (
                <tr key={a.id}>
                  <td className="text-gray-500 font-mono text-xs">#{a.id}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-violet-600/20 flex items-center justify-center text-violet-400 text-xs font-bold shrink-0">
                        {a.username[0].toUpperCase()}
                      </div>
                      <span className="text-white font-medium text-sm">{a.username}</span>
                    </div>
                  </td>
                  <td className="text-gray-400 text-xs">
                    {a.email}
                    {!a.email_verified && <span className="badge-yellow ml-1">Non vérifié</span>}
                  </td>
                  <td>{gmBadge(a.gm_level)}</td>
                  <td className="text-center">
                    <span className="text-white font-semibold">{a.characters}</span>
                  </td>
                  <td>
                    {a.banned  && <span className="badge-red">Banni</span>}
                    {a.locked  && !a.banned && <span className="badge-yellow">Verrouillé</span>}
                    {!a.banned && !a.locked && <span className="badge-green">Actif</span>}
                  </td>
                  <td className="text-gray-500 text-xs">{a.created_at}</td>
                  <td className="text-gray-500 text-xs">{a.last_login}</td>
                  <td>
                    <div className="flex items-center gap-1">
                      <Link to={`/accounts/${a.id}`} className="btn-icon" title="Voir">
                        <Eye size={14} />
                      </Link>
                      {a.banned
                        ? <button className="btn-icon text-green-400" title="Débannir"><ShieldCheck size={14} /></button>
                        : <button className="btn-icon text-red-400"   title="Bannir"><ShieldBan size={14} /></button>
                      }
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-[#1e1e3a]">
            <p className="text-xs text-gray-500">
              {filtered.length} résultat{filtered.length > 1 ? 's' : ''} · page {page}/{totalPages}
            </p>
            <div className="flex items-center gap-1">
              <button
                className="btn-icon" disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
              ><ChevronLeft size={14} /></button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-7 h-7 rounded text-xs font-bold transition-colors ${
                    p === page ? 'bg-violet-600 text-white' : 'text-gray-400 hover:bg-[#1e1e3a]'
                  }`}
                >{p}</button>
              ))}
              <button
                className="btn-icon" disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
              ><ChevronRight size={14} /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
