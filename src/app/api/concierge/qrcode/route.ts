export const dynamic = 'force-dynamic'
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

    const guestIds = (guests || []).map((g: any) => g.id)
    const qrData = await generateQRCode(
      invitationId,
      guestIds,
      invitation.familyName || '',
      tableName
    )

    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()

    await db.from('Invitation').update({
      qrToken: qrData.token,
      qrTokenExpires: expiresAt,
      updatedAt: new Date().toISOString(),
    }).eq('id', invitationId)

    return NextResponse.json({ success: true, data: { qrCode: qrData.qrDataUrl, token: qrData.token, expiresAt } })
  } catch (error) {
    console.error('QR code generation error:', error)
    return NextResponse.json({ error: 'Erro ao gerar QR Code' }, { status: 500 })
  }
}
