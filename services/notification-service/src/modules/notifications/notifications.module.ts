import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { QueueModule } from '../queue/queue.module';
import { TemplatesModule } from '../templates/templates.module';
import { Attempt, AttemptSchema, Notification, NotificationSchema } from './notification.schema';
import { MailerService } from './mailer.service';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { RendererService } from './renderer.service';

@Module({
  imports: [
    QueueModule,
    TemplatesModule,
    MongooseModule.forFeature([
      { name: Notification.name, schema: NotificationSchema },
      { name: Attempt.name, schema: AttemptSchema },
    ]),
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService, RendererService, MailerService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
