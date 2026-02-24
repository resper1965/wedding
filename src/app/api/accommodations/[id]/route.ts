import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { data, error } = await db.from('Accommodation').select('*').eq('id', id).maybeSingle()
    if (error) throw error
    if (!data) return NextResponse.json({ success: false, error: 'Hospedagem não encontrada' }, { status: 404 })
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error fetching accommodation:', error)
    return NextResponse.json({ success: false, error: 'Erro ao carregar hospedagem' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { data, error } = await db.from('Accommodation').update({
      name: body.name, type: body.type,
      description: body.description || null, imageUrl: body.imageUrl || null,
      address: body.address, phone: body.phone || null, website: body.website || null,
      priceRange: body.priceRange || null, distance: body.distance || null,
      specialRate: body.specialRate || null, discountCode: body.discountCode || null,
      recommended: body.recommended || false, order: body.order || 0,
      updatedAt: new Date().toISOString(),
    }).eq('id', id).select().single()
    if (error) throw error
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error updating accommodation:', error)
    return NextResponse.json({ success: false, error: 'Erro ao atualizar hospedagem' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { error } = await db.from('Accommodation').delete().eq('id', id)
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting accommodation:', error)
    return NextResponse.json({ success: false, error: 'Erro ao excluir hospedagem' }, { status: 500 })
  }
}
