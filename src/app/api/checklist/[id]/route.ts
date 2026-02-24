import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { data: item, error } = await db.from('ChecklistItem').update({
      title: body.title,
      category: body.category,
      dueDate: body.dueDate ? new Date(body.dueDate).toISOString() : null,
      priority: body.priority || 'normal',
      notes: body.notes || null,
      completed: body.completed ?? false,
      completedAt: body.completed ? new Date().toISOString() : null,
      updatedAt: new Date().toISOString(),
    }).eq('id', id).select().single()
    if (error) throw error
    return NextResponse.json({ success: true, data: item })
  } catch (error) {
    console.error('Checklist PUT error:', error)
    return NextResponse.json({ success: false, error: 'Erro ao atualizar item' }, { status: 500 })
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { error } = await db.from('ChecklistItem').delete().eq('id', id)
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Checklist DELETE error:', error)
    return NextResponse.json({ success: false, error: 'Erro ao excluir item' }, { status: 500 })
  }
}
