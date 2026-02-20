import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { GiftStatus } from '@prisma/client'

// POST - Reserve a gift
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, message } = body

    if (!name || name.trim().length < 2) {
      return NextResponse.json({ 
        success: false, 
        error: 'Por favor, informe seu nome' 
      }, { status: 400 })
    }

    const gift = await db.gift.findUnique({ where: { id } })
    
    if (!gift) {
      return NextResponse.json({ success: false, error: 'Presente não encontrado' }, { status: 404 })
    }

    if (gift.status !== 'available') {
      return NextResponse.json({ 
        success: false, 
        error: 'Este presente já foi reservado' 
      }, { status: 400 })
    }

    const updatedGift = await db.gift.update({
      where: { id },
      data: {
        status: GiftStatus.reserved,
        reservedByName: name.trim(),
        reservedMessage: message?.trim() || null,
        reservedAt: new Date()
      }
    })

    return NextResponse.json({ 
      success: true, 
      data: updatedGift,
      message: 'Presente reservado com sucesso!'
    })
  } catch (error) {
    console.error('Error reserving gift:', error)
    return NextResponse.json({ success: false, error: 'Erro ao reservar presente' }, { status: 500 })
  }
}

// DELETE - Cancel reservation
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const gift = await db.gift.findUnique({ where: { id } })
    
    if (!gift) {
      return NextResponse.json({ success: false, error: 'Presente não encontrado' }, { status: 404 })
    }

    if (gift.status !== 'reserved') {
      return NextResponse.json({ 
        success: false, 
        error: 'Este presente não está reservado' 
      }, { status: 400 })
    }

    const updatedGift = await db.gift.update({
      where: { id },
      data: {
        status: GiftStatus.available,
        reservedByName: null,
        reservedMessage: null,
        reservedAt: null,
        reservedBy: null
      }
    })

    return NextResponse.json({ 
      success: true, 
      data: updatedGift,
      message: 'Reserva cancelada com sucesso'
    })
  } catch (error) {
    console.error('Error canceling reservation:', error)
    return NextResponse.json({ success: false, error: 'Erro ao cancelar reserva' }, { status: 500 })
  }
}
