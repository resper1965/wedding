import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Get wedding settings
export async function GET() {
  try {
    let wedding = await db.wedding.findFirst()
    
    if (!wedding) {
      // Create default wedding if none exists
      wedding = await db.wedding.create({
        data: {
          partner1Name: 'Louise',
          partner2Name: 'Nicolas',
          weddingDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
          venue: '',
          venueAddress: '',
          messageFooter: ''
        }
      })
    }

    return NextResponse.json({ success: true, data: wedding })
  } catch (error) {
    console.error('Error fetching wedding:', error)
    return NextResponse.json({ success: false, error: 'Erro ao carregar dados' }, { status: 500 })
  }
}

// PUT - Update wedding settings
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      partner1Name, 
      partner2Name, 
      weddingDate, 
      venue, 
      venueAddress,
      replyByDate,
      messageFooter 
    } = body

    const wedding = await db.wedding.findFirst()
    
    if (!wedding) {
      return NextResponse.json({ success: false, error: 'Casamento não encontrado' }, { status: 404 })
    }

    const updated = await db.wedding.update({
      where: { id: wedding.id },
      data: {
        partner1Name,
        partner2Name,
        weddingDate: new Date(weddingDate),
        venue: venue || null,
        venueAddress: venueAddress || null,
        replyByDate: replyByDate ? new Date(replyByDate) : null,
        messageFooter: messageFooter || null
      }
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    console.error('Error updating wedding:', error)
    return NextResponse.json({ success: false, error: 'Erro ao salvar dados' }, { status: 500 })
  }
}
