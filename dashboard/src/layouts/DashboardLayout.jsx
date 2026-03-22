import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Users, UserCircle2, Key, Shield,
  Bug, Home, Terminal, ScrollText, Settings,
  Menu, X, LogOut, ChevronRight, Bell, Gamepad2,
  Send, BarChart2, ClipboardList, User
} from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import clsx from 'clsx'

const NAV_ITEMS = [
  { label: 'Vue d’ensemble',  icon: LayoutDashboard, to: '/overview',    section: 'principal' },
  // Joueurs
  { label: 'Mon espace',       icon: User,            to: '/me',           section: 'joueurs'   },
  { label: 'Comptes',          icon: Users,           to: '/accounts',     section: 'joueurs'   },
  { label: 'Personnages',      icon: UserCircle2,     to: '/characters',   section: 'joueurs'   },
  { label: 'Play Keys',        icon: Key,             to: '/play-keys',    section: 'joueurs'   },
  // Admin
  { label: 'Modération',       icon: Shield,          to: '/moderation',   section: 'admin'     },
  { label: 'Bug Reports',      icon: Bug,             to: '/bug-reports',  section: 'admin'     },
  { label: 'Propriétés',       icon: Home,            to: '/properties',   section: 'admin'     },
  { label: 'Envoyer un mail',  icon: Send,            to: '/send-mail',    section: 'admin'     },
  { label: 'Journal d’audit',  icon: ClipboardList,   to: '/audit-log',    section: 'admin'     },
  // Serveur
  { label: 'Rapports',         icon: BarChart2,       to: '/reports',      section: 'serveur'   },
  { label: 'Commandes GM',     icon: Terminal,        to: '/commands',     section: 'serveur'   },
  { label: 'Logs',             icon: ScrollText,      to: '/logs',         section: 'serveur'   },
  { label: 'Paramètres',        icon: Settings,        to: '/settings',     section: 'serveur'   },
]

const SECTIONS = [
  { key: 'principal', label: 'Principal'  },
  { key: 'joueurs',   label: 'Joueurs'    },
  { key: 'admin',     label: 'Admin'      },
  { key: 'serveur',   label: 'Serveur'    },
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
              <p className="text-white font-bold text-sm tracking-widest uppercase">UNIVERSE</p>
              <p className="text-violet-400 text-xs tracking-widest uppercase">REBORN</p>
            </div>
          </div>
          <span className="text-xs text-gray-600">Dashboard</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 space-y-6 px-3">
          {SECTIONS.map(section => {
            const items = NAV_ITEMS.filter(i => i.section === section.key)
            return (
              <div key={section.key}>
                <p className="text-xs text-gray-600 uppercase tracking-widest px-2 mb-2">{section.label}</p>
                {items.map(item => {
                  const Icon = item.icon
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={onClose}
                      className={({ isActive }) =>
                        clsx('nav-link', isActive && 'active')
                      }
                    >
                      <Icon size={16}/>
                      {item.label}
                      {({ isActive }) => isActive && <ChevronRight size={12} className="ml-auto"/>}
                    </NavLink>
                  )
                })}
              </div>
            )
          })}
        </nav>

        {/* User + logout */}
        <div className="border-t border-[#1e1e3a] p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-sm font-bold">
              {user?.username?.[0]?.toUpperCase() ?? 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{user?.username ?? 'Admin'}</p>
              <p className="text-gray-500 text-xs">GM Level {user?.gm_level ?? '?'}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="btn-ghost w-full flex items-center gap-2 text-sm"
          >
            <LogOut size={14}/> Se déconnecter
          </button>
        </div>
      </aside>
    </>
  )
}

function Topbar({ onMenuClick, title }) {
  return (
    <header className="h-14 border-b border-[#1e1e3a] flex items-center justify-between px-4">
      <button onClick={onMenuClick} className="btn-icon lg:hidden">
        <Menu size={20}/>
      </button>
      <h1 className="text-white font-semibold text-sm">{title}</h1>
      <a href="/" className="text-gray-400 text-xs hover:text-white">← Site</a>
    </header>
  )
}

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen bg-[#080810] overflow-hidden">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar onMenuClick={() => setSidebarOpen(true)} title="Universe Reborn Dashboard" />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
