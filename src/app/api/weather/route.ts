export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getWeatherForecast } from '@/services/weather/weather-service'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const lat = searchParams.get('lat')
    const lon = searchParams.get('lon')

    const tenantId = request.headers.get('x-tenant-id')
    let wedding: any = null

    if (tenantId) {
      const { data } = await db.from('Wedding').select('venue, venueAddress, weddingDate').eq('id', tenantId).maybeSingle()
      wedding = data
    }

    let targetDate = new Date()
    if (wedding?.weddingDate) {
      targetDate = new Date(wedding.weddingDate)
    }

    const weather = await getWeatherForecast(
      targetDate,
      lat ? parseFloat(lat) : undefined,
      lon ? parseFloat(lon) : undefined
    )

    return NextResponse.json({ success: true, data: weather })
  } catch (error) {
    console.error('Weather error:', error)
    return NextResponse.json({ success: false, error: 'Erro ao buscar clima' }, { status: 500 })
  }
}
