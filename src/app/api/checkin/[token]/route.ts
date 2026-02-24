import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { validateQRCode, QRTokenPayload } from '@/services/concierge/qr-service'

export async function GET(request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params
    if (!token) return NextResponse.json({ error: 'Token não fornecido' }, { status: 400 })

    const validation = validateQRCode(token)
    if (!validation.valid) return NextResponse.json({ error: validation.error || 'Token inválido ou expirado' }, { status: 400 })

    const payload = validation.payload as QRTokenPayload

    const { data: invitation } = await db.from('Invitation')
      .select('*, guests:Guest(id, firstName, lastName, dietaryRestrictions, specialNeeds)')
      .eq('id', payload.invitationId).maybeSingle()

    if (!invitation) return NextResponse.json({ error: 'Convite não encontrado' }, { status: 404 })

    const { data: groupWithTable } = await db.from('Guest')
      .select('group:GuestGroup(table:Table(name))')
      .eq('invitationId', payload.invitationId)
      .not('groupId', 'is', null)
      .limit(1).maybeSingle()

    const tableName = (groupWithTable as any)?.group?.table?.name || payload.tableNumber

    return NextResponse.json({
      valid: true, alreadyCheckedIn: invitation.checkedIn, checkedInAt: invitation.checkedInAt,
      data: {
        invitationId: invitation.id,
        familyName: invitation.familyName || payload.familyName,
        tableNumber: tableName,
        guests: (invitation.guests || []).map((g: any) => ({ id: g.id, firstName: g.firstName, lastName: g.lastName, fullName: `${g.firstName} ${g.lastName}`, dietaryRestrictions: g.dietaryRestrictions, specialNeeds: g.specialNeeds }))
      }
    })
  } catch (error) {
    console.error('QR validation error:', error)
    return NextResponse.json({ error: 'Erro ao validar QR Code' }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params
    const body = await request.json().catch(() => ({}))
    const { staffId } = body
    if (!token) return NextResponse.json({ error: 'Token não fornecido' }, { status: 400 })

    const validation = validateQRCode(token)
    if (!validation.valid) return NextResponse.json({ error: validation.error || 'Token inválido ou expirado' }, { status: 400 })

    const payload = validation.payload as QRTokenPayload

    const { data: invitation } = await db.from('Invitation')
      .select('*, guests:Guest(id, firstName, lastName)')
      .eq('id', payload.invitationId).maybeSingle()

    if (!invitation) return NextResponse.json({ error: 'Convite não encontrado' }, { status: 404 })

    if (invitation.checkedIn) {
      return NextResponse.json({ success: true, alreadyCheckedIn: true, message: `${invitation.familyName || 'Convidado'} já fez check-in`, checkedInAt: invitation.checkedInAt, data: { invitationId: invitation.id, familyName: invitation.familyName || payload.familyName, guests: (invitation.guests || []).map((g: any) => ({ id: g.id, firstName: g.firstName, lastName: g.lastName, fullName: `${g.firstName} ${g.lastName}` })) } })
    }

    const now = new Date().toISOString()
    await db.from('Invitation').update({ checkedIn: true, checkedInAt: now, updatedAt: now }).eq('id', payload.invitationId)

    const { data: groupWithTable } = await db.from('Guest')
      .select('group:GuestGroup(table:Table(name))')
      .eq('invitationId', payload.invitationId).not('groupId', 'is', null).limit(1).maybeSingle()

    return NextResponse.json({
      success: true, alreadyCheckedIn: false, message: 'Check-in realizado com sucesso!', checkedInAt: now,
      data: {
        invitationId: invitation.id, familyName: invitation.familyName || payload.familyName,
        tableNumber: (groupWithTable as any)?.group?.table?.name || payload.tableNumber,
        guests: (invitation.guests || []).map((g: any) => ({ id: g.id, firstName: g.firstName, lastName: g.lastName, fullName: `${g.firstName} ${g.lastName}` }))
      }, staffId
    })
  } catch (error) {
    console.error('QR check-in error:', error)
    return NextResponse.json({ error: 'Erro ao realizar check-in' }, { status: 500 })
  }
}
