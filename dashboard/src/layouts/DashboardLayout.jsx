import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Users, UserCircle2, Key, Shield,
  Bug, Home, Terminal, ScrollText, Settings,
  Menu, X, LogOut, ChevronRight, Bell, Gamepad2
} from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import clsx from 'clsx'

const NAV_ITEMS = [
  { label: 'Vue d’ensemble', icon: LayoutDashboard, to: '/overview',    section: 'principal' },
  { label: 'Comptes',        icon: Users,           to: '/accounts',    section: 'joueurs'   },
  { label: 'Personnages',    icon: UserCircle2,      to: '/characters',  section: 'joueurs'   },
  { label: 'Play Keys',      icon: Key,             to: '/play-keys',   section: 'joueurs'   },
  { label: 'Modération',     icon: Shield,          to: '/moderation',  section: 'admin'     },
  { label: 'Bug Reports',    icon: Bug,             to: '/bug-reports', section: 'admin'     },
  { label: 'Propriétés',     icon: Home,            to: '/properties',  section: 'admin'     },
  { label: 'Commandes GM',   icon: Terminal,        to: '/commands',    section: 'serveur'   },
  { label: 'Logs',           icon: ScrollText,      to: '/logs',        section: 'serveur'   },
  { label: 'Paramètres',     icon: Settings,        to: '/settings',    section: 'serveur'   },
]

const SECTIONS = [
  { key: 'principal', label: 'Principal' },
  { key: 'joueurs',   label: 'Joueurs'   },
  { key: 'admin',     label: 'Admin'     },
  { key: 'serveur',   label: 'Serveur'   },
]

function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <>
      {/* Overlay mobile */}
      {open && (
        <div
          className="fixed inset-0 z-20 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={clsx(
        'fixed top-0 left-0 h-full z-30 w-64 bg-[#0d0d1a] border-r border-[#1e1e3a] flex flex-col transition-transform duration-300',
        'lg:translate-x-0 lg:static lg:z-auto',
        open ? 'translate-x-0' : '-translate-x-full'
      )}>
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-[#1e1e3a]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-purple-800 flex items-center justify-center">
              <Gamepad2 size={16} className="text-white" />
            </div>
            <div>
              <p className="font-title text-xs font-black uppercase tracking-widest leading-none">
                <span className="text-white">UNIVERSE</span>
                <span className="text-violet-400"> REBORN</span>
              </p>
              <p className="text-[10px] text-gray-500 mt-0.5 uppercase tracking-widest">Dashboard</p>
            </div>
          </div>
          <button onClick={onClose} className="btn-icon lg:hidden">
            <X size={16} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {SECTIONS.map(section => {
            const items = NAV_ITEMS.filter(i => i.section === section.key)
            return (
              <div key={section.key} className="mb-5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600 px-3 mb-1">{section.label}</p>
                {items.map(item => {
                  const Icon = item.icon
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={onClose}
                      className={({ isActive }) => clsx('nav-link', isActive && 'active')}
                    >
                      <Icon size={16} className="shrink-0" />
                      {item.label}
                      {({ isActive }) => isActive && <ChevronRight size={12} className="ml-auto" />}
                    </NavLink>
                  )
                })}
              </div>
            )
          })}
        </nav>

        {/* User + logout */}
        <div className="px-3 py-4 border-t border-[#1e1e3a]">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-violet-600/30 flex items-center justify-center text-violet-400 font-bold text-sm">
              {user?.username?.[0]?.toUpperCase() ?? 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-semibold truncate">{user?.username ?? 'Admin'}</p>
              <p className="text-gray-500 text-xs">GM Level {user?.gm_level ?? '?'}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="nav-link w-full text-red-400 hover:text-red-300 hover:bg-red-500/10">
            <LogOut size={15} />
            Se déconnecter
          </button>
        </div>
      </aside>
    </>
  )
}

function Topbar({ onMenuClick, title }) {
  return (
    <header className="h-14 border-b border-[#1e1e3a] bg-[#0d0d1a]/80 backdrop-blur-sm flex items-center gap-4 px-5 sticky top-0 z-10">
      <button onClick={onMenuClick} className="btn-icon lg:hidden">
        <Menu size={18} />
      </button>
      <div className="flex-1">
        <p className="font-title text-xs font-black uppercase tracking-widest text-white">{title}</p>
      </div>
      <div className="flex items-center gap-2">
        <button className="btn-icon relative">
          <Bell size={16} />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-violet-500" />
        </button>
        <a href="/universe-reborn/" className="btn-secondary text-xs px-3 py-1.5">
          ← Site
        </a>
      </div>
    </header>
  )
}

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen bg-[#0a0a14] overflow-hidden">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar onMenuClick={() => setSidebarOpen(true)} title="Universe Reborn Dashboard" />
        <main className="flex-1 overflow-y-auto p-5 md:p-7 animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
