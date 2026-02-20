/**
 * ============================================================================
 * NEXT-AUTH TYPE EXTENSIONS
 * ============================================================================
 * 
 * Extends the default NextAuth types to include user.id
 * This fixes the TypeScript error: Property 'id' does not exist on type...
 * ============================================================================
 */

import NextAuth from 'next-auth'

declare module 'next-auth' {
  /**
   * Extended session interface
   */
  interface Session {
    user: {
      /** The user's unique identifier */
      id: string
      /** The user's name */
      name?: string | null
      /** The user's email address */
      email?: string | null
      /** The user's avatar image URL */
      image?: string | null
    }
  }

  /**
   * Extended user interface
   */
  interface User {
    /** The user's unique identifier */
    id: string
  }
}

declare module 'next-auth/jwt' {
  /**
   * Extended JWT interface
   */
  interface JWT {
    /** The user's unique identifier */
    id: string
  }
}
