import { Link } from 'react-router-dom'
import { Users, Gamepad2, Swords, Clock, ArrowRight, MessageCircle } from 'lucide-react'
import ServerStatus from '../components/ServerStatus.jsx'
import { useCountUp } from '../hooks/useCountUp.js'
import { worlds } from '../data/worlds.js'
import { articles } from '../data/news.js'

// --- Compteur individuel ---
function StatCard({ icon: Icon, value, label, color }) {
  const { ref, count } = useCountUp(value)
  return (
    <div ref={ref} className="flex flex-col items-center gap-2 p-6">
      <Icon size={28} style={{ color }} />
      <span className="font-title text-4xl font-black text-white">{count.toLocaleString()}</span>
      <span className="text-xs uppercase tracking-widest text-gray-400 font-semibold">{label}</span>
    </div>
  )
}

// --- Carte monde ---
function WorldCard({ world }) {
  const Icon = world.icon
  return (
    <div className="card p-5 flex flex-col gap-3 cursor-default">
      <div className="flex items-center justify-between">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: world.color + '22' }}>
          <Icon size={20} style={{ color: world.color }} />
        </div>
        <span className="flex items-center gap-1.5 text-xs text-gray-400">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block animate-pulse" />
          {world.players} en ligne
        </span>
      </div>
      <div>
        <h3 className="font-title text-sm font-bold uppercase tracking-wider text-white mb-1">{world.name}</h3>
        <p className="text-xs text-gray-400 leading-relaxed">{world.description}</p>
      </div>
    </div>
  )
}

// --- Carte article (accueil) ---
function ArticleCard({ article }) {
  return (
    <Link to={`/news/${article.slug}`} className="card p-0 overflow-hidden flex flex-col group">
      <div className="h-36 flex items-center justify-center" style={{ background: article.coverColor }}>
        <span className="text-xs uppercase tracking-widest text-gray-500 font-semibold">Image à venir</span>
      </div>
      <div className="p-5 flex flex-col gap-3 flex-1">
        <div className="flex gap-2 flex-wrap">
          {article.categories.map((cat, i) => (
            <span key={cat} className="badge text-white" style={{ background: article.categoryColors[i] + '33', border: `1px solid ${article.categoryColors[i]}55`, color: article.categoryColors[i] }}>
              {cat}
            </span>
          ))}
        </div>
        <h3 className="font-semibold text-white text-sm leading-snug group-hover:text-violet-400 transition-colors">{article.title}</h3>
        <p className="text-xs text-gray-400 leading-relaxed flex-1">{article.excerpt}</p>
        <div className="flex items-center justify-between text-xs text-gray-500 mt-auto pt-2 border-t border-[#1e1e3a]">
          <span>{article.author}</span>
          <span>{article.date}</span>
        </div>
      </div>
    </Link>
  )
}

export default function Home() {
  const displayedArticles = articles.filter(a => !a.warning).slice(0, 3)

  return (
    <div className="flex flex-col">

      {/* =================== HERO =================== */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 pt-16">
        <div className="flex flex-col items-center gap-6 animate-fade-in-up">
          <ServerStatus players={42} />

          <h1 className="font-title font-black uppercase leading-none tracking-widest">
            <span className="block text-white" style={{ fontSize: 'clamp(3rem, 10vw, 6rem)' }}>UNIVERSE</span>
            <span className="block text-violet-400" style={{ fontSize: 'clamp(3rem, 10vw, 6rem)' }}>REBORN</span>
          </h1>

          <p className="text-gray-300 text-lg max-w-xl leading-relaxed">
            Redécouvrez l’aventure <span className="text-white font-semibold">LEGO Universe</span> sur notre serveur
            communautaire. Construisez, explorez et combattez le Maelstrom !
          </p>

          <div className="flex flex-wrap gap-3 justify-center mt-2">
            <Link to="/register" className="btn-primary btn-glow">
              <Gamepad2 size={16} /> Rejoindre l’aventure
            </Link>
            <Link to="/guide" className="btn-secondary">
              Comment jouer
            </Link>
          </div>
        </div>

        {/* Fleche scroll */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce text-gray-600">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
        </div>
      </section>

      {/* =================== STATS =================== */}
      <section className="py-16 border-y border-[#1e1e3a] bg-[#0d0d1a]/60">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-[#1e1e3a]">
            <StatCard icon={Users}     value={1248} label="Joueurs inscrits" color="#8b5cf6" />
            <StatCard icon={Gamepad2}  value={42}   label="En ligne"         color="#22c55e" />
            <StatCard icon={Swords}    value={3721} label="Personnages"       color="#3b82f6" />
            <StatCard icon={Clock}     value={8760} label="Heures d’uptime"   color="#f97316" />
          </div>
        </div>
      </section>

      {/* =================== MONDES =================== */}
      <section className="py-20">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="section-title">
              Explorez les <span>Mondes</span>
            </h2>
            <p className="text-gray-400 mt-3 text-sm">9 mondes originaux de LEGO Universe, fidèlement reconstitués</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {worlds.map(w => <WorldCard key={w.id} world={w} />)}
          </div>
        </div>
      </section>

      {/* =================== ACTUALITES =================== */}
      <section className="py-20 bg-[#0d0d1a]/40">
        <div className="container-custom">
          <div className="flex items-center justify-between mb-12">
            <h2 className="section-title">
              Dernières <span>Actualités</span>
            </h2>
            <Link to="/news" className="flex items-center gap-1.5 text-sm text-violet-400 hover:text-violet-300 transition-colors font-semibold">
              Tout voir <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {displayedArticles.map(a => <ArticleCard key={a.slug} article={a} />)}
          </div>
        </div>
      </section>

      {/* =================== DISCORD CTA =================== */}
      <section className="py-20 section-gradient">
        <div className="container-custom text-center flex flex-col items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-[#5865F2]/20 border border-[#5865F2]/30 flex items-center justify-center">
            <MessageCircle size={32} className="text-[#5865F2]" />
          </div>
          <h2 className="section-title">
            Rejoignez notre <span>Discord</span>
          </h2>
          <p className="text-gray-400 max-w-lg text-sm leading-relaxed">
            Obtenez votre Play Key, suivez les dernières nouvelles, participez aux événements et
            rencontrez la communauté francophone LEGO Universe.
          </p>
          <a href="#" className="btn-primary" style={{ background: 'linear-gradient(135deg, #5865F2, #4752C4)' }}>
            <MessageCircle size={16} /> Rejoindre le Discord
          </a>
        </div>
      </section>

    </div>
  )
}
