# Universe Reborn — Site Web & Dashboard

Site communautaire fan pour le serveur privé LEGO® Universe basé sur [DarkflameServer](https://github.com/DarkflameUniverse/DarkflameServer).

> **Projet non-officiel et non-affilié au Groupe LEGO®.**

---

## Fonctionnalités

### Site Vitrine
- Page d'accueil avec compteur de joueurs en live
- Nouvelles & annonces (CRUD admin)
- Page À propos & guide d'installation
- Galerie de captures d'écran
- Système d'authentification JWT

### Dashboard Joueur (parité NexusDashboard)
- **Profil** : statistiques, rang, monnaie, activité récente
- **Personnages** : liste, infos détaillées, inventaire, équipement
- **Propriétés** : gestion des propriétés, modèles, statuts
- **Amis** : liste d'amis, statut en ligne
- **Contacter le staff** : formulaire d'envoi de mail

### Panel Admin
- **Tableau de bord** : stats globales, graphiques en temps réel
- **Gestion joueurs** : recherche, ban, unban, édition de compte
- **Modération** : ban/unban/mute, signalements (Reports), Journal d'audit
- **Personnages** : inspection, modification de stats
- **Propriétés** : approbation/suppression
- **Actualités** : création/édition/suppression
- **Paramètres serveur** : configuration dynamique

---

## Stack Technique

| Couche | Technologie |
|--------|-------------|
| Backend | Python 3.11 + Flask + SQLAlchemy |
| Base de données | MariaDB 10.11 |
| Frontend | React 18 + Vite + Tailwind CSS |
| Serveur web | Nginx (reverse proxy) |
| Auth | JWT (Flask-JWT-Extended) |
| Déploiement | Docker Compose |

---

## Déploiement Docker (Production)

### Prérequis
- Docker 24+
- Docker Compose 2.20+

### Installation

```bash
git clone https://github.com/theo7791l/universe-reborn.git
cd universe-reborn

# Copier et éditer les variables d'environnement
cp .env.example .env
nano .env

# Construire le frontend
docker compose --profile build up frontend-builder

# Lancer tous les services
docker compose up -d
```

### Variables d'environnement (`.env`)

```env
# Flask
FLASK_ENV=production
SECRET_KEY=votre-clé-secrète-32-chars

# Base de données
DB_ROOT_PASSWORD=rootpassword
DB_NAME=universe_reborn
DB_USER=ur_user
DB_PASSWORD=urpassword
DATABASE_URL=mysql+pymysql://ur_user:urpassword@db/universe_reborn

# Frontend
VITE_API_URL=http://web:8000
VITE_SITE_NAME=Universe Reborn

# DarkflameServer
DLS_HOST=localhost
DLS_CDCLIENT_PATH=/path/to/cdclient.fdb
```

---

## Développement Local

### Backend (Flask)

```bash
git clone https://github.com/theo7791l/universe-reborn.git
cd universe-reborn
pip install -r requirements.txt
cp .env.example .env
# Éditez .env avec vos valeurs
FLASK_ENV=development python wsgi.py
```

### Frontend (React + Vite)

```bash
cd frontend
npm install
cp .env.example .env
# Éditez VITE_API_URL=http://localhost:8000
npm run dev
```

---

## Déploiement sur Pterodactyl

### 1. Importer l'egg

1. Dans Pterodactyl Admin → **Nests** → **Import Egg**
2. Uploader le fichier `egg-universe-reborn.json`
3. Créer un nouveau serveur en sélectionnant cet egg

### 2. Variables à configurer dans Pterodactyl

| Variable | Description | Exemple |
|---|---|---|
| `PORT` | Port d'écoute | `8000` |
| `FLASK_ENV` | Environnement | `production` |
| `GUNICORN_WORKERS` | Nb workers | `2` |
| `SECRET_KEY` | Clé secrète Flask | clé aléatoire 32+ chars |
| `DATABASE_URL` | URL BDD | `sqlite:///universe_reborn.db` |

---

## Structure du Projet

```
universe-reborn/
├── app/                    # Application Flask
│   ├── __init__.py         # Factory Flask
│   ├── models.py           # Modèles SQLAlchemy
│   ├── vitrine.py          # Pages publiques
│   ├── accounts.py         # Authentification
│   ├── admin.py            # Panel admin
│   ├── news.py             # Actualités
│   ├── api.py              # API REST
│   ├── static/             # CSS, JS, images
│   └── templates/          # Templates Jinja2
├── frontend/               # Application React
│   ├── src/
│   │   ├── api/            # Client axios
│   │   ├── components/     # Composants réutilisables
│   │   ├── context/        # AuthContext
│   │   ├── hooks/          # Hooks custom
│   │   ├── pages/          # Pages (vitrine + dashboard)
│   │   └── App.jsx
│   ├── .env.example
│   ├── vite.config.js
│   └── package.json
├── docker-compose.yml
├── Dockerfile
├── nginx.conf
├── requirements.txt
├── .env.example
└── README.md
```

---

## Licence

MIT — Voir [LICENSE](LICENSE)

> Projet non-affilié à LEGO®. LEGO Universe est une marque déposée de The LEGO Group.
