import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const item = await db.checklistItem.update({
      where: { id },
      data: {
        title: body.title,
        category: body.category,
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
        completed: body.completed,
        completedAt: body.completed ? (body.completedAt ? new Date(body.completedAt) : new Date()) : null,
        priority: body.priority || 'normal',
        notes: body.notes || null
      }
    })
    return NextResponse.json({ success: true, data: item })
  } catch (error) {
    console.error('Checklist PUT error:', error)
    return NextResponse.json({ success: false, error: 'Erro ao atualizar' }, { status: 500 })
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await db.checklistItem.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Checklist DELETE error:', error)
    return NextResponse.json({ success: false, error: 'Erro ao deletar' }, { status: 500 })
  }
}
