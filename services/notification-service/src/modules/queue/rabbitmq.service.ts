import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import * as amqp from 'amqplib';

@Injectable()
export class RabbitMqService implements OnModuleDestroy {
  private readonly logger = new Logger(RabbitMqService.name);
  private connection?: any;
  private channel?: any;

  async getChannel(): Promise<any> {
    if (this.channel) return this.channel;

    const uri = process.env.RABBITMQ_URI;
    if (!uri) throw new Error('RABBITMQ_URI is not set');

    this.connection = await amqp.connect(uri);
    this.channel = await this.connection.createChannel();

    const exchange = process.env.RABBITMQ_EXCHANGE ?? 'notifications';
    await this.channel.assertExchange(exchange, 'topic', { durable: true });

    return this.channel;
  }

  async publish(routingKey: string, message: unknown): Promise<void> {
    const channel = await this.getChannel();
    const exchange = process.env.RABBITMQ_EXCHANGE ?? 'notifications';

    const payload = Buffer.from(JSON.stringify(message));
    const ok = channel.publish(exchange, routingKey, payload, {
      contentType: 'application/json',
      persistent: true,
    });

    if (!ok) {
      this.logger.warn('RabbitMQ publish returned false (internal buffer is full)');
    }
  }

  async consume(
    queueName: string,
    handler: (message: unknown) => Promise<void>,
    options?: { prefetch?: number },
  ): Promise<void> {
    const channel = await this.getChannel();

    if (options?.prefetch) {
      await channel.prefetch(options.prefetch);
    }

    await channel.consume(queueName, async (msg: any) => {
      if (!msg) return;

      try {
        const raw = msg.content.toString('utf8');
        const parsed = raw.length > 0 ? JSON.parse(raw) : {};
        await handler(parsed);
        channel.ack(msg);
      } catch (err) {
        this.logger.error('Error while consuming message', err as any);
        channel.nack(msg, false, false);
      }
    });
  }

  async assertQueueBindings(): Promise<void> {
    const channel = await this.getChannel();
    const exchange = process.env.RABBITMQ_EXCHANGE ?? 'notifications';

    const emailQueue = process.env.RABBITMQ_QUEUE_EMAIL ?? 'notifications.send.email';
    const emailRoutingKey = process.env.RABBITMQ_ROUTING_KEY_EMAIL ?? 'send.email';

    await channel.assertQueue(emailQueue, {
      durable: true,
      deadLetterExchange: exchange,
      deadLetterRoutingKey: process.env.RABBITMQ_DLQ ?? 'notifications.dlq',
    });

    await channel.bindQueue(emailQueue, exchange, emailRoutingKey);

    const dlq = process.env.RABBITMQ_DLQ ?? 'notifications.dlq';
    await channel.assertQueue(dlq, { durable: true });
    await channel.bindQueue(dlq, exchange, dlq);
  }

  async onModuleDestroy() {
    try {
      await this.channel?.close();
    } catch {
      // ignore
    }
    try {
      await this.connection?.close();
    } catch {
      // ignore
    }
  }
}
