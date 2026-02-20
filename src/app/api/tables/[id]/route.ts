/**
 * ============================================================================
 * SINGLE TABLE API - Wedding Guest Platform
 * ============================================================================
 * API endpoint for individual table operations
 * ============================================================================
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * GET /api/tables/[id] - Get single table
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    const table = await db.table.findUnique({
      where: { id },
      include: {
        groups: {
          include: {
            guests: {
              include: {
                rsvps: {
                  where: { status: 'confirmed' },
                  select: { id: true, status: true }
                }
              }
            }
          }
        }
      }
    })

    if (!table) {
      return NextResponse.json(
        { success: false, error: 'Table not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        id: table.id,
        name: table.name,
        capacity: table.capacity,
        shape: table.shape,
        positionX: table.positionX,
        positionY: table.positionY,
        notes: table.notes,
        groups: table.groups.map(group => ({
          id: group.id,
          name: group.name,
          guests: group.guests.map(g => ({
            id: g.id,
            firstName: g.firstName,
            lastName: g.lastName,
            confirmed: g.rsvps.length > 0
          }))
        })),
        occupiedSeats: table.groups.reduce(
          (acc, g) => acc + g.guests.filter(guest => guest.rsvps.length > 0).length,
          0
        )
      }
    })
  } catch (error) {
    console.error('Error fetching table:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/tables/[id] - Update table
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, capacity, shape, positionX, positionY, notes } = body

    const table = await db.table.update({
      where: { id },
      data: {
        name,
        capacity,
        shape,
        positionX,
        positionY,
        notes
      }
    })

    return NextResponse.json({
      success: true,
      data: table
    })
  } catch (error) {
    console.error('Error updating table:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/tables/[id] - Delete table
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    // Remove table assignment from groups
    await db.guestGroup.updateMany({
      where: { tableId: id },
      data: { tableId: null }
    })

    // Delete table
    await db.table.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting table:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
