import { useState } from 'react'
import { Star, Coins, Trophy } from 'lucide-react'
import PageHero from '../components/PageHero.jsx'
import { leaderboard, FACTIONS } from '../data/leaderboard.js'

const TABS = [
  { key: 'uscore', label: 'U-Score', icon: Trophy,  sortFn: (a, b) => b.uscore - a.uscore },
  { key: 'level',  label: 'Niveau',  icon: Star,    sortFn: (a, b) => b.level - a.level  },
  { key: 'coins',  label: 'Coins',   icon: Coins,   sortFn: (a, b) => b.coins - a.coins  },
]

const RANK_STYLE = {
  1: { bg: 'bg-yellow-500/10 border-yellow-500/30', text: 'text-yellow-400', medal: '🥇' },
  2: { bg: 'bg-gray-400/10   border-gray-400/30',   text: 'text-gray-300',   medal: '🥈' },
  3: { bg: 'bg-orange-700/10 border-orange-700/30', text: 'text-orange-400', medal: '🥉' },
}

export default function Leaderboard() {
  const [activeTab, setActiveTab] = useState('uscore')

  const tab     = TABS.find(t => t.key === activeTab)
  const sorted  = [...leaderboard].sort(tab.sortFn).map((p, i) => ({ ...p, displayRank: i + 1 }))

  return (
    <div>
      <PageHero
        titleWhite=""
        titleColored="Classements"
        colorClass="text-yellow-400"
        subtitle="Les meilleurs joueurs d'Universe Reborn."
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
                    activeTab === t.key
                      ? 'bg-violet-600 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Icon size={14} /> {t.label}
                </button>
              )
            })}
          </div>

          {/* Tableau */}
          <div className="flex flex-col gap-2">
            {/* En-têtes */}
            <div className="grid grid-cols-12 px-4 py-2 text-xs font-bold uppercase tracking-widest text-gray-500">
              <div className="col-span-1">Rang</div>
              <div className="col-span-4">Personnage</div>
              <div className="col-span-3">Joueur</div>
              <div className="col-span-1 text-center">Niv.</div>
              <div className="col-span-2 text-right">Coins</div>
              <div className="col-span-1 text-right">Score</div>
            </div>

            {sorted.map(player => {
              const r     = player.displayRank
              const style = RANK_STYLE[r]
              const fac   = FACTIONS[player.faction]

              return (
                <div
                  key={player.character}
                  className={`grid grid-cols-12 items-center px-4 py-3 rounded-lg border ${
                    style
                      ? `${style.bg}`
                      : 'bg-[#12121f] border-[#1e1e3a]'
                  } transition-colors hover:border-violet-500/40`}
                >
                  {/* Rang */}
                  <div className={`col-span-1 font-black text-lg ${style ? style.text : 'text-gray-400'}`}>
                    {style ? style.medal : `#${r}`}
                  </div>

                  {/* Personnage */}
                  <div className="col-span-4">
                    <span className="text-white font-bold text-sm">{player.character}</span>
                    {fac && (
                      <span className={`ml-2 badge text-xs ${fac.bg}`}>{player.faction}</span>
                    )}
                  </div>

                  {/* Joueur */}
                  <div className="col-span-3 text-gray-400 text-sm">{player.player}</div>

                  {/* Niveau */}
                  <div className="col-span-1 text-center">
                    <span className="text-white font-bold text-sm">{player.level}</span>
                  </div>

                  {/* Coins */}
                  <div className="col-span-2 text-right text-yellow-400 font-semibold text-sm">
                    {player.coins.toLocaleString()}
                  </div>

                  {/* U-Score */}
                  <div className="col-span-1 text-right text-violet-400 font-bold text-xs">
                    {(player.uscore / 1000).toFixed(0)}k
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}
