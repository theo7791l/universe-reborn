// Badge statut serveur — affiche un point vert animé + nombre de joueurs
// Les données sont mockées ici ; à remplacer par un vrai appel API
export default function ServerStatus({ players = 42, className = '' }) {
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 border border-white/10 backdrop-blur-sm ${className}`}>
      <span className="relative flex h-2.5 w-2.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
      </span>
      <span className="text-xs font-bold uppercase tracking-widest text-white">
        Serveur en ligne &mdash; {players} joueurs
      </span>
    </div>
  )
}
