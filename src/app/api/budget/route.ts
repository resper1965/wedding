import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const { data: wedding } = await db.from('Wedding').select('id').limit(1).maybeSingle()
    if (!wedding) return NextResponse.json({ success: false, error: 'No wedding' }, { status: 404 })

    const { data: items, error } = await db.from('BudgetItem').select('*').eq('weddingId', wedding.id).order('category').order('createdAt')
    if (error) throw error
    return NextResponse.json({ success: true, data: items })
  } catch (error) {
    console.error('Budget GET error:', error)
    return NextResponse.json({ success: false, error: 'Erro ao buscar itens' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { data: wedding } = await db.from('Wedding').select('id').limit(1).maybeSingle()
    if (!wedding) return NextResponse.json({ success: false, error: 'No wedding' }, { status: 404 })

    const body = await request.json()
    const { data: item, error } = await db.from('BudgetItem').insert({
      id: crypto.randomUUID(),
      weddingId: wedding.id,
      category: body.category,
      description: body.description,
      estimated: parseFloat(body.estimated) || 0,
      actual: parseFloat(body.actual) || 0,
      paid: parseFloat(body.paid) || 0,
      isPaid: body.isPaid || false,
      notes: body.notes || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }).select().single()
    if (error) throw error
    return NextResponse.json({ success: true, data: item })
  } catch (error) {
    console.error('Budget POST error:', error)
    return NextResponse.json({ success: false, error: 'Erro ao criar item' }, { status: 500 })
  }
}
