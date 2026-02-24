import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const sortBy = searchParams.get('sortBy') || 'order'

    const { data: wedding } = await db.from('Wedding').select('id').limit(1).maybeSingle()
    if (!wedding) return NextResponse.json({ success: true, data: [] })

    let query = db.from('Accommodation').select('*').eq('weddingId', wedding.id)
    if (type && type !== 'all') query = query.eq('type', type)

    const sortField = sortBy === 'price' ? 'priceRange' : sortBy === 'distance' ? 'distance' : 'order'
    const { data: accommodations, error } = await query.order(sortField)
    if (error) throw error

    return NextResponse.json({ success: true, data: accommodations })
  } catch (error) {
    console.error('Error fetching accommodations:', error)
    return NextResponse.json({ success: false, error: 'Erro ao carregar hospedagens' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { data: wedding } = await db.from('Wedding').select('id').limit(1).maybeSingle()
    if (!wedding) return NextResponse.json({ success: false, error: 'Nenhum casamento encontrado' }, { status: 404 })

    const body = await request.json()
    const { data: accommodation, error } = await db.from('Accommodation').insert({
      id: crypto.randomUUID(),
      weddingId: wedding.id,
      name: body.name,
      type: body.type,
      description: body.description || null,
      imageUrl: body.imageUrl || null,
      address: body.address,
      phone: body.phone || null,
      website: body.website || null,
      priceRange: body.priceRange || null,
      distance: body.distance || null,
      specialRate: body.specialRate || null,
      discountCode: body.discountCode || null,
      recommended: body.recommended || false,
      order: body.order || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }).select().single()

    if (error) throw error
    return NextResponse.json({ success: true, data: accommodation })
  } catch (error) {
    console.error('Error creating accommodation:', error)
    return NextResponse.json({ success: false, error: 'Erro ao criar hospedagem' }, { status: 500 })
  }
}
