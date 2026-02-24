"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloseRegistrationsJob = void 0;
class CloseRegistrationsJob {
    programClient;
    applicationClient;
    notificationClient;
    constructor(programClient, applicationClient, notificationClient) {
        this.programClient = programClient;
        this.applicationClient = applicationClient;
        this.notificationClient = notificationClient;
    }
    async run(config = {}) {
        const referenceDate = config.referenceDate ?? new Date().toISOString();
        const limit = config.limit ?? 100;
        const dryRun = config.dryRun ?? false;
        const errors = [];
        const details = [];
        let processedApplications = 0;
        let programs = [];
        try {
            programs = await this.programClient.getProgramsToClose(referenceDate, limit);
        }
        catch (error) {
            errors.push(`Failed to fetch programs to close: ${error.message}`);
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
            const entry = { program };
            if (!dryRun) {
                try {
                    const autoExpire = await this.applicationClient.autoExpireApplications(program.id, referenceDate);
                    entry.autoExpire = autoExpire;
                    processedApplications += autoExpire.affectedApplications;
                }
                catch (error) {
                    errors.push(`Failed to auto-expire applications for program ${program.id}: ${error.message}`);
                }
                try {
                    await this.programClient.closeRegistrations(program.id, referenceDate);
                }
                catch (error) {
                    errors.push(`Failed to close registrations for program ${program.id}: ${error.message}`);
                }
                try {
                    await this.notificationClient.notifyRegistrationClosed(program.id, program.institutionId, referenceDate);
                }
                catch (error) {
                    errors.push(`Failed to send notification for program ${program.id}: ${error.message}`);
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
exports.CloseRegistrationsJob = CloseRegistrationsJob;
