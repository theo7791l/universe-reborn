import { Code2, Shield, Server, Megaphone } from 'lucide-react'

export const team = [
  {
    id: 1,
    pseudo: 'AdminReborn',
    role: 'Fondateur & Développeur',
    icon: Code2,
    color: '#7c3aed',
    description: 'A l’origine du projet Universe Reborn. Gère l’infrastructure, le développement et la vision générale du serveur.',
  },
  {
    id: 2,
    pseudo: 'ModChief',
    role: 'Modérateur en Chef',
    icon: Shield,
    color: '#22c55e',
    description: 'Veille au respect des règles et au bien-être de la communauté. Premier point de contact pour les joueurs.',
  },
  {
    id: 3,
    pseudo: 'BackendDev',
    role: 'Développeur Backend',
    icon: Server,
    color: '#3b82f6',
    description: 'Maintient l’infrastructure serveur DarkflameServer, gère les mises à jour et résout les problèmes techniques.',
  },
  {
    id: 4,
    pseudo: 'CommunityMgr',
    role: 'Community Manager',
    icon: Megaphone,
    color: '#f97316',
    description: 'Anime la communauté, organise les événements et gère la communication sur Discord et les réseaux.',
  },
]
