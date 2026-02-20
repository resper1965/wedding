import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { GiftStatus } from '@prisma/client'

// GET - Get single gift
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const gift = await db.gift.findUnique({
      where: { id },
      include: {
        wedding: {
          select: {
            partner1Name: true,
            partner2Name: true
          }
        }
      }
    })

    if (!gift) {
      return NextResponse.json({ success: false, error: 'Presente não encontrado' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: gift })
  } catch (error) {
    console.error('Error fetching gift:', error)
    return NextResponse.json({ success: false, error: 'Erro ao carregar presente' }, { status: 500 })
  }
}

// PUT - Update gift (admin)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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
      category,
      status 
    } = body

    const existingGift = await db.gift.findUnique({ where: { id } })
    if (!existingGift) {
      return NextResponse.json({ success: false, error: 'Presente não encontrado' }, { status: 404 })
    }

    const gift = await db.gift.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description: description || null }),
        ...(imageUrl !== undefined && { imageUrl: imageUrl || null }),
        ...(price !== undefined && { price: price ? parseFloat(price) : null }),
        ...(currency !== undefined && { currency }),
        ...(externalUrl !== undefined && { externalUrl: externalUrl || null }),
        ...(store !== undefined && { store: store || null }),
        ...(priority !== undefined && { priority: parseInt(priority) || 0 }),
        ...(category !== undefined && { category: category || null }),
        ...(status !== undefined && { status: status as GiftStatus })
      }
    })

    return NextResponse.json({ success: true, data: gift })
  } catch (error) {
    console.error('Error updating gift:', error)
    return NextResponse.json({ success: false, error: 'Erro ao atualizar presente' }, { status: 500 })
  }
}

// DELETE - Delete gift (admin)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const existingGift = await db.gift.findUnique({ where: { id } })
    if (!existingGift) {
      return NextResponse.json({ success: false, error: 'Presente não encontrado' }, { status: 404 })
    }

    await db.gift.delete({ where: { id } })

    return NextResponse.json({ success: true, message: 'Presente removido com sucesso' })
  } catch (error) {
    console.error('Error deleting gift:', error)
    return NextResponse.json({ success: false, error: 'Erro ao remover presente' }, { status: 500 })
  }
}
