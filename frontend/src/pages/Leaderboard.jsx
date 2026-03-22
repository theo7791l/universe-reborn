import { useState, useEffect } from 'react'
import { Star, Trophy, Loader2, AlertCircle } from 'lucide-react'
import PageHero from '../components/PageHero.jsx'
import api from '../api/index.js'

const TABS = [
  { key: 'uscore', label: 'U-Score', icon: Trophy  },
  { key: 'coins',  label: 'Coins',   icon: Star    },
]

const RANK_STYLE = {
  1: { bg: 'bg-yellow-500/10 border-yellow-500/30', text: 'text-yellow-400', medal: '🥇' },
  2: { bg: 'bg-gray-400/10   border-gray-400/30',   text: 'text-gray-300',   medal: '🥈' },
  3: { bg: 'bg-orange-700/10 border-orange-700/30', text: 'text-orange-400', medal: '🥉' },
}

export default function Leaderboard() {
  const [activeTab, setActiveTab] = useState('uscore')
  const [data,      setData]      = useState([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState('')

  useEffect(() => {
    setLoading(true)
    setError('')
    api.get(`/api/leaderboard?sort=${activeTab}&limit=25`)
      .then(r => setData(r.data))
      .catch(() => setError('Impossible de charger le classement.'))
      .finally(() => setLoading(false))
  }, [activeTab])

  return (
    <div>
      <PageHero
        titleWhite=""
        titleColored="Classements"
        colorClass="text-yellow-400"
        subtitle="Les meilleurs joueurs d’Universe Reborn."
      />

      <section className="py-12">
        <div className="container-custom max-w-4xl">

          {/* Onglets */}
          <div className="flex gap-2 mb-8 bg-[#12121f] border border-[#1e1e3a] rounded-lg p-1 w-fit">
            {TABS.map(t => {
              const Icon = t.icon
              return (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key)}
                  className={`flex items-center gap-2 px-4 py-2 rounded text-sm font-bold uppercase tracking-wider transition-all ${
                    activeTab === t.key ? 'bg-violet-600 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Icon size={14} /> {t.label}
                </button>
              )
            })}
          </div>

          {/* États */}
          {loading && (
            <div className="flex items-center justify-center py-20 gap-3 text-gray-400">
              <Loader2 size={20} className="animate-spin" /> Chargement…
            </div>
          )}
          {error && (
            <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded px-4 py-3">
              <AlertCircle size={15} /> {error}
            </div>
          )}

          {/* Tableau */}
          {!loading && !error && (
            <div className="flex flex-col gap-2">
              <div className="grid grid-cols-12 px-4 py-2 text-xs font-bold uppercase tracking-widest text-gray-500">
                <div className="col-span-1">Rang</div>
                <div className="col-span-5">Personnage</div>
                <div className="col-span-3">Zone actuelle</div>
                <div className="col-span-3 text-right">{activeTab === 'uscore' ? 'U-Score' : 'Coins'}</div>
              </div>

              {data.length === 0 && (
                <p className="text-center text-gray-500 py-12">Aucun joueur trouvé.</p>
              )}

              {data.map(player => {
                const r     = player.rank
                const style = RANK_STYLE[r]
                return (
                  <div
                    key={player.name}
                    className={`grid grid-cols-12 items-center px-4 py-3 rounded-lg border transition-colors hover:border-violet-500/40 ${
                      style ? style.bg : 'bg-[#12121f] border-[#1e1e3a]'
                    }`}
                  >
                    <div className={`col-span-1 font-black text-lg ${style ? style.text : 'text-gray-400'}`}>
                      {style ? style.medal : `#${r}`}
                    </div>
                    <div className="col-span-5">
                      <span className="text-white font-bold text-sm">{player.name}</span>
                    </div>
                    <div className="col-span-3 text-gray-400 text-sm">{player.zone}</div>
                    <div className="col-span-3 text-right font-bold text-sm">
                      {activeTab === 'uscore'
                        ? <span className="text-violet-400">{(player.value ?? 0).toLocaleString()}</span>
                        : <span className="text-yellow-400">{(player.value ?? 0).toLocaleString()}</span>
                      }
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
