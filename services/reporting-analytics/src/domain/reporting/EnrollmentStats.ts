export class EnrollmentStats {
  constructor(
    public readonly institutionId: string,
    public readonly programId: string,
    public readonly periodStart: Date,
    public readonly periodEnd: Date,
    public readonly countPreinscription: number = 0,
    public readonly countDossierSoumis: number = 0,
    public readonly countEnCoursValidation: number = 0,
    public readonly countAccepte: number = 0,
    public readonly countRefuse: number = 0,
    public readonly countInscrit: number = 0
  ) {}

  totalApplications(): number {
    return this.countPreinscription + 
           this.countDossierSoumis + 
           this.countEnCoursValidation + 
           this.countAccepte + 
           this.countRefuse + 
           this.countInscrit;
  }

  conversionRateToInscrit(): number {
    const total = this.totalApplications();
    return total > 0 ? this.countInscrit / total : 0;
  }

  acceptanceRate(): number {
    const decisions = this.countAccepte + this.countRefuse;
    return decisions > 0 ? this.countAccepte / decisions : 0;
  }
}
