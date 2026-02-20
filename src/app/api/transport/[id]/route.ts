import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Single transport
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const transport = await db.transport.findUnique({
      where: { id }
    })

    if (!transport) {
      return NextResponse.json({ success: false, error: 'Transporte não encontrado' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: transport })
  } catch (error) {
    console.error('Error fetching transport:', error)
    return NextResponse.json({ success: false, error: 'Erro ao carregar transporte' }, { status: 500 })
  }
}

// PUT - Update transport
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { type, title, description, icon, price, contact, link, order } = body

    const transport = await db.transport.update({
      where: { id },
      data: {
        type,
        title,
        description,
        icon: icon || null,
        price: price || null,
        contact: contact || null,
        link: link || null,
        order: order || 0
      }
    })

    return NextResponse.json({ success: true, data: transport })
  } catch (error) {
    console.error('Error updating transport:', error)
    return NextResponse.json({ success: false, error: 'Erro ao atualizar transporte' }, { status: 500 })
  }
}

// DELETE - Remove transport
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await db.transport.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting transport:', error)
    return NextResponse.json({ success: false, error: 'Erro ao excluir transporte' }, { status: 500 })
  }
}
