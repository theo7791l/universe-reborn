import {
  Users, UserCircle2, Key, Bug,
  Home, Shield, TrendingUp, Activity,
  Circle
} from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts'

// ---- Données mock — à remplacer par des appels API ----
const STATS = [
  { label: 'Comptes',      value: 1248, icon: Users,       color: '#8b5cf6', delta: '+12 ce mois'  },
  { label: 'Personnages',  value: 3721, icon: UserCircle2, color: '#3b82f6', delta: '+38 ce mois'  },
  { label: 'Play Keys',    value: 312,  icon: Key,         color: '#22c55e', delta: '89 actives'   },
  { label: 'Bug Reports',  value: 47,   icon: Bug,         color: '#f97316', delta: '8 non-traités' },
  { label: 'Propriétés',  value: 214,  icon: Home,        color: '#eab308', delta: '3 en attente' },
  { label: 'Sanctions',    value: 23,   icon: Shield,      color: '#ef4444', delta: '2 ce mois'    },
]

const registrations_data = [
  { day: 'Lun', comptes: 4  },
  { day: 'Mar', comptes: 7  },
  { day: 'Mer', comptes: 3  },
  { day: 'Jeu', comptes: 9  },
  { day: 'Ven', comptes: 12 },
  { day: 'Sam', comptes: 15 },
  { day: 'Dim', comptes: 8  },
]

const online_data = [
  { time: '00h', players: 8  },
  { time: '03h', players: 4  },
  { time: '06h', players: 3  },
  { time: '09h', players: 11 },
  { time: '12h', players: 18 },
  { time: '15h', players: 29 },
  { time: '18h', players: 42 },
  { time: '21h', players: 35 },
]

const faction_data = [
  { name: 'Paradox',       value: 312, color: '#8b5cf6' },
  { name: 'Assembly',      value: 278, color: '#3b82f6' },
  { name: 'Sentinel',      value: 341, color: '#22c55e' },
  { name: 'Venture League',value: 317, color: '#f97316' },
]

const RECENT_ACCOUNTS = [
  { id: 1801, username: 'CosmicBrick',    date: 'Il y a 5 min',  gm: 0, banned: false },
  { id: 1800, username: 'StarForge99',    date: 'Il y a 12 min', gm: 0, banned: false },
  { id: 1799, username: 'MaelstromKing',  date: 'Il y a 1h',     gm: 0, banned: true  },
  { id: 1798, username: 'BrickSmith',     date: 'Il y a 2h',     gm: 0, banned: false },
  { id: 1797, username: 'VoidWalker',     date: 'Il y a 3h',     gm: 4, banned: false },
]

const RECENT_BUGS = [
  { id: 101, title: 'Crash au chargement de Crux Prime',         status: 'open',     date: 'Il y a 20 min' },
  { id: 100, title: 'Inventaire vide après reconnexion',          status: 'progress', date: 'Il y a 1h'     },
  { id:  99, title: 'Mission bloquée à Avant Gardens',            status: 'resolved',  date: 'Il y a 3h'     },
  { id:  98, title: 'Ping anormalement élevé sur Nimbus Station', status: 'open',     date: 'Il y a 5h'     },
]

const STATUS_BADGE = {
  open:     <span className="badge-red">    Ouvert    </span>,
  progress: <span className="badge-yellow"> En cours  </span>,
  resolved: <span className="badge-green">  Résolu    </span>,
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="card px-3 py-2 text-xs">
      <p className="text-gray-400 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color ?? p.fill }} className="font-semibold">
          {p.name} : {p.value}
        </p>
      ))}
    </div>
  )
}

export default function Overview() {
  return (
    <div className="flex flex-col gap-7 animate-fade-in">

      {/* Page header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Vue d’ensemble</h1>
          <p className="page-subtitle">Bienvenue sur le dashboard Universe Reborn</p>
        </div>
        <div className="flex items-center gap-2">
          <Circle size={8} className="text-green-400 fill-green-400" />
          <span className="text-green-400 text-sm font-semibold">Serveur en ligne</span>
          <span className="badge-green ml-1">42 joueurs</span>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {STATS.map(s => {
          const Icon = s.icon
          return (
            <div key={s.label} className="stat-card card-hover">
              <div className="flex items-center justify-between mb-2">
                <Icon size={18} style={{ color: s.color }} />
                <span className="text-[10px] text-gray-500">{s.delta}</span>
              </div>
              <p className="stat-value">{s.value.toLocaleString()}</p>
              <p className="stat-label">{s.label}</p>
            </div>
          )
        })}
      </div>

      {/* Graphiques ligne 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Inscriptions 7 jours */}
        <div className="card p-5">
          <p className="section-title flex items-center gap-2">
            <TrendingUp size={14} className="text-violet-400" />
            Inscriptions — 7 derniers jours
          </p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={registrations_data} barSize={20}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e1e3a" vertical={false} />
              <XAxis dataKey="day" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="comptes" fill="#7c3aed" radius={[4, 4, 0, 0]} name="Comptes" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Joueurs en ligne 24h */}
        <div className="card p-5">
          <p className="section-title flex items-center gap-2">
            <Activity size={14} className="text-green-400" />
            Joueurs en ligne — 24h
          </p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={online_data}>
              <defs>
                <linearGradient id="gradOnline" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#22c55e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0}   />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e1e3a" vertical={false} />
              <XAxis dataKey="time" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="players" stroke="#22c55e" strokeWidth={2} fill="url(#gradOnline)" name="Joueurs" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Graphiques ligne 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Répartition factions */}
        <div className="card p-5">
          <p className="section-title">Répartition Factions</p>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={faction_data}
                cx="50%" cy="50%"
                innerRadius={45} outerRadius={70}
                paddingAngle={3}
                dataKey="value"
              >
                {faction_data.map((f, i) => (
                  <Cell key={i} fill={f.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-col gap-1.5 mt-2">
            {faction_data.map(f => (
              <div key={f.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ background: f.color }} />
                  <span className="text-gray-400">{f.name}</span>
                </span>
                <span className="text-white font-semibold">{f.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Derniers comptes */}
        <div className="card p-5 lg:col-span-2">
          <p className="section-title">Derniers comptes inscrits</p>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>#ID</th>
                  <th>Pseudo</th>
                  <th>GM</th>
                  <th>Statut</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {RECENT_ACCOUNTS.map(a => (
                  <tr key={a.id}>
                    <td className="text-gray-500">#{a.id}</td>
                    <td className="text-white font-medium">{a.username}</td>
                    <td>{a.gm > 0 ? <span className="badge-violet">GM {a.gm}</span> : <span className="text-gray-600">—</span>}</td>
                    <td>{a.banned ? <span className="badge-red">Banni</span> : <span className="badge-green">Actif</span>}</td>
                    <td className="text-gray-500 text-xs">{a.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Bug reports récents */}
      <div className="card p-5">
        <p className="section-title">Bug Reports récents</p>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Titre</th>
                <th>Statut</th>
                <th>Signalement</th>
              </tr>
            </thead>
            <tbody>
              {RECENT_BUGS.map(b => (
                <tr key={b.id}>
                  <td className="text-gray-500">#{b.id}</td>
                  <td className="text-white">{b.title}</td>
                  <td>{STATUS_BADGE[b.status]}</td>
                  <td className="text-gray-500 text-xs">{b.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}
