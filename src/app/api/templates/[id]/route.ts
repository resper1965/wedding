import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/templates/[id] - Get single template
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const template = await db.messageTemplate.findUnique({
      where: { id }
    })

    if (!template) {
      return NextResponse.json({ success: false, error: 'Template não encontrado' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: template })
  } catch (error) {
    console.error('Error fetching template:', error)
    return NextResponse.json({ success: false, error: 'Erro ao buscar template' }, { status: 500 })
  }
}

// PUT /api/templates/[id] - Update template
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, type, subject, content, variables, thumbnail, isActive } = body

    const existingTemplate = await db.messageTemplate.findUnique({
      where: { id }
    })

    if (!existingTemplate) {
      return NextResponse.json({ success: false, error: 'Template não encontrado' }, { status: 404 })
    }

    const template = await db.messageTemplate.update({
      where: { id },
      data: {
        name: name ?? existingTemplate.name,
        type: type ?? existingTemplate.type,
        subject: subject ?? existingTemplate.subject,
        content: content ?? existingTemplate.content,
        variables: variables !== undefined ? variables : existingTemplate.variables,
        thumbnail: thumbnail !== undefined ? thumbnail : existingTemplate.thumbnail,
        isActive: isActive !== undefined ? isActive : existingTemplate.isActive
      }
    })

    return NextResponse.json({ success: true, data: template })
  } catch (error) {
    console.error('Error updating template:', error)
    return NextResponse.json({ success: false, error: 'Erro ao atualizar template' }, { status: 500 })
  }
}

// DELETE /api/templates/[id] - Delete template
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const existingTemplate = await db.messageTemplate.findUnique({
      where: { id }
    })

    if (!existingTemplate) {
      return NextResponse.json({ success: false, error: 'Template não encontrado' }, { status: 404 })
    }

    await db.messageTemplate.delete({
      where: { id }
    })

    return NextResponse.json({ success: true, message: 'Template excluído com sucesso' })
  } catch (error) {
    console.error('Error deleting template:', error)
    return NextResponse.json({ success: false, error: 'Erro ao excluir template' }, { status: 500 })
  }
}
