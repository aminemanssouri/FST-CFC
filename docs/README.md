# Documentation UML — Projet FST-CFC

Ce dossier contient l'ensemble des diagrammes UML qui modélisent l'architecture et le fonctionnement du système **CFC (Centre de Formation Continue)**. Chaque fichier `.puml` représente un type de diagramme UML, rédigé au format PlantUML.

---

## 1. Diagramme de Cas d'Utilisation (`1_use_cases.puml`)

Ce diagramme identifie les **acteurs** du système et les **fonctionnalités** auxquelles chacun a accès.

### Acteurs :
| Acteur | Rôle |
|--------|------|
| **Super Admin** | Gère les établissements, les admins, les configurations globales et consulte le reporting |
| **Admin Établissement** | Gère les formations (créer, publier, archiver) et valide/refuse les dossiers des candidats |
| **Coordinateur** | Gère la période d'inscription (ouvrir/fermer les dates) pour une formation |
| **Candidat** | Consulte le catalogue, se préinscrit, dépose un dossier et reçoit des notifications |
| **Système (Cron)** | Ferme automatiquement les inscriptions à la date d'expiration |

### Cas d'utilisation principaux :
- **UC1** : Gérer les établissements et admins (Super Admin)
- **UC2** : Gérer les configurations globales (Super Admin)
- **UC3** : Consulter le reporting global (Super Admin)
- **UC4** : Gérer les formations — Créer / Publier / Archiver (Admin Établissement)
- **UC5** : Valider ou refuser les dossiers (Admin Établissement)
- **UC6** : Gérer la période d'inscription — Ouvrir / Fermer (Coordinateur)
- **UC7** : Consulter le catalogue des formations (Candidat)
- **UC8** : Se préinscrire et déposer un dossier (Candidat)
- **UC9** : Recevoir des notifications (Candidat)
- **UC10** : Fermer automatiquement les inscriptions (Système / Cron)

---

## 2. Diagramme de Classes (`2_class_diagram.puml`)

Ce diagramme représente les **entités métier** du système et leurs **relations**, réparties par microservice.

### Entités par service :
| Service | Entités | Description |
|---------|---------|-------------|
| **Auth & RBAC Service** | `Utilisateur`, `Role`, `Permission` | Gestion des utilisateurs et du contrôle d'accès par rôle |
| **Institution Service** | `Etablissement` | Représente un établissement de formation (lié à un admin via UUID) |
| **Program Service** | `Formation`, `EtatFormation` | Représente une formation avec son cycle de vie (BROUILLON → PUBLIEE → ARCHIVEE) |
| **Application Service** | `Inscription`, `EtatInscription` | Représente le dossier d'un candidat avec ses états (PREINSCRIPTION → ... → INSCRIT) |
| **Document Service** | `Document` | Représente un fichier déposé par le candidat (stocké sur MinIO) |

### Relations clés :
- Un **Utilisateur** possède un ou plusieurs **Rôles**, chaque rôle définit des **Permissions**
- Un **Établissement** propose plusieurs **Formations**
- Une **Formation** reçoit plusieurs **Inscriptions**
- Une **Inscription** inclut plusieurs **Documents**
- Les liens inter-services sont des **SoftLinks par UUID** (architecture microservices)

---

## 3. Diagrammes de Séquence (`3_sequence_diagrams.puml`)

Ces diagrammes montrent les **interactions chronologiques** entre les acteurs, les services et les bases de données pour chaque scénario fonctionnel.

### Scénario A : Le coordinateur ouvre les inscriptions
- Le coordinateur envoie une requête via l'**API Gateway (Nginx)** pour mettre à jour la fenêtre d'inscription
- L'**Auth Service (Laravel)** valide le token JWT
- Le **Program Service (Gin/Go)** vérifie que le coordinateur est bien responsable de la formation, puis met à jour les dates d'ouverture/fermeture dans **PostgreSQL**
- Si le coordinateur n'est pas autorisé → erreur 403

### Scénario B : Le candidat se préinscrit et soumet son dossier
- Le candidat consulte l'éligibilité d'une formation via l'**Institution Service (Laravel)**
- Il uploade ses documents via le **Document Service (Gin/Go)** qui les stocke sur **MinIO**
- Il soumet son dossier via l'**Application Service (Gin/Go)** qui crée une inscription dans **PostgreSQL**

### Scénario C : L'admin d'établissement valide ou refuse un dossier
- L'admin envoie une décision (ACCEPTE/REFUSE) via l'**Application Service**
- Le service vérifie que l'admin appartient au même établissement que la formation (via l'**Institution Service**)
- Si le périmètre est valide → l'état est mis à jour, un événement est publié sur **RabbitMQ**, et le **Notification Service (NestJS)** envoie un email au candidat
- Si le périmètre est invalide → erreur 403

### Scénario D : Fermeture automatique des inscriptions (Job planifié)
- Le **Scheduler Job (Express/Node.js)** déclenche une requête vers l'**Institution Service**
- Le service cherche toutes les formations dont la date de fermeture est dépassée et les ferme
- Un événement `RegistrationClosed` est publié sur **RabbitMQ** et le **Notification Service** notifie le coordinateur par email

---

## 4. Diagrammes d'État (`4_state_diagrams.puml`)

Ces diagrammes modélisent les **cycles de vie** (machines à états) des entités principales du système.

### Machine à états 1 : Cycle de vie d'une Formation
Gérée par l'**Institution Service (Laravel / PHP)** :

```
BROUILLON  →  PUBLIEE  →  ARCHIVEE
```

- **BROUILLON** : Formation créée, non visible dans le catalogue
- **PUBLIEE** : Formation visible, les inscriptions peuvent être ouvertes
- **ARCHIVEE** : Formation terminée, plus accessible

### Machine à états 2 : Période d'inscription (RegistrationPeriod)
Gérée par l'**Institution Service (Laravel / PHP)** :

```
Closed  ↔  Open
```

- La période peut être ouverte par le **Coordinateur**
- Elle se ferme automatiquement par le **Scheduler Job** (si `end_date < NOW` et `auto_close=true`), manuellement par le coordinateur, ou quand la **capacité maximale** est atteinte

### Machine à états 3 : Cycle de vie d'une Inscription
Gérée par l'**Application Service (Gin / Go)** :

```
PREINSCRIPTION → DOSSIER_SOUMIS → EN_VALIDATION → ACCEPTE → INSCRIT
                                                 → REFUSE
```

- **PREINSCRIPTION** : Le candidat initie son inscription
- **DOSSIER_SOUMIS** : Le candidat a soumis tous ses documents
- **EN_VALIDATION** : L'admin d'établissement examine le dossier
- **ACCEPTE** : Le dossier est validé par l'admin
- **REFUSE** : Le dossier est rejeté (état terminal)
- **INSCRIT** : Le candidat a finalisé son inscription — paiement ou dépôt physique (état terminal)

---

## 5. Diagramme d'Activités (`5_activity_diagram.puml`)

Ce diagramme modélise le **parcours complet du candidat**, depuis la consultation du catalogue jusqu'à la finalisation de l'inscription. Il utilise des **swimlanes** (couloirs) pour montrer la responsabilité de chaque acteur et service.

### Flux principal :
1. Le **Candidat** accède au site et consulte le catalogue des formations
2. L'**Institution Service (Laravel)** affiche les formations publiées avec établissements actifs
3. Le candidat choisit une formation
4. L'**Institution Service** vérifie l'éligibilité :
   - Formation en état `PUBLIEE` ?
   - `RegistrationPeriod.is_open = true` ?
   - Date courante dans l'intervalle `[start_date, end_date]` ?
   - Capacité restante (`current_applications < max_applications`) ?
5. Si éligible → le candidat remplit le formulaire de préinscription
6. Le **Document Service (Gin/Go)** uploade les fichiers vers **MinIO** et retourne les URLs
7. Le candidat soumet le dossier complet
8. L'**Application Service (Gin/Go)** crée l'inscription (`PREINSCRIPTION → DOSSIER_SOUMIS`)
9. Le **Notification Service (NestJS)** notifie l'admin d'établissement via RabbitMQ
10. L'**Admin Établissement** examine le dossier → l'état passe à `EN_VALIDATION`
11. Décision :
    - **Accepté** → état `ACCEPTE` → candidat finalise → état `INSCRIT` ✓
    - **Refusé** → état `REFUSE` → notification envoyée au candidat ✗

---

## Stack technique des services

| Service | Framework | Langage | Base de données |
|---------|-----------|---------|-----------------|
| API Gateway | Nginx | — | — |
| Auth Service | Laravel + Sanctum | PHP 8.2 | SQLite |
| Institution Service | Laravel | PHP 8.2 | SQLite |
| Program Service | Gin + GORM | Go 1.23 | PostgreSQL |
| Application Service | Gin + GORM | Go 1.23 | PostgreSQL |
| Document Service | Gin + GORM + MinIO SDK | Go 1.23 | PostgreSQL + MinIO |
| Notification Service | NestJS + Mongoose | Node.js (TypeScript) | MongoDB + RabbitMQ |
| Scheduler Job | Express | Node.js (TypeScript) | — |

> **Note :** Le dossier `web-app/` se trouve à la **racine du projet** (`/web-app`), en dehors du dossier `services/`.

---

## Comment visualiser les diagrammes

Les fichiers `.puml` peuvent être rendus avec :
- **Extension VS Code** : [PlantUML](https://marketplace.visualstudio.com/items?itemName=jebbs.plantuml) (Alt+D pour prévisualiser)
- **En ligne** : [PlantUML Server](https://www.plantuml.com/plantuml/uml/)
- **CLI** : `java -jar plantuml.jar docs/*.puml`

Les images générées sont stockées dans le dossier `images/`.
