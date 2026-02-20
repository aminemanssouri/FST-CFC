# Document Service

## Overview
Secure upload, presigned download URLs, versioning, optional antivirus hook.

## Tech
- **Language**: Go 1.23
- **Framework**: Gin (HTTP) + GORM (ORM)
- **Database**: PostgreSQL 16 (metadata)
- **Object Storage**: S3-compatible (MinIO for local dev)

## API Endpoints

| Method  | Path                        | Description                          |
|---------|-----------------------------|--------------------------------------|
| GET     | `/health`                   | Health check                         |
| GET     | `/documents`                | List all documents                   |
| GET     | `/documents?owner_id=xxx`   | Filter by owner                      |
| GET     | `/documents/:id`            | Get document metadata                |
| POST    | `/documents`                | Upload file (multipart/form-data)    |
| GET     | `/documents/:id/download`   | Get presigned download URL           |
| DELETE  | `/documents/:id`            | Delete document (S3 + DB)            |

### Upload Example

```bash
curl -X POST http://localhost:3006/documents \
  -F "owner_id=candidate-123" \
  -F "file=@/path/to/document.pdf"
```

## Local Development

```bash
# Start dependencies
docker-compose up -d postgres minio

# Run the service
cp .env.example .env
go run ./cmd/server
```

## Docker

```bash
docker-compose up --build
```

- API: `http://localhost:3006`
- MinIO Console: `http://localhost:9001` (login: `minioadmin` / `minioadmin`)
