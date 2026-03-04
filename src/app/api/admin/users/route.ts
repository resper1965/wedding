import { NextRequest, NextResponse } from 'next/server'
import { verifySupabaseToken } from '@/lib/auth'
import { db } from '@/lib/db'

// Helper to verify if the requesting user is a super admin
async function isSuperAdmin(userId: string) {
    const { data } = await db.from('Profile').select('is_super_admin').eq('id', userId).maybeSingle()
    return data?.is_super_admin === true
}

export async function GET(request: NextRequest) {
    try {
        const auth = await verifySupabaseToken(request)
        if (!auth.authorized || !auth.uid) {
            return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 })
        }

        const hasAccess = await isSuperAdmin(auth.uid)
        if (!hasAccess) {
            return NextResponse.json({ success: false, error: 'Acesso negado: Privilégios insuficientes.' }, { status: 403 })
        }

        // List all users and their wedding counts
        const { data: profiles, error } = await db.from('Profile')
            .select(`
        id, 
        is_super_admin, 
        max_weddings, 
        created_at,
        email,
        Wedding!owner_id ( id, partner1Name, partner2Name )
      `)
            .order('created_at', { ascending: false })

        if (error) {
            // If email field does not exist on Profile, let's fallback:
            console.error("Profile fetch error:", error)
            const { data: basicProfiles, error: basicError } = await db.from('Profile')
                .select(`
            id, 
            is_super_admin, 
            max_weddings, 
            created_at,
            Wedding!owner_id ( id, partner1Name, partner2Name )
            `)
                .order('created_at', { ascending: false })

            if (basicError) throw basicError
            return NextResponse.json({ success: true, data: basicProfiles })
        }

        return NextResponse.json({ success: true, data: profiles })
    } catch (error) {
        console.error('Error fetching admin users:', error)
        return NextResponse.json({ success: false, error: 'Erro ao buscar usuários do sistema.' }, { status: 500 })
    }
}

export async function PUT(request: NextRequest) {
    try {
        const auth = await verifySupabaseToken(request)
        if (!auth.authorized || !auth.uid) {
            return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 })
        }

        const hasAccess = await isSuperAdmin(auth.uid)
        if (!hasAccess) {
            return NextResponse.json({ success: false, error: 'Acesso negado: Privilégios insuficientes.' }, { status: 403 })
        }

        const body = await request.json()
        const { userId, max_weddings, is_super_admin } = body

        if (!userId) {
            return NextResponse.json({ success: false, error: 'User ID não fornecido' }, { status: 400 })
        }

        // Update the profile quota or admin status
        const updateData: any = {}
        if (max_weddings !== undefined) updateData.max_weddings = max_weddings
        if (is_super_admin !== undefined) updateData.is_super_admin = is_super_admin

        const { data, error } = await db.from('Profile')
            .update(updateData)
            .eq('id', userId)
            .select()
            .maybeSingle()

        if (error) throw error
        return NextResponse.json({ success: true, data })
    } catch (error) {
        console.error('Error updating profile:', error)
        return NextResponse.json({ success: false, error: 'Erro ao atualizar dados do usuário.' }, { status: 500 })
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const auth = await verifySupabaseToken(request)
        if (!auth.authorized || !auth.uid) {
            return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 })
        }

        const hasAccess = await isSuperAdmin(auth.uid)
        if (!hasAccess) {
            return NextResponse.json({ success: false, error: 'Acesso negado: Privilégios insuficientes.' }, { status: 403 })
        }

        const { searchParams } = new URL(request.url)
        const targetUserId = searchParams.get('userId')

        if (!targetUserId) {
            return NextResponse.json({ success: false, error: 'User ID não fornecido' }, { status: 400 })
        }

        // To properly delete an entire user, we delete their profile. 
        // Supabase cascading will handle deleting the Wedding rows, Guests, etc.
        const { error: profileError } = await db.from('Profile').delete().eq('id', targetUserId)

        if (profileError) throw profileError

        return NextResponse.json({ success: true, message: 'Usuário e dados deletados com sucesso.' })
    } catch (error) {
        console.error('Error deleting user account:', error)
        return NextResponse.json({ success: false, error: 'Erro ao deletar usuário do sistema.' }, { status: 500 })
    }
}
