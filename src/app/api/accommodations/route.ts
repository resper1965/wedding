import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - List all accommodations
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const sortBy = searchParams.get('sortBy') || 'order'

    const wedding = await db.wedding.findFirst()
    if (!wedding) {
      return NextResponse.json({ success: true, data: [] })
    }

    const where: { weddingId: string; type?: string } = { weddingId: wedding.id }
    if (type && type !== 'all') {
      where.type = type
    }

    let orderBy: { order: 'asc' } | { priceRange: 'asc' } | { distance: 'asc' } = { order: 'asc' }
    if (sortBy === 'price') {
      orderBy = { priceRange: 'asc' }
    } else if (sortBy === 'distance') {
      orderBy = { distance: 'asc' }
    }

    const accommodations = await db.accommodation.findMany({
      where,
      orderBy
    })

    return NextResponse.json({ success: true, data: accommodations })
  } catch (error) {
    console.error('Error fetching accommodations:', error)
    return NextResponse.json({ success: false, error: 'Erro ao carregar hospedagens' }, { status: 500 })
  }
}

// POST - Create accommodation
export async function POST(request: NextRequest) {
  try {
    const wedding = await db.wedding.findFirst()
    if (!wedding) {
      return NextResponse.json({ success: false, error: 'Nenhum casamento encontrado' }, { status: 404 })
    }

    const body = await request.json()
    const {
      name,
      type,
      description,
      imageUrl,
      address,
      phone,
      website,
      priceRange,
      distance,
      specialRate,
      discountCode,
      recommended,
      order
    } = body

    const accommodation = await db.accommodation.create({
      data: {
        weddingId: wedding.id,
        name,
        type,
        description: description || null,
        imageUrl: imageUrl || null,
        address,
        phone: phone || null,
        website: website || null,
        priceRange: priceRange || null,
        distance: distance || null,
        specialRate: specialRate || null,
        discountCode: discountCode || null,
        recommended: recommended || false,
        order: order || 0
      }
    })

    return NextResponse.json({ success: true, data: accommodation })
  } catch (error) {
    console.error('Error creating accommodation:', error)
    return NextResponse.json({ success: false, error: 'Erro ao criar hospedagem' }, { status: 500 })
  }
}
