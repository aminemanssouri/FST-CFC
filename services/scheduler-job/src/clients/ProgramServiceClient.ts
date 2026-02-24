import axios, { AxiosInstance } from 'axios';

export interface ProgramToClose {
  id: string;
  institutionId: string;
  registrationCloseDate: string;
}

export class ProgramServiceClient {
  private readonly http: AxiosInstance;

  constructor(baseUrl: string) {
    this.http = axios.create({
      baseURL: baseUrl,
      timeout: 5000,
    });
  }

  async getProgramsToClose(referenceDate: string, limit: number): Promise<ProgramToClose[]> {
    const response = await this.http.get<ProgramToClose[]>(
      '/api/programs/registrations-to-close',
      {
        params: {
          before: referenceDate,
          limit,
        },
      }
    );
    return response.data;
  }

  async closeRegistrations(programId: string, referenceDate: string): Promise<void> {
    await this.http.post(`/api/programs/${programId}/close-registrations`, {
      closedAt: referenceDate,
      reason: 'AUTO_CLOSE_BY_SCHEDULER',
    });
  }
}
