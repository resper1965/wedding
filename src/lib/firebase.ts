/**
 * ============================================================================
 * FIRESTORE OFFLINE-FIRST SDK CONFIGURATION
 * ============================================================================
 * 
 * Configuração do Firebase SDK para uso no frontend (Next.js)
 * Com suporte a offline-first usando cache nativo do Firestore
 * ============================================================================
 */

import { initializeApp, FirebaseApp } from 'firebase/app'
import { 
  Firestore, 
  getFirestore
} from 'firebase/firestore'
import { Auth, getAuth } from 'firebase/auth'
import { Functions, getFunctions } from 'firebase/functions'
import { FirebaseStorage, getStorage } from 'firebase/storage'

// ============================================================================
// FIREBASE CONFIGURATION
// ============================================================================

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
}

// ============================================================================
// SINGLETON PATTERN
// ============================================================================

let app: FirebaseApp | null = null
let firestore: Firestore | null = null
let auth: Auth | null = null
let functions: Functions | null = null
let storage: FirebaseStorage | null = null

/**
 * Get Firebase App instance (singleton)
 */
export function getFirebaseApp(): FirebaseApp {
  if (!app) {
    app = initializeApp(firebaseConfig)
  }
  return app
}

/**
 * Get Firestore instance - offline persistence is enabled by default in Firebase v9+
 */
export function getFirebaseFirestore(): Firestore {
  if (!firestore) {
    const app = getFirebaseApp()
    // In Firebase v9+, offline persistence is enabled by default
    firestore = getFirestore(app)
  }
  
  return firestore
}

/**
 * Get Auth instance
 */
export function getFirebaseAuth(): Auth {
  if (!auth) {
    const app = getFirebaseApp()
    auth = getAuth(app)
  }
  return auth
}

/**
 * Get Functions instance
 */
export function getFirebaseFunctions(): Functions {
  if (!functions) {
    const app = getFirebaseApp()
    functions = getFunctions(app, 'southamerica-east1')
  }
  return functions
}

/**
 * Get Storage instance
 */
export function getFirebaseStorage(): FirebaseStorage {
  if (!storage) {
    const app = getFirebaseApp()
    storage = getStorage(app)
  }
  return storage
}

// ============================================================================
// EXPORTS
// ============================================================================

export const db = getFirebaseFirestore
export const firebaseAuth = getFirebaseAuth
export const firebaseFunctions = getFirebaseFunctions
export const firebaseStorage = getFirebaseStorage
