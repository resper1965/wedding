import { NextRequest, NextResponse } from 'next/server'
import { verifySupabaseToken } from '@/lib/auth'
import { verifyTenantAccess } from '@/lib/auth-tenant'
import { generateQRCode } from '@/services/concierge/qr-service'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
    try {
        const tenantId = request.headers.get('x-tenant-id')
        const auth = await verifySupabaseToken(request)
        const access = await verifyTenantAccess(tenantId, auth.uid, auth.email)
        if (!access.hasAccess) return access.response!

        const body = await request.json()
        const { invitationId } = body

        if (!invitationId) {
            return NextResponse.json({ error: 'ID do convite é obrigatório' }, { status: 400 })
        }

        // Get invitation and guests
        const { data: invitation } = await db.from('Invitation')
            .select('*, guests:Guest(id)')
            .eq('id', invitationId)
            .eq('weddingId', access.weddingId)
            .maybeSingle()

        if (!invitation) {
            return NextResponse.json({ error: 'Convite não encontrado' }, { status: 404 })
        }

        const guestIds = (invitation.guests || []).map((g: any) => g.id)
        const familyName = invitation.familyName || 'Convidado'

        const result = await generateQRCode(
            invitationId,
            guestIds,
            familyName
        )

        if (!result.success || !result.token) {
            throw new Error(result.error || 'Erro ao gerar QR Code')
        }

        // Update database
        const { error: updateError } = await db.from('Invitation')
            .update({
                qrToken: result.token,
                qrTokenExpires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                updatedAt: new Date().toISOString()
            })
            .eq('id', invitationId)

        if (updateError) throw updateError

        return NextResponse.json({
            success: true,
            qrToken: result.token,
            qrDataUrl: result.qrDataUrl
        })

    } catch (error) {
        console.error('QR Generation error:', error)
        return NextResponse.json({ error: 'Erro ao gerar QR Code' }, { status: 500 })
    }
}
