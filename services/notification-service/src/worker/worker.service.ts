import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RabbitMqService } from '../modules/queue/rabbitmq.service';
import { NotificationsService } from '../modules/notifications/notifications.service';

@Injectable()
export class WorkerService implements OnModuleInit {
  private readonly logger = new Logger(WorkerService.name);

  constructor(
    private readonly rabbit: RabbitMqService,
    private readonly notifications: NotificationsService,
  ) {}

  async onModuleInit() {
    await this.rabbit.assertQueueBindings();

    const queueName = process.env.RABBITMQ_QUEUE_EMAIL ?? 'notifications.send.email';

    await this.rabbit.consume(
      queueName,
      async (message) => {
        const m = message as any;
        const notificationId = m?.notificationId;
        if (typeof notificationId !== 'string' || notificationId.length === 0) {
          this.logger.warn('Message missing notificationId');
          return;
        }

        await this.notifications.processSend(notificationId);
      },
      { prefetch: 10 },
    );

    this.logger.log(`Worker consuming queue: ${queueName}`);
  }
}
