import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Single guest
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const guest = await db.guest.findUnique({
      where: { id },
      include: {
        group: true,
        rsvps: { include: { event: true } }
      }
    })

    if (!guest) {
      return NextResponse.json({ success: false, error: 'Convidado não encontrado' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: guest })
  } catch (error) {
    console.error('Error fetching guest:', error)
    return NextResponse.json({ success: false, error: 'Erro ao carregar convidado' }, { status: 500 })
  }
}

// PUT - Update guest
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    
    const { firstName, lastName, email, phone, category, relationship, dietaryRestrictions, specialNeeds, notes, groupId } = body

    const guest = await db.guest.update({
      where: { id },
      data: {
        firstName,
        lastName,
        email: email || null,
        phone: phone || null,
        category: category || null,
        relationship: relationship || null,
        dietaryRestrictions: dietaryRestrictions || null,
        specialNeeds: specialNeeds || null,
        notes: notes || null,
        groupId: groupId || null
      },
      include: {
        group: true,
        rsvps: { include: { event: true } }
      }
    })

    return NextResponse.json({ success: true, data: guest })
  } catch (error) {
    console.error('Error updating guest:', error)
    return NextResponse.json({ success: false, error: 'Erro ao atualizar convidado' }, { status: 500 })
  }
}

// DELETE - Remove guest
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const wedding = await db.wedding.findFirst()
    
    await db.guest.delete({ where: { id } })

    // Update wedding total
    if (wedding) {
      await db.wedding.update({
        where: { id: wedding.id },
        data: { totalInvited: { decrement: 1 } }
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting guest:', error)
    return NextResponse.json({ success: false, error: 'Erro ao excluir convidado' }, { status: 500 })
  }
}
