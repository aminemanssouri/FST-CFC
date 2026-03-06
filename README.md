# FST-CFC — Plateforme de Gestion des Formations Continues

> **Projet réalisé par :**
>
> - **Ismail Bouaichi** — Filière DWAM25 — Services Go (Application Service, Document Service, Program Service) & Web App (React)
> - **Youness Raqi** — Filière IACTIC25 — Auth Service (Laravel) & API Gateway (Nginx)
> - **Amine Manssouri** — Filière DWAM25 — Notification Service (NestJS), Scheduler Job (Express), Reporting Analytics (Node.js)

---

## ⚠️ Configuration des e-mails (important — lire en premier)

Par défaut, le système utilise **MailHog** comme serveur SMTP de développement. Les e-mails envoyés après une inscription réussie (e-mail de bienvenue) sont **interceptés localement** et visibles via l'interface MailHog à l'adresse :

```
http://localhost:8025
```

> **Pour un environnement de production**, vous devez remplacer la configuration SMTP par un vrai fournisseur de messagerie (Gmail, Mailtrap, Amazon SES, etc.). Pour cela, modifiez les variables d'environnement du service `notification-service` dans le fichier `docker-compose.yml` à la racine :
>
> ```yaml
> notification-service:
>   environment:
>     SMTP_HOST: smtp.votre-fournisseur.com
>     SMTP_PORT: 587
>     SMTP_USER: votre-utilisateur
>     SMTP_PASS: votre-mot-de-passe
>     MAIL_FROM: no-reply@votre-domaine.com
> ```

Le **notification-service** est entièrement fonctionnel : templates Handlebars, envoi via Nodemailer, file d'attente RabbitMQ avec retry automatique (backoff exponentiel, 5 tentatives max) et dead-letter queue. Il suffit de brancher un fournisseur SMTP réel pour que les e-mails soient effectivement délivrés aux utilisateurs.

---

## 📋 Présentation du projet

**FST-CFC** est une plateforme web complète de gestion des formations continues destinée aux établissements universitaires. Elle permet de gérer l'ensemble du cycle de vie des formations : de la création et publication par les administrateurs, à l'inscription et le suivi des candidatures par les candidats.

L'architecture repose sur des **microservices** communiquant via une **API Gateway Nginx**, avec une **application React** en frontend.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Navigateur Web                           │
│                    http://localhost:3000                         │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                   API Gateway (Nginx)                            │
│                    http://localhost:3001                         │
│  Route les requêtes /api/* vers les microservices appropriés    │
└──┬──────┬──────┬──────┬──────┬──────┬──────┬────────────────────┘
   │      │      │      │      │      │      │
   ▼      ▼      ▼      ▼      ▼      ▼      ▼
 Auth  Instit. Appli. Document Notif. Report. Scheduler
 :8001  :8002  :3005   :3006   :3007  :3010   :3020
```

### Services et technologies

| Service | Technologie | Port | Base de données | Description |
|---------|-------------|------|-----------------|-------------|
| **api-gateway** | Nginx | 3001 | — | Reverse proxy, routage des requêtes |
| **auth-service** | Laravel + Sanctum (PHP 8.2) | 8001 | SQLite | Authentification, gestion des utilisateurs, configurations |
| **institution-service** | Laravel (PHP 8.2) | 8002 | SQLite | Gestion des établissements, formations, périodes d'inscription |
| **application-service** | Go (Gin + GORM) | 3005 | PostgreSQL (:5437) | Gestion des candidatures et machine à états |
| **document-service** | Go (Gin + GORM) | 3006 | PostgreSQL (:5436) + MinIO | Upload et stockage de documents (S3) |
| **notification-service** | NestJS (TypeScript) | 3007 | MongoDB (:27018) | Envoi d'e-mails via templates, file d'attente RabbitMQ |
| **reporting-analytics** | Node.js (TypeScript) | 3010 | MongoDB (:27017) | Statistiques et tableaux de bord analytiques |
| **scheduler-job** | Express (TypeScript) | 3020 | — | Tâches planifiées (fermeture automatique des inscriptions) |
| **web-app** | React + Vite + TailwindCSS | 3000 | — | Interface utilisateur SPA (dossier à la racine du projet) |

### Infrastructure

| Service | Port | Usage |
|---------|------|-------|
| **RabbitMQ** | 5672 / 15672 | File de messages (AMQP) + interface de gestion |
| **MailHog** | 1025 / 8025 | Serveur SMTP de développement + interface web |
| **MinIO** | 9000 / 9001 | Stockage objet compatible S3 (documents des candidats) |

---

## 🚀 Installation et lancement

### Prérequis

- **Docker** et **Docker Compose** installés
- **Git** pour cloner le projet
- Au minimum **8 Go de RAM** disponibles (20 conteneurs lancés simultanément)

### Lancement rapide

```bash
# 1. Cloner le dépôt
git clone <url-du-depot> FST-CFC
cd FST-CFC

# 2. Lancer tous les services
docker compose up -d --build

# 3. Attendre ~2 minutes que tous les services démarrent
# Vérifier que tout est opérationnel :
docker ps --format "table {{.Names}}\t{{.Status}}"
```

### Accès

| Interface | URL |
|-----------|-----|
| Application web | http://localhost:3000 |
| API Gateway | http://localhost:3001 |
| MailHog (e-mails interceptés) | http://localhost:8025 |
| RabbitMQ Management | http://localhost:15672 (guest/guest) |
| MinIO Console | http://localhost:9001 (minioadmin/minioadmin) |

---

## 👥 Rôles et accès

Le système gère 4 rôles utilisateurs :

| Rôle | Accès | Dashboard |
|------|-------|-----------|
| **Super Admin** | Accès complet : établissements, formations, utilisateurs, candidatures, configurations, reporting | `/super-admin` |
| **Administrateur d'établissement** | Gestion des formations et candidatures de son établissement | `/admin` |
| **Coordinateur** | Gestion des formations (créer, éditer, publier, archiver, désarchiver), traitement des candidatures, gestion des périodes d'inscription | `/admin` |
| **Candidat** | Consulter le catalogue, postuler, suivre ses candidatures, déposer des documents | `/dashboard` |

### Comptes par défaut (après seed)

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Super Admin | `admin@cfc.local` | `password` |
| Admin Établissement | `admin.etablissement@cfc.local` | `password` |

---

## 📚 Fonctionnalités principales

### Cas d'utilisation implémentés

| # | Cas d'utilisation | Acteur(s) | Description |
|---|-------------------|-----------|-------------|
| UC1 | Gérer les établissements | Super Admin | CRUD complet des établissements universitaires |
| UC2 | Gérer les configurations | Super Admin | Paramètres système clé/valeur |
| UC3 | Consulter le reporting global | Super Admin | Statistiques globales, par établissement, par utilisateur |
| UC4 | Gérer les formations | Admin, Coordinateur | Créer, éditer, publier, archiver, désarchiver des formations |
| UC5 | Gérer les utilisateurs | Super Admin | CRUD utilisateurs, attribution des rôles, activation/désactivation |
| UC6 | Gérer la période d'inscription | Coordinateur, Admin | Ouvrir/fermer les périodes d'inscription par formation |
| UC7 | Consulter le catalogue | Public | Parcourir les formations publiées avec inscriptions ouvertes |
| UC8 | S'inscrire et postuler | Candidat | Inscription en 3 étapes (infos personnelles, choix de formation, dépôt de documents) |
| UC9 | Suivre sa candidature | Candidat | Tableau de bord candidat, historique des états |
| UC10 | Traiter les candidatures | Admin, Coordinateur | Examiner les dossiers, accepter/refuser les candidats |

### Cycle de vie des formations

```
Brouillon (draft) ──► Publiée (published) ──► Archivée (archived)
     ▲                                              │
     └──────────── Désarchiver ◄────────────────────┘
```

### Machine à états des candidatures

```
PREINSCRIPTION → DOSSIER_SOUMIS → EN_VALIDATION → ACCEPTE → INSCRIT
                                                 → REFUSE
```

### Gestion documentaire (Pièces justificatives)

Les candidats déposent leurs pièces justificatives (CV, diplômes, photos) lors de l'inscription :
- Stockés dans **MinIO** (compatible S3)
- Téléchargeables en streaming par les administrateurs via le document-service
- Consultables dans le détail de chaque candidature (onglet « Pièces Justificatives »)

---

## 🔐 Authentification

Le système utilise un **double mécanisme d'authentification** :

| Token | Usage | Services cibles |
|-------|-------|-----------------|
| **Sanctum (Bearer Token)** | Authentification utilisateur classique | auth-service, institution-service |
| **JWT** | Communication inter-services | application-service, document-service |

Les deux tokens sont générés simultanément lors du login et stockés côté client (`auth_token` pour Sanctum, `auth_jwt` pour JWT). Le mapping des rôles entre les services Laravel (anglais minuscule) et Go (français majuscule) est géré automatiquement par le `JwtService`.

---

## 📁 Structure du projet

```
FST-CFC/
├── docker-compose.yml              # Orchestration de tous les services
├── FST-CFC.postman_collection.json # Collection Postman pour tester l'API
├── FST-CFC.postman_environment.json# Variables d'environnement Postman
├── docs/                           # Diagrammes UML (PlantUML)
│   ├── 1_use_cases.puml            # Diagramme de cas d'utilisation
│   ├── 2_class_diagram.puml        # Diagramme de classes
│   ├── 3_sequence_diagrams.puml    # Diagrammes de séquence
│   ├── 4_state_diagrams.puml       # Diagrammes d'états
│   └── 5_activity_diagram.puml     # Diagramme d'activité
├── web-app/                        # React/Vite — Interface utilisateur (à la racine)
├── services/
│   ├── auth-service/               # Laravel (PHP 8.2) — Authentification & utilisateurs
│   ├── institution-service/        # Laravel (PHP 8.2) — Établissements & formations
│   ├── application-service/        # Go (Gin + GORM) — Candidatures & machine à états
│   ├── document-service/           # Go (Gin + GORM) — Stockage de fichiers (MinIO/S3)
│   ├── notification-service/       # NestJS — E-mails & notifications
│   ├── reporting-analytics/        # Node.js — Statistiques & analytics
│   ├── scheduler-job/              # Express — Tâches planifiées
│   └── gateway/                    # Nginx — API Gateway
├── libs/                           # Bibliothèques partagées
├── infra/                          # Configuration infrastructure
└── scripts/                        # Scripts utilitaires
```

---

## 🌐 Routes API (Gateway)

Toutes les requêtes passent par le gateway sur le port **3001** :

| Route | Service cible | Description |
|-------|---------------|-------------|
| `/api/register`, `/api/login`, `/api/logout` | auth-service | Authentification |
| `/api/profile` | auth-service | Profil utilisateur |
| `/api/users/*` | auth-service | Gestion des utilisateurs (Super Admin) |
| `/api/configurations/*` | auth-service | Configurations système |
| `/api/reports/*` | auth-service | Reporting |
| `/api/formations/*` | institution-service | Formations (CRUD + publier/archiver/désarchiver) |
| `/api/establishments/*` | institution-service | Établissements |
| `/api/catalog` | institution-service | Catalogue public des formations |
| `/api/stats/*` | institution-service | Statistiques par établissement |
| `/api/inscriptions/*` | application-service | Candidatures |
| `/api/documents/*` | document-service | Documents (upload/téléchargement) |
| `/api/notifications/*` | notification-service | Notifications |
| `/api/analytics/*` | reporting-analytics | Analytiques |
| `/health/*` | tous | Vérification de santé par service |

---

## 🛠️ Commandes utiles

```bash
# Lancer tous les services
docker compose up -d --build

# Reconstruire un service spécifique
docker compose up -d --build web-app

# Voir les logs d'un service
docker logs fst-cfc-auth-service-1 --tail 50

# Accéder à la base de données auth
docker exec -it fst-cfc-auth-db-1 psql -U auth_user -d auth_db

# Accéder à la base institution
docker exec -it fst-cfc-institution-db-1 psql -U institution_user -d institution_db

# Accéder à la base application
docker exec -it fst-cfc-application-db-1 psql -U app_user -d application_db

# Lancer les migrations auth-service
docker exec fst-cfc-auth-service-1 php artisan migrate

# Lancer les seeds (données de test)
docker exec fst-cfc-auth-service-1 php artisan db:seed

# Arrêter tous les services
docker compose down

# Arrêter et supprimer les volumes (reset complet)
docker compose down -v
```

---

## 📊 Diagrammes UML

Les diagrammes du projet sont disponibles dans le dossier `docs/` au format PlantUML :

1. **Cas d'utilisation** (`1_use_cases.puml`) — Vue d'ensemble des acteurs et fonctionnalités
2. **Diagramme de classes** (`2_class_diagram.puml`) — Modèle de données et relations
3. **Diagrammes de séquence** (`3_sequence_diagrams.puml`) — Flux d'interaction entre services
4. **Diagrammes d'états** (`4_state_diagrams.puml`) — Machine à états des candidatures et formations
5. **Diagramme d'activité** (`5_activity_diagram.puml`) — Processus métier

---

## 🧪 Tests

```bash
# Tests auth-service (PHPUnit)
docker exec fst-cfc-auth-service-1 php artisan test

# Tests institution-service (PHPUnit)
docker exec fst-cfc-institution-service-1 php artisan test

# Collection Postman
# Importer FST-CFC.postman_collection.json dans Postman
# Importer FST-CFC.postman_environment.json pour les variables d'environnement
```

---

## 📝 Notes techniques

- **Frontend** : L'application React utilise Vite comme bundler, TailwindCSS pour le styling, et React Router pour la navigation. Toutes les requêtes API passent par un client centralisé (`api.js`) avec retry automatique (2 tentatives pour les erreurs 503/422).
- **Streaming de documents** : Les fichiers sont téléchargés en streaming directement via le document-service (pas de presigned URLs) pour éviter les problèmes de réseau Docker interne.
- **Double authentification** : Les services Laravel utilisent Sanctum, les services Go utilisent JWT. Le mapping des rôles est géré automatiquement par le `JwtService` du auth-service.
- **20 conteneurs** : Le projet complet lance 20 conteneurs Docker. Assurez-vous d'avoir suffisamment de ressources système (8 Go RAM minimum recommandé).
- **Notification-service** : Architecture complète avec API (NestJS) + Worker (consommateur RabbitMQ), templates Handlebars stockés en MongoDB, retry avec backoff exponentiel et dead-letter queue.

---

*Projet réalisé dans le cadre de la formation à la FST — Faculté des Sciences et Techniques.*
