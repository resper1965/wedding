'use client'

import { useState, useEffect, useSyncExternalStore } from 'react'
import { motion } from 'framer-motion'
import { Heart } from 'lucide-react'

interface CountdownTimerProps {
  targetDate: Date
  className?: string
}

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

function useMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )
}

function usePrefersReducedMotion() {
  return useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
      mq.addEventListener('change', cb)
      return () => mq.removeEventListener('change', cb)
    },
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    () => false
  )
}

export function CountdownTimer({ targetDate, className = '' }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const [isPast, setIsPast] = useState(false)
  const mounted = useMounted()
  const reducedMotion = usePrefersReducedMotion()

  useEffect(() => {
    const updateTimer = () => {
      const difference = targetDate.getTime() - new Date().getTime()

      if (difference <= 0) {
        setIsPast(true)
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
        return
      }

      setIsPast(false)
      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      })
    }

    updateTimer()
    const timer = setInterval(updateTimer, 1000)
    return () => clearInterval(timer)
  }, [targetDate])

  // Celebratory state when date has passed
  if (mounted && isPast) {
    return (
      <div className={`flex flex-col items-center gap-2 ${className}`}>
        <Heart className="h-8 w-8 text-rose-400 animate-pulse" fill="currentColor" />
        <p className="text-lg font-medium text-amber-800">O grande dia chegou!</p>
        <p className="text-sm text-accent/80">Louise &amp; Nicolas 💕</p>
      </div>
    )
  }

  const timeUnits = [
    { value: timeLeft.days, label: 'Dias' },
    { value: timeLeft.hours, label: 'Horas' },
    { value: timeLeft.minutes, label: 'Min' },
    { value: timeLeft.seconds, label: 'Seg' }
  ]

  if (!mounted) {
    return (
      <div className={`flex items-center gap-3 sm:gap-4 ${className}`}>
        {timeUnits.map((unit) => (
          <div key={unit.label} className="text-center">
            <div className="text-3xl font-light text-amber-800 sm:text-4xl">00</div>
            <div className="text-xs text-accent">{unit.label}</div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-3 sm:gap-4 ${className}`}>
      {timeUnits.map((unit, index) => (
        <div key={unit.label} className="relative text-center">
          <motion.div
            key={`${unit.label}-${unit.value}`}
            initial={reducedMotion ? false : { scale: 1.05, opacity: 0.8 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="relative"
          >
            <div className="relative">
              <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-amber-200/30 to-orange-200/30 blur-sm" />
              <div className="relative text-3xl font-light tracking-tight text-amber-800 sm:text-4xl">
                {String(unit.value).padStart(2, '0')}
              </div>
            </div>
          </motion.div>
          <div className="mt-1 text-xs font-medium uppercase tracking-wider text-accent/80">
            {unit.label}
          </div>
          {index < timeUnits.length - 1 && (
            <div className="absolute -right-2 top-1/2 hidden h-1 w-1 -translate-y-1/2 rounded-full bg-amber-300/50 sm:block" />
          )}
        </div>
      ))}
    </div>
  )
}
