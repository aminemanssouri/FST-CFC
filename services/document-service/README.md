# Document Service

> **Go** microservice responsible for secure file uploads, storage (S3/MinIO), and presigned URL generation for candidate documents.

## What This Service Does
- **Upload** candidate documents (CV, diplôme, photo d'identité) to S3-compatible storage
- Store **document metadata** in PostgreSQL (filename, URL, inscription link)
- Generate **presigned download URLs** with configurable expiry
- Role-based access control via JWT middleware

## Tech Stack
| Component | Technology |
|-----------|-----------|
| Language | Go 1.21+ |
| Framework | Gin (HTTP router) |
| Database | PostgreSQL 15 (metadata) |
| Storage | S3-compatible (MinIO locally) |
| Auth | JWT (golang-jwt/v5) |
| Container | Docker |

## Prerequisites
- **Go 1.21+** installed
- **PostgreSQL** running on port `5436`
- **MinIO** (or any S3-compatible storage) running on port `9000`
- **JWT_SECRET** shared with all services

## Setup

### 1. Clone & configure
```bash
cd services/document-service
cp .env.example .env
```

### 2. Environment Variables
| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | HTTP server port | `3006` |
| `DB_HOST` | PostgreSQL host | `localhost` |
| `DB_PORT` | PostgreSQL port | `5436` |
| `DB_USER` | Database user | `document_user` |
| `DB_PASSWORD` | Database password | `document_pass` |
| `DB_NAME` | Database name | `document_db` |
| `DB_SSLMODE` | SSL mode | `disable` |
| `S3_ENDPOINT` | MinIO/S3 endpoint | `localhost:9000` |
| `S3_ACCESS_KEY` | S3 access key | `minioadmin` |
| `S3_SECRET_KEY` | S3 secret key | `minioadmin` |
| `S3_BUCKET` | S3 bucket name | `documents` |
| `S3_USE_SSL` | Use SSL for S3 | `false` |
| `PRESIGN_EXPIRY_MINUTES` | Presigned URL duration | `15` |
| `JWT_SECRET` | JWT signing secret | *(required)* |

### 3. Start MinIO (if not using Docker Compose)
```bash
docker run -d --name minio -p 9000:9000 -p 9001:9001 \
  -e MINIO_ROOT_USER=minioadmin -e MINIO_ROOT_PASSWORD=minioadmin \
  minio/minio server /data --console-address ":9001"
```

### 4. Run database migration
```bash
psql -h localhost -p 5436 -U document_user -d document_db -f migrations/001_init.up.sql
```

### 5. Run locally
```bash
go mod download
go run cmd/server/main.go
```

### 6. Run with Docker
```bash
docker compose up --build
```

## API Endpoints
| Method | Path | Role Required | Description |
|--------|------|---------------|-------------|
| `POST` | `/api/documents/upload` | `CANDIDAT` | Upload files (multipart/form-data) |
| `GET` | `/api/documents/:id` | `CANDIDAT` / `ADMIN` | Get document metadata + presigned URL |
| `GET` | `/api/documents/inscription/:id` | `ADMIN_ETABLISSEMENT` | List all documents for an inscription |
| `DELETE` | `/api/documents/:id` | `ADMIN_ETABLISSEMENT` | Delete a document |

## What Other Devs Need To Do
1. **Web App** must upload files via `POST /api/documents/upload` (multipart) during the registration step 3
2. **Application Service** receives the document URLs returned by this service when the candidate submits their application
3. **Admin Dashboard** (DossierDetail page) calls `GET /api/documents/inscription/:id` to list all documents for a dossier and display download links
4. **MinIO** must be running and the bucket `documents` must exist (the service auto-creates it on startup)
