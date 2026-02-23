import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  const dbUrl = process.env.DATABASE_URL || ''
  const host = dbUrl.match(/@([^:/?]+)/)?.[1] || 'unknown'
  const port = dbUrl.match(/:(\d+)\//)?.[1] || 'unknown'
  const hasParams = dbUrl.includes('?')

  try {
    const res = await db.$queryRaw<Array<{now: Date}>>`SELECT now()`
    return NextResponse.json({ ok: true, host, port, hasParams, time: res[0]?.now })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ ok: false, host, port, hasParams, error: msg }, { status: 500 })
  }
}
