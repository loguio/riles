# Riles — Coach running IA adaptatif

[![CI](https://github.com/loguio/riles/actions/workflows/ci.yml/badge.svg)](https://github.com/loguio/riles/actions/workflows/ci.yml)

Riles adapte ton plan d'entraînement running à ta vraie vie : imprévus, fatigue,
semaine chargée, jours verrouillés. Le coach recalcule la semaine à partir de tes
**données réelles** (Strava / Garmin / Apple Santé), d'un **modèle de charge**
(ATL / CTL / TSB, règle des +10 %) et d'un **coach IA conversationnel**.

**Aperçu en ligne :** <https://web-riles.netlify.app/> — domaine de production
prévu : `riles.run`.

## Dépôts

Ce dépôt est un **méta-dépôt** : il orchestre trois sous-modules Git.

| Sous-module | Dépôt | Rôle | Stack |
| --- | --- | --- | --- |
| `front-riles` | [loguio/front-riles](https://github.com/loguio/front-riles) | Application mobile | Expo / React Native / TypeScript |
| `back-riles` | [loguio/back-riles](https://github.com/loguio/back-riles) | API & données | NestJS / Prisma / PostgreSQL |
| `landing-riles` | [loguio/web-riles](https://github.com/loguio/web-riles) | Landing page | HTML / CSS / JS statique (Netlify) |

## Démarrage

```bash
git clone --recurse-submodules https://github.com/loguio/riles.git
cd riles
```

Puis, par composant :

- **Application mobile** — `cd front-riles && npm install && npx expo start`
- **API** — `cd back-riles && npm install && npm run start:dev` (Swagger sur
  `http://localhost:3000/api/docs`)
- **Landing** — `cd landing-riles && npm install && npm start`

Chaque sous-module a son propre `README.md` avec le détail (variables
d'environnement, migrations, tests).

## Documentation

| Document | Contenu |
| --- | --- |
| [`ROADMAP.md`](./ROADMAP.md) | Feuille de route et suivi des phases |
| [`Cahier des Charges - Application Coach Sportif IA Adaptatif.md`](./Cahier%20des%20Charges%20-%20Application%20Coach%20Sportif%20IA%20Adaptatif.md) | Spécification produit initiale |
| [`cahier des charges suite.md`](./cahier%20des%20charges%20suite.md) | Compléments de spécification (communauté, monétisation) |
| [`DataLake.md`](./DataLake.md) | Data lake d'entraînement (anonymisation, exports) |
| [`SCALE_READINESS.md`](./SCALE_READINESS.md) | Objectif 10 000 utilisateurs (charge, coûts, SLO) |
| [`TESTING.md`](./TESTING.md) | Stratégie de tests |
| [`MARKETING_PLAYBOOK.md`](./MARKETING_PLAYBOOK.md) | Acquisition, domaine, analytics |
| [`ORCHESTRATION.md`](./ORCHESTRATION.md) | Journal d'orchestration (Phase 5B) |

## Intégration continue

Le CI du méta-dépôt vérifie deux choses :

- **`docs-lint`** — lint markdown de la documentation racine (`markdownlint-cli2`).
- **`submodules`** — les pointeurs de sous-modules sont résolvables et alignés.

Chaque sous-module exécute son propre CI (lint, type-check, tests, build).
