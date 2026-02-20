/**
 * ============================================================================
 * GROUP ASSIGN API - Wedding Guest Platform
 * ============================================================================
 * API endpoint for assigning groups to tables
 * ============================================================================
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

/**
 * POST /api/groups/assign - Assign group to table
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { groupId, tableId } = body

    // Update group with table assignment
    const group = await db.guestGroup.update({
      where: { id: groupId },
      data: { tableId },
      include: {
        guests: true
      }
    })

    return NextResponse.json({
      success: true,
      data: group
    })
  } catch (error) {
    console.error('Error assigning group to table:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/groups/assign - Remove group from table
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const groupId = searchParams.get('groupId')

    if (!groupId) {
      return NextResponse.json(
        { success: false, error: 'groupId is required' },
        { status: 400 }
      )
    }

    // Remove table assignment
    const group = await db.guestGroup.update({
      where: { id: groupId },
      data: { tableId: null }
    })

    return NextResponse.json({
      success: true,
      data: group
    })
  } catch (error) {
    console.error('Error removing group from table:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
