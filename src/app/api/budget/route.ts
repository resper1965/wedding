import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const wedding = await db.wedding.findFirst()
    if (!wedding) return NextResponse.json({ success: false, error: 'No wedding' }, { status: 404 })

    const items = await db.budgetItem.findMany({
      where: { weddingId: wedding.id },
      orderBy: [{ category: 'asc' }, { createdAt: 'asc' }]
    })
    return NextResponse.json({ success: true, data: items })
  } catch (error) {
    console.error('Budget GET error:', error)
    return NextResponse.json({ success: false, error: 'Erro ao buscar itens' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const wedding = await db.wedding.findFirst()
    if (!wedding) return NextResponse.json({ success: false, error: 'No wedding' }, { status: 404 })

    const body = await request.json()
    const item = await db.budgetItem.create({
      data: {
        weddingId: wedding.id,
        category: body.category,
        description: body.description,
        estimated: parseFloat(body.estimated) || 0,
        actual: parseFloat(body.actual) || 0,
        paid: parseFloat(body.paid) || 0,
        isPaid: body.isPaid || false,
        notes: body.notes || null
      }
    })
    return NextResponse.json({ success: true, data: item })
  } catch (error) {
    console.error('Budget POST error:', error)
    return NextResponse.json({ success: false, error: 'Erro ao criar item' }, { status: 500 })
  }
}
