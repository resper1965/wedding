import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { db } from './db'

/**
 * Verifica Supabase JWT no header Authorization.
 * 
 * Para uso em API routes:
 * ```ts
 * const auth = await verifySupabaseToken(request)
 * if (!auth.authorized) return auth.response
 * // auth.uid, auth.email, auth.name, auth.role, auth.isApproved disponíveis
 * ```
 */

interface AuthResult {
  authorized: true
  uid: string
  email: string | null
  name: string | null
  role: string | null
  isApproved: boolean
}

interface AuthFailure {
  authorized: false
  uid: string | null
  email: string | null
  name: string | null
  role: string | null
  isApproved: boolean
  response: NextResponse
}

export async function verifySupabaseToken(
  request: NextRequest
): Promise<AuthResult | AuthFailure> {
  const authHeader = request.headers.get('authorization')

  if (!authHeader?.startsWith('Bearer ')) {
    return {
      authorized: false,
      uid: null,
      email: null,
      name: null,
      role: null,
      isApproved: false,
      response: NextResponse.json(
        { success: false, error: 'Não autorizado' },
        { status: 401 }
      ),
    }
  }

  const accessToken = authHeader.slice(7)

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => [],
          setAll: () => { },
        },
      }
    )

    const { data: { user }, error } = await supabase.auth.getUser(accessToken)

    if (error || !user) {
      return {
        authorized: false,
        uid: null,
        email: null,
        name: null,
        role: null,
        isApproved: false,
        response: NextResponse.json(
          { success: false, error: 'Token inválido' },
          { status: 401 }
        ),
      }
    }

    // Check profile for approval and role
    const { data: profile } = await db.from('Profile').select('role, is_approved, is_super_admin').eq('id', user.id).maybeSingle()

    // Super admins always have access, even if is_approved is not set
    const isSuperAdmin = profile?.is_super_admin === true

    if (!isSuperAdmin && (!profile || !profile.is_approved)) {
      return {
        authorized: false,
        uid: user.id,
        email: user.email ?? null,
        name: user.user_metadata?.full_name ?? user.user_metadata?.name ?? null,
        role: profile?.role ?? null,
        isApproved: false,
        response: NextResponse.json(
          { success: false, error: 'Usuário não aprovado ou sem acesso' },
          { status: 403 }
        ),
      }
    }

    return {
      authorized: true,
      uid: user.id,
      email: user.email ?? null,
      name: user.user_metadata?.full_name ?? user.user_metadata?.name ?? null,
      role: profile.role,
      isApproved: profile.is_approved,
    }
  } catch {
    return {
      authorized: false,
      uid: null,
      email: null,
      name: null,
      role: null,
      isApproved: false,
      response: NextResponse.json(
        { success: false, error: 'Erro de autenticação' },
        { status: 401 }
      ),
    }
  }
}

// Keep backward-compatible alias
export const verifyFirebaseToken = verifySupabaseToken
