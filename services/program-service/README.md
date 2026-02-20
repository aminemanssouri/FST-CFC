# Program Service

## Overview
CRUD formation, publication/archivage, registration windows, eligibility rules.

## Tech
- **Language**: Go 1.23
- **Framework**: Gin (HTTP) + GORM (ORM)
- **Database**: PostgreSQL 16

## API Endpoints

| Method  | Path                              | Description                        |
|---------|-----------------------------------|------------------------------------|
| GET     | `/health`                         | Health check                       |
| GET     | `/programs`                       | List all programs                  |
| GET     | `/programs/:id`                   | Get a program by ID                |
| POST    | `/programs`                       | Create a new program               |
| PUT     | `/programs/:id`                   | Update a program                   |
| DELETE  | `/programs/:id`                   | Soft-delete a program              |
| PATCH   | `/programs/:id/publish`           | Publish a program                  |
| PATCH   | `/programs/:id/archive`           | Archive a program                  |
| GET     | `/programs/:programId/windows`    | List registration windows          |
| POST    | `/programs/:programId/windows`    | Create a registration window       |
| PUT     | `/windows/:id`                    | Update a registration window       |
| DELETE  | `/windows/:id`                    | Delete a registration window       |

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

The API will be available at `http://localhost:3004`.
