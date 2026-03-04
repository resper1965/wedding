export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { data: guest, error } = await db.from('Guest')
      .select('*, group:GuestGroup(*), rsvps:Rsvp(*, event:Event(*))')
      .eq('id', id).maybeSingle()
    if (error) throw error
    if (!guest) return NextResponse.json({ success: false, error: 'Convidado não encontrado' }, { status: 404 })
    return NextResponse.json({ success: true, data: guest })
  } catch (error) {
    console.error('Error fetching guest:', error)
    return NextResponse.json({ success: false, error: 'Erro ao carregar convidado' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { firstName, lastName, email, phone, category, relationship, dietaryRestrictions, specialNeeds, notes, groupId } = body

    const { error } = await db.from('Guest').update({
      firstName,
      lastName,
      email: email || null,
      phone: phone || null,
      category: category || null,
      relationship: relationship || null,
      dietaryRestrictions: dietaryRestrictions || null,
      specialNeeds: specialNeeds || null,
      notes: notes || null,
      groupId: groupId || null,
      updatedAt: new Date().toISOString(),
    }).eq('id', id)
    if (error) throw error

    const { data: guest } = await db.from('Guest')
      .select('*, group:GuestGroup(*), rsvps:Rsvp(*, event:Event(*))')
      .eq('id', id).single()

    return NextResponse.json({ success: true, data: guest })
  } catch (error) {
    console.error('Error updating guest:', error)
    return NextResponse.json({ success: false, error: 'Erro ao atualizar convidado' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { error } = await db.from('Guest').delete().eq('id', id)
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting guest:', error)
    return NextResponse.json({ success: false, error: 'Erro ao excluir convidado' }, { status: 500 })
  }
}
