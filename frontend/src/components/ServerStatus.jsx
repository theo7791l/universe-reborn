import { useState, useEffect } from 'react'

// Fetches real server stats from the API at api.hostepics.fr
export default function ServerStatus({ className = '' }) {
  const [data, setData] = useState({ online: false, players: 0, maxPlayers: 0 })

  useEffect(() => {
    const fetchStatus = () => {
      fetch('https://api.hostepics.fr/status')
        .then(r => r.json())
        .then(d => setData(d))
        .catch(() => setData({ online: false, players: 0, maxPlayers: 0 }))
    }
    fetchStatus()
    const interval = setInterval(fetchStatus, 30000)
    return () => clearInterval(interval)
  }, [])

  const dotColor = data.online ? 'bg-green-500' : 'bg-red-500'
  const pingColor = data.online ? 'bg-green-400 opacity-75' : 'bg-red-400 opacity-75'
  const label = data.online
    ? `Serveur en ligne — ${data.players} joueur${data.players !== 1 ? 's' : ''}`
    : 'Serveur hors ligne'

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 border border-white/10 backdrop-blur-sm ${className}`}>
      <span className="relative flex h-2.5 w-2.5">
        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${pingColor}`} />
        <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${dotColor}`} />
      </span>
      <span className="text-xs font-bold uppercase tracking-widest text-white">
        {label}
      </span>
    </div>
  )
}
