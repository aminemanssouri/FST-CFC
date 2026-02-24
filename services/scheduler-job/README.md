# Scheduler Job Microservice

## Overview

This microservice runs scheduled background jobs for the CFC system, in particular the **Close Registrations** job which:

- Finds programs whose registration period has ended
- Closes their registration window
- Auto-expires pending applications
- Notifies stakeholders via the notification service

It is fully independent and communicates with other microservices via HTTP.

## Configuration

Environment variables:

- `PORT` (default: `3020`)
- `PROGRAM_SERVICE_BASE_URL` (e.g. `http://program-service:3000`)
- `APPLICATION_SERVICE_BASE_URL` (e.g. `http://application-service:3001`)
- `NOTIFICATION_SERVICE_BASE_URL` (e.g. `http://notification-service:3002`)
- `JOB_INTERVAL_SECONDS` (default: `3600` = 1 hour)

## Endpoints

### `GET /health`
- **Description**: Health check for the scheduler service.
- **Request**: no body, no params.
- **Response**:
  ```json
  {
    "status": "ok",
    "service": "scheduler-job",
    "schedulerRunning": true,
    "time": "2026-02-23T18:30:00.000Z"
  }
  ```

### `POST /jobs/close-registrations/run`
- **Description**: Manually trigger the close-registrations job.
- **Request body** (optional):
  ```json
  {
    "dryRun": false,
    "limit": 100,
    "referenceDate": "2026-02-23T00:00:00Z"
  }
  ```
- **Behavior**:
  - If `dryRun = true`, only simulates and does not call write endpoints.
  - Otherwise:
    - Calls ProgramService: `/api/programs/registrations-to-close`.
    - Calls ApplicationService: `/api/applications/auto-expire`.
    - Calls NotificationService: `/api/notifications/registration-closed`.
- **Response** (example):
  ```json
  {
    "job": "close-registrations",
    "dryRun": false,
    "referenceDate": "2026-02-23T00:00:00Z",
    "processedPrograms": 3,
    "processedApplications": 42,
    "details": [
      {
        "program": {
          "id": "prog-1",
          "institutionId": "inst-1",
          "registrationCloseDate": "2026-02-20T00:00:00Z"
        },
        "autoExpire": {
          "programId": "prog-1",
          "affectedApplications": 10
        }
      }
    ],
    "errors": []
  }
  ```

### `GET /jobs/close-registrations/status`
- **Description**: Returns the last run result of the close-registrations job.
- **Response**:
  ```json
  {
    "job": "close-registrations",
    "lastRun": { /* same shape as run result or null */ }
  }
  ```

### `POST /jobs/close-registrations/dry-run`
- **Description**: Convenience endpoint to run the job in dry-run mode.
- **Request body** (optional):
  ```json
  {
    "limit": 50,
    "referenceDate": "2026-02-23T00:00:00Z"
  }
  ```
- **Behavior**:
  - Does not modify any external state.
  - Only calls read endpoints on other services (expected).

## Scheduler Behavior

On startup, the service:

- Reads `JOB_INTERVAL_SECONDS` (default 3600).
- Starts a `setInterval` that periodically runs the close-registrations job with `dryRun = false`.

This means the job runs automatically, even without manual HTTP calls. The HTTP endpoints are primarily for:

- Health monitoring
- Manual triggering
- Observing the last run result

## Docker

Build and run locally:

```bash
cd services/scheduler-job
npm install
npm run build

# Build Docker image
docker build -t cfc-scheduler-job .

# Run container with environment variables
docker run -d \
  -p 3020:3020 \
  -e PROGRAM_SERVICE_BASE_URL=http://program-service:3000 \
  -e APPLICATION_SERVICE_BASE_URL=http://application-service:3001 \
  -e NOTIFICATION_SERVICE_BASE_URL=http://notification-service:3002 \
  -e JOB_INTERVAL_SECONDS=3600 \
  --name cfc-scheduler-job \
  cfc-scheduler-job
```
