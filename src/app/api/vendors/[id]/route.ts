export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { data: vendor, error } = await db.from('Vendor').update({
      name: body.name,
      category: body.category,
      contact: body.contact || null,
      phone: body.phone || null,
      email: body.email || null,
      website: body.website || null,
      value: parseFloat(body.value) || 0,
      status: body.status || 'pesquisando',
      notes: body.notes || null,
      contractUrl: body.contractUrl || null,
      updatedAt: new Date().toISOString(),
    }).eq('id', id).select().single()
    if (error) throw error
    return NextResponse.json({ success: true, data: vendor })
  } catch (error) {
    console.error('Vendors PUT error:', error)
    return NextResponse.json({ success: false, error: 'Erro ao atualizar fornecedor' }, { status: 500 })
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { error } = await db.from('Vendor').delete().eq('id', id)
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Vendors DELETE error:', error)
    return NextResponse.json({ success: false, error: 'Erro ao excluir fornecedor' }, { status: 500 })
  }
}
