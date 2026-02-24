export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const { data: wedding } = await db.from('Wedding').select('id').limit(1).maybeSingle()
    if (!wedding) return NextResponse.json({ success: true, data: [] })

    const { data: events, error } = await db.from('Event').select('*').eq('weddingId', wedding.id).order('order', { ascending: true })
    if (error) throw error

    return NextResponse.json({ success: true, data: events })
  } catch (error) {
    console.error('Error fetching events:', error)
    return NextResponse.json({ success: false, error: 'Erro ao carregar eventos' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { data: wedding } = await db.from('Wedding').select('id').limit(1).maybeSingle()
    if (!wedding) return NextResponse.json({ success: false, error: 'Nenhum casamento encontrado' }, { status: 404 })

    const body = await request.json()
    const { name, description, startTime, endTime, venue, address, dressCode, maxCapacity, order } = body

    const { data: event, error } = await db.from('Event').insert({
      id: crypto.randomUUID(),
      weddingId: wedding.id,
      name,
      description: description || null,
      startTime: new Date(startTime).toISOString(),
      endTime: endTime ? new Date(endTime).toISOString() : null,
      venue: venue || null,
      address: address || null,
      dressCode: dressCode || null,
      maxCapacity: maxCapacity || null,
      order: order || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }).select().single()

    if (error) throw error
    return NextResponse.json({ success: true, data: event })
  } catch (error) {
    console.error('Error creating event:', error)
    return NextResponse.json({ success: false, error: 'Erro ao criar evento' }, { status: 500 })
  }
}
