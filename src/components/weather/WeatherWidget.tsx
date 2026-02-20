'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Cloud, Sun, CloudRain, Thermometer, Droplets, Calendar, Loader2, MapPin } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface WeatherData {
  available: boolean
  isForecast: boolean
  weddingDate: string
  venue: string | null
  date: string
  tempMax: number
  tempMin: number
  precipitationProbability: number
  weatherCode: number
  condition: string
  icon: string
  message: string
}

export function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchWeather()
  }, [])

  const fetchWeather = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/weather')
      const result = await response.json()
      if (result.success) {
        setWeather(result.data)
      } else {
        setError(result.error || 'Erro ao carregar previsão')
      }
    } catch (err) {
      setError('Erro ao carregar previsão do tempo')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    })
  }

  const formatWeddingDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  // Loading state
  if (loading) {
    return (
      <Card className="overflow-hidden border-amber-200 bg-gradient-to-br from-amber-50 to-rose-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
          </div>
        </CardContent>
      </Card>
    )
  }

  // Error state
  if (error) {
    return (
      <Card className="overflow-hidden border-rose-200 bg-rose-50">
        <CardContent className="p-6">
          <div className="text-center text-rose-600">
            <CloudRain className="w-8 h-8 mx-auto mb-2" />
            <p>{error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // No weather data
  if (!weather || !weather.available) {
    return (
      <Card className="overflow-hidden border-stone-200 bg-stone-50">
        <CardContent className="p-6">
          <div className="text-center text-stone-500">
            <Cloud className="w-8 h-8 mx-auto mb-2" />
            <p>Previsão não disponível</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Determine background gradient based on weather
  const getBackgroundGradient = () => {
    if (weather.precipitationProbability > 50) {
      return 'from-slate-100 to-blue-100 border-slate-200'
    }
    if (weather.weatherCode <= 2) {
      return 'from-amber-50 to-orange-50 border-amber-200'
    }
    return 'from-sky-50 to-slate-100 border-sky-200'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={`overflow-hidden border bg-gradient-to-br ${getBackgroundGradient()}`}>
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 text-stone-500 mb-1">
                <Calendar className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {formatWeddingDate(weather.weddingDate)}
                </span>
              </div>
              {weather.venue && (
                <div className="flex items-center gap-2 text-stone-400">
                  <MapPin className="w-3.5 h-3.5" />
                  <span className="text-xs">{weather.venue}</span>
                </div>
              )}
            </div>
            <Badge
              variant={weather.isForecast ? 'default' : 'outline'}
              className={weather.isForecast
                ? 'bg-amber-500 text-white'
                : 'border-stone-300 text-stone-500'
              }
            >
              {weather.isForecast ? 'Previsão' : 'Média Histórica'}
            </Badge>
          </div>

          {/* Main Weather Display */}
          <div className="flex items-center gap-6">
            {/* Icon & Temp */}
            <div className="flex items-center">
              <span className="text-6xl">{weather.icon}</span>
              <div className="ml-3">
                <div className="text-4xl font-light text-stone-800">
                  {weather.tempMax}°
                </div>
                <div className="text-sm text-stone-500">
                  mín {weather.tempMin}°
                </div>
              </div>
            </div>

            {/* Condition */}
            <div className="flex-1">
              <p className="text-lg font-medium text-stone-800">
                {weather.condition}
              </p>
              <p className="text-sm text-stone-500 mt-1">
                {weather.message}
              </p>
            </div>
          </div>

          {/* Precipitation */}
          <div className="mt-4 pt-4 border-t border-stone-200/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Droplets className="w-4 h-4 text-blue-500" />
                <span className="text-sm text-stone-600">Chance de chuva</span>
              </div>
              <span className={`text-sm font-medium ${
                weather.precipitationProbability > 50
                  ? 'text-blue-600'
                  : 'text-stone-600'
              }`}>
                {weather.precipitationProbability}%
              </span>
            </div>

            {/* Precipitation bar */}
            <div className="mt-2 h-2 bg-stone-200 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${weather.precipitationProbability}%` }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className={`h-full rounded-full ${
                  weather.precipitationProbability > 50
                    ? 'bg-blue-500'
                    : 'bg-blue-300'
                }`}
              />
            </div>
          </div>

          {/* Info Message */}
          {!weather.isForecast && (
            <div className="mt-4 p-3 bg-amber-100/50 border border-amber-200 rounded-lg">
              <p className="text-xs text-amber-700">
                💡 A data do casamento está distante. Mostramos a média histórica para esta época do ano em São Paulo.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
