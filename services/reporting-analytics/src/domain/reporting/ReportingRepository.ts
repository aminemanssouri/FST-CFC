import { ReportQuery } from './ReportQuery';
import { EnrollmentStats } from './EnrollmentStats';
import { ProgramStats } from './ProgramStats';

export interface ReportingRepository {
  queryEnrollmentStats(query: ReportQuery): Promise<EnrollmentStats[]>;
  queryProgramStats(query: ReportQuery): Promise<ProgramStats[]>;
}
