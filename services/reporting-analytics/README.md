# Reporting & Analytics Microservice

## Overview

This microservice provides reporting and analytics capabilities for the CFC (Centre de Formation Continue) system. It consumes events from other services and exposes aggregated statistics through REST APIs.

## Architecture

- **Domain Layer**: Core business logic and entities
- **Infrastructure Layer**: Database connections and external integrations
- **Application Layer**: HTTP controllers and event consumers (not yet implemented)

## Setup

### Prerequisites

- Node.js (v18+)
- MongoDB (running locally or accessible via connection string)
- TypeScript

### Installation

```bash
cd services/reporting-analytics
npm install
```

### Environment Variables

Create a `.env` file in the root directory:

```env
MONGO_URI=mongodb://localhost:27017
DB_NAME=cfc_reporting
```

## Testing

### 1. In-Memory Tests (Quick)

Tests the domain logic without database dependencies:

```bash
npm run test:example
```

### 2. MongoDB Integration Tests

Tests the full stack with real MongoDB:

```bash
# Make sure MongoDB is running
npm run test:mongo
```

This will:
- Connect to MongoDB
- Seed test data
- Run queries for different user roles
- Test RBAC permissions
- Clean up test data

### 3. Expected Test Output

```
=== MongoDB Reporting Test Results ===
Global stats (SuperAdmin): 2 records
  - Program prog-1: 31 applications, 0.10 conversion rate
  - Program prog-2: 62 applications, 0.11 conversion rate
Institution stats (Admin): 1 records
  - Program prog-1: 31 applications
Program stats (Coordinator): 1 records
  - Program prog-1: 31 applications
✓ Permission check passed - Admin denied access to global stats
=== All tests completed successfully ===
```

## Domain Model

### Core Entities

- **UserContext**: Represents authenticated user with roles and permissions
- **EnrollmentStats**: Aggregated enrollment data per program/period
- **ReportQuery**: Filters for querying statistics
- **ReportingService**: Core business logic with RBAC enforcement

### Roles & Permissions

- **SUPER_ADMIN**: Can access all data across all institutions
- **ADMIN_ETABLISSEMENT**: Can access data only for their institution
- **COORDINATEUR**: Can access data only for their assigned programs

## Database Schema

### enrollment_stats Collection

```javascript
{
  institutionId: string,
  programId: string,
  periodStart: Date,
  periodEnd: Date,
  countPreinscription: number,
  countDossierSoumis: number,
  countEnCoursValidation: number,
  countAccepte: number,
  countRefuse: number,
  countInscrit: number
}
```

### program_stats Collection

```javascript
{
  institutionId: string,
  programId: string,
  academicYear: string,
  totalApplications: number,
  conversionRateToInscrit: number,
  acceptanceRate: number
}
```

## Next Steps

1. **HTTP Controllers**: Add REST endpoints for reporting APIs
2. **Event Consumers**: Connect to message broker to consume events from other services
3. **Authentication**: Integrate with auth service for JWT validation
4. **API Documentation**: Add OpenAPI/Swagger documentation
5. **Unit Tests**: Add comprehensive unit test coverage
6. **Performance**: Add indexing and query optimization

## Development

### Local Development

```bash
# Development mode with hot reload
npm run start:dev

# Build for production
npm run build

# Start production server
npm start
```

### Docker Development

#### Prerequisites
- Docker Desktop installed
- Docker Compose

#### Quick Start

```bash
# Build and start all services
docker-compose up --build

# Run in background
docker-compose up -d --build

# View logs
docker-compose logs -f reporting-analytics

# Stop services
docker-compose down
```

#### Docker Services

- **mongodb**: MongoDB 7.0 on port 27018 (mapped to avoid conflicts with local MongoDB)
- **reporting-analytics**: Your service on port 3011 (mapped to avoid conflicts with local service)

#### Environment Variables in Docker

The docker-compose.yml includes these environment variables:
- `MONGO_URI=mongodb://admin:password@mongodb:27017`
- `DB_NAME=cfc_reporting`
- `PORT=3010`

#### Testing with Docker

Once services are running:

```bash
# Health check
curl http://localhost:3011/health

# Demo data
curl http://localhost:3011/reports/example

# Global stats (SuperAdmin)
curl http://localhost:3011/api/reports/global?role=SUPER_ADMIN

# Institution stats (Admin)
curl http://localhost:3011/api/reports/institution/inst-demo?role=ADMIN_ETABLISSEMENT&institutionId=inst-demo

# Program stats (Coordinator)
curl http://localhost:3011/api/reports/program/prog-demo?role=COORDINATEUR&programIds=prog-demo
```

#### Docker Production Deployment

```bash
# Build production image
docker build -t cfc-reporting-analytics .

# Run with external MongoDB
docker run -d \
  --name cfc-reporting \
  -p 3010:3010 \
  -e MONGO_URI=mongodb://your-mongo-host:27017 \
  -e DB_NAME=cfc_reporting \
  cfc-reporting-analytics
```
