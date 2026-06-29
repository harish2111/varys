# Phase 2 — AI + Scale

Phase 2 adds the RAG + LLM validation path and the concurrency machinery on top of the
Phase 1 deterministic core.

## New components

| Component | Role |
| --- | --- |
| `@varys/llm-client` | Gemini wrapper behind a mockable transport: scoped unit-validation prompt (§12.2), embeddings, cost calc, model routing, plus the `LlmGatewayClient` workers use |
| `@varys/retrieval` | Hybrid per-unit retrieval (§9.2): pgvector cosine + tsvector FTS fused by **RRF**, optional rerank, top-3 contracts |
| `llm-gateway` | The **sole Gemini conduit**: Redis token-bucket **governor** (RPM+TPM per model), Flash→Pro routing, cost metering to `gemini_usage`, internal-auth only |
| `qa-unit-worker` | Per-unit: AST-hash cache → retrieval → contract deterministic gate → scoped LLM → **back-verification** → findings; atomic run-completion |
| `doc-ingestor` | KB population: parse OpenAPI / GraphQL SDL → per-endpoint contracts → hierarchical chunks (§9.1) → embed → pgvector |

## Flow (spec §6)

```
gateway → app-queue → orchestrator
  Phase 0  AST-hash admission (cache short-circuit in unit worker)
  Phase 1  static extraction (Konnectify DSL)
  Phase 2  structural deterministic gate   ── CRITICAL → short-circuit (no LLM spend)
           └ survivors fanned out (weighted-fair) → unit-queue → qa-unit-worker
  Phase 3  RAG retrieval (embed via llm-gateway, vector+FTS+RRF)
  Phase 2′ contract deterministic gate (now that a contract is mapped)
  Phase 4  scoped LLM validation via llm-gateway (Flash default, Pro on escalation)
  Phase 6  back-verification (discard untraceable findings) → write
  → aggregate-queue → qa-aggregator finalizes when units_completed == units_total
```

## The Gemini governor (§4.2, §15)

All traffic flows through `llm-gateway`. A Redis token bucket (atomic Lua) enforces RPM and
TPM per model class; a call is admitted only when **both** buckets have capacity, so workers
backpressure instead of 429-storming. Buckets are sized from `GOVERNOR_*` env (seed from the
project's real quota tier before launch). Cost is metered per call into `gemini_usage`.

## Cost controls (§15)

- **Deterministic filter** removes structurally-broken units before the LLM.
- **AST-hash cache** reuses prior LLM findings for unchanged units across runs.
- **Flash-first routing**; Pro only for webhook/crypto audits or low-confidence re-checks.
- **Back-verification** discards hallucinated findings (untraceable target fields).

## Ingest a knowledge base

```bash
curl -XPOST localhost:3000/v1/ingestion/run \
  -H "Authorization: Bearer $TOKEN" -H 'content-type: application/json' \
  -d '{"namespace":"hubspot-v3","vendor":"hubspot","apiVersion":"v3","contractKind":"REST","openapi":{...}}'
# GraphQL: {"contractKind":"GRAPHQL","graphqlSdl":"type Query { ... }"}
```

## Autoscaling & deploy

`infra/helm/varys` templates Deployments/Services and **KEDA ScaledObjects** that scale the
workers on **BullMQ queue depth** (`bull:<queue>:wait`), while HTTP services scale on CPU
(spec §4.3). The sandbox worker runs on a tainted node pool. Images build from the root
`Dockerfile` (`--build-arg SERVICE=<name>`).
