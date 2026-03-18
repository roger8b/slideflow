# Slideflow Backend

Bun + Hono backend for Slideflow's AI generation pipeline with tRPC SSE streaming, Google ADK multi-agent orchestration, and Turso vector RAG.

## Environment Variables

### Required

- `DATABASE_URL` — Database connection string
  - Development: `file:local.db` (relative, executado a partir de `server/`)
  - Production (VPS Hostinger): `file:/var/data/slideflow/local.db` (caminho absoluto obrigatório)
- `GEMINI_API_KEY` — Google Gemini API key for LLM inference (required for AI generation)

### Optional

- `CORS_ORIGIN` — Allowed CORS origin for frontend requests (default: `http://localhost:5173`)
- `GEMINI_MODEL` — Gemini model to use for Starter_Agent, Writer_Agent, and Designer_Agent (default: `googleai/gemini-2.0-flash-exp`)
- `OLLAMA_BASE_URL` — Ollama server address for local inference (e.g., `http://127.0.0.1:11434`). When set, all LlmAgents route to Ollama instead of Gemini API. `GEMINI_API_KEY` is not required when using Ollama.
- `LLM_CALL_TIMEOUT_MS` — Timeout in milliseconds for individual LLM calls (default: `60000`)
- `RATE_LIMIT_REQUESTS_PER_HOUR` — Maximum requests per workspace per hour (default: `100`)

## Local Development

```bash
# Install dependencies
bun install

# Set up environment (desenvolvimento local)
cat > .env << EOF
DATABASE_URL=file:local.db
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=googleai/gemini-2.0-flash-exp
LLM_CALL_TIMEOUT_MS=60000
RATE_LIMIT_REQUESTS_PER_HOUR=100
EOF

# Run migrations
bun run db:push

# Start dev server (with auto-reload)
bun run dev
```

The server will start at `http://127.0.0.1:3000`.

## Inference Model Configuration

The backend uses Google Gemini for AI generation. Three agents use LLM inference:

- **Starter_Agent**: Generates slide structure from user prompt
- **Writer_Agent**: Enriches content with brand context
- **Designer_Agent**: Converts content to Craft.js layouts

**Reviewer_Agent does NOT use LLM** — it's a pure Zod validation function that runs deterministically at zero token cost.

### Model Selection

Set `GEMINI_MODEL` to configure which Gemini model to use:

```bash
# Default (recommended for production)
GEMINI_MODEL=googleai/gemini-2.0-flash-exp

# Alternative models
GEMINI_MODEL=googleai/gemini-1.5-flash
GEMINI_MODEL=googleai/gemini-1.5-pro
```

All three LlmAgents use the same model. The Reviewer_Agent validation step requires no model configuration.

## Local Testing with Ollama

For local development and testing without spending Gemini API tokens, you can use Ollama as a local inference provider. This routes all three LlmAgents (Starter, Writer, Designer) to your local Ollama server at zero cost.

**Reviewer_Agent is always pure Zod validation** — it never uses any LLM (Gemini or Ollama) and executes deterministically at zero token cost regardless of provider.

### Installing Ollama

1. Install Ollama from [ollama.ai](https://ollama.ai) or via package manager:
   ```bash
   # macOS
   brew install ollama
   
   # Linux
   curl -fsSL https://ollama.ai/install.sh | sh
   ```

2. Start the Ollama server:
   ```bash
   ollama serve
   ```
   
   The server will start at `http://127.0.0.1:11434` by default.

3. Pull a model optimized for JSON generation:
   ```bash
   # Recommended: Qwen 2.5 Coder (7B) — excellent JSON generation quality
   ollama pull qwen2.5-coder:7b
   
   # Alternative: Llama 3.1 (8B) — good balance of speed and quality
   ollama pull llama3.1:8b
   ```

### Configuration for Ollama Mode

```bash
# .env for Ollama mode (no GEMINI_API_KEY required)
DATABASE_URL=file:local.db
OLLAMA_BASE_URL=http://127.0.0.1:11434
GEMINI_MODEL=ollama/qwen2.5-coder:7b
LLM_CALL_TIMEOUT_MS=60000
```

**Important notes:**
- When `OLLAMA_BASE_URL` is set, `GEMINI_API_KEY` is NOT required
- The `GEMINI_MODEL` env var must include the `ollama/` prefix when using Ollama (e.g., `ollama/qwen2.5-coder:7b`)
- For Gemini mode, use the `googleai/` prefix (e.g., `googleai/gemini-2.0-flash-exp`)
- If both `OLLAMA_BASE_URL` and `GEMINI_API_KEY` are set, Ollama takes precedence
- If neither is set, the pipeline will emit an SSE error event immediately

### Recommended Models for JSON Generation

| Model | Size | Quality | Speed | Notes |
|-------|------|---------|-------|-------|
| `ollama/qwen2.5-coder:7b` | 7B | Excellent | Fast | Best for structured JSON output |
| `ollama/llama3.1:8b` | 8B | Good | Fast | Solid general-purpose model |
| `ollama/mistral:7b` | 7B | Good | Very Fast | Lightweight alternative |

**Note:** All Ollama model names must include the `ollama/` prefix in the `GEMINI_MODEL` env var.

**Reviewer_Agent note:** The Reviewer_Agent is always a pure Zod function — it validates Canvas_Schema bounds deterministically without any LLM inference, so it has zero token cost regardless of whether you use Gemini or Ollama for the creative agents.

## VPS Production Setup (Hostinger)

Em produção, o banco Turso também roda como arquivo embutido no disco da VPS — **não é Turso Cloud**.

```bash
# .env na VPS (caminho absoluto obrigatório)
DATABASE_URL=file:/var/data/slideflow/local.db
CORS_ORIGIN=https://seu-dominio.com

# Permissões do arquivo de banco (FA 004)
chmod 600 /var/data/slideflow/local.db
```

> **Por que caminho absoluto?** O caminho relativo `file:local.db` resolve a partir do `cwd` do processo. Na VPS, o processo pode ser iniciado de qualquer diretório — o caminho absoluto garante que o arquivo seja sempre criado e lido no local correto.

## Embedded Turso Features (VPS + Desenvolvimento Local)

As seguintes features se aplicam ao Turso embutido (arquivo `.db` em disco), tanto em desenvolvimento local quanto em produção na VPS. Possuem equivalentes distintos apenas se/quando migrar para Turso Cloud no futuro:

### 1. AEGIS Encryption

**Embedded (VPS/Local):** Criptografia em repouso no nível de página via AEGIS-256. Chave injetada em runtime pelo Infisical (implementado em FA 004).

**Turso Cloud (futuro):** Criptografia gerenciada pela infraestrutura Turso — transparente para o código da aplicação.

**Migração:** A remoção do `encryptionKey` em `createClient()` e configuração no dashboard Turso exige alteração em `src/db/client.ts`.

### 2. BEGIN CONCURRENT

**Embedded (VPS/Local):** Transações MVCC via `BEGIN CONCURRENT` evitam erros de "Database Locked" em escritas concorrentes.

**Turso Cloud (futuro):** MVCC distribuído por padrão — sem necessidade de `BEGIN CONCURRENT` explícito.

**Migração:** Sem alteração de código — o Drizzle ORM abstrai o gerenciamento de transações.

### 3. chmod 600

**Embedded (VPS/Local):** Permissões de arquivo restringem acesso ao banco somente ao usuário do processo (`chmod 600 local.db`).

**Turso Cloud (futuro):** Controle de acesso via tokens de autenticação Turso e segurança em nível de rede.

**Migração:** Remover comandos `chmod 600` dos scripts de deploy; configurar tokens Turso no Infisical.

## Turso Cloud — Gatilho de Migração

Migrar do Turso embutido (VPS) para Turso Cloud quando uma das condições for atingida:

- **500 usuários ativos** (sessões autenticadas concorrentes)
- **10 GB de tamanho do arquivo** (`.db` em disco na VPS)

### Checklist de Migração para Turso Cloud

As seguintes **alterações de código são necessárias** além das atualizações de variáveis de ambiente:

1. `server/src/db/client.ts`: adicionar `authToken: process.env.TURSO_AUTH_TOKEN` ao `createClient()`
2. `server/drizzle.config.ts`: adicionar `authToken: process.env.TURSO_AUTH_TOKEN` em `dbCredentials`
3. Remover `encryptionKey` do `createClient()` (criptografia passa a ser gerenciada pelo Turso)
4. Atualizar `DATABASE_URL` para `libsql://[seu-db].turso.io`
5. Configurar `TURSO_AUTH_TOKEN` no Infisical
6. Executar `bun run db:push` para aplicar o schema no banco cloud
7. Migrar dados com as ferramentas de importação Turso
8. Remover `chmod 600` dos scripts de deploy

## Database Schema

See `src/db/schema.ts` for the full Drizzle schema definition.

### Tenant Isolation

All tenant-scoped tables (`presentations`, `slides`, `brand_kits`, `workspace_defaults`) include a non-null `workspace_id` foreign key. All queries MUST filter by `workspace_id` to enforce multi-tenant isolation.

## Commands

```bash
bun run dev        # Start dev server with auto-reload
bun run start      # Start production server
bun run db:push    # Push schema changes to database
```
