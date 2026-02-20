import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Single event
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const event = await db.event.findUnique({
      where: { id },
      include: {
        _count: { select: { rsvps: true } }
      }
    })

    if (!event) {
      return NextResponse.json({ success: false, error: 'Evento não encontrado' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: event })
  } catch (error) {
    console.error('Error fetching event:', error)
    return NextResponse.json({ success: false, error: 'Erro ao carregar evento' }, { status: 500 })
  }
}

// PUT - Update event
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, description, startTime, endTime, venue, address, dressCode, maxCapacity, order } = body

    const event = await db.event.update({
      where: { id },
      data: {
        name,
        description: description || null,
        startTime: new Date(startTime),
        endTime: endTime ? new Date(endTime) : null,
        venue: venue || null,
        address: address || null,
        dressCode: dressCode || null,
        maxCapacity: maxCapacity || null,
        order: order || 0
      }
    })

    return NextResponse.json({ success: true, data: event })
  } catch (error) {
    console.error('Error updating event:', error)
    return NextResponse.json({ success: false, error: 'Erro ao atualizar evento' }, { status: 500 })
  }
}

// DELETE - Remove event
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    await db.event.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting event:', error)
    return NextResponse.json({ success: false, error: 'Erro ao excluir evento' }, { status: 500 })
  }
}
