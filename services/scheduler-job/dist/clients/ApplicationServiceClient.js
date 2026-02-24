"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicationServiceClient = void 0;
const axios_1 = __importDefault(require("axios"));
class ApplicationServiceClient {
    http;
    constructor(baseUrl) {
        this.http = axios_1.default.create({
            baseURL: baseUrl,
            timeout: 5000,
        });
    }
    async autoExpireApplications(programId, referenceDate) {
        const response = await this.http.post('/api/applications/auto-expire', {
            programId,
            currentDate: referenceDate,
        });
        return response.data;
    }
}
exports.ApplicationServiceClient = ApplicationServiceClient;
