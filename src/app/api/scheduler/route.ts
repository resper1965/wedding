import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const weddingId = searchParams.get('weddingId')
    const status = searchParams.get('status')

    if (!weddingId) return NextResponse.json({ success: false, error: 'ID do casamento é obrigatório' }, { status: 400 })

    let query = db.from('ScheduledMessage').select('*').eq('weddingId', weddingId)
    if (status) query = query.eq('status', status)

    const { data: scheduledMessages, error } = await query.order('scheduledFor')
    if (error) throw error

    const { data: wedding } = await db.from('Wedding').select('partner1Name, partner2Name, weddingDate').eq('id', weddingId).maybeSingle()

    return NextResponse.json({ success: true, data: scheduledMessages, wedding })
  } catch (error) {
    console.error('Error fetching scheduled messages:', error)
    return NextResponse.json({ success: false, error: 'Erro ao buscar mensagens agendadas' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { weddingId, type, template, recipientFilter, scheduledFor, timezone } = body

    if (!weddingId || !scheduledFor) return NextResponse.json({ success: false, error: 'Campos obrigatórios ausentes' }, { status: 400 })

    const { data: msg, error } = await db.from('ScheduledMessage').insert({
      id: crypto.randomUUID(),
      weddingId,
      type: type || 'custom',
      template: template || '',
      recipientFilter: recipientFilter || 'all',
      scheduledFor: new Date(scheduledFor).toISOString(),
      timezone: timezone || 'America/Sao_Paulo',
      status: 'pending',
      sentCount: 0,
      failedCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }).select().single()

    if (error) throw error
    return NextResponse.json({ success: true, data: msg })
  } catch (error) {
    console.error('Error creating scheduled message:', error)
    return NextResponse.json({ success: false, error: 'Erro ao criar mensagem agendada' }, { status: 500 })
  }
}
