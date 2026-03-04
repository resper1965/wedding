export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { data: item, error } = await db.from('BudgetItem').update({
      category: body.category,
      description: body.description,
      estimated: parseFloat(body.estimated) || 0,
      actual: parseFloat(body.actual) || 0,
      paid: parseFloat(body.paid) || 0,
      isPaid: body.isPaid || false,
      notes: body.notes || null,
      updatedAt: new Date().toISOString(),
    }).eq('id', id).select().single()
    if (error) throw error
    return NextResponse.json({ success: true, data: item })
  } catch (error) {
    console.error('Budget PUT error:', error)
    return NextResponse.json({ success: false, error: 'Erro ao atualizar item' }, { status: 500 })
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { error } = await db.from('BudgetItem').delete().eq('id', id)
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Budget DELETE error:', error)
    return NextResponse.json({ success: false, error: 'Erro ao excluir item' }, { status: 500 })
  }
}
