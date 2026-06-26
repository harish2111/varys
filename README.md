# Varys — AI-Powered Connector QA Platform

Hybrid **deterministic + RAG + LLM** validation engine that checks TypeScript iPaaS
connectors (Konnectify DSL) against official vendor API documentation. Engineered for
8–10 simultaneous app QA runs.

> **The LLM is never the source of truth.** Truth comes from three deterministic
> sources — the vendor documentation knowledge base, the connector's parsed AST, and
> live runtime execution. Gemini only compares, explains, and surfaces edge cases.

## Architecture

Seven independently deployable NestJS services in a pnpm/Turborepo monorepo, backed by
PostgreSQL 15 + pgvector, Redis (BullMQ), and the Gemini API behind a single rate-governed
gateway. See [`docs/`](./docs) and the architecture specification for full detail.

| Service | Role |
| --- | --- |
| `qa-gateway` | HTTP API, auth, RLS, admission (cap 10), reports |
| `qa-orchestrator` | AST extraction, deterministic gate, fan-out |
| `qa-unit-worker` | RAG retrieval + Gemini unit validation |
| `qa-sandbox-worker` | isolated-vm mock/live execution |
| `qa-aggregator` | confidence scoring + report roll-up |
| `doc-ingestor` | Playwright crawl, chunk, embed |
| `llm-gateway` | Gemini client, rate governor, cost meter |

Shared libraries live in `packages/*` (`config`, `contracts`, `telemetry`, `db`, `queue`,
`ast`, `rules-engine`, `llm-client`, `retrieval`). Services depend only on packages, never
on each other's source.

## Local development

```bash
# 1. Bring up infrastructure (postgres+pgvector, pgbouncer, redis, minio, squid)
docker compose -f infra/docker-compose.yml up -d

# 2. Install + build
pnpm install
pnpm build

# 3. Configure
cp .env.example .env

# 4. Migrate the database (runs as the owner role; sets up RLS)
pnpm db:migrate

# 5. Run the test suite
pnpm test

# 6. Start the services
pnpm dev
```

## Connector validation flow (spec §6)

`Phase 0` AST-hash admission → `Phase 1` static extraction → `Phase 2` deterministic gate →
`Phase 3` RAG retrieval → `Phase 4` LLM unit validation → `Phase 5` runtime (optional) →
`Phase 6` back-verify + aggregate.

## Status

Built incrementally by phase:

- **Phase 0 — Foundation**: monorepo, shared libs, DB + RLS, config, telemetry. ✅
- **Phase 1 — Deterministic core**: gateway, AST extraction, deterministic engine,
  aggregator, end-to-end deterministic run. 🚧
- **Phase 2 — AI + scale**: ingestion, retrieval, governor, unit-worker, two-tier queues.
- **Phase 3 — Runtime + hardening**: sandbox, RLS hardening, observability, auto-repair.
- **Phase 4 — Frontend** (`varys-ui` repo).
