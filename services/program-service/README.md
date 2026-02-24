# Program Service

> **Go** microservice responsible for managing formations (programs), their lifecycle, and registration windows.

## What This Service Does
- CRUD operations on **formations** (create, read, update, delete)
- Manage the **formation lifecycle**: `BROUILLON → PUBLIEE → ARCHIVEE`
- Open/close **registration windows** with date ranges
- Check **eligibility** (is formation published? are registrations open?)
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
- **PostgreSQL** running on port `5434` (or via Docker)
- **JWT_SECRET** shared with all services

## Setup

### 1. Clone & configure
```bash
cd services/program-service
cp .env.example .env
# Edit .env with your values
```

### 2. Environment Variables
| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | HTTP server port | `3004` |
| `DB_HOST` | PostgreSQL host | `localhost` |
| `DB_PORT` | PostgreSQL port | `5434` |
| `DB_USER` | Database user | `program_user` |
| `DB_PASSWORD` | Database password | `program_pass` |
| `DB_NAME` | Database name | `program_db` |
| `DB_SSLMODE` | SSL mode for DB | `disable` |
| `JWT_SECRET` | JWT signing secret | *(required)* |

### 3. Run database migration
```bash
# The migration file is in migrations/001_init.up.sql
psql -h localhost -p 5434 -U program_user -d program_db -f migrations/001_init.up.sql
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
| `GET` | `/api/programs` | *Public* | List all published programs |
| `GET` | `/api/programs/:id` | *Public* | Get program details |
| `POST` | `/api/programs` | `ADMIN_ETABLISSEMENT` | Create a new program |
| `PUT` | `/api/programs/:id` | `ADMIN_ETABLISSEMENT` | Update a program |
| `PATCH` | `/api/programs/:id/publish` | `ADMIN_ETABLISSEMENT` | Publish a program |
| `PATCH` | `/api/programs/:id/archive` | `ADMIN_ETABLISSEMENT` | Archive a program |
| `PUT` | `/api/programs/:id/registrations` | `COORDINATEUR` | Open/close registration window |

## Project Structure
```
program-service/
├── cmd/server/main.go          # Entry point
├── internal/
│   ├── config/config.go        # Env loading
│   ├── model/program.go        # Data models
│   ├── handler/program.go      # HTTP handlers
│   ├── repository/program.go   # Database queries
│   ├── router/router.go        # Routes + middleware
│   └── middleware/auth.go      # JWT auth middleware
├── migrations/                 # SQL migrations
├── Dockerfile
├── docker-compose.yml
└── go.mod
```

## What Other Devs Need To Do
1. **Auth Service** must issue JWTs with the same `JWT_SECRET` and include `role` in the payload
2. **API Gateway** must proxy requests to `http://program-service:3004`
3. **Scheduler Jobs** service needs access to `POST /internal/jobs/close-registrations` for auto-closing expired registrations
4. **Notification Service** — when a formation is published or registrations close, publish events to RabbitMQ (not yet implemented, needs integration)
