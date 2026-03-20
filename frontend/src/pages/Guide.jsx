import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Monitor, Download, UserPlus, Settings, Play,
  ChevronDown, ChevronUp
} from 'lucide-react'
import PageHero from '../components/PageHero.jsx'

const STEPS = [
  {
    num: 1,
    icon: Monitor,
    title: 'Obtenir le client LEGO Universe',
    text: 'Vous devez posséder une copie légale du client original de LEGO Universe. Renseignez-vous auprès de la communauté pour les sources autorisées.',
    note: '~5 Go · Compatible Windows 7 / 10 / 11 · macOS & Linux via Wine',
  },
  {
    num: 2,
    icon: Download,
    title: 'Télécharger le boot.cfg',
    text: 'Téléchargez notre fichier de configuration préconfigurée pointant vers les serveurs Universe Reborn.',
    note: 'Placez-le dans le dossier racine du client LEGO Universe et remplacez l\'existant.',
  },
  {
    num: 3,
    icon: UserPlus,
    title: 'Créer votre compte',
    text: 'Inscrivez-vous sur ce site avec votre pseudo, email, mot de passe et votre Play Key obtenue via notre Discord.',
    note: 'La Play Key est distribuée gratuitement par les admins sur le serveur Discord officiel.',
  },
  {
    num: 4,
    icon: Settings,
    title: 'Configurer et lancer',
    text: 'Lancez le client LEGO Universe. La connexion vers Universe Reborn se fait automatiquement grâce au boot.cfg.',
    note: 'En cas de problème : vérifiez le boot.cfg et autorisez les connexions sortantes dans votre pare-feu.',
  },
  {
    num: 5,
    icon: Play,
    title: 'Jouer !',
    text: 'Connectez-vous avec vos identifiants, créez votre personnage et choisissez votre faction !',
    note: '4 personnages max par compte · Factions : Sentinel, Assembly, Venture League, Paradox',
  },
]

const FAQ = [
  {
    q: 'Est-ce légal ?',
    a: 'Oui, pour un usage personnel. DarkflameServer est sous licence AGPLv3 (open-source). Vous devez posséder le client officiel. Le serveur est opéré bénévolement, sans but lucratif.',
  },
  {
    q: 'Le jeu est-il gratuit ?',
    a: 'Le serveur Universe Reborn est entièrement gratuit. Cependant, vous devez posséder le client original de LEGO Universe.',
  },
  {
    q: 'Quelle configuration est requise ?',
    a: 'Windows 7 / 10 / 11 (ou macOS/Linux via Wine), environ 5 Go d\'espace disque et une connexion internet stable.',
  },
  {
    q: 'Comment obtenir une Play Key ?',
    a: 'Rejoignez notre serveur Discord officiel et demandez une Play Key à un administrateur. Les clés sont distribuées gratuitement.',
  },
  {
    q: 'Le jeu est-il complet ?',
    a: 'La grande majorité des mondes, missions et fonctionnalités originaux sont disponibles. Quelques contenus mineurs sont encore en cours d\'implémentation.',
  },
  {
    q: 'Puis-je jouer avec des amis ?',
    a: 'Oui ! Le multijoueur est complet. Vous pouvez rejoindre des parties, former des équipes, créer des guildes et explorer les mondes ensemble.',
  },
]

function StepItem({ step, isLast }) {
  const Icon = step.icon
  return (
    <div className="flex gap-6">
      {/* Colonne gauche : numéro + ligne */}
      <div className="flex flex-col items-center">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-600 to-purple-800 flex items-center justify-center shrink-0 shadow-lg shadow-violet-500/20">
          <Icon size={18} className="text-white" />
        </div>
        {!isLast && <div className="w-px flex-1 bg-[#1e1e3a] mt-2" />}
      </div>
      {/* Contenu */}
      <div className={`pb-10 flex flex-col gap-2 ${isLast ? '' : ''}`}>
        <div className="flex items-center gap-2">
          <span className="text-violet-400 text-xs font-bold uppercase tracking-widest">Étape {step.num}</span>
        </div>
        <h3 className="text-white font-bold">{step.title}</h3>
        <p className="text-gray-400 text-sm leading-relaxed">{step.text}</p>
        <p className="text-xs text-gray-500 bg-[#0d0d1a] border border-[#1e1e3a] rounded px-3 py-2 mt-1">
          💡 {step.note}
        </p>
      </div>
    </div>
  )
}

function FaqItem({ item }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-[#1e1e3a] rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left bg-[#12121f] hover:bg-[#1a1a2e] transition-colors"
      >
        <span className="text-sm font-semibold text-white">{item.q}</span>
        {open
          ? <ChevronUp size={16} className="text-violet-400 shrink-0" />
          : <ChevronDown size={16} className="text-gray-400 shrink-0" />}
      </button>
      {open && (
        <div className="px-5 py-4 bg-[#0d0d1a] border-t border-[#1e1e3a] animate-fade-in">
          <p className="text-sm text-gray-400 leading-relaxed">{item.a}</p>
        </div>
      )}
    </div>
  )
}

export default function Guide() {
  return (
    <div>
      <PageHero
        titleWhite="Comment"
        titleColored="Jouer"
        subtitle="Suivez ce guide pas-à-pas pour rejoindre Universe Reborn en quelques minutes."
      />

      {/* ====== ÉTAPES ====== */}
      <section className="py-16">
        <div className="container-custom max-w-2xl">
          {STEPS.map((step, i) => (
            <StepItem key={step.num} step={step} isLast={i === STEPS.length - 1} />
          ))}
        </div>
      </section>

      {/* ====== TÉLÉCHARGEMENT BOOT.CFG ====== */}
      <section className="py-12 bg-[#0d0d1a]/60 border-y border-[#1e1e3a]">
        <div className="container-custom">
          <div className="card p-8 flex flex-col md:flex-row items-center justify-between gap-6 max-w-2xl mx-auto">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center">
                <Download size={22} className="text-violet-400" />
              </div>
              <div>
                <h3 className="text-white font-bold">boot.cfg</h3>
                <p className="text-xs text-gray-400">Fichier de configuration Universe Reborn · ~1 Ko</p>
              </div>
            </div>
            <a
              href="#"
              className="btn-primary shrink-0"
              onClick={e => e.preventDefault()}
            >
              <Download size={15} /> Télécharger boot.cfg
            </a>
          </div>
        </div>
      </section>

      {/* ====== FAQ ====== */}
      <section className="py-20">
        <div className="container-custom max-w-2xl">
          <h2 className="section-title text-center mb-10">Questions <span>Fréquentes</span></h2>
          <div className="flex flex-col gap-3">
            {FAQ.map((item, i) => <FaqItem key={i} item={item} />)}
          </div>
        </div>
      </section>

      {/* ====== CTA FINAL ====== */}
      <section className="py-16 section-gradient">
        <div className="container-custom flex flex-wrap gap-4 justify-center">
          <Link to="/register" className="btn-primary"><UserPlus size={15} /> Créer un compte</Link>
          <a href="#" className="btn-secondary">Rejoindre le Discord</a>
        </div>
      </section>
    </div>
  )
}
