import { useState, useEffect } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Gamepad2, Menu, X } from 'lucide-react'

const NAV_LINKS = [
  { to: '/',            label: 'Accueil' },
  { to: '/about',       label: 'À Propos' },
  { to: '/guide',       label: 'Comment Jouer' },
  { to: '/gallery',     label: 'Galerie' },
  { to: '/news',        label: 'Actualités' },
  { to: '/leaderboard', label: 'Classements' },
]

export default function Navbar() {
  const [scrolled,    setScrolled]    = useState(false)
  const [menuOpen,    setMenuOpen]    = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const navBase = `fixed top-0 left-0 right-0 z-50 transition-all duration-300`
  const navBg   = scrolled
    ? 'bg-[#0a0a14] border-b border-[#1e1e3a]'
    : 'bg-transparent'

  return (
    <nav className={`${navBase} ${navBg}`}>
      <div className="container-custom flex items-center justify-between h-16">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-600 to-purple-800 flex items-center justify-center shadow-lg group-hover:shadow-violet-500/40 transition-shadow">
            <Gamepad2 size={18} className="text-white" />
          </div>
          <span className="font-title text-sm font-black tracking-wider">
            <span className="text-white">UNIVERSE</span>
            <span className="text-violet-400"> REBORN</span>
          </span>
        </Link>

        {/* Liens desktop */}
        <ul className="hidden lg:flex items-center gap-1">
          {NAV_LINKS.map(({ to, label }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `px-3 py-2 rounded text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-violet-400 bg-violet-500/10'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`
                }
              >
                {label}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Actions desktop */}
        <div className="hidden lg:flex items-center gap-3">
          <Link to="/login" className="text-sm text-gray-300 hover:text-white transition-colors font-medium">
            Connexion
          </Link>
          <Link to="/register" className="btn-primary py-2 px-4 text-xs">
            Rejoindre
          </Link>
        </div>

        {/* Hamburger mobile */}
        <button
          className="lg:hidden p-2 text-gray-300 hover:text-white transition-colors"
          onClick={() => setMenuOpen(o => !o)}
          aria-label="Menu"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Menu mobile */}
      {menuOpen && (
        <div className="lg:hidden bg-[#0a0a14] border-b border-[#1e1e3a] animate-fade-in">
          <div className="container-custom py-4 flex flex-col gap-1">
            {NAV_LINKS.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `px-4 py-2.5 rounded text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-violet-400 bg-violet-500/10'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
            <div className="divider" />
            <Link to="/login"    onClick={() => setMenuOpen(false)} className="px-4 py-2.5 text-sm text-gray-300 hover:text-white">Connexion</Link>
            <Link to="/register" onClick={() => setMenuOpen(false)} className="btn-primary mt-1 justify-center">Rejoindre</Link>
          </div>
        </div>
      )}
    </nav>
  )
}
