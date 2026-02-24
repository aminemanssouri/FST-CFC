import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { 
  UserContext, 
  ReportQuery, 
  ReportingService, 
  MongoReportingRepository
} from './domain';
import { DatabaseConnection } from './infrastructure';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const port = process.env.PORT ? Number(process.env.PORT) : 3010;

// Initialize database connection
const dbConnection = DatabaseConnection.getInstance();

// Mock authentication middleware - in real app, validate JWT from auth service
function mockAuthMiddleware(req: express.Request, res: express.Response, next: express.NextFunction) {
  // For demo purposes, we'll use query params to simulate user context
  const role = req.query.role as string;
  const institutionId = req.query.institutionId as string;
  const programIds = req.query.programIds as string;

  if (!role) {
    return res.status(401).json({ error: 'Role required' });
  }

  const userContext = new UserContext(
    'demo-user',
    [role as any],
    institutionId,
    programIds ? programIds.split(',') : []
  );

  (req as any).userContext = userContext;
  next();
}

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'reporting-analytics' });
});

// Demo endpoint with sample data (no auth required)
app.get('/reports/example', async (_req, res) => {
  try {
    if (!dbConnection.isConnected()) {
      return res.status(503).json({ error: 'Database not connected' });
    }
    
    const repo = new MongoReportingRepository(dbConnection.getDb());
    
    // Seed some demo data if empty
    await repo.saveEnrollmentStats({
      institutionId: 'inst-demo',
      programId: 'prog-demo',
      periodStart: new Date('2024-01-01'),
      periodEnd: new Date('2024-12-31'),
      countPreinscription: 15,
      countDossierSoumis: 12,
      countEnCoursValidation: 8,
      countAccepte: 6,
      countRefuse: 2,
      countInscrit: 6
    } as any);

    const query = ReportQuery.empty().withDateRange(
      new Date('2024-01-01'),
      new Date('2024-12-31')
    );
    
    const stats = await repo.queryEnrollmentStats(query);
    res.json({
      report: 'demo',
      description: 'Sample reporting data',
      generatedAt: new Date().toISOString(),
      stats
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Global stats - SuperAdmin only
app.get('/api/reports/global', mockAuthMiddleware, async (req, res) => {
  try {
    if (!dbConnection.isConnected()) {
      return res.status(503).json({ error: 'Database not connected' });
    }
    
    const userContext = (req as any).userContext;
    const repo = new MongoReportingRepository(dbConnection.getDb());
    const reportingService = new ReportingService(repo);
    
    const query = ReportQuery.empty().withDateRange(
      req.query.fromDate ? new Date(req.query.fromDate as string) : new Date('2024-01-01'),
      req.query.toDate ? new Date(req.query.toDate as string) : new Date('2024-12-31')
    );
    
    const stats = await reportingService.getGlobalStats(userContext, query);
    res.json({ stats });
  } catch (error) {
    res.status(403).json({ error: (error as Error).message });
  }
});

// Institution stats - Admin or SuperAdmin
app.get('/api/reports/institution/:institutionId', mockAuthMiddleware, async (req, res) => {
  try {
    if (!dbConnection.isConnected()) {
      return res.status(503).json({ error: 'Database not connected' });
    }
    
    const userContext = (req as any).userContext;
    const { institutionId } = req.params;
    const repo = new MongoReportingRepository(dbConnection.getDb());
    const reportingService = new ReportingService(repo);
    
    const query = ReportQuery.empty().withDateRange(
      req.query.fromDate ? new Date(req.query.fromDate as string) : new Date('2024-01-01'),
      req.query.toDate ? new Date(req.query.toDate as string) : new Date('2024-12-31')
    );
    
    const stats = await reportingService.getInstitutionStats(userContext, query, institutionId);
    res.json({ stats });
  } catch (error) {
    res.status(403).json({ error: (error as Error).message });
  }
});

// Program stats - Coordinator, Admin, or SuperAdmin
app.get('/api/reports/program/:programId', mockAuthMiddleware, async (req, res) => {
  try {
    if (!dbConnection.isConnected()) {
      return res.status(503).json({ error: 'Database not connected' });
    }
    
    const userContext = (req as any).userContext;
    const { programId } = req.params;
    const repo = new MongoReportingRepository(dbConnection.getDb());
    const reportingService = new ReportingService(repo);
    
    const query = ReportQuery.empty().withProgram(programId).withDateRange(
      req.query.fromDate ? new Date(req.query.fromDate as string) : new Date('2024-01-01'),
      req.query.toDate ? new Date(req.query.toDate as string) : new Date('2024-12-31')
    );
    
    const stats = await reportingService.getProgramStats(userContext, query);
    res.json({ stats });
  } catch (error) {
    res.status(403).json({ error: (error as Error).message });
  }
});

async function startServer() {
  try {
    await dbConnection.connect(
      process.env.MONGO_URI || 'mongodb://localhost:27017',
      process.env.DB_NAME || 'cfc_reporting'
    );
    
    app.listen(port, () => {
      console.log(`Reporting Analytics service listening on port ${port}`);
      console.log(`Available endpoints:`);
      console.log(`  GET /health`);
      console.log(`  GET /reports/example`);
      console.log(`  GET /api/reports/global?role=SUPER_ADMIN`);
      console.log(`  GET /api/reports/institution/:id?role=ADMIN_ETABLISSEMENT&institutionId=:id`);
      console.log(`  GET /api/reports/program/:id?role=COORDINATEUR&programIds=:id`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
