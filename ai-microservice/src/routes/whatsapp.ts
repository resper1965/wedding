import { FastifyInstance } from 'fastify';
// Em um sistema real extraído, isso seria isolado da db original 
// Mas pode rodar webhook recebendo dados puros.

export default async function conciergeRoutes(server: FastifyInstance) {
    server.post('/api/concierge/send', async (request, reply) => {
        try {
            const { phone, message } = request.body as any;

            if (!phone || !message) {
                return reply.status(400).send({
                    success: false,
                    error: 'Telefone e mensagem são obrigatórios'
                });
            }

            const normalizedPhone = phone.replace(/\D/g, '');

            const evolutionUrl = process.env.EVOLUTION_API_URL;
            const evolutionInstance = process.env.EVOLUTION_INSTANCE_NAME || 'casamento';
            const evolutionKey = process.env.EVOLUTION_API_KEY;

            if (evolutionUrl && evolutionKey) {
                // Real Evolution API Integration
                const endpoint = `${evolutionUrl}/message/sendText/${evolutionInstance}`;
                const response = await fetch(endpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'apikey': evolutionKey
                    },
                    body: JSON.stringify({
                        number: normalizedPhone,
                        options: {
                            delay: 1200,
                            presence: 'composing'
                        },
                        textMessage: {
                            text: message
                        }
                    })
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    server.log.error(`Evolution API Failed: ${response.status} - ${errorText}`);
                    throw new Error(`Evolution API Error: ${response.status}`);
                }

                server.log.info(`[Concierge Microservice] Evolution API sent to: ${normalizedPhone}`);

                return {
                    success: true,
                    simulated: false,
                    message: 'Mensagem enviada via Evolution API'
                };
            } else {
                // Fallback simulation when no credentials found
                server.log.info(`[Concierge Microservice] Credentials missing. SIMULATING message to: ${normalizedPhone}`);
                server.log.info(`[Concierge Microservice] Message: ${message}`);

                return {
                    success: true,
                    simulated: true,
                    message: 'WhatsApp microservice API mock - mensagem simulada'
                };
            }

        } catch (error: any) {
            server.log.error({ err: error }, 'Error sending message');
            return reply.status(500).send({
                success: false,
                error: 'Erro ao enviar mensagem'
            });
        }
    });
}
