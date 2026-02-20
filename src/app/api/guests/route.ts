import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { InviteStatus } from '@prisma/client'

// GET - List all guests
export async function GET(request: NextRequest) {
  try {
    const wedding = await db.wedding.findFirst()
    if (!wedding) {
      return NextResponse.json({ success: false, error: 'Nenhum casamento encontrado' }, { status: 404 })
    }

    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const category = searchParams.get('category')
    const groupId = searchParams.get('groupId')
    const search = searchParams.get('search')

    const guests = await db.guest.findMany({
      where: {
        weddingId: wedding.id,
        ...(status && { inviteStatus: status as InviteStatus }),
        ...(category && { category }),
        ...(groupId && { groupId }),
        ...(search && {
          OR: [
            { firstName: { contains: search } },
            { lastName: { contains: search } },
            { email: { contains: search } }
          ]
        })
      },
      include: {
        group: { select: { id: true, name: true } },
        rsvps: {
          include: { event: { select: { id: true, name: true } } }
        }
      },
      orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }]
    })

    return NextResponse.json({ success: true, data: guests })
  } catch (error) {
    console.error('Error fetching guests:', error)
    return NextResponse.json({ success: false, error: 'Erro ao carregar convidados' }, { status: 500 })
  }
}

// POST - Create new guest
export async function POST(request: NextRequest) {
  try {
    const wedding = await db.wedding.findFirst()
    if (!wedding) {
      return NextResponse.json({ success: false, error: 'Nenhum casamento encontrado' }, { status: 404 })
    }

    const body = await request.json()
    const { firstName, lastName, email, phone, category, relationship, dietaryRestrictions, specialNeeds, notes, groupId } = body

    // Create guest with RSVPs for all events
    const events = await db.event.findMany({ where: { weddingId: wedding.id } })
    
    const guest = await db.guest.create({
      data: {
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
        rsvps: {
          create: events.map(event => ({
            eventId: event.id,
            status: 'pending'
          }))
        }
      },
      include: {
        group: true,
        rsvps: { include: { event: true } }
      }
    })

    // Update wedding total
    await db.wedding.update({
      where: { id: wedding.id },
      data: { totalInvited: { increment: 1 } }
    })

    return NextResponse.json({ success: true, data: guest })
  } catch (error) {
    console.error('Error creating guest:', error)
    return NextResponse.json({ success: false, error: 'Erro ao criar convidado' }, { status: 500 })
  }
}
