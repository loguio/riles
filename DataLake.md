# **Cahier des charges : Stratégie Data Lake & Implémentation**

## **1\. Vision et Objectif du Data Lake**

* **Rôle :** Stockage brut, asynchrone et à coût nul des interactions et des données physiologiques de l'application de coaching sportif.  
* **Finalité :** Constituer un dataset d'entraînement qualitatif pour de futurs modèles de fine-tuning (SFT), en associant les conseils du coach, le contexte de l'athlète et son évolution à long terme.  
* **Architecture :** Approche Data Lake minimaliste (fichiers .jsonl sur Supabase Storage) pour éviter la complexité d'un Data Warehouse en phase de démarrage.

## **2\. Spécification des Données à Collecter**

Le Data Lake doit capturer deux flux distincts pour alimenter l'apprentissage de l'IA :

### **Flux A : L'interaction conversationnelle (Prompt / Réponse)**

* **Contexte athlète :** Niveau, objectif principal (ex. course avec date d'échéance), semaines restantes.  
* **État physiologique au moment \$T\$ :** Sommeil, VFC, charge d'entraînement récente (ATL/CTL).  
* **Entrée utilisateur :** Prompt textuel ou choix d'arbitrage (ex. "J'ai 35 min au lieu de 1h15") et score RPE / ressenti de fin de séance.  
* **Sortie IA :** Réponse du coach (adaptation du plan, conseil bienveillant, explication).

### **Flux B : L'évolution objective (Indépendante des prompts)**

* **Suivi de charge et récupération :** Évolution journalière/hebdomadaire du sommeil, de la VFC et des indicateurs de fatigue.  
* **Progression physique :** Évolution des allures de référence en endurance fondamentale et respect de la régularité.  
* **Historique des alertes :** Signalement de douleurs ou détection de surentraînement.

## **3\. Spécification Technique et Pipeline d'Ingestion**

* **Stockage Cible :** Supabase Storage (Bucket privé, ex. training-datalake).  
* **Format de Fichiers :** Fichiers JSON Lines (.jsonl) structurés par hiérarchie temporelle (raw/year=YYYY/MM/DD/events\_timestamp.jsonl).  
* **Anonymisation :** Hachage systématique des identifiants utilisateurs dès la sérialisation pour respecter la confidentialité.  
* **Exécution Backend (NestJS) :**  
  * Utilisation du package @supabase/supabase-js.  
  * Ingestion **asynchrone** (via des tâches de fond ou des *fire-and-forget* avec gestion des erreurs) pour ne pas pénaliser la latence de l'API de chat.

## **4\. Roadmap de Mise en Œuvre**

> 1. **Configuration du Cloud :** Création du bucket training-datalake dans le dashboard Supabase et récupération des clés d'accès serveur (SUPABASE\_SERVICE\_ROLE\_KEY).  
> 2. **Implémentation NestJS :** Création d'un service dédié (DataLakeService) gérant le formatage JSONL et l'upload partitionné par date.  
> 3. **Branchement Asynchrone :** Injection du service dans le module de gestion des prompts de l'IA et dans les webhooks de synchronisation des données de course.  
> 4. **Exploitation Future :** Récupération par scripts Python pour alimenter les pipelines de fine-tuning (Hugging Face, Unsloth, etc.) lorsque le volume de données sera suffisant.

## **5\. Structure exacte d'un fichier .jsonl (Exemple concret)**

Chaque ligne de ton fichier .jsonl stocké dans Supabase doit être un objet JSON valide et plat (ou légèrement imbriqué) contenant à la fois l'interaction, le contexte et l'état de l'athlète à l'instant T.

Extrait de code

| {  "timestamp": "2026-09-16T08:30:00.000Z",  "user\_id\_hash": "a1b2c3d4e5f6",  "interaction": {    "type": "agenda\_negotiation",    "user\_prompt": "Je devais faire 1h20 en endurance mais je n'ai que 35 minutes avant le dîner.",    "ai\_response": "Pas de souci \! On raccourcit la sortie à 35 min en endurance fondamentale sans chercher à forcer, et on décale la sortie longue du dimanche de 10% pour compenser."  },  "athlete\_context": {    "target\_goal": "Semi-marathon en 1h30",    "weeks\_before\_race": 4,    "recent\_metrics": {      "atl\_fatigue": 65.4,@      "ctl\_fitness": 58.2,      "tsb\_form": \-7.2,      "sleep\_score\_last\_night": 74,      "hrv\_status": "balanced"    }  },  "post\_run\_feedback": {    "rpe": 4,    "perceived\_legs": "fresh",    "text\_comment": "Couru sur tapis, nickel."  }} |
| :---- |

