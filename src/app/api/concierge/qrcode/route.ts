import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { generateQRCode } from '@/services/concierge/qr-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { invitationId } = body

    if (!invitationId) {
      return NextResponse.json({ error: 'invitationId é obrigatório' }, { status: 400 })
    }

    const { data: invitation } = await db.from('Invitation').select('*').eq('id', invitationId).maybeSingle()
    if (!invitation) return NextResponse.json({ error: 'Convite não encontrado' }, { status: 404 })

    const { data: guests } = await db.from('Guest').select('id, firstName, lastName').eq('invitationId', invitationId)

    const { data: groupWithTable } = await db.from('Guest')
      .select('group:GuestGroup(table:Table(name))')
      .eq('invitationId', invitationId).not('groupId', 'is', null).limit(1).maybeSingle()

    const tableName = (groupWithTable as any)?.group?.table?.name

    const qrData = await generateQRCode({
      invitationId,
      familyName: invitation.familyName || '',
      guestCount: (guests || []).length,
      tableNumber: tableName,
    })

    await db.from('Invitation').update({
      qrToken: qrData.token,
      qrTokenExpires: qrData.expiresAt,
      updatedAt: new Date().toISOString(),
    }).eq('id', invitationId)

    return NextResponse.json({ success: true, data: { qrCode: qrData.qrCode, token: qrData.token, expiresAt: qrData.expiresAt } })
  } catch (error) {
    console.error('QR code generation error:', error)
    return NextResponse.json({ error: 'Erro ao gerar QR Code' }, { status: 500 })
  }
}
