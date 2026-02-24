import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { data: template, error } = await db.from('MessageTemplate').select('*').eq('id', id).maybeSingle()
    if (error) throw error
    if (!template) return NextResponse.json({ success: false, error: 'Template não encontrado' }, { status: 404 })
    return NextResponse.json({ success: true, data: template })
  } catch (error) {
    console.error('Error fetching template:', error)
    return NextResponse.json({ success: false, error: 'Erro ao buscar template' }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()

    const { data: existing } = await db.from('MessageTemplate').select('*').eq('id', id).maybeSingle()
    if (!existing) return NextResponse.json({ success: false, error: 'Template não encontrado' }, { status: 404 })

    const { data: template, error } = await db.from('MessageTemplate').update({
      name: body.name ?? existing.name,
      type: body.type ?? existing.type,
      subject: body.subject ?? existing.subject,
      content: body.content ?? existing.content,
      variables: body.variables !== undefined ? body.variables : existing.variables,
      thumbnail: body.thumbnail !== undefined ? body.thumbnail : existing.thumbnail,
      isActive: body.isActive !== undefined ? body.isActive : existing.isActive,
      updatedAt: new Date().toISOString(),
    }).eq('id', id).select().single()

    if (error) throw error
    return NextResponse.json({ success: true, data: template })
  } catch (error) {
    console.error('Error updating template:', error)
    return NextResponse.json({ success: false, error: 'Erro ao atualizar template' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { data: existing } = await db.from('MessageTemplate').select('id').eq('id', id).maybeSingle()
    if (!existing) return NextResponse.json({ success: false, error: 'Template não encontrado' }, { status: 404 })

    const { error } = await db.from('MessageTemplate').delete().eq('id', id)
    if (error) throw error
    return NextResponse.json({ success: true, message: 'Template excluído com sucesso' })
  } catch (error) {
    console.error('Error deleting template:', error)
    return NextResponse.json({ success: false, error: 'Erro ao excluir template' }, { status: 500 })
  }
}
