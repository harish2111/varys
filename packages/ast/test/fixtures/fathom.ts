import {
  App,
  AppContext,
  ExecutionPayload,
  Field,
  WebhookTrigger,
} from "../src/dsl/konnectify-dsl";

const FATHOM_BASE_URL = "https://api.fathom.ai/external/v1";

async function makeFathomRequest(
  context: AppContext,
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH",
  path: string,
  body?: unknown,
  queryParams?: Record<string, any>,
): Promise<ExecutionPayload> {
  const { api_key }: any = context.auth;

  if (!api_key) {
    return {
      statusCode: 401,
      data: {
        error: "API Key is missing. Please check your connection settings.",
      },
    };
  }

  let url = `${FATHOM_BASE_URL}/${path.replace(/^\/+/, "")}`;

  if (queryParams) {
    const cleaned = cleanEmptyValues(queryParams);
    if (Object.keys(cleaned).length > 0) {
      const qs = new URLSearchParams(
        Object.entries(cleaned).reduce(
          (acc, [k, v]) => {
            acc[k] = String(v);
            return acc;
          },
          {} as Record<string, string>,
        ),
      ).toString();
      url = `${url}?${qs}`;
    }
  }

  const headers: Record<string, string> = {
    "X-Api-Key": api_key,
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  try {
    const response = await context.fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    const responseText = await response.text();

    let parsed: any = {};
    try {
      parsed = responseText ? JSON.parse(responseText) : {};
    } catch {
      parsed = responseText;
    }

    if (!response.ok) {
      const errorMessage =
        typeof parsed === "string"
          ? parsed
          : parsed?.message ||
            parsed?.error ||
            parsed?.detail ||
            response.statusText ||
            "Unknown API error";

      return {
        statusCode: response.status,
        data: { error: errorMessage },
      };
    }

    if (parsed?.error) {
      return {
        statusCode: 400,
        data: { error: parsed.error },
      };
    }

    return {
      statusCode: response.status,
      data: parsed,
    };
  } catch (err: any) {
    context.logger?.error("Unexpected error during Fathom API call:", err);
    return {
      statusCode: 500,
      data: { error: err?.message || "Unexpected error occurred" },
    };
  }
}

function cleanEmptyValues(obj: Record<string, any>): Record<string, any> {
  const output: Record<string, any> = {};
  Object.entries(obj || {}).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    output[key] = value;
  });
  return output;
}

function normalizeToUTC(dateStr?: string): string | undefined {
  if (!dateStr) return undefined;

  const d = new Date(dateStr);
  if (isNaN(d.getTime())) {
    throw new Error(`Invalid ISO date: ${dateStr}`);
  }

  return d.toISOString(); // always UTC (Z)
}
const toBoolean = (val: any): boolean => {
  if (typeof val === "boolean") return val;
  if (typeof val === "string") return val.toLowerCase() === "true";
  return false;
};

async function fetchAllPages(
  context: AppContext,
  endpoint: string,
  baseQueryParams: Record<string, any>,
  itemsKey: string,
): Promise<{ items: any[]; error?: string; statusCode?: number }> {
  const allItems: any[] = [];
  let currentCursor: string | null = null;

  do {
    const queryParams: Record<string, any> = { ...baseQueryParams };

    if (currentCursor) {
      queryParams.cursor = currentCursor;
    }

    const response = await makeFathomRequest(
      context,
      "GET",
      endpoint,
      undefined,
      queryParams,
    );

    if (response.data?.error || response.statusCode >= 400) {
      return {
        items: allItems,
        error: JSON.stringify(response.data?.error) || "Failed to fetch data",
        statusCode: response.statusCode,
      };
    }

    const pageItems: any[] = Array.isArray(response.data?.[itemsKey])
      ? response.data[itemsKey]
      : Array.isArray(response.data)
        ? response.data
        : [];

    allItems.push(...pageItems);

    currentCursor = String(response.data?.next_cursor) ?? null;
  } while (currentCursor);

  return { items: allItems };
}

function flattenAndGenerateSchema(
  obj: Record<string, any>,
  requiredFields: string[] = [],
  options: Record<string, any> = {},
  labelFields: Record<string, string> = {},
): any[] {
  const result: Record<string, any> = {};

  function flattenObject(current: any, parentKey: string = "") {
    for (const key in current) {
      if (!Object.prototype.hasOwnProperty.call(current, key)) continue;
      const newKey = parentKey ? `${parentKey}.${key}` : key;
      const value = current[key];

      if (Array.isArray(value)) {
        result[newKey] = value;
        value.forEach((item, index) => {
          const indexKey = `${newKey}.${index}`;
          if (typeof item === "object" && item !== null) {
            flattenObject(item, indexKey);
          } else {
            result[indexKey] = item;
          }
        });
      } else if (typeof value === "object" && value !== null) {
        flattenObject(value, newKey);
      } else {
        result[newKey] = value;
      }
    }
  }

  function mapType(value: any): string {
    if (typeof value === "boolean") return "boolean";
    if (typeof value === "number") return "number";
    if (Array.isArray(value)) return "array";
    if (typeof value === "string" && /\d{4}-\d{2}-\d{2}/.test(value))
      return "date_time";
    return "string";
  }

  function getControlType(type: string): string {
    switch (type) {
      case "string":
        return "text";
      case "number":
        return "number";
      case "boolean":
        return "select";
      case "date_time":
        return "datetime";
      case "array":
        return "text-area";
      default:
        return "text";
    }
  }

  function prettifyLabel(key: string): string {
    return key
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/[._-]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ");
  }

  function getLabel(key: string): string {
    if (labelFields && labelFields[key]) return labelFields[key];
    return prettifyLabel(key);
  }

  function isIndexedArrayPath(key: string): boolean {
    return /\.\d+\./.test(key) || /\.\d+$/.test(key);
  }

  function generateFieldsShallow(shallowObj: any): any[] {
    const fields: any[] = [];
    for (const key in shallowObj) {
      if (!shallowObj.hasOwnProperty(key)) continue;
      const value = shallowObj[key];
      const type = mapType(value);
      const field: any = {
        name: key,
        label: getLabel(key),
        optional: true,
        type,
        control_type: getControlType(type),
        hint: `Enter ${prettifyLabel(key)}`,
      };
      if (typeof value === "boolean") {
        field.pick_list = [{ label: "True", value: "true" }];
        field.control_type = "select";
      }
      if (
        Array.isArray(value) &&
        value.length > 0 &&
        typeof value[0] === "object"
      )
        field.of = "object";
      else if (
        Array.isArray(value) &&
        value.length > 0 &&
        typeof value[0] === "string"
      )
        field.of = "string";
      fields.push(field);
    }
    return fields;
  }

  flattenObject(obj);

  return Object.keys(result)
    .filter((key) => {
      if (Array.isArray(result[key]) && /\.\d+\./.test(key)) return false;
      return true;
    })
    .map((key) => {
      const value = result[key];
      const type = mapType(value);

      const field: any = {
        name: key,
        label: getLabel(key),
        type,
        control_type: getControlType(type),
        optional: !requiredFields.includes(key),
        hint: `Enter ${prettifyLabel(key)}`,
      };

      if (type === "boolean") {
        field.pick_list = [
          { label: "True", value: "true" },
          { label: "False", value: "false" },
        ];
        field.control_type = "select";
      }

      if (options[key]) {
        field.pick_list = options[key];
        field.control_type = "select";
      }

      if (
        type === "array" &&
        Array.isArray(value) &&
        value.length > 0 &&
        typeof value[0] === "object"
      ) {
        field.of = "object";
        field.label = `${getLabel(key)} (iteration)`;
        if (!isIndexedArrayPath(key)) {
          field.propChildren = generateFieldsShallow(value[0]);
        }
      }

      if (
        type === "array" &&
        Array.isArray(value) &&
        value.length > 0 &&
        typeof value[0] === "string"
      ) {
        field.of = "string";
        field.label = `${getLabel(key)} (iteration)`;
      }

      if (
        type === "array" &&
        Array.isArray(value) &&
        value.length > 0 &&
        typeof value[0] === "number"
      ) {
        field.of = "number";
        field.label = `${getLabel(key)} (iteration)`;
      }

      return field;
    });
}

async function validateConnection(
  context: AppContext,
): Promise<{ success: boolean; error?: string }> {
  try {
    const response: any = await makeFathomRequest(
      context,
      "GET",
      "meetings",
      undefined,
      {
        calendar_invitees_domains_type: "all",
      },
    );

    if (
      response?.statusCode >= 200 &&
      response?.statusCode < 300 &&
      !response?.data?.error
    ) {
      return { success: true };
    }

    return {
      success: false,
      error:
        response?.data?.error ||
        `Fathom responded with status ${response?.statusCode}`,
    };
  } catch (error: any) {
    context.logger?.error("Fathom validation failed:", error);
    return { success: false, error: error?.message || "Unexpected error" };
  }
}

const meetingSample = {
  title: "Quarterly Business Review",
  meeting_title: "QBR 2025 Q1",
  url: "https://fathom.video/xyz123",
  share_url: "https://fathom.video/share/xyz123",
  created_at: "2025-03-01T17:01:30Z",
  scheduled_start_time: "2025-03-01T16:00:00Z",
  scheduled_end_time: "2025-03-01T17:00:00Z",
  recording_start_time: "2025-03-01T16:01:12Z",
  recording_end_time: "2025-03-01T17:00:55Z",
  calendar_invitees_domains_type: "one_or_more_external",
  transcript: [
    {
      speaker: {
        display_name: "Jane Doe",
        matched_calendar_invitee_email: "jane.doe@acme.com",
      },
      text: "Let's revisit the budget allocations.",
      timestamp: "00:05:32",
    },
    {
      speaker: {
        display_name: "John Smith",
        matched_calendar_invitee_email: "john.smith@client.com",
      },
      text: "I agree, we need to adjust our projections.",
      timestamp: "00:05:40",
    },
  ],
  default_summary: {
    template_name: "general",
    markdown_formatted:
      "## Summary\nWe reviewed Q1 OKRs, identified budget risks, and agreed to revisit projections next month.\n",
  },
  action_items: [
    {
      description: "Email revised proposal to client",
      user_generated: false,
      completed: false,
      recording_timestamp: "00:10:45",
      recording_playback_url: "https://fathom.video/xyz123#t=645",
      assignee: {
        name: "Jane Doe",
        email: "jane.doe@acme.com",
        team: "Marketing",
      },
    },
  ],
  calendar_invitees: [
    {
      name: "Alice Johnson",
      matched_speaker_display_name: "Alice Johnson",
      email: "alice.johnson@acme.com",
      is_external: false,
      email_domain: "acme.com",
    },
    {
      name: "Jane Doe",
      matched_speaker_display_name: "Jane Doe",
      email: "jane.doe@acme.com",
      is_external: false,
      email_domain: "acme.com",
    },
    {
      name: "John Smith",
      matched_speaker_display_name: "John Smith",
      email: "john.smith@client.com",
      is_external: true,
      email_domain: "client.com",
    },
  ],
  recorded_by: {
    name: "Alice Johnson",
    email: "alice.johnson@acme.com",
    team: "Customer Success",
    email_domain: "acme.com",
  },
  crm_matches: {
    contacts: [
      {
        name: "John Smith",
        email: "john.smith@client.com",
        record_url: "https://app.hubspot.com/contacts/123",
      },
    ],
    companies: [
      {
        name: "Acme Corp",
        record_url: "https://app.hubspot.com/companies/456",
      },
    ],
    deals: [
      {
        name: "Q1 Renewal",
        amount: 50000,
        record_url: "https://app.hubspot.com/deals/789",
      },
    ],
  },
};

const transcriptSample = {
  speaker: {
    display_name: "Richard White",
    matched_calendar_invitee_email: "rich@fathom.video",
  },
  text: "All right.",
  timestamp: "00:00:00",
};

const summarySample = {
  template_name: "general",
  markdown_formatted:
    "## Summary\nWe reviewed Q1 OKRs, identified budget risks, and agreed to revisit projections next month.\n",
};

function createFathomWebhook(
  id: string,
  name: string,
  subtitle: string,
  description: string,
  help: string,
  triggeredFor: string[],
): WebhookTrigger {
  return {
    type: "webhook",
    hook_type: "per_event",
    id,
    name,
    title: name,
    subtitle,
    description,
    help,
    display_priority: 1,
    batch: false,
    bulk: false,
    deprecated: false,
    has_config_fields: true,

    dedup: (record: any) => record?.id || record?.meeting_id,

    sample: async () => meetingSample,

    output_schema: {
      fields: async () => flattenAndGenerateSchema(meetingSample),
    },

    webhook_key: () => id,
    webhook_response_type: "application/json",
    webhook_response_body: '{"status":"ok"}',
    webhook_response_headers: "Content-Type: application/json",
    webhook_response_status: 200,
    webhook_payload_type: "json",

    config_fields: {
      fields: async (): Promise<Field[]> => [
        {
          name: "include_action_items",
          label: "Include Action Items",
          type: "boolean",
          control_type: "select",
          optional: true,
          pick_list: [{ label: "True", value: "true" }],
        },
        {
          name: "include_crm_matches",
          label: "Include CRM Matches",
          type: "boolean",
          control_type: "select",
          optional: true,
          pick_list: [{ label: "True", value: "true" }],
        },
        {
          name: "include_summary",
          label: "Include Summary",
          type: "boolean",
          control_type: "select",
          optional: true,
          pick_list: [{ label: "True", value: "true" }],
        },
        {
          name: "include_transcript",
          label: "Include Transcript",
          type: "boolean",
          control_type: "select",
          optional: true,
          pick_list: [{ label: "True", value: "true" }],
        },
      ],
    },

    webhook_subscribe: async (context: AppContext) => {
      const webhookEndpoint = context.payload.data.webhookEndpoint;
      if (!webhookEndpoint) {
        return {
          statusCode: 400,
          data: { error: "Webhook endpoint URL is missing in the payload." },
        };
      }
      const cfg = context.payload.config_fields;

      const payload = {
        destination_url: webhookEndpoint,
        triggered_for: triggeredFor,
        include_action_items: toBoolean(cfg.include_action_items),
        include_crm_matches: toBoolean(cfg.include_crm_matches),
        include_summary: toBoolean(cfg.include_summary),
        include_transcript: toBoolean(cfg.include_transcript),
      };
      if (
        !payload.include_action_items &&
        !payload.include_crm_matches &&
        !payload.include_summary &&
        !payload.include_transcript
      ) {
        return {
          statusCode: 400,
          data: { error: "At least one include field must be selected." },
        };
      }
      const res = await makeFathomRequest(context, "POST", "webhooks", payload);
      if (res.data?.error) {
        return res;
      }

      return {
        webhook_url: webhookEndpoint,
        subscription_id: res.data?.id,
      };
    },

    webhook_unsubscribe: async (context: AppContext, sub: any) => {
      const id = (context.payload.data.webhookSubscribeOutput as any)
        ?.subscription_id as any;
      const response = await makeFathomRequest(
        context,
        "DELETE",
        `webhooks/${id}`,
      );
      if (response.data?.error) {
        return response;
      }
      return { status: "Success", statusCode: 200 };
    },

    webhook_notification: async (context: AppContext) => {
      const payload = context.payload;

      const records = Array.isArray(payload?.data)
        ? payload.data
        : [payload?.data];

      for (const record of records) {
        await context.fetch(context.engineEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(record),
        });
      }

      return { statusCode: 200, data: { status: "ok" } };
    },
  } as any as WebhookTrigger;
}

async function teamPickList(
  context: AppContext,
): Promise<{ label: string; value: string }[]> {
  const response = await makeFathomRequest(context, "GET", "teams");
  if (response.data?.error) {
    context.logger?.error(
      "Error fetching teams for pick list:",
      response.data.error,
    );
    throw response.data?.error;
  }
  const teams = (response.data?.items as any) || [];
  return teams.map((team: any) => ({ label: team.name, value: team.name }));
}

export const FathomApp: App = {
  id: "fathom-1.0.0",
  name: "Fathom",
  description:
    "A connector for Fathom AI, the meeting intelligence platform that records, transcribes, and summarizes virtual meetings.",
  version: "1.0.0",
  iconUrl: "https://fathom.video/favicon.ico",
  category: ["Productivity", "AI"],
  tags: ["ai", "meetings", "transcription", "summary", "recording"],
  visibility: "public",
  has_actions: true,
  has_triggers: true,
  has_custom_action: false,
  secure_tunnel: false,

  connection: {
    fields: [
      {
        name: "api_key",
        type: "string",
        label: "API Key",
        placeholder: "Enter your Fathom API Key",
        required: { value: true, message: "API Key is required" },
      },
    ],
    auth: {
      type: "credentials",
      validate: async (context: AppContext): Promise<any> => {
        const response = await validateConnection(context);
        if (response?.error) {
          return { validated: false };
        }
        return { validated: true };
      },
    },
    credentials: [],
  },

  test: async (context: AppContext): Promise<any> => {
    const response: any = await validateConnection(context);
    return !!(response && response.success);
  },

  object_definitions: {},
  pick_lists: {},

  actions: {
    list_meetings: {
      id: "list_meetings",
      name: "List Meetings",
      title: "List Meetings",
      subtitle: "Retrieve all recorded meetings",
      description:
        "Fetches all meetings recorded by Fathom across all pages. Supports filtering by date range, domain type, and content inclusion options.",
      help: "Returns all meetings accessible by the authenticated account. Automatically fetches all pages using cursor-based pagination.",
      display_priority: 1,
      batch: false,
      batch_size: 0,
      bulk: false,
      deprecated: false,
      cursor_enabled: false,
      has_config_fields: false,
      config_fields: { fields: async () => [] },
      sample: { fields: async () => [] },
      retry_on_response: [500, 502, 503, 504],
      retry_on_request: ["GET"],
      max_retries: 0,

      input_schema: {
        fields: async (): Promise<Field[]> => [
          {
            name: "calendar_invitees_domains",
            label: "Invitee Domains",
            type: "string",
            control_type: "text",
            optional: true,
            hint: "Comma-separated domains to filter by (e.g. acme.com,client.com).",
          },
          {
            name: "calendar_invitees_domains_type",
            label: "Domains Type",
            type: "string",
            control_type: "select",
            optional: true,
            hint: "Filter meetings by participant domain type.",
            pick_list: [
              { label: "All", value: "all" },
              { label: "Internal Only", value: "only_internal" },
              { label: "External Only", value: "one_or_more_external" },
            ],
          },
          {
            name: "created_after",
            label: "Created After",
            type: "date_time",
            control_type: "datetime",
            optional: true,
            hint: "Return only meetings created after this date and time (ISO 8601 format). eg.2026-03-31T10:15:30Z",
          },
          {
            name: "created_before",
            label: "Created Before",
            type: "date_time",
            control_type: "datetime",
            optional: true,
            hint: "Return only meetings created before this date and time (ISO 8601 format).eg.2026-03-31T10:15:30Z",
          },
          {
            name: "recorded_by",
            label: "Recorded By Emails",
            type: "string",
            control_type: "text",
            optional: true,
            hint: "Comma-separated email addresses to filter meetings by who recorded them.",
          },
          {
            name: "teams",
            label: "Teams",
            type: "string",
            control_type: "text",
            optional: true,
            hint: "Comma-separated team names to filter meetings by team.",
          },
          {
            name: "include_action_items",
            label: "Include Action Items",
            type: "boolean",
            control_type: "select",
            optional: true,
            pick_list: [{ label: "True", value: "true" }],
            hint: "Include action items in each meeting's response.",
          },
          {
            name: "include_crm_matches",
            label: "Include CRM Matches",
            type: "boolean",
            control_type: "select",
            optional: true,
            pick_list: [{ label: "True", value: "true" }],
            hint: "Include CRM contact, company, and deal matches in each meeting's response.",
          },
          {
            name: "include_summary",
            label: "Include Summary",
            type: "boolean",
            control_type: "select",
            optional: true,
            pick_list: [{ label: "True", value: "true" }],
            hint: "Include AI-generated summary in each meeting's response.",
          },
          {
            name: "include_transcript",
            label: "Include Transcript",
            type: "boolean",
            control_type: "select",
            optional: true,
            pick_list: [{ label: "True", value: "true" }],
            hint: "Include the full transcript in each meeting's response.",
          },
        ],
      },

      output_schema: {
        fields: async () => {
          const sample = {
            items: [meetingSample],
            total_count: 1,
          };
          return flattenAndGenerateSchema(sample);
        },
      },

      execute: async (context: AppContext): Promise<ExecutionPayload> => {
        try {
          const eventData = { ...context.payload.data } as any;

          const baseQueryParams: Record<string, any> = {};

          if (eventData.calendar_invitees_domains)
            baseQueryParams.calendar_invitees_domains =
              eventData.calendar_invitees_domains;
          if (eventData.calendar_invitees_domains_type)
            baseQueryParams.calendar_invitees_domains_type =
              eventData.calendar_invitees_domains_type;
          if (eventData.created_after)
            baseQueryParams.created_after = eventData.created_after;
          if (eventData.created_before)
            baseQueryParams.created_before = eventData.created_before;
          if (eventData.recorded_by)
            baseQueryParams.recorded_by = eventData.recorded_by;
          if (eventData.teams) baseQueryParams.teams = eventData.teams;
          if (eventData.include_action_items)
            baseQueryParams.include_action_items =
              eventData.include_action_items;
          if (eventData.include_crm_matches)
            baseQueryParams.include_crm_matches = eventData.include_crm_matches;
          if (eventData.include_summary)
            baseQueryParams.include_summary = eventData.include_summary;
          if (eventData.include_transcript)
            baseQueryParams.include_transcript = eventData.include_transcript;

          const result = await fetchAllPages(
            context,
            "meetings",
            baseQueryParams,
            "items",
          );

          if (result.error) {
            return {
              statusCode: result.statusCode || 400,
              data: { error: result.error },
            };
          }

          return {
            statusCode: 200,
            data: {
              items: result.items,
              total_count: result.items.length,
            },
          };
        } catch (err: any) {
          context.logger?.error(
            "Unexpected error in list_meetings execute():",
            err,
          );
          return {
            statusCode: 500,
            data: { error: err?.message || "Unexpected execution error" },
          };
        }
      },
    },

    get_transcript: {
      id: "get_transcript",
      name: "Get Transcript",
      title: "Get Transcript",
      subtitle: "Retrieve the full transcript of a recording",
      description:
        "Fetches the complete spoken-word transcript for a specific recording, including speaker attribution and timestamps.",
      help: "Provide the Recording ID to retrieve a timestamped, speaker-attributed transcript of the meeting.",
      display_priority: 3,
      batch: false,
      batch_size: 0,
      bulk: false,
      deprecated: false,
      cursor_enabled: false,
      has_config_fields: false,
      config_fields: { fields: async () => [] },
      sample: { fields: async () => [] },
      retry_on_response: [500, 502, 503, 504],
      retry_on_request: ["GET"],
      max_retries: 0,

      input_schema: {
        fields: async (): Promise<Field[]> => [
          {
            name: "recording_id",
            label: "Recording ID",
            type: "string",
            control_type: "text",
            optional: false,
            hint: "The unique identifier of the recording whose transcript you want to retrieve.",
          },
        ],
      },

      output_schema: {
        fields: async () => {
          const sample = { transcript: [transcriptSample], dataFound: false };
          return flattenAndGenerateSchema(sample);
        },
      },

      execute: async (context: AppContext): Promise<ExecutionPayload> => {
        try {
          const { recording_id } = context.payload.data as any;

          if (!recording_id) {
            return {
              statusCode: 400,
              data: { error: "Recording ID is required." },
            };
          }

          const response = await makeFathomRequest(
            context,
            "GET",
            `recordings/${recording_id}/transcript`,
          );

          if (response.data?.error) {
            if (
              response.statusCode === 404 ||
              String(response.data.error).toLowerCase().includes("not found")
            ) {
              return { statusCode: 200, data: { dataFound: false } };
            }
            return response;
          }

          if (!response.data || Object.keys(response.data).length === 0) {
            return { statusCode: 200, data: { dataFound: false } };
          }

          return {
            statusCode: response.statusCode,
            data: { ...response.data, dataFound: true },
          };
        } catch (err: any) {
          context.logger?.error(
            "Unexpected error in get_transcript execute():",
            err,
          );
          return {
            statusCode: 500,
            data: { error: err?.message || "Unexpected execution error" },
          };
        }
      },
    },

    get_summary: {
      id: "get_summary",
      name: "Get Summary",
      title: "Get Summary",
      subtitle: "Retrieve the AI-generated summary of a recording",
      description:
        "Fetches the AI-generated meeting summary including key points, action items, topics, and sentiment for a specific recording.",
      help: "Provide the Recording ID to retrieve the structured AI summary generated by Fathom after the meeting.",
      display_priority: 4,
      batch: false,
      batch_size: 0,
      bulk: false,
      deprecated: false,
      cursor_enabled: false,
      has_config_fields: false,
      config_fields: { fields: async () => [] },
      sample: { fields: async () => [] },
      retry_on_response: [500, 502, 503, 504],
      retry_on_request: ["GET"],
      max_retries: 0,

      input_schema: {
        fields: async (): Promise<Field[]> => [
          {
            name: "recording_id",
            label: "Recording ID",
            type: "string",
            control_type: "text",
            optional: false,
            hint: "The unique identifier of the recording whose AI summary you want to retrieve.",
          },
        ],
      },

      output_schema: {
        fields: async () => {
          const sample = { ...summarySample, dataFound: false };
          return flattenAndGenerateSchema(sample);
        },
      },

      execute: async (context: AppContext): Promise<ExecutionPayload> => {
        try {
          const { recording_id } = context.payload.data as any;

          if (!recording_id) {
            return {
              statusCode: 400,
              data: { error: "Recording ID is required." },
            };
          }

          const response = await makeFathomRequest(
            context,
            "GET",
            `recordings/${recording_id}/summary`,
          );

          if (response.data?.error) {
            if (
              response.statusCode === 404 ||
              String(response.data.error).toLowerCase().includes("not found")
            ) {
              return { statusCode: 200, data: { dataFound: false } };
            }
            return response;
          }

          if (!response.data || Object.keys(response.data).length === 0) {
            return { statusCode: 200, data: { dataFound: false } };
          }

          const summary = response.data?.summary ?? response.data;
          return {
            statusCode: response.statusCode,
            data: {
              ...summary,
              dataFound: Object.keys(summary).length > 0,
            },
          };
        } catch (err: any) {
          context.logger?.error(
            "Unexpected error in get_summary execute():",
            err,
          );
          return {
            statusCode: 500,
            data: { error: err?.message || "Unexpected execution error" },
          };
        }
      },
    },

    list_teams: {
      id: "list_teams",
      name: "List Teams",
      title: "List Teams",
      subtitle: "Retrieve all teams in the account",
      description:
        "Fetches all teams configured in the Fathom account. Automatically fetches all pages using cursor-based pagination.",
      help: "Returns all teams available to the authenticated account across all pages.",
      display_priority: 5,
      batch: false,
      batch_size: 0,
      bulk: false,
      deprecated: false,
      cursor_enabled: false,
      has_config_fields: false,
      config_fields: { fields: async () => [] },
      sample: { fields: async () => [] },
      retry_on_response: [500, 502, 503, 504],
      retry_on_request: ["GET"],
      max_retries: 0,

      input_schema: {
        fields: async (): Promise<Field[]> => [
          {
            name: "fetch_type",
            label: "Select Teams",
            type: "string",
            control_type: "select",
            optional: false,
            pick_list: [
              { label: "Return All Teams", value: "all" },
              { label: "Search by Team Name", value: "by_name" },
            ],
          },
          {
            name: "team_name",
            label: "Team Name",
            type: "string",
            optional: true,
          },
        ],
      },

      output_schema: {
        fields: async () => {
          const teamSample = {
            id: 345874,
            name: "Other",
            created_at: "2026-03-30T13:23:40.724742Z",
          };
          return flattenAndGenerateSchema({
            teams: [teamSample],
            total_count: 1,
            data_found: true,
          });
        },
      },

      execute: async (context: AppContext): Promise<ExecutionPayload> => {
        try {
          const fetchType = context.payload?.data?.fetch_type;
          const teamName = (
            context.payload?.data?.team_name as string | undefined
          )
            ?.toLowerCase()
            ?.trim();

          const result = await fetchAllPages(
            context,
            "teams",
            {},
            "items_active_record",
          );

          if (result.error) {
            return {
              statusCode: result.statusCode || 400,
              data: { error: result.error },
            };
          }
          let teams = result.items || [];
          if (fetchType === "by_name") {
            if (!teamName) {
              return {
                statusCode: 400,
                data: {
                  error: "team_name is required when fetch_type is 'by_name'",
                },
              };
            }

            teams = teams.filter((team: any) =>
              team.name?.toLowerCase().includes(teamName),
            );
          }
          return {
            statusCode: 200,
            data: {
              teams: teams,
              total_count: teams.length,
              data_found: teams.length > 0,
            },
          };
        } catch (err: any) {
          context.logger?.error(
            "Unexpected error in list_teams execute():",
            err,
          );
          return {
            statusCode: 500,
            data: {
              error: err?.message || "Unexpected execution error",
              data_found: false,
            },
          };
        }
      },
    },

    list_team_members: {
      id: "list_team_members",
      name: "List Team Members",
      title: "List Team Members",
      subtitle: "Retrieve all team members",
      description:
        "Fetches all team members across the Fathom account. Automatically fetches all pages using cursor-based pagination.",
      help: "Returns all team participants and their roles across all pages. Optionally filter by team name.",
      display_priority: 6,
      batch: false,
      batch_size: 0,
      bulk: false,
      deprecated: false,
      cursor_enabled: false,
      has_config_fields: false,
      config_fields: { fields: async () => [] },
      sample: { fields: async () => [] },
      retry_on_response: [500, 502, 503, 504],
      retry_on_request: ["GET"],
      max_retries: 0,

      input_schema: {
        fields: async (context: AppContext): Promise<Field[]> => [
          {
            name: "team",
            label: "Team Name",
            type: "string",
            control_type: "select",
            optional: true,
            pick_list: await teamPickList(context),
            hint: "Filter members by a specific team name. Leave blank to retrieve all team members.",
          },
        ],
      },

      output_schema: {
        fields: async () => {
          const memberSample = {
            id: 2536662,
            first_name: "Mohammed",
            last_name: "Afsar",
            email: "afsar@konnectify.co",
            created_at: "2026-03-30T13:28:07.929958Z",
            updated_at: "2026-03-30T13:30:35.086006Z",
            admin: false,
            approved_at: "2026-03-30T13:28:39.667995Z",
            company_id: 369152,
            bookmarks_fully_provisioned_at: "2026-03-30T13:28:39.624146Z",
            points_tallied_at: "2026-03-30T13:30:35.084688Z",
            timezone: "Asia/Calcutta",
          };
          return flattenAndGenerateSchema({
            team_members: [memberSample],
            total_count: 1,
            data_found: true,
          });
        },
      },

      execute: async (context: AppContext): Promise<ExecutionPayload> => {
        try {
          const eventData = { ...context.payload.data } as any;

          const baseQueryParams: Record<string, any> = {};
          if (eventData.team) baseQueryParams.team = eventData.team;

          const result = await fetchAllPages(
            context,
            "team_members",
            baseQueryParams,
            "items_active_record",
          );

          if (result.error) {
            return {
              statusCode: result.statusCode || 400,
              data: { error: result.error },
            };
          }

          return {
            statusCode: 200,
            data: {
              team_members: result.items,
              total_count: result.items.length,
              data_found: result.items.length > 0,
            },
          };
        } catch (err: any) {
          context.logger?.error(
            "Unexpected error in list_team_members execute():",
            err,
          );
          return {
            statusCode: 500,
            data: {
              error: err?.message || "Unexpected execution error",
              data_found: false,
            },
          };
        }
      },
    },
  },

  triggers: {
    my_recordings: createFathomWebhook(
      "my_recordings",
      "New My Recording",
      "Triggers when your recording is created",
      "Triggers when a meeting you recorded becomes available in Fathom.",
      "This trigger runs after your meeting recording is processed and ready to view in Fathom.",
      ["my_recordings"],
    ),

    shared_external_recordings: createFathomWebhook(
      "shared_external_recordings",
      "External Recording Shared",
      "Triggers when someone shares a recording with you",
      "Triggers when someone outside your account shares a recording with you.",
      "This trigger runs when you receive access to a recording from another Fathom account.",
      ["shared_external_recordings"],
    ),

    my_shared_with_team_recordings: createFathomWebhook(
      "my_shared_with_team_recordings",
      "Shared With Team Recording",
      "Triggers when you share a recording with your team",
      "Triggers when you share a recording with one of your teams.",
      "This trigger runs when you share a recording with a team (like Sales or Marketing). It does not run if you share with individual users.",
      ["my_shared_with_team_recordings"],
    ),

    shared_team_recordings: createFathomWebhook(
      "shared_team_recordings",
      "Team Recording",
      "Triggers when a team recording becomes available",
      "Triggers when a recording from your team becomes available to you.",
      "This trigger runs when a teammate creates or shares a recording that you can access within your team.",
      ["shared_team_recordings"],
    ),
  },

  methods: {
    test: async function (context: AppContext): Promise<boolean> {
      const response = await validateConnection(context);
      return response.success;
    },
    authorize: function (): Promise<Record<string, unknown>> {
      throw new Error("OAuth not supported for this app");
    },
    refresh: function (): Promise<Record<string, unknown>> {
      throw new Error("Token refresh not supported for this app");
    },
    identity: function (): Promise<Record<string, unknown>> {
      throw new Error("Identity not supported for this app");
    },
    validate: async function (
      context: AppContext,
    ): Promise<Record<string, unknown>> {
      const response = await validateConnection(context);
      return { valid: response.success };
    },
    pkce: function (): Promise<Record<string, unknown>> {
      throw new Error("PKCE not supported for this app");
    },
  },

  streams: {},
};

export default FathomApp;
