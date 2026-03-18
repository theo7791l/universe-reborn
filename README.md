# 🧱 Universe Reborn

> Serveur communautaire LEGO Universe basé sur [DarkflameServer](https://github.com/DarkflameUniverse/DarkflameServer)

**Universe Reborn** est un projet fan non-officiel qui permet de redécouvrir LEGO Universe sur un serveur communautaire privé.

## ⚠️ Avertissement légal
Ce projet est un projet fan non-officiel. Il n'est pas affilié au Groupe LEGO. LEGO® et LEGO® Universe sont des marques déposées du Groupe LEGO. Les joueurs doivent posséder une copie légale originale du jeu.

## 🏗️ Structure du projet

```
universe-reborn/
├── app/                    # Application Flask
│   ├── __init__.py         # Factory Flask
│   ├── models.py           # Modèles SQLAlchemy
│   ├── accounts.py         # Authentification
│   ├── characters.py       # Personnages
│   ├── play_keys.py        # Clés d'accès
│   ├── moderation.py       # Modération
│   ├── admin.py            # Panel admin
│   ├── api.py              # API REST
│   ├── news.py             # Actualités
│   ├── vitrine.py          # Pages vitrine
│   ├── static/             # CSS, JS, images
│   └── templates/          # Templates Jinja2
├── migrations/             # Migrations DB
├── requirements.txt        # Dépendances Python
├── wsgi.py                 # Point d'entrée
├── config.py               # Configuration
├── Dockerfile
├── docker-compose.yml
├── nginx.conf
└── .env.example
```

## 🚀 Installation rapide

```bash
# 1. Cloner le repo
git clone https://github.com/theo7791l/universe-reborn.git
cd universe-reborn

# 2. Créer l'environnement virtuel
python3 -m venv venv
source venv/bin/activate

# 3. Installer les dépendances
pip install -r requirements.txt

# 4. Configurer l'environnement
cp .env.example .env
# Éditer .env avec tes valeurs

# 5. Initialiser la base de données
flask db upgrade

# 6. Lancer le serveur de développement
flask run
```

## 🛠️ Stack technique
- **Backend** : Flask (Python) + SQLAlchemy + Flask-Login
- **Frontend** : HTML5 + CSS3 + JavaScript (GSAP, Three.js, particles.js)
- **Base de données** : MySQL/MariaDB
- **Déploiement** : Nginx + Gunicorn + Docker

## 📄 Licence
MIT License — Voir [LICENSE](LICENSE)
