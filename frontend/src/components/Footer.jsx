import { Link } from 'react-router-dom'
import { Gamepad2, Github, MessageCircle } from 'lucide-react'

const NAV_COL = [
  { to: '/',            label: 'Accueil' },
  { to: '/about',       label: 'À Propos' },
  { to: '/guide',       label: 'Comment Jouer' },
  { to: '/gallery',     label: 'Galerie' },
  { to: '/news',        label: 'Actualités' },
  { to: '/leaderboard', label: 'Classements' },
]

const COMMUNITY_COL = [
  { href: '#',                                                      label: 'Discord',              icon: MessageCircle },
  { href: 'https://github.com/DarkflameUniverse/DarkflameServer',   label: 'DarkflameServer GitHub', icon: Github },
  { to:   '/news',                                                  label: 'Actualités' },
]

const LEGAL_COL = [
  { to: '/legal', label: 'Mentions légales' },
  { to: '/legal', label: 'Politique de confidentialité' },
  { to: '/legal', label: "Conditions d'utilisation" },
]

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-[#1e1e3a] bg-[#0d0d1a] mt-20">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

          {/* Colonne 1 — Logo + description */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-purple-800 flex items-center justify-center">
                <Gamepad2 size={16} className="text-white" />
              </div>
              <span className="font-title text-sm font-black">
                <span className="text-white">UNIVERSE</span>
                <span className="text-violet-400"> REBORN</span>
              </span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Serveur communautaire LEGO Universe.<br />
              Projet fan non-officiel basé sur DarkflameServer.
            </p>
          </div>

          {/* Colonne 2 — Navigation */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">Navigation</h3>
            <ul className="space-y-2">
              {NAV_COL.map(({ to, label }) => (
                <li key={to + label}>
                  <Link to={to} className="text-sm text-gray-400 hover:text-violet-400 transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Colonne 3 — Communauté */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">Communauté</h3>
            <ul className="space-y-2">
              {COMMUNITY_COL.map(({ href, to, label, icon: Icon }) => (
                <li key={label}>
                  {href
                    ? <a href={href} target="_blank" rel="noreferrer" className="text-sm text-gray-400 hover:text-violet-400 transition-colors flex items-center gap-1.5">
                        {Icon && <Icon size={13} />}{label}
                      </a>
                    : <Link to={to} className="text-sm text-gray-400 hover:text-violet-400 transition-colors">{label}</Link>
                  }
                </li>
              ))}
            </ul>
          </div>

          {/* Colonne 4 — Légal */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">Légal</h3>
            <ul className="space-y-2">
              {LEGAL_COL.map(({ to, label }) => (
                <li key={label}>
                  <Link to={to} className="text-sm text-gray-400 hover:text-violet-400 transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Séparateur + copyright */}
        <div className="divider mt-10 mb-6" />
        <p className="text-center text-xs text-gray-600 leading-relaxed">
          Universe Reborn n'est pas affilié au Groupe LEGO. LEGO et LEGO Universe sont des marques déposées du Groupe LEGO.<br />
          &copy; 2024&ndash;2026 Universe Reborn &mdash; Propulsé par{' '}
          <a href="https://github.com/DarkflameUniverse/DarkflameServer" target="_blank" rel="noreferrer" className="text-violet-500 hover:text-violet-400 transition-colors">DarkflameServer</a>
        </p>
      </div>
    </footer>
  )
}
