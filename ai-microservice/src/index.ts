import fastify from 'fastify';
import aiAgentRoutes from './routes/ai';
import conciergeRoutes from './routes/whatsapp';

const server = fastify({ logger: true });

server.register(aiAgentRoutes);
server.register(conciergeRoutes);

server.get('/health', async (request, reply) => {
    return { status: 'ok', service: 'ai-microservice' };
});

const start = async () => {
    try {
        const port = parseInt(process.env.PORT || '8080', 10);
        await server.listen({ port, host: '0.0.0.0' });
        server.log.info(`Server listening on ${port}`);
    } catch (err) {
        server.log.error(err);
        process.exit(1);
    }
};

start();
