export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifySupabaseToken } from '@/lib/auth'
import { verifyTenantAccess } from '@/lib/auth-tenant'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const tenantId = request.headers.get('x-tenant-id')
    const auth = await verifySupabaseToken(request)
    const access = await verifyTenantAccess(tenantId, auth.uid, auth.email)
    if (!access.hasAccess) return access.response!

    const { id } = await params
    const { data: event, error } = await db.from('Event').select('*').eq('id', id).eq('weddingId', access.weddingId).maybeSingle()
    if (error) throw error
    if (!event) return NextResponse.json({ success: false, error: 'Evento não encontrado ou acesso negado' }, { status: 404 })

    const { count } = await db.from('Rsvp').select('*', { count: 'exact', head: true }).eq('eventId', id)
    return NextResponse.json({ success: true, data: { ...event, _count: { rsvps: count ?? 0 } } })
  } catch (error) {
    console.error('Error fetching event:', error)
    return NextResponse.json({ success: false, error: 'Erro ao carregar evento' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const tenantId = request.headers.get('x-tenant-id')
    const auth = await verifySupabaseToken(request)
    const access = await verifyTenantAccess(tenantId, auth.uid, auth.email)
    if (!access.hasAccess) return access.response!

    const { id } = await params
    const body = await request.json()
    const { name, description, startTime, endTime, venue, address, dressCode, maxCapacity, order } = body

    const { data: event, error } = await db.from('Event').update({
      name,
      description: description || null,
      startTime: new Date(startTime).toISOString(),
      endTime: endTime ? new Date(endTime).toISOString() : null,
      venue: venue || null,
      address: address || null,
      dressCode: dressCode || null,
      maxCapacity: maxCapacity || null,
      order: order || 0,
      updatedAt: new Date().toISOString(),
    }).eq('id', id).eq('weddingId', access.weddingId).select().single()

    if (error) throw error
    return NextResponse.json({ success: true, data: event })
  } catch (error) {
    console.error('Error updating event:', error)
    return NextResponse.json({ success: false, error: 'Erro ao atualizar evento' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const tenantId = request.headers.get('x-tenant-id')
    const auth = await verifySupabaseToken(request)
    const access = await verifyTenantAccess(tenantId, auth.uid, auth.email)
    if (!access.hasAccess) return access.response!

    // Safety check: Only Owner can delete structural events
    if (access.role !== 'owner') {
      return NextResponse.json({ success: false, error: 'Apenas Proprietários podem deletar eventos' }, { status: 403 })
    }

    const { id } = await params
    const { error } = await db.from('Event').delete().eq('id', id).eq('weddingId', access.weddingId)
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting event:', error)
    return NextResponse.json({ success: false, error: 'Erro ao excluir evento' }, { status: 500 })
  }
}
