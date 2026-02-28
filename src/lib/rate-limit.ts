import { NextRequest } from 'next/server'

interface RateLimiterOptions {
  limit?: number
  windowMs?: number
}

// Simple in-memory rate limiter for single-instance Next.js deployments
// For distributed environments, use Redis (e.g., Upstash) instead
const ipRequestCounts = new Map<string, { count: number; timestamp: number }>()

export function checkRateLimit(request: NextRequest, options: RateLimiterOptions = {}) {
  const limit = options.limit || 10
  const windowMs = options.windowMs || 60 * 1000 // 1 minute default
  
  // Try to get IP from headers (works on Vercel)
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
             request.headers.get('x-real-ip') || 
             'anonymous'
             
  const now = Date.now()
  const record = ipRequestCounts.get(ip)

  if (!record) {
    // Cleanup old records to prevent memory leak
    if (ipRequestCounts.size > 10000) ipRequestCounts.clear()
    
    ipRequestCounts.set(ip, { count: 1, timestamp: now })
    return { success: true, remaining: limit - 1 }
  }

  if (now - record.timestamp > windowMs) {
    // Reset window
    ipRequestCounts.set(ip, { count: 1, timestamp: now })
    return { success: true, remaining: limit - 1 }
  }

  if (record.count >= limit) {
    return { success: false, remaining: 0 }
  }

  record.count += 1
  return { success: true, remaining: limit - record.count }
}
