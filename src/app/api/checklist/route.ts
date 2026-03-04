export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const tenantId = request.headers.get('x-tenant-id')
    if (!tenantId) return NextResponse.json({ success: false, error: 'ID do casamento não fornecido' }, { status: 400 })

    const { data: wedding } = await db.from('Wedding').select('id').eq('id', tenantId).maybeSingle()
    if (!wedding) return NextResponse.json({ success: false, error: 'No wedding' }, { status: 404 })

    const { data: items, error } = await db.from('ChecklistItem').select('*').eq('weddingId', wedding.id).order('category').order('dueDate', { nullsFirst: false }).order('createdAt')
    if (error) throw error
    return NextResponse.json({ success: true, data: items })
  } catch (error) {
    console.error('Checklist GET error:', error)
    return NextResponse.json({ success: false, error: 'Erro ao buscar checklist' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const tenantId = request.headers.get('x-tenant-id')
    if (!tenantId) return NextResponse.json({ success: false, error: 'ID do casamento não fornecido' }, { status: 400 })

    const { data: wedding } = await db.from('Wedding').select('id').eq('id', tenantId).maybeSingle()
    if (!wedding) return NextResponse.json({ success: false, error: 'No wedding' }, { status: 404 })

    const body = await request.json()
    const { data: item, error } = await db.from('ChecklistItem').insert({
      id: crypto.randomUUID(),
      weddingId: wedding.id,
      title: body.title,
      category: body.category,
      dueDate: body.dueDate ? new Date(body.dueDate).toISOString() : null,
      priority: body.priority || 'normal',
      notes: body.notes || null,
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }).select().single()
    if (error) throw error
    return NextResponse.json({ success: true, data: item })
  } catch (error) {
    console.error('Checklist POST error:', error)
    return NextResponse.json({ success: false, error: 'Erro ao criar item' }, { status: 500 })
  }
}
