# **Cahier des Charges Fonctionnel et Technique**

Projet : Plateforme de Coaching Sportif IA Adaptatif & Asynchrone

| Version | 1.0 (Complet) | Date de validation | Septembre 2026 |
| :---- | :---- | :---- | :---- |
| **Statut** | Document de Cadrage Produit & Architecture | **Cible principale** | Coureurs amateurs, semi-marathoniens & marathoniens |

## **1\. Synthèse Exécutive et Vision Produit**

Le projet vise à concevoir et déployer une application mobile de coaching sportif intelligent qui s'affranchit des deux écueils majeurs de l'industrie : d'une part, les plans d'entraînement rigides basés sur des feuilles Excel ou des templates figés (qui culpabilisent et mènent à l'abandon au premier imprévu) ; d'autre part, les tentatives naïves d'intelligence artificielle improvisant des séances en temps réel sans rigueur physiologique.  
**La promesse centrale :** « Le premier plan d'entraînement qui s'adapte à votre vraie vie, sans croix rouge ni culpabilité. » L'application n'est pas un énième traceur d'activités, mais une couche d'arbitrage de vie et de charge mentale qui ingère les séances de façon asynchrone, recalibre dynamiquement la périodisation grâce à un moteur déterministe et offre un dialogue empathique via un modèle de langage (LLM).

## **2\. Analyse Stratégique : Forces, Faiblesses et Risques (SWOT Technique)**

| Forces et Opportunités (+) | Faiblesses et Contraintes Techniques (-)   |
| :---- | :---- |
| **Architecture asynchrone robuste :** Suppression du temps réel pendant l'effort. Aucun problème de batterie, de pertes BLE ou de décrochage réseau en forêt. **Indépendance des pannes API :** Les données brutes et agrégées sont persistées en base locale, garantissant un fonctionnement continu même si l'API Garmin ou Strava est indisponible. **Hyper-personnalisation sans friction :** Collecte passive des données métriques (FC, allure, dénivelé) combinée à un recueil qualitatif ultra-rapide des sensations (RPE). **Scalabilité et coût marginal faible :** Accompagnement individualisé de milliers d'utilisateurs sans nécessiter un ratio fixe de coachs humains. | **Risque de dépendance aux plateformes (Platform Risk) :** Conditions d'utilisation strictes de Garmin Health API et Strava API (restrictions de stockage, interdiction d'entraînement brut de modèles tiers). **Bruit des capteurs :** Les capteurs optiques au poignet et les traces GPS urbaines/forestières contiennent des artefacts exigeant un filtrage rigoureux avant modélisation. **Responsabilité physiologique et légale :** Interdiction formelle de laisser un LLM déduire seul des charges d'entraînement afin d'éviter surentraînement ou accidents cardiovasculaires. **Réglementation RGPD / Données de santé :** Les données biométriques imposent un chiffrement fort et des protocoles de consentement explicites. |

## **3\. Analyse Comparative de la Concurrence**

Le marché de l'entraînement connecté se divise en quatre grands segments, chacun présentant un angle mort spécifique que la présente solution vient combler :

| Catégorie & Acteurs | Forces majeures | Angles morts & Faiblesses | Différenciation Clé   |
| :---- | :---- | :---- | :---- |
| **Moteurs Scientifiques** TrainAsONE, Athletica.ai, Humango | Modélisation mathématique poussée (TSS, charge aiguë/chronique, HIIT). | Interfaces austères, expérience utilisateur clinique, jargon incompréhensible pour les amateurs, absence d'empathie. | Vulgarisation conversationnelle bienveillante et renégociation dynamique en langage naturel. |
| **Apps de Running B2C** Runna, Campus Coach, RunMotion | Excellente ergonomie mobile, forte communauté, plans structurés par objectifs. | Plans basés sur des templates rigides ; réajustement punitif ou maladroit en cas de séance manquée. | Zéro culpabilisation : adaptation contextuelle à l'emploi du temps réel plutôt que report forcé. |
| **Constructeurs Matériels** Garmin Daily Suggested, Apple Fitness | Données au plus près de la physiologie (sommeil, VFC), intégration native sans surcoût. | « Boîte noire » muette : aucune négociation possible, aucune prise en compte des imprévus d'agenda. | Capacité de dialoguer avec le système pour lui faire part de ses contraintes familiales ou professionnelles. |
| **Assistants IA Rétrospectifs** Whoop Coach, Strava Athletic Intelligence | Interface conversationnelle moderne, explications qualitatives des métriques de fatigue. | Analyse purement descriptive et rétrospective ; absence de prescription d'entraînement périodisé vers un chrono. | Prescription proactive et prospective : planification complète d'un bloc d'entraînement orienté objectif. |

## **4\. Spécifications Fonctionnelles & Levier d'Adoption Quotidienne**

### **4.1. Levier Central : La Renégociation Dynamique Sans Culpabilité**

Le coureur amateur abandonne rarement par manque de motivation, mais par accumulation de friction face aux aléas du quotidien. Le cœur du système repose sur la flexibilité :

> * **Le sélecteur instantané « J'ai seulement X minutes » :** En 1 clic, l'utilisateur indique son temps disponible (ex. 35 min au lieu de 1h15). Le moteur recalcule instantanément la séance pour préserver le stimulus aérobie sans tenter d'accélérer absurdement, et rééquilibre le volume de la semaine.  
> * **Le bouton « Jambes lourdes / Énergie basse » :** Bascule automatique vers une séance de récupération active, un footing très lent ou un jour de repos compensatoire sans casser le cycle de progression.  
> * **L'arbitrage bienveillant :** L'application valorise le repos lorsqu'il est physiologiquement plus rentable que la séance (« Dormir 1h de plus te fera gagner 3 fois plus qu'un footing bâclé sur une nuit de 4 heures »).

### **4.2. Le Débrief Post-Séance Subjectif & Objectif**

Dès la fin de la séance et la réception du webhook de synchronisation :

> 1. Notification push contextuelle invitant à évaluer le ressenti en une phrase ou un score RPE (1 à 10\) : *« 10 km bouclés \! Comment étaient les sensations musculaires à la fin ? »*.  
> 2. Analyse croisée des séries temporelles (cardiaque, allure, dénivelé) et du texte de l'utilisateur.  
> 3. Détection précoce des signaux faibles (ex. FC stable mais sensation d'épuisement \= fatigue nerveuse centrale ; dérive cardiaque anormale \= déshydratation, chaleur ou début d'infection).  
> 4. Traduction du jargon : aucune formule complexe non expliquée, valorisation des acquis et projection rassurante sur la séance suivante.

## **5\. Architecture Technique et Pipeline de Données**

### **5.1. Découplage Fondamental : Déterministe vs Génératif**

L'architecture logicielle sépare rigoureusement le calcul mathématique de la génération textuelle afin d'éliminer toute hallucination sur les métriques critiques :

> * **Moteur Déterministe (Python / Go) :** Chargé de l'ingestion des fichiers FIT/GPX, du calcul des métriques de Banister (TSS, Acute/Chronic Training Load, découplage aérobie Pa:HR), de la validation des règles de sécurité (pas plus de 10 % d'augmentation de volume hebdomadaire, zones cibles inviolables).  
> * **Couche de Persistance :** PostgreSQL enrichi de TimescaleDB pour le stockage structuré des activités et des séries temporelles dédupliquées, garantissant la résilience face aux pannes d'API tierces.  
> * **Moteur LLM & Context Injection (RAG ciblé) :** Le modèle ne reçoit jamais les milliers de points bruts. Il reçoit une payload JSON agrégée (profil coureur, métriques de la séance, historique 4 semaines, verbatims récents) et se concentre sur l'interaction pédagogique et la synthèse.

### **5.2. Pipeline Asynchrone Événementiel**

| Étape | Composant Technique | Rôle et Spécificités   |
| :---- | :---- | :---- |
| **1\. Ingestion** | Webhook Receivers (FastAPI / NestJS) | Réception des événements activity.created en provenance de Garmin Connect, Coros et Strava. Ack HTTP 200 immédiat. |
| **2\. Tamponnage** | Message Broker (Redis Streams / RabbitMQ) | Lissage des pics de synchronisation (notamment le dimanche entre 11h et 14h). Tolérance aux pannes et reprise automatique. |
| **3\. Processing** | Workers de Traitement Asynchrone | Parsing des binaires FIT, nettoyage du bruit capteur, calcul du TSS, détection d'allures et écriture en base relationnelle. |
| **4\. Prompting** | LLM Gateway & Context Builder | Assemblage du prompt système avec garde-fous stricts, injection des données chiffrées et génération du debrief adapté au profil psychologique. |

## **5.3. Extensions et Interfaces Innovantes**

L'expérience utilisateur ne se limite pas à l'application mobile et s'étend aux écosystèmes connectés pour réduire la friction au strict minimum pendant et après l'effort :

**Connecteur Smart Glasses (ex. Meta Ray-Ban)** : Intégration d'un flux audio pour le coaching vocal contextuel. Les lunettes permettent de recevoir les consignes de la séance réadaptée et les notifications d'allure en temps réel, s'affranchissant de la manipulation d'un téléphone ou de la consultation d'une montre en plein effort.

**Affichage Wearable Natif (WatchOS, Garmin IQ, WearOS)** : Développement d'applications compagnons légères pour déporter l'affichage dynamique du plan :

Consultation : Restitution de la séance du jour (durée, intensité, blocs d'efforts) directement lisible sur le cadran de la montre.

Interaction : Saisie rapide du score RPE (ressenti) et du statut des « jambes lourdes » en fin d'activité, permettant de boucler la boucle de rétroaction sans friction dès la coupure de l'enregistrement GPS.

## **6\. Tunnel d'Onboarding et Conversion Premium**

L'onboarding est conçu pour délivrer une valeur démonstrative immédiate (Aha Moment) en moins de 3 minutes, avant toute demande de carte bancaire :

| Phase | Intention Psychologique | Action Réalisée   |
| :---- | :---- | :---- |
| **1\. Cadrage** | Validation de la douleur | 3 questions interactives : Objectif cible, causes des échecs passés (manque de temps, blessure), jours sacrés indisponibles. |
| **2\. Connexion** | Zéro effort de saisie | OAuth 2.0 Garmin/Strava/Apple en 1 clic. Animation d'ingestion active montrant le scan des 6 derniers mois. |
| **3\. Diagnostic (Aha \!)** | Électrochoc de valeur | Audit personnalisé instantané : révélation de patterns méconnus (ex. « Tu sautes 28 % de tes séances le jeudi après une sortie trop intense le mardi »). |
| **4\. Simulation** | Preuve du super-pouvoir | Test interactif : clic sur « J'ai seulement 30 min ». L'utilisateur voit le calendrier se recalculer harmonieusement en direct. |
| **5\. Soft Paywall** | Conversion naturelle | Proposition de l'essai gratuit 14 jours (annuel à 99 € ou mensuel à 14,99 €) avec notification de rappel 2 jours avant la fin. Option de repli gratuit sans friction. |
| **6\. Premier Debrief** | Verrouillage de la rétention | Post-séance n°1 : debrief immédiat croisant FC et micro-retour RPE (« Mollet tendu ») pour adapter la séance du lendemain. |

## **7\. Modèle Économique et Stratégie Go-to-Market**

### **7.1. Structure Tarifaire & Optimisation des Coûts Unitaires**

> * **Palier Gratuit (Freemium de rétention) :** Synchronisation des sorties, historique et debriefs textuels standards générés par des templates dynamiques ou des petits modèles peu coûteux. Sert de réservoir d'utilisateurs qualifiés.  
> * **Palier Premium (12 € à 15 € / mois ou 99 € / an) :** Planification dynamique illimitée, bouton d'arbitrage d'agenda, adaptation en langage naturel, détection fine du surentraînement et dialogue continu avec l'IA.  
> * **Unit Economics :** Appel aux modèles de langage de pointe réservé uniquement aux interactions à forte valeur ajoutée (replanification complexe, dialogue direct de l'utilisateur). Le debrief post-séance récurrent s'exécute sur des modèles légers et ultra-optimisés pour maintenir un coût d'inférence inférieur à 0,30 € / utilisateur / mois.

### **7.2. Leviers d'Acquisition Organique (Anti-CAC élevé)**

> * **Lead Magnet « Audit de Plan » :** Outil web sans inscription complexe permettant d'importer son historique Strava ou son plan de préparation marathon pour identifier ses 3 plus grands risques de blessure en 30 secondes.  
> * **Partenariats Événements Sportifs :** Intégration en tant que « coach adaptatif officiel » de courses régionales (courses de 2 000 à 10 000 participants) offrant une cohorte à forte intention d'achat.  
> * **Boucle Virale Instagram / Strava :** Génération automatique d'un visuel de debrief narratif épuré et moderne (montrant le plan initial, l'imprévu du jour, et la résolution intelligente par l'IA) facilement partageable en story.  
> * **Prescription Médicale Indirecte :** Partenariats avec des kinésithérapeutes du sport et entraîneurs de club en leur fournissant une interface de suivi gratuit de la charge de reprise de leurs patients.

## **8\. Gestion des Risques et Conformité**

> * **Conformité RGPD et Données de Santé :** Données biométriques chiffrées de bout en bout (AES-256 au repos, TLS 1.3 en transit). Absence totale de revente de données. Purge intégrale sur simple demande utilisateur.  
> * **Contournement du risque de coupure d'API (Strava / Garmin) :** Inciter dès l'onboarding à la synchronisation directe des fichiers FIT Garmin Health ou à l'upload direct plutôt qu'à une dépendance exclusive envers le flux réseau Strava.  
> * **Garde-fous Médicaux et Décharge :** Le LLM intègre des règles formelles d'arrêt d'entraînement : dès détection de mots-clés de blessure vive (douleur aiguë, claquage, douleur thoracique, vertiges), l'application impose l'arrêt de la séance et recommande une consultation médicale immédiate.
