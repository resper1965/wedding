export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
    try {
        const tenantId = request.headers.get('x-tenant-id')
        if (!tenantId) {
            return NextResponse.json({ success: false, error: 'ID do casamento não fornecido' }, { status: 400 })
        }

        // Busca apenas informações públicas não sensíveis
        const { data: wedding, error } = await db.from('Wedding')
            .select('id, partner1Name, partner2Name, weddingDate, venue, venueAddress, messageFooter')
            .eq('id', tenantId)
            .single()

        if (error) {
            console.error('Error fetching public wedding details:', error)
            return NextResponse.json({ success: false, error: 'Dados do casamento não encontrados' }, { status: 404 })
        }

        return NextResponse.json({ success: true, data: wedding })
    } catch (error) {
        console.error('Error fetching public wedding:', error)
        return NextResponse.json({ success: false, error: 'Erro ao carregar dados' }, { status: 500 })
    }
}
