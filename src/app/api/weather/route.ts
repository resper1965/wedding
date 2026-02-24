import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { WeatherService } from '@/services/weather/weather-service'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const lat = searchParams.get('lat')
    const lon = searchParams.get('lon')

    const { data: wedding } = await db.from('Wedding').select('venue, venueAddress, weddingDate').limit(1).maybeSingle()

    const weatherService = new WeatherService()
    const weather = await weatherService.getWeather({
      lat: lat ? parseFloat(lat) : undefined,
      lon: lon ? parseFloat(lon) : undefined,
      venue: wedding?.venue || undefined,
      date: wedding?.weddingDate || undefined,
    })

    return NextResponse.json({ success: true, data: weather })
  } catch (error) {
    console.error('Weather error:', error)
    return NextResponse.json({ success: false, error: 'Erro ao buscar clima' }, { status: 500 })
  }
}
