import {
  Action,
  App,
  AppContext,
  DataPayload,
  ExecutionPayload,
  Field,
  ObjectDefinitions,
  RequestMethods,
  WebhookTrigger,
} from "../src/dsl/konnectify-dsl";

const FIRECRAWL_BASE_URL = "https://api.firecrawl.dev/v2";
const EMPTY_FIELDS = { fields: async (): Promise<Field[]> => [] };
const RETRYABLE_RESPONSES = [500, 502, 503, 504] as const;

const actionDefaults = {
  batch: false,
  batch_size: 0,
  bulk: false,
  deprecated: false,
  cursor_enabled: false,
  has_config_fields: false,
  has_custom_fields: false,
  config_fields: EMPTY_FIELDS,
  pick_lists: {},
  retry_on_response: [...RETRYABLE_RESPONSES],
  max_retries: 3,
};

const webhookTriggerDefaults = {
  type: "webhook" as const,
  hook_type: "per_event" as const,
  batch: false,
  batch_size: 0,
  bulk: false,
  deprecated: false,
  cursor_enabled: false,
  has_config_fields: false,
  has_custom_fields: false,
  config_fields: EMPTY_FIELDS,
  pick_lists: {},
  input_schema: EMPTY_FIELDS,
  webhook_response_type: "application/json" as const,
  webhook_response_body: JSON.stringify({ received: true }),
  webhook_response_headers: JSON.stringify({
    "Content-Type": "application/json",
  }),
  webhook_response_status: 200,
  webhook_payload_type: "json" as const,
};

//Helper Functions
function normalizeArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter(Boolean).map(String) : [];
}

function removeEmpty(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(removeEmpty).filter(isPresent);
  }

  if (obj && typeof obj === "object") {
    return Object.fromEntries(
      Object.entries(obj)
        .map(([k, v]) => [k, removeEmpty(v)])
        .filter(([, v]) => isPresent(v)),
    );
  }

  return obj;
}

function isPresent(value: unknown): boolean {
  return (
    value !== undefined &&
    value !== null &&
    !(typeof value === "object" && Object.keys(value).length === 0)
  );
}

function buildNestedFields(
  target: Record<string, any>,
  source: Record<string, any>,
  prefix: string,
  fields: any[],
) {
  for (const field of fields) {
    if (typeof field === "string") {
      const key = `${prefix}.${field}`;

      if (source[key] !== undefined) {
        target[field] = source[key];
      }

      continue;
    }

    const [nestedKey, nestedFields] = Object.entries(field)[0];

    target[nestedKey] = {};

    buildNestedFields(
      target[nestedKey],
      source,
      `${prefix}.${nestedKey}`,
      nestedFields as any[],
    );

    if (Object.keys(target[nestedKey]).length === 0) {
      delete target[nestedKey];
    }
  }
}

function buildDynamicObjects(
  data: Record<string, any>,
  selectedValues: any,
  registry: Record<string, any>,
  rootKey: string,
) {
  const result = [];

  for (const value of selectedValues || []) {
    const config = registry[value];

    if (!config) continue;

    const item: Record<string, any> = {
      type: config.type || value,
    };

    buildNestedFields(item, data, `${rootKey}.${value}`, config.fields || []);

    result.push(removeEmpty(item));
  }

  return result;
}

function cleanObject(input: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(input).filter(([, value]) => {
      if (value === undefined || value === null || value === "") return false;
      if (Array.isArray(value) && value.length === 0) return false;
      return true;
    }),
  );
}

// Pick a subset of keys from an object, dropping keys whose value is undefined.
// Used for both JSON request bodies and query strings.
function pick(
  data: Record<string, unknown>,
  fields: string[],
): Record<string, unknown> {
  return Object.fromEntries(
    fields
      .filter((field) => data[field] !== undefined)
      .map((field) => [field, data[field]]),
  );
}

function startCase(value: string): string {
  return value
    .replace(/([A-Z])/g, " $1")
    .replace(/[_.-]/g, " ")
    .replace(/^./, (s) => s.toUpperCase())
    .trim();
}

function inferFieldType(name: string): Field["type"] {
  if (
    name.includes("width") ||
    name.includes("height") ||
    name.includes("quality") ||
    name.includes("scale") ||
    name.includes("timeout") ||
    name.includes("milliseconds")
  ) {
    return "number";
  }

  if (
    name.includes("fullPage") ||
    name.includes("landscape") ||
    name.includes("all")
  ) {
    return "boolean";
  }

  return "string";
}

function inferControlType(name: string): string {
  return controlForType(inferFieldType(name));
}

function controlForType(type: Field["type"]): string {
  if (type === "boolean") return "checkbox";
  if (type === "number") return "number";
  return "text";
}

function mapOpenApiType(type: string): Field["type"] {
  switch (type) {
    case "integer":
    case "number":
      return "number";
    case "boolean":
      return "boolean";
    case "array":
      return "array";
    case "object":
      return "object";
    default:
      return "string";
  }
}

function mapControlType(type: string): string {
  return controlForType(mapOpenApiType(type));
}

//Field Builders
function buildNestedInputFields(prefix: string, fields: any[]): Field[] {
  const result: Field[] = [];

  for (const field of fields) {
    if (typeof field === "string") {
      result.push({
        name: `${prefix}.${field}`,
        label: startCase(field),
        type: inferFieldType(field),
        control_type: inferControlType(field),
        optional: true,
      });

      continue;
    }

    const [parent, children] = Object.entries(field)[0];

    result.push(
      ...buildNestedInputFields(`${prefix}.${parent}`, children as any[]),
    );
  }

  return result;
}

function buildInputFields(
  selectedValues: string[],
  registry: Record<string, any>,
  prefix: string,
): Field[] {
  const fields: Field[] = [];

  for (const value of selectedValues) {
    const config = registry[value];

    if (!config?.fields) continue;

    fields.push(...buildNestedInputFields(`${prefix}.${value}`, config.fields));
  }

  return fields;
}

function getBaseInputFields(): Field[] {
  return [
    // Required
    {
      name: "url",
      label: "URL",
      type: "string",
      control_type: "url",
      optional: false,
    },

    // Content
    {
      name: "onlyMainContent",
      label: "Only Main Content",
      type: "boolean",
      control_type: "checkbox",
      optional: true,
    },
    {
      name: "onlyCleanContent",
      label: "Only Clean Content",
      type: "boolean",
      control_type: "checkbox",
      optional: true,
    },

    // Tags
    {
      name: "includeTags",
      label: "Include Tags",
      type: "array",
      of: "string",
      control_type: "text",
      optional: true,
    },
    {
      name: "excludeTags",
      label: "Exclude Tags",
      type: "array",
      of: "string",
      control_type: "text",
      optional: true,
    },

    // Cache
    {
      name: "maxAge",
      label: "Max Age",
      type: "number",
      control_type: "number",
      optional: true,
    },
    {
      name: "minAge",
      label: "Min Age",
      type: "number",
      control_type: "number",
      optional: true,
    },

    // Headers
    {
      name: "headers",
      label: "Headers",
      type: "object",
      control_type: "key_value",
      optional: true,
    },

    // Browser
    {
      name: "waitFor",
      label: "Wait For (ms)",
      type: "number",
      control_type: "number",
      optional: true,
    },
    {
      name: "mobile",
      label: "Mobile",
      type: "boolean",
      control_type: "checkbox",
      optional: true,
    },
    {
      name: "skipTlsVerification",
      label: "Skip TLS Verification",
      type: "boolean",
      control_type: "checkbox",
      optional: true,
    },
    {
      name: "timeout",
      label: "Timeout",
      type: "number",
      control_type: "number",
      optional: true,
    },

    // Location
    {
      name: "location.country",
      label: "Country",
      type: "string",
      control_type: "text",
      optional: true,
    },
    {
      name: "location.languages",
      label: "Languages",
      type: "array",
      of: "string",
      control_type: "text",
      optional: true,
    },

    // Content Processing
    {
      name: "removeBase64Images",
      label: "Remove Base64 Images",
      type: "boolean",
      control_type: "checkbox",
      optional: true,
    },

    {
      name: "blockAds",
      label: "Block Ads",
      type: "boolean",
      control_type: "checkbox",
      optional: true,
    },

    // Proxy
    {
      name: "proxy",
      label: "Proxy",
      type: "string",
      control_type: "select",
      optional: true,
      pick_list: [
        { label: "Basic", value: "basic" },
        { label: "Enhanced", value: "enhanced" },
        { label: "Auto", value: "auto" },
      ],
    },

    // Cache Settings
    {
      name: "storeInCache",
      label: "Store In Cache",
      type: "boolean",
      control_type: "checkbox",
      optional: true,
    },

    {
      name: "lockdown",
      label: "Lockdown",
      type: "boolean",
      control_type: "checkbox",
      optional: true,
    },

    {
      name: "zeroDataRetention",
      label: "Zero Data Retention",
      type: "boolean",
      control_type: "checkbox",
      optional: true,
    },

    // Redact PII
    {
      name: "redactPII",
      label: "Redact PII",
      type: "boolean",
      control_type: "checkbox",
      optional: true,
    },

    {
      name: "redactPII.mode",
      label: "Redact Mode",
      type: "string",
      control_type: "select",
      optional: true,
      pick_list: [
        { label: "Accurate", value: "accurate" },
        { label: "Aggressive", value: "aggressive" },
        { label: "Fast", value: "fast" },
      ],
    },

    {
      name: "redactPII.entities",
      label: "PII Entities",
      type: "array",
      of: "string",
      control_type: "multiselect",
      optional: true,
      pick_list: [
        { label: "Person", value: "PERSON" },
        { label: "Email", value: "EMAIL" },
        { label: "Phone", value: "PHONE" },
        { label: "Location", value: "LOCATION" },
        { label: "Financial", value: "FINANCIAL" },
        { label: "Secret", value: "SECRET" },
      ],
    },

    {
      name: "redactPII.replaceStyle",
      label: "Replace Style",
      type: "string",
      control_type: "select",
      optional: true,
      pick_list: [
        { label: "Tag", value: "tag" },
        { label: "Mask", value: "mask" },
        { label: "Remove", value: "remove" },
      ],
    },

    // Profile
    {
      name: "profile.name",
      label: "Profile Name",
      type: "string",
      control_type: "text",
      optional: true,
    },

    {
      name: "profile.saveChanges",
      label: "Save Changes",
      type: "boolean",
      control_type: "checkbox",
      optional: true,
    },

    // PDF Parser
    {
      name: "parsers.pdf.mode",
      label: "PDF Mode",
      type: "string",
      control_type: "select",
      optional: true,
      pick_list: [
        { label: "Fast", value: "fast" },
        { label: "Auto", value: "auto" },
        { label: "OCR", value: "ocr" },
      ],
    },

    {
      name: "parsers.pdf.maxPages",
      label: "PDF Max Pages",
      type: "number",
      control_type: "number",
      optional: true,
    },
  ];
}

function buildFormatInputFields(selectedFormats: unknown): Field[] {
  return buildInputFields(
    normalizeArray(selectedFormats),
    FORMAT_REGISTRY,
    "formats",
  );
}

function buildActionInputFields(selectedActions: unknown): Field[] {
  return buildInputFields(
    normalizeArray(selectedActions),
    ACTION_REGISTRY,
    "actions",
  );
}

function getBaseOutputFields(context: AppContext): Field[] {
  return context.schemaUtils.generateFlattenedSchema({
    success: true,
    data: {
      metadata: {
        title: "",
        description: "",
        sourceURL: "",
        url: "",
        statusCode: 200,
        contentType: "",
      },
    },
  });
}

// Per-format shape contributed to the scrape output sample.
const FORMAT_OUTPUT_SAMPLES: Record<string, unknown> = {
  markdown: "",
  summary: "",
  html: "",
  rawHtml: "",
  links: [""],
  images: [],
  screenshot: "",
  question: { key: "answer", value: "" },
  highlights: "",
  branding: {},
  product: {},
  menu: {},
  audio: "",
  video: "",
};

function buildFormatOutputFields(
  context: AppContext,
  selectedFormats: unknown,
): Field[] {
  const sample: Record<string, any> = { data: {} };

  for (const format of normalizeArray(selectedFormats)) {
    const value = FORMAT_OUTPUT_SAMPLES[format];

    if (value === undefined) continue;

    // "question" maps to a differently named output key.
    if (format === "question") {
      sample.data.answer = "";
      continue;
    }

    sample.data[format] = value;
  }

  return context.schemaUtils.generateFlattenedSchema(sample);
}

// Per-action shape contributed to the scrape output sample.
const ACTION_OUTPUT_SAMPLES: Record<string, [string, unknown]> = {
  screenshot: ["screenshots", [""]],
  scrape: ["scrapes", [{ url: "", html: "" }]],
  executeJavascript: ["javascriptReturns", [{ type: "", value: "" }]],
  pdf: ["pdfs", [""]],
};

function buildActionOutputFields(
  context: AppContext,
  selectedActions: unknown,
): Field[] {
  const actions: Record<string, any> = {};

  for (const action of normalizeArray(selectedActions)) {
    const entry = ACTION_OUTPUT_SAMPLES[action];

    if (!entry) continue;

    actions[entry[0]] = entry[1];
  }

  return context.schemaUtils.generateFlattenedSchema({ data: { actions } });
}

//API Key
function getApiKey(context: AppContext): string {
  const apiKey = String(
    context.auth.api_key || context.auth.access_token || "",
  );
  if (!apiKey) {
    throw new Error("Firecrawl API key is required.");
  }
  return apiKey;
}

//Firecrawl Request
async function firecrawlRequest(
  context: AppContext,
  method: RequestMethods,
  path: string,
  body?: Record<string, unknown> | FormData,
  query?: Record<string, unknown>,
): Promise<ExecutionPayload> {
  const url = new URL(
    path.startsWith("http") ? path : `${FIRECRAWL_BASE_URL}${path}`,
  );

  Object.entries(cleanObject(query || {})).forEach(([key, value]) => {
    url.searchParams.set(key, String(value));
  });

  const headers: Record<string, string> = {
    Authorization: `Bearer ${getApiKey(context)}`,
    Accept: "application/json",
  };

  const init: RequestInit = { method, headers };
  if (body instanceof FormData) {
    init.body = body;
  } else if (body && Object.keys(cleanObject(body)).length > 0) {
    headers["Content-Type"] = "application/json";
    init.body = JSON.stringify(cleanObject(body));
  } else if (!["GET", "DELETE", "HEAD"].includes(method)) {
    headers["Content-Type"] = "application/json";
    init.body = JSON.stringify({});
  }

  try {
    const response = await context.fetch(url.toString(), init);
    const text = await response.text();
    let parsed: Record<string, unknown> = {};

    if (text) {
      try {
        parsed = JSON.parse(text);
      } catch {
        parsed = { raw: text };
      }
    }

    if (!response.ok) {
      return {
        statusCode: response.status,
        data: {
          error:
            String(parsed.error || parsed.message || response.statusText) ||
            "Firecrawl request failed.",
          details: parsed,
        },
      };
    }

    return { statusCode: response.status, data: parsed };
  } catch (error: any) {
    context.logger?.error("Firecrawl API request failed:", error);
    return {
      statusCode: 500,
      data: { error: error?.message || "Unexpected Firecrawl API error." },
    };
  }
}

// Fetch a job resource (status/errors) by id, normalizing the missing-id and
// 404 cases into a consistent { dataFound } envelope.
async function fetchJobData(
  context: AppContext,
  path: string,
  id: unknown,
): Promise<ExecutionPayload> {
  if (!id) {
    return {
      statusCode: 200,
      data: { error: "Id is required to get the status" },
    };
  }

  const response = await firecrawlRequest(context, "GET", path);

  if (response.statusCode === 404) {
    return {
      statusCode: 200,
      data: { dataFound: false, message: "No data found" },
    };
  }

  return {
    ...response,
    data: { dataFound: true, ...(response.data || {}) },
  };
}

async function parseMultipartBody(
  fileUrl: string,
  options?: Record<string, unknown>,
): Promise<FormData> {
  const fileResponse = await fetch(fileUrl);

  if (!fileResponse.ok) {
    throw new Error(`Failed to download file: ${fileResponse.status}`);
  }

  const blob = await fileResponse.blob();

  const fileName = fileUrl.split("/").pop()?.split("?")[0] || "document";

  const formData = new FormData();

  formData.append("file", blob, fileName);

  if (options) {
    formData.append("options", JSON.stringify(options));
  }

  return formData;
}

// Shared scrape configuration sent by both Scrape and Batch Scrape. The caller
// adds the request-specific keys (url, urls, webhook, ...) and runs removeEmpty.
function buildScrapeOptions(data: Record<string, any>): Record<string, any> {
  return {
    onlyMainContent: data.onlyMainContent,
    onlyCleanContent: data.onlyCleanContent,
    includeTags: data.includeTags,
    excludeTags: data.excludeTags,
    maxAge: data.maxAge,
    minAge: data.minAge,
    headers: data.headers,
    waitFor: data.waitFor,
    mobile: data.mobile,
    skipTlsVerification: data.skipTlsVerification,
    timeout: data.timeout,

    location: {
      country: data["location.country"],
      languages: data["location.languages"],
    },

    proxy: data.proxy,
    blockAds: data.blockAds,
    storeInCache: data.storeInCache,
    lockdown: data.lockdown,
    removeBase64Images: data.removeBase64Images,
    zeroDataRetention: data.zeroDataRetention,

    profile: {
      name: data["profile.name"],
      saveChanges: data["profile.saveChanges"],
    },

    formats: buildDynamicObjects(data, data.formats, FORMAT_REGISTRY, "formats"),
    actions: buildDynamicObjects(data, data.actions, ACTION_REGISTRY, "actions"),
  };
}

const jsonObjectField = (
  name: string,
  label: string,
  hint: string,
  optional = true,
): Field => ({
  name,
  label,
  type: "object",
  control_type: "key_value",
  optional,
  hint,
});

const arrayField = (
  name: string,
  label: string,
  hint: string,
  optional = true,
): Field => ({
  name,
  label,
  type: "array",
  of: "string",
  optional,
  hint,
});

const idField = (name: string, label: string, hint: string): Field => ({
  name,
  label,
  type: "string",
  control_type: "text",
  hint,
});

const urlField = (hint: string): Field => ({
  name: "url",
  label: "URL",
  type: "string",
  control_type: "url",
  hint,
});

const webhookField = jsonObjectField(
  "webhook",
  "Webhook",
  "Webhook object with url, headers, metadata, and events.",
);

const scrapeOptionsField = jsonObjectField(
  "scrapeOptions",
  "Scrape Options",
  "Scrape options applied to every URL or target.",
);

const successDataOutputFields: Field[] = [
  { name: "success", label: "Success", type: "boolean" },
  { name: "data", label: "Data", type: "object", optional: true },
];

const jobStatusOutputSample = {
  dataFound: false,
  status: "<string>",
  total: 123,
  completed: 123,
  creditsUsed: 123,
  expiresAt: "2023-11-07T05:31:56Z",
  createdAt: "2023-11-07T05:31:56Z",
  completedAt: "2023-11-07T05:31:56Z",
  duration: 123,
  next: "<string>",
  data: [
    {
      markdown: "<string>",
      html: "<string>",
      rawHtml: "<string>",
      links: ["<string>"],
      screenshot: "<string>",
      metadata: {
        title: "<string>",
        description: "<string>",
        language: "<string>",
        sourceURL: "<string>",
        url: "<string>",
        keywords: "<string>",
        ogLocaleAlternate: ["<string>"],
        "<any other metadata> ": "<string>",
        statusCode: 123,
        error: "<string>",
        concurrencyLimited: true,
        concurrencyQueueDurationMs: 123,
      },
    },
  ],
};

const errorsSample = {
  errors: [
    {
      id: "<string>",
      timestamp: "<string>",
      url: "<string>",
      error: "<string>",
    },
  ],
  robotsBlocked: ["<string>"],
};

const FORMAT_REGISTRY = {
  markdown: {},
  summary: {},
  html: {},
  rawHtml: {},
  links: {},
  images: {},
  branding: {},
  product: {},
  menu: {},
  audio: {},
  video: {},

  screenshot: {
    fields: [
      "fullPage",
      "quality",
      {
        viewport: ["width", "height"],
      },
    ],
  },

  json: {
    fields: ["schema", "prompt"],
  },

  question: {
    fields: ["question"],
  },

  highlights: {
    fields: ["query"],
  },

  changeTracking: {
    fields: ["modes", "schema", "prompt", "tag"],
  },
};

const ACTION_REGISTRY = {
  wait_duration: {
    type: "wait",
    fields: ["milliseconds"],
  },

  wait_element: {
    type: "wait",
    fields: ["selector"],
  },

  screenshot: {
    fields: [
      "fullPage",
      "quality",
      {
        viewport: ["width", "height"],
      },
    ],
  },

  click: {
    fields: ["selector", "all"],
  },

  write: {
    fields: ["text"],
  },

  press: {
    fields: ["key"],
  },

  scroll: {
    fields: ["direction", "selector"],
  },

  scrape: {},

  executeJavascript: {
    fields: ["script"],
  },

  pdf: {
    fields: ["format", "landscape", "scale"],
  },
};

const PARSE_FORMAT_REGISTRY = {
  markdown: {},

  summary: {},

  html: {},

  rawHtml: {},

  links: {},

  images: {},

  json: {
    fields: ["schema", "prompt"],
  },
};

const PARSE_FORMAT_SCHEMAS = {
  json: {
    schema: {
      type: "object",
      properties: {
        schema: {
          type: "object",
        },
        prompt: {
          type: "string",
        },
      },
    },
  },

  markdown: {},
  html: {},
  summary: {},
  links: {},
  images: {},
};

function buildFieldsFromSchema(prefix: string, schema: any): Field[] {
  const fields: Field[] = [];

  if (!schema?.properties) {
    return fields;
  }

  for (const [key, property] of Object.entries<any>(schema.properties)) {
    const fieldName = prefix ? `${prefix}.${key}` : key;

    if (property.type === "object") {
      fields.push(...buildFieldsFromSchema(fieldName, property));
      continue;
    }

    fields.push({
      name: fieldName,
      label: startCase(key),
      type: mapOpenApiType(property.type),
      control_type: mapControlType(property.type),
      optional: !schema.required?.includes(key),
    });
  }

  return fields;
}

// Build a multiselect field whose options come from a registry's keys.
function registryMultiselect(
  name: string,
  label: string,
  registry: Record<string, unknown>,
): Field {
  return {
    name,
    label,
    type: "array",
    of: "string",
    control_type: "multiselect",
    optional: true,
    pick_list: Object.keys(registry).map((key) => ({
      label: startCase(key),
      value: key,
    })),
  };
}

const objectDefinitions: ObjectDefinitions = {
  empty_input: EMPTY_FIELDS,
  scrape_config: {
    fields: async (): Promise<Field[]> => [
      registryMultiselect("formats", "Formats", FORMAT_REGISTRY),
      registryMultiselect("actions", "Actions", ACTION_REGISTRY),
    ],
  },
  scrape_input: {
    fields: async (context): Promise<Field[]> => {
      const data = context.payload?.data || {};

      return [
        ...getBaseInputFields(),
        ...buildFormatInputFields(data.formats),
        ...buildActionInputFields(data.actions),
      ];
    },
  },
  scrape_output: {
    fields: async (context): Promise<Field[]> => {
      const data = context.payload?.data || {};
      return [
        ...getBaseOutputFields(context),
        ...buildFormatOutputFields(context, data.formats),
        ...buildActionOutputFields(context, data.actions),
      ];
    },
  },
  success_data_output: { fields: async () => successDataOutputFields },
  batch_scrape_input: {
    fields: async (context: AppContext) => {
      const baseFields = await objectDefinitions.scrape_input.fields(context);

      return [
        ...baseFields,
        {
          name: "urls",
          label: "URLs",
          type: "array",
          of: "string",
          optional: false,
        },

        {
          name: "maxConcurrency",
          label: "Max Concurrency",
          type: "number",
          optional: true,
        },

        {
          name: "ignoreInvalidURLs",
          label: "Ignore Invalid URLs",
          type: "boolean",
          optional: true,
        },
      ];
    },
  },
  batch_scrape_output: {
    fields: async () => [
      { name: "success", label: "Success", type: "boolean" },
      { name: "id", label: "Batch Scrape ID", type: "string" },
      { name: "url", label: "Status URL", type: "string" },
      {
        name: "invalidURLs",
        label: "Invalid URLs",
        type: "array",
        of: "string",
        optional: true,
      },
    ],
  },
  batch_scrape_id_input: {
    fields: async () => [
      idField("id", "Batch Scrape ID", "The batch scrape job ID."),
    ],
  },
  job_status_output: {
    fields: async (context: AppContext) =>
      context.schemaUtils.generateFlattenedSchema(jobStatusOutputSample),
  },
  errors_output: {
    fields: async (context: AppContext) =>
      context.schemaUtils.generateFlattenedSchema(errorsSample),
  },
  cancel_status_output: {
    fields: async () => [{ name: "status", label: "Status", type: "string" }],
  },
  parse_config: {
    fields: async (): Promise<Field[]> => [
      registryMultiselect("formats", "Formats", PARSE_FORMAT_REGISTRY),
    ],
  },
  parse_input: {
    fields: async (context) => {
      const data = context.payload?.config_fields || {};

      const fields: Field[] = [
        {
          name: "url",
          label: "Public File url",
          type: "string",
        },
      ];

      for (const format of data.formats || []) {
        const definition = PARSE_FORMAT_SCHEMAS[format];

        if (!definition?.schema) {
          continue;
        }

        fields.push(
          ...buildFieldsFromSchema(`formats.${format}`, definition.schema),
        );
      }

      return fields;
    },
  },
  crawl_input: {
    fields: async () => [
      urlField("Base URL to start crawling from."),
      {
        name: "prompt",
        label: "Prompt",
        type: "string",
        control_type: "text-area",
        optional: true,
      },
      arrayField(
        "includePaths",
        "Include Paths",
        "Regex pathname patterns to include.",
      ),
      arrayField(
        "excludePaths",
        "Exclude Paths",
        "Regex pathname patterns to exclude.",
      ),
      {
        name: "maxDiscoveryDepth",
        label: "Max Discovery Depth",
        type: "number",
        optional: true,
      },
      {
        name: "sitemap",
        label: "Sitemap",
        type: "string",
        control_type: "select",
        optional: true,
        pick_list: [
          { label: "Include", value: "include" },
          { label: "Skip", value: "skip" },
          { label: "Only", value: "only" },
        ],
      },
      {
        name: "ignoreQueryParameters",
        label: "Ignore Query Parameters",
        type: "boolean",
        optional: true,
      },
      {
        name: "regexOnFullURL",
        label: "Regex On Full URL",
        type: "boolean",
        optional: true,
      },
      { name: "limit", label: "Limit", type: "number", optional: true },
      {
        name: "crawlEntireDomain",
        label: "Crawl Entire Domain",
        type: "boolean",
        optional: true,
      },
      {
        name: "allowExternalLinks",
        label: "Allow External Links",
        type: "boolean",
        optional: true,
      },
      {
        name: "allowSubdomains",
        label: "Allow Subdomains",
        type: "boolean",
        optional: true,
      },
      {
        name: "ignoreRobotsTxt",
        label: "Ignore Robots.txt",
        type: "boolean",
        optional: true,
      },
      {
        name: "robotsUserAgent",
        label: "Robots User Agent",
        type: "string",
        optional: true,
      },
      { name: "delay", label: "Delay", type: "number", optional: true },
      {
        name: "maxConcurrency",
        label: "Max Concurrency",
        type: "number",
        optional: true,
      },
      webhookField,
      scrapeOptionsField,
      {
        name: "zeroDataRetention",
        label: "Zero Data Retention",
        type: "boolean",
        optional: true,
      },
    ],
  },
  crawl_output: {
    fields: async () => [
      { name: "success", label: "Success", type: "boolean" },
      { name: "id", label: "Crawl ID", type: "string" },
      { name: "url", label: "Status URL", type: "string" },
    ],
  },
  crawl_id_input: {
    fields: async () => [idField("id", "Crawl ID", "The crawl job ID.")],
  },
  active_crawls_output: {
    fields: async () => [
      { name: "success", label: "Success", type: "boolean" },
      { name: "crawls", label: "Crawls", type: "array", of: "object" },
    ],
  },
  crawl_params_preview_input: {
    fields: async () => [
      urlField("The URL to crawl."),
      {
        name: "prompt",
        label: "Prompt",
        type: "string",
        control_type: "text-area",
        hint: "Natural-language description of what to crawl.",
      },
    ],
  },
  map_input: {
    fields: async () => [
      urlField("Base URL to map."),
      { name: "search", label: "Search", type: "string", optional: true },
      {
        name: "sitemap",
        label: "Sitemap",
        type: "string",
        control_type: "select",
        optional: true,
        pick_list: [
          { label: "Include", value: "include" },
          { label: "Skip", value: "skip" },
          { label: "Only", value: "only" },
        ],
      },
      {
        name: "includeSubdomains",
        label: "Include Subdomains",
        type: "boolean",
        optional: true,
      },
      {
        name: "ignoreQueryParameters",
        label: "Ignore Query Parameters",
        type: "boolean",
        optional: true,
      },
      {
        name: "ignoreCache",
        label: "Ignore Cache",
        type: "boolean",
        optional: true,
      },
      { name: "limit", label: "Limit", type: "number", optional: true },
      { name: "timeout", label: "Timeout", type: "number", optional: true },
      jsonObjectField(
        "location",
        "Location",
        "Location object with country and languages.",
      ),
    ],
  },
  map_output: {
    fields: async () => [
      { name: "success", label: "Success", type: "boolean" },
      { name: "links", label: "Links", type: "array", of: "object" },
    ],
  },
  search_input: {
    fields: async () => [
      {
        name: "query",
        label: "Query",
        type: "string",
        control_type: "text",
        hint: "Search query.",
      },
      { name: "limit", label: "Limit", type: "number", optional: true },
      {
        name: "sources",
        label: "Sources",
        type: "array",
        of: "object",
        optional: true,
      },
      {
        name: "categories",
        label: "Categories",
        type: "array",
        of: "object",
        optional: true,
      },
      arrayField("includeDomains", "Include Domains", "Domains to include."),
      arrayField("excludeDomains", "Exclude Domains", "Domains to exclude."),
      { name: "tbs", label: "TBS", type: "string", optional: true },
      { name: "location", label: "Location", type: "string", optional: true },
      { name: "country", label: "Country", type: "string", optional: true },
      { name: "timeout", label: "Timeout", type: "number", optional: true },
      {
        name: "ignoreInvalidURLs",
        label: "Ignore Invalid URLs",
        type: "boolean",
        optional: true,
      },
      arrayField(
        "enterprise",
        "Enterprise",
        "Enterprise search modes such as zdr or anon.",
      ),
      scrapeOptionsField,
    ],
  },
  search_output: {
    fields: async () => [
      { name: "success", label: "Success", type: "boolean" },
      { name: "data", label: "Data", type: "object" },
      { name: "warning", label: "Warning", type: "string", optional: true },
      { name: "id", label: "Search ID", type: "string", optional: true },
      {
        name: "creditsUsed",
        label: "Credits Used",
        type: "number",
        optional: true,
      },
    ],
  },
  agent_input: {
    fields: async () => [
      {
        name: "prompt",
        label: "Prompt",
        type: "string",
        control_type: "text-area",
        hint: "Natural-language description of the data to gather.",
      },
      jsonObjectField(
        "schema",
        "Schema",
        "JSON Schema for the desired structured output.",
      ),
      arrayField("urls", "URLs", "Optional seed URLs."),
      webhookField,
      { name: "model", label: "Model", type: "string", optional: true },
    ],
  },
  agent_output: {
    fields: async () => [
      { name: "success", label: "Success", type: "boolean" },
      { name: "data", label: "Data", type: "object", optional: true },
      { name: "id", label: "Agent ID", type: "string", optional: true },
    ],
  },
  agent_id_input: {
    fields: async () => [idField("id", "Agent ID", "The agent job ID.")],
  },
  agent_status_output: {
    fields: async () => [
      { name: "success", label: "Success", type: "boolean" },
      { name: "status", label: "Status", type: "string" },
      { name: "data", label: "Data", type: "object", optional: true },
    ],
  },
  success_output: {
    fields: async () => [
      { name: "success", label: "Success", type: "boolean" },
    ],
  },
  list_browser_sessions_input: {
    fields: async () => [
      {
        name: "status",
        label: "Status",
        type: "string",
        control_type: "select",
        optional: true,
        pick_list: [
          { label: "Active", value: "active" },
          { label: "Destroyed", value: "destroyed" },
        ],
      },
    ],
  },
  sessions_output: {
    fields: async () => [
      { name: "success", label: "Success", type: "boolean" },
      { name: "sessions", label: "Sessions", type: "array", of: "object" },
    ],
  },
  create_interact_session_input: {
    fields: async () => [
      {
        name: "ttl",
        label: "TTL",
        type: "number",
        optional: true,
        hint: "Total session lifetime in seconds, from 30 to 3600.",
      },
      {
        name: "activityTtl",
        label: "Activity TTL",
        type: "number",
        optional: true,
        hint: "Seconds of inactivity before session is destroyed, from 10 to 3600.",
      },
      {
        name: "streamWebView",
        label: "Stream Web View",
        type: "boolean",
        optional: true,
      },
      jsonObjectField(
        "profile",
        "Profile",
        "Persistent storage profile with name and saveChanges.",
      ),
    ],
  },
  create_interact_session_output: {
    fields: async () => [
      { name: "success", label: "Success", type: "boolean" },
      { name: "id", label: "Session ID", type: "string" },
      { name: "cdpUrl", label: "CDP URL", type: "string" },
      { name: "liveViewUrl", label: "Live View URL", type: "string" },
      {
        name: "interactiveLiveViewUrl",
        label: "Interactive Live View URL",
        type: "string",
      },
      {
        name: "expiresAt",
        label: "Expires At",
        type: "date_time",
        optional: true,
      },
    ],
  },
  execute_code_in_session_input: {
    fields: async () => [
      idField("sessionId", "Session ID", "The Interact session ID."),
      {
        name: "code",
        label: "Code",
        type: "string",
        control_type: "text-area",
        hint: "Code to execute in the browser sandbox.",
      },
      {
        name: "language",
        label: "Language",
        type: "string",
        control_type: "select",
        optional: true,
        default: "node",
        pick_list: [
          { label: "Node", value: "node" },
          { label: "Python", value: "python" },
          { label: "Bash", value: "bash" },
        ],
      },
      { name: "timeout", label: "Timeout", type: "number", optional: true },
    ],
  },
  code_execution_output: {
    fields: async () => [
      { name: "success", label: "Success", type: "boolean" },
      { name: "stdout", label: "Stdout", type: "string", optional: true },
      { name: "result", label: "Result", type: "string", optional: true },
      { name: "stderr", label: "Stderr", type: "string", optional: true },
      { name: "exitCode", label: "Exit Code", type: "number", optional: true },
      { name: "killed", label: "Killed", type: "boolean", optional: true },
      { name: "error", label: "Error", type: "string", optional: true },
    ],
  },
  session_id_input: {
    fields: async () => [
      idField("sessionId", "Session ID", "The Interact session ID."),
    ],
  },
  interact_with_page_input: {
    fields: async () => [
      idField(
        "jobId",
        "Scrape Job ID",
        "Scrape job ID from data.metadata.scrapeId.",
      ),
      {
        name: "code",
        label: "Code",
        type: "string",
        control_type: "text-area",
        optional: true,
      },
      {
        name: "prompt",
        label: "Prompt",
        type: "string",
        control_type: "text-area",
        optional: true,
      },
      {
        name: "language",
        label: "Language",
        type: "string",
        control_type: "select",
        optional: true,
        default: "node",
        pick_list: [
          { label: "Node", value: "node" },
          { label: "Python", value: "python" },
          { label: "Bash", value: "bash" },
        ],
      },
      { name: "timeout", label: "Timeout", type: "number", optional: true },
      { name: "origin", label: "Origin", type: "string", optional: true },
    ],
  },
  interact_with_page_output: {
    fields: async () => [
      { name: "success", label: "Success", type: "boolean" },
      {
        name: "liveViewUrl",
        label: "Live View URL",
        type: "string",
        optional: true,
      },
      {
        name: "interactiveLiveViewUrl",
        label: "Interactive Live View URL",
        type: "string",
        optional: true,
      },
      { name: "output", label: "Output", type: "string", optional: true },
      ...(
        await objectDefinitions.code_execution_output.fields({} as AppContext)
      ).slice(1),
    ],
  },
  job_id_input: {
    fields: async () => [
      idField("jobId", "Scrape Job ID", "The scrape job ID."),
    ],
  },
  ask_input: {
    fields: async () => [
      {
        name: "question",
        label: "Question",
        type: "string",
        control_type: "text-area",
        hint: "Question or issue to diagnose.",
      },
      {
        name: "rationale",
        label: "Rationale",
        type: "string",
        control_type: "text-area",
        optional: true,
      },
    ],
  },
  ask_output: {
    fields: async () => [
      { name: "answer", label: "Answer", type: "string" },
      { name: "confidence", label: "Confidence", type: "string" },
      {
        name: "fixParameters",
        label: "Fix Parameters",
        type: "object",
        optional: true,
      },
      {
        name: "validation",
        label: "Validation",
        type: "object",
        optional: true,
      },
      { name: "feedback", label: "Feedback", type: "object", optional: true },
      {
        name: "durationMs",
        label: "Duration Ms",
        type: "number",
        optional: true,
      },
    ],
  },
  docs_search_input: {
    fields: async () => [
      {
        name: "question",
        label: "Question",
        type: "string",
        control_type: "text-area",
        hint: "Documentation question to answer.",
      },
    ],
  },
  docs_search_output: {
    fields: async () => [
      {
        name: "requestId",
        label: "Request ID",
        type: "string",
        optional: true,
      },
      { name: "answer", label: "Answer", type: "string" },
      { name: "evidence", label: "Evidence", type: "array", of: "object" },
      { name: "usage", label: "Usage", type: "object", optional: true },
      {
        name: "durationMs",
        label: "Duration Ms",
        type: "number",
        optional: true,
      },
    ],
  },
  create_monitor_input: {
    fields: async () => [
      { name: "name", label: "Name", type: "string", hint: "Monitor name." },
      jsonObjectField(
        "schedule",
        "Schedule",
        "Schedule object with cron or text plus timezone.",
        false,
      ),
      {
        name: "targets",
        label: "Targets",
        type: "array",
        of: "object",
        hint: "1 to 50 scrape or crawl targets.",
      },
      webhookField,
      jsonObjectField(
        "notification",
        "Notification",
        "Email notification config.",
      ),
      {
        name: "retentionDays",
        label: "Retention Days",
        type: "number",
        optional: true,
      },
      {
        name: "goal",
        label: "Goal",
        type: "string",
        control_type: "text-area",
        optional: true,
      },
      {
        name: "judgeEnabled",
        label: "Judge Enabled",
        type: "boolean",
        optional: true,
      },
    ],
  },
  monitors_output: {
    fields: async () => [
      { name: "success", label: "Success", type: "boolean" },
      { name: "data", label: "Monitors", type: "array", of: "object" },
    ],
  },
  monitor_id_input: {
    fields: async () => [idField("monitorId", "Monitor ID", "The monitor ID.")],
  },
  update_monitor_input: {
    fields: async () => [
      idField("monitorId", "Monitor ID", "The monitor ID."),
      { name: "name", label: "Name", type: "string", optional: true },
      jsonObjectField(
        "schedule",
        "Schedule",
        "Schedule object with cron or text plus timezone.",
      ),
      {
        name: "status",
        label: "Status",
        type: "string",
        control_type: "select",
        optional: true,
        pick_list: [
          { label: "Active", value: "active" },
          { label: "Paused", value: "paused" },
        ],
      },
      {
        name: "targets",
        label: "Targets",
        type: "array",
        of: "object",
        optional: true,
      },
      webhookField,
      jsonObjectField(
        "notification",
        "Notification",
        "Email notification config.",
      ),
      {
        name: "retentionDays",
        label: "Retention Days",
        type: "number",
        optional: true,
      },
      {
        name: "goal",
        label: "Goal",
        type: "string",
        control_type: "text-area",
        optional: true,
      },
      {
        name: "judgeEnabled",
        label: "Judge Enabled",
        type: "boolean",
        optional: true,
      },
    ],
  },
  run_monitor_output: {
    fields: async () => [
      { name: "success", label: "Success", type: "boolean" },
      { name: "id", label: "Check ID", type: "string" },
      { name: "data", label: "Data", type: "object", optional: true },
    ],
  },
  list_monitor_checks_input: {
    fields: async () => [
      idField("monitorId", "Monitor ID", "The monitor ID."),
      { name: "limit", label: "Limit", type: "number", optional: true },
      { name: "offset", label: "Offset", type: "number", optional: true },
      {
        name: "status",
        label: "Status",
        type: "string",
        control_type: "select",
        optional: true,
        pick_list: [
          { label: "Queued", value: "queued" },
          { label: "Running", value: "running" },
          { label: "Completed", value: "completed" },
          { label: "Failed", value: "failed" },
          { label: "Partial", value: "partial" },
          { label: "Skipped Overlap", value: "skipped_overlap" },
        ],
      },
    ],
  },
  monitor_checks_output: {
    fields: async () => [
      { name: "success", label: "Success", type: "boolean" },
      { name: "data", label: "Checks", type: "array", of: "object" },
    ],
  },
  get_monitor_check_input: {
    fields: async () => [
      idField("monitorId", "Monitor ID", "The monitor ID."),
      idField("checkId", "Check ID", "The monitor check ID."),
      { name: "limit", label: "Limit", type: "number", optional: true },
      { name: "skip", label: "Skip", type: "number", optional: true },
      {
        name: "status",
        label: "Status",
        type: "string",
        control_type: "select",
        optional: true,
        pick_list: [
          { label: "Same", value: "same" },
          { label: "New", value: "new" },
          { label: "Changed", value: "changed" },
          { label: "Removed", value: "removed" },
          { label: "Error", value: "error" },
        ],
      },
    ],
  },
  monitor_check_output: {
    fields: async () => [
      { name: "success", label: "Success", type: "boolean" },
      { name: "next", label: "Next", type: "string", optional: true },
      { name: "data", label: "Data", type: "object" },
    ],
  },
  webhook_event_output: {
    fields: async () => [
      { name: "type", label: "Event Type", type: "string" },
      { name: "id", label: "Job ID", type: "string", optional: true },
      { name: "success", label: "Success", type: "boolean", optional: true },
      { name: "error", label: "Error", type: "string", optional: true },
      { name: "metadata", label: "Metadata", type: "object", optional: true },
      {
        name: "data",
        label: "Data",
        type: "array",
        of: "object",
        optional: true,
      },
    ],
  },
};

const scrapeAction: Action = {
  ...actionDefaults,
  id: "scrape",
  name: "Scrape",
  title: "Scrape",
  subtitle: "Scrape a single URL",
  description:
    "Scrape a single URL and optionally extract information using an LLM.",
  help: "Provide a public URL and optional scrape settings. Formats default to markdown when omitted.",
  display_priority: 1,
  has_config_fields: true,
  config_fields: objectDefinitions.scrape_config,
  input_schema: objectDefinitions.scrape_input,
  output_schema: objectDefinitions.scrape_output,
  sample: {
    success: true,
    data: {
      markdown: "# Example Domain",
      metadata: { sourceURL: "https://example.com" },
    },
  },
  retry_on_request: ["POST"],
  execute: async (context) => {
    const data = context.payload.data ?? {};
    const body = removeEmpty({
      url: data.url,
      ...buildScrapeOptions(data),
    });
    return firecrawlRequest(context, "POST", "/scrape", body);
  },
};

const batchScrapeAction: Action = {
  ...actionDefaults,
  id: "batch_scrape",
  name: "Batch Scrape",
  title: "Batch Scrape",
  subtitle: "Scrape many URLs asynchronously",
  description: "Start a batch scrape job for multiple URLs.",
  help: "Use the returned id with Get Batch Scrape Status or subscribe via webhook events.",
  display_priority: 2,
  input_schema: objectDefinitions.batch_scrape_input,
  output_schema: objectDefinitions.batch_scrape_output,
  sample: {
    success: true,
    id: "550e8400-e29b-41d4-a716-446655440000",
    url: "https://api.firecrawl.dev/v2/batch/scrape/550e8400-e29b-41d4-a716-446655440000",
  },
  retry_on_request: ["POST"],
  execute: async (context) => {
    const data = context.payload.data ?? {};
    const body = removeEmpty({
      urls: data.urls,
      webhook: data.webhook,
      maxConcurrency: data.maxConcurrency,
      ignoreInvalidURLs: data.ignoreInvalidURLs,
      ...buildScrapeOptions(data),
    });
    return firecrawlRequest(context, "POST", "/batch/scrape", body);
  },
};

const getBatchScrapeStatusAction: Action = {
  ...actionDefaults,
  id: "get_batch_scrape_status",
  name: "Get Batch Scrape Status",
  title: "Get Batch Scrape Status",
  subtitle: "Retrieve batch scrape status and results",
  description:
    "Get status, progress, and accumulated results for a batch scrape job.",
  help: "Provide the batch scrape id returned by Batch Scrape.",
  display_priority: 3,
  input_schema: objectDefinitions.batch_scrape_id_input,
  output_schema: objectDefinitions.job_status_output,
  sample: {
    status: "completed",
    total: 2,
    completed: 2,
    creditsUsed: 2,
    data: [{ markdown: "..." }],
  },
  retry_on_request: ["GET"],
  execute: async (context) => {
    const id = context.payload?.data?.id;
    return fetchJobData(context, `/crawl/${id}`, id);
  },
};

const getBatchScrapeErrorsAction: Action = {
  ...actionDefaults,
  id: "get_batch_scrape_errors",
  name: "Get Batch Scrape Errors",
  title: "Get Batch Scrape Errors",
  subtitle: "Retrieve batch scrape errors",
  description:
    "Retrieve failed URLs and robots-blocked URLs for a batch scrape job.",
  help: "Provide the batch scrape id returned by Batch Scrape.",
  display_priority: 4,
  input_schema: objectDefinitions.batch_scrape_id_input,
  output_schema: objectDefinitions.errors_output,
  sample: {
    errors: [{ id: "job-id", url: "https://example.com/x", error: "timeout" }],
    robotsBlocked: [],
  },
  retry_on_request: ["GET"],
  execute: async (context) => {
    const id = context.payload?.data?.id;
    return fetchJobData(context, `/crawl/${id}/errors`, id);
  },
};

const cancelBatchScrapeAction: Action = {
  ...actionDefaults,
  id: "cancel_batch_scrape",
  name: "Cancel Batch Scrape",
  title: "Cancel Batch Scrape",
  subtitle: "Cancel a running batch scrape job",
  description: "Cancel a running batch scrape job.",
  help: "Provide the batch scrape id to cancel.",
  display_priority: 5,
  input_schema: objectDefinitions.batch_scrape_id_input,
  output_schema: objectDefinitions.cancel_status_output,
  sample: { status: "cancelled" },
  retry_on_request: ["DELETE"],
  execute: async (context) =>
    firecrawlRequest(
      context,
      "DELETE",
      `/batch/scrape/${context.payload.data.id}`,
    ),
};

const parseAction: Action = {
  ...actionDefaults,
  id: "parse",
  name: "Parse",
  title: "Parse",
  subtitle: "Parse a local or non-public file",
  description: "Upload and parse a local or non-public file.",
  help: "Send the file field as the platform-provided file/binary value and optional parse options as JSON.",
  display_priority: 6,
  input_schema: objectDefinitions.parse_input,
  output_schema: objectDefinitions.success_data_output,
  sample: {
    success: true,
    data: {
      markdown: "# Document Title",
      metadata: { contentType: "application/pdf" },
    },
  },
  retry_on_request: ["POST"],
  execute: async (context) => {
    const body = await parseMultipartBody(context.payload.data.url);
    return firecrawlRequest(context, "POST", "/parse", body);
  },
};

const crawlAction: Action = {
  ...actionDefaults,
  id: "crawl",
  name: "Crawl",
  title: "Crawl",
  subtitle: "Start a site crawl",
  description: "Start an asynchronous crawl from a base URL.",
  help: "Use the returned id with Get Crawl Status or configure webhooks for crawl events.",
  display_priority: 7,
  input_schema: objectDefinitions.crawl_input,
  output_schema: objectDefinitions.crawl_output,
  sample: {
    success: true,
    id: "123-456-789",
    url: "https://api.firecrawl.dev/v2/crawl/123-456-789",
  },
  retry_on_request: ["POST"],
  execute: async (context) =>
    firecrawlRequest(context, "POST", "/crawl", context.payload.data),
};

const getCrawlStatusAction: Action = {
  ...actionDefaults,
  id: "get_crawl_status",
  name: "Get Crawl Status",
  title: "Get Crawl Status",
  subtitle: "Retrieve crawl status and results",
  description: "Get status, progress, and paginated results for a crawl job.",
  help: "Provide the crawl id returned by Crawl.",
  display_priority: 8,
  input_schema: objectDefinitions.crawl_id_input,
  output_schema: objectDefinitions.job_status_output,
  sample: {
    status: "completed",
    total: 50,
    completed: 50,
    creditsUsed: 50,
    data: [{ markdown: "# Page" }],
  },
  retry_on_request: ["GET"],
  execute: async (context) =>
    firecrawlRequest(context, "GET", `/crawl/${context.payload.data.id}`),
};

const getCrawlErrorsAction: Action = {
  ...actionDefaults,
  id: "get_crawl_errors",
  name: "Get Crawl Errors",
  title: "Get Crawl Errors",
  subtitle: "Retrieve crawl errors",
  description:
    "Retrieve failed scrape jobs and robots-blocked URLs for a crawl job.",
  help: "Provide the crawl id returned by Crawl.",
  display_priority: 9,
  input_schema: objectDefinitions.crawl_id_input,
  output_schema: objectDefinitions.errors_output,
  sample: { errors: [], robotsBlocked: [] },
  retry_on_request: ["GET"],
  execute: async (context) =>
    firecrawlRequest(
      context,
      "GET",
      `/crawl/${context.payload.data.id}/errors`,
    ),
};

const getActiveCrawlsAction: Action = {
  ...actionDefaults,
  id: "get_active_crawls",
  name: "Get Active Crawls",
  title: "Get Active Crawls",
  subtitle: "List active crawls",
  description: "List active crawls for the authenticated team.",
  help: "Returns all currently active crawls.",
  display_priority: 10,
  input_schema: objectDefinitions.empty_input,
  output_schema: objectDefinitions.active_crawls_output,
  sample: {
    success: true,
    crawls: [{ id: "crawl-id", teamId: "team-id", url: "https://example.com" }],
  },
  retry_on_request: ["GET"],
  execute: async (context) => firecrawlRequest(context, "GET", "/crawl/active"),
};

const cancelCrawlAction: Action = {
  ...actionDefaults,
  id: "cancel_crawl",
  name: "Cancel Crawl",
  title: "Cancel Crawl",
  subtitle: "Cancel a running crawl",
  description: "Cancel a running crawl job.",
  help: "Provide the crawl id to cancel.",
  display_priority: 11,
  input_schema: objectDefinitions.crawl_id_input,
  output_schema: objectDefinitions.cancel_status_output,
  sample: { status: "cancelled" },
  retry_on_request: ["DELETE"],
  execute: async (context) =>
    firecrawlRequest(context, "DELETE", `/crawl/${context.payload.data.id}`),
};

const crawlParamsPreviewAction: Action = {
  ...actionDefaults,
  id: "crawl_params_preview",
  name: "Crawl Params Preview",
  title: "Crawl Params Preview",
  subtitle: "Preview crawl params from a prompt",
  description:
    "Translate a natural-language prompt into crawler parameters without starting a crawl.",
  help: "Provide a URL and prompt describing what to crawl.",
  display_priority: 12,
  input_schema: objectDefinitions.crawl_params_preview_input,
  output_schema: objectDefinitions.success_data_output,
  sample: {
    success: true,
    data: {
      url: "https://docs.stripe.com/api",
      includePaths: ["api/.*"],
      sitemap: "include",
    },
  },
  retry_on_request: ["POST"],
  execute: async (context) =>
    firecrawlRequest(
      context,
      "POST",
      "/crawl/params-preview",
      context.payload.data,
    ),
};

const mapAction: Action = {
  ...actionDefaults,
  id: "map",
  name: "Map",
  title: "Map",
  subtitle: "Return URLs for a website",
  description: "Return a complete list of URLs for a website.",
  help: "Provide a base URL and optional search term to order or filter links by relevance.",
  display_priority: 13,
  input_schema: objectDefinitions.map_input,
  output_schema: objectDefinitions.map_output,
  sample: {
    success: true,
    links: [{ url: "https://firecrawl.dev/blog", title: "Blog" }],
  },
  retry_on_request: ["POST"],
  execute: async (context) =>
    firecrawlRequest(context, "POST", "/map", context.payload.data),
};

const searchAction: Action = {
  ...actionDefaults,
  id: "search",
  name: "Search",
  title: "Search",
  subtitle: "Search the web",
  description: "Search the web and optionally scrape the returned results.",
  help: "Provide a search query and optional sources, categories, domain filters, time filters, location, or scrape options.",
  display_priority: 14,
  input_schema: objectDefinitions.search_input,
  output_schema: objectDefinitions.search_output,
  sample: {
    success: true,
    data: { web: [{ title: "Example", url: "https://example.com" }] },
    creditsUsed: 2,
  },
  retry_on_request: ["POST"],
  execute: async (context) =>
    firecrawlRequest(context, "POST", "/search", context.payload.data),
};

const agentAction: Action = {
  ...actionDefaults,
  id: "agent",
  name: "Agent",
  title: "Agent",
  subtitle: "Run autonomous web data gathering",
  description:
    "Autonomously search, navigate, and gather structured data from the web using a prompt.",
  help: "Provide a prompt and optionally a JSON schema, seed URLs, webhook, or model.",
  display_priority: 15,
  input_schema: objectDefinitions.agent_input,
  output_schema: objectDefinitions.agent_output,
  sample: {
    success: true,
    data: { result: "Result text", sources: ["https://example.com"] },
  },
  retry_on_request: ["POST"],
  execute: async (context) =>
    firecrawlRequest(context, "POST", "/agent", context.payload.data),
};

const getAgentStatusAction: Action = {
  ...actionDefaults,
  id: "get_agent_status",
  name: "Get Agent Status",
  title: "Get Agent Status",
  subtitle: "Retrieve agent status and result",
  description: "Retrieve status and result of an asynchronous agent job.",
  help: "Provide the agent job id returned by Agent.",
  display_priority: 16,
  input_schema: objectDefinitions.agent_id_input,
  output_schema: objectDefinitions.agent_status_output,
  sample: {
    success: true,
    status: "completed",
    data: { result: "...", sources: ["https://example.com"] },
  },
  retry_on_request: ["GET"],
  execute: async (context) =>
    firecrawlRequest(context, "GET", `/agent/${context.payload.data.id}`),
};

const cancelAgentAction: Action = {
  ...actionDefaults,
  id: "cancel_agent",
  name: "Cancel Agent",
  title: "Cancel Agent",
  subtitle: "Cancel an agent job",
  description: "Cancel a running agent job.",
  help: "Provide the agent job id to cancel.",
  display_priority: 17,
  input_schema: objectDefinitions.agent_id_input,
  output_schema: objectDefinitions.success_output,
  sample: { success: true },
  retry_on_request: ["DELETE"],
  execute: async (context) =>
    firecrawlRequest(context, "DELETE", `/agent/${context.payload.data.id}`),
};

const listBrowserSessionsAction: Action = {
  ...actionDefaults,
  id: "list_browser_sessions",
  name: "List Browser Sessions",
  title: "List Browser Sessions",
  subtitle: "List browser sessions",
  description:
    "Retrieve all browser sessions for the team, optionally filtered by status.",
  help: "Filter by active or destroyed status when needed.",
  display_priority: 18,
  input_schema: objectDefinitions.list_browser_sessions_input,
  output_schema: objectDefinitions.sessions_output,
  sample: {
    success: true,
    sessions: [
      {
        id: "550e8400-e29b-41d4-a716-446655440000",
        status: "active",
        cdpUrl: "wss://...",
      },
    ],
  },
  retry_on_request: ["GET"],
  execute: async (context) =>
    firecrawlRequest(
      context,
      "GET",
      "/browser",
      undefined,
      pick(context.payload.data, ["status"]),
    ),
};

const createInteractSessionAction: Action = {
  ...actionDefaults,
  id: "create_interact_session",
  name: "Create Interact Session",
  title: "Create Interact Session",
  subtitle: "Create a standalone Interact browser session",
  description:
    "Start a standalone Interact browser session you drive with code.",
  help: "Optionally set total session lifetime, inactivity timeout, live view streaming, and persistent profile.",
  display_priority: 19,
  input_schema: objectDefinitions.create_interact_session_input,
  output_schema: objectDefinitions.create_interact_session_output,
  sample: {
    success: true,
    id: "550e8400-e29b-41d4-a716-446655440000",
    cdpUrl:
      "wss://cdp-proxy.firecrawl.dev/cdp/550e8400-e29b-41d4-a716-446655440000",
  },
  retry_on_request: ["POST"],
  execute: async (context) =>
    firecrawlRequest(context, "POST", "/interact", context.payload.data),
};

const executeCodeInSessionAction: Action = {
  ...actionDefaults,
  id: "execute_code_in_session",
  name: "Execute Code in a Session",
  title: "Execute Code in a Session",
  subtitle: "Run code in a standalone Interact session",
  description:
    "Run Playwright or agent-browser code in a standalone Interact session.",
  help: "Provide the interact session ID and code to execute.",
  display_priority: 20,
  input_schema: objectDefinitions.execute_code_in_session_input,
  output_schema: objectDefinitions.code_execution_output,
  sample: { success: true, result: "Example Domain" },
  retry_on_request: ["POST"],
  execute: async (context) =>
    firecrawlRequest(
      context,
      "POST",
      `/interact/${context.payload.data.sessionId}/execute`,
      pick(context.payload.data, ["code", "language", "timeout"]),
    ),
};

const listInteractSessionsAction: Action = {
  ...actionDefaults,
  id: "list_interact_sessions",
  name: "List Interact Sessions",
  title: "List Interact Sessions",
  subtitle: "List standalone Interact sessions",
  description: "Retrieve standalone Interact sessions.",
  help: "Returns standalone Interact sessions for the team.",
  display_priority: 21,
  input_schema: objectDefinitions.empty_input,
  output_schema: objectDefinitions.sessions_output,
  sample: {
    success: true,
    sessions: [
      { id: "550e8400-e29b-41d4-a716-446655440000", status: "active" },
    ],
  },
  retry_on_request: ["GET"],
  execute: async (context) => firecrawlRequest(context, "GET", "/interact"),
};

const deleteInteractSessionAction: Action = {
  ...actionDefaults,
  id: "delete_interact_session",
  name: "Delete Interact Session",
  title: "Delete Interact Session",
  subtitle: "Destroy an Interact session",
  description:
    "Destroy a standalone Interact session and release its resources.",
  help: "Provide the Interact session ID to delete.",
  display_priority: 22,
  input_schema: objectDefinitions.session_id_input,
  output_schema: objectDefinitions.success_output,
  sample: { success: true },
  retry_on_request: ["DELETE"],
  execute: async (context) =>
    firecrawlRequest(
      context,
      "DELETE",
      `/interact/${context.payload.data.sessionId}`,
    ),
};

const interactWithPageAction: Action = {
  ...actionDefaults,
  id: "interact_with_page",
  name: "Interact with the Page",
  title: "Interact with the Page",
  subtitle: "Interact with a scrape browser",
  description: "Run code or an AI prompt in a scrape job's browser.",
  help: "Provide the scrape job ID from data.metadata.scrapeId and either code or prompt.",
  display_priority: 23,
  input_schema: objectDefinitions.interact_with_page_input,
  output_schema: objectDefinitions.interact_with_page_output,
  sample: {
    success: true,
    output: "The Pro plan costs $49/month.",
    exitCode: 0,
    killed: false,
  },
  retry_on_request: ["POST"],
  execute: async (context) =>
    firecrawlRequest(
      context,
      "POST",
      `/scrape/${context.payload.data.jobId}/interact`,
      pick(context.payload.data, [
        "code",
        "prompt",
        "language",
        "timeout",
        "origin",
      ]),
    ),
};

const stopInteractingAction: Action = {
  ...actionDefaults,
  id: "stop_interacting",
  name: "Stop Interacting",
  title: "Stop Interacting",
  subtitle: "Stop a scrape browser session",
  description:
    "Stop the interactive browser session associated with a scrape job.",
  help: "Provide the scrape job ID to release the browser session.",
  display_priority: 24,
  input_schema: objectDefinitions.job_id_input,
  output_schema: objectDefinitions.success_output,
  sample: { success: true },
  retry_on_request: ["DELETE"],
  execute: async (context) =>
    firecrawlRequest(
      context,
      "DELETE",
      `/scrape/${context.payload.data.jobId}/interact`,
    ),
};

const askAction: Action = {
  ...actionDefaults,
  id: "ask",
  name: "Ask",
  title: "Ask",
  subtitle: "Ask Firecrawl support agent",
  description:
    "AI support agent diagnoses Firecrawl job, account, and API issues.",
  help: "Provide a question and optional rationale.",
  display_priority: 25,
  input_schema: objectDefinitions.ask_input,
  output_schema: objectDefinitions.ask_output,
  sample: {
    answer: "Your crawl was limited by maxDiscoveryDepth.",
    confidence: "high",
    durationMs: 18234,
  },
  retry_on_request: ["POST"],
  execute: async (context) =>
    firecrawlRequest(context, "POST", "/support/ask", context.payload.data),
};

const docsSearchAction: Action = {
  ...actionDefaults,
  id: "docs_search",
  name: "Docs Search",
  title: "Docs Search",
  subtitle: "Ask Firecrawl docs",
  description: "Answer questions from the Firecrawl docs corpus.",
  help: "Provide a natural-language documentation question.",
  display_priority: 26,
  input_schema: objectDefinitions.docs_search_input,
  output_schema: objectDefinitions.docs_search_output,
  sample: {
    requestId: "req-id",
    answer: "The signature is sent in X-Firecrawl-Signature.",
    evidence: [
      {
        pathOrUrl: "webhooks/security",
        reason: "Documents signature verification",
      },
    ],
  },
  retry_on_request: ["POST"],
  execute: async (context) =>
    firecrawlRequest(
      context,
      "POST",
      "/support/docs-search",
      context.payload.data,
    ),
};

const createMonitorAction: Action = {
  ...actionDefaults,
  id: "create_monitor",
  name: "Create Monitor",
  title: "Create Monitor",
  subtitle: "Create a scheduled monitor",
  description:
    "Create a scheduled monitor that scrapes or crawls targets and detects changes.",
  help: "Provide a name, schedule object, and targets array. Optional webhook and notification settings control delivery.",
  display_priority: 27,
  input_schema: objectDefinitions.create_monitor_input,
  output_schema: objectDefinitions.success_data_output,
  sample: {
    success: true,
    data: {
      id: "550e8400-e29b-41d4-a716-446655440000",
      name: "Blog monitor",
      status: "active",
    },
  },
  retry_on_request: ["POST"],
  execute: async (context) =>
    firecrawlRequest(context, "POST", "/monitor", context.payload.data),
};

const listMonitorsAction: Action = {
  ...actionDefaults,
  id: "list_monitors",
  name: "List Monitors",
  title: "List Monitors",
  subtitle: "List monitors",
  description: "List all monitors for the authenticated team.",
  help: "Returns all monitors for the team.",
  display_priority: 28,
  input_schema: objectDefinitions.empty_input,
  output_schema: objectDefinitions.monitors_output,
  sample: {
    success: true,
    data: [
      {
        id: "550e8400-e29b-41d4-a716-446655440000",
        name: "Blog monitor",
        status: "active",
      },
    ],
  },
  retry_on_request: ["GET"],
  execute: async (context) => firecrawlRequest(context, "GET", "/monitor"),
};

const getMonitorAction: Action = {
  ...actionDefaults,
  id: "get_monitor",
  name: "Get Monitor",
  title: "Get Monitor",
  subtitle: "Retrieve a monitor",
  description: "Retrieve a single monitor by ID.",
  help: "Provide the monitor ID.",
  display_priority: 29,
  input_schema: objectDefinitions.monitor_id_input,
  output_schema: objectDefinitions.success_data_output,
  sample: {
    success: true,
    data: { id: "550e8400-e29b-41d4-a716-446655440000", status: "active" },
  },
  retry_on_request: ["GET"],
  execute: async (context) =>
    firecrawlRequest(
      context,
      "GET",
      `/monitor/${context.payload.data.monitorId}`,
    ),
};

const updateMonitorAction: Action = {
  ...actionDefaults,
  id: "update_monitor",
  name: "Update Monitor",
  title: "Update Monitor",
  subtitle: "Partially update a monitor",
  description: "Partially update a monitor.",
  help: "Provide the monitor ID and at least one field to update.",
  display_priority: 30,
  input_schema: objectDefinitions.update_monitor_input,
  output_schema: objectDefinitions.success_data_output,
  sample: {
    success: true,
    data: { id: "550e8400-e29b-41d4-a716-446655440000", status: "active" },
  },
  retry_on_request: ["PATCH"],
  execute: async (context) =>
    firecrawlRequest(
      context,
      "PATCH",
      `/monitor/${context.payload.data.monitorId}`,
      pick(context.payload.data, [
        "name",
        "schedule",
        "status",
        "targets",
        "webhook",
        "notification",
        "retentionDays",
        "goal",
        "judgeEnabled",
      ]),
    ),
};

const deleteMonitorAction: Action = {
  ...actionDefaults,
  id: "delete_monitor",
  name: "Delete Monitor",
  title: "Delete Monitor",
  subtitle: "Delete a monitor",
  description: "Delete a monitor.",
  help: "Provide the monitor ID to delete.",
  display_priority: 31,
  input_schema: objectDefinitions.monitor_id_input,
  output_schema: objectDefinitions.success_output,
  sample: { success: true },
  retry_on_request: ["DELETE"],
  execute: async (context) =>
    firecrawlRequest(
      context,
      "DELETE",
      `/monitor/${context.payload.data.monitorId}`,
    ),
};

const runMonitorAction: Action = {
  ...actionDefaults,
  id: "run_monitor",
  name: "Run Monitor",
  title: "Run Monitor",
  subtitle: "Run a monitor now",
  description: "Trigger a monitor check immediately.",
  help: "Provide the monitor ID to queue a manual check.",
  display_priority: 32,
  input_schema: objectDefinitions.monitor_id_input,
  output_schema: objectDefinitions.run_monitor_output,
  sample: {
    success: true,
    id: "chk-123",
    data: { status: "queued", trigger: "manual" },
  },
  retry_on_request: ["POST"],
  execute: async (context) =>
    firecrawlRequest(
      context,
      "POST",
      `/monitor/${context.payload.data.monitorId}/run`,
      {},
    ),
};

const listMonitorChecksAction: Action = {
  ...actionDefaults,
  id: "list_monitor_checks",
  name: "List Monitor Checks",
  title: "List Monitor Checks",
  subtitle: "List checks for a monitor",
  description:
    "List checks performed for a monitor, optionally filtered by status.",
  help: "Provide the monitor ID and optional pagination or status filters.",
  display_priority: 33,
  input_schema: objectDefinitions.list_monitor_checks_input,
  output_schema: objectDefinitions.monitor_checks_output,
  sample: {
    success: true,
    data: [{ id: "chk-123", status: "completed", summary: { changed: 2 } }],
  },
  retry_on_request: ["GET"],
  execute: async (context) =>
    firecrawlRequest(
      context,
      "GET",
      `/monitor/${context.payload.data.monitorId}/checks`,
      undefined,
      pick(context.payload.data, ["limit", "offset", "status"]),
    ),
};

const getMonitorCheckAction: Action = {
  ...actionDefaults,
  id: "get_monitor_check",
  name: "Get Monitor Check",
  title: "Get Monitor Check",
  subtitle: "Retrieve a monitor check",
  description: "Retrieve a monitor check with per-page results and diffs.",
  help: "Provide monitor ID, check ID, and optional pagination or page status filter.",
  display_priority: 34,
  input_schema: objectDefinitions.get_monitor_check_input,
  output_schema: objectDefinitions.monitor_check_output,
  sample: {
    success: true,
    data: {
      id: "chk-123",
      status: "completed",
      pages: [{ url: "https://example.com", changeStatus: "changed" }],
    },
  },
  retry_on_request: ["GET"],
  execute: async (context) =>
    firecrawlRequest(
      context,
      "GET",
      `/monitor/${context.payload.data.monitorId}/checks/${context.payload.data.checkId}`,
      undefined,
      pick(context.payload.data, ["limit", "skip", "status"]),
    ),
};

// Factory for the per-event webhook triggers. Every Firecrawl webhook trigger
// only differs by its event name and descriptive copy, so the subscribe /
// add / remove / refresh / notification machinery is shared here.
function createWebhookTrigger(config: {
  id: string;
  name: string;
  event: string;
  subtitle: string;
  description: string;
  help: string;
  display_priority: number;
  sample: Record<string, unknown>;
  // page-style events dedup on the payload data when no id is present
  dedupOnData?: boolean;
}): WebhookTrigger {
  const { event } = config;

  const eventSubscription = async (context: AppContext) => ({
    event,
    webhookUrl: context.webhookEndpoint,
  });

  return {
    ...webhookTriggerDefaults,
    id: config.id,
    name: config.name,
    title: config.name,
    subtitle: config.subtitle,
    description: config.description,
    help: config.help,
    display_priority: config.display_priority,
    output_schema: objectDefinitions.webhook_event_output,
    sample: config.sample,
    webhook_key: () => event,
    dedup: (record: any) => {
      const base = record.id || record.checkId;
      if (base) return String(base);

      const suffix = config.dedupOnData
        ? `:${JSON.stringify(record.data || [])}`
        : "";

      return `${event}${suffix}:${Date.now()}`;
    },
    webhook_subscribe: eventSubscription,
    addEvent: eventSubscription,
    removeEvent: eventSubscription,
    webhook_refresh: async (_context, subscribeOutput) => subscribeOutput,
    webhook_unsubscribe: async () => null,
    webhook_notification: (_context, _input, payload) => payload,
  };
}

const CRAWL_HELP =
  "Use the generated webhook URL in a Crawl request webhook.url field.";
const BATCH_HELP =
  "Use the generated webhook URL in a Batch Scrape request webhook.url field.";
const MONITOR_HELP = "Use the generated webhook URL in a Monitor webhook.url field.";

const webhookSample = (type: string, data: unknown[] = []) => ({
  type,
  id: "job-id",
  success: true,
  data,
  metadata: {},
});

const crawlStartedTrigger = createWebhookTrigger({
  id: "crawl_started",
  name: "Crawl Started",
  event: "crawl.started",
  subtitle: "Crawl webhook event",
  description: "Sent when a crawl job begins processing.",
  help: CRAWL_HELP,
  display_priority: 1,
  sample: webhookSample("crawl.started"),
});

const crawlPageTrigger = createWebhookTrigger({
  id: "crawl_page",
  name: "Crawl Page",
  event: "crawl.page",
  subtitle: "Crawl webhook event",
  description: "Sent for each page scraped during a crawl job.",
  help: CRAWL_HELP,
  display_priority: 2,
  sample: webhookSample("crawl.page", [{ markdown: "..." }]),
  dedupOnData: true,
});

const crawlCompletedTrigger = createWebhookTrigger({
  id: "crawl_completed",
  name: "Crawl Completed",
  event: "crawl.completed",
  subtitle: "Crawl webhook event",
  description:
    "Sent when a crawl job finishes and all pages have been processed.",
  help: CRAWL_HELP,
  display_priority: 3,
  sample: webhookSample("crawl.completed"),
});

const batchScrapeStartedTrigger = createWebhookTrigger({
  id: "batch_scrape_started",
  name: "Batch Scrape Started",
  event: "batch_scrape.started",
  subtitle: "Batch Scrape webhook event",
  description: "Sent when a batch scrape job begins processing.",
  help: BATCH_HELP,
  display_priority: 4,
  sample: webhookSample("batch_scrape.started"),
});

const batchScrapePageTrigger = createWebhookTrigger({
  id: "batch_scrape_page",
  name: "Batch Scrape Page",
  event: "batch_scrape.page",
  subtitle: "Batch Scrape webhook event",
  description: "Sent for each URL scraped during a batch scrape job.",
  help: BATCH_HELP,
  display_priority: 5,
  sample: webhookSample("batch_scrape.page", [{ markdown: "..." }]),
  dedupOnData: true,
});

const batchScrapeCompletedTrigger = createWebhookTrigger({
  id: "batch_scrape_completed",
  name: "Batch Scrape Completed",
  event: "batch_scrape.completed",
  subtitle: "Batch Scrape webhook event",
  description: "Sent when all URLs in a batch scrape have been processed.",
  help: BATCH_HELP,
  display_priority: 6,
  sample: webhookSample("batch_scrape.completed"),
});

const monitorPageTrigger = createWebhookTrigger({
  id: "monitor_page",
  name: "Monitor Page",
  event: "monitor.page",
  subtitle: "Monitor webhook event",
  description: "Sent for each page evaluated during a monitor check.",
  help: MONITOR_HELP,
  display_priority: 7,
  sample: webhookSample("monitor.page", [{ url: "https://example.com" }]),
  dedupOnData: true,
});

const monitorCheckCompletedTrigger = createWebhookTrigger({
  id: "monitor_check_completed",
  name: "Monitor Check Completed",
  event: "monitor.check.completed",
  subtitle: "Monitor webhook event",
  description:
    "Sent when a monitor check completes, summarizing changed, new, and removed pages.",
  help: MONITOR_HELP,
  display_priority: 8,
  sample: webhookSample("monitor.check.completed"),
});

async function validateConnection(context: AppContext): Promise<boolean> {
  const result = await firecrawlRequest(
    context,
    "POST",
    "/support/docs-search",
    {
      question: "What is Firecrawl?",
    },
  );
  return result.statusCode >= 200 && result.statusCode < 300;
}

const firecrawlApp: App = {
  id: "firecrawl",
  name: "Firecrawl",
  iconUrl: "",
  version: "1.0.0",
  description:
    "Scrape, crawl, map, search, parse, monitor, and interact with web data using Firecrawl API v2.",
  category: ["Developer Tools", "AI"],
  tags: ["scraping", "crawl", "search", "monitoring", "web-data"],
  visibility: "public",
  secure_tunnel: false,
  has_custom_action: false,
  has_actions: true,
  has_triggers: true,
  has_knowledge_base: false,
  connection: {
    fields: [
      {
        name: "api_key",
        type: "string",
        control_type: "password",
        label: "API Key",
        placeholder: "fc-YOUR-API-KEY",
        required: {
          value: true,
          message: "Firecrawl API key is required.",
        },
      },
    ],
    auth: {
      type: "credentials",
      validate: async (context: AppContext) => ({
        validated: await validateConnection(context),
      }),
    },
    credentials: [],
  },
  test: validateConnection,
  methods: {
    test: validateConnection,
    validate: async (context: AppContext) => ({
      validated: await validateConnection(context),
    }),
    authorize: async () => {
      throw new Error("Firecrawl uses API key authentication.");
    },
    refresh: async () => {
      throw new Error("Firecrawl API keys do not use token refresh.");
    },
    identity: async () => ({ provider: "firecrawl" }),
    pkce: async () => {
      throw new Error("Firecrawl API key authentication does not use PKCE.");
    },
  },
  object_definitions: objectDefinitions,
  pick_lists: {},
  actions: {
    scrape: scrapeAction,
    batch_scrape: batchScrapeAction,
    get_batch_scrape_status: getBatchScrapeStatusAction,
    get_batch_scrape_errors: getBatchScrapeErrorsAction,
    cancel_batch_scrape: cancelBatchScrapeAction,

    parse: parseAction,
    crawl: crawlAction,
    get_crawl_status: getCrawlStatusAction,
    get_crawl_errors: getCrawlErrorsAction,
    get_active_crawls: getActiveCrawlsAction,
    cancel_crawl: cancelCrawlAction,
    crawl_params_preview: crawlParamsPreviewAction,
    map: mapAction,
    search: searchAction,
    agent: agentAction,
    get_agent_status: getAgentStatusAction,
    cancel_agent: cancelAgentAction,
    list_browser_sessions: listBrowserSessionsAction,
    create_interact_session: createInteractSessionAction,
    execute_code_in_session: executeCodeInSessionAction,
    list_interact_sessions: listInteractSessionsAction,
    delete_interact_session: deleteInteractSessionAction,
    interact_with_page: interactWithPageAction,
    stop_interacting: stopInteractingAction,
    ask: askAction,
    docs_search: docsSearchAction,
    create_monitor: createMonitorAction,
    list_monitors: listMonitorsAction,
    get_monitor: getMonitorAction,
    update_monitor: updateMonitorAction,
    delete_monitor: deleteMonitorAction,
    run_monitor: runMonitorAction,
    list_monitor_checks: listMonitorChecksAction,
    get_monitor_check: getMonitorCheckAction,
  },
  triggers: {
    crawl_started: crawlStartedTrigger,
    crawl_page: crawlPageTrigger,
    crawl_completed: crawlCompletedTrigger,
    batch_scrape_started: batchScrapeStartedTrigger,
    batch_scrape_page: batchScrapePageTrigger,
    batch_scrape_completed: batchScrapeCompletedTrigger,
    monitor_page: monitorPageTrigger,
    monitor_check_completed: monitorCheckCompletedTrigger,
  },
  knowledge_bases: {},
  webhook_keys: (_context: AppContext, payload: DataPayload) =>
    String(payload.type || payload.event || "firecrawl_webhook"),
  streams: {},
};

export default firecrawlApp;
