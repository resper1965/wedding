export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifySupabaseToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const auth = await verifySupabaseToken(request)

    // Se não estiver logado, não revelamos a lista de casamentos do banco
    if (!auth.authorized || !auth.uid) {
      return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 })
    }

    // Retorna todos os casamentos ONDE o dono é o usuário atual
    const { data: weddings, error } = await db.from('Wedding')
      .select('*')
      .eq('owner_id', auth.uid)

    if (error) throw error

    return NextResponse.json({ success: true, data: weddings || [] })
  } catch (error) {
    console.error('Error fetching weddings:', error)
    return NextResponse.json({ success: false, error: 'Erro ao carregar dados' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await verifySupabaseToken(request)
    if (!auth.authorized || !auth.uid) {
      return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 })
    }

    const userId = auth.uid

    // 1. GATING (Trava): Call the Supabase function to check quota
    const { data: canCreate, error: rlsError } = await db.rpc('can_create_wedding', {
      user_id: userId
    })

    if (rlsError) {
      console.error('Error checking quotas:', rlsError)
      return NextResponse.json({ success: false, error: 'Erro ao validar quotas de conta' }, { status: 500 })
    }

    if (!canCreate) {
      return NextResponse.json({
        success: false,
        error: 'Limite de Casamentos Atingido. Contate o Administrador para liberar sua conta.'
      }, { status: 403 })
    }

    // 2. Cria o novo Tenant
    const body = await request.json()
    const { partner1Name, partner2Name, weddingDate } = body

    const { data: created, error } = await db.from('Wedding').insert({
      id: crypto.randomUUID(),
      partner1Name: partner1Name || 'Noiva',
      partner2Name: partner2Name || 'Noivo',
      weddingDate: weddingDate ? new Date(weddingDate).toISOString() : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      venue: '',
      venueAddress: '',
      messageFooter: '',
      totalInvited: 0,
      totalConfirmed: 0,
      totalDeclined: 0,
      owner_id: userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }).select().single()

    if (error) throw error
    return NextResponse.json({ success: true, data: created })

  } catch (error) {
    console.error('Error creating wedding:', error)
    return NextResponse.json({ success: false, error: 'Erro interno ao criar casamento' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await verifySupabaseToken(request)
    if (!auth.authorized || !auth.uid) {
      return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 })
    }

    const tenantId = request.headers.get('x-tenant-id');
    if (!tenantId) {
      return NextResponse.json({ success: false, error: 'ID do casamento não fornecido' }, { status: 400 })
    }

    const body = await request.json()
    const { partner1Name, partner2Name, weddingDate, venue, venueAddress, replyByDate, messageFooter } = body

    const { data: updated, error } = await db.from('Wedding').update({
      partner1Name,
      partner2Name,
      weddingDate: new Date(weddingDate).toISOString(),
      venue: venue || null,
      venueAddress: venueAddress || null,
      replyByDate: replyByDate ? new Date(replyByDate).toISOString() : null,
      messageFooter: messageFooter || null,
      updatedAt: new Date().toISOString(),
    })
      .eq('id', tenantId)
      .eq('owner_id', auth.uid) // Segurança extra: só edita se for dono
      .select().single()

    if (error) throw error
    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    console.error('Error updating wedding:', error)
    return NextResponse.json({ success: false, error: 'Erro ao salvar dados' }, { status: 500 })
  }
}
