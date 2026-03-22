import { useState, useEffect, useCallback } from 'react'
import { ScrollText, Search, Filter, RefreshCw, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'
import api from '../api/index.js'

const ACTION_COLORS = {
  ban:              'badge-red',
  unban:            'badge-green',
  lock:             'badge-yellow',
  unlock:           'badge-green',
  mute:             'badge-yellow',
  unmute:           'badge-green',
  set_gm:           'badge-blue',
  delete_account:   'badge-red',
  rescue:           'badge-blue',
  set_restrictions: 'badge-yellow',
  send_mail:        'badge-blue',
  approve_name:     'badge-green',
  reject_name:      'badge-red',
  approve_pet:      'badge-green',
  reject_pet:       'badge-red',
  approve_property: 'badge-green',
  unapprove_property:'badge-yellow',
  cleanup_orphans:  'badge-gray',
  generate_keys:    'badge-blue',
}

const ACTION_LABELS = {
  ban:               'Ban',
  unban:             'Unban',
  lock:              'Lock',
  unlock:            'Unlock',
  mute:              'Mute',
  unmute:            'Unmute',
  set_gm:            'Set GM Level',
  delete_account:    'Suppression compte',
  rescue:            'Rescue',
  set_restrictions:  'Restrictions',
  send_mail:         'Envoi mail',
  approve_name:      'Nom approuvé',
  reject_name:       'Nom rejeté',
  approve_pet:       'Pet approuvé',
  reject_pet:        'Pet rejeté',
  approve_property:  'Propriété approuvée',
  unapprove_property:'Propriété retirée',
  cleanup_orphans:   'Nettoyage orphelins',
  generate_keys:     'Génération clés',
}

const PER_PAGE = 50

export default function AuditLog() {
  const [logs,    setLogs]    = useState([])
  const [total,   setTotal]   = useState(0)
  const [page,    setPage]    = useState(1)
  const [search,  setSearch]  = useState('')
  const [action,  setAction]  = useState('')
  const [loading, setLoading] = useState(true)

  const fetchLogs = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page,
        per_page: PER_PAGE,
        ...(search && { search }),
        ...(action && { action }),
      })
      const r = await api.get(`/admin/audit-log?${params}`)
      setLogs(r.data.logs || [])
      setTotal(r.data.total || 0)
    } catch {}
    finally { setLoading(false) }
  }, [page, search, action])

  useEffect(() => { fetchLogs() }, [fetchLogs])

  const totalPages = Math.ceil(total / PER_PAGE)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-title">Journal d'audit</h1>
          <p className="text-gray-400 text-sm mt-1">Toutes les actions de modération et d'administration</p>
        </div>
        <button onClick={fetchLogs} disabled={loading} className="btn-ghost flex items-center gap-2">
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''}/> Actualiser
        </button>
      </div>

      {/* Filtres */}
      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
          <input
            type="text" placeholder="Rechercher par admin, cible ou détails..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            className="input pl-9 w-full"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-gray-400"/>
          <select
            value={action}
            onChange={e => { setAction(e.target.value); setPage(1) }}
            className="input"
          >
            <option value="">Toutes les actions</option>
            {Object.entries(ACTION_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>
        <div className="text-xs text-gray-500 flex items-center">
          {total.toLocaleString('fr-FR')} entrée{total > 1 ? 's' : ''}
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12">
            <span className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin"/>
          </div>
        ) : logs.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-10">Aucune entrée d'audit.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1e1e3a]">
                  {['Date', 'Admin', 'Action', 'Cible', 'Détails'].map(h => (
                    <th key={h} className="text-left text-xs text-gray-400 uppercase tracking-wider py-3 px-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log.id} className="border-b border-[#1e1e3a]/50 hover:bg-[#1a1a2e]/40">
                    <td className="py-2 px-4 text-gray-500 whitespace-nowrap text-xs">{log.created_at}</td>
                    <td className="py-2 px-4">
                      {log.admin_id ? (
                        <Link to={`/accounts/${log.admin_id}`} className="text-violet-400 hover:text-violet-300">
                          {log.admin_username ?? `#${log.admin_id}`}
                        </Link>
                      ) : <span className="text-gray-600">système</span>}
                    </td>
                    <td className="py-2 px-4">
                      <span className={ACTION_COLORS[log.action] ?? 'badge-gray'}>
                        {ACTION_LABELS[log.action] ?? log.action}
                      </span>
                    </td>
                    <td className="py-2 px-4">
                      {log.target_id ? (
                        <Link
                          to={log.target_type === 'account' ? `/accounts/${log.target_id}` : `/characters/${log.target_id}`}
                          className="text-blue-400 hover:text-blue-300 flex items-center gap-1"
                        >
                          {log.target_username ?? `#${log.target_id}`}
                          <ExternalLink size={10}/>
                        </Link>
                      ) : <span className="text-gray-600">—</span>}
                    </td>
                    <td className="py-2 px-4 text-gray-400 text-xs max-w-xs truncate" title={log.details}>
                      {log.details || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-[#1e1e3a]">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="btn-ghost flex items-center gap-1 disabled:opacity-30"
            >
              <ChevronLeft size={16}/> Préc
            </button>
            <span className="text-sm text-gray-400">Page {page} / {totalPages}</span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="btn-ghost flex items-center gap-1 disabled:opacity-30"
            >
              Suiv <ChevronRight size={16}/>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
