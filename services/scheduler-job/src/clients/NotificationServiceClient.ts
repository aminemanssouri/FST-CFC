import axios, { AxiosInstance } from 'axios';

export class NotificationServiceClient {
  private readonly http: AxiosInstance;

  constructor(baseUrl: string) {
    this.http = axios.create({
      baseURL: baseUrl,
      timeout: 5000,
    });
  }

  /**
   * Notify the notification-service that registrations for a program have been closed.
   *
   * This uses the existing NestJS notification API:
   *   POST /notifications
   *   Headers: Idempotency-Key (required by service)
   *   Body:   CreateNotificationDto { templateKey, language?, recipient, payload }
   *
   * For this integration we send a generic notification using the "registration-closed"
   * templateKey and a fixed technical recipient. In a real system you would route to
   * institution admins or coordinators based on your domain data.
   */
  async notifyRegistrationClosed(
    programId: string,
    institutionId: string,
    referenceDate: string,
  ): Promise<void> {
    const idempotencyKey = `registration-closed-${programId}-${referenceDate}`;

    await this.http.post(
      '/notifications',
      {
        templateKey: 'registration-closed',
        recipient: 'admin@example.com',
        payload: {
          programId,
          institutionId,
          closedAt: referenceDate,
          source: 'scheduler-job',
        },
      },
      {
        headers: {
          'Idempotency-Key': idempotencyKey,
        },
      },
    );
  }
}
