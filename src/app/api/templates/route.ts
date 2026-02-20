import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/templates - List all templates
export async function GET() {
  try {
    const wedding = await db.wedding.findFirst()
    
    if (!wedding) {
      return NextResponse.json({ success: false, error: 'Casamento não encontrado' }, { status: 404 })
    }

    const templates = await db.messageTemplate.findMany({
      where: { weddingId: wedding.id },
      orderBy: { createdAt: 'asc' }
    })

    return NextResponse.json({ 
      success: true, 
      data: templates 
    })
  } catch (error) {
    console.error('Error fetching templates:', error)
    return NextResponse.json({ success: false, error: 'Erro ao buscar templates' }, { status: 500 })
  }
}

// POST /api/templates - Create new template
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, type, subject, content, variables, thumbnail } = body

    if (!name || !content) {
      return NextResponse.json({ success: false, error: 'Nome e conteúdo são obrigatórios' }, { status: 400 })
    }

    const wedding = await db.wedding.findFirst()
    
    if (!wedding) {
      return NextResponse.json({ success: false, error: 'Casamento não encontrado' }, { status: 404 })
    }

    const template = await db.messageTemplate.create({
      data: {
        weddingId: wedding.id,
        name,
        type: type || 'email',
        subject,
        content,
        variables,
        thumbnail,
        isActive: true
      }
    })

    return NextResponse.json({ success: true, data: template })
  } catch (error) {
    console.error('Error creating template:', error)
    return NextResponse.json({ success: false, error: 'Erro ao criar template' }, { status: 500 })
  }
}
