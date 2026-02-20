/**
 * ============================================================================
 * TABLES API - Wedding Guest Platform
 * ============================================================================
 * API endpoint for table management
 * ============================================================================
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

/**
 * GET /api/tables - List all tables
 */
export async function GET(request: NextRequest) {
  try {
    const wedding = await db.wedding.findFirst()
    
    if (!wedding) {
      return NextResponse.json(
        { success: false, error: 'Wedding not found' },
        { status: 404 }
      )
    }

    const tables = await db.table.findMany({
      where: { weddingId: wedding.id },
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
      },
      orderBy: { name: 'asc' }
    })

    // Get unassigned groups
    const unassignedGroups = await db.guestGroup.findMany({
      where: {
        weddingId: wedding.id,
        tableId: null
      },
      include: {
        guests: {
          include: {
            rsvps: {
              where: { status: 'confirmed' },
              select: { id: true, status: true }
            }
          }
        }
      },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json({
      success: true,
      data: {
        tables: tables.map(table => ({
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
        })),
        unassignedGroups: unassignedGroups.map(group => ({
          id: group.id,
          name: group.name,
          guests: group.guests.map(g => ({
            id: g.id,
            firstName: g.firstName,
            lastName: g.lastName,
            confirmed: g.rsvps.length > 0
          }))
        }))
      }
    })
  } catch (error) {
    console.error('Error fetching tables:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/tables - Create new table
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, capacity, shape } = body

    const wedding = await db.wedding.findFirst()
    
    if (!wedding) {
      return NextResponse.json(
        { success: false, error: 'Wedding not found' },
        { status: 404 }
      )
    }

    const table = await db.table.create({
      data: {
        weddingId: wedding.id,
        name: name || `Mesa ${await db.table.count({ where: { weddingId: wedding.id } }) + 1}`,
        capacity: capacity || 8,
        shape: shape || 'round'
      }
    })

    return NextResponse.json({
      success: true,
      data: table
    })
  } catch (error) {
    console.error('Error creating table:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/tables - Update table positions (bulk)
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { tables } = body as { tables: Array<{ id: string; positionX: number; positionY: number }> }

    // Update positions in parallel
    await Promise.all(
      tables.map(table =>
        db.table.update({
          where: { id: table.id },
          data: {
            positionX: table.positionX,
            positionY: table.positionY
          }
        })
      )
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating table positions:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
