export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { Pool } from 'pg'

export async function GET() {
  const pgUrl = process.env.POSTGRES_URL || ''
  const host = pgUrl.match(/@([^:/?]+)/)?.[1] || 'unknown'

  const pool = new Pool({
    connectionString: pgUrl,
    ssl: { rejectUnauthorized: false },
    max: 1,
  })

  try {
    const res = await pool.query('SELECT now(), current_database()')
    await pool.end()
    return NextResponse.json({ ok: true, host, row: res.rows[0] })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    await pool.end().catch(() => {})
    return NextResponse.json({ ok: false, host, error: msg }, { status: 500 })
  }
}
