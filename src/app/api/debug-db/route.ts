import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  const pgUrl = process.env.POSTGRES_URL || ''
  const host = pgUrl.match(/@([^:/?]+)/)?.[1] || 'unknown'
  const port = pgUrl.match(/:(\d+)\//)?.[1] || 'unknown'
  const params = pgUrl.split('?')[1] || 'none'

  try {
    const res = await db.$queryRaw<Array<{now: Date}>>`SELECT now()`
    return NextResponse.json({ ok: true, host, port, params, time: res[0]?.now })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ ok: false, host, port, params, error: msg }, { status: 500 })
  }
}
