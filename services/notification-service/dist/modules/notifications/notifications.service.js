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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const rabbitmq_service_1 = require("../queue/rabbitmq.service");
const templates_service_1 = require("../templates/templates.service");
const notification_schema_1 = require("./notification.schema");
const mailer_service_1 = require("./mailer.service");
const renderer_service_1 = require("./renderer.service");
const MAX_ATTEMPTS = 5;
function computeNextAttempt(attemptCount) {
    const delaysSeconds = [30, 120, 600, 3600, 6 * 3600];
    const delay = delaysSeconds[Math.min(attemptCount - 1, delaysSeconds.length - 1)];
    return new Date(Date.now() + delay * 1000);
}
let NotificationsService = class NotificationsService {
    constructor(notificationModel, attemptModel, templatesService, rabbit, renderer, mailer) {
        this.notificationModel = notificationModel;
        this.attemptModel = attemptModel;
        this.templatesService = templatesService;
        this.rabbit = rabbit;
        this.renderer = renderer;
        this.mailer = mailer;
    }
    async create(dto, params) {
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
            status: 'PENDING',
            attemptCount: 0,
            correlationId: params.correlationId,
        });
        await this.rabbit.assertQueueBindings();
        await this.rabbit.publish(process.env.RABBITMQ_ROUTING_KEY_EMAIL ?? 'send.email', {
            notificationId: String(created._id),
            correlationId: params.correlationId,
        });
        return { id: String(created._id), status: created.status };
    }
    async getById(id) {
        const _id = new mongoose_2.Types.ObjectId(id);
        const notification = await this.notificationModel.findById(_id).lean();
        if (!notification)
            return { notification: null, attempts: [] };
        const attempts = await this.attemptModel
            .find({ notificationId: _id })
            .sort({ createdAt: 1 })
            .lean();
        return { notification, attempts };
    }
    async processSend(notificationId) {
        const _id = new mongoose_2.Types.ObjectId(notificationId);
        const notification = await this.notificationModel.findById(_id);
        if (!notification)
            return;
        if (notification.status === 'SENT')
            return;
        if (notification.status === 'DEAD')
            return;
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
        }
        catch (err) {
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
    async markDead(notification, reason) {
        notification.status = 'DEAD';
        notification.nextAttemptAt = undefined;
        await notification.save();
    }
    async recordAttempt(notificationId, attemptNo, errorType, errorMessage, response) {
        await this.attemptModel.create({
            notificationId,
            attemptNo,
            provider: 'smtp',
            response,
            errorType,
            errorMessage,
        });
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(notification_schema_1.Notification.name)),
    __param(1, (0, mongoose_1.InjectModel)(notification_schema_1.Attempt.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        templates_service_1.TemplatesService,
        rabbitmq_service_1.RabbitMqService,
        renderer_service_1.RendererService,
        mailer_service_1.MailerService])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map