import { migrate } from 'drizzle-orm/libsql/migrator'
import { db } from './client'

export async function runMigrations() {
  try {
    console.log('🔄 Running database migrations...')
    await migrate(db, { migrationsFolder: './drizzle' })
    console.log('✅ Migrations completed successfully')
  } catch (error) {
    console.error('❌ Migration failed:', error)
    console.error('   Database schema could not be applied')
    process.exit(1)
  }
}
