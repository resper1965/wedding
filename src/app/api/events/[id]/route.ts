import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { data: event, error } = await db.from('Event').select('*').eq('id', id).maybeSingle()
    if (error) throw error
    if (!event) return NextResponse.json({ success: false, error: 'Evento não encontrado' }, { status: 404 })

    const { count } = await db.from('Rsvp').select('*', { count: 'exact', head: true }).eq('eventId', id)
    return NextResponse.json({ success: true, data: { ...event, _count: { rsvps: count ?? 0 } } })
  } catch (error) {
    console.error('Error fetching event:', error)
    return NextResponse.json({ success: false, error: 'Erro ao carregar evento' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, description, startTime, endTime, venue, address, dressCode, maxCapacity, order } = body

    const { data: event, error } = await db.from('Event').update({
      name,
      description: description || null,
      startTime: new Date(startTime).toISOString(),
      endTime: endTime ? new Date(endTime).toISOString() : null,
      venue: venue || null,
      address: address || null,
      dressCode: dressCode || null,
      maxCapacity: maxCapacity || null,
      order: order || 0,
      updatedAt: new Date().toISOString(),
    }).eq('id', id).select().single()

    if (error) throw error
    return NextResponse.json({ success: true, data: event })
  } catch (error) {
    console.error('Error updating event:', error)
    return NextResponse.json({ success: false, error: 'Erro ao atualizar evento' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { error } = await db.from('Event').delete().eq('id', id)
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting event:', error)
    return NextResponse.json({ success: false, error: 'Erro ao excluir evento' }, { status: 500 })
  }
}
