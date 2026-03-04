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
    if (!tenantId || !uid) {
        return {
            hasAccess: false,
            role: 'none',
            response: NextResponse.json(
                { success: false, error: 'Parâmetros de identificação (tenantId/uid) inválidos' },
                { status: 400 }
            )
        }
    }

    try {
        const { data: wedding, error } = await db.from('Wedding')
            .select('id, owner_id, couple_email')
            .eq('id', tenantId)
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
