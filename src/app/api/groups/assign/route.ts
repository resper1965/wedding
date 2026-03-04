export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { groupId, tableId } = body

    const { data: group, error } = await db.from('GuestGroup')
      .update({ tableId, updatedAt: new Date().toISOString() })
      .eq('id', groupId)
      .select('*, guests:Guest(*)').single()

    if (error) throw error
    return NextResponse.json({ success: true, data: group })
  } catch (error) {
    console.error('Error assigning group to table:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const groupId = searchParams.get('groupId')
    if (!groupId) return NextResponse.json({ success: false, error: 'groupId is required' }, { status: 400 })

    const { data: group, error } = await db.from('GuestGroup')
      .update({ tableId: null, updatedAt: new Date().toISOString() })
      .eq('id', groupId).select().single()

    if (error) throw error
    return NextResponse.json({ success: true, data: group })
  } catch (error) {
    console.error('Error removing group from table:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
