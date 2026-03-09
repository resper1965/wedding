import { NextRequest, NextResponse } from 'next/server'
import { verifySupabaseToken } from '@/lib/auth'
import { db } from '@/lib/db'
import { runDemoSeed } from '@/lib/seed-utils'

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

        const stats = await runDemoSeed(db)

        return NextResponse.json({
            success: true,
            message: 'Seed de demonstração concluído com sucesso!',
            data: stats
        })
    } catch (error: any) {
        console.error('Error in demo seed API:', error)
        return NextResponse.json({
            success: false,
            error: error.message || 'Erro ao processar seed de demonstração.'
        }, { status: 500 })
    }
}
