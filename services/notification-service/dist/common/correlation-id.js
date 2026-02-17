"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrCreateCorrelationId = getOrCreateCorrelationId;
const crypto_1 = require("crypto");
function getOrCreateCorrelationId(value) {
    if (typeof value === 'string' && value.trim().length > 0)
        return value;
    return (0, crypto_1.randomUUID)();
}
//# sourceMappingURL=correlation-id.js.map