/**
 * ============================================================================
 * SYNC API ENDPOINT
 * ============================================================================
 * 
 * API endpoint for triggering manual sync between SQLite and Firestore
 * Provides sync status and full/partial sync capabilities
 * ============================================================================
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSyncService, FirestoreSyncService } from '@/services/firestore/sync'

// ============================================================================
// TYPES
// ============================================================================

interface SyncRequest {
  action?: 'full_sync' | 'sync_to_firestore' | 'sync_from_firestore' | 'sync_check_in'
  weddingId?: string
  type?: 'guest' | 'rsvp' | 'check_in' | 'invitation'
  data?: Record<string, unknown>
}

interface SyncResponse {
  success: boolean
  message?: string
  data?: {
    lastSyncAt?: string | null
    status?: string
    guestsSynced?: number
    rsvpsSynced?: number
    checkInsSynced?: number
    error?: string
  }
  error?: string
}

// ============================================================================
// GET: SYNC STATUS
// ============================================================================

export async function GET(request: NextRequest): Promise<NextResponse<SyncResponse>> {
  try {
    const { searchParams } = new URL(request.url)
    const weddingId = searchParams.get('weddingId')

    if (!weddingId) {
      // Get the first wedding (for demo purposes)
      const wedding = await db.wedding.findFirst()
      if (!wedding) {
        return NextResponse.json({
          success: false,
          error: 'No wedding found'
        }, { status: 404 })
      }
      
      const syncService = getSyncService(wedding.id)
      const status = syncService.getStatus()
      
      return NextResponse.json({
        success: true,
        data: {
          lastSyncAt: status.lastSyncAt?.toISOString() || null,
          status: status.status,
          guestsSynced: status.guestsSynced,
          rsvpsSynced: status.rsvpsSynced,
          checkInsSynced: status.checkInsSynced,
          error: status.error
        }
      })
    }

    const syncService = getSyncService(weddingId)
    const status = syncService.getStatus()

    return NextResponse.json({
      success: true,
      data: {
        lastSyncAt: status.lastSyncAt?.toISOString() || null,
        status: status.status,
        guestsSynced: status.guestsSynced,
        rsvpsSynced: status.rsvpsSynced,
        checkInsSynced: status.checkInsSynced,
        error: status.error
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
// POST: TRIGGER SYNC
// ============================================================================

export async function POST(request: NextRequest): Promise<NextResponse<SyncResponse>> {
  try {
    const body: SyncRequest = await request.json()
    const { action = 'full_sync', weddingId, data } = body

    // Get wedding ID if not provided
    let targetWeddingId = weddingId
    if (!targetWeddingId) {
      const wedding = await db.wedding.findFirst()
      if (!wedding) {
        return NextResponse.json({
          success: false,
          error: 'No wedding found'
        }, { status: 404 })
      }
      targetWeddingId = wedding.id
    }

    const syncService = getSyncService(targetWeddingId)

    switch (action) {
      case 'full_sync':
        return await handleFullSync(syncService)
      
      case 'sync_to_firestore':
        return await handleSyncToFirestore(syncService)
      
      case 'sync_from_firestore':
        return await handleSyncFromFirestore(syncService)
      
      case 'sync_check_in':
        return await handleSyncCheckIn(data, targetWeddingId)
      
      default:
        return NextResponse.json({
          success: false,
          error: `Unknown action: ${action}`
        }, { status: 400 })
    }
  } catch (error) {
    console.error('[SyncAPI] POST error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// ============================================================================
// SYNC HANDLERS
// ============================================================================

async function handleFullSync(syncService: FirestoreSyncService): Promise<NextResponse<SyncResponse>> {
  try {
    // First sync to Firestore
    const toResult = await syncService.syncToFirestore()
    
    // Then sync from Firestore (to catch any changes made on other devices)
    const fromResult = await syncService.syncFromFirestore()
    
    const status = syncService.getStatus()
    
    return NextResponse.json({
      success: true,
      message: 'Full sync completed',
      data: {
        lastSyncAt: status.lastSyncAt?.toISOString() || null,
        status: status.status,
        guestsSynced: toResult.guestsSynced + fromResult.guestsSynced,
        rsvpsSynced: toResult.rsvpsSynced + fromResult.rsvpsSynced,
        checkInsSynced: toResult.checkInsSynced + fromResult.checkInsSynced
      }
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Full sync failed'
    }, { status: 500 })
  }
}

async function handleSyncToFirestore(syncService: FirestoreSyncService): Promise<NextResponse<SyncResponse>> {
  try {
    const result = await syncService.syncToFirestore()
    const status = syncService.getStatus()
    
    return NextResponse.json({
      success: true,
      message: 'Sync to Firestore completed',
      data: {
        lastSyncAt: status.lastSyncAt?.toISOString() || null,
        status: status.status,
        guestsSynced: result.guestsSynced,
        rsvpsSynced: result.rsvpsSynced,
        checkInsSynced: result.checkInsSynced
      }
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Sync to Firestore failed'
    }, { status: 500 })
  }
}

async function handleSyncFromFirestore(syncService: FirestoreSyncService): Promise<NextResponse<SyncResponse>> {
  try {
    const result = await syncService.syncFromFirestore()
    const status = syncService.getStatus()
    
    return NextResponse.json({
      success: true,
      message: 'Sync from Firestore completed',
      data: {
        lastSyncAt: status.lastSyncAt?.toISOString() || null,
        status: status.status,
        guestsSynced: result.guestsSynced,
        rsvpsSynced: result.rsvpsSynced,
        checkInsSynced: result.checkInsSynced
      }
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Sync from Firestore failed'
    }, { status: 500 })
  }
}

async function handleSyncCheckIn(
  data: Record<string, unknown> | undefined,
  weddingId: string
): Promise<NextResponse<SyncResponse>> {
  if (!data) {
    return NextResponse.json({
      success: false,
      error: 'No check-in data provided'
    }, { status: 400 })
  }

  try {
    // Update check-in in SQLite
    const invitationId = data.invitationId as string
    if (invitationId) {
      await db.invitation.update({
        where: { id: invitationId },
        data: {
          checkedIn: true,
          checkedInAt: new Date()
        }
      })
    }

    // Sync to Firestore
    const syncService = getSyncService(weddingId)
    if (invitationId) {
      await syncService.syncCheckInToFirestore(
        invitationId,
        true,
        new Date(),
        (data.checkedInBy as string) || 'api_sync'
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Check-in synced successfully',
      data: {
        guestsSynced: 0,
        rsvpsSynced: 0,
        checkInsSynced: 1
      }
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Check-in sync failed'
    }, { status: 500 })
  }
}

// ============================================================================
// PUT: UPDATE SYNC SETTINGS
// ============================================================================

export async function PUT(request: NextRequest): Promise<NextResponse<SyncResponse>> {
  try {
    const body = await request.json()
    const { enabled } = body

    // In a real implementation, you'd store sync preferences in the database
    // For now, we just return success

    return NextResponse.json({
      success: true,
      message: enabled ? 'Sync enabled' : 'Sync disabled',
      data: {
        status: enabled ? 'idle' : 'disabled'
      }
    })
  } catch (error) {
    console.error('[SyncAPI] PUT error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
