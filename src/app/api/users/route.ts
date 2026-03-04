export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { verifySupabaseToken } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const auth = await verifySupabaseToken(request)
    if (!auth.authorized) return auth.response

    // Only admins can list users
    if (auth.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Acesso negado' }, { status: 403 })
    }

    const { data: users, error } = await db
      .from('Profile')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ success: true, data: users })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ success: false, error: 'Erro ao carregar usuários' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = await verifySupabaseToken(request)
    if (!auth.authorized) return auth.response

    // Only admins can update user profiles
    if (auth.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Acesso negado' }, { status: 403 })
    }

    const body = await request.json()
    const { id, role, is_approved } = body

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID do usuário é obrigatório' }, { status: 400 })
    }

    const { data: user, error } = await db
      .from('Profile')
      .update({
        role,
        is_approved,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, data: user })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json({ success: false, error: 'Erro ao atualizar usuário' }, { status: 500 })
  }
}
