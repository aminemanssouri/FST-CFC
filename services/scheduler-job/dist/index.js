"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const ProgramServiceClient_1 = require("./clients/ProgramServiceClient");
const ApplicationServiceClient_1 = require("./clients/ApplicationServiceClient");
const NotificationServiceClient_1 = require("./clients/NotificationServiceClient");
const CloseRegistrationsJob_1 = require("./jobs/CloseRegistrationsJob");
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const port = process.env.PORT ? Number(process.env.PORT) : 3020;
// External service base URLs
const programServiceBaseUrl = process.env.PROGRAM_SERVICE_BASE_URL || 'http://localhost:3000';
const applicationServiceBaseUrl = process.env.APPLICATION_SERVICE_BASE_URL || 'http://localhost:3001';
const notificationServiceBaseUrl = process.env.NOTIFICATION_SERVICE_BASE_URL || 'http://localhost:3002';
// Clients and job instance
const programClient = new ProgramServiceClient_1.ProgramServiceClient(programServiceBaseUrl);
const applicationClient = new ApplicationServiceClient_1.ApplicationServiceClient(applicationServiceBaseUrl);
const notificationClient = new NotificationServiceClient_1.NotificationServiceClient(notificationServiceBaseUrl);
const closeRegistrationsJob = new CloseRegistrationsJob_1.CloseRegistrationsJob(programClient, applicationClient, notificationClient);
// In-memory job status
let lastCloseRegistrationsResult = null;
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
    }
    catch (error) {
        res.status(500).json({ error: error.message });
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
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Simple interval-based scheduler
const intervalSeconds = Number(process.env.JOB_INTERVAL_SECONDS || 3600); // default: 1 hour
let intervalHandle = null;
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
            }
            else {
                console.log('[scheduler-job] Job completed successfully');
            }
        }
        catch (error) {
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
