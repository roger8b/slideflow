import { db } from './client'
import { users } from './schema'

/**
 * Example of concurrent write transaction using libSQL's MVCC support.
 * 
 * libSQL automatically uses BEGIN CONCURRENT for transactions when multiple
 * writes occur simultaneously, preventing "Database Locked" errors.
 * 
 * This is a demonstration file - not used in production code.
 */
export async function exampleConcurrentWrite() {
  await db.transaction(async (tx) => {
    // This transaction will use BEGIN CONCURRENT automatically
    await tx.insert(users).values({
      id: crypto.randomUUID(),
      email: 'example@test.com',
      createdAt: new Date(),
    })
  })
}
