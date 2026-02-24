import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { data: gift, error } = await db.from('Gift').select('*').eq('id', id).maybeSingle()
    if (error) throw error
    if (!gift) return NextResponse.json({ success: false, error: 'Presente não encontrado' }, { status: 404 })
    return NextResponse.json({ success: true, data: gift })
  } catch (error) {
    console.error('Error fetching gift:', error)
    return NextResponse.json({ success: false, error: 'Erro ao carregar presente' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, description, imageUrl, price, currency, externalUrl, store, priority, category, status } = body

    const { data: gift, error } = await db.from('Gift').update({
      name,
      description: description || null,
      imageUrl: imageUrl || null,
      price: price || null,
      currency: currency || 'BRL',
      externalUrl: externalUrl || null,
      store: store || null,
      priority: priority || 0,
      category: category || null,
      status: status || 'available',
      updatedAt: new Date().toISOString(),
    }).eq('id', id).select().single()

    if (error) throw error
    return NextResponse.json({ success: true, data: gift })
  } catch (error) {
    console.error('Error updating gift:', error)
    return NextResponse.json({ success: false, error: 'Erro ao atualizar presente' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { error } = await db.from('Gift').delete().eq('id', id)
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting gift:', error)
    return NextResponse.json({ success: false, error: 'Erro ao excluir presente' }, { status: 500 })
  }
}
