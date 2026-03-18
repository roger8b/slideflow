# Requirements Document

## Introduction

This document defines the requirements for migrating Slideflow's AI generation from a purely
front-end implementation (Vite + React with `GEMINI_API_KEY` injected at build time) to a
unified backend. The backend will be built with Bun + Hono, expose a tRPC v11 API with
Server-Sent Events (SSE) for real-time streaming, orchestrate multi-agent AI pipelines via
Google ADK for TypeScript, persist data in Turso (libSQL) with native vector8 support for
RAG, and be secured behind Caddy + UFW with AEGIS encryption and runtime secret injection.

The migration is organized into four execution phases:
- **FA 001** — Core backend setup + Turso local + remove GEMINI_API_KEY from Vite
- **FA 002** — Google ADK multi-agent orchestration + tRPC SSE streaming
- **FA 003** — RAG integration: Brand Kit stored as vector8 embeddings in Turso
- **FA 004** — VPS deploy: Better-Auth, Caddy, UFW, AEGIS encryption, Infisical secrets

---

## Glossary

- **Backend_Server**: The Bun + Hono process running at `127.0.0.1:3000`.
- **tRPC_Router**: The tRPC v11 router mounted on the Backend_Server, exposing typed procedures.
- **SSE_Stream**: A Server-Sent Events connection opened by the tRPC_Router to push incremental AI progress to the client.
- **ADK_Orchestrator**: The Google ADK for TypeScript runtime that manages agent sessions and state.
- **Starter_Agent**: The first LlmAgent in the SequentialAgent pipeline; responsible for generating the macro slide graph structure.
- **Writer_Agent**: The second LlmAgent in the SequentialAgent pipeline; responsible for generating slide content enriched by RAG context.
- **Designer_Agent**: The LlmAgent inside the LoopAgent that generates Craft.js-compatible JSON layouts.
- **Reviewer_Agent**: The pure TypeScript validation function inside the LoopAgent that validates Designer_Agent output against the Canvas_Schema using Zod. It is NOT an LlmAgent — it requires no LLM inference and executes deterministically at zero token cost.
- **LoopAgent**: The Google ADK LoopAgent wrapping Designer_Agent and Reviewer_Agent with `maxIterations: 3`.
- **SequentialAgent**: The Google ADK SequentialAgent running Starter_Agent then Writer_Agent then LoopAgent in order.
- **Session_State**: The ADK `session.state` dictionary shared across all agents in a single generation run.
- **Turso_DB**: The embedded libSQL v0.5.0 database file (`local.db`) providing relational storage, MVCC via `BEGIN CONCURRENT`, and native vector8 search.
- **Drizzle_ORM**: The TypeScript ORM used to define and query the Turso_DB schema.
- **Canvas_Schema**: The Zod schema enforcing that all Craft.js JSON layouts conform to the 960×540px artboard constraints.
- **Brand_Kit**: A user-defined set of visual tokens (colors, fonts) stored as vector8 embeddings in Turso_DB and used by Writer_Agent for RAG context.
- **Workspace**: The multi-tenant isolation unit; every user-scoped database row carries a `workspace_id` foreign key.
- **Onboarding_Worker**: A backend hook triggered on new user creation that copies Global_Defaults into the new user's Workspace.
- **Global_Defaults**: System-level template and theme definitions stored in Turso_DB, readable by all workspaces.
- **Better_Auth**: The authentication library managing user sessions, OAuth2 (Google), and Workspace creation.
- **Caddy_Proxy**: The reverse proxy handling TLS termination and forwarding HTTPS traffic to Backend_Server.
- **UFW_Firewall**: The host-level firewall restricting inbound traffic to ports 80 and 443 only.
- **AEGIS_Encryption**: The native page-level encryption mode enabled on Turso_DB at rest.
- **Secret_Manager**: The runtime secret manager (Infisical or Doppler) injecting `GEMINI_API_KEY` and database credentials into Backend_Server memory without hardcoding. Either tool is acceptable; the choice is an operational decision with zero application code impact.
- **Infisical**: One supported implementation of Secret_Manager. Can be substituted with Doppler by changing only the secret-fetch bootstrap in `server/src/secrets/`.
- **Circuit_Breaker**: The `maxIterations: 3` limit on LoopAgent that causes graceful failure after three consecutive Zod validation errors.
- **Craft_JSON**: The serialized Craft.js component tree stored as a JSON string in each slide's `data.layout` field.
- **AILayoutGenerator**: The React component in `src/components/editor/AILayoutGenerator.tsx` that sends prompts to the backend and renders SSE progress.
- **Vite_Config**: The `vite.config.ts` file that currently injects `GEMINI_API_KEY` at build time via `define`.
- **Gemini_Model**: The Gemini 2.5 Flash model used by all LlmAgents as the default inference provider.
- **Ollama_Server**: An optional local inference server running at `127.0.0.1:11434`, usable by Reviewer_Agent as a cost-reducing alternative to Gemini API for the critic step.
- **localStorage_Migration**: The one-time process of reading Brand Kit data from the browser's `localStorage` (key: `slideflow-brand-kits`) and persisting it to the `brand_kits` table in Turso_DB during FA 003.
- **Migration_Trigger**: The operational threshold (500 active users OR 10 GB `.db` file size) at which the team should migrate from embedded Turso to Turso Cloud.

---

## Requirements

### Requirement 1: Backend Server Initialization

**User Story:** As a developer, I want a Bun + Hono backend server running locally, so that the
frontend can communicate with a typed API instead of calling Gemini directly from the browser.

#### Acceptance Criteria

1. THE Backend_Server SHALL listen on `127.0.0.1:3000` when started with `bun run dev`.
2. THE tRPC_Router SHALL be mounted on the Backend_Server at the path `/trpc`.
3. WHEN the Backend_Server starts, THE Turso_DB SHALL be opened from the path specified by the `DATABASE_URL` environment variable (defaulting to `file:local.db` in development).
4. IF the `DATABASE_URL` environment variable is absent at startup, THEN THE Backend_Server SHALL log a descriptive error and exit with a non-zero code.
5. THE Vite_Config SHALL NOT contain any `define` entry that injects `GEMINI_API_KEY` into the frontend bundle after FA 001 is complete.
6. THE Backend_Server SHALL mount CORS middleware (Hono `cors()`) with the allowed origin set via the `CORS_ORIGIN` environment variable before any route handler is registered; if `CORS_ORIGIN` is absent, CORS SHALL default to `http://localhost:5173` in development.

---

### Requirement 2: Relational Schema and MVCC

**User Story:** As a developer, I want a well-defined relational schema with multi-tenant isolation
and concurrent write support, so that multiple AI agents can read and write data simultaneously
without lock contention.

#### Acceptance Criteria

1. THE Drizzle_ORM SHALL define tables for `users`, `workspaces`, `presentations`, `slides`, `brand_kits`, `global_defaults`, and `workspace_defaults`.
2. THE Drizzle_ORM SHALL include a `workspace_id` foreign key column on every tenant-scoped table (`presentations`, `slides`, `brand_kits`, `workspace_defaults`).
3. WHEN multiple agents write to Turso_DB concurrently, THE Turso_DB SHALL use `BEGIN CONCURRENT` transactions to prevent "Database Locked" errors.
4. THE Drizzle_ORM SHALL expose a `db/client.ts` module that constructs the database client from the `DATABASE_URL` environment variable, with no hardcoded file paths.
5. IF a migration fails during `drizzle-kit push`, THEN THE Backend_Server SHALL log the migration error and halt startup before accepting requests.
6. THE `db/client.ts` module SHALL be the single point of database URL configuration; switching from `file:local.db` (development) to `libsql://...turso.io` (production) SHALL require only changing the `DATABASE_URL` environment variable with zero application code changes.
7. THE Backend_Server documentation (`server/README.md`) SHALL explicitly list the three features that are local-only (AEGIS encryption, `BEGIN CONCURRENT`, `chmod 600`) and their Turso Cloud equivalents, so that the migration path is clear when the Migration_Trigger threshold is reached.

---

### Requirement 3: AI Generation Pipeline (SequentialAgent)

**User Story:** As a user, I want the AI to generate a complete slide deck structure from a text
prompt, so that I can get a full presentation outline without manually creating each slide.

#### Acceptance Criteria

1. WHEN a generation request is received by the tRPC_Router, THE ADK_Orchestrator SHALL initialize a new session with an empty Session_State.
2. THE SequentialAgent SHALL execute Starter_Agent first, then Writer_Agent, in that fixed order.
3. WHEN Starter_Agent completes, THE Session_State SHALL contain a `macro_nodes` key holding the slide graph structure before Writer_Agent begins.
4. THE Writer_Agent SHALL read `macro_nodes` from Session_State and produce an `enriched_content` array with one entry per slide, enriched with Brand_Kit context.
5. AFTER Writer_Agent completes, THE pipeline SHALL iterate over `enriched_content` and run the LoopAgent (Designer + Reviewer) once per slide, accumulating results in `craft_jsons`. IF the `GEMINI_API_KEY` is absent from the runtime environment, THEN THE ADK_Orchestrator SHALL return an error to the tRPC_Router without invoking any LLM call.

---

### Requirement 4: Layout Validation Loop (LoopAgent + Zod)

**User Story:** As a user, I want the AI-generated slide layouts to always fit within the 960×540px
canvas, so that generated content never overflows or breaks the presentation view.

#### Acceptance Criteria

1. THE Canvas_Schema SHALL validate that all positional and dimensional values in a Craft_JSON layout are within the 960×540px artboard bounds.
2. WHEN Designer_Agent produces a Craft_JSON layout, THE Reviewer_Agent SHALL validate it against the Canvas_Schema before the LoopAgent advances.
3. IF the Canvas_Schema validation fails, THEN THE LoopAgent SHALL instruct Designer_Agent to regenerate the layout with the Zod error details appended to the prompt.
4. WHEN the Canvas_Schema validation passes, THE LoopAgent SHALL set a stop signal causing the Circuit_Breaker to exit the loop successfully.
5. THE Circuit_Breaker SHALL terminate the LoopAgent after 3 consecutive Canvas_Schema validation failures and return a structured error to the tRPC_Router.
6. THE Designer_Agent SHALL assign each Craft_JSON node a unique ID generated with sufficient entropy so that Craft.js deserialization via `actions.deserialize()` does not produce ID collisions.
7. IF a single LLM call (Gemini API) exceeds the duration configured by the `LLM_CALL_TIMEOUT_MS` environment variable (default: 60000ms), THE agent SHALL treat the call as a failed iteration, increment the LoopAgent retry counter, and propagate a timeout error through the circuit breaker path.

---

### Requirement 5: Real-Time SSE Streaming

**User Story:** As a user, I want to see live progress updates while the AI generates my slide
layout, so that I know the system is working and which agent is currently active.

#### Acceptance Criteria

1. THE tRPC_Router SHALL expose a `generateLayout` subscription procedure that returns an SSE_Stream.
2. WHEN the SequentialAgent transitions between agents, THE SSE_Stream SHALL emit a progress event containing the current agent name and a human-readable status message.
3. WHEN the LoopAgent completes a Designer_Agent iteration for a slide, THE SSE_Stream SHALL emit an event indicating the slide index, iteration number, and validation result.
4. WHEN the LoopAgent successfully validates a slide layout, THE SSE_Stream SHALL emit a `slide_complete` event containing the slide index and its Craft_JSON.
5. WHEN all slides have been generated successfully, THE SSE_Stream SHALL emit a final `complete` event containing the full `craft_jsons` array and then close.
6. IF an unrecoverable error occurs during generation, THE SSE_Stream SHALL emit an error event with a descriptive message and then close.
7. THE AILayoutGenerator SHALL consume the SSE_Stream and display the current agent status message in the UI while generation is in progress.
8. WHEN a client disconnects from an active SSE_Stream, THE Backend_Server SHALL abort the active ADK session via `AbortController.abort()`, preventing any further LLM calls from being issued for that session.

---

### Requirement 6: Brand Kit RAG Integration

**User Story:** As a user, I want the AI to use my brand colors and fonts when generating layouts,
so that generated slides are consistent with my visual identity without manual adjustment.

#### Acceptance Criteria

1. THE Turso_DB SHALL store Brand_Kit embeddings using the `vector8` column type (model: `text-embedding-004`, dimension: 768) to reduce memory usage by at least 75% compared to `float32` storage. The embedding column is persisted for future semantic RAG use but is NOT used for selection in the current implementation.
2. WHEN a Brand_Kit is saved, THE Backend_Server SHALL store it in the `brand_kits` table with the associated `workspace_id` and set `is_active = false` by default; THE user can mark one kit as active via the `brandKit.setActive` mutation, which sets `is_active = true` on the selected kit and `is_active = false` on all others for the same workspace.
3. WHEN Writer_Agent runs, THE Writer_Agent SHALL select the Brand_Kit where `workspace_id = ? AND is_active = 1 LIMIT 1`; if none is active, it SHALL fall back to the most recently created kit (`ORDER BY created_at DESC LIMIT 1`).
4. ALL Brand_Kit queries SHALL include a `WHERE workspace_id = ?` filter so that Brand_Kit data from one Workspace is never accessible to another Workspace.
5. WHEN no Brand_Kit exists for the active Workspace, THE Writer_Agent SHALL proceed using default color and font values from `workspace_defaults` (fallback: `global_defaults`).
6. THE `brand_kits` table SHALL include an `embedding_model` column storing the name of the model used to generate the embedding (default: `'text-embedding-004'`), enabling safe model migration detection.

---

### Requirement 7: Authentication and Multi-Tenancy

**User Story:** As a user, I want to log in with my Google account and have my presentations
isolated from other users, so that my data is private and secure.

#### Acceptance Criteria

1. THE Better_Auth SHALL support Google OAuth2 as an authentication provider.
2. WHEN a new user authenticates for the first time, THE Onboarding_Worker SHALL copy all rows from `global_defaults` into `workspace_defaults` for the new user's Workspace via a single transactional `INSERT INTO workspace_defaults SELECT ... FROM global_defaults` statement. IF the onboarding transaction fails, THE failure SHALL be logged and the Workspace SHALL remain functional (Writer_Agent falls back to `global_defaults` directly). THE onboarding operation SHALL be idempotent — re-running it for an already-onboarded workspace SHALL not create duplicate rows.
3. THE tRPC_Router SHALL reject any request without a valid Better_Auth session token with an HTTP 401 response.
4. THE ADK_Orchestrator SHALL receive the authenticated user's `workspace_id` in the InvocationContext for every generation request.
5. WHILE a generation session is active, THE ADK_Orchestrator SHALL use the `workspace_id` from InvocationContext to scope all Turso_DB reads and writes.

---

### Requirement 8: Infrastructure Security Hardening

**User Story:** As an operator, I want the production deployment to be secured at every layer,
so that user data and API keys cannot be exfiltrated even if the VPS disk is compromised.

#### Acceptance Criteria

1. THE UFW_Firewall SHALL allow inbound traffic only on ports 80 and 443; all other inbound ports SHALL be denied by default.
2. THE Caddy_Proxy SHALL terminate TLS using a Let's Encrypt certificate and forward decrypted traffic to `127.0.0.1:3000`.
3. THE Turso_DB file SHALL be encrypted at rest using AEGIS_Encryption with the encryption key injected at runtime by Infisical.
4. THE Turso_DB file SHALL have Linux file permissions set to `chmod 600`, restricting read and write access to the owning process user only.
5. THE Backend_Server SHALL obtain `GEMINI_API_KEY` and the AEGIS encryption key exclusively from the Secret_Manager (Infisical or Doppler) at runtime; neither value SHALL appear in any `.env` file committed to version control.
6. IF the Secret_Manager is unreachable at startup, THEN THE Backend_Server SHALL log a descriptive error and exit with a non-zero code rather than starting with missing secrets.

---

### Requirement 9: Frontend Refactoring (AI Integration Handoff)

**User Story:** As a developer, I want the frontend to delegate all AI calls to the backend,
so that no API keys or AI logic remain in the client bundle.

#### Acceptance Criteria

1. THE AILayoutGenerator SHALL call the tRPC_Router `generateLayout` subscription instead of importing `generateAILayout` from `src/lib/geminiService.ts`.
2. THE `src/lib/geminiService.ts` module SHALL be removed from the frontend codebase after the backend endpoint is operational.
3. WHEN the tRPC_Router returns a completed Craft_JSON payload, THE AILayoutGenerator SHALL deserialize it into the active Craft.js editor using `actions.deserialize()`.
4. WHEN the SSE_Stream emits a progress event, THE AILayoutGenerator SHALL update the loading indicator text with the current agent status message.
5. THE Vite_Config `define` block SHALL NOT contain `process.env.GEMINI_API_KEY` after the frontend refactoring is complete.

---

### Requirement 10: localStorage Brand Kit Migration

**User Story:** As a user, I want my existing brand kits (currently stored in the browser's localStorage) to be automatically migrated to the backend database, so that I don't lose my brand configuration when the system transitions to server-side storage.

#### Acceptance Criteria

1. THE Backend_Server SHALL expose a `brandKit.migrate` tRPC mutation that accepts an array of brand token objects exported from the frontend's `localStorage` key `slideflow-brand-kits`.
2. WHEN `brandKit.migrate` is called, THE Backend_Server SHALL generate a `vector8` embedding for each brand token set and persist each kit to the `brand_kits` table with the authenticated user's `workspace_id`.
3. THE `useBrandKitMigration` hook SHALL call `brandKit.migrate` at most once per authenticated session by setting a `migrationAttempted` flag in component state before making the call; IF a migration is already in-flight, the hook SHALL NOT make a second concurrent call.
4. AFTER a successful `brandKit.migrate` call, THE frontend SHALL clear the `slideflow-brand-kits` key from `localStorage` to prevent duplicate migration on subsequent loads.
5. IF `brandKit.migrate` fails (network error, auth error), THE frontend SHALL retain the `localStorage` data and retry on the next authenticated load.

---

### Requirement 11: Inference Model and Local Fallback

**User Story:** As an operator, I want to configure which LLM model each agent uses, so that I can optimize cost by using a local model for the critic step without changing application code.

#### Acceptance Criteria

1. ALL LlmAgents (Starter_Agent, Writer_Agent, Designer_Agent) SHALL use Gemini_Model (Gemini 2.5 Flash) as the default inference model.
2. THE model selection for each LlmAgent (Starter_Agent, Writer_Agent, Designer_Agent) SHALL be configurable via the `GEMINI_MODEL` environment variable without requiring code changes.
3. THE Reviewer_Agent is a pure Zod validation function and SHALL NOT use any LLM inference model; it executes deterministically against the Canvas_Schema with no token cost.
