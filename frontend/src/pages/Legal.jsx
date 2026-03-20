import { Shield, Eye, FileText } from 'lucide-react'
import PageHero from '../components/PageHero.jsx'

const SECTIONS = [
  {
    icon: Shield,
    title: 'Disclaimer — Avis de non-affiliation',
    borderColor: 'border-orange-500/40',
    iconColor: 'text-orange-400',
    content: [
      'Universe Reborn est un projet fan non-officiel. Ce serveur n’est PAS affilié au Groupe LEGO, NetDevil, Gazillion Entertainment ou Warner Bros. Interactive Entertainment.',
      'LEGO® et LEGO Universe® sont des marques déposées du Groupe LEGO. Toute référence à ces marques est uniquement dans un but informatif et communautaire.',
      'Ce projet est opéré bénévolement par des fans, sans aucun but lucratif. Aucune transaction financière n’est effectuée. Le serveur est basé sur DarkflameServer, un logiciel open-source sous licence AGPLv3.',
    ],
  },
  {
    icon: Eye,
    title: 'Politique de confidentialité',
    borderColor: 'border-blue-500/40',
    iconColor: 'text-blue-400',
    content: [
      'Données collectées : pseudo, adresse email, mot de passe (haché via bcrypt), données de jeu (personnages, progression, statistiques).',
      'Usage : ces données sont utilisées exclusivement pour faire fonctionner le serveur de jeu et identifier les joueurs. Elles ne sont jamais vendues ni partagées avec des tiers.',
      'Vos données sont stockées sur nos serveurs privés. Vous pouvez demander la suppression de votre compte à tout moment en contactant l’équipe via Discord.',
    ],
  },
  {
    icon: FileText,
    title: "Conditions d'utilisation",
    borderColor: 'border-violet-500/40',
    iconColor: 'text-violet-400',
    content: [
      'En jouant sur Universe Reborn, vous acceptez de respecter tous les joueurs sans discrimination, et de ne pas utiliser de logiciels de triche ou d’exploit.',
      'Les bugs et failles de sécurité doivent être signalés à l’équipe via Discord et non exploités. Tout abus entraînera une sanction pouvant aller jusqu’au bannissement permanent.',
      'L’équipe se réserve le droit de modifier ces conditions à tout moment. Les joueurs seront informés via les canaux officiels (Discord, site web).',
    ],
  },
]

export default function Legal() {
  return (
    <div>
      <PageHero
        titleWhite="Mentions"
        titleColored="Légales"
        subtitle="Informations légales, confidentialité et conditions d'utilisation."
      />
      <section className="py-12">
        <div className="container-custom max-w-3xl flex flex-col gap-6">
          {SECTIONS.map(({ icon: Icon, title, borderColor, iconColor, content }) => (
            <div key={title} className={`card p-7 border ${borderColor}`}>
              <div className="flex items-center gap-3 mb-5">
                <Icon size={22} className={iconColor} />
                <h2 className="font-title text-sm font-black uppercase tracking-widest text-white">{title}</h2>
              </div>
              <div className="flex flex-col gap-3">
                {content.map((para, i) => (
                  <p key={i} className="text-sm text-gray-400 leading-relaxed">{para}</p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
