export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const tenantId = request.headers.get('x-tenant-id')
    if (!tenantId) return NextResponse.json({ success: false, error: 'ID do casamento não fornecido' }, { status: 400 })

    const { data: wedding } = await db.from('Wedding').select('id').eq('id', tenantId).maybeSingle()
    if (!wedding) return NextResponse.json({ success: false, error: 'Casamento não encontrado' }, { status: 404 })

    const { data: templates, error } = await db.from('MessageTemplate').select('*').eq('weddingId', wedding.id).order('createdAt')
    if (error) throw error
    return NextResponse.json({ success: true, data: templates })
  } catch (error) {
    console.error('Error fetching templates:', error)
    return NextResponse.json({ success: false, error: 'Erro ao buscar templates' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, type, subject, content, variables, thumbnail } = body
    if (!name || !content) return NextResponse.json({ success: false, error: 'Nome e conteúdo são obrigatórios' }, { status: 400 })

    const tenantId = request.headers.get('x-tenant-id')
    if (!tenantId) return NextResponse.json({ success: false, error: 'ID do casamento não fornecido' }, { status: 400 })

    const { data: wedding } = await db.from('Wedding').select('id').eq('id', tenantId).maybeSingle()
    if (!wedding) return NextResponse.json({ success: false, error: 'Casamento não encontrado' }, { status: 404 })

    const { data: template, error } = await db.from('MessageTemplate').insert({
      id: crypto.randomUUID(),
      weddingId: wedding.id,
      name,
      type: type || 'email',
      subject: subject || null,
      content,
      variables: variables || null,
      thumbnail: thumbnail || null,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }).select().single()

    if (error) throw error
    return NextResponse.json({ success: true, data: template })
  } catch (error) {
    console.error('Error creating template:', error)
    return NextResponse.json({ success: false, error: 'Erro ao criar template' }, { status: 500 })
  }
}
