import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

/**
 * Verifica Supabase JWT no header Authorization.
 * 
 * Para uso em API routes:
 * ```ts
 * const auth = await verifySupabaseToken(request)
 * if (!auth.authorized) return auth.response
 * // auth.uid, auth.email, auth.name disponíveis
 * ```
 */

interface AuthResult {
  authorized: true
  uid: string
  email: string | null
  name: string | null
}

interface AuthFailure {
  authorized: false
  uid: null
  email: null
  name: null
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
          setAll: () => {},
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
        response: NextResponse.json(
          { success: false, error: 'Token inválido' },
          { status: 401 }
        ),
      }
    }

    return {
      authorized: true,
      uid: user.id,
      email: user.email ?? null,
      name: user.user_metadata?.full_name ?? user.user_metadata?.name ?? null,
    }
  } catch {
    return {
      authorized: false,
      uid: null,
      email: null,
      name: null,
      response: NextResponse.json(
        { success: false, error: 'Erro de autenticação' },
        { status: 401 }
      ),
    }
  }
}

// Keep backward-compatible alias
export const verifyFirebaseToken = verifySupabaseToken
