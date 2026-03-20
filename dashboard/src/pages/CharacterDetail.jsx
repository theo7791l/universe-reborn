import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft, Edit3, Save, X, Trash2,
  Package, Sword, Star, Coins, Code2,
  ChevronDown, ChevronUp, AlertTriangle
} from 'lucide-react'

// Mock — à remplacer par GET /api/characters/:id
const MOCK_CHAR = {
  id: 300,
  name: 'Starfall',
  account_id: 1800,
  account_name: 'CosmicBrick',
  faction: 'Paradox',
  level: 41,
  coins: 9383,
  uscore: 412342,
  world: 'Nexus Tower',
  last_seen: '20/03/2026',
  created_at: '05/01/2026',
  hair_color: 0,
  shirt_color: 3,
  inventory: [
    { id: 1,  lot: 6086, name: 'Épée Maelstrom',       quantity: 1,  slot: 0,  equipped: true,  type: 'Arme'   },
    { id: 2,  lot: 6094, name: 'Bouclier Sentinel',    quantity: 1,  slot: 1,  equipped: true,  type: 'Armure' },
    { id: 3,  lot: 4495, name: 'Casque Nexus',         quantity: 1,  slot: 2,  equipped: true,  type: 'Armure' },
    { id: 4,  lot: 2523, name: 'Brique Imaginite',     quantity: 42, slot: 10, equipped: false, type: 'Matériau'},
    { id: 5,  lot: 935,  name: 'Potion de vie',        quantity: 8,  slot: 11, equipped: false, type: 'Consommable'},
    { id: 6,  lot: 1727, name: 'Modèle Vaisseau',      quantity: 1,  slot: 12, equipped: false, type: 'Modèle' },
    { id: 7,  lot: 3050, name: 'Jetpack Paradox',      quantity: 1,  slot: 3,  equipped: true,  type: 'Accessoire'},
    { id: 8,  lot: 6200, name: 'Sceptre Void',         quantity: 1,  slot: 13, equipped: false, type: 'Arme'   },
    { id: 9,  lot: 1500, name: 'Torche Maelstrom',     quantity: 3,  slot: 14, equipped: false, type: 'Consommable'},
    { id: 10, lot: 2800, name: 'Cape Paradox',         quantity: 1,  slot: 4,  equipped: true,  type: 'Armure' },
  ],
  missions_completed: 143,
  missions_active: 5,
  xml: `<obj>
  <char cc="9383" cm="0" co="0" fd="0" ft="0" gm="0" lf="1" ls="0" lu="412342" uscore="412342">
    <f ft="0" id="0" l="41" m="0" t="2" uid="a1b2c3" />
  </char>
</obj>`,
}

const TYPE_BADGE = {
  'Arme':        'badge-red',
  'Armure':      'badge-blue',
  'Accessoire':  'badge-violet',
  'Matériau':    'badge-gray',
  'Consommable': 'badge-green',
  'Modèle':      'badge-yellow',
}

const FACTION_COLOR = {
  'Paradox':       '#8b5cf6',
  'Assembly':      '#3b82f6',
  'Sentinel':      '#22c55e',
  'Venture League':'#f97316',
}

export default function CharacterDetail() {
  const { id } = useParams()
  const char   = MOCK_CHAR

  const [editCoins,  setEditCoins]  = useState(false)
  const [editLevel,  setEditLevel]  = useState(false)
  const [coins,      setCoins]      = useState(char.coins)
  const [level,      setLevel]      = useState(char.level)
  const [coinsVal,   setCoinsVal]   = useState(String(char.coins))
  const [levelVal,   setLevelVal]   = useState(String(char.level))
  const [xmlOpen,    setXmlOpen]    = useState(false)
  const [invFilter,  setInvFilter]  = useState('all')
  const [toast,      setToast]      = useState(null)
  const [delModal,   setDelModal]   = useState(false)

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(null), 3000) }

  const saveCoins = () => { setCoins(parseInt(coinsVal)||0); setEditCoins(false); showToast('Coins mis à jour.') }
  const saveLevel = () => { setLevel(parseInt(levelVal)||1); setEditLevel(false); showToast('Niveau mis à jour.') }

  const equipped   = char.inventory.filter(i => i.equipped)
  const invFiltered = invFilter === 'all'
    ? char.inventory
    : char.inventory.filter(i => i.type === invFilter)

  const invTypes = ['all', ...new Set(char.inventory.map(i => i.type))]

  return (
    <div className="flex flex-col gap-6 animate-fade-in">

      {/* Toast */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-lg bg-green-600/90 text-white text-sm font-semibold shadow-xl animate-fade-in">
          {toast}
        </div>
      )}

      {/* Delete modal */}
      {delModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="card p-6 w-full max-w-sm flex flex-col gap-4 animate-fade-in">
            <div className="flex items-center gap-3">
              <AlertTriangle size={20} className="text-red-400" />
              <h3 className="font-bold text-white">Supprimer ce personnage ?</h3>
            </div>
            <p className="text-sm text-gray-400">Cette action est irréversible. Toutes les données de <strong className="text-white">{char.name}</strong> seront perdues.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDelModal(false)} className="btn-secondary">Annuler</button>
              <button onClick={() => { setDelModal(false); showToast('Personnage supprimé.') }} className="btn-danger"><Trash2 size={14}/> Supprimer</button>
            </div>
          </div>
        </div>
      )}

      {/* Back */}
      <div>
        <Link to="/characters" className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-violet-400 transition-colors mb-4">
          <ArrowLeft size={14} /> Retour aux personnages
        </Link>

        <div className="page-header">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-lg flex items-center justify-center font-black text-2xl font-title"
              style={{ background: FACTION_COLOR[char.faction]+'22', border: `2px solid ${FACTION_COLOR[char.faction]}44`, color: FACTION_COLOR[char.faction] }}>
              {char.name[0]}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="page-title">{char.name}</h1>
                <span className="badge" style={{ background: FACTION_COLOR[char.faction]+'22', color: FACTION_COLOR[char.faction], border: `1px solid ${FACTION_COLOR[char.faction]}44` }}>
                  {char.faction}
                </span>
              </div>
              <p className="page-subtitle">
                #{char.id} · Compte :
                <Link to={`/accounts/${char.account_id}`} className="text-violet-400 hover:text-violet-300 ml-1">{char.account_name}</Link>
                · Dernier monde : {char.world}
              </p>
            </div>
          </div>
          <button onClick={() => setDelModal(true)} className="btn-danger">
            <Trash2 size={14} /> Supprimer
          </button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

        {/* Niveau */}
        <div className="stat-card card-hover">
          <div className="flex items-center justify-between mb-1">
            <Star size={16} className="text-yellow-400" />
            <button onClick={() => { setEditLevel(true); setLevelVal(String(level)) }} className="btn-icon p-1">
              <Edit3 size={12} />
            </button>
          </div>
          {editLevel ? (
            <div className="flex items-center gap-1">
              <input type="number" min={1} max={45} className="input w-16 text-center py-1 text-sm" value={levelVal} onChange={e=>setLevelVal(e.target.value)} />
              <button onClick={saveLevel} className="btn-icon text-green-400 p-1"><Save size={12}/></button>
              <button onClick={()=>setEditLevel(false)} className="btn-icon text-red-400 p-1"><X size={12}/></button>
            </div>
          ) : <p className="stat-value">{level}</p>}
          <p className="stat-label">Niveau</p>
        </div>

        {/* Coins */}
        <div className="stat-card card-hover">
          <div className="flex items-center justify-between mb-1">
            <Coins size={16} className="text-yellow-400" />
            <button onClick={() => { setEditCoins(true); setCoinsVal(String(coins)) }} className="btn-icon p-1">
              <Edit3 size={12} />
            </button>
          </div>
          {editCoins ? (
            <div className="flex items-center gap-1">
              <input type="number" min={0} className="input w-24 text-center py-1 text-sm" value={coinsVal} onChange={e=>setCoinsVal(e.target.value)} />
              <button onClick={saveCoins} className="btn-icon text-green-400 p-1"><Save size={12}/></button>
              <button onClick={()=>setEditCoins(false)} className="btn-icon text-red-400 p-1"><X size={12}/></button>
            </div>
          ) : <p className="stat-value">{coins.toLocaleString()}</p>}
          <p className="stat-label">Coins</p>
        </div>

        <div className="stat-card">
          <Star size={16} className="text-violet-400 mb-1" />
          <p className="stat-value">{char.uscore.toLocaleString()}</p>
          <p className="stat-label">U-Score</p>
        </div>

        <div className="stat-card">
          <Package size={16} className="text-blue-400 mb-1" />
          <p className="stat-value">{char.missions_completed}</p>
          <p className="stat-label">Missions</p>
        </div>
      </div>

      {/* Équipement actif */}
      <div className="card p-5">
        <p className="section-title flex items-center gap-2"><Sword size={14} className="text-red-400" />Équipement actif ({equipped.length})</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {equipped.map(item => (
            <div key={item.id} className="bg-[#0d0d1a] border border-[#1e1e3a] rounded p-3 flex flex-col gap-1 hover:border-violet-500/40 transition-colors">
              <span className={`text-[10px] ${TYPE_BADGE[item.type]}`}>{item.type}</span>
              <p className="text-white text-xs font-semibold leading-snug">{item.name}</p>
              <p className="text-gray-500 text-[10px] font-mono">LOT {item.lot}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Inventaire complet */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="section-title flex items-center gap-2 mb-0">
            <Package size={14} className="text-blue-400" />
            Inventaire ({char.inventory.length} objets)
          </p>
          <div className="flex gap-1 flex-wrap">
            {invTypes.map(t => (
              <button key={t} onClick={() => setInvFilter(t)}
                className={`px-2 py-1 rounded text-xs font-bold transition-colors ${
                  invFilter === t ? 'bg-violet-600 text-white' : 'bg-[#1e1e3a] text-gray-400 hover:text-white'
                }`}>
                {t === 'all' ? 'Tous' : t}
              </button>
            ))}
          </div>
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Slot</th><th>LOT</th><th>Nom</th><th>Type</th><th>Qté</th><th>Équipé</th></tr></thead>
            <tbody>
              {invFiltered.map(item => (
                <tr key={item.id}>
                  <td className="text-gray-500 font-mono text-xs">{item.slot}</td>
                  <td className="text-gray-500 font-mono text-xs">{item.lot}</td>
                  <td className="text-white font-medium text-sm">{item.name}</td>
                  <td><span className={TYPE_BADGE[item.type]}>{item.type}</span></td>
                  <td className="text-white font-semibold">{item.quantity}</td>
                  <td>{item.equipped ? <span className="badge-green">Oui</span> : <span className="text-gray-600">—</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* XML Viewer */}
      <div className="card overflow-hidden">
        <button
          onClick={() => setXmlOpen(o => !o)}
          className="w-full flex items-center justify-between px-5 py-4 hover:bg-[#1a1a2e] transition-colors"
        >
          <p className="section-title flex items-center gap-2 mb-0">
            <Code2 size={14} className="text-violet-400" />
            Character XML
          </p>
          {xmlOpen ? <ChevronUp size={16} className="text-gray-400"/> : <ChevronDown size={16} className="text-gray-400"/>}
        </button>
        {xmlOpen && (
          <div className="border-t border-[#1e1e3a] px-5 py-4 animate-fade-in">
            <pre className="text-xs text-green-300 font-mono leading-relaxed overflow-x-auto whitespace-pre-wrap bg-[#0a0a14] p-4 rounded">
              {char.xml}
            </pre>
          </div>
        )}
      </div>

    </div>
  )
}
