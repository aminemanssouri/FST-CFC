"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var RabbitMqService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RabbitMqService = void 0;
const common_1 = require("@nestjs/common");
const amqplib_1 = require("amqplib");
let RabbitMqService = RabbitMqService_1 = class RabbitMqService {
    constructor() {
        this.logger = new common_1.Logger(RabbitMqService_1.name);
    }
    async getChannel() {
        if (this.channel)
            return this.channel;
        const uri = process.env.RABBITMQ_URI;
        if (!uri)
            throw new Error('RABBITMQ_URI is not set');
        this.connection = await amqplib_1.default.connect(uri);
        this.channel = await this.connection.createChannel();
        const exchange = process.env.RABBITMQ_EXCHANGE ?? 'notifications';
        await this.channel.assertExchange(exchange, 'topic', { durable: true });
        return this.channel;
    }
    async publish(routingKey, message) {
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
    async consume(queueName, handler, options) {
        const channel = await this.getChannel();
        if (options?.prefetch) {
            await channel.prefetch(options.prefetch);
        }
        await channel.consume(queueName, async (msg) => {
            if (!msg)
                return;
            try {
                const raw = msg.content.toString('utf8');
                const parsed = raw.length > 0 ? JSON.parse(raw) : {};
                await handler(parsed);
                channel.ack(msg);
            }
            catch (err) {
                this.logger.error('Error while consuming message', err);
                channel.nack(msg, false, false);
            }
        });
    }
    async assertQueueBindings() {
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
        }
        catch {
        }
        try {
            await this.connection?.close();
        }
        catch {
        }
    }
};
exports.RabbitMqService = RabbitMqService;
exports.RabbitMqService = RabbitMqService = RabbitMqService_1 = __decorate([
    (0, common_1.Injectable)()
], RabbitMqService);
//# sourceMappingURL=rabbitmq.service.js.map