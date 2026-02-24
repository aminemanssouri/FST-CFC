import { ProgramServiceClient, ProgramToClose } from '../clients/ProgramServiceClient';
import { ApplicationServiceClient, AutoExpireResult } from '../clients/ApplicationServiceClient';
import { NotificationServiceClient } from '../clients/NotificationServiceClient';

export interface CloseRegistrationsJobConfig {
  referenceDate?: string; // ISO string, optional (defaults to now)
  limit?: number; // max programs per run
  dryRun?: boolean;
}

export interface CloseRegistrationsJobResult {
  job: 'close-registrations';
  dryRun: boolean;
  referenceDate: string;
  processedPrograms: number;
  processedApplications: number;
  details: Array<{
    program: ProgramToClose;
    autoExpire?: AutoExpireResult;
  }>;
  errors: string[];
}

export class CloseRegistrationsJob {
  constructor(
    private readonly programClient: ProgramServiceClient,
    private readonly applicationClient: ApplicationServiceClient,
    private readonly notificationClient: NotificationServiceClient
  ) {}

  async run(config: CloseRegistrationsJobConfig = {}): Promise<CloseRegistrationsJobResult> {
    const referenceDate = config.referenceDate ?? new Date().toISOString();
    const limit = config.limit ?? 100;
    const dryRun = config.dryRun ?? false;

    const errors: string[] = [];
    const details: CloseRegistrationsJobResult['details'] = [];
    let processedApplications = 0;

    let programs: ProgramToClose[] = [];
    try {
      programs = await this.programClient.getProgramsToClose(referenceDate, limit);
    } catch (error) {
      errors.push(`Failed to fetch programs to close: ${(error as Error).message}`);
      return {
        job: 'close-registrations',
        dryRun,
        referenceDate,
        processedPrograms: 0,
        processedApplications: 0,
        details: [],
        errors,
      };
    }

    for (const program of programs) {
      const entry: CloseRegistrationsJobResult['details'][number] = { program };

      if (!dryRun) {
        try {
          const autoExpire = await this.applicationClient.autoExpireApplications(
            program.id,
            referenceDate
          );
          entry.autoExpire = autoExpire;
          processedApplications += autoExpire.affectedApplications;
        } catch (error) {
          errors.push(
            `Failed to auto-expire applications for program ${program.id}: ${(error as Error).message}`
          );
        }

        try {
          await this.programClient.closeRegistrations(program.id, referenceDate);
        } catch (error) {
          errors.push(
            `Failed to close registrations for program ${program.id}: ${(error as Error).message}`
          );
        }

        try {
          await this.notificationClient.notifyRegistrationClosed(
            program.id,
            program.institutionId,
            referenceDate
          );
        } catch (error) {
          errors.push(
            `Failed to send notification for program ${program.id}: ${(error as Error).message}`
          );
        }
      }

      details.push(entry);
    }

    return {
      job: 'close-registrations',
      dryRun,
      referenceDate,
      processedPrograms: programs.length,
      processedApplications,
      details,
      errors,
    };
  }
}
