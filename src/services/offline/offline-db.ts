/**
 * ============================================================================
 * OFFLINE DATABASE SERVICE
 * ============================================================================
 * 
 * IndexedDB-based offline storage for wedding platform
 * Provides offline-first data access with automatic sync when online
 * ============================================================================
 */

// ============================================================================
// TYPES
// ============================================================================

export interface OfflineGuest {
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
  createdAt: Date
  updatedAt: Date
  _offline?: boolean
  _syncedAt?: Date
}

export interface OfflineInvitation {
  id: string
  weddingId: string
  primaryPhone: string
  primaryContactName: string | null
  familyName: string | null
  flowStatus: string
  flowData: string | null
  conversationSummary: string | null
  lastMessageAt: Date | null
  qrToken: string | null
  qrTokenExpires: Date | null
  checkedIn: boolean
  checkedInAt: Date | null
  createdAt: Date
  updatedAt: Date
  _offline?: boolean
  _syncedAt?: Date
}

export interface OfflineRsvp {
  id: string
  guestId: string
  eventId: string
  status: string
  respondedAt: Date | null
  plusOne: boolean
  plusOneName: string | null
  guestMessage: string | null
  responseSource: string | null
  createdAt: Date
  updatedAt: Date
  _offline?: boolean
  _syncedAt?: Date
}

export interface OfflineCheckIn {
  id: string
  weddingId: string
  guestId: string
  invitationId: string
  eventId: string
  status: 'checked_in' | 'no_show'
  checkedInAt: Date
  checkedInBy: string
  deviceId: string
  syncedAt: Date | null
  createdAt: Date
  _pending?: boolean
}

export interface SyncQueueItem {
  id: string
  type: 'guest' | 'rsvp' | 'check_in' | 'invitation'
  action: 'create' | 'update' | 'delete'
  data: Record<string, unknown>
  createdAt: Date
  attempts: number
  lastError?: string
}

export interface OfflineConfig {
  dbName: string
  version: number
}

// ============================================================================
// DATABASE CONFIGURATION
// ============================================================================

const DEFAULT_CONFIG: OfflineConfig = {
  dbName: 'wedding_offline_db',
  version: 1
}

// ============================================================================
// OFFLINE DATABASE CLASS
// ============================================================================

export class OfflineDatabase {
  private db: IDBDatabase | null = null
  private config: OfflineConfig
  private isInitialized = false

  constructor(config: Partial<OfflineConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
  }

  /**
   * Initialize the database
   */
  async init(): Promise<IDBDatabase> {
    if (this.db && this.isInitialized) {
      return this.db
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.config.dbName, this.config.version)

      request.onerror = () => {
        console.error('[OfflineDB] Failed to open database:', request.error)
        reject(request.error)
      }

      request.onsuccess = () => {
        this.db = request.result
        this.isInitialized = true
        console.log('[OfflineDB] Database opened successfully')
        resolve(this.db)
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // Create object stores
        if (!db.objectStoreNames.contains('guests')) {
          const guestStore = db.createObjectStore('guests', { keyPath: 'id' })
          guestStore.createIndex('weddingId', 'weddingId', { unique: false })
          guestStore.createIndex('invitationId', 'invitationId', { unique: false })
          guestStore.createIndex('rsvpToken', 'rsvpToken', { unique: true })
        }

        if (!db.objectStoreNames.contains('invitations')) {
          const invitationStore = db.createObjectStore('invitations', { keyPath: 'id' })
          invitationStore.createIndex('weddingId', 'weddingId', { unique: false })
          invitationStore.createIndex('primaryPhone', 'primaryPhone', { unique: true })
          invitationStore.createIndex('qrToken', 'qrToken', { unique: true })
        }

        if (!db.objectStoreNames.contains('rsvps')) {
          const rsvpStore = db.createObjectStore('rsvps', { keyPath: 'id' })
          rsvpStore.createIndex('guestId', 'guestId', { unique: false })
          rsvpStore.createIndex('eventId', 'eventId', { unique: false })
        }

        if (!db.objectStoreNames.contains('checkIns')) {
          const checkInStore = db.createObjectStore('checkIns', { keyPath: 'id' })
          checkInStore.createIndex('weddingId', 'weddingId', { unique: false })
          checkInStore.createIndex('guestId', 'guestId', { unique: false })
          checkInStore.createIndex('invitationId', 'invitationId', { unique: false })
          checkInStore.createIndex('syncedAt', 'syncedAt', { unique: false })
        }

        if (!db.objectStoreNames.contains('syncQueue')) {
          const syncQueueStore = db.createObjectStore('syncQueue', { keyPath: 'id' })
          syncQueueStore.createIndex('type', 'type', { unique: false })
          syncQueueStore.createIndex('createdAt', 'createdAt', { unique: false })
        }

        console.log('[OfflineDB] Database schema created/upgraded')
      }
    })
  }

  /**
   * Get database instance
   */
  private async getDb(): Promise<IDBDatabase> {
    if (!this.db || !this.isInitialized) {
      return await this.init()
    }
    return this.db
  }

  // ============================================================================
  // GUESTS OPERATIONS
  // ============================================================================

  /**
   * Save guest to offline storage
   */
  async saveGuest(guest: OfflineGuest): Promise<void> {
    const db = await this.getDb()
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('guests', 'readwrite')
      const store = transaction.objectStore('guests')
      
      const request = store.put({
        ...guest,
        _offline: true,
        _syncedAt: new Date()
      })

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * Get guest by ID
   */
  async getGuest(id: string): Promise<OfflineGuest | null> {
    const db = await this.getDb()
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('guests', 'readonly')
      const store = transaction.objectStore('guests')
      const request = store.get(id)

      request.onsuccess = () => resolve(request.result || null)
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * Get all guests for a wedding
   */
  async getGuests(weddingId: string): Promise<OfflineGuest[]> {
    const db = await this.getDb()
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('guests', 'readonly')
      const store = transaction.objectStore('guests')
      const index = store.index('weddingId')
      const request = index.getAll(weddingId)

      request.onsuccess = () => resolve(request.result || [])
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * Delete guest
   */
  async deleteGuest(id: string): Promise<void> {
    const db = await this.getDb()
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('guests', 'readwrite')
      const store = transaction.objectStore('guests')
      const request = store.delete(id)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  // ============================================================================
  // INVITATIONS OPERATIONS
  // ============================================================================

  /**
   * Save invitation to offline storage
   */
  async saveInvitation(invitation: OfflineInvitation): Promise<void> {
    const db = await this.getDb()
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('invitations', 'readwrite')
      const store = transaction.objectStore('invitations')
      
      const request = store.put({
        ...invitation,
        _offline: true,
        _syncedAt: new Date()
      })

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * Get invitation by ID
   */
  async getInvitation(id: string): Promise<OfflineInvitation | null> {
    const db = await this.getDb()
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('invitations', 'readonly')
      const store = transaction.objectStore('invitations')
      const request = store.get(id)

      request.onsuccess = () => resolve(request.result || null)
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * Get all invitations for a wedding
   */
  async getInvitations(weddingId: string): Promise<OfflineInvitation[]> {
    const db = await this.getDb()
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('invitations', 'readonly')
      const store = transaction.objectStore('invitations')
      const index = store.index('weddingId')
      const request = index.getAll(weddingId)

      request.onsuccess = () => resolve(request.result || [])
      request.onerror = () => reject(request.error)
    })
  }

  // ============================================================================
  // RSVPs OPERATIONS
  // ============================================================================

  /**
   * Save RSVP to offline storage
   */
  async saveRsvp(rsvp: OfflineRsvp): Promise<void> {
    const db = await this.getDb()
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('rsvps', 'readwrite')
      const store = transaction.objectStore('rsvps')
      
      const request = store.put({
        ...rsvp,
        _offline: true,
        _syncedAt: new Date()
      })

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * Get RSVP by ID
   */
  async getRsvp(id: string): Promise<OfflineRsvp | null> {
    const db = await this.getDb()
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('rsvps', 'readonly')
      const store = transaction.objectStore('rsvps')
      const request = store.get(id)

      request.onsuccess = () => resolve(request.result || null)
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * Get all RSVPs for a guest
   */
  async getRsvpsForGuest(guestId: string): Promise<OfflineRsvp[]> {
    const db = await this.getDb()
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('rsvps', 'readonly')
      const store = transaction.objectStore('rsvps')
      const index = store.index('guestId')
      const request = index.getAll(guestId)

      request.onsuccess = () => resolve(request.result || [])
      request.onerror = () => reject(request.error)
    })
  }

  // ============================================================================
  // CHECK-INS OPERATIONS
  // ============================================================================

  /**
   * Save check-in to offline storage
   */
  async saveCheckIn(checkIn: OfflineCheckIn): Promise<void> {
    const db = await this.getDb()
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('checkIns', 'readwrite')
      const store = transaction.objectStore('checkIns')
      
      const request = store.put({
        ...checkIn,
        _pending: !checkIn.syncedAt
      })

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * Get check-in by guest ID
   */
  async getCheckInByGuest(guestId: string): Promise<OfflineCheckIn | null> {
    const db = await this.getDb()
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('checkIns', 'readonly')
      const store = transaction.objectStore('checkIns')
      const index = store.index('guestId')
      const request = index.get(guestId)

      request.onsuccess = () => resolve(request.result || null)
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * Get all check-ins for a wedding
   */
  async getCheckIns(weddingId: string): Promise<OfflineCheckIn[]> {
    const db = await this.getDb()
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('checkIns', 'readonly')
      const store = transaction.objectStore('checkIns')
      const index = store.index('weddingId')
      const request = index.getAll(weddingId)

      request.onsuccess = () => resolve(request.result || [])
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * Get pending check-ins (not yet synced)
   */
  async getPendingCheckIns(): Promise<OfflineCheckIn[]> {
    const db = await this.getDb()
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('checkIns', 'readonly')
      const store = transaction.objectStore('checkIns')
      const request = store.openCursor()
      const pending: OfflineCheckIn[] = []

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result
        if (cursor) {
          const checkIn = cursor.value as OfflineCheckIn
          if (checkIn._pending || !checkIn.syncedAt) {
            pending.push(checkIn)
          }
          cursor.continue()
        } else {
          resolve(pending)
        }
      }
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * Mark check-in as synced
   */
  async markCheckInSynced(id: string): Promise<void> {
    const db = await this.getDb()
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('checkIns', 'readwrite')
      const store = transaction.objectStore('checkIns')
      const getRequest = store.get(id)

      getRequest.onsuccess = () => {
        const checkIn = getRequest.result
        if (checkIn) {
          checkIn.syncedAt = new Date()
          checkIn._pending = false
          store.put(checkIn)
        }
        resolve()
      }
      getRequest.onerror = () => reject(getRequest.error)
    })
  }

  // ============================================================================
  // SYNC QUEUE OPERATIONS
  // ============================================================================

  /**
   * Add item to sync queue
   */
  async addToSyncQueue(item: Omit<SyncQueueItem, 'id' | 'createdAt' | 'attempts'>): Promise<string> {
    const db = await this.getDb()
    const id = `${item.type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('syncQueue', 'readwrite')
      const store = transaction.objectStore('syncQueue')
      
      const queueItem: SyncQueueItem = {
        id,
        ...item,
        createdAt: new Date(),
        attempts: 0
      }
      
      const request = store.add(queueItem)

      request.onsuccess = () => resolve(id)
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * Get all pending sync items
   */
  async getSyncQueue(): Promise<SyncQueueItem[]> {
    const db = await this.getDb()
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('syncQueue', 'readonly')
      const store = transaction.objectStore('syncQueue')
      const request = store.getAll()

      request.onsuccess = () => {
        const items = request.result || []
        // Sort by creation date
        items.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        resolve(items)
      }
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * Update sync queue item
   */
  async updateSyncQueueItem(id: string, updates: Partial<SyncQueueItem>): Promise<void> {
    const db = await this.getDb()
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('syncQueue', 'readwrite')
      const store = transaction.objectStore('syncQueue')
      const getRequest = store.get(id)

      getRequest.onsuccess = () => {
        const item = getRequest.result
        if (item) {
          const updated = { ...item, ...updates }
          store.put(updated)
        }
        resolve()
      }
      getRequest.onerror = () => reject(getRequest.error)
    })
  }

  /**
   * Remove item from sync queue
   */
  async removeFromSyncQueue(id: string): Promise<void> {
    const db = await this.getDb()
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('syncQueue', 'readwrite')
      const store = transaction.objectStore('syncQueue')
      const request = store.delete(id)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  // ============================================================================
  // BULK OPERATIONS
  // ============================================================================

  /**
   * Clear all offline data
   */
  async clearAll(): Promise<void> {
    const db = await this.getDb()
    
    const stores = ['guests', 'invitations', 'rsvps', 'checkIns', 'syncQueue']
    
    for (const storeName of stores) {
      await new Promise<void>((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readwrite')
        const store = transaction.objectStore(storeName)
        const request = store.clear()

        request.onsuccess = () => resolve()
        request.onerror = () => reject(request.error)
      })
    }
  }

  /**
   * Get storage stats
   */
  async getStats(): Promise<{
    guests: number
    invitations: number
    rsvps: number
    checkIns: number
    pendingSync: number
  }> {
    const db = await this.getDb()
    
    const countStore = async (storeName: string): Promise<number> => {
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readonly')
        const store = transaction.objectStore(storeName)
        const request = store.count()

        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(request.error)
      })
    }

    const [guests, invitations, rsvps, checkIns, pendingCheckIns] = await Promise.all([
      countStore('guests'),
      countStore('invitations'),
      countStore('rsvps'),
      countStore('checkIns'),
      this.getPendingCheckIns().then(items => items.length)
    ])

    return {
      guests,
      invitations,
      rsvps,
      checkIns,
      pendingSync: pendingCheckIns
    }
  }

  // ============================================================================
  // CONFLICT RESOLUTION
  // ============================================================================

  /**
   * Resolve conflict between local and remote data
   */
  resolveConflict<T extends { updatedAt: Date | string }>(
    local: T,
    remote: T,
    strategy: 'local_wins' | 'remote_wins' | 'latest_wins' = 'latest_wins'
  ): T {
    switch (strategy) {
      case 'local_wins':
        return local
      case 'remote_wins':
        return remote
      case 'latest_wins':
        const localTime = new Date(local.updatedAt).getTime()
        const remoteTime = new Date(remote.updatedAt).getTime()
        return localTime >= remoteTime ? local : remote
      default:
        return local
    }
  }

  /**
   * Merge fields from local and remote
   */
  mergeData<T extends Record<string, unknown>>(
    local: T,
    remote: T,
    localFields: (keyof T)[]
  ): T {
    const merged = { ...remote }
    for (const field of localFields) {
      if (local[field] !== undefined && local[field] !== null) {
        merged[field] = local[field]
      }
    }
    return merged
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let offlineDbInstance: OfflineDatabase | null = null

export function getOfflineDb(): OfflineDatabase {
  if (!offlineDbInstance) {
    offlineDbInstance = new OfflineDatabase()
  }
  return offlineDbInstance
}

export function initOfflineDb(config?: Partial<OfflineConfig>): OfflineDatabase {
  if (!offlineDbInstance) {
    offlineDbInstance = new OfflineDatabase(config)
  }
  return offlineDbInstance
}
