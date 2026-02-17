import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { RabbitMqService } from '../queue/rabbitmq.service';
import { TemplatesService } from '../templates/templates.service';
import { Attempt, AttemptDocument, Notification, NotificationDocument, NotificationStatus } from './notification.schema';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { MailerService } from './mailer.service';
import { RendererService } from './renderer.service';

const MAX_ATTEMPTS = 5;

function computeNextAttempt(attemptCount: number): Date {
  const delaysSeconds = [30, 120, 600, 3600, 6 * 3600];
  const delay = delaysSeconds[Math.min(attemptCount - 1, delaysSeconds.length - 1)];
  return new Date(Date.now() + delay * 1000);
}

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name) private readonly notificationModel: Model<NotificationDocument>,
    @InjectModel(Attempt.name) private readonly attemptModel: Model<AttemptDocument>,
    private readonly templatesService: TemplatesService,
    private readonly rabbit: RabbitMqService,
    private readonly renderer: RendererService,
    private readonly mailer: MailerService,
  ) {}

  async create(dto: CreateNotificationDto, params: { idempotencyKey: string; correlationId: string }) {
    const language = dto.language?.trim() || 'fr';

    const existing = await this.notificationModel
      .findOne({ idempotencyKey: params.idempotencyKey })
      .lean();

    if (existing) {
      return { id: String(existing._id), status: existing.status };
    }

    const created = await this.notificationModel.create({
      idempotencyKey: params.idempotencyKey,
      templateKey: dto.templateKey,
      language,
      recipient: dto.recipient,
      payload: dto.payload,
      channel: 'email',
      status: 'PENDING' satisfies NotificationStatus,
      attemptCount: 0,
      correlationId: params.correlationId,
    });

    await this.rabbit.assertQueueBindings();
    await this.rabbit.publish(process.env.RABBITMQ_ROUTING_KEY_EMAIL ?? 'send.email', {
      notificationId: String((created as any)._id),
      correlationId: params.correlationId,
    });

    return { id: String((created as any)._id), status: created.status };
  }

  async getById(id: string) {
    const _id = new Types.ObjectId(id);
    const notification = await this.notificationModel.findById(_id).lean();
    if (!notification) return { notification: null, attempts: [] };

    const attempts = await this.attemptModel
      .find({ notificationId: _id })
      .sort({ createdAt: 1 })
      .lean();

    return { notification, attempts };
  }

  async processSend(notificationId: string): Promise<void> {
    const _id = new Types.ObjectId(notificationId);
    const notification = await this.notificationModel.findById(_id);
    if (!notification) return;

    if (notification.status === 'SENT') return;
    if (notification.status === 'DEAD') return;

    const template = await this.templatesService.findByKey(notification.templateKey, notification.language);
    if (!template) {
      await this.recordAttempt(_id, notification.attemptCount + 1, 'PERMANENT', 'TEMPLATE_NOT_FOUND', {
        reason: `Template ${notification.templateKey} (${notification.language}) not found`,
      });
      await this.markDead(notification, 'TEMPLATE_NOT_FOUND');
      return;
    }

    const attemptNo = notification.attemptCount + 1;

    try {
      const subject = this.renderer.render(template.subjectTemplate, notification.payload);
      const html = this.renderer.render(template.bodyTemplate, notification.payload);

      await this.mailer.sendEmail({
        to: notification.recipient,
        subject,
        html,
        correlationId: notification.correlationId,
      });

      await this.recordAttempt(_id, attemptNo, undefined, undefined, { ok: true });

      notification.status = 'SENT';
      notification.attemptCount = attemptNo;
      notification.nextAttemptAt = undefined;
      await notification.save();
    } catch (err: any) {
      const message = typeof err?.message === 'string' ? err.message : 'SEND_FAILED';

      const transient = true;
      await this.recordAttempt(_id, attemptNo, transient ? 'TRANSIENT' : 'PERMANENT', message, {
        ok: false,
      });

      notification.attemptCount = attemptNo;

      if (attemptNo >= MAX_ATTEMPTS) {
        await this.markDead(notification, message);
        await this.rabbit.publish(process.env.RABBITMQ_DLQ ?? 'notifications.dlq', {
          notificationId,
          correlationId: notification.correlationId,
          reason: message,
        });
        return;
      }

      notification.status = 'RETRYING';
      notification.nextAttemptAt = computeNextAttempt(attemptNo);
      await notification.save();

      await this.rabbit.publish(process.env.RABBITMQ_ROUTING_KEY_EMAIL ?? 'send.email', {
        notificationId,
        correlationId: notification.correlationId,
        scheduledAt: notification.nextAttemptAt.toISOString(),
      });
    }
  }

  private async markDead(notification: NotificationDocument, reason: string) {
    notification.status = 'DEAD';
    notification.nextAttemptAt = undefined;
    await notification.save();
  }

  private async recordAttempt(
    notificationId: Types.ObjectId,
    attemptNo: number,
    errorType?: 'TRANSIENT' | 'PERMANENT',
    errorMessage?: string,
    response?: Record<string, unknown>,
  ) {
    await this.attemptModel.create({
      notificationId,
      attemptNo,
      provider: 'smtp',
      response,
      errorType,
      errorMessage,
    });
  }
}
