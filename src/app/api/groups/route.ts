import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - List all groups
export async function GET() {
  try {
    const wedding = await db.wedding.findFirst()
    if (!wedding) {
      return NextResponse.json({ success: false, error: 'Nenhum casamento encontrado' }, { status: 404 })
    }

    const groups = await db.guestGroup.findMany({
      where: { weddingId: wedding.id },
      include: {
        _count: { select: { guests: true } },
        table: { select: { id: true, name: true } }
      },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json({ success: true, data: groups })
  } catch (error) {
    console.error('Error fetching groups:', error)
    return NextResponse.json({ success: false, error: 'Erro ao carregar grupos' }, { status: 500 })
  }
}

// POST - Create new group
export async function POST(request: NextRequest) {
  try {
    const wedding = await db.wedding.findFirst()
    if (!wedding) {
      return NextResponse.json({ success: false, error: 'Nenhum casamento encontrado' }, { status: 404 })
    }

    const body = await request.json()
    const { name, notes, tableId } = body

    const group = await db.guestGroup.create({
      data: {
        weddingId: wedding.id,
        name,
        notes: notes || null,
        tableId: tableId || null
      },
      include: {
        _count: { select: { guests: true } }
      }
    })

    return NextResponse.json({ success: true, data: group })
  } catch (error) {
    console.error('Error creating group:', error)
    return NextResponse.json({ success: false, error: 'Erro ao criar grupo' }, { status: 500 })
  }
}
