import { Heart, Github, AlertTriangle } from 'lucide-react'
import PageHero from '../components/PageHero.jsx'
import { team } from '../data/team.js'

const TIMELINE = [
  { year: '2023',    side: 'left',  title: 'Découverte',         text: 'Découverte de DarkflameServer, première installation et tests sur une machine locale.' },
  { year: '2024 T1', side: 'right', title: 'Naissance du projet', text: "Décision de lancer Universe Reborn. Constitution de l'équipe fondatrice et mise en place de l'infrastructure." },
  { year: '2024 T3', side: 'left',  title: 'Beta privée',         text: "Premier serveur de test opérationnel. Ouverture d'une bêta fermée pour les premiers testeurs volontaires." },
  { year: '2025',    side: 'right', title: 'Site communautaire',   text: 'Développement du site web et du panel de gestion. Affinage du gameplay et correction des bugs majeurs.' },
  { year: '2026',    side: 'left',  title: 'Lancement public',     text: "Ouverture officielle d'Universe Reborn au public francophone. Rejoignez l'aventure !" },
]

function TeamCard({ member }) {
  const Icon = member.icon
  return (
    <div className="card p-6 flex flex-col items-center text-center gap-3">
      <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: member.color + '22', border: `2px solid ${member.color}55` }}>
        <Icon size={24} style={{ color: member.color }} />
      </div>
      <div>
        <p className="font-title text-xs uppercase tracking-widest font-bold" style={{ color: member.color }}>{member.role}</p>
        <h3 className="text-white font-bold text-sm mt-0.5">{member.pseudo}</h3>
      </div>
      <p className="text-xs text-gray-400 leading-relaxed">{member.description}</p>
    </div>
  )
}

export default function About() {
  return (
    <div>
      <PageHero
        titleWhite="À Propos d'"
        titleColored="Universe Reborn"
        subtitle="Un projet communautaire francophone pour faire revivre LEGO Universe."
      />

      {/* ====== NOTRE HISTOIRE ====== */}
      <section className="py-16">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="flex flex-col gap-5 text-gray-300 text-sm leading-relaxed">
              <h2 className="section-title text-left">
                Notre <span>Histoire</span>
              </h2>
              <p>
                <span className="text-white font-semibold">LEGO Universe</span> était un MMO développé par NetDevil
                et publié par le Groupe LEGO en octobre 2010. Unique en son genre, il mêlait construction
                libre, aventure et multijoueur massif dans un univers LEGO vivant.
              </p>
              <p>
                En janvier 2012, après seulement 15 mois d&apos;exploitation, le jeu ferme ses portes
                pour des raisons financières. Des milliers de joueurs se retrouvent sans leur monde
                favori, laissant une communauté nostalgique orpheline.
              </p>
              <p>
                C&apos;est là que <span className="text-violet-400 font-semibold">DarkflameServer</span> entre en scène :
                un émulateur open-source développé par la communauté, sous licence AGPLv3, qui permet
                de faire tourner un serveur fidèle au jeu original. Universe Reborn est né de la volonté
                de réunir la communauté francophone autour de ce projet.
              </p>
            </div>

            {/* Illustration */}
            <div className="flex items-center justify-center">
              <div className="w-48 h-48 rounded-full bg-violet-600/10 border border-violet-500/20 flex items-center justify-center">
                <Heart size={64} className="text-violet-400" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====== DARKFLAMESERVER ====== */}
      <section className="py-12 bg-[#0d0d1a]/60 border-y border-[#1e1e3a]">
        <div className="container-custom flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col gap-2">
            <h3 className="font-title text-lg font-black uppercase tracking-wider text-white">
              Propulsé par <span className="text-violet-400">DarkflameServer</span>
            </h3>
            <p className="text-sm text-gray-400 max-w-lg">
              Universe Reborn fonctionne entièrement grâce à DarkflameServer, un émulateur open-source
              du serveur officiel de LEGO Universe, maintenu bénévolement par la communauté mondiale.
            </p>
          </div>
          <a
            href="https://github.com/DarkflameUniverse/DarkflameServer"
            target="_blank"
            rel="noreferrer"
            className="btn-outline-violet shrink-0"
          >
            <Github size={16} /> Voir sur GitHub
          </a>
        </div>
      </section>

      {/* ====== L'ÉQUIPE ====== */}
      <section className="py-20">
        <div className="container-custom">
          <h2 className="section-title text-center mb-12">L&apos;<span>Équipe</span></h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map(m => <TeamCard key={m.id} member={m} />)}
          </div>
        </div>
      </section>

      {/* ====== TIMELINE ====== */}
      <section className="py-20 bg-[#0d0d1a]/40">
        <div className="container-custom">
          <h2 className="section-title text-center mb-16">Timeline du <span>Projet</span></h2>
          <div className="relative">
            {/* Ligne verticale */}
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-[#1e1e3a] -translate-x-1/2 hidden md:block" />

            <div className="flex flex-col gap-8">
              {TIMELINE.map((item, i) => (
                <div
                  key={i}
                  className={`relative flex flex-col md:flex-row items-center gap-4 ${
                    item.side === 'right' ? 'md:flex-row-reverse' : ''
                  }`}
                >
                  {/* Contenu */}
                  <div className="w-full md:w-5/12">
                    <div className="card p-5">
                      <p className="text-violet-400 text-xs font-bold uppercase tracking-widest mb-1">{item.year}</p>
                      <h3 className="text-white font-bold text-sm mb-2">{item.title}</h3>
                      <p className="text-gray-400 text-xs leading-relaxed">{item.text}</p>
                    </div>
                  </div>

                  {/* Point central */}
                  <div className="hidden md:flex w-2/12 justify-center">
                    <div className="w-4 h-4 rounded-full bg-violet-600 border-2 border-violet-400 z-10" />
                  </div>

                  {/* Espace vide */}
                  <div className="hidden md:block w-5/12" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ====== DISCLAIMER ====== */}
      <section className="py-12">
        <div className="container-custom">
          <div className="border border-orange-500/30 bg-orange-500/5 rounded-lg p-6 flex gap-4">
            <AlertTriangle size={24} className="text-orange-400 shrink-0 mt-0.5" />
            <div className="flex flex-col gap-2">
              <h3 className="text-orange-400 font-bold text-sm uppercase tracking-wider">Avis de non-affiliation</h3>
              <p className="text-gray-400 text-xs leading-relaxed">
                Universe Reborn est un projet fan non-officiel. Ce serveur <strong className="text-white">n&apos;est pas affilié</strong> au
                Groupe LEGO, NetDevil, Gazillion Entertainment ou Warner Bros. Interactive Entertainment.
                LEGO et LEGO Universe sont des marques déposées du Groupe LEGO. Ce projet est opéré bénévolement
                par des fans, sans aucun but lucratif.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
