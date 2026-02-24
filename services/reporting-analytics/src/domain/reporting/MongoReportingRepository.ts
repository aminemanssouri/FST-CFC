import { MongoClient, Db, Collection } from 'mongodb';
import { ReportQuery } from './ReportQuery';
import { EnrollmentStats } from './EnrollmentStats';
import { ProgramStats } from './ProgramStats';
import { ReportingRepository } from './ReportingRepository';

export class MongoReportingRepository implements ReportingRepository {
  private enrollmentStatsCollection: Collection<EnrollmentStats>;
  private programStatsCollection: Collection<ProgramStats>;

  constructor(private readonly db: Db) {
    this.enrollmentStatsCollection = db.collection('enrollment_stats');
    this.programStatsCollection = db.collection('program_stats');
  }

  async queryEnrollmentStats(query: ReportQuery): Promise<EnrollmentStats[]> {
    const filter: any = {};

    if (query.institutionId) {
      filter.institutionId = query.institutionId;
    }

    if (query.programId) {
      filter.programId = query.programId;
    }

    if (query.fromDate || query.toDate) {
      filter.periodStart = {};
      if (query.fromDate) {
        filter.periodStart.$gte = query.fromDate;
      }
      if (query.toDate) {
        filter.periodStart.$lte = query.toDate;
      }
    }

    const docs = await this.enrollmentStatsCollection.find(filter).toArray();
    return docs.map(this.documentToEnrollmentStats);
  }

  async queryProgramStats(query: ReportQuery): Promise<ProgramStats[]> {
    const filter: any = {};

    if (query.institutionId) {
      filter.institutionId = query.institutionId;
    }

    if (query.programId) {
      filter.programId = query.programId;
    }

    if (query.academicYear) {
      filter.academicYear = query.academicYear;
    }

    const docs = await this.programStatsCollection.find(filter).toArray();
    return docs.map(this.documentToProgramStats);
  }

  // Helper methods for seeding/testing
  async saveEnrollmentStats(stats: EnrollmentStats): Promise<void> {
    await this.enrollmentStatsCollection.insertOne(stats as any);
  }

  async saveProgramStats(stats: ProgramStats): Promise<void> {
    await this.programStatsCollection.insertOne(stats as any);
  }

  async clearAll(): Promise<void> {
    await this.enrollmentStatsCollection.deleteMany({});
    await this.programStatsCollection.deleteMany({});
  }

  private documentToEnrollmentStats(doc: any): EnrollmentStats {
    return new EnrollmentStats(
      doc.institutionId,
      doc.programId,
      new Date(doc.periodStart),
      new Date(doc.periodEnd),
      doc.countPreinscription,
      doc.countDossierSoumis,
      doc.countEnCoursValidation,
      doc.countAccepte,
      doc.countRefuse,
      doc.countInscrit
    );
  }

  private documentToProgramStats(doc: any): ProgramStats {
    return new ProgramStats(
      doc.institutionId,
      doc.programId,
      doc.academicYear,
      doc.totalApplications,
      doc.conversionRateToInscrit,
      doc.acceptanceRate
    );
  }
}
