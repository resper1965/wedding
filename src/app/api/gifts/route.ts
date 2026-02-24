import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { data: wedding } = await db.from('Wedding').select('id').limit(1).maybeSingle()
    if (!wedding) return NextResponse.json({ success: false, error: 'Nenhum casamento encontrado' }, { status: 404 })

    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const category = searchParams.get('category')
    const search = searchParams.get('search')

    let query = db.from('Gift').select('*').eq('weddingId', wedding.id)
    if (status) query = query.eq('status', status)
    if (category) query = query.eq('category', category)
    if (search) query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)

    const { data: gifts, error } = await query.order('priority', { ascending: false }).order('createdAt')
    if (error) throw error

    const categories = [...new Set((gifts || []).map((g: any) => g.category).filter(Boolean))]

    return NextResponse.json({ success: true, data: gifts, categories })
  } catch (error) {
    console.error('Error fetching gifts:', error)
    return NextResponse.json({ success: false, error: 'Erro ao carregar presentes' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { data: wedding } = await db.from('Wedding').select('id').limit(1).maybeSingle()
    if (!wedding) return NextResponse.json({ success: false, error: 'Nenhum casamento encontrado' }, { status: 404 })

    const body = await request.json()
    const { name, description, imageUrl, price, currency, externalUrl, store, priority, category } = body

    const { data: gift, error } = await db.from('Gift').insert({
      id: crypto.randomUUID(),
      weddingId: wedding.id,
      name,
      description: description || null,
      imageUrl: imageUrl || null,
      price: price || null,
      currency: currency || 'BRL',
      externalUrl: externalUrl || null,
      store: store || null,
      status: 'available',
      priority: priority || 0,
      category: category || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }).select().single()

    if (error) throw error
    return NextResponse.json({ success: true, data: gift })
  } catch (error) {
    console.error('Error creating gift:', error)
    return NextResponse.json({ success: false, error: 'Erro ao criar presente' }, { status: 500 })
  }
}
