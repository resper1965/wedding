import { NextRequest, NextResponse } from 'next/server'
import { verifySupabaseToken } from '@/lib/auth'
import { db } from '@/lib/db'

// Helper to verify if the requesting user is a super admin
async function isSuperAdmin(userId: string) {
    const { data } = await db.from('Profile').select('is_super_admin').eq('id', userId).maybeSingle()
    return data?.is_super_admin === true
}

export async function POST(request: NextRequest) {
    try {
        const auth = await verifySupabaseToken(request)
        if (!auth.authorized || !auth.uid) {
            return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 })
        }

        const hasAccess = await isSuperAdmin(auth.uid)
        if (!hasAccess) {
            return NextResponse.json({ success: false, error: 'Acesso negado: Privilégios insuficientes.' }, { status: 403 })
        }

        // Logic to purge "Novo & Evento" mock weddings
        // 1. Find them first
        const { data: mockWeddings, error: findError } = await db.from('Wedding')
            .select('id')
            .eq('partner1Name', 'Novo')
            .eq('partner2Name', 'Evento')

        if (findError) throw findError

        const idsToDelete = (mockWeddings || []).map(w => w.id)

        if (idsToDelete.length === 0) {
            return NextResponse.json({
                success: true,
                message: 'Nenhum dado de teste encontrado para limpeza.',
                count: 0
            })
        }

        // 2. Delete them
        // Supabase/Postgres cascading should handle the rest (Guests, Events, etc.)
        const { error: deleteError } = await db.from('Wedding')
            .delete()
            .in('id', idsToDelete)

        if (deleteError) throw deleteError

        return NextResponse.json({
            success: true,
            message: `${idsToDelete.length} casamentos de teste removidos com sucesso.`,
            count: idsToDelete.length
        })
    } catch (error: any) {
        console.error('Error in purge test data API:', error)
        return NextResponse.json({
            success: false,
            error: error.message || 'Erro ao processar limpeza de dados.'
        }, { status: 500 })
    }
}
