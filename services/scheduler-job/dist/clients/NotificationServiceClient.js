"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationServiceClient = void 0;
const axios_1 = __importDefault(require("axios"));
class NotificationServiceClient {
    http;
    constructor(baseUrl) {
        this.http = axios_1.default.create({
            baseURL: baseUrl,
            timeout: 5000,
        });
    }
    async notifyRegistrationClosed(programId, institutionId, referenceDate) {
        await this.http.post('/api/notifications/registration-closed', {
            programId,
            institutionId,
            closedAt: referenceDate,
            source: 'scheduler-job',
        });
    }
}
exports.NotificationServiceClient = NotificationServiceClient;
