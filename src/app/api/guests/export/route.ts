import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifySupabaseToken } from '@/lib/auth'
import { logAudit } from '@/lib/audit'

export async function GET(request: NextRequest) {
  try {
    const tenantId = request.headers.get('x-tenant-id')
    if (!tenantId) return NextResponse.json({ success: false, error: 'ID do casamento não fornecido' }, { status: 400 })

    const { data: wedding } = await db.from('Wedding').select('id').eq('id', tenantId).maybeSingle()
    if (!wedding) return NextResponse.json({ success: false, error: 'No wedding' }, { status: 404 })

    const auth = await verifySupabaseToken(request)
    if (!auth.authorized) return auth.response

    const { data: guests, error } = await db.from('Guest')
      .select('id, firstName, lastName, email, phone, category, relationship, inviteStatus, thankYouSent, rsvps:Rsvp(status, event:Event(name))')
      .eq('weddingId', wedding.id)
      .order('lastName').order('firstName')
    if (error) throw error

    // log export (ISO 27001/27701)
    await logAudit(
      'EXPORT',
      auth.uid,
      auth.email,
      'WEDDING',
      wedding.id,
      { format: 'CSV', count: guests?.length }
    )

    const headers = ['Nome', 'Sobrenome', 'Email', 'Telefone', 'Categoria', 'Quem Convida', 'Status Convite', 'RSVP', 'Obrigado Enviado']
    const rows = (guests || []).map((g: any) => [
      g.firstName,
      g.lastName,
      g.email || '',
      g.phone || '',
      g.category || '',
      g.relationship || '',
      g.inviteStatus,
      (g.rsvps || []).map((r: any) => `${r.event?.name}: ${r.status}`).join(' | '),
      g.thankYouSent ? 'Sim' : 'Não'
    ])

    const csv = [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\\n')

    return new Response('﻿' + csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="convidados.csv"'
      }
    })
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json({ success: false, error: 'Erro ao exportar' }, { status: 500 })
  }
}
