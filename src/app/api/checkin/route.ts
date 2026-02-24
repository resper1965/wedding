import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const token = searchParams.get('token')

    if (token) {
      const { data: invitation } = await db.from('Invitation')
        .select('*, guests:Guest(id, firstName, lastName, dietaryRestrictions, specialNeeds)')
        .eq('qrToken', token).maybeSingle()

      if (!invitation) return NextResponse.json({ error: 'Token inválido ou expirado' }, { status: 404 })

      return NextResponse.json({
        type: 'invitation',
        data: {
          id: invitation.id,
          familyName: invitation.familyName,
          checkedIn: invitation.checkedIn,
          checkedInAt: invitation.checkedInAt,
          guests: (invitation.guests || []).map((g: any) => ({ ...g, fullName: `${g.firstName} ${g.lastName}` }))
        }
      })
    }

    if (!query || query.length < 2) {
      return NextResponse.json({ error: 'Digite pelo menos 2 caracteres para buscar' }, { status: 400 })
    }

    const [{ data: guests }, { data: invitations }] = await Promise.all([
      db.from('Guest')
        .select('*, invitation:Invitation(id, familyName, checkedIn, checkedInAt, qrToken)')
        .or(`firstName.ilike.%${query}%,lastName.ilike.%${query}%`)
        .limit(20),
      db.from('Invitation')
        .select('*, guests:Guest(id, firstName, lastName, dietaryRestrictions, specialNeeds)')
        .ilike('familyName', `%${query}%`)
        .limit(10),
    ])

    const guestResults = (guests || []).map((g: any) => ({
      type: 'guest', id: g.id, firstName: g.firstName, lastName: g.lastName,
      fullName: `${g.firstName} ${g.lastName}`,
      invitation: g.invitation ? { id: g.invitation.id, familyName: g.invitation.familyName, checkedIn: g.invitation.checkedIn, checkedInAt: g.invitation.checkedInAt } : null,
    }))

    const invitationResults = (invitations || []).map((inv: any) => ({
      type: 'invitation', id: inv.id, familyName: inv.familyName,
      checkedIn: inv.checkedIn, checkedInAt: inv.checkedInAt, qrToken: inv.qrToken,
      guests: (inv.guests || []).map((g: any) => ({ id: g.id, firstName: g.firstName, lastName: g.lastName, fullName: `${g.firstName} ${g.lastName}`, dietaryRestrictions: g.dietaryRestrictions, specialNeeds: g.specialNeeds })),
    }))

    return NextResponse.json({ query, guests: guestResults, invitations: invitationResults, total: guestResults.length + invitationResults.length })
  } catch (error) {
    console.error('Check-in search error:', error)
    return NextResponse.json({ error: 'Erro ao buscar convidados' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { invitationId, staffId } = body
    if (!invitationId) return NextResponse.json({ error: 'ID do convite é obrigatório' }, { status: 400 })

    const { data: invitation } = await db.from('Invitation')
      .select('*, guests:Guest(id, firstName, lastName)')
      .eq('id', invitationId).maybeSingle()

    if (!invitation) return NextResponse.json({ error: 'Convite não encontrado' }, { status: 404 })

    if (invitation.checkedIn) {
      return NextResponse.json({ success: true, alreadyCheckedIn: true, message: `${invitation.familyName || 'Convidado'} já fez check-in`, checkedInAt: invitation.checkedInAt, guests: invitation.guests })
    }

    const now = new Date().toISOString()
    await db.from('Invitation').update({ checkedIn: true, checkedInAt: now, updatedAt: now }).eq('id', invitationId)

    return NextResponse.json({
      success: true, alreadyCheckedIn: false, message: 'Check-in realizado com sucesso!',
      checkedInAt: now, familyName: invitation.familyName,
      guests: (invitation.guests || []).map((g: any) => ({ id: g.id, firstName: g.firstName, lastName: g.lastName, fullName: `${g.firstName} ${g.lastName}` })),
      staffId
    })
  } catch (error) {
    console.error('Check-in error:', error)
    return NextResponse.json({ error: 'Erro ao realizar check-in' }, { status: 500 })
  }
}
