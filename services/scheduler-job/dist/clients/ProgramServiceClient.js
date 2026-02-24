"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProgramServiceClient = void 0;
const axios_1 = __importDefault(require("axios"));
class ProgramServiceClient {
    http;
    constructor(baseUrl) {
        this.http = axios_1.default.create({
            baseURL: baseUrl,
            timeout: 5000,
        });
    }
    async getProgramsToClose(referenceDate, limit) {
        const response = await this.http.get('/api/programs/registrations-to-close', {
            params: {
                before: referenceDate,
                limit,
            },
        });
        return response.data;
    }
    async closeRegistrations(programId, referenceDate) {
        await this.http.post(`/api/programs/${programId}/close-registrations`, {
            closedAt: referenceDate,
            reason: 'AUTO_CLOSE_BY_SCHEDULER',
        });
    }
}
exports.ProgramServiceClient = ProgramServiceClient;
