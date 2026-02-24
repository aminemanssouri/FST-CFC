# Application Service

> **Go** microservice responsible for managing candidate applications (inscriptions), their state machine, and admin decisions.

## What This Service Does
- Create and manage **candidate inscriptions** (applications)
- Implement the **inscription lifecycle**: `PREINSCRIPTION → DOSSIER_SOUMIS → EN_VALIDATION → ACCEPTE/REFUSE → INSCRIT`
- **Admin decisions**: accept or refuse applications
- Track application **history and audit trail**
- Role-based access control via JWT middleware

## Tech Stack
| Component | Technology |
|-----------|-----------|
| Language | Go 1.21+ |
| Framework | Gin (HTTP router) |
| Database | PostgreSQL 15 |
| Auth | JWT (golang-jwt/v5) |
| Container | Docker |

## Prerequisites
- **Go 1.21+** installed
- **PostgreSQL** running on port `5435` (or via Docker)
- **JWT_SECRET** shared with all services

## Setup

### 1. Clone & configure
```bash
cd services/application-service
cp .env.example .env
```

### 2. Environment Variables
| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | HTTP server port | `3005` |
| `DB_HOST` | PostgreSQL host | `localhost` |
| `DB_PORT` | PostgreSQL port | `5435` |
| `DB_USER` | Database user | `application_user` |
| `DB_PASSWORD` | Database password | `application_pass` |
| `DB_NAME` | Database name | `application_db` |
| `DB_SSLMODE` | SSL mode for DB | `disable` |
| `JWT_SECRET` | JWT signing secret | *(required)* |

### 3. Run database migration
```bash
psql -h localhost -p 5435 -U application_user -d application_db -f migrations/001_init.up.sql
```

### 4. Run locally
```bash
go mod download
go run cmd/server/main.go
```

### 5. Run with Docker
```bash
docker compose up --build
```

## API Endpoints
| Method | Path | Role Required | Description |
|--------|------|---------------|-------------|
| `GET` | `/api/applications` | `ADMIN_ETABLISSEMENT` | List all applications |
| `GET` | `/api/applications/:id` | `CANDIDAT` / `ADMIN` | Get application details |
| `POST` | `/api/applications` | `CANDIDAT` | Create new application |
| `PATCH` | `/api/applications/:id/submit` | `CANDIDAT` | Submit application (attach documents) |
| `PATCH` | `/api/applications/:id/status` | `ADMIN_ETABLISSEMENT` | Accept or refuse application |

## Inscription State Machine
```
PREINSCRIPTION → DOSSIER_SOUMIS → EN_VALIDATION → ACCEPTE → INSCRIT
                                                 → REFUSE
```

## What Other Devs Need To Do
1. **Auth Service** must issue JWTs with `role` and `user_id` in the payload
2. **Document Service** must be called first to upload files, then pass document URLs when submitting
3. **Institution Service** — when admin validates, the app service calls Institution Service to verify the admin's scope (admin can only validate applications for their own establishment)
4. **Notification Service** — after accept/refuse, publish `ApplicationAccepted` or `ApplicationRefused` events to RabbitMQ so the Notification Service can email the candidate
5. **API Gateway** must proxy requests to `http://application-service:3005`
