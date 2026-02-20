import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - List all events
export async function GET() {
  try {
    const wedding = await db.wedding.findFirst()
    if (!wedding) {
      return NextResponse.json({ success: true, data: [] })
    }

    const events = await db.event.findMany({
      where: { weddingId: wedding.id },
      orderBy: { order: 'asc' }
    })

    return NextResponse.json({ success: true, data: events })
  } catch (error) {
    console.error('Error fetching events:', error)
    return NextResponse.json({ success: false, error: 'Erro ao carregar eventos' }, { status: 500 })
  }
}

// POST - Create event
export async function POST(request: NextRequest) {
  try {
    const wedding = await db.wedding.findFirst()
    if (!wedding) {
      return NextResponse.json({ success: false, error: 'Nenhum casamento encontrado' }, { status: 404 })
    }

    const body = await request.json()
    const { name, description, startTime, endTime, venue, address, dressCode, maxCapacity, order } = body

    const event = await db.event.create({
      data: {
        weddingId: wedding.id,
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
    console.error('Error creating event:', error)
    return NextResponse.json({ success: false, error: 'Erro ao criar evento' }, { status: 500 })
  }
}
