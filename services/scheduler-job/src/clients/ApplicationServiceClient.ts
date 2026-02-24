import axios, { AxiosInstance } from 'axios';

export interface AutoExpireResult {
  programId: string;
  affectedApplications: number;
}

export class ApplicationServiceClient {
  private readonly http: AxiosInstance;

  constructor(baseUrl: string) {
    this.http = axios.create({
      baseURL: baseUrl,
      timeout: 5000,
    });
  }

  async autoExpireApplications(programId: string, referenceDate: string): Promise<AutoExpireResult> {
    const response = await this.http.post<AutoExpireResult>(
      '/api/applications/auto-expire',
      {
        programId,
        currentDate: referenceDate,
      }
    );
    return response.data;
  }
}
