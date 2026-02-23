import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  const url = process.env.DATABASE_URL || 'NOT SET'
  // Mask password for security
  const maskedUrl = url.replace(/:([^@]+)@/, ':***@')
  
  try {
    // Try a simple raw query
    const result = await db.$queryRaw`SELECT current_database(), version()`
    return NextResponse.json({
      url: maskedUrl,
      db: result,
      env: {
        POSTGRES_HOST: process.env.POSTGRES_HOST,
        NODE_ENV: process.env.NODE_ENV
      }
    })
  } catch (err) {
    return NextResponse.json({
      url: maskedUrl,
      error: err instanceof Error ? err.message : String(err)
    })
  }
}
