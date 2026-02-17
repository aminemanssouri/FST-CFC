"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const core_1 = require("@nestjs/core");
const worker_module_1 = require("./worker/worker.module");
async function bootstrap() {
    await core_1.NestFactory.createApplicationContext(worker_module_1.WorkerModule);
}
bootstrap();
//# sourceMappingURL=worker.js.map