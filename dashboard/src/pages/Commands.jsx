import { useState, useRef, useEffect } from 'react'
import { Terminal, Send, Trash2, ChevronRight, Info, AlertTriangle } from 'lucide-react'

const GM_COMMANDS = [
  { cmd: '/kick <username>',                  desc: 'Expulse un joueur du serveur',              level: 4  },
  { cmd: '/ban <username> <duration> <reason>',desc: 'Bannit un joueur',                         level: 4  },
  { cmd: '/unban <username>',                  desc: 'Débannit un joueur',                       level: 4  },
  { cmd: '/mute <username> <duration>',        desc: 'Mute un joueur en chat',                   level: 4  },
  { cmd: '/announce <message>',               desc: 'Envoie une annonce globale',               level: 4  },
  { cmd: '/give <username> <lot> <quantity>',  desc: 'Donne un item à un joueur',               level: 9  },
  { cmd: '/setgm <username> <level>',          desc: 'Définit le GM level d’un joueur',          level: 9  },
  { cmd: '/teleport <username> <zone>',        desc: 'Téléporte un joueur dans une zone',        level: 4  },
  { cmd: '/coins <username> <amount>',         desc: 'Modifie les coins d’un joueur',           level: 9  },
  { cmd: '/mail <username> <subject> <body>',  desc: 'Envoie un mail in-game',                   level: 4  },
  { cmd: '/shutdown <delay>',                  desc: 'Arrête le serveur après N secondes',      level: 9  },
  { cmd: '/broadcast <message>',              desc: 'Diffuse un message dans toutes les zones', level: 4  },
  { cmd: '/respawn <username>',               desc: 'Fait respawn un joueur',                   level: 4  },
  { cmd: '/setlevel <username> <level>',       desc: 'Définit le niveau d’un personnage',       level: 9  },
]

const EXAMPLE_HISTORY = [
  { id: 1, type: 'input',   text: '/announce Maintenance dans 10 minutes !',  time: '19:12:04' },
  { id: 2, type: 'success', text: '[OK] Annonce envoyée à 42 joueurs.',        time: '19:12:04' },
  { id: 3, type: 'input',   text: '/kick ToxicBrick',                          time: '19:08:31' },
  { id: 4, type: 'success', text: '[OK] ToxicBrick a été expulsé.',           time: '19:08:31' },
  { id: 5, type: 'input',   text: '/give CosmicBrick 6086 1',                  time: '19:05:17' },
  { id: 6, type: 'success', text: '[OK] Item LOT 6086 donné à CosmicBrick.',   time: '19:05:17' },
  { id: 7, type: 'input',   text: '/setgm VoidWalker 4',                       time: '18:58:42' },
  { id: 8, type: 'success', text: '[OK] GM Level de VoidWalker défini à 4.',   time: '18:58:42' },
  { id: 9, type: 'error',   text: '[ERR] Joueur introuvable : UnknownPlayer',  time: '18:55:10' },
]

export default function Commands() {
  const [history,  setHistory]  = useState(EXAMPLE_HISTORY)
  const [input,    setInput]    = useState('')
  const [suggest,  setSuggest]  = useState([])
  const [selRef,   setSelRef]   = useState(-1)
  const bottomRef = useRef(null)
  const inputRef  = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [history])

  const handleInput = val => {
    setInput(val)
    setSelRef(-1)
    if (val.startsWith('/') && val.length > 1) {
      const q = val.toLowerCase()
      setSuggest(GM_COMMANDS.filter(c => c.cmd.toLowerCase().startsWith(q)).slice(0, 5))
    } else {
      setSuggest([])
    }
  }

  const handleKeyDown = e => {
    if (e.key === 'Tab' && suggest.length) {
      e.preventDefault()
      const next = (selRef + 1) % suggest.length
      setSelRef(next)
      setInput(suggest[next].cmd.split(' ')[0] + ' ')
      setSuggest([])
    }
    if (e.key === 'ArrowUp' && suggest.length) {
      e.preventDefault()
      const next = selRef <= 0 ? suggest.length-1 : selRef-1
      setSelRef(next)
    }
    if (e.key === 'ArrowDown' && suggest.length) {
      e.preventDefault()
      const next = (selRef + 1) % suggest.length
      setSelRef(next)
    }
    if (e.key === 'Enter') sendCommand()
    if (e.key === 'Escape') setSuggest([])
  }

  const sendCommand = () => {
    if (!input.trim()) return
    const id = Date.now()
    const time = new Date().toLocaleTimeString('fr-FR', {hour:'2-digit',minute:'2-digit',second:'2-digit'})

    setHistory(h => [
      ...h,
      { id, type:'input', text: input, time },
      {
        id: id+1,
        type: input.startsWith('/') ? 'success' : 'error',
        text: input.startsWith('/')
          ? `[OK] Commande exécutée : ${input.split(' ')[0]}`
          : `[ERR] Commande inconnue. Utilisez /help pour la liste.`,
        time
      }
    ])
    setInput('')
    setSuggest([])
    inputRef.current?.focus()
  }

  const lineColor = type =>
    type==='input'   ? 'text-white' :
    type==='success' ? 'text-green-400' :
    type==='error'   ? 'text-red-400' :
    'text-gray-400'

  const linePrefix = type =>
    type==='input' ? <ChevronRight size={12} className="text-violet-400 shrink-0 mt-0.5"/> :
    type==='success' ? <span className="text-green-400 text-xs shrink-0">●</span> :
    <span className="text-red-400 text-xs shrink-0">●</span>

  return (
    <div className="flex flex-col gap-6 animate-fade-in">

      <div className="page-header">
        <div>
          <h1 className="page-title">Commandes GM</h1>
          <p className="page-subtitle">Console d’administration Darkflame Server</p>
        </div>
        <button onClick={()=>setHistory([])} className="btn-secondary">
          <Trash2 size={14}/> Vider
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Console */}
        <div className="lg:col-span-2 flex flex-col gap-3">
          {/* Terminal output */}
          <div className="card bg-[#0a0a14] h-96 overflow-y-auto p-4 font-mono text-xs flex flex-col gap-1">
            {history.length === 0 && (
              <p className="text-gray-600 italic">Console vide. Tapez une commande ci-dessous.</p>
            )}
            {history.map(line => (
              <div key={line.id} className={`flex items-start gap-2 ${lineColor(line.type)}`}>
                {linePrefix(line.type)}
                <span className="text-gray-600 shrink-0">[{line.time}]</span>
                <span className="leading-relaxed">{line.text}</span>
              </div>
            ))}
            <div ref={bottomRef}/>
          </div>

          {/* Input */}
          <div className="relative">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Terminal size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-violet-400"/>
                <input
                  ref={inputRef}
                  className="input pl-9 font-mono text-sm"
                  placeholder="/announce Bienvenue !"
                  value={input}
                  onChange={e=>handleInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  autoFocus
                />
              </div>
              <button onClick={sendCommand} className="btn-primary px-4">
                <Send size={14}/>
              </button>
            </div>

            {/* Autocomplete suggestions */}
            {suggest.length > 0 && (
              <div className="absolute left-0 right-12 top-full mt-1 z-20 card overflow-hidden">
                {suggest.map((s,i) => (
                  <button
                    key={i}
                    onClick={()=>{ setInput(s.cmd.split(' ')[0]+' '); setSuggest([]); inputRef.current?.focus() }}
                    className={`w-full flex items-center justify-between px-4 py-2 text-xs font-mono hover:bg-[#1e1e3a] transition-colors ${
                      i===selRef ? 'bg-violet-600/20' : ''
                    }`}
                  >
                    <span className="text-violet-300">{s.cmd.split(' ')[0]}</span>
                    <span className="text-gray-500 text-[10px]">{s.desc}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <p className="text-xs text-gray-600">Tab pour autocomplete · ↑↓ pour naviguer · Entrée pour exécuter</p>
        </div>

        {/* Référence commandes */}
        <div className="card p-4 flex flex-col gap-1 overflow-y-auto max-h-[500px]">
          <p className="section-title flex items-center gap-2 sticky top-0 bg-[#12121f] pb-2">
            <Info size={13} className="text-violet-400"/>
            Référence
          </p>
          {GM_COMMANDS.map((c,i) => (
            <button
              key={i}
              onClick={()=>{ setInput(c.cmd.split(' ')[0]+' '); inputRef.current?.focus() }}
              className="text-left px-3 py-2 rounded hover:bg-[#1e1e3a] transition-colors group"
            >
              <p className="font-mono text-xs text-violet-300 group-hover:text-violet-200">{c.cmd.split(' ')[0]}</p>
              <p className="text-[10px] text-gray-500 mt-0.5">{c.desc}</p>
              <span className={`text-[9px] font-bold ${ c.level>=9?'text-red-400':'text-yellow-400'}`}>
                GM ≥ {c.level}
              </span>
            </button>
          ))}
        </div>
      </div>

    </div>
  )
}
