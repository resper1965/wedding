import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const vendor = await db.vendor.update({
      where: { id },
      data: {
        name: body.name,
        category: body.category,
        contact: body.contact || null,
        phone: body.phone || null,
        email: body.email || null,
        website: body.website || null,
        value: parseFloat(body.value) || 0,
        status: body.status,
        notes: body.notes || null,
        contractUrl: body.contractUrl || null
      }
    })
    return NextResponse.json({ success: true, data: vendor })
  } catch (error) {
    console.error('Vendor PUT error:', error)
    return NextResponse.json({ success: false, error: 'Erro ao atualizar' }, { status: 500 })
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await db.vendor.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Vendor DELETE error:', error)
    return NextResponse.json({ success: false, error: 'Erro ao deletar' }, { status: 500 })
  }
}
