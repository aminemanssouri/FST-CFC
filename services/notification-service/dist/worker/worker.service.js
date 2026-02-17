"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var WorkerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkerService = void 0;
const common_1 = require("@nestjs/common");
const rabbitmq_service_1 = require("../modules/queue/rabbitmq.service");
const notifications_service_1 = require("../modules/notifications/notifications.service");
let WorkerService = WorkerService_1 = class WorkerService {
    constructor(rabbit, notifications) {
        this.rabbit = rabbit;
        this.notifications = notifications;
        this.logger = new common_1.Logger(WorkerService_1.name);
    }
    async onModuleInit() {
        await this.rabbit.assertQueueBindings();
        const queueName = process.env.RABBITMQ_QUEUE_EMAIL ?? 'notifications.send.email';
        await this.rabbit.consume(queueName, async (message) => {
            const m = message;
            const notificationId = m?.notificationId;
            if (typeof notificationId !== 'string' || notificationId.length === 0) {
                this.logger.warn('Message missing notificationId');
                return;
            }
            await this.notifications.processSend(notificationId);
        }, { prefetch: 10 });
        this.logger.log(`Worker consuming queue: ${queueName}`);
    }
};
exports.WorkerService = WorkerService;
exports.WorkerService = WorkerService = WorkerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [rabbitmq_service_1.RabbitMqService,
        notifications_service_1.NotificationsService])
], WorkerService);
//# sourceMappingURL=worker.service.js.map