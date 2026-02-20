/**
 * ============================================================================
 * FIRESTORE SYNC SERVICE
 * ============================================================================
 * 
 * Sincronização bidirecional entre SQLite (Prisma) e Firestore
 * Suporte offline-first com resolução de conflitos
 * ============================================================================
 */

import { db } from '@/lib/db'
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  writeBatch,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
  DocumentData,
  Firestore
} from 'firebase/firestore'
import { getFirebaseFirestore } from '@/lib/firebase'

// ============================================================================
// TYPES
// ============================================================================

export interface SyncStatus {
  lastSyncAt: Date | null
  status: 'idle' | 'syncing' | 'error' | 'offline'
  error?: string
  guestsSynced: number
  rsvpsSynced: number
  checkInsSynced: number
}

export interface FirestoreGuest {
  id: string
  weddingId: string
  invitationId: string | null
  firstName: string
  lastName: string
  email: string | null
  phone: string | null
  category: string | null
  relationship: string | null
  inviteStatus: string
  dietaryRestrictions: string | null
  specialNeeds: string | null
  songs: string | null
  notes: string | null
  rsvpToken: string
  createdAt: Timestamp | null
  updatedAt: Timestamp | null
  syncedAt: Timestamp | null
}

export interface FirestoreInvitation {
  id: string
  weddingId: string
  primaryPhone: string
  primaryContactName: string | null
  familyName: string | null
  flowStatus: string
  flowData: string | null
  conversationSummary: string | null
  lastMessageAt: Timestamp | null
  qrToken: string | null
  qrTokenExpires: Timestamp | null
  checkedIn: boolean
  checkedInAt: Timestamp | null
  createdAt: Timestamp | null
  updatedAt: Timestamp | null
  syncedAt: Timestamp | null
}

export interface FirestoreRsvp {
  id: string
  guestId: string
  eventId: string
  status: string
  respondedAt: Timestamp | null
  plusOne: boolean
  plusOneName: string | null
  guestMessage: string | null
  responseSource: string | null
  createdAt: Timestamp | null
  updatedAt: Timestamp | null
  syncedAt: Timestamp | null
}

export interface FirestoreCheckIn {
  id: string
  weddingId: string
  guestId: string
  invitationId: string
  eventId: string
  status: 'checked_in' | 'no_show'
  checkedInAt: Timestamp
  checkedInBy: string
  deviceId: string
  syncedAt: Timestamp | null
  createdAt: Timestamp | null
}

export interface ConflictResolution {
  strategy: 'local_wins' | 'remote_wins' | 'merge' | 'latest_wins'
  field?: string
}

// ============================================================================
// SYNC SERVICE CLASS
// ============================================================================

export class FirestoreSyncService {
  private firestore: Firestore | null = null
  private weddingId: string
  private syncStatus: SyncStatus = {
    lastSyncAt: null,
    status: 'idle',
    guestsSynced: 0,
    rsvpsSynced: 0,
    checkInsSynced: 0
  }

  constructor(weddingId: string) {
    this.weddingId = weddingId
  }

  /**
   * Initialize Firestore connection
   */
  private async initFirestore(): Promise<Firestore> {
    if (!this.firestore) {
      this.firestore = getFirebaseFirestore()
    }
    return this.firestore
  }

  /**
   * Get current sync status
   */
  getStatus(): SyncStatus {
    return { ...this.syncStatus }
  }

  /**
   * Full sync from SQLite to Firestore
   */
  async syncToFirestore(): Promise<SyncStatus> {
    try {
      this.syncStatus.status = 'syncing'
      const firestore = await this.initFirestore()

      // Sync in batches for better performance
      const batchSize = 500

      // 1. Sync Guests
      const guests = await db.guest.findMany({
        where: { weddingId: this.weddingId }
      })
      await this.batchSyncGuests(firestore, guests, batchSize)
      this.syncStatus.guestsSynced = guests.length

      // 2. Sync Invitations
      const invitations = await db.invitation.findMany({
        where: { weddingId: this.weddingId }
      })
      await this.batchSyncInvitations(firestore, invitations, batchSize)

      // 3. Sync RSVPs
      const rsvps = await db.rsvp.findMany({
        where: { guest: { weddingId: this.weddingId } },
        include: { guest: true }
      })
      await this.batchSyncRsvps(firestore, rsvps, batchSize)
      this.syncStatus.rsvpsSynced = rsvps.length

      // 4. Sync Check-ins (from invitations that have checked in)
      const checkedInInvitations = invitations.filter(inv => inv.checkedIn)
      await this.batchSyncCheckIns(firestore, checkedInInvitations, batchSize)
      this.syncStatus.checkInsSynced = checkedInInvitations.length

      this.syncStatus.lastSyncAt = new Date()
      this.syncStatus.status = 'idle'
      this.syncStatus.error = undefined

      return this.syncStatus
    } catch (error) {
      this.syncStatus.status = 'error'
      this.syncStatus.error = error instanceof Error ? error.message : 'Unknown error'
      throw error
    }
  }

  /**
   * Sync from Firestore to SQLite (for offline-first recovery)
   */
  async syncFromFirestore(): Promise<SyncStatus> {
    try {
      this.syncStatus.status = 'syncing'
      const firestore = await this.initFirestore()

      // 1. Sync Guests from Firestore
      const guestsSnapshot = await getDocs(
        query(
          collection(firestore, 'guests'),
          where('weddingId', '==', this.weddingId)
        )
      )

      for (const guestDoc of guestsSnapshot.docs) {
        const data = guestDoc.data() as FirestoreGuest
        
        // Upsert to SQLite
        await db.guest.upsert({
          where: { id: guestDoc.id },
          update: {
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            phone: data.phone,
            category: data.category,
            relationship: data.relationship,
            inviteStatus: data.inviteStatus as 'pending' | 'sent' | 'viewed' | 'responded' | 'reminder_sent',
            dietaryRestrictions: data.dietaryRestrictions,
            specialNeeds: data.specialNeeds,
            songs: data.songs,
            notes: data.notes,
            updatedAt: new Date()
          },
          create: {
            id: guestDoc.id,
            weddingId: data.weddingId,
            invitationId: data.invitationId,
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            phone: data.phone,
            category: data.category,
            relationship: data.relationship,
            inviteStatus: data.inviteStatus as 'pending' | 'sent' | 'viewed' | 'responded' | 'reminder_sent',
            dietaryRestrictions: data.dietaryRestrictions,
            specialNeeds: data.specialNeeds,
            songs: data.songs,
            notes: data.notes,
            rsvpToken: data.rsvpToken
          }
        })
        this.syncStatus.guestsSynced++
      }

      // 2. Sync RSVPs from Firestore
      const rsvpsSnapshot = await getDocs(
        query(
          collection(firestore, 'rsvps'),
          where('weddingId', '==', this.weddingId)
        )
      )

      for (const rsvpDoc of rsvpsSnapshot.docs) {
        const data = rsvpDoc.data() as FirestoreRsvp & { weddingId: string }
        
        await db.rsvp.upsert({
          where: { id: rsvpDoc.id },
          update: {
            status: data.status as 'pending' | 'confirmed' | 'declined' | 'maybe',
            respondedAt: data.respondedAt?.toDate(),
            plusOne: data.plusOne,
            plusOneName: data.plusOneName,
            guestMessage: data.guestMessage,
            responseSource: data.responseSource,
            updatedAt: new Date()
          },
          create: {
            id: rsvpDoc.id,
            guestId: data.guestId,
            eventId: data.eventId,
            status: data.status as 'pending' | 'confirmed' | 'declined' | 'maybe',
            respondedAt: data.respondedAt?.toDate(),
            plusOne: data.plusOne,
            plusOneName: data.plusOneName,
            guestMessage: data.guestMessage,
            responseSource: data.responseSource
          }
        })
        this.syncStatus.rsvpsSynced++
      }

      this.syncStatus.lastSyncAt = new Date()
      this.syncStatus.status = 'idle'
      this.syncStatus.error = undefined

      return this.syncStatus
    } catch (error) {
      this.syncStatus.status = 'error'
      this.syncStatus.error = error instanceof Error ? error.message : 'Unknown error'
      throw error
    }
  }

  /**
   * Batch sync guests to Firestore
   */
  private async batchSyncGuests(
    firestore: Firestore,
    guests: Awaited<ReturnType<typeof db.guest.findMany>>,
    batchSize: number
  ): Promise<void> {
    const batches = this.chunk(guests, batchSize)

    for (const batch of batches) {
      const writeBatchInstance = writeBatch(firestore)

      for (const guest of batch) {
        const ref = doc(collection(firestore, 'guests'), guest.id)
        const firestoreGuest: FirestoreGuest = {
          id: guest.id,
          weddingId: guest.weddingId,
          invitationId: guest.invitationId,
          firstName: guest.firstName,
          lastName: guest.lastName,
          email: guest.email,
          phone: guest.phone,
          category: guest.category,
          relationship: guest.relationship,
          inviteStatus: guest.inviteStatus,
          dietaryRestrictions: guest.dietaryRestrictions,
          specialNeeds: guest.specialNeeds,
          songs: guest.songs,
          notes: guest.notes,
          rsvpToken: guest.rsvpToken,
          createdAt: guest.createdAt ? Timestamp.fromDate(guest.createdAt) : null,
          updatedAt: guest.updatedAt ? Timestamp.fromDate(guest.updatedAt) : null,
          syncedAt: serverTimestamp() as Timestamp
        }
        writeBatchInstance.set(ref, firestoreGuest, { merge: true })
      }

      await writeBatchInstance.commit()
    }
  }

  /**
   * Batch sync invitations to Firestore
   */
  private async batchSyncInvitations(
    firestore: Firestore,
    invitations: Awaited<ReturnType<typeof db.invitation.findMany>>,
    batchSize: number
  ): Promise<void> {
    const batches = this.chunk(invitations, batchSize)

    for (const batch of batches) {
      const writeBatchInstance = writeBatch(firestore)

      for (const invitation of batch) {
        const ref = doc(collection(firestore, 'invitations'), invitation.id)
        const firestoreInvitation: FirestoreInvitation = {
          id: invitation.id,
          weddingId: invitation.weddingId,
          primaryPhone: invitation.primaryPhone,
          primaryContactName: invitation.primaryContactName,
          familyName: invitation.familyName,
          flowStatus: invitation.flowStatus,
          flowData: invitation.flowData,
          conversationSummary: invitation.conversationSummary,
          lastMessageAt: invitation.lastMessageAt ? Timestamp.fromDate(invitation.lastMessageAt) : null,
          qrToken: invitation.qrToken,
          qrTokenExpires: invitation.qrTokenExpires ? Timestamp.fromDate(invitation.qrTokenExpires) : null,
          checkedIn: invitation.checkedIn,
          checkedInAt: invitation.checkedInAt ? Timestamp.fromDate(invitation.checkedInAt) : null,
          createdAt: invitation.createdAt ? Timestamp.fromDate(invitation.createdAt) : null,
          updatedAt: invitation.updatedAt ? Timestamp.fromDate(invitation.updatedAt) : null,
          syncedAt: serverTimestamp() as Timestamp
        }
        writeBatchInstance.set(ref, firestoreInvitation, { merge: true })
      }

      await writeBatchInstance.commit()
    }
  }

  /**
   * Batch sync RSVPs to Firestore
   */
  private async batchSyncRsvps(
    firestore: Firestore,
    rsvps: Awaited<ReturnType<typeof db.rsvp.findMany>> & { guest: { weddingId: string } },
    batchSize: number
  ): Promise<void> {
    const batches = this.chunk(rsvps, batchSize)

    for (const batch of batches) {
      const writeBatchInstance = writeBatch(firestore)

      for (const rsvp of batch) {
        const ref = doc(collection(firestore, 'rsvps'), rsvp.id)
        const firestoreRsvp: FirestoreRsvp & { weddingId: string } = {
          id: rsvp.id,
          weddingId: rsvp.guest.weddingId,
          guestId: rsvp.guestId,
          eventId: rsvp.eventId,
          status: rsvp.status,
          respondedAt: rsvp.respondedAt ? Timestamp.fromDate(rsvp.respondedAt) : null,
          plusOne: rsvp.plusOne,
          plusOneName: rsvp.plusOneName,
          guestMessage: rsvp.guestMessage,
          responseSource: rsvp.responseSource,
          createdAt: rsvp.createdAt ? Timestamp.fromDate(rsvp.createdAt) : null,
          updatedAt: rsvp.updatedAt ? Timestamp.fromDate(rsvp.updatedAt) : null,
          syncedAt: serverTimestamp() as Timestamp
        }
        writeBatchInstance.set(ref, firestoreRsvp, { merge: true })
      }

      await writeBatchInstance.commit()
    }
  }

  /**
   * Batch sync check-ins to Firestore
   */
  private async batchSyncCheckIns(
    firestore: Firestore,
    invitations: Awaited<ReturnType<typeof db.invitation.findMany>>,
    batchSize: number
  ): Promise<void> {
    const checkedIn = invitations.filter(inv => inv.checkedIn)
    const batches = this.chunk(checkedIn, batchSize)

    for (const batch of batches) {
      const writeBatchInstance = writeBatch(firestore)

      for (const invitation of batch) {
        if (!invitation.checkedInAt) continue
        
        const ref = doc(collection(firestore, 'check_in'), `checkin_${invitation.id}`)
        const checkIn: FirestoreCheckIn = {
          id: `checkin_${invitation.id}`,
          weddingId: invitation.weddingId,
          guestId: '', // Would need to get all guests from invitation
          invitationId: invitation.id,
          eventId: 'reception', // Default event
          status: 'checked_in',
          checkedInAt: Timestamp.fromDate(invitation.checkedInAt),
          checkedInBy: 'system',
          deviceId: 'sync',
          syncedAt: serverTimestamp() as Timestamp,
          createdAt: null
        }
        writeBatchInstance.set(ref, checkIn, { merge: true })
      }

      await writeBatchInstance.commit()
    }
  }

  /**
   * Sync single guest to Firestore
   */
  async syncGuestToFirestore(guestId: string): Promise<void> {
    const firestore = await this.initFirestore()
    
    const guest = await db.guest.findUnique({
      where: { id: guestId }
    })

    if (!guest) {
      throw new Error(`Guest not found: ${guestId}`)
    }

    const ref = doc(collection(firestore, 'guests'), guest.id)
    const firestoreGuest: FirestoreGuest = {
      id: guest.id,
      weddingId: guest.weddingId,
      invitationId: guest.invitationId,
      firstName: guest.firstName,
      lastName: guest.lastName,
      email: guest.email,
      phone: guest.phone,
      category: guest.category,
      relationship: guest.relationship,
      inviteStatus: guest.inviteStatus,
      dietaryRestrictions: guest.dietaryRestrictions,
      specialNeeds: guest.specialNeeds,
      songs: guest.songs,
      notes: guest.notes,
      rsvpToken: guest.rsvpToken,
      createdAt: guest.createdAt ? Timestamp.fromDate(guest.createdAt) : null,
      updatedAt: guest.updatedAt ? Timestamp.fromDate(guest.updatedAt) : null,
      syncedAt: serverTimestamp() as Timestamp
    }

    await setDoc(ref, firestoreGuest, { merge: true })
  }

  /**
   * Sync single RSVP to Firestore
   */
  async syncRsvpToFirestore(rsvpId: string): Promise<void> {
    const firestore = await this.initFirestore()
    
    const rsvp = await db.rsvp.findUnique({
      where: { id: rsvpId },
      include: { guest: true }
    })

    if (!rsvp) {
      throw new Error(`RSVP not found: ${rsvpId}`)
    }

    const ref = doc(collection(firestore, 'rsvps'), rsvp.id)
    const firestoreRsvp: FirestoreRsvp & { weddingId: string } = {
      id: rsvp.id,
      weddingId: rsvp.guest.weddingId,
      guestId: rsvp.guestId,
      eventId: rsvp.eventId,
      status: rsvp.status,
      respondedAt: rsvp.respondedAt ? Timestamp.fromDate(rsvp.respondedAt) : null,
      plusOne: rsvp.plusOne,
      plusOneName: rsvp.plusOneName,
      guestMessage: rsvp.guestMessage,
      responseSource: rsvp.responseSource,
      createdAt: rsvp.createdAt ? Timestamp.fromDate(rsvp.createdAt) : null,
      updatedAt: rsvp.updatedAt ? Timestamp.fromDate(rsvp.updatedAt) : null,
      syncedAt: serverTimestamp() as Timestamp
    }

    await setDoc(ref, firestoreRsvp, { merge: true })
  }

  /**
   * Sync check-in status to Firestore
   */
  async syncCheckInToFirestore(
    invitationId: string,
    checkedIn: boolean,
    checkedInAt: Date | null,
    checkedInBy: string = 'system'
  ): Promise<void> {
    const firestore = await this.initFirestore()
    
    const invitation = await db.invitation.findUnique({
      where: { id: invitationId },
      include: { guests: true }
    })

    if (!invitation) {
      throw new Error(`Invitation not found: ${invitationId}`)
    }

    if (checkedIn && checkedInAt) {
      // Create check-in record
      const ref = doc(collection(firestore, 'check_in'), `checkin_${invitationId}`)
      const checkIn: FirestoreCheckIn = {
        id: `checkin_${invitationId}`,
        weddingId: invitation.weddingId,
        guestId: invitation.guests[0]?.id || '',
        invitationId: invitation.id,
        eventId: 'reception',
        status: 'checked_in',
        checkedInAt: Timestamp.fromDate(checkedInAt),
        checkedInBy,
        deviceId: 'sync',
        syncedAt: serverTimestamp() as Timestamp,
        createdAt: null
      }
      await setDoc(ref, checkIn, { merge: true })
    }

    // Update invitation check-in status
    const invRef = doc(collection(firestore, 'invitations'), invitationId)
    await setDoc(invRef, {
      checkedIn,
      checkedInAt: checkedInAt ? Timestamp.fromDate(checkedInAt) : null,
      updatedAt: serverTimestamp()
    }, { merge: true })
  }

  /**
   * Utility: Chunk array into batches
   */
  private chunk<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = []
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size))
    }
    return chunks
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let syncServiceInstance: FirestoreSyncService | null = null

export function getSyncService(weddingId: string): FirestoreSyncService {
  if (!syncServiceInstance || syncServiceInstance['weddingId'] !== weddingId) {
    syncServiceInstance = new FirestoreSyncService(weddingId)
  }
  return syncServiceInstance
}

// ============================================================================
// CONFLICT RESOLUTION
// ============================================================================

export function resolveConflict(
  localData: { updatedAt: Date },
  remoteData: { updatedAt: Timestamp | null },
  strategy: ConflictResolution = { strategy: 'latest_wins' }
): 'local' | 'remote' {
  switch (strategy.strategy) {
    case 'local_wins':
      return 'local'
    case 'remote_wins':
      return 'remote'
    case 'latest_wins':
      const localTime = localData.updatedAt.getTime()
      const remoteTime = remoteData.updatedAt?.toMillis() || 0
      return localTime >= remoteTime ? 'local' : 'remote'
    case 'merge':
      // Would need field-level comparison
      return 'local'
    default:
      return 'local'
  }
}
