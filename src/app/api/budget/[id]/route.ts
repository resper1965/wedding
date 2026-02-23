import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const item = await db.budgetItem.update({
      where: { id },
      data: {
        category: body.category,
        description: body.description,
        estimated: parseFloat(body.estimated) || 0,
        actual: parseFloat(body.actual) || 0,
        paid: parseFloat(body.paid) || 0,
        isPaid: body.isPaid,
        notes: body.notes || null
      }
    })
    return NextResponse.json({ success: true, data: item })
  } catch (error) {
    console.error('Budget PUT error:', error)
    return NextResponse.json({ success: false, error: 'Erro ao atualizar' }, { status: 500 })
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await db.budgetItem.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Budget DELETE error:', error)
    return NextResponse.json({ success: false, error: 'Erro ao deletar' }, { status: 500 })
  }
}
