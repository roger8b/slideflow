import { drizzle } from 'drizzle-orm/libsql'
import { createClient } from '@libsql/client'

const url = process.env.DATABASE_URL

if (!url) {
  console.error('❌ DATABASE_URL environment variable is required')
  console.error('   Set it to "file:local.db" for development or "libsql://...turso.io" for production')
  process.exit(1)
}

export const db = drizzle(createClient({ url }))
