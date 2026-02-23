import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const wedding = await db.wedding.findFirst()
    if (!wedding) return NextResponse.json({ success: false, error: 'No wedding' }, { status: 404 })

    const guests = await db.guest.findMany({
      where: { weddingId: wedding.id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        category: true,
        relationship: true,
        inviteStatus: true,
        thankYouSent: true,
        rsvps: {
          select: {
            status: true,
            event: { select: { name: true } }
          }
        }
      },
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }]
    })

    // Build CSV
    const headers = ['Nome', 'Sobrenome', 'Email', 'Telefone', 'Categoria', 'Quem Convida', 'Status Convite', 'RSVP', 'Obrigado Enviado']
    const rows = guests.map(g => [
      g.firstName,
      g.lastName,
      g.email || '',
      g.phone || '',
      g.category || '',
      g.relationship || '',
      g.inviteStatus,
      g.rsvps.map(r => `${r.event.name}: ${r.status}`).join(' | '),
      g.thankYouSent ? 'Sim' : 'Não'
    ])

    const csv = [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n')

    return new Response('\uFEFF' + csv, {
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
