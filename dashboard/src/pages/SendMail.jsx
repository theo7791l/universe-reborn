import { useState, useEffect } from 'react'
import { Send, User, Package, AlertCircle, CheckCircle, Search, ChevronDown } from 'lucide-react'
import api from '../api/index.js'

const LEGO_ITEMS = [
  { lot: 0,    name: 'Aucune pièce jointe' },
  { lot: 1727, name: 'Thinking Hat' },
  { lot: 3050, name: 'Sword of Light' },
  { lot: 3260, name: 'Dragon Shield' },
  { lot: 4994, name: 'Space Helmet' },
  { lot: 6299, name: 'Rocket Pack' },
  { lot: 7777, name: 'VIP Badge' },
  { lot: 8000, name: 'Gold Brick x1' },
  { lot: 8001, name: 'Gold Brick x5' },
  { lot: 8002, name: 'Gold Brick x10' },
  { lot: 9999, name: 'Admin Crown' },
]

export default function SendMail() {
  const [characters, setCharacters] = useState([])
  const [filtered,   setFiltered]   = useState([])
  const [search,     setSearch]     = useState('')
  const [recipient,  setRecipient]  = useState(null)
  const [subject,    setSubject]    = useState('')
  const [body,       setBody]       = useState('')
  const [attachLot,  setAttachLot]  = useState(0)
  const [attachAmt,  setAttachAmt]  = useState(1)
  const [coins,      setCoins]      = useState(0)
  const [loading,    setLoading]    = useState(false)
  const [loadChars,  setLoadChars]  = useState(true)
  const [status,     setStatus]     = useState(null) // { type: 'success'|'error', msg }
  const [dropOpen,   setDropOpen]   = useState(false)

  useEffect(() => {
    api.get('/admin/characters?per_page=500')
      .then(r => {
        const list = r.data.characters || r.data || []
        setCharacters(list)
        setFiltered(list)
      })
      .catch(() => {})
      .finally(() => setLoadChars(false))
  }, [])

  useEffect(() => {
    const q = search.toLowerCase()
    setFiltered(characters.filter(c =>
      c.name?.toLowerCase().includes(q) ||
      c.account_username?.toLowerCase().includes(q)
    ))
  }, [search, characters])

  const handleSend = async () => {
    if (!recipient) return setStatus({ type: 'error', msg: 'Sélectionnez un destinataire.' })
    if (!subject.trim()) return setStatus({ type: 'error', msg: 'Le sujet est obligatoire.' })
    if (!body.trim())    return setStatus({ type: 'error', msg: 'Le message est obligatoire.' })
    setLoading(true)
    setStatus(null)
    try {
      await api.post('/admin/mail/send', {
        character_id:   recipient.id,
        subject:        subject.trim(),
        body:           body.trim(),
        attachment_lot: attachLot,
        attachment_count: attachLot > 0 ? attachAmt : 0,
        coins:          coins,
      })
      setStatus({ type: 'success', msg: `Mail envoyé à ${recipient.name} avec succès.` })
      setSubject('')
      setBody('')
      setAttachLot(0)
      setAttachAmt(1)
      setCoins(0)
      setRecipient(null)
    } catch (e) {
      setStatus({ type: 'error', msg: e.response?.data?.error || 'Erreur lors de l\'envoi.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-title">Envoyer un mail in-game</h1>
        <p className="text-gray-400 text-sm mt-1">Envoi direct dans la boîte de réception d'un personnage (NexusDashboard compatible)</p>
      </div>

      {status && (
        <div className={`flex items-center gap-3 p-4 rounded-lg border ${
          status.type === 'success'
            ? 'bg-green-500/10 border-green-500/30 text-green-400'
            : 'bg-red-500/10 border-red-500/30 text-red-400'
        }`}>
          {status.type === 'success' ? <CheckCircle size={18}/> : <AlertCircle size={18}/>}
          <span className="text-sm">{status.msg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Destinataire */}
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-white flex items-center gap-2">
            <User size={16} className="text-violet-400"/> Destinataire
          </h2>

          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
            <input
              type="text"
              placeholder="Rechercher un personnage..."
              value={search}
              onChange={e => { setSearch(e.target.value); setDropOpen(true) }}
              onFocus={() => setDropOpen(true)}
              className="input pl-9 w-full"
            />
          </div>

          {dropOpen && (
            <div className="border border-[#2e2e4a] rounded-lg bg-[#0d0d1a] max-h-52 overflow-y-auto">
              {loadChars ? (
                <p className="text-gray-400 text-sm p-3">Chargement...</p>
              ) : filtered.length === 0 ? (
                <p className="text-gray-400 text-sm p-3">Aucun personnage trouvé.</p>
              ) : filtered.slice(0, 50).map(c => (
                <button
                  key={c.id}
                  onClick={() => { setRecipient(c); setDropOpen(false); setSearch(c.name) }}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-[#1a1a2e] flex justify-between items-center"
                >
                  <span className="text-white">{c.name}</span>
                  <span className="text-gray-500 text-xs">{c.account_username}</span>
                </button>
              ))}
            </div>
          )}

          {recipient && (
            <div className="flex items-center gap-3 p-3 bg-violet-500/10 border border-violet-500/20 rounded-lg">
              <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-sm font-bold">
                {recipient.name[0]}
              </div>
              <div>
                <p className="text-white text-sm font-medium">{recipient.name}</p>
                <p className="text-gray-400 text-xs">Compte : {recipient.account_username}</p>
              </div>
            </div>
          )}
        </div>

        {/* Pièce jointe */}
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-white flex items-center gap-2">
            <Package size={16} className="text-violet-400"/> Pièce jointe (optionnel)
          </h2>

          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wider mb-1 block">Objet (LOT)</label>
            <select
              value={attachLot}
              onChange={e => setAttachLot(Number(e.target.value))}
              className="input w-full"
            >
              {LEGO_ITEMS.map(item => (
                <option key={item.lot} value={item.lot}>{item.name} {item.lot > 0 ? `(LOT ${item.lot})` : ''}</option>
              ))}
            </select>
          </div>

          {attachLot > 0 && (
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wider mb-1 block">Quantité</label>
              <input
                type="number" min="1" max="999"
                value={attachAmt}
                onChange={e => setAttachAmt(Math.max(1, Number(e.target.value)))}
                className="input w-full"
              />
            </div>
          )}

          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wider mb-1 block">Coins (U-Score)</label>
            <input
              type="number" min="0" max="9999999"
              value={coins}
              onChange={e => setCoins(Math.max(0, Number(e.target.value)))}
              className="input w-full"
            />
          </div>
        </div>
      </div>

      {/* Message */}
      <div className="card p-6 space-y-4">
        <h2 className="font-semibold text-white flex items-center gap-2">
          <Send size={16} className="text-violet-400"/> Message
        </h2>

        <div>
          <label className="text-xs text-gray-400 uppercase tracking-wider mb-1 block">Sujet *</label>
          <input
            type="text"
            placeholder="Objet du mail..."
            maxLength={50}
            value={subject}
            onChange={e => setSubject(e.target.value)}
            className="input w-full"
          />
          <p className="text-xs text-gray-500 mt-1">{subject.length}/50 caractères</p>
        </div>

        <div>
          <label className="text-xs text-gray-400 uppercase tracking-wider mb-1 block">Corps du message *</label>
          <textarea
            rows={5}
            placeholder="Votre message ici..."
            maxLength={500}
            value={body}
            onChange={e => setBody(e.target.value)}
            className="input w-full resize-none"
          />
          <p className="text-xs text-gray-500 mt-1">{body.length}/500 caractères</p>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="text-sm text-gray-400">
            {recipient ? (
              <span>Envoi à <span className="text-violet-400 font-medium">{recipient.name}</span></span>
            ) : (
              <span className="text-gray-600">Aucun destinataire sélectionné</span>
            )}
          </div>
          <button
            onClick={handleSend}
            disabled={loading || !recipient}
            className="btn-primary flex items-center gap-2 disabled:opacity-40"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
            ) : (
              <Send size={16}/>
            )}
            Envoyer le mail
          </button>
        </div>
      </div>
    </div>
  )
}
