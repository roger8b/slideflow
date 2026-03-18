# Implementation Plan: slideflow-backend

## Overview

Four-phase migration from browser-side Gemini calls to a Bun + Hono backend with tRPC SSE
streaming, Google ADK multi-agent orchestration, Turso vector RAG, and production hardening.
Tasks are ordered so each step integrates cleanly into the previous one — no orphaned code.

## Tasks

- [ ] 1. FA 001 — Core backend setup
  - [ ] 1.1 Scaffold `server/` directory and install dependencies
    - Create `server/package.json` with Bun runtime, Hono, tRPC v11, drizzle-orm, @libsql/client, zod
    - Create `server/tsconfig.json` extending root, path alias `@/` → `server/src/`
    - Create `server/src/index.ts` with minimal Hono app that binds to `127.0.0.1:3000`
    - _Requirements: 1.1_

  - [ ] 1.2 Implement `server/src/db/client.ts` with DATABASE_URL abstraction
    - Read `DATABASE_URL` from `process.env`; log descriptive error and `process.exit(1)` if absent
    - Construct `drizzle(createClient({ url }))` — no hardcoded file paths
    - Export `db` for use by all other modules
    - _Requirements: 1.3, 1.4, 2.4_

  - [ ] 1.3 Define Drizzle schema in `server/src/db/schema.ts`
    - Define tables: `users`, `workspaces`, `presentations`, `slides`, `brand_kits`, `global_defaults`, `workspace_defaults`
    - Add `workspace_id` FK (non-null, references `workspaces.id`) on `presentations`, `slides`, `brand_kits`, `workspace_defaults`
    - `workspace_defaults` mirrors `global_defaults` columns (type, name, data) plus `workspace_id`; populated by Onboarding_Worker
    - `brand_kits` SHALL include: `is_active` (boolean, default false), `blob('embedding')` (vector8, dim=768, nullable), `embedding_model` (text, default 'text-embedding-004')
    - Note: `presentations` and `slides` tables are defined for future use; no tRPC procedures for them in this spec
    - _Requirements: 2.1, 2.2, 6.1, 6.6_

  - [ ]* 1.4 Write property test for schema tenant isolation (P1)
    - **Property 1: Tenant-scoped tables always carry workspace_id**
    - **Validates: Requirements 2.2**
    - File: `server/src/__tests__/schema.test.ts`
    - Inspect Drizzle table definitions programmatically; assert `workspace_id` column present and non-null on all tenant tables

  - [ ] 1.5 Wire migrations into startup and handle migration failure
    - Call `drizzle-kit push` (or `migrate()`) before the server accepts requests
    - On migration failure: log error and `process.exit(1)`
    - _Requirements: 2.5_

  - [ ] 1.6 Remove `GEMINI_API_KEY` from `vite.config.ts`
    - Delete the `define` block entry for `process.env.GEMINI_API_KEY`
    - _Requirements: 1.5, 9.5_

  - [ ]* 1.7 Write unit tests for fatal startup errors
    - File: `server/src/__tests__/startup.test.ts`
    - Test: missing `DATABASE_URL` → `process.exit(1)` with descriptive log
    - Test: migration failure → `process.exit(1)` before server binds
    - _Requirements: 1.4, 2.5_

  - [ ] 1.8 Create `server/README.md` with local-only feature documentation
    - Document the three local-only features: AEGIS encryption, `BEGIN CONCURRENT`, `chmod 600`
    - Document their Turso Cloud equivalents and the migration trigger threshold (500 active users OR 10 GB `.db`)
    - Document the `DATABASE_URL` env var convention: `file:local.db` for dev, `libsql://...turso.io` for prod
    - _Requirements: 2.7_

  - [ ] 1.9 Add CORS middleware to Hono server
    - Install `@hono/cors` (or use Hono built-in `cors()`)
    - Mount `app.use(cors({ origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173' }))` as the first middleware in `server/src/index.ts`, before all route handlers
    - Document `CORS_ORIGIN` env var in `server/README.md`
    - _Requirements: 1.6_

- [ ] 2. Checkpoint — FA 001 complete
  - Ensure `bun run dev` starts the server on `127.0.0.1:3000`, DB opens, migrations run.
  - Ensure `npm run lint` passes on the frontend (no broken imports from vite.config.ts change).
  - Verify `BEGIN CONCURRENT` is used in at least one write transaction (MVCC active).
  - Ask the user if questions arise before proceeding to FA 002.

- [ ] 3. FA 002 — ADK pipeline + tRPC SSE streaming
  - [ ] 3.1 Implement Canvas_Schema and CraftJson Zod types
    - Create `server/src/schemas/canvas.ts`: Zod schema enforcing x/y ≤ 960/540, width/height ≤ 960/540, all values ≥ 0
    - Create `server/src/schemas/craftJson.ts`: Zod types for CraftNode (id, type, props, nodes, linkedNodes)
    - _Requirements: 4.1_

  - [ ]* 3.2 Write property test for Canvas_Schema bounds validation (P3)
    - **Property 3: Canvas_Schema rejects out-of-bounds layouts**
    - **Validates: Requirements 4.1**
    - File: `server/src/__tests__/canvas.test.ts`
    - Use `fc.record({ x, y, width, height })` with out-of-bounds values; assert Zod returns error
    - Use in-bounds values; assert Zod returns success
    - Minimum 100 iterations

  - [ ] 3.3 Implement ADK agent modules
    - Create `server/src/agents/starter.ts`: LlmAgent that writes `macro_nodes` to `session.state`
    - Create `server/src/agents/writer.ts`: LlmAgent that reads `macro_nodes`, queries Brand Kit RAG, writes `enriched_content`
    - Create `server/src/agents/designer.ts`: LlmAgent that converts `enriched_content[current_slide_index]` to CraftJson for one slide; assigns each node `id = crypto.randomUUID()`; wraps Gemini call in `Promise.race([call, timeout(LLM_CALL_TIMEOUT_MS)])` — on timeout, throws error treated as iteration failure
    - Create `server/src/agents/reviewer.ts`: pure TypeScript validation function (NOT an LlmAgent); runs `canvasSchema.safeParse(craftJson)`; on failure writes `zod_errors` to session state and sets `valid = false`; on success sets `valid = true`; no LLM call
    - Create `server/src/agents/stopChecker.ts`: ADK StopChecker returning `true` when `session.state['valid'] === true`
    - _Requirements: 3.2, 3.3, 3.4, 4.2, 4.3, 4.4, 4.6_

  - [ ] 3.4 Assemble pipeline in `server/src/agents/pipeline.ts`
    - Compose: SequentialAgent → [Starter_Agent, Writer_Agent], then TypeScript SlideLoopAgent iterating over `enriched_content[]`
    - SlideLoopAgent: for each slide, sets `current_slide_index`, resets `valid`/`zod_errors`, runs LoopAgent(maxIterations: 3, [Designer_Agent, Reviewer_Agent]), appends result to `craft_jsons[]`, emits `slide_complete` SSE event
    - Wire ADK `before_agent_callback` / `after_agent_callback` hooks to emit `progress` SSE events into the AsyncGenerator
    - Export `runPipeline(prompt, workspaceId, signal: AbortSignal): AsyncGenerator<SSEEvent>`
    - _Requirements: 3.1, 3.2, 3.4, 3.5, 4.4, 4.5_

  - [ ]* 3.5 Write property test for Starter_Agent session state (P2)
    - **Property 2: Session state contains macro_nodes after Starter_Agent**
    - **Validates: Requirements 3.3, 3.2**
    - File: `server/src/__tests__/pipeline.test.ts`
    - Use `fc.string()` for prompts; assert `session.state['macro_nodes']` is non-empty array after Starter_Agent
    - Minimum 100 iterations

  - [ ]* 3.6 Write property tests for LoopAgent circuit breaker (P4, P5)
    - **Property 4: Validation failure triggers retry with Zod error context**
    - **Property 5: Circuit breaker terminates loop after 3 consecutive failures**
    - **Validates: Requirements 4.2, 4.3, 4.5**
    - File: `server/src/__tests__/loopAgent.test.ts`
    - P4: mock Designer producing invalid layouts; assert retry count increments and Zod errors appended to prompt
    - P5: mock Designer always failing; assert LoopAgent terminates after exactly 3 iterations, not 4
    - Minimum 100 iterations each

  - [ ]* 3.7 Write property test for Designer_Agent UUID node IDs (P6)
    - **Property 6: All generated Craft.js node IDs are unique UUIDs**
    - **Validates: Requirements 4.6**
    - File: `server/src/__tests__/designer.test.ts`
    - Use `fc.string()` for content inputs; assert every node id matches UUID v4 regex and all ids in tree are distinct
    - Minimum 100 iterations

  - [ ] 3.8 Implement tRPC router and `generateLayout` subscription procedure
    - Create `server/src/trpc/router.ts`: root router composing `generateLayout` and `brandKit` sub-routers
    - Create `server/src/trpc/procedures/generateLayout.ts`: subscription accepting `{ prompt: string }`, reads `workspace_id` from context, runs pipeline, yields typed SSEEvent discriminated union
    - Emit `progress`, `iteration`, `slide_complete`, `complete`, and `error` typed SSE events
    - Create `AbortController` per subscription; pass `signal` to `runPipeline`; call `abort()` on client disconnect
    - Return HTTP 429 with `Retry-After` header when rate limit exceeded
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.8_

  - [ ] 3.9 Implement auth middleware and mount tRPC on Hono
    - Create `server/src/middleware/auth.ts`: read Better-Auth session cookie, inject `{ userId, workspaceId }` into tRPC context, return HTTP 401 on missing/invalid session
    - Create `server/src/middleware/rateLimiter.ts`: sliding window per workspace, limit configurable via `RATE_LIMIT_REQUESTS_PER_HOUR` env var, HTTP 429 + Retry-After
    - Mount tRPC handler at `/trpc` in `server/src/index.ts`
    - _Requirements: 1.2, 7.3, 7.4_

  - [ ]* 3.10 Write property tests for SSE event emission (P7–P10)
    - **Property 7: SSE stream emits typed progress event on each agent transition**
    - **Property 8: SSE stream emits iteration event after each LoopAgent cycle**
    - **Property 9: Successful generation ends with a complete SSE event**
    - **Property 10: Unrecoverable errors produce a closed SSE error event**
    - **Validates: Requirements 5.2, 5.3, 5.4, 5.5**
    - File: `server/src/__tests__/sse.test.ts`
    - P7: `fc.string()` for prompts; assert `progress` event emitted before each agent starts
    - P8: `fc.integer({ min: 1, max: 3 })` for iteration count; assert `iteration` event with correct number and `valid` boolean
    - P9: mock successful pipeline; assert final event is `complete` with `craftJson`, no events after
    - P10: mock failure scenarios; assert exactly one `error` event emitted and stream closes
    - Minimum 100 iterations each

  - [ ] 3.11 Refactor `AILayoutGenerator.tsx` to consume tRPC SSE
    - Replace `generateAILayout()` import with `trpc.generateLayout.subscribe()`
    - On `progress` event: update loading indicator text with `event.message`
    - On `complete` event: call `actions.deserialize(event.craftJson)`
    - On `error` event: display error message and close loading state
    - _Requirements: 9.1, 9.3, 9.4, 5.6_

  - [ ]* 3.12 Write property tests for AILayoutGenerator SSE consumption (P15, P16)
    - **Property 15: AILayoutGenerator deserializes complete SSE payload**
    - **Property 16: AILayoutGenerator updates status text from progress events**
    - **Validates: Requirements 9.3, 9.4, 5.6**
    - File: `src/components/editor/__tests__/AILayoutGenerator.test.tsx`
    - P15: `fc.record(...)` for craftJson shapes; assert `actions.deserialize` called with payload on `complete` event
    - P16: `fc.string()` for agent/message; assert loading text updated before next render on `progress` event
    - Minimum 100 iterations each

  - [ ] 3.13 Delete `src/lib/geminiService.ts`
    - Remove file after `AILayoutGenerator.tsx` no longer imports it
    - Verify no other frontend file imports from `src/lib/geminiService.ts`
    - _Requirements: 9.2_

  - [ ] 3.14 Configure inference model env vars for LlmAgents
    - Set Gemini 2.5 Flash as the default model for Starter_Agent, Writer_Agent, Designer_Agent via `GEMINI_MODEL` env var
    - Reviewer_Agent does NOT use LLM — no model env var needed for it
    - Document `GEMINI_MODEL` env var in `server/README.md`
    - _Requirements: 11.1, 11.2_

  - [ ]* 3.15 Write property test for Reviewer_Agent determinism (P18)
    - **Property 18: Reviewer_Agent validates deterministically without LLM**
    - **Validates: Requirements 11.3**
    - File: `server/src/__tests__/loopAgent.test.ts` (extend existing file)
    - Assert same CraftJson input always produces identical pass/fail result across multiple calls; assert no LLM client is instantiated in reviewer.ts
    - Minimum 100 iterations

- [ ] 4. Checkpoint — FA 002 complete
  - Ensure end-to-end SSE flow works: browser prompt → tRPC subscription → ADK pipeline → Craft.js deserialize.
  - Ensure `src/lib/geminiService.ts` no longer exists.
  - Ensure `npm run lint` passes on both frontend and server.
  - Ask the user if questions arise before proceeding to FA 003.

- [ ] 5. FA 003 — Brand Kit RAG integration
  - [ ] 5.1 Implement Brand Kit tRPC procedures
    - Create `server/src/trpc/procedures/brandKit.ts`: `create`, `list`, `delete`, `setActive` mutations/queries
    - On `create`: store brand tokens with `is_active = false`; `embedding` column nullable (deferred generation)
    - `setActive`: set `is_active = true` on chosen kit, `is_active = false` on all others for the workspace in a single transaction
    - All procedures scoped to authenticated `workspace_id` from tRPC context
    - _Requirements: 6.1, 6.2, 6.4_

  - [ ] 5.2 Implement Brand Kit lookup in Writer_Agent
    - Primary query: `SELECT WHERE workspace_id = ? AND is_active = 1 LIMIT 1`
    - Fallback query (no active kit): `SELECT WHERE workspace_id = ? ORDER BY created_at DESC LIMIT 1`
    - All queries MUST include `WHERE workspace_id = ?` to enforce tenant isolation
    - On no Brand Kit found for workspace: fall back to `workspace_defaults`, then `global_defaults`, then hardcoded defaults
    - Note: `vector_distance_cos` is reserved for future semantic RAG use; the `embedding` column is stored but not used for selection in this phase
    - _Requirements: 6.3, 6.4, 6.5_

  - [ ] 5.3 Implement `brandKit.migrate` tRPC mutation and `useBrandKitMigration` hook
    - Add `migrate` mutation to `server/src/trpc/procedures/brandKit.ts`: accepts array of `{ name, tokens }`, generates vector8 embeddings, bulk-inserts into `brand_kits` scoped to `workspace_id`
    - Mutation is idempotent: skip kits that already exist by name for the workspace
    - Create `src/hooks/useBrandKitMigration.ts`: on first authenticated load, set `migrationAttempted = true` before calling `trpc.brandKit.migrate` to prevent duplicate concurrent calls (React StrictMode double-invoke safe)
    - Read `localStorage.getItem('slideflow-brand-kits')`, check `trpc.brandKit.list`, call `trpc.brandKit.migrate` if workspace has no kits, then clear localStorage on success
    - On migration failure: retain localStorage data for retry on next load (not within same session)
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

  - [ ]* 5.4 Write property tests for Brand Kit RAG and migration idempotency (P11, P12, P17)
    - **Property 11: Brand Kit RAG query is strictly tenant-isolated**
    - **Property 12: Brand Kit round-trip retrieval**
    - **Property 17: localStorage migration is idempotent**
    - **Validates: Requirements 6.4, 7.5, 6.6, 6.2, 10.2, 10.4**
    - File: `server/src/__tests__/rag.test.ts`
    - P11: `fc.uuid()` for workspace IDs, `fc.record(...)` for brand kits; insert kits for W1 and W2; assert RAG query with `workspace_id = W1` never returns W2's kit
    - P12: `fc.record(...)` for brand token sets; store kit B for workspace W; assert `vector_distance_cos` query with W returns B as top result
    - P17: `fc.array(fc.record(...))` for existing + migrated kits; assert no duplicates by name after `brandKit.migrate`, total count equals unique name count
    - Minimum 100 iterations each

- [ ] 6. Checkpoint — FA 003 complete
  - Ensure Brand Kit CRUD works via tRPC.
  - Ensure Writer_Agent enriches content with Brand Kit tokens from RAG query.
  - Ensure cross-workspace RAG isolation holds.
  - Ensure `useBrandKitMigration` hook correctly migrates localStorage Brand Kits on first authenticated load and clears localStorage on success.
  - Ask the user if questions arise before proceeding to FA 004.

- [ ] 7. FA 004 — VPS deploy: auth, encryption, secrets, infrastructure
  - [ ] 7.1 Implement Better-Auth with Google OAuth2
    - Create `server/src/auth/better-auth.ts`: configure Google OAuth2 provider, session cookie settings
    - Register Workspace creation hook that triggers Onboarding_Worker on first login
    - Mount Better-Auth handler at `/auth` in `server/src/index.ts`
    - _Requirements: 7.1_

  - [ ] 7.2 Implement Onboarding_Worker
    - Create `server/src/auth/onboarding.ts`: single `INSERT INTO workspace_defaults SELECT ... FROM global_defaults` in one transaction
    - Triggered by Better-Auth new-user hook; scoped to the new user's `workspace_id`
    - Idempotent: check `WHERE workspace_id = ? LIMIT 1` before inserting; skip if rows already exist
    - On transaction failure: log error and allow the Workspace to remain functional (Writer_Agent falls back to `global_defaults` directly, then hardcoded defaults)
    - _Requirements: 7.2_

  - [ ]* 7.3 Write property test for auth middleware 401 behavior (P13)
    - **Property 13: Unauthenticated requests receive HTTP 401**
    - **Validates: Requirements 7.3**
    - File: `server/src/__tests__/auth.test.ts`
    - Use `fc.string()` for invalid/missing tokens; assert every tRPC request without valid session returns HTTP 401 and no handler is invoked
    - Minimum 100 iterations

  - [ ]* 7.4 Write property test for Onboarding_Worker (P14)
    - **Property 14: Onboarding copies all global_defaults for new users**
    - **Validates: Requirements 7.2**
    - File: `server/src/__tests__/onboarding.test.ts`
    - Use `fc.array(fc.record(...))` for `global_defaults` rows; assert workspace row count equals `global_defaults` count after onboarding
    - Minimum 100 iterations

  - [ ] 7.5 Implement Infisical secret injection and fatal startup guard
    - Create `server/src/secrets/infisical.ts`: fetch `GEMINI_API_KEY` and AEGIS encryption key from Infisical at startup
    - On Infisical unreachable: log descriptive error and `process.exit(1)`
    - Inject fetched secrets into `process.env` before DB open and tRPC mount
    - Wire `fetchSecretsFromInfisical()` as step 1 in `server/src/index.ts` startup sequence
    - _Requirements: 8.5, 8.6_

  - [ ]* 7.6 Write unit tests for Infisical fatal startup guard
    - File: `server/src/__tests__/startup.test.ts` (extend existing file)
    - Test: Infisical unreachable → `process.exit(1)` with descriptive log before server binds
    - Test: `GEMINI_API_KEY` absent at generation time → SSE `error` event, no LLM call made
    - _Requirements: 8.6, 3.5_

  - [ ] 7.7 Enable AEGIS encryption on Turso DB
    - Pass AEGIS encryption key (from Infisical) to `createClient({ url, encryptionKey })`
    - Document `chmod 600 local.db` requirement in `server/README.md` (or inline comment)
    - _Requirements: 8.3, 8.4_

  - [ ] 7.8 Write Caddy and UFW configuration files
    - Create `deploy/Caddyfile`: TLS termination via Let's Encrypt, reverse proxy to `127.0.0.1:3000`
    - Create `deploy/ufw-setup.sh`: allow ports 80 and 443 only, deny all other inbound
    - _Requirements: 8.1, 8.2_

- [ ] 8. Final checkpoint — all phases complete
  - Ensure all non-optional tests pass (`bun test` in `server/`).
  - Ensure `npm run lint` passes on the frontend.
  - Ensure no `GEMINI_API_KEY` appears in `vite.config.ts` define block or frontend bundle.
  - Ensure `src/lib/geminiService.ts` does not exist.
  - Ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- Checkpoints validate integration before moving to the next phase
- Property tests use fast-check with a minimum of 100 iterations each
- `src/lib/geminiService.ts` is deleted in task 3.13 (FA 002), not FA 001
- `vite.config.ts` GEMINI_API_KEY define block is removed in task 1.6 (FA 001)
- RAG queries must always place `WHERE workspace_id = ?` before `vector_distance_cos` to prevent cross-tenant leakage
- Reviewer_Agent is a pure Zod validation function — no LLM, no Gemini, no Ollama; deterministic and zero token cost
- `GEMINI_MODEL` env var configures Gemini model for Starter_Agent, Writer_Agent, Designer_Agent only
- `server/README.md` documents local-only features (AEGIS, BEGIN CONCURRENT, chmod 600) and migration trigger (500 users / 10 GB)
- `brandKit.migrate` mutation is idempotent — safe to call multiple times without creating duplicates
- All LlmAgent model selection is configurable via env vars without code changes


