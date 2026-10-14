# 🗺️ Roadmap & Suivi des Tâches — Projet Riles

> Ce fichier centralise l'ensemble des tâches issues des documents de spécification ([`Cahier des Charges - Application Coach Sportif IA Adaptatif.md`](./Cahier%20des%20Charges%20-%20Application%20Coach%20Sportif%20IA%20Adaptatif.md), [`cahier des charges suite.md`](./cahier%20des%20charges%20suite.md), [`DataLake.md`](./DataLake.md)) pour suivre l'avancement étape par étape.

---

## ✅ Socle Déjà Réalisé (MVP Vertical Slice)

- [x] **Architecture Front-end (React Native / Expo Router)** : Navigation 4 onglets (`Accueil`, `Calendrier`, `Communauté`, `Profil`), écran `Chat` et tunnel `Onboarding` en 5 étapes.
- [x] **Internationalisation & Mode Hors-Ligne** : Traductions FR/EN (`i18next`) et fallback transparent sur données locales dans tous les services front.
- [x] **Architecture Back-end (NestJS / Prisma / PostgreSQL)** : Modules `Auth`, `Users`, `Onboarding`, `Workouts`, `Coach`, `Webhooks`, `DataLake` + documentation Swagger.
- [x] **Authentification Hybride Supabase Auth / JWT** : Guard global `SupabaseAuthGuard`, auto-provisioning PostgreSQL et mode démo/test sans friction.
- [x] **Data Lake (Socle v1)** : `DataLakeService` avec anonymisation SHA-256, export `.jsonl` partitionné par date (`raw/year=YYYY/MM/DD/...`) sur Supabase Storage (`training-datalake`) et tests unitaires.

---

## ✅ Phase 1 : Moteur LLM, IA de Reformulation & Garde-fous *(Terminé)*

> **Décisions d'architecture validées & implémentées :**
>
> - **Passerelle Multi-Provider (100 % compatible OmniRoute / OpenRouter / Gemini 3.5–3.8 Flash Free / Groq)** : Client standard OpenAI-compatible dans NestJS ([`LlmService`](./back-riles/src/modules/llm/llm.service.ts)) configurable via `LLM_BASE_URL`, `LLM_API_KEY`, `LLM_LIGHT_MODEL` (`gemini-3.5-flash-lite`) et `LLM_PRO_MODEL` (`gemini-3.8-flash`). Peut pointer sur **OmniRoute (`http://localhost:20128/v1`)** ou sur les tiers gratuits cloud.
> - **Mode d'exécution :** **Hybride intelligent** (appel LLM réel si configuré, sinon fallback transparent sur le moteur déterministe/règles amélioré).
> - **Centralisation dans le Chat Coach (`/chat`) — Pas d'interface séparée ni de bouton de validation manuel :**
>   - Toute discussion avec le coach (adapter une séance, signaler une fatigue, **ou ajouter/consulter une règle de vie**) se fait dans le **Chat principal** ([`chat.tsx`](./front-riles/app/chat.tsx)).
>   - **Reformulation 100 % automatique à l'envoi :** Dès que l'utilisateur envoie son message (dans l'Onboarding Étape 2 ou dans le Chat), l'IA reformule et enregistre automatiquement l'objectif ou la `LifeRule` sans bouton de validation intermédiaire.
> - **Calculateur d'Allures Physiologiques (`computePacesFromRecentPerformance`) :**
>   - **JAMAIS calculé à partir de l'objectif rêvé.**
>   - Les allures d'entraînement (Endurance Z2, Marathon Z3, Seuil Z4, VMA Z5) sont calculées uniquement à partir des **séances récentes (allure observée + fréquence cardiaque associée)** ou des zones/seuils importés depuis **Strava / Garmin**.
> - **Éligibilité Contextuelle (`evaluateGoalEligibility`) :**
>   - Aucun blocage arbitraire : un objectif ambitieux (ex. *Ultra 180 km en 2 mois*) est **100 % accepté** si l'athlète est déjà en milieu de prépa / possède le volume adéquat (ou si ses données ne sont pas encore synchronisées). L'alerte pédagogique ne se déclenche que si l'historique réel prouve un écart dangereux.

### 1.1. Architecture & Passerelle LLM (`LlmModule` / `CoachModule`)

- [x] Créer [`LlmModule`](./back-riles/src/modules/llm/llm.module.ts) & [`LlmService`](./back-riles/src/modules/llm/llm.service.ts) compatible **OmniRoute (`http://localhost:20128/v1`)**, **Gemini 3.5 / 3.8 Flash Free Tier**, OpenRouter et Groq (Variables `.env` : `LLM_BASE_URL`, `LLM_API_KEY`, `LLM_LIGHT_MODEL`, `LLM_PRO_MODEL` + fallback local automatique).
- [x] Mettre en place le **routage bi-modèle à coût quasi-nul (0 € en Free Tier / OmniRoute)** :
  - `LLM_LIGHT_MODEL` (`gemini-3.5-flash-lite`) : pour le chat courant, l'extraction de règles de vie, la reformulation automatique et le débrief RPE.
  - `LLM_PRO_MODEL` (`gemini-3.8-flash`) : pour la génération/replanification complexe et le diagnostic.
- [x] Implémenter le **Context Builder + Calculateur d'allures basé sur les séances récentes & FC (`computePacesFromRecentPerformance`)** dans [`CoachService.processMessage`](./back-riles/src/modules/coach/coach.service.ts).
- [x] Forcer les **Structured Outputs (JSON strict)** avec nettoyage robuste pour supporter tous les modèles.

### 1.2. IA de Reformulation Automatique & Règles de Vie dans le Chat (`cahier des charges suite.md` - Point 5)

- [x] **Reformulation automatique à l'envoi (Onboarding Étape 2)** : Dès que l'utilisateur valide l'étape 2 dans [`onboarding.tsx`](./front-riles/app/onboarding.tsx), l'IA reformule son objectif et extrait ses `LifeRule`s en arrière-plan sans bouton manuel superflu.
- [x] **Reformulation & enregistrement automatiques des `LifeRule`s dans le Chat (`/chat`)** : Lorsqu'un utilisateur écrit une contrainte au coach (ex. *« Je ne peux pas courir le jeudi »*), [`CoachService`](./back-riles/src/modules/coach/coach.service.ts) et [`AppContext`](./front-riles/src/context/AppContext.tsx) la reformulent et l'ajoutent automatiquement au profil.

### 1.3. Garde-fous Médicaux & Éligibilité Contextuelle (`CDC Sect. 8` & `Suite Sect. 2`)

- [x] **Détection d'urgence médicale (`checkMedicalRedFlags`)** : Détection instantanée des symptômes critiques (*douleur thoracique, vertiges, malaise, claquage, douleur aiguë*) $\rightarrow$ arrêt immédiat de la séance et recommandation médicale.
- [x] **Matrice d'éligibilité contextuelle (`evaluateGoalEligibility`)** : Vérifie le contexte réel d'entraînement (`recentWeeklyKm`, `longestRecentRunKm`, `hasSyncedHistory`) avant tout refus pédagogique ; accepte pleinement les objectifs ambitieux si le coureur est déjà préparé.
- [x] **Interdiction d'hallucination physiologique** : Le LLM choisit uniquement parmi des actions d'adaptation validées (`lighten`, `easy_run`, `postpone`, `injury_care`, `add_life_rule`).

---

## 📥 Phase 2 : Finalisation Data Lake & Récupération Complète des Vraies Séances (`DataLake.md`)

- [x] **Récupération et stockage complets de la vraie séance à chaque Webhook (`Strava` / `Garmin` / `Apple Santé`)** :
  - Ajout des colonnes de la vraie séance réalisée dans [`schema.prisma`](./back-riles/prisma/schema.prisma) (`externalActivityId`, `sourceProvider`, `actualDistanceKm`, `actualDurationSec`, `actualPace`, `actualAvgHeartRate`, `actualMaxHeartRate`, `actualElevationGain`, `actualCalories`, `actualCadence`, `actualSplitsJson`, `completedAt`).
  - Dans [`WebhooksService`](./back-riles/src/modules/webhooks/webhooks.service.ts) : appel API Strava (`GET /api/v3/activities/{id}` + `GET /api/v3/athlete/zones` avec refresh OAuth2 automatique), extraction complète Garmin & Apple Santé, sauvegarde dans `Workout`, mise à jour de `User.totalKm`, et utilisation prioritaire de ces vraies données par [`LlmService.extractSessionMetricsFromWorkouts`](./back-riles/src/modules/llm/llm.service.ts).
- [x] **Enrichissement automatique d'`athleteContext` (Flux A) & Branchement des Webhooks au Data Lake (Flux B)** : Archivage automatique de la comparaison `plannedWorkout` vs `executedMetrics` dans [`DataLakeService`](./back-riles/src/modules/datalake/datalake.service.ts).
- [x] **Champs `textComment` et `perceivedLegs` dans `RpeCheckIn`** (Prisma + DTO + `WorkoutsService`).

---

## ✅ Phase 3 : Moteur Physiologique, Plan Multi-Semaines par LLM Pro, Affichage des Vraies Séances & Recalcul Dynamique *(Terminé)*

- [x] **Modèle de données physiologiques** : Ajout dans [`schema.prisma`](./back-riles/prisma/schema.prisma) des métriques de charge (`tss`, `atlFatigue`, `ctlFitness`, `tsbForm`, `sleepScore`, `hrvStatus`) sur `User` / `Workout`.
- [x] **Calculateur déterministe (Charge de Banister)** : Calcul automatique du TSS (`computeSessionTss`), ATL (7j), CTL (42j), TSB et Readiness (`updateBanisterLoad`) dans [`LlmService`](./back-riles/src/modules/llm/llm.service.ts) et [`WebhooksService`](./back-riles/src/modules/webhooks/webhooks.service.ts) à chaque séance réelle synchronisée.
- [x] **Affichage complet des données réelles sur les séances passées (`status === "done"`)** :
  - Dans [`calendar.tsx`](./front-riles/app/(tabs)/calendar.tsx) et [`index.tsx`](./front-riles/app/(tabs)/index.tsx), les séances passées affichent les **vraies métriques exécutées** (`actualDistanceKm`, `actualPace`, `actualDurationSec`, `actualAvgHeartRate`, `actualMaxHeartRate`, `actualElevationGain`, `actualCadence`, `actualCalories`, `tss`, badge `STRAVA` / `GARMIN` / `APPLE SANTÉ`) en comparaison avec les cibles prévues.
- [x] **Générateur de plan multi-semaines par le meilleur LLM (`LLM_PRO_MODEL`) respectant les `LifeRule`s** :
  - Endpoint `POST /workouts/generate-plan` dans [`WorkoutsController`](./back-riles/src/modules/workouts/workouts.controller.ts) et [`WorkoutsService.generateAndSaveMultiWeekPlan`](./back-riles/src/modules/workouts/workouts.service.ts).
  - Envoie tout le contexte athlète (profil, allures réelles calculées sur séances + FC, charge Banister ATL/CTL/TSB, dernières séances réalisées et `LifeRule`s) à `LLM_PRO_MODEL` (`LlmService.generateMultiWeekPlan`), enregistre automatiquement toutes les séances en base PostgreSQL (sans écraser les séances `DONE`), et présente le bilan du plan dans le Chat Coach à la fin de l'Onboarding.
  - **Aucune génération à la volée à la navigation** : si l'utilisateur avance dans le calendrier au-delà des semaines planifiées, aucune séance n'est créée à la volée et le calendrier affiche simplement qu'aucune séance n'est prévue pour le moment.
- [x] **Recalcul dynamique de la semaine complète via un bouton général « J'ai un problème / J'en parle au coach »** :
  - Suppression des boutons automatiques rigides au profit d'un bouton général **« J'ai un problème / J'en parle au coach »** sur [`index.tsx`](./front-riles/app/(tabs)/index.tsx) et [`calendar.tsx`](./front-riles/app/(tabs)/calendar.tsx) qui ouvre [`chat.tsx`](./front-riles/app/chat.tsx).
  - L'utilisateur explique librement son imprévu/fatigue au coach, et [`CoachService.processMessage`](./back-riles/src/modules/coach/coach.service.ts) + [`LlmService.generateCoachReply`](./back-riles/src/modules/llm/llm.service.ts) recalculent dynamiquement la séance du jour ET rééquilibrent les séances restantes de la semaine (`recalculatedWeekWorkouts`), avec sauvegarde immédiate en base et rafraîchissement automatique dans l'application.

---

## ✅ Phase 4 (Priorité P0 — Indispensable MVP) : Boucle Cœur en Conditions Réelles & Import Strava 6 Mois *(Terminé)*

> **Pourquoi en P0 ?** Le moteur IA, le calculateur physiologique (Banister + allures réelles) et les webhooks sont prêts, et la boucle d'acquisition récupère désormais **6 mois complets de données Strava** dès l'inscription pour les conserver à la fois dans le calendrier de l'application et dans le contexte IA de création du plan d'entraînement.

- [x] **1. Flux OAuth2 réel Strava & Récupération / Persistance des 6 derniers mois (`syncStravaSixMonthsHistory`)** :
  - Endpoints `GET /onboarding/oauth/strava/url` et `POST /onboarding/strava/sync-six-months` dans [`OnboardingController`](./back-riles/src/modules/onboarding/onboarding.controller.ts), [`OnboardingService`](./back-riles/src/modules/onboarding/onboarding.service.ts) et [`WebhooksService`](./back-riles/src/modules/webhooks/webhooks.service.ts).
  - Échange du code OAuth2 Strava (`https://www.strava.com/oauth/token`), récupération des **6 derniers mois d'activités** (`GET /api/v3/athlete/activities?after=...` sur 26 semaines : Semaines 17 à 42 d'Avril à Octobre 2026) ou génération d'un historique Strava physiologiquement cohérent de 6 mois (77 séances, 684,5 km) en mode local/démo.
  - **Conservation dans l'application** : Toutes les séances des 6 derniers mois sont enregistrées en base PostgreSQL (`Workout` avec statut `DONE` et vraies métriques Strava : distance, allure, durée, FC moy/max, D+, cadence, calories, TSS) et consultables mois par mois dans [`calendar.tsx`](./front-riles/app/(tabs)/calendar.tsx).
  - **Conservation dans le contexte IA** : Calcul et stockage du bilan 6 mois (`StravaSixMonthsSummaryDto` dans `SyncToken.metadata.sixMonthsSummary` et sur le profil `User`), incluant le découpage mensuel (`monthlyBreakdown`), le volume moyen récent (`recent4WeeksAvgKm`), la sortie longue max (`longestRunKm`), les allures calibrées (`computePacesFromRecentPerformance`) et la charge chronologique de Banister (`CTL`/`ATL`/`TSB`).
- [x] **2. Onboarding « Aha! Moment » & Connexion directe avec la Création du Plan d'Entraînement (`CDC Sect. 6`)** :
  - Dans [`onboarding.tsx`](./front-riles/app/onboarding.tsx) (Étape 4), affichage de la carte **Historique Strava • 6 Derniers Mois** (4 KPIs sur 6 mois, allures Endurance Z2 / Seuil Z4 / Fitness CTL, histogramme mensuel Avril $\rightarrow$ Octobre, et **Diagnostic IA « Aha! Moment »**).
  - Recalibrage automatique de l'objectif (`reformulateGoal` + `evaluateGoalEligibility`) sur les 6 mois Strava importés.
  - À l'Étape 5 (`completeOnboarding`), connexion directe des 6 mois de données Strava avec [`WorkoutsService.generateAndSaveMultiWeekPlan`](./back-riles/src/modules/workouts/workouts.service.ts) et [`LlmService.generateMultiWeekPlan`](./back-riles/src/modules/llm/llm.service.ts) (ainsi que [`CoachService.processMessage`](./back-riles/src/modules/coach/coach.service.ts)) pour générer et sauvegarder le plan multi-semaines sur-mesure sans écraser l'historique Strava.
- [x] **3. Notifications Push Post-Séance (`sendPostWorkoutPushNotification`)** :
  - Déclenchement automatique d'une notification push Expo (`https://exp.host/--/api/v2/push/send`) dans [`WebhooksService.persistExecutedWorkoutAndLog`](./back-riles/src/modules/webhooks/webhooks.service.ts) dès validation d'une séance réalisée, invitant le coureur à saisir son RPE.

---

## 🚀 Phase 5A (Priorité P1 — Marketing, Landing Page Netlify & Validation Pré-Lancement) *(Terminé)*

> **Décision stratégique :** Séparation complète entre la validation marketing externe (sans toucher à `back-riles` ni `front-riles`) et le développement des fonctionnalités secondaires de l'application. Utilisation d'outils d'analytics externes spécialisés (**Microsoft Clarity**, **PostHog / GA4**, **Netlify Forms**) pour mesurer les clics, les heatmaps et les inscriptions sans serveur à maintenir.

- [x] **1. Projet indépendant [`landing-riles/`](./landing-riles) prêt à déployer sur Netlify** :
  - Site web statique ultra-rapide ([`index.html`](./landing-riles/index.html), [`styles.css`](./landing-riles/css/styles.css), [`app.js`](./landing-riles/js/app.js), [`netlify.toml`](./landing-riles/netlify.toml)) reprenant la charte exacte des [`maquettes/`](./maquettes).
  - Système d'A/B test multi-angles intégré via l'URL (`?angle=guilt`, `?angle=injury`, `?angle=garmin`) pour comparer les 3 accroches psychologiques.
- [x] **2. Simulateur Web Interactif Sans Compte (`Suite Sect. 4`)** :
  - Simulateur 7 jours en temps réel sur 3 objectifs (`10 km`, `Semi-Marathon`, `Marathon`) et 4 scénarios d'imprévus (*« Que 30 min ce soir »*, *« Nuit de 5h / Jambes lourdes »*, *« Mollet tendu »*, *« Impossible de courir le jeudi »*).
- [x] **3. Tunnel « Fake Door » en 2 Temps & Outils Analytics Externes** :
  - **Temps 1** : Capture d'email Bêta + qualification du concurrent utilisé (*Campus, Runna, Garmin, Kiprun, PDF, Aucun*) via **Netlify Forms** (`riles-beta-waitlist`) et/ou Webhook externe ([`config.js`](./landing-riles/js/config.js)).
  - **Temps 2** : Test d'intention d'achat réel (*Offre Membre Fondateur -50% à 49 €/an — 0 € aujourd'hui*, formulaire `riles-founder-intent`) + lien de parrainage coupe-file.
  - Intégration native de **Microsoft Clarity** (Heatmaps & Session Replay), **PostHog** et **Google Analytics 4** pour traquer tout l'entonnoir de clics.
- [x] **4. Playbook Marketing, Challenge Nom de Domaine & Kit d'Acquisition ([`MARKETING_PLAYBOOK.md`](./MARKETING_PLAYBOOK.md))** :
  - Analyse SEO/juridique du nom de marque & recommandations de noms de domaine (`.run` / `.app`), guide de configuration Netlify + Clarity + PostHog, scripts TikTok/Reels, posts Reddit/Facebook et liens UTM pour QR codes terrain.

---

## 🛠️ Phase 5B (Priorité P1 — Produit Application : Running Clubs, Partage Story In-App & Monétisation)

> **Pourquoi en Phase 5B ?** Ces fonctionnalités enrichissent l'application mobile ([`front-riles`](./front-riles)) et son serveur ([`back-riles`](./back-riles)) pour les utilisateurs connectés une fois la campagne de pré-lancement lancée.

- [ ] **1. Running Clubs & Dimension Sociale Back-end (`Suite Sect. 1`)** :
  - *Note : L'interface front (`community.tsx`) fonctionne déjà avec un état local ; le back-end devient prioritaire dès le lancement du premier club pilote.*
  - **Modélisation Prisma** : Créer les tables `RunningClub`, `CommunityRun`, `CommunityRunParticipant` et `MonthlyChallenge` dans [`schema.prisma`](./back-riles/prisma/schema.prisma).
  - **Module NestJS `CommunityModule`** : Créer les endpoints `GET /community/runs`, `POST /community/runs/:id/toggle`, `GET /community/challenges` et remplacer le mock de [`communityService.ts`](./front-riles/src/services/communityService.ts).
  - **Séances collectives individualisées** : Permettre d'inscrire une sortie club dans le calendrier du coureur avec le thème commun du groupe mais ses propres zones cardiaques / allures cibles.
- [ ] **2. Partage Viral Story Instagram / Strava dans l'Application (`front-riles`)** :
  - Génération dans l'application d'une carte visuelle prête à partager en 1 clic résumant *Plan initial $\rightarrow$ Imprévu $\rightarrow$ Adaptation IA* ou *Séance prévue vs Réalisée*.
- [ ] **3. Gestion des Abonnements & Soft Paywall (`Freemium` vs `Pro`)** :
  - Appliquer la restriction `PlanType.BASIC` vs `PRO` côté back-end (adaptations dynamiques illimitées réservées au plan `PRO` / essai 14 jours) et intégrer RevenueCat / Stripe.

---

## 🔭 Phase 6 (Priorité P2 — Post-MVP / V2 & Écosystème Matériel)

> **Pourquoi en P2 (Hors périmètre MVP) ?** Ces chantiers nécessitent des validations constructeurs ou du développement embarqué spécifique (WatchOS, Garmin Connect IQ) qui ne doivent pas retarder la sortie du MVP mobile.

- [ ] **Connecteurs Directs Constructeurs (Garmin Health API B2B, Coros, Polar)** : Ingestion native directe des fichiers `.FIT` sans passer par le relais Strava.
- [ ] **Applications Compagnons Montres (WatchOS / Garmin IQ / WearOS)** : Affichage de la séance structurée au poignet et saisie rapide du RPE dès l'arrêt du GPS.
- [ ] **Connecteur Audio Smart Glasses (Meta Ray-Ban)** : Flux audio pour les consignes d'allure et le coaching vocal contextuel en course.
