# Application Service

## Overview
Application workflow/state machine (préinscription → dossier → inscription), admin decisions, history/audit.

## Tech
- **Language**: Go 1.23
- **Framework**: Gin (HTTP) + GORM (ORM)
- **Database**: PostgreSQL 16

## State Machine

```
DRAFT → SUBMITTED → UNDER_REVIEW → ACCEPTED
                                  → REJECTED
                                  → WAITLISTED → ACCEPTED
                                               → REJECTED
```

## API Endpoints

| Method  | Path                                | Description                          |
|---------|-------------------------------------|--------------------------------------|
| GET     | `/health`                           | Health check                         |
| GET     | `/applications`                     | List all applications                |
| GET     | `/applications?candidate_id=xxx`    | Filter by candidate                  |
| GET     | `/applications/:id`                 | Get application with decisions & history |
| POST    | `/applications`                     | Create new application (DRAFT)       |
| PATCH   | `/applications/:id/transition`      | Transition status (state machine)    |

## Local Development

```bash
# Start dependencies
docker-compose up -d postgres

# Run the service
cp .env.example .env
go run ./cmd/server
```

## Docker

```bash
docker-compose up --build
```

The API will be available at `http://localhost:3005`.
