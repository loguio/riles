# 🚀 Playbook Marketing, Nom de Domaine & Validation Pré-Lancement

Ce document centralise la stratégie de mise sur le marché (Go-To-Market) avant la sortie officielle de l'application sur l'App Store / Google Play, autour du projet indépendant [`landing-riles/`](./landing-riles).

---

## ⚡ 1. Challenge Stratégique : Le Nom « Riles » & Choix du Nom de Domaine

Puisque tu m'as demandé de challenger systématiquement tes idées, voici **le premier point critique à trancher avant d'acheter un nom de domaine ou de lancer des pubs** :

### ⚠️ Le problème avec le nom « Riles » en public (SEO & Marque)

1. **Collision frontale sur Google & TikTok avec l'artiste Rilès** :
   - En France, **Rilès** est un artiste majeur qui a justement réalisé un coup médiatique mondial en courant **24 heures non-stop sur un tapis de course** (*Survival Run*).
   - Si un coureur entend parler de ton app et tape *« Riles »* ou *« Riles course à pied »* sur Google, YouTube ou TikTok, **100 % de la première page** est occupée par le rappeur Rilès. Tu perdras une part énorme du trafic organique de bouche-à-oreille.
2. **Risque juridique (INPI / App Store)** :
   - Associer le nom « Riles » à la course à pied expose à un risque de blocage de marque ou de signalement pour confusion avec l'univers *Rilès / Running*.
3. **Indice dans tes propres maquettes (`onboarding-4.png` & `onboarding-5.png`)** :
   - Sur tes maquettes, le logo de l'application en haut à gauche est un **« P »** blanc sur fond orange avec le slogan ***« Ton plan, à ton rythme »*** !

### 🌐 Quelles options de Nom de Domaine choisir ?

#### Option A — Si « Riles » n'était qu'un nom de code et que tu gardes le logo « P » de tes maquettes *(Recommandé)*

Choisir un nom court commençant par **P**, mémorisable, international et aligné avec l'idée d'adaptation / allure (*Pace / Pivot / Pulse*) :

- **`paceflow.run`** ou **`paceflow.app`** *(L'allure fluide qui s'adapte à ta vie)*
- **`pivot.run`** ou **`getpivot.app`** *(Le plan qui pivote quand tu as un imprévu)*
- **`pacio.run`** ou **`pacio.app`** *(Court, sonne humain comme un coach, libre en SEO)*
- **`plania.run`** *(Contraction immédiate de Plan + IA)*

#### Option B — Si tu tiens absolument à garder le nom « Riles »

Il faut impérativement accoler un **mot-clé métier** dans le domaine pour aider Google et éviter toute ambiguïté :

- **`riles.run`** *(L'extension `.run` est la plus crédible dans l'écosystème Strava/Running — ~15 €/an sur Namecheap/Cloudflare/OVH)*
- **`rilescoach.com`** ou **`rilescoach.fr`**
- **`try-riles.com`** *(Idéal et pas cher — ~9 €/an — pour la phase de test pré-lancement)*

> 💡 **Mon conseil pragmatique :** Pour tester dès cette semaine sans perdre de temps, tu peux utiliser le sous-domaine gratuit Netlify (`ton-nom.netlify.app`) ou acheter un `.run` / `.app` sur **Cloudflare Registrar** (qui vend les domaines à prix coûtant sans marge cachée au renouvellement).

---

## 🛠️ 2. Déploiement sur Netlify & Branchement des Outils Externes (10 min)

Le dossier [`landing-riles/`](./landing-riles) est **100 % statique et autonome** (zéro dépendance à `back-riles`).

### Étape 2.1 — Déployer sur Netlify (2 minutes)

1. Va sur [app.netlify.com](https://app.netlify.com).
2. Glisse-dépose directement le dossier **`landing-riles`** dans la zone *Deploy manually* (ou connecte ton dépôt Git en indiquant `landing-riles` comme *Base directory* et `.` comme *Publish directory*).
3. **Netlify Forms s'active tout seul !**
   - Va dans l'onglet **Forms** de ton projet Netlify : tu verras déjà les 2 formulaires détectés :
     - **`riles-beta-waitlist`** : stocke chaque email + objectif + application concurrente actuelle + angle marketing + source UTM.
     - **`riles-founder-intent`** : stocke les personnes qui cliquent sur **« Oui, verrouiller mon statut Membre Fondateur à -50% (49€/an) »** à l'étape 2 !
   - Dans *Site configuration > Notifications > Form submission notifications*, ajoute ton adresse email pour recevoir une alerte dès qu'un coureur s'inscrit.

### Étape 2.2 — Activer Microsoft Clarity (Heatmaps & Replay Vidéo — 3 minutes)

1. Crée un compte gratuit sur [clarity.microsoft.com](https://clarity.microsoft.com) et crée un projet.
2. Copie ton `Project ID` (une chaîne courte comme `lz9x8abcd`).
3. Colle-le dans [`landing-riles/js/config.js`](./landing-riles/js/config.js) à la ligne `CLARITY_PROJECT_ID: "ton_id"`.
4. **Ce que tu verras :** La carte thermique de ta page et les **vidéos en replay** de chaque visiteur qui teste le simulateur !

### Étape 2.3 — Activer PostHog ou Google Analytics 4 (Entonnoir de clics — 4 minutes)

1. Crée un compte gratuit sur [eu.posthog.com](https://eu.posthog.com) (hébergé en Europe, RGPD friendly).
2. Colle ta clé `phc_...` dans [`landing-riles/js/config.js`](./landing-riles/js/config.js) (`POSTHOG_API_KEY`).
3. Tous les événements de l'entonnoir remontent déjà automatiquement :
   - `landing_page_viewed` (Ouverture de la page + `angle` + `utm_source`)
   - `simulator_goal_changed` (Choix `10k`, `semi` ou `marathon`)
   - `simulator_scenario_tested` (Clic sur un imprévu : `late_work_30m`, `bad_sleep`, `sore_calf`, `no_thursday`)
   - `fake_door_clicked` (**Le clic clé** sur « Générer mon vrai plan sur-mesure »)
   - `waitlist_lead_submitted` (Email laissé + quelle app concurrente il utilise)
   - `founder_offer_50_claimed` (**Preuve d'intention d'achat** sur l'offre à 49 €/an)

---

## 🧪 3. Les 3 Liens d'A/B Test (Comment tester tes angles marketing)

La page [`landing-riles/index.html`](./landing-riles/index.html) change automatiquement son titre principal et sa promesse selon le paramètre `?angle=` dans l'URL :

| Angle testé | URL à partager | Ce que le visiteur lit en arrivant |
| :--- | :--- | :--- |
| **1. Anti-Culpabilité** *(Par défaut)* | `https://ton-site.run/?angle=guilt&utm_source=...` | *« Le premier plan running qui s'adapte à ta vraie vie en 10 secondes. »* |
| **2. Anti-Blessure** | `https://ton-site.run/?angle=injury&utm_source=...` | *« 78 % des blessures arrivent en forçant une séance quand ton corps dit stop. »* |
| **3. Vs Montre Muette** | `https://ton-site.run/?angle=garmin&utm_source=...` | *« Ta montre te dit quoi courir. Riles est le premier coach avec qui tu peux négocier. »* |

> En local, ouvre simplement `landing-riles/index.html` (ou lance `npm start` dans `landing-riles/`) : une **barre noire de prévisualisation** s'affiche tout en haut pour te permettre de basculer entre les 3 angles en 1 clic.

---

## 📣 4. Kit Prêt-à-Poster (Pour générer tes 500 premiers visiteurs)

### A. Post Reddit (`r/runningfr`) / Groupes Facebook Running (0 €)

**Titre :**
> J'en avais marre des plans rigides (Campus, Runna, PDF) qui te culpabilisent dès que tu sors tard du boulot, alors j'ai codé un simulateur qui rééquilibre la semaine en direct. Vos avis ?

**Corps du post :**
> Salut à tous,
> En préparant mon semi, je me suis rendu compte d'un truc frustrant : les plans d'entraînement classiques partent du principe qu'on a une vie de pro. Dès que tu rates la séance de seuil du mercredi parce que tu sors du boulot à 20h ou que tu as dormi 5h, soit tu as une croix rouge sur l'app, soit tu essaies de "rattraper" le lendemain et tu te blesses.
>
> Je bosse sur un coach adaptatif qui prend tes 6 derniers mois Strava/Garmin et à qui tu peux dire en 1 clic : *"J'ai que 30 min ce soir"*, *"J'ai le mollet raide"* ou *"Impossible de courir le jeudi"*. Il recalcule la séance du jour ET rééquilibre la sortie longue du week-end pour garder le bon stimulus sans surcharge.
>
> J'ai mis un **simulateur interactif en ligne (sans compte ni inscription)** pour tester les réajustements sur une semaine de 10 km, Semi ou Marathon :
> 👉 `[LIEN_AVEC_?angle=guilt&utm_source=reddit]`
>
> Curieux d'avoir vos retours de coureurs sur la cohérence des séances recalculées !

---

### B. Script Vidéo TikTok / Instagram Reels (18 secondes — 0 €)

- **0 à 3 sec (Hook visuel + texte choc à l'écran)** :
  - *Image* : Montrer un calendrier de course avec une grosse séance *« Mercredi : 1h15 Seuil (14 km) »* alors qu'il fait nuit dehors.
  - *Texte/Voix* : « POV : Il est 19h45, tu sors à peine du boulot, et ton plan prévoit 14 km au seuil sous la pluie. »
- **3 à 10 sec (Le problème)** :
  - *Voix* : « Sur un plan normal, soit tu sautes la séance et tu culpabilises, soit tu forces à froid et tu te flingues le mollet. »
- **10 à 15 sec (La démo du simulateur sur téléphone)** :
  - *Image* : Filmer ton écran sur le simulateur de `landing-riles` en cliquant sur **« Je sors tard du boulot, j'ai que 30 min »** $\rightarrow$ les cartes du Mercredi et du Dimanche passent en orange/vert en direct.
  - *Voix* : « J'ai créé un coach IA à qui tu dis juste "J'ai que 30 min ce soir", et il transforme ta séance en Tempo express de 30 min tout en rééquilibrant ta sortie longue de dimanche. »
- **15 à 18 sec (Call to Action)** :
  - *Voix* : « J'ai mis le simulateur en accès libre dans ma bio, teste-le sur ta prépa 10k, Semi ou Marathon. »

---

### C. Accroches Stickers QR Codes Terrain (Pistes d'athlé, Parcs, Kinés)

Génère 3 QR codes gratuits pointant vers :

- **Pistes & Parcs** (`?angle=guilt&utm_source=qr_parc`) :
  > **« Séance sautée cette semaine ? »**
  > *Ne la rattrape surtout pas demain matin. Scanne pour voir comment l'IA rééquilibre ta semaine en 15 secondes (Sans inscription).*
- **Cabinets Kinés du Sport / Ostéos** (`?angle=injury&utm_source=qr_kine`) :
  > **« Mollet raide ou reprise de blessure ? »**
  > *Teste le premier plan running qui adapte automatiquement tes allures dès le moindre signal de fatigue.*

---

## 📊 5. Les Seuils de Validation (Quand sait-on que c'est gagné ?)

Après avoir envoyé **200 à 500 visiteurs uniques** sur `landing-riles` :

| Métrique (dans PostHog / Clarity / Netlify Forms) | Signal Faible (À retravailler) | Signal Fort (Feu Vert Produit 🔥) |
| :--- | :---: | :---: |
| **Taux d'interaction Simulateur** (`simulator_scenario_tested` / Visiteurs) | $< 25\%$ | **$> 45\%$** |
| **Clic sur le bouton Fake Door** (`fake_door_clicked` / Visiteurs) | $< 8\%$ | **$> 18\%$** |
| **Conversion Email Bêta** (Inscrits `riles-beta-waitlist` / Visiteurs) | $< 4\%$ | **$> 10\%$** |
| **Intention d'achat Membre Fondateur -50%** (`founder_offer_50_claimed` / Inscrits) | $< 10\%$ | **$> 25\%$** |
