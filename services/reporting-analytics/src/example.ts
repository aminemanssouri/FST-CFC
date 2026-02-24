import { UserContext, ReportQuery, EnrollmentStats, ReportingService, InMemoryReportingRepository } from './domain';

// Example usage / smoke test
async function example() {
  const repo = new InMemoryReportingRepository();
  const service = new ReportingService(repo);

  // Seed some fake data
  repo.seedEnrollmentStats([
    new EnrollmentStats(
      'inst-1',
      'prog-1',
      new Date('2024-01-01'),
      new Date('2024-12-31'),
      10, 8, 5, 3, 2, 3
    ),
    new EnrollmentStats(
      'inst-2',
      'prog-2',
      new Date('2024-01-01'),
      new Date('2024-12-31'),
      20, 15, 10, 7, 3, 7
    )
  ]);

  // Example queries
  const superAdmin = new UserContext('user-1', ['SUPER_ADMIN']);
  const institutionAdmin = new UserContext('user-2', ['ADMIN_ETABLISSEMENT'], 'inst-1');
  const coordinator = new UserContext('user-3', ['COORDINATEUR'], undefined, ['prog-1']);

  const query = ReportQuery.empty().withDateRange(
    new Date('2024-01-01'),
    new Date('2024-12-31')
  );

  console.log('Global stats (SuperAdmin):', await service.getGlobalStats(superAdmin, query));
  console.log('Institution stats (Admin):', await service.getInstitutionStats(institutionAdmin, query));
  // Test 3: Program stats (Coordinator)
  const programStats = await service.getProgramStats(
    coordinator, 
    query.withProgram('prog-1')
  );
  console.log('Program stats (Coordinator):', programStats);
}

// Run example if this file is executed directly
example().catch(console.error);
