export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()

    const { data: msg, error } = await db.from('ScheduledMessage').update({
      type: body.type,
      template: body.template,
      recipientFilter: body.recipientFilter,
      scheduledFor: body.scheduledFor ? new Date(body.scheduledFor).toISOString() : undefined,
      timezone: body.timezone,
      status: body.status,
      updatedAt: new Date().toISOString(),
    }).eq('id', id).select().single()

    if (error) throw error
    return NextResponse.json({ success: true, data: msg })
  } catch (error) {
    console.error('Error updating scheduled message:', error)
    return NextResponse.json({ success: false, error: 'Erro ao atualizar mensagem' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { error } = await db.from('ScheduledMessage').delete().eq('id', id)
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting scheduled message:', error)
    return NextResponse.json({ success: false, error: 'Erro ao excluir mensagem' }, { status: 500 })
  }
}
