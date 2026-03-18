# Universe Reborn — Site Web

Site communautaire fan pour le serveur privé LEGO® Universe basé sur [DarkflameServer](https://github.com/DarkflameUniverse/DarkflameServer).

> **Projet non-officiel et non-affilié au Groupe LEGO®.**

---

## 🚀 Déploiement sur Pterodactyl

### 1. Importer l’egg

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

### 3. Démarrage

Le script `start.sh` est exécuté automatiquement par Pterodactyl. Il :
- Installe les dépendances Python
- Initialise la base de données
- Lance **Gunicorn** sur le port configuré

---

## 💻 Développement local

```bash
git clone https://github.com/theo7791l/universe-reborn.git
cd universe-reborn
pip install -r requirements.txt
cp .env.example .env
# Éditez .env avec vos valeurs
FLASK_ENV=development python wsgi.py
```

---

## 📁 Structure

```
universe-reborn/
├── app/
│   ├── __init__.py        # Factory Flask
│   ├── models.py          # Modèles SQLAlchemy
│   ├── vitrine.py         # Pages publiques
│   ├── accounts.py        # Authentification
│   ├── admin.py           # Panel admin
│   ├── news.py            # Actualités
│   ├── api.py             # API REST
│   ├── static/            # CSS, JS, images
│   └── templates/         # Templates Jinja2
├── egg-universe-reborn.json  # Egg Pterodactyl
├── start.sh                  # Script de démarrage
├── wsgi.py                   # Point d'entrée Gunicorn
├── requirements.txt
├── config.py
└── .env.example
```

---

## ⚖️ Légalité

Universe Reborn est un projet **non-officiel, non-commercial et non-affilié** au Groupe LEGO®. Aucun fichier du jeu original n’est distribué. LEGO® et LEGO® Universe sont des marques déposées du Groupe LEGO®.
