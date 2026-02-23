import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  // POSTGRES_URL uses Supabase pooler (port 6543) — accessible from Vercel
  // The pooler uses SSL with self-signed cert chain, so rejectUnauthorized must be false
  const connectionString = process.env.POSTGRES_URL!
  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }, // Supabase pooler uses self-signed cert
    max: 1, // important for serverless
  })
  const adapter = new PrismaPg(pool)
  return new PrismaClient({ adapter })
}

export const db = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db