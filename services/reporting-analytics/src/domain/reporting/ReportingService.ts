import { UserContext } from './UserContext';
import { ReportQuery } from './ReportQuery';
import { EnrollmentStats } from './EnrollmentStats';
import { ProgramStats } from './ProgramStats';
import { ReportingRepository } from './ReportingRepository';

export class ReportingService {
  constructor(private readonly repository: ReportingRepository) {}

  async getGlobalStats(userContext: UserContext, query: ReportQuery): Promise<EnrollmentStats[]> {
    if (!userContext.isSuperAdmin()) {
      throw new Error('Access denied: only SuperAdmin can access global stats');
    }
    return this.repository.queryEnrollmentStats(query);
  }

  async getInstitutionStats(
    userContext: UserContext,
    query: ReportQuery,
    targetInstitutionId?: string
  ): Promise<EnrollmentStats[]> {
    const institutionId = targetInstitutionId ?? userContext.institutionId;
    if (!institutionId) {
      throw new Error('Institution ID required');
    }
    if (!userContext.canAccessInstitution(institutionId)) {
      throw new Error('Access denied: insufficient permissions for this institution');
    }
    const scopedQuery = query.withInstitution(institutionId);
    return this.repository.queryEnrollmentStats(scopedQuery);
  }

  async getProgramStats(
    userContext: UserContext,
    query: ReportQuery,
    targetProgramId?: string
  ): Promise<EnrollmentStats[]> {
    const programId = targetProgramId ?? query.programId;
    if (!programId) {
      throw new Error('Program ID required');
    }
    if (!userContext.canAccessProgram(programId)) {
      throw new Error('Access denied: insufficient permissions for this program');
    }
    const scopedQuery = query.withProgram(programId);
    return this.repository.queryEnrollmentStats(scopedQuery);
  }

  async getProgramKpis(
    userContext: UserContext,
    query: ReportQuery,
    targetProgramId?: string
  ): Promise<ProgramStats[]> {
    const programId = targetProgramId ?? query.programId;
    if (!programId) {
      throw new Error('Program ID required');
    }
    if (!userContext.canAccessProgram(programId)) {
      throw new Error('Access denied: insufficient permissions for this program');
    }
    const scopedQuery = query.withProgram(programId);
    return this.repository.queryProgramStats(scopedQuery);
  }
}
