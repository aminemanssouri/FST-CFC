import { Body, Controller, Get, Headers, Param, Post } from '@nestjs/common';
import { getOrCreateCorrelationId } from '../../common/correlation-id';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  async create(
    @Body() dto: CreateNotificationDto,
    @Headers('idempotency-key') idempotencyKey?: string,
    @Headers('x-correlation-id') correlationId?: string,
  ) {
    if (!idempotencyKey || idempotencyKey.trim().length === 0) {
      return { error: 'Idempotency-Key header is required' };
    }

    const cid = getOrCreateCorrelationId(correlationId);

    return this.notificationsService.create(dto, {
      idempotencyKey: idempotencyKey.trim(),
      correlationId: cid,
    });
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    return this.notificationsService.getById(id);
  }
}
