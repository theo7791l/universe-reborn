import {
  Rocket, Leaf, Building2, PawPrint,
  TreePine, Mountain, Tower, Sword, Flame
} from 'lucide-react'

export const worlds = [
  {
    id: 'venture-explorer',
    name: 'Venture Explorer',
    icon: Rocket,
    players: 12,
    description: 'Le vaisseau spatial où commence l’aventure. Ton premier pas dans LEGO Universe.',
    color: '#3b82f6',
  },
  {
    id: 'avant-gardens',
    name: 'Avant Gardens',
    icon: Leaf,
    players: 28,
    description: 'Les jardins envahis par le Maelstrom. Libère les tourelles et sauve les astronautes.',
    color: '#22c55e',
  },
  {
    id: 'nimbus-station',
    name: 'Nimbus Station',
    icon: Building2,
    players: 35,
    description: 'Le hub central d’Universe. Rejoins une faction et explore les arenas de combat.',
    color: '#7c3aed',
  },
  {
    id: 'pet-cove',
    name: 'Pet Cove',
    icon: PawPrint,
    players: 9,
    description: 'Apprivoise et entraîne tes animaux de compagnie LEGO dans ce monde paisible.',
    color: '#f97316',
  },
  {
    id: 'gnarled-forest',
    name: 'Gnarled Forest',
    icon: TreePine,
    players: 19,
    description: 'Une forêt sinistre peuplée de pirates. Parfait pour la Venture League.',
    color: '#84cc16',
  },
  {
    id: 'forbidden-valley',
    name: 'Forbidden Valley',
    icon: Mountain,
    players: 23,
    description: 'Le repaire des ninjas et des dragons du Maelstrom. Territoire de la Paradox.',
    color: '#ef4444',
  },
  {
    id: 'nexus-tower',
    name: 'Nexus Tower',
    icon: Tower,
    players: 31,
    description: 'Le quartier général des factions. Accède aux missions les plus dangereuses.',
    color: '#eab308',
  },
  {
    id: 'ninjago-monastery',
    name: 'Ninjago Monastery',
    icon: Sword,
    players: 14,
    description: 'Maîtrise les arts du Spinjitzu dans ce monaétaire légendaire.',
    color: '#06b6d4',
  },
  {
    id: 'crux-prime',
    name: 'Crux Prime',
    icon: Flame,
    players: 17,
    description: 'Le champ de bataille ultime. Réservé aux joueurs expérimentés.',
    color: '#f43f5e',
  },
]
