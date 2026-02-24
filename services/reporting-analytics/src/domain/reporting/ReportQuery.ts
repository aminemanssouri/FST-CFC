export class ReportQuery {
  constructor(
    public readonly institutionId?: string,
    public readonly programId?: string,
    public readonly fromDate?: Date,
    public readonly toDate?: Date,
    public readonly academicYear?: string
  ) {}

  static empty(): ReportQuery {
    return new ReportQuery();
  }

  withInstitution(institutionId: string): ReportQuery {
    return new ReportQuery(
      institutionId,
      this.programId,
      this.fromDate,
      this.toDate,
      this.academicYear
    );
  }

  withProgram(programId: string): ReportQuery {
    return new ReportQuery(
      this.institutionId,
      programId,
      this.fromDate,
      this.toDate,
      this.academicYear
    );
  }

  withDateRange(fromDate: Date, toDate: Date): ReportQuery {
    return new ReportQuery(
      this.institutionId,
      this.programId,
      fromDate,
      toDate,
      this.academicYear
    );
  }

  withAcademicYear(academicYear: string): ReportQuery {
    return new ReportQuery(
      this.institutionId,
      this.programId,
      this.fromDate,
      this.toDate,
      academicYear
    );
  }
}
