import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { data: wedding } = await db.from('Wedding').select('id').limit(1).maybeSingle()
    if (!wedding) return NextResponse.json({ success: false, error: 'Nenhum casamento encontrado' }, { status: 404 })

    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const category = searchParams.get('category')
    const groupId = searchParams.get('groupId')
    const search = searchParams.get('search')

    let query = db.from('Guest')
      .select('*, group:GuestGroup(id, name), rsvps:Rsvp(*, event:Event(id, name))')
      .eq('weddingId', wedding.id)

    if (status) query = query.eq('inviteStatus', status)
    if (category) query = query.eq('category', category)
    if (groupId) query = query.eq('groupId', groupId)
    if (search) query = query.or(`firstName.ilike.%${search}%,lastName.ilike.%${search}%,email.ilike.%${search}%`)

    const { data: guests, error } = await query.order('firstName').order('lastName')
    if (error) throw error

    return NextResponse.json({ success: true, data: guests })
  } catch (error) {
    console.error('Error fetching guests:', error)
    return NextResponse.json({ success: false, error: 'Erro ao carregar convidados' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { data: wedding } = await db.from('Wedding').select('id').limit(1).maybeSingle()
    if (!wedding) return NextResponse.json({ success: false, error: 'Nenhum casamento encontrado' }, { status: 404 })

    const body = await request.json()
    const { firstName, lastName, email, phone, category, relationship, dietaryRestrictions, specialNeeds, notes, groupId } = body

    const guestId = crypto.randomUUID()
    const { data: guest, error: guestError } = await db.from('Guest').insert({
      id: guestId,
      weddingId: wedding.id,
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
      inviteStatus: 'pending',
      rsvpToken: crypto.randomUUID(),
      isGroupLeader: false,
      thankYouSent: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }).select().single()

    if (guestError) throw guestError

    const { data: events } = await db.from('Event').select('id').eq('weddingId', wedding.id)
    if (events && events.length > 0) {
      await db.from('Rsvp').insert(
        events.map(ev => ({
          id: crypto.randomUUID(),
          guestId,
          eventId: ev.id,
          status: 'pending',
          plusOne: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }))
      )
    }

    const { data: guestWithRelations } = await db.from('Guest')
      .select('*, group:GuestGroup(*), rsvps:Rsvp(*, event:Event(*))')
      .eq('id', guestId).single()

    return NextResponse.json({ success: true, data: guestWithRelations })
  } catch (error) {
    console.error('Error creating guest:', error)
    return NextResponse.json({ success: false, error: 'Erro ao criar convidado' }, { status: 500 })
  }
}
