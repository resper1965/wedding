import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { GiftStatus } from '@prisma/client'

// GET - List all gifts (public)
export async function GET(request: NextRequest) {
  try {
    const wedding = await db.wedding.findFirst()
    if (!wedding) {
      return NextResponse.json({ success: false, error: 'Nenhum casamento encontrado' }, { status: 404 })
    }

    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const category = searchParams.get('category')
    const search = searchParams.get('search')

    const gifts = await db.gift.findMany({
      where: {
        weddingId: wedding.id,
        ...(status && { status: status as GiftStatus }),
        ...(category && { category }),
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } }
          ]
        })
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'asc' }
      ]
    })

    // Get unique categories
    const categories = await db.gift.groupBy({
      by: ['category'],
      where: {
        weddingId: wedding.id,
        category: { not: null }
      },
      _count: true
    })

    return NextResponse.json({ 
      success: true, 
      data: gifts,
      categories: categories.map(c => c.category).filter(Boolean)
    })
  } catch (error) {
    console.error('Error fetching gifts:', error)
    return NextResponse.json({ success: false, error: 'Erro ao carregar presentes' }, { status: 500 })
  }
}

// POST - Create gift (admin)
export async function POST(request: NextRequest) {
  try {
    const wedding = await db.wedding.findFirst()
    if (!wedding) {
      return NextResponse.json({ success: false, error: 'Nenhum casamento encontrado' }, { status: 404 })
    }

    const body = await request.json()
    const { 
      name, 
      description, 
      imageUrl, 
      price, 
      currency, 
      externalUrl, 
      store, 
      priority, 
      category 
    } = body

    const gift = await db.gift.create({
      data: {
        weddingId: wedding.id,
        name,
        description: description || null,
        imageUrl: imageUrl || null,
        price: price ? parseFloat(price) : null,
        currency: currency || 'BRL',
        externalUrl: externalUrl || null,
        store: store || null,
        priority: priority || 0,
        category: category || null
      }
    })

    return NextResponse.json({ success: true, data: gift })
  } catch (error) {
    console.error('Error creating gift:', error)
    return NextResponse.json({ success: false, error: 'Erro ao criar presente' }, { status: 500 })
  }
}
