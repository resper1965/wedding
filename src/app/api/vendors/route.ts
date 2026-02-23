import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const wedding = await db.wedding.findFirst()
    if (!wedding) return NextResponse.json({ success: false, error: 'No wedding' }, { status: 404 })

    const vendors = await db.vendor.findMany({
      where: { weddingId: wedding.id },
      orderBy: [{ category: 'asc' }, { name: 'asc' }]
    })
    return NextResponse.json({ success: true, data: vendors })
  } catch (error) {
    console.error('Vendors GET error:', error)
    return NextResponse.json({ success: false, error: 'Erro ao buscar fornecedores' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const wedding = await db.wedding.findFirst()
    if (!wedding) return NextResponse.json({ success: false, error: 'No wedding' }, { status: 404 })

    const body = await request.json()
    const vendor = await db.vendor.create({
      data: {
        weddingId: wedding.id,
        name: body.name,
        category: body.category,
        contact: body.contact || null,
        phone: body.phone || null,
        email: body.email || null,
        website: body.website || null,
        value: parseFloat(body.value) || 0,
        status: body.status || 'pesquisando',
        notes: body.notes || null,
        contractUrl: body.contractUrl || null
      }
    })
    return NextResponse.json({ success: true, data: vendor })
  } catch (error) {
    console.error('Vendors POST error:', error)
    return NextResponse.json({ success: false, error: 'Erro ao criar fornecedor' }, { status: 500 })
  }
}
