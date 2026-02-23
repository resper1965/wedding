import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const wedding = await db.wedding.findFirst()
    if (!wedding) return NextResponse.json({ success: false, error: 'No wedding' }, { status: 404 })

    const items = await db.checklistItem.findMany({
      where: { weddingId: wedding.id },
      orderBy: [{ category: 'asc' }, { dueDate: 'asc' }, { createdAt: 'asc' }]
    })
    return NextResponse.json({ success: true, data: items })
  } catch (error) {
    console.error('Checklist GET error:', error)
    return NextResponse.json({ success: false, error: 'Erro ao buscar checklist' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const wedding = await db.wedding.findFirst()
    if (!wedding) return NextResponse.json({ success: false, error: 'No wedding' }, { status: 404 })

    const body = await request.json()
    const item = await db.checklistItem.create({
      data: {
        weddingId: wedding.id,
        title: body.title,
        category: body.category,
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
        priority: body.priority || 'normal',
        notes: body.notes || null
      }
    })
    return NextResponse.json({ success: true, data: item })
  } catch (error) {
    console.error('Checklist POST error:', error)
    return NextResponse.json({ success: false, error: 'Erro ao criar item' }, { status: 500 })
  }
}
