export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const tenantId = request.headers.get('x-tenant-id')
    if (!tenantId) return NextResponse.json({ success: false, error: 'ID do casamento não fornecido' }, { status: 400 })

    const { data: wedding } = await db.from('Wedding').select('id').eq('id', tenantId).maybeSingle()
    if (!wedding) return NextResponse.json({ success: false, error: 'No wedding' }, { status: 404 })

    const { data: vendors, error } = await db.from('Vendor').select('*').eq('weddingId', wedding.id).order('category').order('name')
    if (error) throw error
    return NextResponse.json({ success: true, data: vendors })
  } catch (error) {
    console.error('Vendors GET error:', error)
    return NextResponse.json({ success: false, error: 'Erro ao buscar fornecedores' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const tenantId = request.headers.get('x-tenant-id')
    if (!tenantId) return NextResponse.json({ success: false, error: 'ID do casamento não fornecido' }, { status: 400 })

    const { data: wedding } = await db.from('Wedding').select('id').eq('id', tenantId).maybeSingle()
    if (!wedding) return NextResponse.json({ success: false, error: 'No wedding' }, { status: 404 })

    const body = await request.json()
    const { data: vendor, error } = await db.from('Vendor').insert({
      id: crypto.randomUUID(),
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
      contractUrl: body.contractUrl || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }).select().single()
    if (error) throw error
    return NextResponse.json({ success: true, data: vendor })
  } catch (error) {
    console.error('Vendors POST error:', error)
    return NextResponse.json({ success: false, error: 'Erro ao criar fornecedor' }, { status: 500 })
  }
}
