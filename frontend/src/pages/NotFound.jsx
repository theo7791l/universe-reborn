import { Link } from 'react-router-dom'
import { Home } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <p
        className="font-title font-black text-violet-500 leading-none mb-4 select-none"
        style={{ fontSize: 'clamp(6rem, 20vw, 12rem)' }}
      >
        404
      </p>
      <h1 className="font-title text-xl font-black uppercase tracking-widest text-white mb-3">
        Page non trouvée
      </h1>
      <p className="text-gray-400 text-sm max-w-sm mb-8">
        La page que vous cherchez n’existe pas ou a été déplacée. Revenez à l’accueil pour continuer l’aventure.
      </p>
      <Link to="/" className="btn-primary">
        <Home size={15} /> Retour à l’accueil
      </Link>
    </div>
  )
}
