import { z } from 'zod'
import { publicProcedure } from '../trpc.js'
import { db } from '../../db/client.js'
import { brandKits } from '../../db/schema.js'
import { eq, and } from 'drizzle-orm'
import { randomUUID } from 'crypto'

/**
 * Brand Kit tRPC procedures: create, list, delete, setActive, migrate.
 * All procedures scoped to authenticated workspace_id from tRPC context.
 */

const brandTokensSchema = z.object({
  primary: z.string(),
  secondary: z.string(),
  fontHeading: z.string(),
  fontBody: z.string(),
})

// create mutation
export const createBrandKit = publicProcedure
  .input(
    z.object({
      name: z.string().min(1).max(100),
      tokens: brandTokensSchema,
    })
  )
  .mutation(async ({ input, ctx }) => {
    if (!ctx.workspaceId) {
      throw new Error('Unauthorized')
    }

    const id = randomUUID()
    await db.insert(brandKits).values({
      id,
      workspaceId: ctx.workspaceId,
      name: input.name,
      tokens: JSON.stringify(input.tokens),
      embedding: null,
      embeddingModel: 'text-embedding-004',
      createdAt: new Date(),
    } as any)

    return { id }
  })

// list query
export const listBrandKits = publicProcedure.query(async ({ ctx }) => {
  if (!ctx.workspaceId) {
    throw new Error('Unauthorized')
  }

  const kits = await db
    .select()
    .from(brandKits)
    .where(eq(brandKits.workspaceId, ctx.workspaceId))

  return kits.map((kit) => ({
    id: kit.id,
    name: kit.name,
    tokens: JSON.parse(kit.tokens),
    isActive: kit.isActive,
    createdAt: kit.createdAt,
  }))
})

// delete mutation
export const deleteBrandKit = publicProcedure
  .input(z.object({ id: z.string() }))
  .mutation(async ({ input, ctx }) => {
    if (!ctx.workspaceId) {
      throw new Error('Unauthorized')
    }

    await db
      .delete(brandKits)
      .where(and(eq(brandKits.id, input.id), eq(brandKits.workspaceId, ctx.workspaceId)))

    return { success: true }
  })

// setActive mutation
export const setActiveBrandKit = publicProcedure
  .input(z.object({ id: z.string() }))
  .mutation(async ({ input, ctx }) => {
    if (!ctx.workspaceId) {
      throw new Error('Unauthorized')
    }

    // Transaction: set all to inactive, then set chosen to active
    await db.transaction(async (tx) => {
      // Set all to inactive
      await tx
        .update(brandKits)
        .set({ isActive: false } as any)
        .where(eq(brandKits.workspaceId, ctx.workspaceId!))

      // Set chosen to active
      await tx
        .update(brandKits)
        .set({ isActive: true } as any)
        .where(and(eq(brandKits.id, input.id), eq(brandKits.workspaceId, ctx.workspaceId!)))
    })

    return { success: true }
  })

// migrate mutation (idempotent)
export const migrateBrandKits = publicProcedure
  .input(
    z.object({
      kits: z.array(
        z.object({
          name: z.string(),
          tokens: brandTokensSchema,
        })
      ),
    })
  )
  .mutation(async ({ input, ctx }) => {
    if (!ctx.workspaceId) {
      throw new Error('Unauthorized')
    }

    // Get existing kit names for this workspace
    const existingKits = await db
      .select({ name: brandKits.name })
      .from(brandKits)
      .where(eq(brandKits.workspaceId, ctx.workspaceId))

    const existingNames = new Set(existingKits.map((k) => k.name))

    // Filter out kits that already exist
    const newKits = input.kits.filter((kit) => !existingNames.has(kit.name))

    if (newKits.length === 0) {
      return { migrated: 0 }
    }

    // Bulk insert new kits
    await db.insert(brandKits).values(
      newKits.map((kit) => ({
        id: randomUUID(),
        workspaceId: ctx.workspaceId!,
        name: kit.name,
        tokens: JSON.stringify(kit.tokens),
        embedding: null,
        embeddingModel: 'text-embedding-004',
        createdAt: new Date(),
      } as any))
    )

    return { migrated: newKits.length }
  })
