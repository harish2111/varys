# Phase 1 — Deterministic Core

Phase 1 delivers an end-to-end **deterministic** validation run: submit a connector → AST
extraction → deterministic gate → report. No LLM or runtime sandbox yet (Phases 2–3).

## Services in play

- **qa-gateway** — HTTP API: auth, connector submission, admission, run status/report.
- **qa-orchestrator** — consumes the app queue: AST extraction, element persistence,
  deterministic gate, fan-out to the aggregator. Worker concurrency = `APP_QUEUE_CONCURRENCY`
  (the global admission limit).
- **qa-aggregator** — finalizes runs (summary, completion).

## Run it locally

```bash
docker compose -f infra/docker-compose.yml up -d   # postgres+pgvector, pgbouncer, redis, minio, squid
pnpm install && pnpm build
cp .env.example .env
pnpm db:migrate                                     # applies migrations + RLS as the owner role
pnpm --filter @varys/qa-gateway start &             # :3000
pnpm --filter @varys/qa-orchestrator start &
pnpm --filter @varys/qa-aggregator start &
```

## API (v1)

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| POST | `/v1/auth/register` | — | Create org + owner; returns `accessToken` |
| POST | `/v1/auth/login` | — | Returns `accessToken` |
| POST | `/v1/auth/api-keys` | Bearer | Mint an API key (returned once) |
| POST | `/v1/connectors/validate` | Bearer / `X-Api-Key` | Submit a connector (stringified `.ts` + meta + options + credentials); returns `runId` |
| GET | `/v1/runs` | Bearer / `X-Api-Key` | List recent runs |
| GET | `/v1/runs/:id` | Bearer / `X-Api-Key` | Run status + progress + queue position |
| GET | `/v1/runs/:id/report` | Bearer / `X-Api-Key` | Findings grouped by severity + summary |
| GET | `/healthz`, `/readyz` | — | Liveness / readiness |

### Submit example

```bash
curl -XPOST localhost:3000/v1/connectors/validate \
  -H "Authorization: Bearer $TOKEN" -H 'content-type: application/json' \
  -d '{"source":"<stringified connector .ts>","meta":{},"options":{"deterministicOnly":true}}'
# -> { "runId": "...", "status": "QUEUED", "unitsDiscovered": 9, "admitted": true, "queuePosition": 0 }
```

## Deterministic rules (spec §11)

Structural rules run with or without a documentation contract; contract rules run once the
KB is ingested (Phase 2):

- `structural.no-operation` (CRITICAL) — action issues no HTTP/GraphQL call.
- `structural.missing-auth` (WARNING) — auth required by the connection but no header injected.
- `structural.no-pagination` (INFO) — list-style action with no pagination control.
- `rest.method-path` (CRITICAL) — HTTP method mismatch vs documentation.
- `rest.missing-path-param` (CRITICAL) — documented path parameter not supplied.
- `rest.auth-mismatch` (CRITICAL) — auth scheme differs from documentation.
- `rest.schema-subtype` (CRITICAL/WARNING) — required-field presence + type compatibility.
- `graphql.operation` (CRITICAL/WARNING) — required variables + field availability vs SDL.

A CRITICAL finding short-circuits the unit (straight to the report, no LLM spend).

## Testing

- `pnpm test` — unit tests (AST extraction against Fathom/SuperOps/Freshservice, rules engine,
  DTO validation).
- The orchestrator integration test (`apps/qa-orchestrator/test/pipeline.integration.test.ts`)
  runs the full pipeline against real Postgres+Redis; it skips automatically when infra is
  unavailable and runs in CI via service containers.
