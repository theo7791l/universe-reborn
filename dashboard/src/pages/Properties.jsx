import { useState, useEffect, useCallback } from 'react'
import {
  Home, Search, Eye, Check, X, Clock,
  ChevronLeft, ChevronRight, MapPin, Star, Trash2,
  RefreshCw, Filter
} from 'lucide-react'
import { Link } from 'react-router-dom'
import api from '../api/index.js'

const STATUS_CFG = {
  pending:  { badge: 'badge-yellow', label: 'En attente'  },
  approved: { badge: 'badge-green',  label: 'Approuvée'   },
  rejected: { badge: 'badge-red',    label: 'Rejetée'     },
  private:  { badge: 'badge-gray',   label: 'Privée'      },
}

const PER_PAGE = 12

function PropModal({ prop, onClose, onAction }) {
  const [status,  setStatus]  = useState(prop.status)
  const [reason,  setReason]  = useState('')
  const [loading, setLoading] = useState(false)

  const act = async (action) => {
    setLoading(true)
    await onAction(prop.id, action, reason)
    setLoading(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="card p-6 w-full max-w-lg flex flex-col gap-5 animate-fade-in">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={STATUS_CFG[prop.status]?.badge}>{STATUS_CFG[prop.status]?.label}</span>
              {prop.featured && <span className="badge-yellow">⭐ Featured</span>}
            </div>
            <h3 className="font-bold text-white">{prop.name}</h3>
            <p className="text-xs text-gray-500 mt-1">
              #{prop.id} · Propriétaire :
              <Link to={`/accounts/${prop.owner?.id}`} onClick={onClose} className="text-violet-400 ml-1">{prop.owner?.username}</Link>
            </p>
          </div>
          <button onClick={onClose} className="btn-icon"><X size={16}/></button>
        </div>

        <dl className="grid grid-cols-2 gap-3 text-sm">
          {[
            ['Zone',     prop.zone],
            ['Modèles',  prop.models],
            ['Note',     `${prop.rating ?? 0} / 5`],
            ['Mis à jour', prop.last_updated],
          ].map(([k, v]) => (
            <div key={k} className="bg-[#0d0d1a] rounded p-3">
              <dt className="text-xs text-gray-400 uppercase tracking-wider mb-1">{k}</dt>
              <dd className="text-white">{v ?? '—'}</dd>
            </div>
          ))}
        </dl>

        <div>
          <label className="text-xs text-gray-400 uppercase tracking-wider mb-1 block">Raison (optionnel)</label>
          <input
            type="text" placeholder="Motif du rejet..."
            value={reason}
            onChange={e => setReason(e.target.value)}
            className="input w-full"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => act('approve')}
            disabled={loading || prop.status === 'approved'}
            className="btn-success flex-1 flex justify-center items-center gap-2 disabled:opacity-40"
          >
            {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : <Check size={16}/>}
            Approuver
          </button>
          <button
            onClick={() => act('unapprove')}
            disabled={loading || prop.status === 'rejected'}
            className="btn-danger flex-1 flex justify-center items-center gap-2 disabled:opacity-40"
          >
            <X size={16}/> Rejeter
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Properties() {
  const [props_list, setProps]   = useState([])
  const [total,      setTotal]   = useState(0)
  const [page,       setPage]    = useState(1)
  const [search,     setSearch]  = useState('')
  const [status,     setStatus]  = useState('')
  const [loading,    setLoading] = useState(true)
  const [selected,   setSelected]= useState(null)

  const fetchProps = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page, per_page: PER_PAGE,
        ...(search && { search }),
        ...(status && { status }),
      })
      const r = await api.get(`/admin/properties?${params}`)
      setProps(r.data.properties || [])
      setTotal(r.data.total || 0)
    } catch {}
    finally { setLoading(false) }
  }, [page, search, status])

  useEffect(() => { fetchProps() }, [fetchProps])

  const handleAction = async (id, action) => {
    try {
      await api.post(`/admin/properties/${id}/${action}`)
      fetchProps()
    } catch {}
  }

  const totalPages = Math.ceil(total / PER_PAGE)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-title">Propriétés</h1>
          <p className="text-gray-400 text-sm mt-1">Modération des terrains joueurs (NexusDashboard compatible)</p>
        </div>
        <button onClick={fetchProps} disabled={loading} className="btn-ghost flex items-center gap-2">
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''}/> Actualiser
        </button>
      </div>

      {/* Filtres */}
      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
          <input
            type="text" placeholder="Nom de propriété ou propriétaire..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            className="input pl-9 w-full"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-gray-400"/>
          <select value={status} onChange={e => { setStatus(e.target.value); setPage(1) }} className="input">
            <option value="">Tous les statuts</option>
            {Object.entries(STATUS_CFG).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
        </div>
        <span className="text-xs text-gray-500 flex items-center">{total.toLocaleString('fr-FR')} propriété{total > 1 ? 's' : ''}</span>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <span className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin"/>
        </div>
      ) : props_list.length === 0 ? (
        <div className="card p-10 text-center text-gray-500">Aucune propriété trouvée.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {props_list.map(prop => (
            <div
              key={prop.id}
              onClick={() => setSelected(prop)}
              className="card p-4 cursor-pointer hover:border-violet-500/40 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={STATUS_CFG[prop.status]?.badge ?? 'badge-gray'}>
                    {STATUS_CFG[prop.status]?.label ?? prop.status}
                  </span>
                  {prop.featured && <span className="badge-yellow">⭐</span>}
                </div>
                <button
                  onClick={e => { e.stopPropagation(); handleAction(prop.id, prop.status === 'approved' ? 'unapprove' : 'approve') }}
                  className={`btn-icon ${prop.status === 'approved' ? 'text-red-400' : 'text-green-400'}`}
                >
                  {prop.status === 'approved' ? <X size={14}/> : <Check size={14}/>}
                </button>
              </div>
              <h3 className="font-bold text-white mb-1 truncate">{prop.name}</h3>
              <p className="text-xs text-gray-500 mb-3">
                #{prop.id} ·
                <Link
                  to={`/accounts/${prop.owner?.id}`}
                  onClick={e => e.stopPropagation()}
                  className="text-violet-400 ml-1 hover:text-violet-300"
                >{prop.owner?.username}</Link>
              </p>
              <div className="flex items-center gap-3 text-xs text-gray-400">
                <span className="flex items-center gap-1"><MapPin size={10}/>{prop.zone ?? '—'}</span>
                <span className="flex items-center gap-1"><Home size={10}/>{prop.models ?? 0} modèles</span>
                <span className="flex items-center gap-1"><Star size={10}/>{prop.rating ?? 0}/5</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-ghost flex items-center gap-1 disabled:opacity-30">
            <ChevronLeft size={16}/> Préc
          </button>
          <span className="text-sm text-gray-400">Page {page} / {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn-ghost flex items-center gap-1 disabled:opacity-30">
            Suiv <ChevronRight size={16}/>
          </button>
        </div>
      )}

      {selected && (
        <PropModal
          prop={selected}
          onClose={() => setSelected(null)}
          onAction={handleAction}
        />
      )}
    </div>
  )
}
