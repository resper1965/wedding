import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { data, error } = await db.from('Transport').select('*').eq('id', id).maybeSingle()
    if (error) throw error
    if (!data) return NextResponse.json({ success: false, error: 'Transporte não encontrado' }, { status: 404 })
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error fetching transport:', error)
    return NextResponse.json({ success: false, error: 'Erro ao carregar transporte' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { data, error } = await db.from('Transport').update({
      type: body.type, title: body.title, description: body.description,
      icon: body.icon || null, price: body.price || null, contact: body.contact || null,
      link: body.link || null, order: body.order || 0,
      updatedAt: new Date().toISOString(),
    }).eq('id', id).select().single()
    if (error) throw error
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error updating transport:', error)
    return NextResponse.json({ success: false, error: 'Erro ao atualizar transporte' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { error } = await db.from('Transport').delete().eq('id', id)
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting transport:', error)
    return NextResponse.json({ success: false, error: 'Erro ao excluir transporte' }, { status: 500 })
  }
}
