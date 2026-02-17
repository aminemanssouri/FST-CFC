# FST-CFC
 
## Overview
FST-CFC is a microservices-based platform to manage the end-to-end lifecycle of higher-education programs and student applications:
institutions management, program publishing, registration windows, candidate applications (préinscription/dossier/inscription), document uploads, notifications, and reporting.
 
The repository is organized as a monorepo where each microservice lives under `services/`, and shared operational tooling lives under `infra/`, `scripts/`, and `docs/`.
 
## Architecture (high level)
- **Entry point**: `api-gateway-bff` exposes a unified HTTP API for the front-end(s) and routes/aggregates calls to backend services.
- **Service ownership**: each domain capability is isolated in its own service with its own database (where needed).
- **Messaging (optional)**: asynchronous events can be exchanged through RabbitMQ (or Kafka for higher scale).
- **Observability**: OpenTelemetry for tracing/metrics/log correlation, with Grafana/Tempo/Loki as the visualization stack.
 
## Services
- **API Gateway / BFF** (`services/api-gateway-bff`)
  - Node.js (TypeScript), stateless
  - Routing, aggregation, light validation, rate limit, correlation-id
- **Auth & RBAC Service** (`services/auth-rbac-service`)
  - Java (Spring Boot) or Kotlin + PostgreSQL
  - Users, roles, permissions, scoped assignments, tokens (or Keycloak integration)
- **Institution Service** (`services/institution-service`)
  - Java/Kotlin + PostgreSQL
  - Institutions (établissements) and institution-admin management
- **Program Service** (`services/program-service`)
  - Java/Kotlin + PostgreSQL
  - Programs/formations, publication/archivage, registration windows, eligibility rules
- **Application Service** (`services/application-service`)
  - C# (.NET) + PostgreSQL
  - Application state machine/workflows, admin decisions, history/audit
- **Document Service** (`services/document-service`)
  - Go + S3/MinIO + PostgreSQL (metadata)
  - Secure upload, signed URLs, optional antivirus hook, versioning
- **Notification Service** (`services/notification-service`)
  - Python (FastAPI) or Node.js + MongoDB (+ optional Redis queue)
  - Templates, email/in-app notifications, retries, DLQ
- **Reporting / Analytics** (`services/reporting-analytics`)
  - Python + ClickHouse (or PostgreSQL read replica)
  - Aggregates, dashboards, exports
- **Scheduler / Jobs** (`services/scheduler-jobs`)
  - Go or Python, stateless
  - Cron/worker jobs (auto-close, reminders)
 
## Repository structure
- `services/` microservices source code
- `infra/` docker/k8s/observability/messaging configs
- `docs/` architecture docs, ADRs, API contracts
- `libs/` shared libraries/contracts (when applicable)
- `scripts/` automation scripts for dev/CI
 
## Tech stack (summary)
- **Datastores**: PostgreSQL, MongoDB, (optional) ClickHouse
- **Cache/Queue**: Redis (cache and/or queue)
- **Messaging**: RabbitMQ (or Kafka)
- **Object storage**: S3 compatible (MinIO in local)
- **Observability**: OpenTelemetry + Grafana/Tempo/Loki
 
## Local development
TODO: add a root `docker-compose.yml` under `infra/docker/` to start dependencies (PostgreSQL, MongoDB, Redis, RabbitMQ, MinIO, observability stack).
 
TODO: add per-service start instructions inside each service `README.md`.
 
## Configuration
TODO: define environment variables conventions (naming, secrets handling), and provide `.env.example` files.
