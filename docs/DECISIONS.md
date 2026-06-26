# Architecture Decisions & Spec Reconciliations

This document records the technology decisions and the points where the implementation
adapts the architecture specification to the **real Konnectify connector DSL**.

## Locked technology decisions

| Area | Decision |
| --- | --- |
| Runtime | Node 22 LTS, TypeScript 5.6.3 (pinned — the AST extractor uses this compiler API) |
| Monorepo | pnpm 10 + Turborepo 2 (`apps/*`, `packages/*`) |
| Framework | NestJS 11 across all services |
| Database | PostgreSQL 15 + pgvector; Drizzle ORM + a SQL migration runner |
| Connection pooling | PgBouncer transaction mode; RLS via `SET LOCAL app.current_org_id` per transaction |
| Queues | BullMQ 5 on Redis 7; two-tier (app/unit) + runtime/aggregate/ingestion |
| AI (Phase 2+) | `@google/genai`; `gemini-2.5-flash` default, `gemini-2.5-pro` on escalation, `gemini-embedding-001` @ 768-d |
| Escalation | Flash → Pro when confidence < 0.85 or category ∈ {AUTH, crypto} |
| Auth | JWT (email/password) + API keys for CI; org/user/membership model, roles OWNER/ADMIN/DEVELOPER/REVIEWER |
| IaC / deploy | Terraform (GCP) + Helm + KEDA (queue-depth autoscaling); GitHub Actions test-gate → build → deploy |
| Rollback | `helm rollback` + reversible Drizzle down-migrations |
| Observability | OpenTelemetry → Cloud Trace/Monitoring; pino structured logs with secret redaction |
| Testing | Jest + Testcontainers/CI service containers; the 4 sample connectors as golden fixtures |

## Spec ↔ DSL reconciliations

The architecture doc (§10, §11) assumed a connector shape that differs from the actual
Konnectify DSL. The implementation is built to the **real** DSL:

1. **One `App` object, not loose `export const actions = {}`.** Units are the entries of
   `app.actions` and `app.triggers` (including factory-call triggers such as
   `createFathomWebhook(...)`). Vendor namespace is derived from `app.id` (e.g.
   `fathom-1.0.0`).

2. **Schemas are runtime functions, not declarative Zod/TypeBox.** `input_schema.fields` /
   `output_schema.fields` are `async () => Field[]`. The extractor resolves literal `Field[]`
   arrays and derives output schemas from recovered `sample` object literals; dynamically
   generated schemas are flagged as diagnostics rather than guessed.

3. **HTTP is `context.fetch(...)` behind helper functions; one connector is GraphQL.**
   - REST (Fathom, Freshservice): the extractor traces request helpers
     (`makeFathomRequest`, `fetchAllPages` delegation) and direct `context.fetch` to recover
     method, path template, query params, and auth scheme.
   - GraphQL (SuperOps): operations are recovered from the `dynamicFunctions` operation map
     and the query name passed to the request helper. Contracts therefore support **both**
     OpenAPI (REST) and GraphQL SDL.

4. **Sandbox mock interception (Phase 3).** Because the DSL already abstracts HTTP behind
   `context.fetch`, the sandbox injects its own `fetch` into the isolate (records the request
   in mock mode, proxies via the Squid allowlist in live mode). This resolves the §13
   "nock-in-isolate" contradiction — no nock is needed.

## Designed-but-spec-silent tables

The spec fully specified only four tables. The following were designed to the same
org-scoped + RLS pattern: `organizations`, `users`, `memberships`, `api_keys`,
`api_document_namespaces`, `connectors`, `validation_runs`, `runtime_executions`,
`audit_log`. A `search_tsv` generated column + GIN index were added to
`api_document_chunks` because §9.2 requires full-text search but the original DDL omitted it.
