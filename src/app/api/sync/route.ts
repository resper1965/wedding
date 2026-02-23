/**
 * ============================================================================
 * SYNC API ENDPOINT
 * ============================================================================
 * 
 * API endpoint for sync operations.
 * Now that all data lives in Postgres (Supabase), sync is just
 * returning current stats from the database.
 * ============================================================================
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// ============================================================================
// GET: SYNC STATUS
// ============================================================================

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url)
    let weddingId = searchParams.get('weddingId')

    if (!weddingId) {
      const wedding = await db.wedding.findFirst()
      if (!wedding) {
        return NextResponse.json({ success: false, error: 'No wedding found' }, { status: 404 })
      }
      weddingId = wedding.id
    }

    const [guestCount, rsvpCount, invitationCount] = await Promise.all([
      db.guest.count({ where: { weddingId } }),
      db.rsvp.count({ where: { guest: { weddingId } } }),
      db.invitation.count({ where: { weddingId } }),
    ])

    return NextResponse.json({
      success: true,
      data: {
        lastSyncAt: new Date().toISOString(),
        status: 'synced',
        guestsSynced: guestCount,
        rsvpsSynced: rsvpCount,
        checkInsSynced: invitationCount,
      }
    })
  } catch (error) {
    console.error('[SyncAPI] GET error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// ============================================================================
// POST: TRIGGER SYNC (check-in)
// ============================================================================

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json()
    const { weddingId, action = 'sync_check_in', data } = body

    let targetWeddingId = weddingId
    if (!targetWeddingId) {
      const wedding = await db.wedding.findFirst()
      if (!wedding) {
        return NextResponse.json({ success: false, error: 'No wedding found' }, { status: 404 })
      }
      targetWeddingId = wedding.id
    }

    if (action === 'sync_check_in' && data?.invitationId) {
      await db.invitation.update({
        where: { id: data.invitationId },
        data: {
          checkedIn: true,
          checkedInAt: new Date()
        }
      })

      return NextResponse.json({
        success: true,
        message: 'Check-in synced successfully',
        data: { guestsSynced: 0, rsvpsSynced: 0, checkInsSynced: 1 }
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Sync complete (all data in Postgres)',
      data: { guestsSynced: 0, rsvpsSynced: 0, checkInsSynced: 0 }
    })
  } catch (error) {
    console.error('[SyncAPI] POST error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// ============================================================================
// PUT: UPDATE SYNC SETTINGS
// ============================================================================

export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json()
    const { enabled } = body

    return NextResponse.json({
      success: true,
      message: enabled ? 'Sync enabled' : 'Sync disabled',
      data: { status: enabled ? 'idle' : 'disabled' }
    })
  } catch (error) {
    console.error('[SyncAPI] PUT error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
