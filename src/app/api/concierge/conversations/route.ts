/**
 * Concierge Conversations API
 * Returns list of recent WhatsApp conversations
 */

import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const invitations = await db.invitation.findMany({
      include: {
        guests: true,
        conversations: {
          orderBy: { timestamp: 'desc' },
          take: 1
        },
        _count: {
          select: { conversations: true }
        }
      },
      orderBy: { lastMessageAt: 'desc' },
      take: 20
    })
    
    const conversations = invitations.map(inv => {
      const lastMessage = inv.conversations[0]
      
      return {
        id: inv.id,
        familyName: inv.familyName,
        phone: inv.primaryPhone,
        lastMessage: lastMessage?.content || 'Nenhuma mensagem',
        lastMessageAt: inv.lastMessageAt?.toISOString() || null,
        flowStatus: inv.flowStatus,
        messageCount: inv._count.conversations,
        guestCount: inv.guests.length
      }
    })
    
    return NextResponse.json({ conversations })
    
  } catch (error) {
    console.error('Error fetching conversations:', error)
    return NextResponse.json({ conversations: [] })
  }
}
