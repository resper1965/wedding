import { FastifyInstance } from 'fastify';
import ZAI from 'z-ai-web-dev-sdk';

const MODE_SYSTEM_PROMPTS: Record<string, string> = {
    concierge: `Você é o Concierge oficial do casamento, um assistente elegante e prestativo.
Responda dúvidas dos convidados com simpatia e precisão: horários, localização, dress code,
estacionamento, hospedagem, restrições alimentares, etc.
Seja sempre cordial, use linguagem formal mas calorosa. Responda em português brasileiro.
Quando não tiver uma informação específica, oriente gentilmente a entrar em contato com os noivos.`,

    writer: `Você é um redator especializado em textos de casamento, com estilo elegante e romântico.
Crie mensagens de convite, agradecimento, lembretes e save-the-dates personalizados.
Use linguagem poética quando apropriado, mas sempre mantendo clareza.
Adapte o tom conforme o pedido (formal, informal, divertido, emotivo).
Responda sempre em português brasileiro.`,

    planner: `Você é um especialista em planejamento de casamentos com experiência em eventos premium.
Forneça conselhos práticos sobre: fornecedores, orçamento, cronograma, checklists e logística.
Dê sugestões baseadas em boas práticas do mercado de casamentos brasileiro.
Seja específico e acionável nas recomendações.
Responda em português brasileiro.`,

    coordinator: `Você é um coordenador de casamentos do dia, especialista em gestão de cerimônias e recepções.
Ajude com: cronograma do dia, protocolos, gestão de imprevistos, fluxo de convidados e fornecedores.
Foque em soluções práticas e rápidas para situações do dia do casamento.
Seja direto e objetivo.
Responda em português brasileiro.`,
};

export default async function aiAgentRoutes(server: FastifyInstance) {
    server.post('/api/ai-agent/chat', async (request, reply) => {
        try {
            const { mode, message, history = [], weddingContext = '' } = request.body as any;

            if (!message?.trim()) {
                return reply.status(400).send({ success: false, error: 'Mensagem vazia' });
            }

            const systemPrompt = MODE_SYSTEM_PROMPTS[mode] ?? MODE_SYSTEM_PROMPTS.concierge;
            const fullSystemPrompt = systemPrompt + (weddingContext ? `\n\nContexto do casamento:\n${weddingContext}` : '');

            const messages = [
                ...history.map((m: { role: string; content: string }) => ({
                    role: m.role as 'user' | 'assistant',
                    content: m.content,
                })),
                { role: 'user' as const, content: message },
            ];

            try {
                const zai = await ZAI.create();
                const response = await (zai as any).chat({
                    system: fullSystemPrompt,
                    messages,
                    model: 'gpt-4o',
                    max_tokens: 1000,
                });

                const responseText = typeof response === 'string'
                    ? response
                    : response?.content?.[0]?.text ?? response?.choices?.[0]?.message?.content ?? String(response);

                return { success: true, response: responseText };
            } catch (aiError: any) {
                server.log.error({ err: aiError }, 'AI error');
                return {
                    success: true,
                    response: `[IA não configurada] Sua mensagem foi recebida: "${message}"\n\nPara ativar o Assistente IA, configure a chave da API OpenAI nas variáveis de ambiente.`,
                };
            }
        } catch (error: any) {
            server.log.error({ err: error }, 'Error in AI agent route');
            return reply.status(500).send({ success: false, error: 'Erro interno' });
        }
    });
}
