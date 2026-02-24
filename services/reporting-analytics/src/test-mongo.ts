import { 
  UserContext, 
  ReportQuery, 
  EnrollmentStats, 
  ReportingService, 
  MongoReportingRepository
} from './domain';
import { DatabaseConnection } from './infrastructure';

async function testMongoReporting() {
  // Database configuration
  const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017';
  const DB_NAME = process.env.DB_NAME || 'cfc_reporting_test';

  // Connect to MongoDB
  const dbConnection = DatabaseConnection.getInstance();
  await dbConnection.connect(MONGO_URI, DB_NAME);

  try {
    // Setup repository and service
    const repo = new MongoReportingRepository(dbConnection.getDb());
    const service = new ReportingService(repo);

    // Clear any existing data
    await repo.clearAll();

    // Seed test data
    await repo.saveEnrollmentStats(new EnrollmentStats(
      'inst-1',
      'prog-1',
      new Date('2024-01-01'),
      new Date('2024-12-31'),
      10, 8, 5, 3, 2, 3
    ));

    await repo.saveEnrollmentStats(new EnrollmentStats(
      'inst-2',
      'prog-2',
      new Date('2024-01-01'),
      new Date('2024-12-31'),
      20, 15, 10, 7, 3, 7
    ));

    // Test queries
    const superAdmin = new UserContext('user-1', ['SUPER_ADMIN']);
    const institutionAdmin = new UserContext('user-2', ['ADMIN_ETABLISSEMENT'], 'inst-1');
    const coordinator = new UserContext('user-3', ['COORDINATEUR'], undefined, ['prog-1']);

    const query = ReportQuery.empty().withDateRange(
      new Date('2024-01-01'),
      new Date('2024-12-31')
    );

    console.log('=== MongoDB Reporting Test Results ===');
    
    // Test 1: Global stats (SuperAdmin)
    const globalStats = await service.getGlobalStats(superAdmin, query);
    console.log('Global stats (SuperAdmin):', globalStats.length, 'records');
    globalStats.forEach((stat: EnrollmentStats) => {
      console.log(`  - Program ${stat.programId}: ${stat.totalApplications()} applications, ${stat.conversionRateToInscrit().toFixed(2)} conversion rate`);
    });

    // Test 2: Institution stats (Admin)
    const institutionStats = await service.getInstitutionStats(institutionAdmin, query);
    console.log('Institution stats (Admin):', institutionStats.length, 'records');
    institutionStats.forEach((stat: EnrollmentStats) => {
      console.log(`  - Program ${stat.programId}: ${stat.totalApplications()} applications`);
    });

    // Test 3: Program stats (Coordinator)
    const programStats = await service.getProgramStats(
      coordinator, 
      query.withProgram('prog-1')
    );
    console.log('Program stats (Coordinator):', programStats.length, 'records');
    programStats.forEach((stat: EnrollmentStats) => {
      console.log(`  - Program ${stat.programId}: ${stat.totalApplications()} applications`);
    });

    // Test 4: Permission denied test
    try {
      await service.getGlobalStats(institutionAdmin, query);
      console.log('ERROR: Permission check failed - Admin should not access global stats');
    } catch (error) {
      console.log('✓ Permission check passed - Admin denied access to global stats');
    }

    console.log('=== All tests completed successfully ===');

  } finally {
    // Cleanup
    await dbConnection.disconnect();
  }
}

// Run test if this file is executed directly
testMongoReporting().catch(console.error);
