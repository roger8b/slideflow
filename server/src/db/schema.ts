import { sqliteTable, text, integer, blob } from 'drizzle-orm/sqlite-core'

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name'),
  googleId: text('google_id').unique(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
})

export const workspaces = sqliteTable('workspaces', {
  id: text('id').primaryKey(),
  ownerId: text('owner_id').notNull().references(() => users.id),
  name: text('name').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
})

// NOTE: `presentations` and `slides` are defined here for schema completeness and future use.
// No tRPC CRUD procedures for these tables are in scope for this spec (FA 001–FA 004).
export const presentations = sqliteTable('presentations', {
  id: text('id').primaryKey(),
  workspaceId: text('workspace_id').notNull().references(() => workspaces.id),
  title: text('title').notNull(),
  metadata: text('metadata'), // JSON blob (viewport, theme, etc.)
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
})

export const slides = sqliteTable('slides', {
  id: text('id').primaryKey(),
  workspaceId: text('workspace_id').notNull().references(() => workspaces.id),
  presentationId: text('presentation_id').notNull().references(() => presentations.id),
  position: integer('position').notNull(),
  layout: text('layout').notNull(), // Craft.js JSON string
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
})

export const brandKits = sqliteTable('brand_kits', {
  id: text('id').primaryKey(),
  workspaceId: text('workspace_id').notNull().references(() => workspaces.id),
  name: text('name').notNull(),
  tokens: text('tokens').notNull(), // JSON: { primary, secondary, fontHeading, fontBody }
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(false),
  embedding: blob('embedding'), // vector8 binary, dim=768 (text-embedding-004), stored for future RAG use
  embeddingModel: text('embedding_model').notNull().default('text-embedding-004'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
})

export const globalDefaults = sqliteTable('global_defaults', {
  id: text('id').primaryKey(),
  type: text('type').notNull(), // 'template' | 'theme'
  name: text('name').notNull(),
  data: text('data').notNull(), // JSON
})

// Per-workspace copies of global_defaults; populated by Onboarding_Worker on first login.
// Allows per-workspace customization of templates and themes without mutating global data.
export const workspaceDefaults = sqliteTable('workspace_defaults', {
  id: text('id').primaryKey(),
  workspaceId: text('workspace_id').notNull().references(() => workspaces.id),
  type: text('type').notNull(), // 'template' | 'theme'
  name: text('name').notNull(),
  data: text('data').notNull(), // JSON (may be customized per workspace)
})
