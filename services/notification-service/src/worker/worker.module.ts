import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationsModule } from '../modules/notifications/notifications.module';
import { QueueModule } from '../modules/queue/queue.module';
import { TemplatesModule } from '../modules/templates/templates.module';
import { WorkerService } from './worker.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGO_URI ?? ''),
    QueueModule,
    TemplatesModule,
    NotificationsModule,
  ],
  providers: [WorkerService],
})
export class WorkerModule {}
