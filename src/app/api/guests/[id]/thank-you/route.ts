import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PATCH(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const guest = await db.guest.findUnique({ where: { id }, select: { thankYouSent: true } })
    if (!guest) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })

    const updated = await db.guest.update({
      where: { id },
      data: {
        thankYouSent: !guest.thankYouSent,
        thankYouSentAt: !guest.thankYouSent ? new Date() : null
      }
    })
    return NextResponse.json({ success: true, data: { thankYouSent: updated.thankYouSent } })
  } catch (error) {
    console.error('ThankYou PATCH error:', error)
    return NextResponse.json({ success: false, error: 'Erro ao atualizar' }, { status: 500 })
  }
}
