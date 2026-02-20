// Weather Service using Open-Meteo API (free, no API key required)
// https://open-meteo.com/

interface WeatherData {
  date: string
  tempMax: number
  tempMin: number
  precipitationProbability: number
  weatherCode: number
  condition: string
  icon: string
}

interface WeatherCache {
  data: WeatherData | null
  timestamp: number
  expiresAt: number
}

// Cache weather data for 1 hour
const CACHE_DURATION = 60 * 60 * 1000
const weatherCache: Map<string, WeatherCache> = new Map()

// Default coordinates for São Paulo
const DEFAULT_LATITUDE = -23.5505
const DEFAULT_LONGITUDE = -46.6333

// Weather code descriptions (WMO codes)
const getWeatherCondition = (code: number): { condition: string; icon: string } => {
  const conditions: Record<number, { condition: string; icon: string }> = {
    0: { condition: 'Céu limpo', icon: '☀️' },
    1: { condition: 'Principalmente limpo', icon: '🌤️' },
    2: { condition: 'Parcialmente nublado', icon: '⛅' },
    3: { condition: 'Nublado', icon: '☁️' },
    45: { condition: 'Neblina', icon: '🌫️' },
    48: { condition: 'Neblina com geada', icon: '🌫️' },
    51: { condition: 'Garoa leve', icon: '🌧️' },
    53: { condition: 'Garoa moderada', icon: '🌧️' },
    55: { condition: 'Garoa intensa', icon: '🌧️' },
    61: { condition: 'Chuva leve', icon: '🌧️' },
    63: { condition: 'Chuva moderada', icon: '🌧️' },
    65: { condition: 'Chuva forte', icon: '🌧️' },
    66: { condition: 'Chuva congelante leve', icon: '🌨️' },
    67: { condition: 'Chuva congelante forte', icon: '🌨️' },
    71: { condition: 'Neve leve', icon: '🌨️' },
    73: { condition: 'Neve moderada', icon: '🌨️' },
    75: { condition: 'Neve forte', icon: '❄️' },
    77: { condition: 'Granizo', icon: '🌨️' },
    80: { condition: 'Pancadas de chuva leves', icon: '🌦️' },
    81: { condition: 'Pancadas de chuva moderadas', icon: '🌦️' },
    82: { condition: 'Pancadas de chuva fortes', icon: '⛈️' },
    85: { condition: 'Pancadas de neve leves', icon: '🌨️' },
    86: { condition: 'Pancadas de neve fortes', icon: '🌨️' },
    95: { condition: 'Tempestade', icon: '⛈️' },
    96: { condition: 'Tempestade com granizo leve', icon: '⛈️' },
    99: { condition: 'Tempestade com granizo forte', icon: '⛈️' }
  }

  return conditions[code] || { condition: 'Desconhecido', icon: '❓' }
}

export async function getWeatherForecast(
  weddingDate: Date,
  latitude: number = DEFAULT_LATITUDE,
  longitude: number = DEFAULT_LONGITUDE
): Promise<WeatherData | null> {
  try {
    const cacheKey = `${latitude},${longitude},${weddingDate.toDateString()}`
    const cached = weatherCache.get(cacheKey)

    // Return cached data if still valid
    if (cached && cached.expiresAt > Date.now()) {
      return cached.data
    }

    // Format date for API
    const dateStr = weddingDate.toISOString().split('T')[0]
    
    // Calculate how many days in the future
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const daysDiff = Math.ceil((weddingDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    
    // Open-Meteo API URL
    const url = new URL('https://api.open-meteo.com/v1/forecast')
    url.searchParams.set('latitude', latitude.toString())
    url.searchParams.set('longitude', longitude.toString())
    url.searchParams.set('daily', 'temperature_2m_max,temperature_2m_min,precipitation_probability_max,weathercode')
    url.searchParams.set('timezone', 'America/Sao_Paulo')
    
    // For dates more than 16 days in the future, we need to use historical averages
    // Open-Meteo only supports 16-day forecasts
    if (daysDiff <= 16 && daysDiff >= 0) {
      url.searchParams.set('start_date', dateStr)
      url.searchParams.set('end_date', dateStr)
    } else {
      // For dates beyond the forecast range, use climatological data
      // We'll return average data for that month
      return getAverageWeatherForMonth(weddingDate.getMonth(), latitude, longitude)
    }

    const response = await fetch(url.toString(), {
      next: { revalidate: CACHE_DURATION / 1000 }
    })

    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`)
    }

    const data = await response.json()

    if (!data.daily || !data.daily.time || data.daily.time.length === 0) {
      return null
    }

    const weatherCode = data.daily.weathercode[0]
    const { condition, icon } = getWeatherCondition(weatherCode)

    const weatherData: WeatherData = {
      date: data.daily.time[0],
      tempMax: Math.round(data.daily.temperature_2m_max[0]),
      tempMin: Math.round(data.daily.temperature_2m_min[0]),
      precipitationProbability: data.daily.precipitation_probability_max[0] || 0,
      weatherCode,
      condition,
      icon
    }

    // Cache the result
    weatherCache.set(cacheKey, {
      data: weatherData,
      timestamp: Date.now(),
      expiresAt: Date.now() + CACHE_DURATION
    })

    return weatherData
  } catch (error) {
    console.error('Error fetching weather:', error)
    return null
  }
}

// Get average weather for a month based on historical data
async function getAverageWeatherForMonth(
  month: number,
  latitude: number,
  longitude: number
): Promise<WeatherData> {
  // São Paulo historical monthly averages
  const monthlyAverages: Record<number, { tempMax: number; tempMin: number; precipitation: number; condition: string; icon: string }> = {
    0: { tempMax: 28, tempMin: 19, precipitation: 40, condition: 'Verão - Possibilidade de chuva', icon: '🌤️' },
    1: { tempMax: 29, tempMin: 19, precipitation: 50, condition: 'Verão - Possibilidade de chuva', icon: '🌤️' },
    2: { tempMax: 28, tempMin: 18, precipitation: 45, condition: 'Final do verão', icon: '⛅' }, // March
    3: { tempMax: 26, tempMin: 16, precipitation: 35, condition: 'Outono', icon: '⛅' },
    4: { tempMax: 23, tempMin: 13, precipitation: 25, condition: 'Outono', icon: '⛅' },
    5: { tempMax: 22, tempMin: 12, precipitation: 20, condition: 'Início do inverno', icon: '⛅' },
    6: { tempMax: 21, tempMin: 11, precipitation: 15, condition: 'Inverno', icon: '⛅' },
    7: { tempMax: 22, tempMin: 11, precipitation: 15, condition: 'Inverno', icon: '☀️' },
    8: { tempMax: 23, tempMin: 13, precipitation: 25, condition: 'Primavera', icon: '⛅' },
    9: { tempMax: 24, tempMin: 15, precipitation: 35, condition: 'Primavera', icon: '⛅' },
    10: { tempMax: 26, tempMin: 16, precipitation: 40, condition: 'Primavera', icon: '⛅' },
    11: { tempMax: 27, tempMin: 18, precipitation: 45, condition: 'Início do verão', icon: '🌤️' }
  }

  const avg = monthlyAverages[month] || monthlyAverages[2] // Default to March if invalid

  return {
    date: '',
    tempMax: avg.tempMax,
    tempMin: avg.tempMin,
    precipitationProbability: avg.precipitation,
    weatherCode: 2, // Partially cloudy
    condition: avg.condition,
    icon: avg.icon
  }
}

export function isForecastAvailable(weddingDate: Date): boolean {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const daysDiff = Math.ceil((weddingDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  return daysDiff >= 0 && daysDiff <= 16
}

export type { WeatherData }
