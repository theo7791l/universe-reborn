import { useState, useEffect } from 'react'
import { BarChart2, Coins, TrendingUp, Package, RefreshCw, Calendar } from 'lucide-react'
import api from '../api/index.js'

const TABS = [
  { key: 'currency', label: 'Monnaie', icon: Coins },
  { key: 'uscore',   label: 'U-Score', icon: TrendingUp },
  { key: 'items',    label: 'Objets',  icon: Package },
]

function StatCard({ label, value, sub, color = 'violet' }) {
  const colors = {
    violet: 'border-violet-500/20 bg-violet-500/5',
    green:  'border-green-500/20 bg-green-500/5',
    blue:   'border-blue-500/20 bg-blue-500/5',
    yellow: 'border-yellow-500/20 bg-yellow-500/5',
  }
  return (
    <div className={`card p-5 border ${colors[color]}`}>
      <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-2xl font-bold text-white">{value ?? '—'}</p>
      {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
    </div>
  )
}

function TableReport({ data, columns }) {
  if (!data || data.length === 0)
    return <p className="text-gray-500 text-sm py-6 text-center">Aucune donnée disponible.</p>
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#1e1e3a]">
            {columns.map(c => (
              <th key={c.key} className="text-left text-xs text-gray-400 uppercase tracking-wider py-2 px-3">{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} className="border-b border-[#1e1e3a]/50 hover:bg-[#1a1a2e]/40">
              {columns.map(c => (
                <td key={c.key} className="py-2 px-3 text-gray-300">
                  {c.render ? c.render(row[c.key], row) : row[c.key] ?? '—'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function Reports() {
  const [tab,     setTab]     = useState('currency')
  const [data,    setData]    = useState({})
  const [loading, setLoading] = useState(false)
  const [lastRun, setLastRun] = useState(null)

  const fetchReport = async (type) => {
    setLoading(true)
    try {
      const r = await api.get(`/admin/reports/${type}`)
      setData(prev => ({ ...prev, [type]: r.data }))
      setLastRun(new Date().toLocaleTimeString('fr-FR'))
    } catch {}
    finally { setLoading(false) }
  }

  useEffect(() => { fetchReport(tab) }, [tab])

  const currentData = data[tab] || {}

  const COLUMNS = {
    currency: [
      { key: 'rank',     label: '#' },
      { key: 'username', label: 'Compte' },
      { key: 'char_name',label: 'Personnage' },
      { key: 'coins',    label: 'Coins', render: v => v?.toLocaleString('fr-FR') },
    ],
    uscore: [
      { key: 'rank',      label: '#' },
      { key: 'username',  label: 'Compte' },
      { key: 'char_name', label: 'Personnage' },
      { key: 'uscore',    label: 'U-Score', render: v => v?.toLocaleString('fr-FR') },
    ],
    items: [
      { key: 'lot',        label: 'LOT' },
      { key: 'item_name',  label: 'Objet' },
      { key: 'total',      label: 'Total en jeu', render: v => v?.toLocaleString('fr-FR') },
      { key: 'holders',    label: 'Joueurs' },
    ],
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-title">Rapports économiques</h1>
          <p className="text-gray-400 text-sm mt-1">Analyse de la monnaie, U-Score et objets en circulation</p>
        </div>
        <button
          onClick={() => fetchReport(tab)}
          disabled={loading}
          className="btn-ghost flex items-center gap-2"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''}/>
          Actualiser
        </button>
      </div>

      {lastRun && (
        <p className="text-xs text-gray-600 flex items-center gap-1">
          <Calendar size={12}/> Dernière mise à jour : {lastRun}
        </p>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[#1e1e3a] pb-0">
        {TABS.map(t => {
          const Icon = t.icon
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                tab === t.key
                  ? 'border-violet-500 text-violet-400'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <Icon size={14}/> {t.label}
            </button>
          )
        })}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <span className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin"/>
        </div>
      ) : (
        <>
          {/* Stats cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {tab === 'currency' && (
              <>
                <StatCard label="Total coins" value={currentData.total_coins?.toLocaleString('fr-FR')} color="yellow"/>
                <StatCard label="Moyenne / joueur" value={currentData.avg_coins?.toLocaleString('fr-FR')} color="yellow"/>
                <StatCard label="Max" value={currentData.max_coins?.toLocaleString('fr-FR')} sub={currentData.max_holder} color="yellow"/>
                <StatCard label="Joueurs avec coins" value={currentData.players_with_coins?.toLocaleString('fr-FR')} color="yellow"/>
              </>
            )}
            {tab === 'uscore' && (
              <>
                <StatCard label="Total U-Score" value={currentData.total_uscore?.toLocaleString('fr-FR')} color="blue"/>
                <StatCard label="Moyenne" value={currentData.avg_uscore?.toLocaleString('fr-FR')} color="blue"/>
                <StatCard label="Record" value={currentData.max_uscore?.toLocaleString('fr-FR')} sub={currentData.max_holder} color="blue"/>
                <StatCard label="Joueurs classés" value={currentData.ranked_players} color="blue"/>
              </>
            )}
            {tab === 'items' && (
              <>
                <StatCard label="Types d'objets" value={currentData.unique_lots} color="green"/>
                <StatCard label="Objets en circulation" value={currentData.total_items?.toLocaleString('fr-FR')} color="green"/>
                <StatCard label="Objet le + rare" value={currentData.rarest_item} color="green"/>
                <StatCard label="Objet le + commun" value={currentData.most_common_item} color="green"/>
              </>
            )}
          </div>

          {/* Table */}
          <div className="card p-6">
            <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
              <BarChart2 size={16} className="text-violet-400"/>
              {tab === 'currency' && 'Top 50 — Coins'}
              {tab === 'uscore'   && 'Top 50 — U-Score'}
              {tab === 'items'    && 'Objets les plus répandus'}
            </h2>
            <TableReport
              data={currentData.top || currentData.items || []}
              columns={COLUMNS[tab]}
            />
          </div>
        </>
      )}
    </div>
  )
}
