import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const { data: invitations } = await db.from('Invitation')
      .select('*, guests:Guest(updatedAt, inviteStatus), conversations:ConversationMessage(id, timestamp)')

    const today = new Date(); today.setHours(0, 0, 0, 0)

    const stats = {
      totalConversations: (invitations || []).length,
      activeFlows: (invitations || []).filter((i: any) => i.flowStatus !== 'none' && i.flowStatus !== 'confirmed' && i.flowStatus !== 'declined').length,
      confirmedToday: (invitations || []).filter((i: any) =>
        (i.guests || []).some((g: any) => new Date(g.updatedAt) >= today && g.inviteStatus === 'responded')
      ).length,
      pendingResponse: (invitations || []).filter((i: any) => i.flowStatus === 'none' && i.lastMessageAt).length,
      qrCodesGenerated: (invitations || []).filter((i: any) => i.qrToken !== null).length,
      checkInsToday: (invitations || []).filter((i: any) => i.checkedInAt && new Date(i.checkedInAt) >= today).length,
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching concierge stats:', error)
    return NextResponse.json({ totalConversations: 0, activeFlows: 0, confirmedToday: 0, pendingResponse: 0, qrCodesGenerated: 0, checkInsToday: 0 })
  }
}
