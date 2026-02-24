export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const { data: wedding } = await db.from('Wedding').select('id').limit(1).maybeSingle()
    if (!wedding) return NextResponse.json({ success: true, data: [] })

    const { data: transports, error } = await db.from('Transport').select('*').eq('weddingId', wedding.id).order('order')
    if (error) throw error
    return NextResponse.json({ success: true, data: transports })
  } catch (error) {
    console.error('Error fetching transports:', error)
    return NextResponse.json({ success: false, error: 'Erro ao carregar transportes' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { data: wedding } = await db.from('Wedding').select('id').limit(1).maybeSingle()
    if (!wedding) return NextResponse.json({ success: false, error: 'Nenhum casamento encontrado' }, { status: 404 })

    const body = await request.json()
    const { data: transport, error } = await db.from('Transport').insert({
      id: crypto.randomUUID(),
      weddingId: wedding.id,
      type: body.type,
      title: body.title,
      description: body.description,
      icon: body.icon || null,
      price: body.price || null,
      contact: body.contact || null,
      link: body.link || null,
      order: body.order || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }).select().single()
    if (error) throw error
    return NextResponse.json({ success: true, data: transport })
  } catch (error) {
    console.error('Error creating transport:', error)
    return NextResponse.json({ success: false, error: 'Erro ao criar transporte' }, { status: 500 })
  }
}
