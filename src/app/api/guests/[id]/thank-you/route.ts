import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PATCH(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { data: guest } = await db.from('Guest').select('thankYouSent').eq('id', id).maybeSingle()
    if (!guest) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })

    const { data: updated, error } = await db.from('Guest').update({
      thankYouSent: !guest.thankYouSent,
      thankYouSentAt: !guest.thankYouSent ? new Date().toISOString() : null,
      updatedAt: new Date().toISOString(),
    }).eq('id', id).select('thankYouSent').single()

    if (error) throw error
    return NextResponse.json({ success: true, data: { thankYouSent: updated.thankYouSent } })
  } catch (error) {
    console.error('ThankYou PATCH error:', error)
    return NextResponse.json({ success: false, error: 'Erro ao atualizar' }, { status: 500 })
  }
}
