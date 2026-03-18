# Slideflow Backend

Bun + Hono backend for Slideflow's AI generation pipeline with tRPC SSE streaming, Google ADK multi-agent orchestration, and Turso vector RAG.

## Environment Variables

### Required

- `DATABASE_URL` — Database connection string
  - Development: `file:local.db` (relative, executado a partir de `server/`)
  - Production (VPS Hostinger): `file:/var/data/slideflow/local.db` (caminho absoluto obrigatório)

### Optional

- `CORS_ORIGIN` — Allowed CORS origin for frontend requests (default: `http://localhost:5173`)

## Local Development

```bash
# Install dependencies
bun install

# Set up environment (desenvolvimento local)
echo "DATABASE_URL=file:local.db" > .env

# Run migrations
bun run db:push

# Start dev server (with auto-reload)
bun run dev
```

The server will start at `http://127.0.0.1:3000`.

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
