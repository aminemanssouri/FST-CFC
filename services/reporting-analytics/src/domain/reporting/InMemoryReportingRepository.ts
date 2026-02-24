import { ReportQuery } from './ReportQuery';
import { EnrollmentStats } from './EnrollmentStats';
import { ProgramStats } from './ProgramStats';
import { ReportingRepository } from './ReportingRepository';

export class InMemoryReportingRepository implements ReportingRepository {
  private enrollmentStats: EnrollmentStats[] = [];
  private programStats: ProgramStats[] = [];

  async queryEnrollmentStats(query: ReportQuery): Promise<EnrollmentStats[]> {
    return this.enrollmentStats.filter(stats => {
      if (query.institutionId && stats.institutionId !== query.institutionId) return false;
      if (query.programId && stats.programId !== query.programId) return false;
      if (query.fromDate && stats.periodStart < query.fromDate) return false;
      if (query.toDate && stats.periodEnd > query.toDate) return false;
      return true;
    });
  }

  async queryProgramStats(query: ReportQuery): Promise<ProgramStats[]> {
    return this.programStats.filter(stats => {
      if (query.institutionId && stats.institutionId !== query.institutionId) return false;
      if (query.programId && stats.programId !== query.programId) return false;
      if (query.academicYear && stats.academicYear !== query.academicYear) return false;
      return true;
    });
  }

  // Helper methods for testing/seeding
  seedEnrollmentStats(stats: EnrollmentStats[]): void {
    this.enrollmentStats = stats;
  }

  seedProgramStats(stats: ProgramStats[]): void {
    this.programStats = stats;
  }
}
