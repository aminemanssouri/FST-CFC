import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type NotificationDocument = HydratedDocument<Notification>;

export type NotificationStatus = 'PENDING' | 'SENT' | 'RETRYING' | 'DEAD';

@Schema({ timestamps: true, collection: 'notifications' })
export class Notification {
  @Prop({ required: true, index: true })
  idempotencyKey!: string;

  @Prop({ required: true })
  templateKey!: string;

  @Prop({ required: true })
  language!: string;

  @Prop({ required: true })
  recipient!: string;

  @Prop({ required: true, type: Object })
  payload!: Record<string, unknown>;

  @Prop({ required: true })
  channel!: 'email';

  @Prop({ required: true, index: true })
  status!: NotificationStatus;

  @Prop({ required: true })
  attemptCount!: number;

  @Prop({ required: false })
  nextAttemptAt?: Date;

  @Prop({ required: true })
  correlationId!: string;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
NotificationSchema.index({ idempotencyKey: 1 }, { unique: true });

export type AttemptDocument = HydratedDocument<Attempt>;

@Schema({ timestamps: true, collection: 'attempts' })
export class Attempt {
  @Prop({ required: true, type: Types.ObjectId, index: true })
  notificationId!: Types.ObjectId;

  @Prop({ required: true })
  attemptNo!: number;

  @Prop({ required: true })
  provider!: string;

  @Prop({ required: false, type: Object })
  response?: Record<string, unknown>;

  @Prop({ required: false })
  errorType?: 'TRANSIENT' | 'PERMANENT';

  @Prop({ required: false })
  errorMessage?: string;
}

export const AttemptSchema = SchemaFactory.createForClass(Attempt);
