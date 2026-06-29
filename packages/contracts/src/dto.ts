import { z } from 'zod';

/**
 * Connector submission (spec: stringified `.ts` via POST + connector meta + creds).
 * `source` is the full connector TypeScript as a string. `meta.namespace` declares the
 * target vendor namespace (answer to "vendor declared in connector meta").
 */
export const submitConnectorSchema = z.object({
  source: z.string().min(1, 'connector source is required'),
  meta: z.object({
    /** Optional override; otherwise derived from the App object's id/name/version. */
    namespace: z.string().optional(),
    vendor: z.string().optional(),
    apiVersion: z.string().optional(),
    /** Connector display name for the run record. */
    name: z.string().optional(),
  }),
  options: z
    .object({
      /** Run deterministic checks only (skip LLM + runtime). */
      deterministicOnly: z.boolean().default(false),
      /** Enable runtime sandbox verification (Phase 3). */
      runtime: z.boolean().default(false),
      /** Live runtime (requires credentials); otherwise mock-only. */
      live: z.boolean().default(false),
    })
    .default({ deterministicOnly: false, runtime: false, live: false }),
  /**
   * Vendor sandbox credentials supplied at submission time (answer Q35). Injected into
   * the sandbox in-memory only; never persisted to disk/DB.
   */
  credentials: z.record(z.string(), z.unknown()).optional(),
});

export type SubmitConnectorDto = z.infer<typeof submitConnectorSchema>;

export const submitConnectorResponseSchema = z.object({
  runId: z.string().uuid(),
  status: z.string(),
  unitsDiscovered: z.number().int(),
  admitted: z.boolean(),
  queuePosition: z.number().int().nullable(),
});
export type SubmitConnectorResponse = z.infer<typeof submitConnectorResponseSchema>;

export const runStatusResponseSchema = z.object({
  runId: z.string().uuid(),
  status: z.string(),
  phase: z.string().nullable(),
  progress: z.object({
    total: z.number().int(),
    completed: z.number().int(),
    shortCircuited: z.number().int(),
  }),
  queuePosition: z.number().int().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type RunStatusResponse = z.infer<typeof runStatusResponseSchema>;
