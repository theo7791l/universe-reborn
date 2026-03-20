# Universe Reborn — Frontend

> Serveur communautaire francophone dédié à la renaissance de **LEGO Universe**,  
> basé sur [DarkflameServer](https://github.com/DarkflameUniverse/DarkflameServer) (AGPLv3).

⚠️ **Projet fan non-officiel.** Universe Reborn n'est pas affilié au Groupe LEGO, NetDevil, Gazillion Entertainment ou Warner Bros. Interactive Entertainment. LEGO et LEGO Universe sont des marques déposées du Groupe LEGO.

---

## Stack technique

| Outil | Version |
|---|---|
| React | 18.x |
| Vite | 5.x |
| React Router | 6.x |
| Tailwind CSS | 3.x |
| Lucide React | 0.378.x |

## Installation

```bash
cd frontend
npm install
npm run dev
```

## Build & déploiement

```bash
npm run build
```

Le dossier `dist/` est automatiquement déployé sur GitHub Pages via GitHub Actions à chaque push sur `main`.

URL : **https://theo7791l.github.io/universe-reborn/**

## Structure

```
frontend/
├── public/            # favicon, robots.txt, 404.html (SPA hack)
├── src/
│   ├── components/    # Navbar, Footer, StarField, PageHero, ServerStatus
│   ├── pages/         # Home, About, Guide, Gallery, News, Leaderboard...
│   ├── data/          # Données mockées (worlds, news, leaderboard, team)
│   ├── hooks/         # useCountUp
│   ├── App.jsx        # Router principal
│   ├── main.jsx       # Entry point
│   └── index.css      # CSS global + animations
├── index.html
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── package.json
```

## Licence

Code source sous licence **MIT**.  
DarkflameServer est sous licence **AGPLv3**.
