import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Single accommodation
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const accommodation = await db.accommodation.findUnique({
      where: { id }
    })

    if (!accommodation) {
      return NextResponse.json({ success: false, error: 'Hospedagem não encontrada' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: accommodation })
  } catch (error) {
    console.error('Error fetching accommodation:', error)
    return NextResponse.json({ success: false, error: 'Erro ao carregar hospedagem' }, { status: 500 })
  }
}

// PUT - Update accommodation
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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

    const accommodation = await db.accommodation.update({
      where: { id },
      data: {
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
    console.error('Error updating accommodation:', error)
    return NextResponse.json({ success: false, error: 'Erro ao atualizar hospedagem' }, { status: 500 })
  }
}

// DELETE - Remove accommodation
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await db.accommodation.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting accommodation:', error)
    return NextResponse.json({ success: false, error: 'Erro ao excluir hospedagem' }, { status: 500 })
  }
}
