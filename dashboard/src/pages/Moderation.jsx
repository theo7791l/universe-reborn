import { useState, useEffect, useCallback } from 'react'
import {
  Shield, Search, Check, X, RefreshCw,
  ChevronLeft, ChevronRight, Trash2, AlertTriangle, Filter
} from 'lucide-react'
import { Link } from 'react-router-dom'
import api from '../api/index.js'

const TABS = [
  { key: 'char-names', label: 'Noms de personnages' },
  { key: 'pet-names',  label: 'Noms de pets' },
  { key: 'orphans',   label: 'Nettoyage orphelins' },
]

const PER_PAGE = 20

// ---- Onglet Noms personnages ----
function CharNames() {
  const [items,   setItems]   = useState([])
  const [total,   setTotal]   = useState(0)
  const [page,    setPage]    = useState(1)
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    setLoading(true)
    try {
      const r = await api.get(`/admin/moderation/char-names?page=${page}&per_page=${PER_PAGE}`)
      setItems(r.data.names || [])
      setTotal(r.data.total || 0)
    } catch {}
    finally { setLoading(false) }
  }, [page])

  useEffect(() => { fetch() }, [fetch])

  const act = async (id, action) => {
    await api.post(`/admin/moderation/char-names/${id}/${action}`)
    fetch()
  }

  const totalPages = Math.ceil(total / PER_PAGE)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-400">{total} nom{total > 1 ? 's' : ''} en attente</p>
        <button onClick={fetch} disabled={loading} className="btn-ghost flex items-center gap-1">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''}/> Actualiser
        </button>
      </div>
      {loading ? (
        <div className="flex justify-center py-8"><span className="w-6 h-6 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin"/></div>
      ) : items.length === 0 ? (
        <p className="text-gray-500 text-sm text-center py-8">Aucun nom en attente d'approbation.</p>
      ) : (
        <div className="space-y-2">
          {items.map(item => (
            <div key={item.id} className="card p-4 flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate">{item.pending_name || item.name}</p>
                <p className="text-xs text-gray-500">
                  Personnage #{item.id}
                  {item.account_username && <span className="ml-2 text-violet-400">{item.account_username}</span>}
                  {item.needs_rename && <span className="badge-yellow ml-2">Renommage forcé</span>}
                </p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => act(item.id, 'approve')} className="btn-icon text-green-400"><Check size={16}/></button>
                <button onClick={() => act(item.id, 'reject')}  className="btn-icon text-red-400"><X size={16}/></button>
              </div>
            </div>
          ))}
        </div>
      )}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-ghost flex items-center gap-1 disabled:opacity-30"><ChevronLeft size={16}/> Préc</button>
          <span className="text-sm text-gray-400">Page {page} / {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn-ghost flex items-center gap-1 disabled:opacity-30">Suiv <ChevronRight size={16}/></button>
        </div>
      )}
    </div>
  )
}

// ---- Onglet Noms pets ----
function PetNames() {
  const [items,   setItems]   = useState([])
  const [total,   setTotal]   = useState(0)
  const [page,    setPage]    = useState(1)
  const [filter,  setFilter]  = useState('pending') // pending | approved | rejected
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    setLoading(true)
    try {
      const r = await api.get(`/admin/moderation/pet-names?page=${page}&per_page=${PER_PAGE}&status=${filter}`)
      setItems(r.data.names || [])
      setTotal(r.data.total || 0)
    } catch {}
    finally { setLoading(false) }
  }, [page, filter])

  useEffect(() => { fetch() }, [fetch])

  const act = async (id, action) => {
    await api.post(`/admin/moderation/pet-names/${id}/${action}`)
    fetch()
  }

  const totalPages = Math.ceil(total / PER_PAGE)
  const FILTER_OPTS = [['pending', 'En attente'], ['approved', 'Approuvés'], ['rejected', 'Rejetés']]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-gray-400"/>
          <select value={filter} onChange={e => { setFilter(e.target.value); setPage(1) }} className="input text-sm">
            {FILTER_OPTS.map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <span className="text-xs text-gray-500">{total} nom{total > 1 ? 's' : ''}</span>
        </div>
        <button onClick={fetch} disabled={loading} className="btn-ghost flex items-center gap-1">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''}/> Actualiser
        </button>
      </div>
      {loading ? (
        <div className="flex justify-center py-8"><span className="w-6 h-6 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin"/></div>
      ) : items.length === 0 ? (
        <p className="text-gray-500 text-sm text-center py-8">Aucun nom de pet dans cette catégorie.</p>
      ) : (
        <div className="space-y-2">
          {items.map(item => (
            <div key={item.id} className="card p-4 flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium">{item.name}</p>
                <p className="text-xs text-gray-500">Pet #{item.id}</p>
              </div>
              {filter === 'pending' && (
                <div className="flex gap-2">
                  <button onClick={() => act(item.id, 'approve')} className="btn-icon text-green-400"><Check size={16}/></button>
                  <button onClick={() => act(item.id, 'reject')}  className="btn-icon text-red-400"><X size={16}/></button>
                </div>
              )}
              {filter === 'approved' && (
                <button onClick={() => act(item.id, 'reject')} className="btn-icon text-red-400" title="Rejeter"><X size={16}/></button>
              )}
              {filter === 'rejected' && (
                <button onClick={() => act(item.id, 'approve')} className="btn-icon text-green-400" title="Réapprouver"><Check size={16}/></button>
              )}
            </div>
          ))}
        </div>
      )}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-ghost flex items-center gap-1 disabled:opacity-30"><ChevronLeft size={16}/> Préc</button>
          <span className="text-sm text-gray-400">Page {page} / {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn-ghost flex items-center gap-1 disabled:opacity-30">Suiv <ChevronRight size={16}/></button>
        </div>
      )}
    </div>
  )
}

// ---- Onglet Nettoyage orphelins ----
function Orphans() {
  const [result,  setResult]  = useState(null)
  const [loading, setLoading] = useState(false)
  const [confirm, setConfirm] = useState(false)

  const runCleanup = async () => {
    setLoading(true)
    try {
      const r = await api.post('/admin/moderation/cleanup-orphans')
      setResult(r.data)
      setConfirm(false)
    } catch (e) {
      setResult({ error: e.response?.data?.error || 'Erreur inconnue' })
    } finally { setLoading(false) }
  }

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
          <Trash2 size={16} className="text-yellow-400"/> Nettoyage des noms orphelins
        </h3>
        <p className="text-sm text-gray-400 mb-4">
          Supprime les entrées <code className="text-violet-300">pet_names</code> et <code className="text-violet-300">char_names</code> liées
          à des personnages ou pets qui n'existent plus en base DarkflameServer.
          Cette opération est <strong className="text-yellow-400">irréversible</strong>.
        </p>

        {!confirm ? (
          <button
            onClick={() => setConfirm(true)}
            className="btn-danger flex items-center gap-2"
          >
            <AlertTriangle size={16}/> Lancer le nettoyage
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <p className="text-sm text-yellow-400">Confirmer ? Cette action ne peut pas être annulée.</p>
            <button onClick={runCleanup} disabled={loading} className="btn-danger flex items-center gap-2">
              {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : <Check size={16}/>}
              Confirmer
            </button>
            <button onClick={() => setConfirm(false)} className="btn-ghost">Annuler</button>
          </div>
        )}
      </div>

      {result && (
        <div className={`card p-6 border ${
          result.error ? 'border-red-500/30 bg-red-500/5' : 'border-green-500/30 bg-green-500/5'
        }`}>
          {result.error ? (
            <p className="text-red-400 text-sm flex items-center gap-2"><AlertTriangle size={14}/> {result.error}</p>
          ) : (
            <div className="space-y-2">
              <p className="text-green-400 font-semibold">Nettoyage terminé avec succès</p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-[#0d0d1a] rounded p-3">
                  <p className="text-xs text-gray-400 uppercase">Noms de pets supprimés</p>
                  <p className="text-white font-bold text-lg">{result.deleted_pet_names ?? 0}</p>
                </div>
                <div className="bg-[#0d0d1a] rounded p-3">
                  <p className="text-xs text-gray-400 uppercase">Noms de persos supprimés</p>
                  <p className="text-white font-bold text-lg">{result.deleted_char_names ?? 0}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function Moderation() {
  const [tab, setTab] = useState('char-names')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-title">Modération</h1>
        <p className="text-gray-400 text-sm mt-1">Gestion des noms et nettoyage des données orphelines</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[#1e1e3a]">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === t.key
                ? 'border-violet-500 text-violet-400'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            {t.key === 'orphans' && <Trash2 size={14}/>}
            {t.label}
          </button>
        ))}
      </div>

      <div className="pt-2">
        {tab === 'char-names' && <CharNames/>}
        {tab === 'pet-names'  && <PetNames/>}
        {tab === 'orphans'    && <Orphans/>}
      </div>
    </div>
  )
}
