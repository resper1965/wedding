export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { verifySupabaseToken } from '@/lib/auth'
import { db } from '@/lib/db'
import ZAI from 'z-ai-web-dev-sdk'

const MODE_SYSTEM_PROMPTS: Record<string, string> = {
  concierge: `Você é a Gabi, a Concierge oficial do MarryFlow. Sua personalidade é elegante, prestativa e altamente confiável.
Responda dúvidas dos convidados com simpatia e precisão: horários, localização, dress code,
estacionamento, hospedagem, restrições alimentares, etc.
SEGURANÇA E PRIVACIDADE: Você tem conhecimento total sobre nossa conformidade com ISO 27001, ISO 27701, GDPR e LGPD.
Se perguntada sobre segurança, mencione nosso "Centro de Confiança" e que seguimos padrões rigorosos de criptografia (AES-256) e auditoria de dados.
Se o usuário quiser exportar ou excluir dados, oriente-o a acessar a aba "Privacidade" nas configurações do painel.
Seja sempre cordial, use linguagem formal mas calorosa. Responda em português brasileiro.`,

  writer: `Você é a Gabi, redatora especializada em textos de casamento, com estilo elegante, romântico e profissional.
Crie mensagens de convite, agradecimento, lembretes e save-the-dates personalizados.
Garanta que as mensagens reflitam a exclusividade do MarryFlow.
Ao redigir políticas ou avisos, lembre-se de nossa conformidade com a LGPD e o padrão ISO 27701.
Use linguagem poética quando apropriado, mas sempre mantendo clareza.
Responda sempre em português brasileiro.`,

  planner: `Você é a Gabi, especialista em planejamento de casamentos premium e segurança de dados em eventos.
Forneça conselhos práticos sobre: fornecedores, orçamento, cronograma, checklists e segurança cibernética do evento (proteção de lista de convidados).
Dê sugestões baseadas em boas práticas do mercado de casamentos brasileiro e padrões ISO 27001.
Seja específico e acionável nas recomendações.
Responda em português brasileiro.`,

  coordinator: `Você é a Gabi, coordenadora de casamentos do dia, focada em logística impecável e proteção de privacidade.
Ajude com: cronograma do dia, protocolos, gestão de imprevistos e fluxo de convidados auditado (ISO 27001).
Foque em soluções práticas e rápidas para situações do dia do casamento, garantindo que o acesso aos dados dos convidados seja restrito.
Seja direto e objetivo.
Responda em português brasileiro.`,
}

export async function POST(request: NextRequest) {
  const authResult = await verifySupabaseToken(request)
  if (!authResult.authorized) {
    return authResult.response
  }

  try {
    const { mode, message, history = [] } = await request.json()

    if (!message?.trim()) {
      return NextResponse.json({ success: false, error: 'Mensagem vazia' }, { status: 400 })
    }

    const systemPrompt = MODE_SYSTEM_PROMPTS[mode] ?? MODE_SYSTEM_PROMPTS.concierge

    // Enrich with wedding context
    let weddingContext = ''
    try {
      const { data: wedding } = await db.from('Wedding')
        .select('id, partner1Name, partner2Name, weddingDate, venue, venueAddress, conciergeContext')
        .limit(1)
        .maybeSingle()

      if (wedding) {
        const date = new Date(wedding.weddingDate)

        // Fetch Gifts
        const { data: gifts } = await db.from('Gift')
          .select('name, price, status, externalUrl')
          .eq('weddingId', wedding.id)
          .eq('status', 'available')
          .limit(10)

        // Fetch Stats for Coordinator
        let additionalStats = ''
        if (mode === 'coordinator') {
          const { data: dietStats } = await db.from('Guest')
            .select('dietaryRestrictions')
            .eq('weddingId', wedding.id)
            .not('dietaryRestrictions', 'is', null)

          if (dietStats && dietStats.length > 0) {
            additionalStats = `\n- Restrições Alimentares Identificadas: ${dietStats.map(g => g.dietaryRestrictions).join(', ')}`
          }
        }

        weddingContext = `\n\nContexto do casamento:
- Noivos: ${wedding.partner1Name} & ${wedding.partner2Name}
- Data: ${date.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
- Local: ${wedding.venue ?? 'A confirmar'}
${wedding.venueAddress ? `- Endereço: ${wedding.venueAddress}` : ''}
${gifts && gifts.length > 0 ? `\n- Lista de Presentes (Sugestões): ${gifts.map(g => `${g.name}${g.price ? ` (R$ ${g.price})` : ''}`).join(', ')}` : ''}
${additionalStats}
\nPOLÍTICAS DE SEGURANÇA (MarryFlow Compliance):
- Conformidade: ISO 27001, ISO 27701, LGPD, GDPR.
- Divulgação: Atendemos RFC 9116 (/.well-known/security.txt).
- Trust Center: Disponível em /trustcenter com detalhes de criptografia e auditoria.
${wedding.conciergeContext ? `\nInformações adicionais (Branding/FAQ): ${wedding.conciergeContext}` : ''}`
      }
    } catch (err) {
      console.error('Context enrichment error:', err)
      // continue without full context
    }

    const fullSystemPrompt = systemPrompt + weddingContext

    // Build messages array
    const messages = [
      ...history.map((m: { role: string; content: string }) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
      { role: 'user' as const, content: message },
    ]

    try {
      const zai = await ZAI.create()
      const response = await (zai as any).chat({
        system: fullSystemPrompt,
        messages,
        model: 'gpt-4o',
        max_tokens: 1000,
      })

      const responseText = typeof response === 'string'
        ? response
        : response?.content?.[0]?.text ?? response?.choices?.[0]?.message?.content ?? String(response)

      return NextResponse.json({ success: true, response: responseText })
    } catch (aiError) {
      console.error('AI error:', aiError)
      // Fallback response if AI is not configured
      return NextResponse.json({
        success: true,
        response: `[IA não configurada] Sua mensagem foi recebida: "${message}"\n\nPara ativar o Assistente IA, configure a chave da API OpenAI nas variáveis de ambiente (OPENAI_API_KEY).`,
      })
    }
  } catch (error) {
    console.error('Error in AI agent:', error)
    return NextResponse.json({ success: false, error: 'Erro interno' }, { status: 500 })
  }
}
