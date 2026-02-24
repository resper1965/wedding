export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const { data: wedding } = await db.from('Wedding').select('id').limit(1).maybeSingle()
    if (!wedding) return NextResponse.json({ success: false, error: 'No wedding' }, { status: 404 })

    const { data: guests, error } = await db.from('Guest')
      .select('id, firstName, lastName, email, phone, category, relationship, inviteStatus, thankYouSent, rsvps:Rsvp(status, event:Event(name))')
      .eq('weddingId', wedding.id)
      .order('lastName').order('firstName')
    if (error) throw error

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
