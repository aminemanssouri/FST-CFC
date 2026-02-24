export class ProgramStats {
  constructor(
    public readonly institutionId: string,
    public readonly programId: string,
    public readonly academicYear: string,
    public readonly totalApplications: number = 0,
    public readonly conversionRateToInscrit: number = 0,
    public readonly acceptanceRate: number = 0
  ) {}
}
