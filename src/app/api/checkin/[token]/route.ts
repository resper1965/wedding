import { NextRequest, NextResponse } from 'next/server'
import { validateQRCode } from '@/services/concierge/qr-service'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params

    if (!token) {
      return NextResponse.json({ valid: false, error: 'Token não fornecido' }, { status: 400 })
    }

    // Validate token using qr-service
    const validation = validateQRCode(token)

    if (!validation.valid || !validation.payload) {
      return NextResponse.json({
        valid: false,
        error: validation.error || 'Token inválido ou expirado'
      }, { status: 401 })
    }

    const payload = validation.payload

    // Fetch invitation and guests from DB to get the most up-to-date status
    const { data: invitation, error } = await db.from('Invitation')
      .select('*, guests:Guest(*)')
      .eq('id', payload.invitationId)
      .maybeSingle()

    if (error || !invitation) {
      return NextResponse.json({
        valid: false,
        error: 'Convite não encontrado no banco de dados'
      }, { status: 404 })
    }

    // Return the scan result in the format expected by QRScanner
    return NextResponse.json({
      valid: true,
      alreadyCheckedIn: invitation.checkedIn,
      checkedInAt: invitation.checkedInAt,
      data: {
        invitationId: invitation.id,
        familyName: invitation.familyName || payload.familyName,
        tableNumber: invitation.tableNumber || payload.tableNumber,
        guests: (invitation.guests || []).map((g: any) => ({
          id: g.id,
          firstName: g.firstName,
          lastName: g.lastName,
          fullName: `${g.firstName} ${g.lastName}`,
          dietaryRestrictions: g.dietaryRestrictions,
          specialNeeds: g.specialNeeds
        }))
      }
    })

  } catch (error) {
    console.error('QR Token validation error:', error)
    return NextResponse.json({
      valid: false,
      error: 'Erro interno ao validar QR Code'
    }, { status: 500 })
  }
}
