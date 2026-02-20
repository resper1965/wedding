/**
 * Concierge Stats API
 * Returns statistics for the concierge dashboard
 */

import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    // Get invitation stats
    const invitations = await db.invitation.findMany({
      include: {
        guests: true,
        conversations: {
          orderBy: { timestamp: 'desc' },
          take: 1
        }
      }
    })
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const stats = {
      totalConversations: invitations.length,
      activeFlows: invitations.filter(i => 
        i.flowStatus !== 'none' && 
        i.flowStatus !== 'confirmed' && 
        i.flowStatus !== 'declined'
      ).length,
      confirmedToday: invitations.filter(i => {
        // Check if any guest was updated today
        return i.guests.some(g => {
          const updatedAt = new Date(g.updatedAt)
          return updatedAt >= today && g.inviteStatus === 'responded'
        })
      }).length,
      pendingResponse: invitations.filter(i => 
        i.flowStatus === 'none' && i.lastMessageAt
      ).length,
      qrCodesGenerated: invitations.filter(i => i.qrToken !== null).length,
      checkInsToday: invitations.filter(i => {
        if (!i.checkedInAt) return false
        const checkedInAt = new Date(i.checkedInAt)
        return checkedInAt >= today
      }).length
    }
    
    return NextResponse.json(stats)
    
  } catch (error) {
    console.error('Error fetching concierge stats:', error)
    return NextResponse.json({
      totalConversations: 0,
      activeFlows: 0,
      confirmedToday: 0,
      pendingResponse: 0,
      qrCodesGenerated: 0,
      checkInsToday: 0
    })
  }
}
