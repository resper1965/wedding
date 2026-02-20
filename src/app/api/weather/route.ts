import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getWeatherForecast, isForecastAvailable } from '@/services/weather/weather-service'

// GET - Get weather forecast for wedding date
export async function GET() {
  try {
    const wedding = await db.wedding.findFirst()

    if (!wedding) {
      return NextResponse.json({ success: false, error: 'Nenhum casamento encontrado' }, { status: 404 })
    }

    // Get weather for wedding date
    // Using São Paulo coordinates as default for Espaço Jardim Secreto
    const weather = await getWeatherForecast(wedding.weddingDate)

    if (!weather) {
      return NextResponse.json({
        success: true,
        data: {
          available: false,
          weddingDate: wedding.weddingDate,
          venue: wedding.venue,
          message: 'Previsão não disponível para esta data'
        }
      })
    }

    const isForecast = isForecastAvailable(wedding.weddingDate)

    return NextResponse.json({
      success: true,
      data: {
        available: true,
        isForecast,
        weddingDate: wedding.weddingDate,
        venue: wedding.venue,
        ...weather,
        message: isForecast
          ? 'Previsão para o dia do casamento'
          : 'Média histórica para esta época do ano'
      }
    })
  } catch (error) {
    console.error('Error fetching weather:', error)
    return NextResponse.json({ success: false, error: 'Erro ao carregar previsão do tempo' }, { status: 500 })
  }
}
