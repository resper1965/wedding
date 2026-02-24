export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const { data: invitations } = await db.from('Invitation')
      .select('*, guests:Guest(id), conversations:ConversationMessage(id, content, timestamp)')
      .order('lastMessageAt', { ascending: false, nullsFirst: false })
      .limit(20)

    const conversations = (invitations || []).map((inv: any) => {
      const msgs = (inv.conversations || []).sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      return {
        id: inv.id,
        familyName: inv.familyName,
        phone: inv.primaryPhone,
        lastMessage: msgs[0]?.content || 'Nenhuma mensagem',
        lastMessageAt: inv.lastMessageAt || null,
        flowStatus: inv.flowStatus,
        messageCount: msgs.length,
        guestCount: (inv.guests || []).length,
      }
    })

    return NextResponse.json({ conversations })
  } catch (error) {
    console.error('Error fetching conversations:', error)
    return NextResponse.json({ conversations: [] })
  }
}
