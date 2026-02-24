import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import { ProgramServiceClient } from './clients/ProgramServiceClient';
import { ApplicationServiceClient } from './clients/ApplicationServiceClient';
import { NotificationServiceClient } from './clients/NotificationServiceClient';
import { CloseRegistrationsJob } from './jobs/CloseRegistrationsJob';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const port = process.env.PORT ? Number(process.env.PORT) : 3020;

// External service base URLs
const programServiceBaseUrl = process.env.PROGRAM_SERVICE_BASE_URL || 'http://localhost:3000';
const applicationServiceBaseUrl = process.env.APPLICATION_SERVICE_BASE_URL || 'http://localhost:3001';
const notificationServiceBaseUrl = process.env.NOTIFICATION_SERVICE_BASE_URL || 'http://localhost:3002';

// Clients and job instance
const programClient = new ProgramServiceClient(programServiceBaseUrl);
const applicationClient = new ApplicationServiceClient(applicationServiceBaseUrl);
const notificationClient = new NotificationServiceClient(notificationServiceBaseUrl);

const closeRegistrationsJob = new CloseRegistrationsJob(
  programClient,
  applicationClient,
  notificationClient
);

// In-memory job status
let lastCloseRegistrationsResult: any | null = null;

// Health endpoint
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'scheduler-job',
    schedulerRunning: Boolean(intervalHandle),
    time: new Date().toISOString(),
  });
});

// Manual run endpoint
app.post('/jobs/close-registrations/run', async (req, res) => {
  try {
    const { dryRun, limit, referenceDate } = req.body || {};
    const result = await closeRegistrationsJob.run({
      dryRun,
      limit,
      referenceDate,
    });
    lastCloseRegistrationsResult = {
      ...result,
      startedAt: new Date().toISOString(),
    };
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Status endpoint
app.get('/jobs/close-registrations/status', (_req, res) => {
  if (!lastCloseRegistrationsResult) {
    return res.json({ job: 'close-registrations', lastRun: null });
  }
  res.json({ job: 'close-registrations', lastRun: lastCloseRegistrationsResult });
});

// Dry-run convenience endpoint
app.post('/jobs/close-registrations/dry-run', async (req, res) => {
  try {
    const { limit, referenceDate } = req.body || {};
    const result = await closeRegistrationsJob.run({
      dryRun: true,
      limit,
      referenceDate,
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Simple interval-based scheduler
const intervalSeconds = Number(process.env.JOB_INTERVAL_SECONDS || 3600); // default: 1 hour
let intervalHandle: NodeJS.Timeout | null = null;

function startScheduler() {
  intervalHandle = setInterval(async () => {
    try {
      console.log('[scheduler-job] Running scheduled close-registrations job');
      const result = await closeRegistrationsJob.run({ dryRun: false });
      lastCloseRegistrationsResult = {
        ...result,
        startedAt: new Date().toISOString(),
      };
      if (result.errors.length > 0) {
        console.error('[scheduler-job] Job completed with errors:', result.errors);
      } else {
        console.log('[scheduler-job] Job completed successfully');
      }
    } catch (error) {
      console.error('[scheduler-job] Scheduled job failed:', error);
    }
  }, intervalSeconds * 1000);
}

app.listen(port, () => {
  console.log(`Scheduler Job service listening on port ${port}`);
  console.log(`External services:`);
  console.log(`  ProgramService: ${programServiceBaseUrl}`);
  console.log(`  ApplicationService: ${applicationServiceBaseUrl}`);
  console.log(`  NotificationService: ${notificationServiceBaseUrl}`);
  console.log(`Scheduler interval: ${intervalSeconds} seconds`);
  startScheduler();
});
