import {
  boolean,
  char,
  customType,
  index,
  integer,
  jsonb,
  numeric,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

/** pgvector column type (768-d, gemini-embedding-001). */
const vector = customType<{ data: number[]; driverData: string }>({
  dataType() {
    return 'vector(768)';
  },
  toDriver(value: number[]): string {
    return `[${value.join(',')}]`;
  },
  fromDriver(value: string): number[] {
    return value.replace(/[[\]]/g, '').split(',').map(Number);
  },
});

// ---- Auth backbone ----------------------------------------------------------
export const organizations = pgTable('organizations', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 200 }).notNull(),
  slug: varchar('slug', { length: 120 }).notNull().unique(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  displayName: varchar('display_name', { length: 200 }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const memberships = pgTable(
  'memberships',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    orgId: uuid('org_id').notNull(),
    userId: uuid('user_id').notNull(),
    role: varchar('role', { length: 20 }).notNull().default('DEVELOPER'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({ uniq: uniqueIndex('memberships_org_user').on(t.orgId, t.userId) }),
);

export const apiKeys = pgTable('api_keys', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull(),
  name: varchar('name', { length: 120 }).notNull(),
  prefix: varchar('prefix', { length: 16 }).notNull(),
  hashedKey: text('hashed_key').notNull(),
  createdBy: uuid('created_by'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  lastUsedAt: timestamp('last_used_at', { withTimezone: true }),
  revokedAt: timestamp('revoked_at', { withTimezone: true }),
});

// ---- Knowledge base ---------------------------------------------------------
export const apiDocumentNamespaces = pgTable('api_document_namespaces', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull(),
  vendor: varchar('vendor', { length: 100 }).notNull(),
  apiVersion: varchar('api_version', { length: 50 }).notNull(),
  namespace: varchar('namespace', { length: 150 }).notNull(),
  contractKind: varchar('contract_kind', { length: 10 }).notNull().default('REST'),
  rootUrl: text('root_url'),
  allowedDomains: text('allowed_domains').array().notNull().default([]),
  etag: text('etag'),
  lastCrawledAt: timestamp('last_crawled_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const apiDocumentChunks = pgTable(
  'api_document_chunks',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    orgId: uuid('org_id').notNull(),
    namespaceId: uuid('namespace_id').notNull(),
    vendor: varchar('vendor', { length: 100 }).notNull(),
    apiVersion: varchar('api_version', { length: 50 }).notNull(),
    resourceGroup: varchar('resource_group', { length: 100 }).notNull(),
    httpMethod: varchar('http_method', { length: 10 }).notNull(),
    endpointPath: varchar('endpoint_path', { length: 255 }).notNull(),
    content: text('content').notNull(),
    embedding: vector('embedding').notNull(),
    rawOpenapiJson: jsonb('raw_openapi_json'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({ lookup: index('chunks_lookup_idx').on(t.orgId, t.vendor, t.apiVersion, t.httpMethod) }),
);

// ---- Connectors / runs ------------------------------------------------------
export const connectors = pgTable('connectors', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull(),
  namespace: varchar('namespace', { length: 150 }).notNull(),
  appId: varchar('app_id', { length: 150 }).notNull(),
  name: varchar('name', { length: 150 }).notNull(),
  version: varchar('version', { length: 50 }).notNull(),
  contractKind: varchar('contract_kind', { length: 10 }).notNull().default('REST'),
  sourceHash: char('source_hash', { length: 64 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const connectorElements = pgTable(
  'connector_elements',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    orgId: uuid('org_id').notNull(),
    connectorId: uuid('connector_id').notNull(),
    elementType: varchar('element_type', { length: 20 }).notNull(),
    name: varchar('name', { length: 100 }).notNull(),
    astMetadata: jsonb('ast_metadata').notNull(),
    astHash: char('ast_hash', { length: 64 }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    uniq: uniqueIndex('elements_unique').on(t.connectorId, t.elementType, t.name),
    hash: index('elements_hash_idx').on(t.orgId, t.astHash),
  }),
);

export const validationRuns = pgTable('validation_runs', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull(),
  connectorId: uuid('connector_id'),
  status: varchar('status', { length: 24 }).notNull().default('QUEUED'),
  phase: varchar('phase', { length: 24 }),
  options: jsonb('options').notNull().default({}),
  unitsTotal: integer('units_total').notNull().default(0),
  unitsCompleted: integer('units_completed').notNull().default(0),
  unitsShortCircuited: integer('units_short_circuited').notNull().default(0),
  runtimeUnitsTotal: integer('runtime_units_total').notNull().default(0),
  runtimeUnitsCompleted: integer('runtime_units_completed').notNull().default(0),
  queuePosition: integer('queue_position'),
  /** Consolidated Markdown report generated by the aggregator (spec LangGraph §5.5). */
  reportMd: text('report_md'),
  error: text('error'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  completedAt: timestamp('completed_at', { withTimezone: true }),
});

export const validationFindings = pgTable(
  'validation_findings',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    orgId: uuid('org_id').notNull(),
    runId: uuid('run_id').notNull(),
    elementId: uuid('element_id'),
    ruleId: varchar('rule_id', { length: 100 }).notNull(),
    severity: varchar('severity', { length: 10 }).notNull(),
    category: varchar('category', { length: 50 }).notNull(),
    source: varchar('source', { length: 20 }).notNull().default('deterministic'),
    confidenceScore: numeric('confidence_score', { precision: 3, scale: 2 }).notNull(),
    targetPath: text('target_path'),
    message: text('message').notNull(),
    hitl: boolean('hitl').notNull().default(false),
    hitlStatus: varchar('hitl_status', { length: 16 }),
    details: jsonb('details'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({ run: index('findings_run_idx').on(t.orgId, t.runId, t.severity) }),
);

export const runtimeExecutions = pgTable('runtime_executions', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull(),
  runId: uuid('run_id').notNull(),
  elementId: uuid('element_id'),
  mode: varchar('mode', { length: 8 }).notNull(),
  status: varchar('status', { length: 24 }).notNull(),
  capturedRequest: jsonb('captured_request'),
  capturedResponse: jsonb('captured_response'),
  contractDiff: jsonb('contract_diff'),
  durationMs: integer('duration_ms'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const geminiUsage = pgTable('gemini_usage', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull(),
  runId: uuid('run_id'),
  model: varchar('model', { length: 50 }).notNull(),
  operation: varchar('operation', { length: 24 }).notNull().default('validation'),
  inputTokens: integer('input_tokens').notNull().default(0),
  cachedTokens: integer('cached_tokens').notNull().default(0),
  outputTokens: integer('output_tokens').notNull().default(0),
  costUsd: numeric('cost_usd', { precision: 10, scale: 5 }).notNull().default('0'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const auditLog = pgTable('audit_log', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull(),
  actorType: varchar('actor_type', { length: 16 }).notNull(),
  actorId: uuid('actor_id'),
  action: varchar('action', { length: 80 }).notNull(),
  entity: varchar('entity', { length: 80 }),
  entityId: uuid('entity_id'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const schema = {
  organizations,
  users,
  memberships,
  apiKeys,
  apiDocumentNamespaces,
  apiDocumentChunks,
  connectors,
  connectorElements,
  validationRuns,
  validationFindings,
  runtimeExecutions,
  geminiUsage,
  auditLog,
};
