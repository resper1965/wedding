import { NextRequest, NextResponse } from 'next/server'
import { getAuthDb } from '@/lib/db'
import { verifySupabaseToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  const authResult = await verifySupabaseToken(request)
  if (!authResult.authorized) {
    return authResult.response
  }

  try {
    const { partner1Name, partner2Name, weddingDate, venue } = await request.json()

    if (!partner1Name || !partner2Name || !weddingDate) {
      return NextResponse.json({ success: false, error: 'Dados incompletos' }, { status: 400 })
    }

    const authDb = await getAuthDb(request)

    // Create the wedding record
    // Because RLS for INSERT on Wedding allows it (public.get_user_wedding_ids isn't strictly blocking insert yet, 
    // but the DB trigger handles the WeddingUser mapping).
    // Let's explicitly insert and rely on the trigger we created in migration 006.
    
    // Note: If the trigger fails or RLS blocks it, we can fallback to service role for creation, 
    // but the trigger `handle_new_wedding` runs as SECURITY DEFINER and should work.
    
    // Actually, to be 100% safe bypassing RLS just for the initial creation and mapping, 
    // we can use the service role db here, because the user doesn't have access to the wedding UNTIL it's created.
    const { db } = await import('@/lib/db')
    
    const weddingId = crypto.randomUUID()
    
    const { data: newWedding, error: createError } = await db.from('Wedding')
      .insert({
        id: weddingId,
        partner1Name,
        partner2Name,
        weddingDate: new Date(weddingDate).toISOString(),
        venue: venue || null,
        subscriptionTier: 'free',
        isActive: true
      })
      .select()
      .single()

    if (createError) {
      console.error('Error creating wedding:', createError)
      return NextResponse.json({ success: false, error: 'Erro ao criar base do casamento' }, { status: 500 })
    }

    // Insert mapping manually if the trigger isn't active/did not run
    const { error: mappingError } = await db.from('WeddingUser')
      .insert({
        weddingId: weddingId,
        userId: authResult.uid,
        role: 'owner'
      })
      
    // Ignore duplicate key error if trigger already inserted it
    if (mappingError && !mappingError.message.includes('duplicate key')) {
      console.error('Error linking user to wedding:', mappingError)
      return NextResponse.json({ success: false, error: 'Erro ao vincular conta' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: newWedding })
  } catch (error) {
    console.error('Onboarding exception:', error)
    return NextResponse.json({ success: false, error: 'Erro interno no servidor' }, { status: 500 })
  }
}
