import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - List all transport options
export async function GET() {
  try {
    const wedding = await db.wedding.findFirst()
    if (!wedding) {
      return NextResponse.json({ success: true, data: [] })
    }

    const transports = await db.transport.findMany({
      where: { weddingId: wedding.id },
      orderBy: { order: 'asc' }
    })

    return NextResponse.json({ success: true, data: transports })
  } catch (error) {
    console.error('Error fetching transports:', error)
    return NextResponse.json({ success: false, error: 'Erro ao carregar transportes' }, { status: 500 })
  }
}

// POST - Create transport
export async function POST(request: NextRequest) {
  try {
    const wedding = await db.wedding.findFirst()
    if (!wedding) {
      return NextResponse.json({ success: false, error: 'Nenhum casamento encontrado' }, { status: 404 })
    }

    const body = await request.json()
    const { type, title, description, icon, price, contact, link, order } = body

    const transport = await db.transport.create({
      data: {
        weddingId: wedding.id,
        type,
        title,
        description,
        icon: icon || null,
        price: price || null,
        contact: contact || null,
        link: link || null,
        order: order || 0
      }
    })

    return NextResponse.json({ success: true, data: transport })
  } catch (error) {
    console.error('Error creating transport:', error)
    return NextResponse.json({ success: false, error: 'Erro ao criar transporte' }, { status: 500 })
  }
}
