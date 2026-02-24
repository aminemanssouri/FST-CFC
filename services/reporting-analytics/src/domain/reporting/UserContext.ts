export type Role = 'SUPER_ADMIN' | 'ADMIN_ETABLISSEMENT' | 'COORDINATEUR';

export class UserContext {
  constructor(
    public readonly userId: string,
    public readonly roles: Role[],
    public readonly institutionId?: string,
    public readonly programIds: string[] = []
  ) {}

  isSuperAdmin(): boolean {
    return this.roles.includes('SUPER_ADMIN');
  }

  isInstitutionAdmin(): boolean {
    return this.roles.includes('ADMIN_ETABLISSEMENT');
  }

  isCoordinator(): boolean {
    return this.roles.includes('COORDINATEUR');
  }

  canAccessInstitution(institutionId: string): boolean {
    return this.isSuperAdmin() || 
           (this.isInstitutionAdmin() && this.institutionId === institutionId);
  }

  canAccessProgram(programId: string): boolean {
    return this.isSuperAdmin() || 
           (this.isCoordinator() && this.programIds.includes(programId)) ||
           (this.isInstitutionAdmin() && this.programIds.includes(programId));
  }
}
