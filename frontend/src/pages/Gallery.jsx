import { useState } from 'react'
import { X, ZoomIn } from 'lucide-react'
import PageHero from '../components/PageHero.jsx'

const FILTERS = [
  'Tous',
  'Avant Gardens',
  'Nimbus Station',
  'Gnarled Forest',
  'Forbidden Valley',
  'Nexus Tower',
  'Crux Prime',
  'Pet Cove',
  'Ninjago Monastery',
]

const CAPTURES = [
  { id: 1, title: 'Avant Gardens — Vue Panoramique',      world: 'Avant Gardens',      color: '#0a1a0a' },
  { id: 2, title: 'Nimbus Station — Place Centrale',       world: 'Nimbus Station',      color: '#0a0a1a' },
  { id: 3, title: 'Gnarled Forest — Forêt Sombre',         world: 'Gnarled Forest',      color: '#0a120a' },
  { id: 4, title: 'Forbidden Valley — Temple',             world: 'Forbidden Valley',    color: '#1a0a0a' },
  { id: 5, title: 'Nexus Tower — Vue du Sommet',           world: 'Nexus Tower',         color: '#1a1500' },
  { id: 6, title: 'Crux Prime — Champ de Bataille',        world: 'Crux Prime',          color: '#1a0a10' },
  { id: 7, title: 'Pet Cove — Bord de Mer',                world: 'Pet Cove',            color: '#0a1015' },
  { id: 8, title: 'Ninjago Monastery — Cour Intérieure',   world: 'Ninjago Monastery',   color: '#0a1018' },
  { id: 9, title: 'Avant Gardens — Tourelle Laser',        world: 'Avant Gardens',      color: '#091209' },
  { id: 10, title: 'Nimbus Station — Arena de Combat',      world: 'Nimbus Station',     color: '#09091a' },
  { id: 11, title: 'Forbidden Valley — Dragon',             world: 'Forbidden Valley',   color: '#180808' },
  { id: 12, title: 'Nexus Tower — Hall des Factions',       world: 'Nexus Tower',        color: '#181400' },
]

function CaptureCard({ capture, onClick }) {
  return (
    <div
      className="card overflow-hidden cursor-pointer group"
      onClick={() => onClick(capture)}
    >
      <div
        className="h-44 flex items-center justify-center relative"
        style={{ background: capture.color }}
      >
        <span className="text-xs uppercase tracking-widest text-gray-600 font-semibold">Image à venir</span>
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
          <ZoomIn size={28} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
      <div className="p-3">
        <span className="text-xs text-violet-400 font-semibold uppercase tracking-wider">{capture.world}</span>
        <p className="text-white text-xs font-medium mt-0.5 truncate">{capture.title}</p>
      </div>
    </div>
  )
}

function Lightbox({ capture, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative max-w-2xl w-full card overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/60 flex items-center justify-center text-white hover:text-violet-400 transition-colors"
        >
          <X size={16} />
        </button>
        <div
          className="h-64 flex items-center justify-center"
          style={{ background: capture.color }}
        >
          <span className="text-xs uppercase tracking-widest text-gray-500">Image à venir</span>
        </div>
        <div className="p-5">
          <span className="text-xs text-violet-400 font-semibold uppercase tracking-wider">{capture.world}</span>
          <h3 className="text-white font-bold mt-1">{capture.title}</h3>
        </div>
      </div>
    </div>
  )
}

export default function Gallery() {
  const [activeFilter, setActiveFilter] = useState('Tous')
  const [lightbox, setLightbox] = useState(null)

  const filtered = activeFilter === 'Tous'
    ? CAPTURES
    : CAPTURES.filter(c => c.world === activeFilter)

  return (
    <div>
      <PageHero
        titleWhite=""
        titleColored="Galerie"
        subtitle="Explorez les mondes de LEGO Universe à travers notre collection de captures d'écran."
      />

      {/* ====== FILTRES ====== */}
      <section className="py-6 border-b border-[#1e1e3a] sticky top-16 z-20 bg-[#0a0a14]/95 backdrop-blur-sm">
        <div className="container-custom">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {FILTERS.map(f => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`shrink-0 px-4 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-all ${
                  activeFilter === f
                    ? 'bg-violet-600 text-white'
                    : 'bg-[#12121f] text-gray-400 border border-[#1e1e3a] hover:text-white hover:border-violet-500/50'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ====== GRILLE ====== */}
      <section className="py-12">
        <div className="container-custom">
          {filtered.length === 0 ? (
            <p className="text-center text-gray-500 py-20">Aucune capture pour ce monde.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map(c => (
                <CaptureCard key={c.id} capture={c} onClick={setLightbox} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ====== LIGHTBOX ====== */}
      {lightbox && <Lightbox capture={lightbox} onClose={() => setLightbox(null)} />}
    </div>
  )
}
