"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const ai_1 = __importDefault(require("./routes/ai"));
const whatsapp_1 = __importDefault(require("./routes/whatsapp"));
const server = (0, fastify_1.default)({ logger: true });
server.register(ai_1.default);
server.register(whatsapp_1.default);
server.get('/health', async (request, reply) => {
    return { status: 'ok', service: 'ai-microservice' };
});
const start = async () => {
    try {
        const port = parseInt(process.env.PORT || '8080', 10);
        await server.listen({ port, host: '0.0.0.0' });
        server.log.info(`Server listening on ${port}`);
    }
    catch (err) {
        server.log.error(err);
        process.exit(1);
    }
};
start();
