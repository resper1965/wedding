import { NextResponse } from 'next/server'
import { db } from './db'

export type TenantRole = 'owner' | 'couple' | 'none'

interface TenantAuthResult {
    hasAccess: boolean
    role: TenantRole
    weddingId?: string
    response?: NextResponse
}

/**
 * Verifica o acesso a um casamento específico baseado no tenantId e nos dados do usuário logado.
 * @param tenantId UUID referenciando o `id` do casamento
 * @param uid UUID do usuário logado vindo do `verifySupabaseToken`
 * @param email E-mail do usuário logado vindo do `verifySupabaseToken`
 * @returns { hasAccess: boolean, role: 'owner' | 'couple' | 'none' }
 */
export async function verifyTenantAccess(
    tenantId: string | null,
    uid: string | null,
    email: string | null
): Promise<TenantAuthResult> {
    if (!uid) {
        return {
            hasAccess: false,
            role: 'none',
            response: NextResponse.json(
                { success: false, error: 'Usuário não autenticado' },
                { status: 401 }
            )
        }
    }

    // Super Admin Bypass: Admin has access to EVERYTHING
    const { data: profile } = await db.from('Profile').select('is_super_admin').eq('id', uid).single()
    if (profile?.is_super_admin) {
        // If tenantId is provided and valid, return that. Otherwise, find first available.
        if (tenantId && tenantId.length > 20) {
            return { hasAccess: true, role: 'owner', weddingId: tenantId }
        }
    }

    let effectiveTenantId = tenantId;

    // Fallback: If tenantId is missing or invalid
    if (!effectiveTenantId || effectiveTenantId.length < 10) {
        const { data: firstWedding } = await db.from('Wedding')
            .select('id')
            .or(`owner_id.eq.${uid}${email ? `,couple_email.ilike.${email}` : ''}`)
            .limit(1)
            .maybeSingle()

        if (firstWedding) {
            effectiveTenantId = firstWedding.id;
        } else if (profile?.is_super_admin) {
            // Admin with no owned weddings still needs a wedding context for some APIs
            const { data: anyWedding } = await db.from('Wedding').select('id').limit(1).maybeSingle()
            if (anyWedding) effectiveTenantId = anyWedding.id;
        }

        if (!effectiveTenantId) {
            return {
                hasAccess: false,
                role: 'none',
                response: NextResponse.json(
                    { success: false, error: 'Nenhum casamento vinculado a esta conta.' },
                    { status: 404 }
                )
            }
        }
    }

    try {
        const { data: wedding, error } = await db.from('Wedding')
            .select('id, owner_id, couple_email')
            .eq('id', effectiveTenantId)
            .maybeSingle()

        if (error || !wedding) {
            return {
                hasAccess: false,
                role: 'none',
                response: NextResponse.json(
                    { success: false, error: 'Identificador do Casamento não encontrado' },
                    { status: 404 }
                )
            }
        }

        // Acesso de Assessor (Dono)
        if (wedding.owner_id === uid) {
            return { hasAccess: true, role: 'owner', weddingId: wedding.id }
        }

        // Acesso Interativo do Casal (E-mail registrado)
        if (email && wedding.couple_email && wedding.couple_email.toLowerCase() === email.toLowerCase()) {
            return { hasAccess: true, role: 'couple', weddingId: wedding.id }
        }

        return {
            hasAccess: false,
            role: 'none',
            response: NextResponse.json(
                { success: false, error: 'Acesso Negado. Você não é Proprietário nem Casal deste evento.' },
                { status: 403 }
            )
        }
    } catch (error) {
        console.error('Error verifying tenant access:', error)
        return {
            hasAccess: false,
            role: 'none',
            response: NextResponse.json(
                { success: false, error: 'Erro de conexão na validação de acesso.' },
                { status: 500 }
            )
        }
    }
}
