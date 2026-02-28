import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifySupabaseToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const authResult = await verifySupabaseToken(request)
  
  if (!authResult.authorized) {
    return authResult.response
  }

  if (authResult.role !== 'superadmin') {
    return NextResponse.json({ success: false, error: 'Acesso negado. Apenas superadmins.' }, { status: 403 })
  }

  try {
    // Fetch global stats using the service_role db (since superadmin sees all)
    // The verifySupabaseToken already validated the JWT and the profile role securely.
    
    // 1. Get all weddings with some relation counts
    const { data: weddings, error: weddingsError } = await db
      .from('Wedding')
      .select(`
        id,
        partner1Name,
        partner2Name,
        weddingDate,
        subscriptionTier,
        createdAt
      `)
      .order('createdAt', { ascending: false })

    if (weddingsError) throw weddingsError

    // 2. Get global guest count
    const { count: totalGuests, error: guestsError } = await db
      .from('Guest')
      .select('*', { count: 'exact', head: true })

    if (guestsError) throw guestsError
    
    // 3. Get total users
    const { count: totalUsers, error: usersError } = await db
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      
    if (usersError) throw usersError

    const stats = {
      totalWeddings: (weddings || []).length,
      totalCouples: totalUsers || 0, // Roughly speaking
      totalGuests: totalGuests || 0,
      activeSubscriptions: (weddings || []).filter(w => w.subscriptionTier !== 'free').length
    }

    return NextResponse.json({ 
      success: true, 
      stats,
      tenants: weddings 
    })
    
  } catch (error) {
    console.error('Error fetching admin platform stats:', error)
    return NextResponse.json({ success: false, error: 'Erro interno no servidor' }, { status: 500 })
  }
}
