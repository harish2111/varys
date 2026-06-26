import {
  App,
  AppContext,
  Actions,
  Field,
  ExecutionPayload,
  DataPayload,
  PickListValue,
  PollTrigger,
  PollResponse,
  ControlType,
  FieldType,
  Triggers,
} from "../src/dsl/konnectify-dsl";

import { Context } from "vm";

const sampleServiceCatalogItem = {
  id: 52000256081,
  created_at: "2022-07-22T11:14:38Z",
  updated_at: "2024-12-14T17:02:46Z",
  name: "Employee On-boarding",
  delivery_time: null,
  display_id: 5,
  category_id: 52000054848,
  product_id: null,
  quantity: null,
  deleted: false,
  icon_name: "service-catalog-newhire-new",
  group_visibility: 1,
  agent_group_visibility: 1,
  item_type: 1,
  ci_type_id: 52000336334,
  visibility: 2,
  workspace_id: 2,
  cost_visibility: false,
  delivery_time_visibility: false,
  allow_attachments: true,
  allow_quantity: false,
  is_bundle: true,
  create_child: true,
  stringified_configs: "",
  configs: {
    attachment_mandatory: false,
    subject: "Request for {{requested_for}} : {{item.name}}",
    auto_gen_document: false,
    signature_list: [],
  },
  description:
    "Raise a request for the New Employee kit which will include the ID card, \n\t\t\t\t\t\t\t\t\t\t\ttee shirt, stickers, a bag and a laptop (for certain grades)\n",
  short_description: "Request a New Employee kit",
  cost: null,
  group_visibilities_group_id: [],
  agent_group_visibilities_group_id: [],
  quantity_visibility: false,
  template_id: null,
  desc_un_html:
    "Raise a request for the New Employee kit which will include the ID card, \n\t\t\t\t\t\t\t\t\t\t\ttee shirt, stickers, a bag and a laptop (for certain grades)\n",
  agent_workspace_visibilities_workspace_id: [],
  group_visibilities_item_id: [],

  agent_group_visibilities: {
    group_id: [20, 21],
  },
  agent_workspace_visibilities: {
    workspace_ids: [1, 2],
  },
  custom_fields: [
    {
      created_at: "2022-07-22T11:14:38Z",
      deleted: false,
      description: null,
      id: "d30341ee-0bfc-4300-9c65-49ee74f74ce4",
      label: "Employee First Name",
      name: "employee_first_name",
      updated_at: "2024-12-14T17:02:46Z",
      field_options: {
        required_for_create: "false",
        link: "/lookup_choices",
        visible_in_public: "false",
        displayed_to_approver: "true",
        data_source: "2",
        visible_in_agent_portal: "true",
        pdf: "true",
        im_api_name: "employee_onboarding::cf_admin",
        requester_can_edit: "true",
        required_for_closure: "false",
        conditions: '{"agent":[],"requester":[]}',
        displayed_to_requester: "true",
        same_as_agent: "true",
        placeholder: "",
      },
      visible_in_portal: true,
      field_type: "custom_text",
      item_id: 52000256081,
      position: 1,
      required: true,
      choice_obj: [
        {
          id: "77850f97-ee1d-4720-9c1a-1abb7f7b0c97",
          value: "HR",
        },
      ],
      choices: [
        {
          value: "IT",
        },
      ],
      archived: false,
      reference: {
        form_id: null,
        field_id: null,
        field_options: {},
        validations: {},
      },
      nested_fields: [
        {
          created_at: "2025-07-01T06:17:14Z",
          deleted: false,
          description: null,
          id: "6782f6a1-28fb-4185-9b90-ed1eb750437f",
          label: "Department",
          name: "department",
          updated_at: "2025-10-25T06:33:16Z",
          item_field_id: "3ec44239-7d30-4dc8-bfa4-92a6169a6538",
          level: 2,
          archived: false,
          reference: {
            form_id: null,
            field_id: null,
            field_options: {},
            validations: {},
          },
        },
        {
          created_at: "2025-07-01T06:17:14Z",
          deleted: false,
          description: null,
          id: "28b727ae-1191-4e59-afa9-7e2547382fb4",
          label: "Sub department",
          name: "sub_department",
          updated_at: "2025-10-25T06:33:16Z",
          item_field_id: "3ec44239-7d30-4dc8-bfa4-92a6169a6538",
          level: 3,
          archived: false,
          reference: {
            form_id: null,
            field_id: null,
            field_options: {},
            validations: {},
          },
        },
      ],
      nested_field_choices: [
        [
          "category 1",
          "category 1",
          [
            [
              "subcategory 1",
              "subcategory 1",
              [
                ["item 1", "item 1"],
                ["item 2", "item 2"],
              ],
            ],
            [
              "subcategory 2",
              "subcategory 2",
              [
                ["item 1", "item 1"],
                ["item 2", "item 2"],
              ],
            ],
            ["subcategory 3", "subcategory 3", []],
          ],
        ],
        [
          "category 2",
          "category 2",
          [
            [
              "subcategory 1",
              "subcategory 1",
              [
                ["item 1", "item 1"],
                ["item 2", "item 2"],
              ],
            ],
          ],
        ],
      ],
    },
  ],
  child_items: [
    {
      id: 52000256079,
      name: "Microsoft Office 2013",
      mandatory: 0,
    },
  ],
  icon_url:
    "https://assets7.freshservice.com/assets/cdn-ignored/sprites/service-catalog/newhire-new-2aa3dc9b94fce8c1a2f6ac47bf0922ebb0e23dfb5a2a20edf502d7feb29cad90.png",
};

function makeDublicateValue(type: string): any {
  switch (type) {
    case "custom_text":
    case "custom_paragraph":
    case "custom_dropdown":
    case "custom_lookup_bigint":
    case "custom_radio":
    case "custom_multi_lookup":
    case "custom_email":
    case "custom_url":
      return null; // string placeholder
    case "custom_multi_select_dropdown":
      return ["1", "2", "3"];
    case "custom_number":
    case "custom_decimal":
    case "number":
      return 7; // any number
    case "custom_date":
      return "2025-05-02";
    case "custom_date_time":
      return "2025-05-02T00:00:00Z";
    case "custom_checkbox":
      return true;
    default:
      return null;
  }
}
async function makeApiCall(context: AppContext, endpoint: string, method: string, body?: any): Promise<any> {
  const { domain, api_key } = context.auth;
  const url = `https://${domain}.freshservice.com/api/v2/${endpoint}`;

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Basic ${context.btoa(api_key + ":X")}`,
  };
  try {
    // console.log(url);
    const response = await context.fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    //  //console.log("Response============>", response);

    const rawText = await response.text();
    const statusCode = response.status;
    //  //console.log("Raw text============>", rawText);
    //  //console.log("Status Code============>", statusCode);

    // Parse JSON safely
    ////console.log("rawText", rawText);
    let parsedData: any = null;
    try {
      parsedData = rawText ? JSON.parse(rawText) : null;
    } catch {
      parsedData = rawText || null;
    }

    // 2xx success
    if (response.ok) {
      if (statusCode === 204) {
        return { statusCode, data: { success: true } };
      }

      // Smart flatten if wrapped in { data: {...} }
      if (parsedData && typeof parsedData === "object" && !Array.isArray(parsedData) && parsedData.data) {
        return { statusCode, data: parsedData.data };
      }

      return { statusCode, data: parsedData };
    }
    let errorData = parsedData;
    context.logger?.error(`[API] Error: ${method} ${endpoint} - Status: ${statusCode}`, errorData);

    return { statusCode, data: errorData };
  } catch (err: any) {
    return {
      statusCode: 500,
      data: { error: err.message || "Unexpected network error" },
    };
  }
}
async function ApiCallWithAttachment(
  context: AppContext,
  endpoint: string,
  method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE",
  body?: any,
  queryParams?: Record<string, any>
): Promise<any> {
  const { domain, api_key } = context.auth;
  let url = `https://${domain}.freshservice.com/api/v2/${endpoint}`;

  // Append query params for GET requests
  if (queryParams && Object.keys(queryParams).length > 0) {
    const qs = new URLSearchParams(queryParams).toString();
    url += `?${qs}`;
  }

  const headers: Record<string, string> = {
    Authorization: `Basic ${context.btoa(api_key + ":X")}`,
    Accept: "application/json",
  };

  let fetchOptions: any = { method, headers };

  // Handle body
  if (body) {
    if (body instanceof FormData) {
      // Let browser/node set boundary automatically
      fetchOptions.body = body;
    } else {
      headers["Content-Type"] = "application/json";
      fetchOptions.body = JSON.stringify(body);
    }
  }

  try {
    const response = await context.fetch(url, fetchOptions);

    const rawText = await response.text();
    const statusCode = response.status;

    // Try parse JSON, else return text
    let parsedData: any;
    try {
      parsedData = rawText ? JSON.parse(rawText) : null;
    } catch {
      parsedData = rawText || null;
    }

    if (response.ok) {
      if (statusCode === 204) {
        return { statusCode, data: { success: true } };
      }
      return { statusCode, data: parsedData };
    }

    // Handle non-2xx
    context.logger?.error(`[API] Error: ${method} ${endpoint} - Status: ${statusCode}`, parsedData);

    return {
      statusCode,
      data: parsedData || { error: `HTTP ${statusCode} Error` },
    };
  } catch (err: any) {
    return {
      statusCode: 500,
      data: { error: err.message || "Unexpected network error" },
    };
  }
}

async function validateConnection(context: AppContext): Promise<any> {
  try {
    const response = await makeApiCall(context, "tickets", "GET");

    // If Freshservice returns 2xx, connection is valid
    if (response?.statusCode >= 200 && response?.statusCode < 300) {
      return { success: true };
    }

    // Anything else → invalid
    return {
      success: false,
      error: response?.data?.message || `HTTP ${response?.statusCode}`,
    };
  } catch (error: any) {
    return { success: false, error: error.message || "Unexpected error" };
  }
}
function capitalizeFirstLetter(input: any) {
  //First Name ====> First name
  if (!input || typeof input !== "string") return "";
  return input.charAt(0).toUpperCase() + input.slice(1).toLowerCase();
}
function capitalizeAndFormat(string: any) {
  if (!string) return ""; // Handle empty strings
  return string
    .split("_") // Split the string into parts by underscores
    .map(
      (word: any, index: any) =>
        index === 0 ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : word.toLowerCase() // Capitalize only the first letter of the first word
    )
    .join(" "); // Join the parts with a space
}
async function generateParsedSchemaNestedCustomFields(fields: any, type: any) {
  //type is onboard or offboard
  const parsedSchema: any = [];

  fields.forEach((field: any, index: any) => {
    // Top-level field
    const topField = {
      name: `dynamic_${index}_${field.name}`,
      label: capitalizeAndFormat(field.name),
      pick_list: Object.keys(field.nested_field_choices || {}).map((key) => ({
        label: key,
        value: key,
      })),
      optional: field.required == "true" ? false : true,
      control_type: "select",
      type: "string",
    };
    parsedSchema.push(topField);

    // Handle nested fields
    if (field.nested_fields && Array.isArray(field.nested_fields)) {
      const parentDependencies = [`dynamic_${index}_${field.name}`]; // Dependency starts with the parent

      field.nested_fields.forEach((nestedField: any, index: any) => {
        const nestedFieldObj = {
          name: `dynamic_${index + 1}_${nestedField.name}`,
          label: capitalizeAndFormat(nestedField.name),

          optional: field.required == "true" ? false : true,
          function: `DynamicFunctionGet${type}category${index}`,
          control_type: "select",
          type: "string",
          dependentTo: [...parentDependencies], // Track dependencies
        };

        parsedSchema.push(nestedFieldObj);

        // Add dependencies for deeper nesting
        //   let childDependencies = [...parentDependencies];
        parentDependencies.push(`dynamic_${index + 1}_${nestedField.name}`);
        //   if (nestedField.nested_fields && Array.isArray(nestedField.nested_fields)) {
        //     nestedField.nested_fields.forEach((childField) => {
        //       parsedSchema.push({
        //         hasoptions: true,
        //         name: childField.name,
        //         label: childField.name,
        //         pick_list: [],
        //         optional: childField.required, // Dynamically set
        //         function: "get-categoryvalues",
        //         type: "string",
        //         dependentTo: childDependencies,
        //       });
        //     });
        //   }
      });
    }
  });
  return parsedSchema;
}

function flattenObject(obj: any, parentKey: string = "", result: Record<string, any> = {}): Record<string, any> {
  for (const key in obj) {
    if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;

    const newKey = parentKey ? `${parentKey}.${key}` : key;
    const value = obj[key];

    if (Array.isArray(value)) {
      value.forEach((item, index) => {
        if (typeof item === "object" && item !== null) {
          flattenObject(item, `${newKey}.${index}`, result);
        } else {
          result[`${newKey}.${index}`] = item;
        }
      });
    } else if (typeof value === "object" && value !== null) {
      flattenObject(value, newKey, result);
    } else {
      result[newKey] = value;
    }
  }

  return result;
}

function GenerateSchema(
  obj: Record<string, any>,
  requiredFields: string[] = [],
  options: Record<string, any> = {},
  labelFields: Record<string, string> = {}
): any[] {
  const result: Record<string, any> = {};

  // -----------------------------
  // 1. FLATTEN OBJECT (INLINE)
  // -----------------------------
  function flattenObject(current: any, parentKey: string = "") {
    for (const key in current) {
      if (Object.prototype.hasOwnProperty.call(current, key)) {
        const newKey = parentKey ? `${parentKey}.${key}` : key;
        const value = current[key];

        if (Array.isArray(value)) {
          result[newKey] = value;
          value.forEach((item, index) => {
            const newIndexKey = `${newKey}.${index}`;
            if (typeof item === "object" && item !== null) {
              flattenObject(item, newIndexKey);
            } else {
              result[newIndexKey] = item;
            }
          });
        } else if (typeof value === "object" && value !== null) {
          flattenObject(value, newKey);
        } else {
          result[newKey] = value;
        }
      }
    }
  }

  flattenObject(obj);

  // -----------------------------
  // 2. HELPERS (INLINE)
  // -----------------------------
  function mapType(value: any): string {
    if (typeof value === "boolean") return "boolean";
    if (typeof value === "number") return "number";
    if (Array.isArray(value)) return "array";
    if (typeof value === "string" && /\d{4}-\d{2}-\d{2}/.test(value)) {
      return "date_time";
    }
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
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  }

  // ✅ NEW — labelFields support
  function getLabel(key: string): string {
    return labelFields[key] || prettifyLabel(key);
  }

  function isIndexedArrayPath(key: string): boolean {
    return /\.\d+\./.test(key) || /\.\d+$/.test(key);
  }

  // SHALLOW FIELD GENERATION (INLINE)
  function generateFieldsShallow(obj: any): any[] {
    const fields: any[] = [];
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        fields.push(generateFieldShallow(key, obj[key]));
      }
    }
    return fields;
  }

  function generateFieldShallow(name: string, value: any): any {
    const type = mapType(value);
    const field: any = {
      name,
      label: getLabel(name), // ✅ updated
      optional: true,
      type,
      control_type: getControlType(type),
      hint: `Enter ${getLabel(name)}`,
    };

    if (typeof value === "boolean") {
      field.pick_list = [
        { label: "True", value: "true" },
        { label: "False", value: "false" },
      ];
      field.control_type = "select";
    }

    if (Array.isArray(value)) {
      if (value.length > 0 && typeof value[0] === "object") field.of = "object";
      else if (value.length > 0 && typeof value[0] === "string") field.of = "string";
    }

    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      field.type = "string";
      field.control_type = "text";
    }

    return field;
  }

  // -----------------------------
  // 3. BUILD FINAL SCHEMA
  // -----------------------------
  return Object.keys(result)
    .filter((key) => {
      const value = result[key];
      if (Array.isArray(value) && /\.\d+\./.test(key)) return false;
      return true;
    })
    .map((key) => {
      const value = result[key];
      const type = mapType(value);

      const field: any = {
        name: key,
        label: getLabel(key), // ✅ updated
        type,
        control_type: getControlType(type),
        optional: !requiredFields.includes(key),
        hint: `Enter ${getLabel(key)}`,
      };

      // Boolean picklist
      if (type === "boolean") {
        field.pick_list = [
          { label: "True", value: "true" },
          { label: "False", value: "false" },
        ];
        field.control_type = "select";
      }

      // Custom picklists
      if (options[key]) {
        field.pick_list = options[key];
        field.control_type = "select";
      }

      // Arrays of objects
      if (type === "array" && Array.isArray(value) && value.length > 0 && typeof value[0] === "object") {
        field.of = "object";
        field.label = `${getLabel(key)} (Iteration)`; // ✅ updated

        if (!isIndexedArrayPath(key)) {
          field.propChildren = generateFieldsShallow(value[0]);
        }
      }

      // Arrays of strings
      if (type === "array" && Array.isArray(value) && value.length > 0 && typeof value[0] === "string") {
        field.of = "string";
        field.label = `${getLabel(key)} (Iteration)`; // ✅ updated
      }
      if (type === "array" && Array.isArray(value) && value.length > 0 && typeof value[0] === "number") {
        field.of = "number";
        field.label = `${getLabel(key)} (Iteration)`; // ✅ updated
      }

      return field;
    });
}
function deepMergeAll(objects: any) {
  function deepMerge(obj1, obj2) {
    if (Array.isArray(obj1) && Array.isArray(obj2)) {
      // Combine and keep only first 5 unique entries (optional: can skip uniqueness)
      return [...obj1, ...obj2].slice(0, 5);
    }

    if (isPlainObject(obj1) && isPlainObject(obj2)) {
      const result = { ...obj1 };

      for (const key of Object.keys(obj2)) {
        if (key in result) {
          result[key] = deepMerge(result[key], obj2[key]);
        } else {
          result[key] = obj2[key];
        }
      }

      return result;
    }

    // Prefer first non-null/undefined value
    return obj1 !== undefined && obj1 !== null ? obj1 : obj2;
  }

  function isPlainObject(value) {
    return typeof value === "object" && value !== null && !Array.isArray(value);
  }

  return objects.filter((o) => o && typeof o === "object").reduce((acc, obj) => deepMerge(acc, obj), {});
}

async function getOutputSchema(context: AppContext, module: string, errorMessage?: string, body?: any): Promise<any> {
  const method = body ? "POST" : "GET";

  // Make the API call
  const response = await makeApiCall(context, module, method, body);

  // Handle cases where API fails
  if (!response || response.statusCode >= 400) {
    const msg = response?.data?.message || errorMessage || `Failed to fetch data for module: ${module}`;
    throw new Error(msg);
  }

  // Extract actual data — safely handle if API returns wrapped data
  const data = response.data?.[module] ?? response.data ?? [];
  if (!data || (Array.isArray(data) && data.length === 0)) {
    throw new Error(errorMessage || `No sample data found for module: ${module}`);
  }

  // Merge multiple data objects if array of objects returned
  const mergedData = deepMergeAll(data);
  // Flatten and generate schema
  const schema = GenerateSchema(mergedData);

  return schema;
}
async function getOutputSchemaForm(
  context: AppContext,
  module: string,
  search: any,
  errorMessage?: string,
  body?: any
): Promise<any> {
  const method = body ? "POST" : "GET";

  // Make the API call
  const response = await makeApiCall(context, module, method, body);
  if (!response || response.statusCode >= 400) {
    const msg = response?.data?.message || errorMessage || `Failed to fetch data for module: ${search}`;
    throw new Error(msg);
  }

  // Extract actual data — safely handle if API returns wrapped data
  const data = response.data?.[search] ?? response.data ?? [];
  if (!data || (Array.isArray(data) && data.length === 0)) {
    throw new Error(`No sample data found for module: ${search}`);
  }

  // Merge multiple data objects if array of objects returned
  const mergedData = deepMergeAll(data);

  // Flatten and generate schema
  const schema = GenerateSchema({
    ...mergedData,
    attachments_url: "",
    attachment_ids: ["2", "3"],
    first_attachment_id: 6282,
    stringified_attachments: "[]",
  });

  return schema;
}
async function getOutputSchemaCustom(
  context: AppContext,
  module: string,
  search: any,
  errorMessage?: string,
  body?: any
): Promise<any> {
  const method = body ? "POST" : "GET";

  // Make the API call
  const response = await makeApiCall(context, module, method, body);

  // //console.log("Module:", module);
  // //console.log("Raw Response:", response);

  // Handle cases where API fails
  if (!response || response.statusCode >= 400) {
    const msg = response?.data?.message || errorMessage || `Failed to fetch data for module: ${search}`;
    throw new Error(msg);
  }

  // Extract actual data — safely handle if API returns wrapped data
  const data = response.data?.[search] ?? response.data ?? [];
  if (!data || (Array.isArray(data) && data.length === 0)) {
    throw new Error(errorMessage || `No sample data found for module: ${search}`);
  }

  // Merge multiple data objects if array of objects returned
  const mergedData = deepMergeAll(data);

  // Flatten and generate schema
  const schema = GenerateSchema({
    ...mergedData.data,
    attachments_url: "",
    attachment_ids: ["2", "3"],
    first_attachment_id: 46,
    datafound: true,
  });

  // //console.log("Generated Schema:", schema);

  return schema;
}

async function getOutputSchemajourneyRequests(
  context: AppContext,
  module: string,
  errorMessage?: string,
  body?: any
): Promise<any> {
  const method = body ? "POST" : "GET";

  // Make the API call
  const response = await makeApiCall(context, module, method, body);

  // //console.log("Module:", module);
  // //console.log("Raw Response:", response);

  // Handle cases where API fails
  if (!response || response.statusCode >= 400) {
    const msg = response?.data?.message || errorMessage || `Failed to fetch data for module: ${module}`;
    throw new Error(msg);
  }

  // Extract actual data — safely handle if API returns wrapped data
  const data = response.data?.journey_requests ?? response.data ?? [];
  if (!data || (Array.isArray(data) && data.length === 0)) {
    throw new Error(errorMessage || `No sample data found for module: ${module}`);
  }

  // Merge multiple data objects if array of objects returned
  const mergedData = deepMergeAll(data);

  // Flatten and generate schema
  const schema = GenerateSchema(mergedData);

  // //console.log("Generated Schema:", schema);

  return schema;
}

async function sampleData(context: AppContext, module: string, errorMessage?: string, body?: any): Promise<any> {
  const method = body ? "POST" : "GET";

  // Make the API call
  const response = await makeApiCall(context, module, method, body);

  // //console.log("Module:", module);
  // //console.log("Raw Response:", response);

  // Handle cases where API fails
  if (!response || response.statusCode >= 400) {
    const msg = response?.data?.message || errorMessage || `Failed to fetch data for module: ${module}`;
    throw new Error(msg);
  }

  // Extract actual data — safely handle if API returns wrapped data
  const data = response.data?.[module] ?? response.data ?? [];
  if (!data || (Array.isArray(data) && data.length === 0)) {
    throw new Error(errorMessage || `No sample data found for module: ${module}`);
  }
  return flattenObject(data[0]);
}

async function sampleDataForm(
  context: AppContext,
  module: string,
  search: any,
  errorMessage?: string,
  body?: any
): Promise<any> {
  const method = body ? "POST" : "GET";

  // Make the API call
  const response = await makeApiCall(context, module, method, body);
  if (!response || response.statusCode >= 400) {
    const msg = response?.data?.message || errorMessage || `Failed to fetch data for module: ${search}`;
    throw new Error(msg);
  }

  // Extract actual data — safely handle if API returns wrapped data
  const data = response.data?.[search] ?? response.data ?? [];
  if (!data || (Array.isArray(data) && data.length === 0)) {
    throw new Error(errorMessage || `No sample data found for module: ${search}`);
  }

  const sampleData = data[0] as any;

  if (Array.isArray(sampleData?.attachments)) {
    const attachments = sampleData.attachments;

    const attachments_url = attachments.length ? attachments.map((item) => item.attachment_url).join(",") : "";

    const attachment_ids = attachments.length ? attachments.map((item) => item.id) : [];

    const first_attachment_id = attachments.length ? attachments[0].id : null;

    return {
      ...sampleData,
      attachments_url,
      attachment_ids,
      first_attachment_id,
    };
  }

  return sampleData;
}
async function SampleDataForJounrey(
  context: AppContext,
  module: string,
  errorMessage?: string,
  body?: any
): Promise<any> {
  const method = body ? "POST" : "GET";

  // Make the API call
  const response = await makeApiCall(context, module, method, body);

  // //console.log("Module:", module);
  // //console.log("Raw Response:", response.data?.journey_requests.length);

  // Handle cases where API fails
  if (!response || response.statusCode >= 400) {
    const msg = response?.data?.message || errorMessage || `Failed to fetch data for module: ${module}`;
    throw new Error(msg);
  }

  // Extract actual data — safely handle if API returns wrapped data
  const data = response.data?.journey_requests ?? response.data ?? [];
  if (!data || (Array.isArray(data) && data.length === 0)) {
    throw new Error(errorMessage || `No sample data found for module: ${module}`);
  }
  return flattenObject(data[0]);
}

async function inputOnboarding(ctx: AppContext): Promise<any> {
  try {
    // Step 0: Fetch onboarding request form
    const ticketsResp = await makeApiCall(ctx, "onboarding_requests/form", "GET");
    const tickets = ticketsResp.data;
    // //console.log("Tickets:", tickets);

    if (!tickets?.fields?.length) {
      throw new Error("Create On-Boarding Fields in your Freshservice account.");
    }

    // Step 1: Fetch related data in parallel
    const [locationsResp, requestersResp, agentsResp, assetsResp, departmentsResp] = await Promise.all([
      makeApiCall(ctx, "locations", "GET"),
      makeApiCall(ctx, "requesters", "GET"),
      makeApiCall(ctx, "agents", "GET"),
      makeApiCall(ctx, "assets", "GET"),
      makeApiCall(ctx, "departments", "GET"),
    ]);
    const locations = locationsResp.data?.locations ?? [];
    const requesters = requestersResp.data?.requesters ?? [];
    const agents = agentsResp.data?.agents ?? [];
    const assets = assetsResp.data?.assets ?? [];
    const departments = departmentsResp.data?.departments ?? [];

    // Step 2: Map data to pick lists
    const locationsIdDS1 = locations.map((item: any) => ({ label: item.name, value: item.id }));
    const requesterEmailDS2 = requesters
      .filter((item: any) => item.primary_email)
      .map((item: any) => ({ label: item.primary_email, value: item.primary_email }));
    const requesterIdDS2 = requesters
      .filter((item: any) => item.primary_email)
      .map((item: any) => ({ label: item.primary_email, value: item.id }));
    const agentsEmailDS3 = agents
      .filter((item: any) => item.email)
      .map((item: any) => ({ label: item.email, value: item.email }));
    const agentsIdDS3 = agents
      .filter((item: any) => item.email)
      .map((item: any) => ({ label: item.email, value: item.id }));
    const assetsIDDS4 = assets.map((item: any) => ({ label: item.name, value: item.id }));
    const departmentIdDS6 = departments.map((item: any) => ({ label: item.name, value: item.name }));

    // Step 3: Helper functions
    const getChoices = (arr: any[]) => arr.map((v) => ({ label: v, value: v }));
    const getType = (fieldType: string) => {
      if (!fieldType) return "string";
      if (fieldType.includes("number") || fieldType.includes("decimal")) return "number";
      if (fieldType.includes("date")) return "string";
      if (fieldType.includes("picklist")) return "string";
      if (fieldType.includes("checkbox")) return "boolean";
      return "string";
    };
    const getControlType = (fieldType: string) => {
      if (!fieldType) return "text";
      if (fieldType.includes("number") || fieldType.includes("decimal")) return "text";
      if (fieldType.includes("date")) return "text";
      if (fieldType.includes("picklist")) return "select";
      if (fieldType.includes("checkbox")) return "select";
      return "text";
    };

    // Step 4: Map ticket fields to schema
    const customFields = tickets.fields
      .filter((f: any) => !f.nested_field_choices)
      .map((f: any) => {
        const type = getType(f.field_type);
        const control_type = getControlType(f.field_type);
        const field: any = {
          name: f.name,
          label: capitalizeFirstLetter(f.label),
          type,
          optional: f.required !== true,
          pick_list: f.choices?.length ? getChoices(f.choices) : undefined,
          data_source: f.data_source,
          control_type,
        };
        if (type === "boolean") {
          ((field.control_type = "select"),
            (field.pick_list = [
              { label: "TRUE", value: "true" },
              { label: "FALSE", value: "false" },
            ]));
        }
        return field;
      });

    // Step 5: Assign pick lists based on data source
    const allUsers = [...requesterEmailDS2, ...agentsEmailDS3];
    const finalFields = customFields.map((item: any) => {
      switch (item.data_source) {
        case 1:
          item.pick_list = locationsIdDS1;
          item.type = "number";
          item.control_type = "select";
          break;
        case 2:
          item.pick_list = requesterIdDS2;
          item.control_type = "select";
          item.type = "number";
          break;
        case 3:
          item.pick_list = agentsIdDS3;
          item.control_type = "select";
          item.type = "number";
          break;
        case 4:
          item.pick_list = assetsIDDS4;
          item.control_type = "select";
          item.type = "number";
          break;
        case 5:
          item.pick_list = allUsers;
          item.control_type = "select";
          break;
        case 6:
          item.pick_list = departmentIdDS6;
          item.control_type = "select";
          break;
      }
      delete item.data_source;
      return item;
    });

    // Step 6: Handle nested fields
    const nestedFields = tickets.fields.filter((f: any) => f.nested_field_choices);
    if (nestedFields.length) {
      const parsedSchema = await generateParsedSchemaNestedCustomFields(nestedFields, "onboard");
      finalFields.push(...parsedSchema);
    }

    return finalFields;
  } catch (error: any) {
    ctx.logger?.error("Failed to generate onboarding input schema:", error);
    throw error;
  }
}

async function parsePostData(schema: any, eventData: any): Promise<any> {
  for (let i in schema) {
    if (Object.keys(eventData).includes(schema[i].name) && schema[i].type !== "string") {
      if (schema[i].type == "number") {
        eventData[schema[i].name] = parseInt(eventData[schema[i].name]);
      }
      if (schema[i].type == "boolean") {
        eventData[schema[i].name] = Boolean(eventData[schema[i].name]);
      }
    }
  }

  return eventData;
}
async function getJourneyType(context: AppContext) {
  try {
    const allConfig: any[] = [];
    let page = 1;
    const pageSize = 30;

    while (true) {
      // Call API using makeApiCall
      const response = await makeApiCall(context, `journeys/configs?page=${page}&per_page=${pageSize}`, "GET");

      // Check for API errors
      if (!response || response.statusCode >= 400) {
        const errorMsg = response?.data?.error || "Unknown API error";
        break;
      }

      const journeyConfigs = response.data?.journey_configs ?? [];
      const meta = response.data?.meta;

      // Push label-value objects
      allConfig.push(
        ...journeyConfigs.map((item: any) => ({
          label: item.name,
          value: `${item.id}`,
        }))
      );

      // Stop if there’s no next page
      if (!meta?.has_next) break;
      page++;
    }

    return allConfig;
  } catch (error: any) {
    return [];
  }
}

async function getJourneyTypeById(context: AppContext) {
  const journeyId = context.payload?.config_fields?.journey_id;

  if (!journeyId) {
    return null;
  }

  try {
    const allConfigs: any[] = [];
    let page = 1;
    const pageSize = 30;

    while (true) {
      const { statusCode, data } = await makeApiCall(
        context,
        `journeys/configs?page=${page}&per_page=${pageSize}`,
        "GET"
      );

      // Basic error handling
      if (statusCode >= 400) {
        break;
      }

      const journeyConfigs = data?.journey_configs ?? [];
      const hasNext = data?.meta?.has_next;

      allConfigs.push(...journeyConfigs);

      if (!hasNext) break;
      page++;
    }

    // Find the config with matching journey_id
    const match = allConfigs.find((cfg) => String(cfg.id) === String(journeyId));

    if (!match) {
      return null;
    }

    return match.journey_type_id;
  } catch (error) {
    return null;
  }
}

// Departments
async function getDepartmentsByValue(context: AppContext, idAsValue?: boolean) {
  try {
    const allDepartments: any[] = [];
    let page = 1;
    const perPage = 100;

    while (true) {
      const response = await makeApiCall(context, `departments?page=${page}&per_page=${perPage}`, "GET");

      if (!response || response.statusCode >= 400) {
        break;
      }

      // Access the actual departments array from response.data
      const departments = response.data?.departments ?? [];

      allDepartments.push(
        ...departments.map((dept: any) => ({
          label: dept.name,
          value: idAsValue ? String(dept.id) : dept.name,
        }))
      );

      // Check for pagination
      const hasNext = response.data?.meta?.has_next ?? departments.length === perPage;
      if (!hasNext) break;

      page++;
    }

    return allDepartments;
  } catch (error) {
    return [];
  }
}

// Locations
async function getLocations(context: AppContext) {
  try {
    const allLocations: any[] = [];
    let page = 1;
    const perPage = 100;

    while (true) {
      const response = await makeApiCall(context, `locations?page=${page}&per_page=${perPage}`, "GET");

      if (!response || response.statusCode >= 400) {
        throw new Error(JSON.stringify(response.data));
      }

      // Access locations via response.data
      const locations = response.data?.locations ?? [];

      allLocations.push(
        ...locations.map((loc: any) => ({
          label: loc.name,
          value: String(loc.id),
        }))
      );

      // Check for pagination
      const hasNext = response.data?.meta?.has_next ?? locations.length === perPage;
      if (!hasNext) break;

      page++;
    }

    return allLocations;
  } catch (error) {
    return [];
  }
}

// Assets
async function getAssets(context: AppContext) {
  try {
    const allAssets: any[] = [];
    let page = 1;
    const perPage = 100;

    while (true) {
      const response = await makeApiCall(context, `assets?page=${page}&per_page=${perPage}`, "GET");

      // Handle API errors
      if (!response || response.statusCode >= 400) {
        break;
      }

      // Access assets from response.data
      const assets = response.data?.assets ?? [];

      allAssets.push(
        ...assets.map((asset: any) => ({
          label: asset.name,
          value: asset.id,
        }))
      );

      // Pagination check
      const hasNext = response.data?.meta?.has_next ?? assets.length === perPage;
      if (!hasNext) break;

      page++;
    }

    return allAssets;
  } catch (error) {
    return [];
  }
}

async function getAgents(context: AppContext) {
  try {
    const allAgentsById: any[] = [];
    const allAgentsByEmail: any[] = [];
    let page = 1;
    const perPage = 100;

    while (true) {
      const response = await makeApiCall(context, `agents?page=${page}&per_page=${perPage}`, "GET");

      // Handle API errors
      if (!response || response.statusCode >= 400) {
        break;
      }

      const agents = response.data?.agents ?? [];

      // Build both lists
      allAgentsById.push(
        ...agents.map((agent: any) => ({
          label: agent.email || agent.contact?.name || agent.name || `Agent ${agent.id}`,
          value: agent.id,
        }))
      );

      allAgentsByEmail.push(
        ...agents.map((agent: any) => ({
          label: agent.name || agent.contact?.name || agent.email || `Agent ${agent.id}`,
          value: agent.email || "",
        }))
      );

      const hasNext = response.data?.meta?.has_next ?? agents.length === perPage;

      if (!hasNext) break;
      page++;
    }

    return {
      byId: allAgentsById,
      byEmail: allAgentsByEmail,
    };
  } catch (error) {
    return { byId: [], byEmail: [] };
  }
}

async function getRequesters(context: AppContext) {
  try {
    const allRequestersById: any[] = [];
    const allRequestersByEmail: any[] = [];
    let page = 1;
    const perPage = 100;

    while (true) {
      const response = await makeApiCall(context, `requesters?page=${page}&per_page=${perPage}`, "GET");

      // Handle API errors consistently
      if (!response || response.statusCode >= 400) {
        break;
      }

      const requesters = response.data?.requesters ?? [];

      // Build both label-value lists
      allRequestersById.push(
        ...requesters.map((req: any) => ({
          label: req.primary_email || req.name || req.email || `Requester ${req.id}`,
          value: req.id,
        }))
      );

      allRequestersByEmail.push(
        ...requesters.map((req: any) => ({
          label: req.name || req.primary_email || req.email || `Requester ${req.id}`,
          value: req.primary_email || req.email || "",
        }))
      );

      const hasNext = response.data?.meta?.has_next ?? requesters.length === perPage;

      if (!hasNext) break;
      page++;
    }

    return {
      byId: allRequestersById,
      byEmail: allRequestersByEmail,
    };
  } catch (error) {
    return { byId: [], byEmail: [] };
  }
}

async function buildInputSchema(context: any, fields: any, required: boolean): Promise<any> {
  // Fetch all dropdown datasets in parallel
  const [departmentDropdown, locationsDropdown, assetsDropdown, requestersDropdown, agentsDropdown] = await Promise.all(
    [
      getDepartmentsByValue(context),
      getLocations(context),
      getAssets(context),
      getRequesters(context),
      getAgents(context),
    ]
  );

  const result: any[] = [];

  function recurse(fieldList: any) {
    fieldList.forEach((field: any) => {
      const item: any = {
        name: field.name,
        label: field.label,
        type: mapFieldType(field.type),
        control_type: mapControlType(field.type),
        optional: !field.required || required,
      };

      // Handle lookup-based picklists
      if (field.data_source) {
        switch (field.data_source) {
          case "5": // All Users → combine Agents + Requesters emails
            item.control_type = "select";
            item.pick_list = [...agentsDropdown.byEmail, ...requestersDropdown.byEmail];
            break;

          case "2": // Requesters → by ID
            item.control_type = "select";
            item.pick_list = requestersDropdown.byId;
            break;

          case "3": // Agents → by ID
            item.control_type = "select";
            item.pick_list = agentsDropdown.byId;
            break;

          case "1": // Locations
            item.control_type = "select";
            item.pick_list = locationsDropdown;
            break;

          case "4": // Assets
            item.control_type = "select";
            item.pick_list = assetsDropdown;
            break;

          case "6": // Departments
            item.control_type = "select";
            item.pick_list = departmentDropdown;
            break;
        }
      }

      // Handle standard dropdowns
      if (Array.isArray(field.choices) && field.choices.length > 0) {
        item.control_type = "select";
        item.pick_list = field.choices.map((choice: any) => ({
          label: choice.label,
          value: choice.value,
        }));
      }

      result.push(item);

      // Recurse into nested fields
      if (Array.isArray(field.fields) && field.fields.length > 0) {
        recurse(field.fields);
      }
    });
  }

  recurse(fields);
  return result;
}
function buildDublicateCustomObjects(serviceItem: any): Record<string, any> {
  const fields: Record<string, any> = {};

  serviceItem.forEach((field: any) => {
    // basic mapping
    fields[field.name] = makeDublicateValue(field.field_type);

    // special case: nested fields
    if (field.field_type === "nested_field") {
      // pick first available choice at each level
      if (field.nested_field_choices?.length) {
        const [category, , subChoices] = field.nested_field_choices[0];

        fields[field.name] = category;

        // if nested subfields exist (like sub_category, items)
        field.nested_fields?.forEach((nested: any, idx: number) => {
          if (idx === 0 && subChoices?.length) {
            const [subCategory, , itemChoices] = subChoices[0];
            fields[nested.name] = subCategory;

            if (itemChoices?.length && field.nested_fields[idx + 1]) {
              fields[field.nested_fields[idx + 1].name] = itemChoices[0][0];
            }
          }
        });
      }
    }
  });

  return fields;
}
function mapFieldType(type: string): any {
  switch (type) {
    case "custom_text":
    case "custom_paragraph":
    case "custom_dropdown":
    case "custom_lookup_bigint":
    case "custom_radio":
    case "custom_multi_select_dropdown":
    case "custom_multi_lookup":
    case "custom_email":
    case "custom_url":
      return "string";
    case "custom_number":
    case "custom_decimal":
      return "number";
    case "custom_date":
      return "string";
    case "custom_date_time":
      return "string";
    case "custom_checkbox":
      return "boolean";
    default:
      return "string";
  }
}

function processAgentPayload(context: AppContext, eventData: Record<string, any>): Record<string, any> {
  const finalPayload: Record<string, any> = { custom_fields: {} };

  const fieldTransformations = {
    boolean: ["occasional"],
    number: ["reporting_manager_id", "location_id"],
    array: ["department_ids"],
    roles: ["roles"],
  };

  const transformValue = (type: string, value: any) => {
    if (value === null || value === undefined) return null;
    switch (type) {
      case "boolean":
        return String(value).toLowerCase() === "true";
      case "number":
        const num = parseInt(value, 10);
        return isNaN(num) ? null : num;
      case "array":
        return String(value)
          .split(",")
          .map((item) => parseInt(item.trim(), 10))
          .filter((num) => !isNaN(num));
      case "roles":
        const roleIds = String(value)
          .split(",")
          .map((id) => parseInt(id.trim(), 10))
          .filter((id) => !isNaN(id));
        return roleIds.map((role_id) => ({ role_id, assignment_scope: "entire_helpdesk" }));
      default:
        return value;
    }
  };

  for (const [key, value] of Object.entries(eventData)) {
    if (value === null || value === undefined || value === "") continue;

    let isTransformed = false;
    for (const [type, fields] of Object.entries(fieldTransformations)) {
      if (fields.includes(key)) {
        finalPayload[key] = transformValue(type, value);
        isTransformed = true;
        break;
      }
    }

    if (!isTransformed) {
      if (key.startsWith("cf_") || key.startsWith("cnf_") || key.startsWith("cbf_")) {
        const cleanKey = key.substring(3);
        let customValue = value;
        if (key.startsWith("cnf_")) customValue = transformValue("number", value);
        if (key.startsWith("cbf_")) customValue = transformValue("boolean", value);
        finalPayload.custom_fields[cleanKey] = customValue;
      } else {
        finalPayload[key] = value;
      }
    }
  }

  if (Object.keys(finalPayload.custom_fields).length === 0) {
    delete finalPayload.custom_fields;
  }

  return finalPayload;
}

function handleActionError(error: unknown, context: AppContext, operation: string): ExecutionPayload {
  const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";

  // SOP Compliance: Never throw, always return ExecutionPayload
  return {
    statusCode: 500,
    data: { error: errorMessage },
  };
}
// Map Freshservice field types to platform ControlType
function mapType(type: string): any {
  switch (type) {
    case "checkbox":
      return "boolean";
    case "number":
    case "integer":
    case "decimal":
      return "number";
    case "lookup":
      return "string";
    case "Array":
      return "array";
    case "custom_text":
      return "string";
    case "custom_paragraph":
      return "string";
    case "custom_dropdown":
    case "custom_lookup_bigint":
    case "custom_radio":
      return "string";
    case "custom_multi_select_dropdown":
    case "custom_multi_lookup":
      return "array";
    case "custom_number":
    case "custom_decimal":
      return "number";
    case "custom_date":
      return "date";
    case "custom_date_time":
      return "datetime";
    case "custom_checkbox":
      return "boolean";
    case "custom_email":
      return "string";
    case "custom_url":
      return "string";
    default:
      return "string";
  }
}
function mapControlType(type: string): any {
  switch (type) {
    case "checkbox":
    case "dropdown":
      return "select";
    case "number":
      return "text";
    case "array":
      return "select";
    case "custom_text":
      return "text";
    case "custom_paragraph":
      return "text-area";
    case "custom_dropdown":
    case "custom_lookup_bigint":
    case "custom_radio":
      return "select";
    case "custom_multi_select_dropdown":
    case "custom_multi_lookup":
      return "multiselect";
    case "custom_checkbox":
      return "select";
    default:
      return "text";
  }
}
function ServiceRequestCustomFieldstransformFields(customFields: any[]) {
  const output: any[] = [];

  // 1. Separate nested vs. non-nested fields
  const nestedFields = customFields.filter((f) => f.field_type === "nested_field");
  const normalFields = customFields.filter((f) => f.field_type !== "nested_field");

  // 2. Push normal fields in their given order

  normalFields.forEach((field) => {
    const controlType = mapControlType(field.field_type);
    const baseField: any = {
      name: field.name,
      label: field.label,
      type: mapType(field.field_type),
      control_type: controlType,
      optional: !field.required,
      custom: true,
    };

    if (controlType === "select" || controlType === "multiselect") {
      baseField.pick_list = (field.choice_obj || []).map((choice: any) => ({
        label: choice.value,
        value: choice.value,
      }));
    }

    output.push(baseField);
  });

  // 3. Handle nested fields, sorted internally by position
  nestedFields
    .sort((a, b) => a.position - b.position) // sort nested groups
    .forEach((field, parentIndex) => {
      const parentName = `parent:${parentIndex + 1}:${field.name}`;
      output.push({
        name: parentName,
        label: field.label,
        type: "string",
        control_type: "select",
        optional: !field.required,
        custom: true,
        pick_list: field.nested_field_choices.map((choice: any) => ({
          label: choice[0],
          value: choice[1],
        })),
      });

      // sort child fields inside this parent
      field.nested_fields
        .sort((a, b) => a.position - b.position)
        .forEach((nested, childIndex: number) => {
          output.push({
            name: `parent:${parentIndex + 1}:child:${childIndex + 1}:${nested.name}`,
            label: nested.label,
            type: "string",
            control_type: "select",
            optional: true,
            custom: true,
            function: `Requestparent${parentIndex + 1}dependent${childIndex + 1}`,
            dependentTo:
              childIndex === 0
                ? [parentName]
                : [
                    parentName,
                    `parent:${parentIndex + 1}:child:${childIndex}:${field.nested_fields[childIndex - 1].name}`,
                  ],
          });
        });
    });

  return output;
}
function AssetDependentCustomFieldstransformFields(customFields: any[]) {
  const output: any[] = [];
  if (!customFields?.length) {
    return [];
  }
  // 1. Separate nested vs. non-nested fields
  const nestedFields = customFields;

  // 3. Handle nested fields, sorted internally by position
  nestedFields.forEach((field, parentIndex) => {
    const parentName = `parent:${parentIndex + 1}:${field.name}`;
    const optional = !field.required;
    output.push({
      name: parentName,
      label: field.label,
      type: "string",
      control_type: "select",
      optional: optional,
      custom: true,
      pick_list: field.choices.map((choice: any) => ({
        label: choice[0],
        value: choice[1],
      })),
    });

    // sort child fields inside this parent
    // field.levels.forEach((nested, childIndex: number) => {
    //   output.push({
    //     name: `parent:${parentIndex + 1}:child:${childIndex + 1}:${nested.name}`,
    //     label: nested.label,
    //     type: "string",
    //     control_type: "select",
    //     optional: optional,
    //     custom: true,
    //     function: `Assetsparent${parentIndex + 1}dependent${childIndex + 1}`,
    //     dependentTo:
    //       childIndex === 0
    //         ? [parentName]
    //         : [parentName, `parent:${parentIndex + 1}:child:${childIndex + 1}:${nested.name}`],
    //   });
    // });
    field.levels.forEach((nested: any, childIndex: number) => {
      const childName = `parent:${parentIndex + 1}:child:${childIndex + 1}:${nested.name}`;

      const dependentTo =
        childIndex === 0
          ? [parentName]
          : [
              parentName,
              `parent:${parentIndex + 1}:child:${childIndex}:${field.levels[childIndex - 1].name}`, // ✅ FIXED
            ];

      output.push({
        name: childName,
        label: nested.label,
        type: "string",
        control_type: "select",
        optional,
        custom: true,
        function: `Assetsparent${parentIndex + 1}dependent${childIndex + 1}`,
        dependentTo,
      });
    });
  });

  return output;
}

async function getServiceCategories(context: AppContext): Promise<PickListValue[]> {
  try {
    const { statusCode, data } = await makeApiCall(context, "service_catalog/categories", "GET");
    if (statusCode >= 400 || !data?.service_categories) {
      return [];
    }
    return data.service_categories.map((cat: any) => ({
      label: cat.name,
      value: String(cat.id),
    }));
  } catch (error) {
    return [];
  }
}
async function getServiceItemsByCategory(context: AppContext): Promise<PickListValue[]> {
  const categoryId = context.payload?.config_fields?.category_id;
  if (!categoryId) {
    return [];
  }
  try {
    // Note: Freshservice API might not directly support filtering items by category ID easily in v2.
    // This often requires fetching all items and filtering, or fetching items *within* a category endpoint if available.
    // Assuming we fetch all and filter for simplicity here. Adjust if a direct endpoint exists.
    const { statusCode, data } = await makeApiCall(context, `service_catalog/items?category_id=${categoryId}`, "GET"); // Adjust endpoint if needed

    if (statusCode >= 400 || !data?.service_items) {
      return [];
    }

    // Filter items based on the selected category ID
    // The structure might vary; adjust `item.category_id` based on actual API response
    // const filteredItems = data.service_items.filter((item: any) => String(item.category_id) === String(categoryId));
    const filteredItems = data.service_items.map((items) => ({
      label: items.name,
      value: String(items.display_id),
    }));

    return filteredItems;
  } catch (error) {
    return [];
  }
}
async function buildServiceRequestInputSchema(
  context: AppContext,
  mode: "create" | "update" | "child"
): Promise<Field[]> {
  const itemId = context.payload.config_fields?.item_id as any;
  const stage = context.payload.config_fields?.stage as any;
  if (!itemId) {
    throw new Error("Service Item ID is required to build the input schema.");
  }

  try {
    const { statusCode, data: itemDetails } = await makeApiCall(context, `service_catalog/items/${itemId}`, "GET");
    if (statusCode >= 400 || !itemDetails?.service_item) {
      throw new Error(`Could not fetch details for Service Item ID: ${itemId}`);
    }

    const customItemFields = itemDetails.service_item.custom_fields || [];
    const defaultFields: Field[] = [];

    // Add standard fields based on mode
    if (mode === "create" || mode === "child") {
      defaultFields.push(
        { name: "email", label: "Requester Email", type: "string", control_type: "text", optional: false },
        { name: "requested_for", label: "Requested For Email", type: "string", control_type: "text", optional: true }
      );
    }
    if (itemDetails.service_item.quantity_visibility) {
      defaultFields.push({ name: "quantity", label: "Quantity", type: "number", control_type: "text", optional: true });
    }
    if (mode === "child") {
      defaultFields.push({
        name: "parent_ticket_id",
        label: "Parent Ticket ID",
        type: "number",
        control_type: "text",
        optional: false,
      });
    }
    if (mode === "update") {
      defaultFields.push(
        { name: "ticket_id", label: "Ticket ID", type: "number", control_type: "text", optional: false },
        {
          name: "requested_item_id",
          label: "Requested Item ID",
          type: "number",
          control_type: "text",
          optional: false,
        },
        {
          name: "remarks",
          label: "Reason for cancellation",
          control_type: "text",
          type: "string",
          optional: true,
          hint: "Required if status is Cancelled.",
        },
        {
          name: "stage",
          label: "Stage",
          type: "number",
          control_type: "select",
          optional: true, // stage is optional for update
          pick_list: [
            { label: "Requested", value: "1" },
            { label: "Delivered", value: "2" },
            { label: "Cancelled", value: "3" },
            { label: "Fulfilled", value: "4" },
            { label: "Partially fulfilled", value: "5" },
          ],
          hint: "Select the new status for the requested item.",
        }
      );
    }
    const customSchemaFields = ServiceRequestCustomFieldstransformFields(customItemFields);

    return [...defaultFields, ...customSchemaFields];
  } catch (error) {
    throw error; // Re-throw to indicate failure
  }
}

async function DynamicFunctionGetoffboardcategory0(context: AppContext): Promise<any[]> {
  const eventData = context?.payload?.data || {};

  // 1️⃣ Fetch offboarding form
  const { statusCode, data } = await makeApiCall(context, "offboarding_requests/form", "GET");

  if (statusCode !== 200 || !data) {
    return [];
  }

  // 2️⃣ Extract dynamic_0 field from payload
  const filteredKeys = Object.keys(eventData).filter((k) => k.includes("dynamic_0"));
  if (!filteredKeys.length) {
    return [];
  }

  const filteredEventData = filteredKeys.reduce((result: any, key) => {
    result[key] = eventData[key];
    return result;
  }, {});

  const [_, value1] = Object.entries(filteredEventData)[0] || [];
  if (!value1) {
    return [];
  }
  let category: any = value1;

  // 3️⃣ Use the root fields array directly
  const allFields = data.fields || [];

  // 4️⃣ Filter nested fields
  const nestedFields = allFields.filter((f: any) => f.field_type === "nested_field" && f.nested_field_choices);
  if (!nestedFields.length) {
    return [];
  }

  // 5️⃣ Capitalize helper
  function capitalizeFirstLetter(str: string) {
    if (typeof str !== "string" || !str.length) return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // 6️⃣ Collect subcategories from all nested fields
  const subCategoriesValue: any[] = [];
  for (const field of nestedFields) {
    const nestedChoices = field.nested_field_choices?.[category];
    if (nestedChoices) {
      const mapped = Object.keys(nestedChoices).map((subKey) => ({
        label: capitalizeFirstLetter(subKey),
        value: subKey,
      }));
      subCategoriesValue.push(...mapped);
    }
  }

  return subCategoriesValue;
}

async function DynamicFunctionGetonboardcategory0(context: AppContext): Promise<any[]> {
  const eventData = context?.payload?.data || {};

  // 1️⃣ Fetch onboarding form schema
  const { statusCode, data } = await makeApiCall(context, "onboarding_requests/form", "GET");

  if (statusCode !== 200 || !data) {
    return [];
  }

  // 2️⃣ Extract dynamic_0 field from payload
  const filteredKeys = Object.keys(eventData).filter((key) => key.includes("dynamic_0"));
  if (!filteredKeys.length) {
    return [];
  }

  const filteredEventData = filteredKeys.reduce((acc: any, key) => {
    acc[key] = eventData[key];
    return acc;
  }, {});

  const [_, value1] = Object.entries(filteredEventData)[0] || [];
  if (!value1) {
    return [];
  }

  let category: any = value1;

  // 3️⃣ Use the root fields array directly (onboarding schema has fields at root)
  const allFields = data.fields || [];

  // 4️⃣ Filter nested fields with nested_field_choices
  const nestedFields = allFields.filter((f: any) => f.field_type === "nested_field" && f.nested_field_choices);
  if (!nestedFields.length) {
    return [];
  }

  // 5️⃣ Helper: capitalize first letter
  function capitalizeFirstLetter(str: string) {
    if (typeof str !== "string" || !str.length) return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // 6️⃣ Collect subcategories from all nested fields
  const subCategoriesValue: any[] = [];
  for (const field of nestedFields) {
    const nestedChoices = field.nested_field_choices?.[category];
    if (nestedChoices) {
      const mapped = Object.keys(nestedChoices).map((subKey) => ({
        label: capitalizeFirstLetter(subKey),
        value: subKey,
      }));
      subCategoriesValue.push(...mapped);
    }
  }

  return subCategoriesValue;
}

async function DynamicFunctionGetonboardcategory1(context: AppContext): Promise<any[]> {
  const eventData = context?.payload?.data || {};

  // 1️⃣ Fetch onboarding form schema
  const { statusCode, data } = await makeApiCall(context, "onboarding_requests/form", "GET");
  if (statusCode !== 200 || !data) {
    return [];
  }

  // 2️⃣ Extract dynamic fields: category and subcategory
  const filteredKeys = Object.keys(eventData).filter((k) => k.includes("dynamic_"));
  if (filteredKeys.length < 2) {
    return [];
  }

  const filteredEventData = filteredKeys.reduce((acc: any, key) => {
    acc[key] = eventData[key];
    return acc;
  }, {});

  const entries = Object.entries(filteredEventData);
  const [_, value1] = entries[0] || [];
  const [__, value2] = entries[1] || [];

  const category: any = value1;
  const subcategory: any = value2;

  if (!category || !subcategory) {
    return [];
  }

  // 3️⃣ Use the root fields array directly
  const allFields = data.fields || [];

  // 4️⃣ Filter nested fields with nested_field_choices
  const nestedFields = allFields.filter((f: any) => f.field_type === "nested_field" && f.nested_field_choices);
  if (!nestedFields.length) {
    return [];
  }

  // 5️⃣ Helper: capitalize first letter
  function capitalizeFirstLetter(str: string) {
    if (typeof str !== "string" || !str.length) return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // 6️⃣ Collect level-2 subcategories from all nested fields
  const subCategoriesValue: any[] = [];
  for (const field of nestedFields) {
    const categoryChoices = field.nested_field_choices?.[category];
    if (!categoryChoices) continue;

    const subChoices = categoryChoices?.[subcategory];
    if (!subChoices) continue;

    const subKeys = Array.isArray(subChoices) ? subChoices : Object.keys(subChoices);
    const mapped = subKeys.map((subKey) => ({
      label: capitalizeFirstLetter(subKey),
      value: subKey,
    }));

    subCategoriesValue.push(...mapped);
  }

  return subCategoriesValue;
}

async function DynamicFunctionGetoffboardcategory1(context: AppContext): Promise<any[]> {
  const eventData = context?.payload?.data || {};

  // 1️⃣ Fetch offboarding form schema
  const { statusCode, data } = await makeApiCall(context, "offboarding_requests/form", "GET");
  // //console.log("data===>", data);

  if (statusCode !== 200 || !data) {
    return [];
  }

  // 2️⃣ Extract dynamic fields: category and subcategory
  const filteredKeys = Object.keys(eventData).filter((k) => k.includes("dynamic_"));
  if (filteredKeys.length < 2) {
    return [];
  }
  // //console.log("filteredKeys===>", filteredKeys);

  const filteredEventData = filteredKeys.reduce((acc: any, key) => {
    acc[key] = eventData[key];
    return acc;
  }, {});
  // //console.log("filteredEventData===>", filteredEventData);

  const entries = Object.entries(filteredEventData);
  const [_, value1] = entries[0] || [];
  const [__, value2] = entries[1] || [];
  const category: any = value1;
  const subcategory: any = value2;
  // //console.log("category===>", category);
  // //console.log("subcategory===>", subcategory);

  if (!category || !subcategory) {
    return [];
  }

  // 3️⃣ Use the top-level fields array directly
  const allFields = data.fields || [];
  // //console.log("allFields===>", allFields);

  // 4️⃣ Filter nested fields with nested_field_choices
  const nestedFields = allFields.filter((f: any) => f.field_type === "nested_field" && f.nested_field_choices);
  ////console.log("nestedFields===>", nestedFields);

  if (!nestedFields.length) {
    return [];
  }

  // 5️⃣ Helper: capitalize first letter
  function capitalizeFirstLetter(str: string) {
    if (typeof str !== "string" || !str.length) return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // 6️⃣ Collect level-2 subcategories from all nested fields
  const subCategoriesValue: any[] = [];
  for (const field of nestedFields) {
    const categoryChoices = field.nested_field_choices?.[category];
    if (!categoryChoices) continue;

    const subChoices = categoryChoices?.[subcategory];
    if (!subChoices) continue;

    const subKeys = Array.isArray(subChoices) ? subChoices : Object.keys(subChoices);
    const mapped = subKeys.map((subKey) => ({
      label: capitalizeFirstLetter(subKey),
      value: subKey,
    }));

    subCategoriesValue.push(...mapped);
  }

  return subCategoriesValue;
}

// ======================================================
// 🎫 Get Level 2 Ticket Values (Sub-Categories)
// ======================================================
async function getLevelTwoTicketsValues(context: AppContext): Promise<any[]> {
  const eventData = context?.payload?.data || {};
  const targetCategory: any = eventData?.category;

  if (!targetCategory) {
    console.warn("⚠️ Missing 'category' in event data.");
    return [];
  }
  const module = context.payload.config_fields.module as any;

  const fieldsResponse = await makeApiCall(context, `${module}_form_fields` as any, "GET");
  const moduleKey = `${module}_fields`; // e.g. "ticket_fields", "problem_fields", "change_fields"
  // //console.log(moduleKey);
  const fields = fieldsResponse?.data?.[moduleKey] || fieldsResponse?.[moduleKey] || fieldsResponse?.data || [];
  // //console.log(fields);
  if (!Array.isArray(fields)) {
    console.error("❌ Unexpected ticket_fields response format:", fieldsResponse);
    return [];
  }

  const categoryField = fields.find((field: any) => field.name === "category");
  if (!categoryField) {
    console.warn("⚠️ 'category' field not found in ticket form fields.");
    return [];
  }
  const choices = categoryField?.choices || [];
  const levelTwoValues = await getNestedOptions(choices, targetCategory);
  return levelTwoValues;
}

// ======================================================
// 🪜 Reusable Helper for Nested Dropdowns
// ======================================================
async function getNestedOptions(choices: any[], targetCategory: string): Promise<any[]> {
  if (!Array.isArray(choices) || choices.length === 0) return [];

  const targetChoice = choices.find((choice: any) => choice.value === targetCategory);

  if (!targetChoice) {
    console.warn(`⚠️ Category '${targetCategory}' not found in choices.`);
    return [];
  }

  // Nested level found
  const nestedList = targetChoice?.nested_options || targetChoice?.choices || [];

  if (!Array.isArray(nestedList) || nestedList.length === 0) {
    return [];
  }
  // //console.log("nextedlist", nestedList);
  return nestedList.map((nestedOption: any) => ({
    label: nestedOption.label || nestedOption.value,
    value: nestedOption.value,
  }));
}

// ======================================================
// 🎫 Get Level 3 Ticket Values (Item Categories)
// ======================================================
async function getLevel3TicketsValues(context: AppContext): Promise<any[]> {
  const eventData = context?.payload?.data || {};
  const targetCategory: any = eventData?.category;
  const targetSubCategory: any = eventData?.sub_category;

  if (!targetCategory || !targetSubCategory) {
    console.warn("⚠️ Missing 'category' or 'sub_category' in event data.");
    return [];
  }

  const module = context.payload.config_fields.module as any;
  const fieldsResponse = await makeApiCall(context, `${module}_form_fields`, "GET");

  const moduleKey = `${module}_fields`; // e.g. "ticket_fields", "problem_fields", "change_fields"

  const fields = fieldsResponse?.data?.[moduleKey] || fieldsResponse?.[moduleKey] || fieldsResponse?.data || [];

  if (!Array.isArray(fields)) {
    console.error("❌ Unexpected ticket_fields response format:", fieldsResponse);
    return [];
  }

  const categoryField = fields.find((field: any) => field.name === "category");
  if (!categoryField) {
    console.warn("⚠️ 'category' field not found in ticket form fields.");
    return [];
  }

  const categoryChoices = categoryField?.choices || [];

  // 🧩 Find the second-level choices (sub-categories)
  const levelTwoChoices = await getNestedOptions2(categoryChoices, targetCategory);

  // 🪄 Find the third-level choices (items under sub-category)
  const levelThreeValues = await getNestedOptionsForSubCategory(levelTwoChoices, targetSubCategory);

  return levelThreeValues;
}

// ======================================================
// 🪜 Helper: Extract Level 2 (Sub-category) Choices
// ======================================================
async function getNestedOptions2(choices: any[], targetCategory: any): Promise<any[]> {
  if (!Array.isArray(choices) || choices.length === 0) return [];
  const targetChoice = choices.find((choice: any) => choice.value === targetCategory);

  return targetChoice && Array.isArray(targetChoice.nested_options) ? targetChoice.nested_options : [];
}

// ======================================================
// 🪜 Helper: Extract Level 3 (Item) Choices from Sub-category
// ======================================================
async function getNestedOptionsForSubCategory(levelTwoChoices: any[], targetSubCategory: any): Promise<any[]> {
  if (!Array.isArray(levelTwoChoices) || levelTwoChoices.length === 0) return [];

  const targetSubCategoryChoice = levelTwoChoices.find((choice: any) => choice.value === targetSubCategory);

  if (!targetSubCategoryChoice) {
    console.warn(`⚠️ Sub-category '${targetSubCategory}' not found.`);
    return [];
  }

  const nestedOptions = targetSubCategoryChoice?.nested_options || [];

  return Array.isArray(nestedOptions)
    ? nestedOptions.map((nestedOption: any) => ({
        label: nestedOption.label || nestedOption.value,
        value: nestedOption.value,
      }))
    : [];
}

async function getAgentByGroupId(context: AppContext): Promise<any[]> {
  const eventData = context?.payload?.data || {};
  let AgentDropDown: any[] = [];
  const module = context.payload.config_fields.module ?? "ticket";
  // const groupId = eventData?.group_id ? eventData?.group_id : "None";
  const groupId = eventData?.group_id ?? eventData?.visible_to_id ?? "None";
  // //console.log(groupId);
  try {
    if (groupId === "None") {
      // 🔁 Fetch all agents using pagination helper
      const allAgents: any = await makeApiCall(context, `ticket_form_fields`, "GET");
      if (allAgents?.statusCode > 210) {
        const agents = await getAllAgents(context);
        // //console.log(agents);
        return agents;
      }
      let getagent = allAgents.data.ticket_fields.find((item) => item.name === "agent");
      AgentDropDown = getagent.choices.length ? getagent.choices : [];
      AgentDropDown = getagent.choices.length
        ? getagent.choices.map((item) => {
            return {
              label: item.value,
              value: String(item.id),
            };
          })
        : [];
    } else {
      // 🎯 Fetch agents in a specific group
      const groupAgents = await makeApiCall(context, `groups/${groupId}/agents`, "GET");
      // //console.log("groupAgents", groupAgents);
      const agentsArray = Array.isArray(groupAgents?.data) ? groupAgents.data : groupAgents?.data?.agents || [];
      AgentDropDown = agentsArray.map((agent: any) => ({
        label: agent.name || agent.email,
        value: String(agent.id),
      }));
    }
  } catch (error) {
    console.error("❌ Error fetching agents:", error);
  }

  return AgentDropDown;
}

async function getAgentByDepartment(context: AppContext): Promise<any[]> {
  const eventData = context?.payload?.data || {};
  let AgentDropDown: any[] = [];

  const departmentId = eventData?.department_id ?? "None";

  try {
    // ✅ If no department selected → return ALL agents as dropdown
    if (departmentId === "None") {
      const agents = await getAllAgents(context);
      return agents;
    }

    // ✅ Properly encoded Lucene query
    const query = `"department_id:${departmentId}"`;

    const groupAgents = await makeApiCall(context, `agents?query=${encodeURIComponent(query)}`, "GET");
    //   //console.log(groupAgents);
    const agentsArray = Array.isArray(groupAgents?.data?.agents) ? groupAgents.data.agents : [];
    AgentDropDown = agentsArray.map((agent: any) => ({
      label: agent.name || agent.email,
      value: String(agent.id),
    }));
  } catch (error) {
    console.error("❌ Error fetching agents by department:", error);
  }

  return AgentDropDown;
}

// ======================================================
// 📄 getModulePagination → Handles Pagination for Any Endpoint
// ======================================================
async function getModulePagination(context: AppContext, endpoint: string, dataKey: string): Promise<any[]> {
  let page = 1;
  const allData: any[] = [];

  try {
    while (true) {
      // 🧠 Append pagination params properly (handle ? or &)
      const connector = endpoint.includes("?") ? "&" : "?";
      const pagedEndpoint = `${endpoint}${connector}per_page=100&page=${page}`;

      const response = await makeApiCall(context, pagedEndpoint, "GET");

      const items = response?.data?.[dataKey] || response?.[dataKey] || [];

      if (!Array.isArray(items) || items.length === 0) break;

      allData.push(...items);

      if (items.length < 100) break; // 🛑 No more pages
      page++;
    }
  } catch (error) {
    console.error("❌ Pagination error for:", endpoint, error);
  }

  return allData;
}
async function inputOffboarding(ctx: AppContext): Promise<any> {
  try {
    // Step 0: Fetch offboarding request form
    const ticketsResp = await makeApiCall(ctx, "offboarding_requests/form", "GET");
    const tickets = ticketsResp.data;

    if (!tickets?.fields?.length) {
      throw new Error("Create Off-Boarding Fields in your Freshservice account.");
    }

    // Step 1: Fetch related data in parallel
    const [locationsResp, requestersResp, agentsResp, assetsResp, departmentsResp] = await Promise.all([
      makeApiCall(ctx, "locations", "GET"),
      makeApiCall(ctx, "requesters", "GET"),
      makeApiCall(ctx, "agents", "GET"),
      makeApiCall(ctx, "assets", "GET"),
      makeApiCall(ctx, "departments", "GET"),
    ]);

    const locations = locationsResp.data?.locations ?? [];
    const requesters = requestersResp.data?.requesters ?? [];
    const agents = agentsResp.data?.agents ?? [];
    const assets = assetsResp.data?.assets ?? [];
    const departments = departmentsResp.data?.departments ?? [];

    // Step 2: Map data to pick lists
    const locationsIdDS1 = locations.map((item: any) => ({ label: item.name, value: item.id }));
    const requesterEmailDS2 = requesters
      .filter((item: any) => item.primary_email)
      .map((item: any) => ({ label: item.primary_email, value: item.primary_email }));
    const requesterIdDS2 = requesters
      .filter((item: any) => item.primary_email)
      .map((item: any) => ({ label: item.primary_email, value: item.id }));
    const agentsEmailDS3 = agents
      .filter((item: any) => item.email)
      .map((item: any) => ({ label: item.email, value: item.email }));
    const agentsIdDS3 = agents
      .filter((item: any) => item.email)
      .map((item: any) => ({ label: item.email, value: item.id }));
    const assetsIDDS4 = assets.map((item: any) => ({ label: item.name, value: item.id }));
    const departmentIdDS6 = departments.map((item: any) => ({ label: item.name, value: item.name }));

    // Step 3: Helper functions
    const getChoices = (arr: any[]) => arr.map((v) => ({ label: v, value: v }));
    const getType = (fieldType: string) => {
      if (!fieldType) return "string";
      if (fieldType.includes("number") || fieldType.includes("decimal")) return "number";
      if (fieldType.includes("date")) return "string";
      if (fieldType.includes("picklist")) return "string";
      if (fieldType.includes("checkbox")) return "boolean";
      return "string";
    };
    const getControlType = (fieldType: string) => {
      if (!fieldType) return "text";
      if (fieldType.includes("number") || fieldType.includes("decimal")) return "text";
      if (fieldType.includes("date")) return "text";
      if (fieldType.includes("picklist")) return "select";
      if (fieldType.includes("checkbox")) return "select";
      return "text";
    };

    // Step 4: Map ticket fields to schema
    const customFields = tickets.fields
      .filter((f: any) => !f.nested_field_choices)
      .map((f: any) => {
        const type = getType(f.field_type);
        let control_type = getControlType(f.field_type);

        const field: any = {
          name: f.name,
          label: capitalizeFirstLetter(f.label),
          type,
          control_type,
          optional: f.required !== "true",
          data_source: f.data_source,
        };

        // Add pick_list ONLY for select or multiselect
        if ((control_type === "select" || control_type === "multiselect") && f.choices?.length) {
          field.pick_list = getChoices(f.choices);
        }

        // Boolean override
        if (type === "boolean") {
          field.control_type = "select";
          field.pick_list = [
            { label: "TRUE", value: "true" },
            { label: "FALSE", value: "false" },
          ];
        }

        return field;
      });

    // Step 5: Assign pick lists based on data source
    const allUsers = [...requesterEmailDS2, ...agentsEmailDS3];
    const finalFields = customFields.map((item: any) => {
      switch (item.data_source) {
        case 1:
          item.control_type = "select";
          item.pick_list = locationsIdDS1;
          item.type = "number";
          break;
        case 2:
          item.control_type = "select";
          item.pick_list = requesterIdDS2;
          item.type = "number";
          break;
        case 3:
          item.control_type = "select";
          item.pick_list = agentsIdDS3;
          item.type = "number";
          break;
        case 4:
          item.control_type = "select";
          item.pick_list = assetsIDDS4;
          item.type = "number";
          break;
        case 5:
          item.control_type = "select";
          item.pick_list = allUsers;
          break;
        case 6:
          item.control_type = "select";
          item.pick_list = departmentIdDS6;
          break;
      }
      delete item.data_source;
      return item;
    });

    // Step 6: Handle nested fields
    const nestedFields = tickets.fields.filter((f: any) => f.nested_field_choices);
    if (nestedFields.length) {
      const parsedSchema = await generateParsedSchemaNestedCustomFields(nestedFields, "offboard");
      finalFields.push(...parsedSchema);
    }

    return finalFields;
  } catch (error: any) {
    throw error;
  }
}

function flattenNestedFields(fields: any[]): any[] {
  const result: any[] = [];

  for (const field of fields) {
    // Always include the field itself
    result.push(field);

    // If it has choices → flatten them
    if (Array.isArray(field.choices)) {
      for (const choice of field.choices) {
        result.push(choice);

        // If the choice has nested_options → flatten deeper
        if (Array.isArray(choice.nested_options) && choice.nested_options.length > 0) {
          result.push(...flattenNestedFields(choice.nested_options));
        }
      }
    }

    // If it has nested_fields (like Beta, Gamma) → flatten them too
    if (Array.isArray(field.nested_fields)) {
      result.push(...flattenNestedFields(field.nested_fields));
    }
  }

  return result;
}

function transformNestedFields(fields: any[], module?: string) {
  const result: any[] = [];
  let parentCounter = 1;

  for (const field of fields) {
    if (field.field_type === "nested_field") {
      // 🔹 Parent field
      const parentName = `parent:${parentCounter}:${field.name}`;
      const parentPickList =
        (field.choices || []).map((c: any) => ({
          label: c.value,
          value: c.value,
        })) || [];
      function isFieldRequired(field: any, mode: any) {
        if (mode === "ticket") return !!field.required_for_agents;
        return !!field.required;
      }
      result.push({
        name: parentName,
        label: field.label,
        type: "string",
        control_type: "select",
        custom: true,
        optional: !isFieldRequired(field, module),
        ...(parentPickList.length ? { pick_list: parentPickList } : {}),
      });

      // 🔹 Child fields
      field.nested_fields?.forEach((nested: any, idx: number) => {
        // build child key including parent index
        const childName = `parent:${parentCounter}:child:${idx + 1}:${nested.name}`;
        const dep: string[] = [parentName];

        if (idx > 0) {
          // depend on previous child too
          dep.push(`parent:${parentCounter}:child:${idx}:${field.nested_fields[idx - 1].name}`);
        }

        result.push({
          name: childName,
          label: nested.label,
          type: "string",
          control_type: "select",
          custom: true,
          optional: !isFieldRequired(field, module),
          function: `${module}parent${parentCounter}dependent${idx + 1}`,
          dependentTo: dep,
        });
      });

      parentCounter++;
    }
  }

  return result;
}

async function buildTicketInputSchema(context: any, mode: any): Promise<any[]> {
  const Fields = await makeApiCall(
    context,
    `ticket_form_fields?workspace_id=${context?.payload?.config_fields?.workspace_id}`,
    "GET"
  );

  if (Fields?.statusCode > 210) {
    return Fields;
  }
  const ticketFields = Fields.data.ticket_fields;
  const fieldPropName: any = {
    product: "product_id",
    group: "group_id",
    company: "company_id",
    department: "department_id",
    ticket_type: "type",
    agent: "responder_id",
  };

  const defaultFields: any[] = [];
  const customFields: any[] = [];
  const nestedFields: any[] = [];
  let levelOneData: any[] = [];

  if (mode === "update") {
    defaultFields.push({
      name: "ticket_id",
      label: "Ticket ID",
      optional: false, // flipped
      type: "string",
      control_type: "text",
      hint: "Enter ticket Id for update respective data",
    });
  }

  defaultFields.push({
    name: "email",
    label: "Requestor Email",
    optional: !(mode !== "update"), // flipped logic
    control_type: "text",
    type: "string",
  });
  const nested_fields: any = ticketFields
    .filter((item) => item.field_type === "nested_field")
    .sort((a, b) => a.position - b.position);
  ////console.log("nested_fields", nested_fields);
  const parsedNestedFields = transformNestedFields(nested_fields, "ticket");
  // //console.log("parsedNestedFields", parsedNestedFields);
  for (let field of ticketFields) {
    if (["requester", "workspace_id", "agent"].includes(field.name)) continue;
    if (field.name === "category" && Array.isArray(field.choices)) {
      levelOneData = field.choices.map((c: any) => ({ label: c.value, value: c.value }));
      continue;
    }
    const isCutom = !field.default_field;
    let pick_lists: any[] = [];
    if (field.field_type !== "nested_field") {
      if (field.label === "Type") {
        pick_lists = field.choices.map((c: any) => ({
          label: c.value,
          value: c.value,
        }));
      } else if (Array.isArray(field.choices)) {
        pick_lists = field.choices.map((c: any) => ({
          label: c.value,
          value: field.default_field ? String(c.id) : c.value,
        }));
      } else if (typeof field.choices === "object") {
        pick_lists = Object.entries(field.choices).map(([key, value]) => ({ label: value, value: String(key) }));
      }

      const requiredFlag = mode === "update" ? true : !field.required_for_agents; // flipped

      const baseField: any = {
        label: field.label,
        optional: requiredFlag,
        pick_list: pick_lists.length ? pick_lists : undefined,
        type: mapType(field.field_type) || "string",
        control_type:
          field.field_type === "custom_multi_select_dropdown"
            ? "multiselect"
            : pick_lists.length > 0
              ? "select"
              : mapControlType(field.field_type),
        name: field.default_field ? fieldPropName[field.name] || field.name : field.name,
      };
      if (isCutom) {
        baseField.custom = true;
      }

      if (field.default_field) {
        defaultFields.push(baseField);
      } else if (!["custom_file"].includes(field.field_type)) {
        customFields.push(baseField); //control_type: "multiselect",
      }
    }

    // else {
    //   const dynamicNestedFields = buildDynamicNestedFields(field, mode);
    //   nestedFields.push(...dynamicNestedFields);
    // }
  }

  const staticFields = [
    { name: "cc_emails", label: "CC Emails", type: "array", optional: true, control_type: "text" },
    { name: "name", label: "Name", type: "string", optional: true, control_type: "text" },
    { name: "tags", label: "Tags", type: "array", optional: true, control_type: "text" },
    { name: "due_by", label: "Due By", type: "string", optional: true, control_type: "text" },
    { name: "fr_due_by", label: "Fr Due By", type: "string", optional: true, control_type: "text" },
    {
      name: "attachment",
      label: "Attachment URL",
      type: "string",
      control_type: "text",
      optional: true,
      hint: "Attachment URL commo seperated ",
    },
    {
      name: "attachment_name",
      control_type: "text",
      label: "Attachment name",
      type: "string",
      optional: true,
      hint: "Attachment name is mandatory for attachment content",
    },
    { name: "attachment_content", label: "Attachment Content", control_type: "text", type: "string", optional: true },
    {
      name: "category",
      label: "Category",
      type: "string",
      control_type: "select",
      optional: true,
      pick_list: levelOneData,
    },
    {
      name: "sub_category",
      label: "Sub-Category",
      type: "string",
      control_type: "select",
      optional: true,
      function: "getLevelTwoTicketsValues",
      dependentTo: ["category"],
    },
    {
      name: "item_category",
      label: "Item",
      type: "string",
      control_type: "select",
      optional: true,
      function: "getLevel3TicketsValues",
      dependentTo: ["category", "sub_category"],
    },
    {
      label: "Assigned to",
      optional: true,
      function: "getAgentByGroupId",
      dependentTo: ["group_id"],
      type: "number",
      control_type: "select",
      name: "responder_id",
      hint: "ID of the agent to whom the ticket has been assigned.",
    },
  ];

  const parsedSchema = [...defaultFields, ...customFields, ...nestedFields, ...staticFields, ...parsedNestedFields];
  const numberFields = ["status", "priority", "department_id"];
  parsedSchema.forEach((f) => {
    if (numberFields.includes(f.name)) {
      f.type = "number";
    }
    if (f.name === "group_id") f.pick_list.unshift({ label: "None", value: "None" });
  });

  return parsedSchema;
}
function normalizeEventData(eventData: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};

  ////console.log("📩 Raw eventData:", eventData);

  for (const [key, value] of Object.entries(eventData)) {
    if (key.startsWith("parent:") || key.startsWith("child:")) {
      const parts = key.split(":");
      const fieldName = parts[parts.length - 1]; // ✅ always take only the last piece
      result[fieldName] = value;
      //  //console.log(`🔄 Normalized key: ${key} -> ${fieldName} = ${value}`);
    } else {
      result[key] = value;
      //  //console.log(`➡️ Keeping key as-is: ${key} = ${value}`);
    }
  }

  ////console.log("✅ Normalized eventData:", result);
  return result;
}
function getMimeTypeFromBase64(base64String) {
  // Take only the first few bytes (enough to check magic numbers)
  const firstBytes = Buffer.from(base64String, "base64").slice(0, 4).toString("hex");

  // Check common magic numbers
  const mimeSignatures = {
    "89504e47": "image/png",
    "47494638": "image/gif",
    ffd8ffe0: "image/jpeg",
    ffd8ffe1: "image/jpeg",
    ffd8ffe2: "image/jpeg",
    "25504446": "application/pdf",
    "504b0304": "application/zip", // also DOCX, XLSX, PPTX
  };

  for (const [signature, mime] of Object.entries(mimeSignatures)) {
    if (firstBytes.startsWith(signature)) {
      return mime;
    }
  }

  return "application/octet-stream"; // default if unknown
}

async function createOrUpdateTicket(context: AppContext, endpoint: string, mode: "create" | "update"): Promise<any> {
  const { ticket_id, parent_id, ...data } = context.payload.data as any;
  const { workspace_id } = context.payload.config_fields as any;
  // const data = group_id === "None" ? balancePayload : { group_id, ...balancePayload };
  const Inputschema = await buildTicketInputSchema(context, "create");
  // //console.log(Inputschema[0]);
  const payload = generatePayload(Inputschema, { ...data, workspace_id });
  ////console.log(payload);
  const eventData: any = normalizeEventData(data);
  // //console.log("eventData", eventData);
  // Fields that should always be arrays

  const arrayFields = ["cc_emails", "tags", "to_emails"];
  // Normalize array fields in eventData
  arrayFields.forEach((field) => {
    if (field in eventData && typeof eventData[field] === "string") {
      eventData[field] = eventData[field].split(",").map((x: string) => x.trim());
    }
  });

  const body = removeEmpty(payload);
  if (body.group_id) {
    if (body.group_id.toString().toLowerCase() === "none") {
      delete body.group_id;
    } else if (!isNaN(Number(body.group_id))) {
      body.group_id = Number(body.group_id);
    }
  }
  const finalPayload = await Assignattchments(context, payload);
  if (finalPayload?.statusCode > 210) {
    return {
      statusCode: finalPayload.statusCode,
      data: {
        error: finalPayload,
      },
    };
  }
  /// //console.log(endpoint);
  const ticeketResponse = await ApiCallWithAttachment(
    context,
    endpoint,
    mode === "create" ? "POST" : "PUT",
    finalPayload
  );

  if (ticeketResponse?.data?.ticket?.id && ticeketResponse.statusCode <= 210) {
    const ticket = ticeketResponse?.data?.ticket as any;
    const attachments_url =
      ticket?.attachments && ticket?.attachments.length
        ? ticket.attachments.map((item) => item.attachment_url).join(",")
        : "";
    const attachment_ids =
      ticket?.attachments && ticket?.attachments.length ? ticket.attachments.map((item) => item.id) : [];
    const first_attachment_id = ticket.attachments.length ? ticket.attachments[0].id : null;
    return {
      data: { ...ticket, attachments_url, attachment_ids, first_attachment_id },
      statusCode: ticeketResponse.statusCode,
    };
  }
  return ticeketResponse;
}
async function getAgentInputSchema(context: AppContext, mode: "create" | "update"): Promise<any> {
  // 1. Fetch all necessary data in parallel for efficiency
  const [
    agentFieldsResponse,
    requesterFieldsResponse,
    locationResponse,
    departmentResponse,
    rolesResponse,
    groups,
    workspaces,
  ] = await Promise.all([
    makeApiCall(context, `agent_fields`, "GET"),
    makeApiCall(context, `requester_fields`, "GET"),
    makeApiCall(context, "locations", "GET"),
    makeApiCall(context, "departments", "GET"),
    makeApiCall(context, "roles", "GET"),
    makeApiCall(context, "groups", "GET"),
    getallWorkspaces(context),
  ]);

  // 2. Create dropdown pick_lists from the fetched data
  const locationDropdown =
    locationResponse.data?.locations?.map((loc: any) => ({
      label: loc.name,
      value: String(loc.id),
    })) || [];

  const departmentDropdown =
    departmentResponse.data?.departments?.map((dept: any) => ({
      label: dept.name,
      value: String(dept.id),
    })) || [];

  const rolesDropdown =
    rolesResponse.data?.roles?.map((role: any) => ({
      label: role.name,
      value: String(role.id),
    })) || [];
  const groupDropdown =
    groups.data?.groups?.map((role: any) => ({
      label: role.name,
      value: String(role.id),
    })) || [];
  // //console.log(groups);
  // //console.log("fieldRespnse", fieldsResponse);
  // 3. Validate the primary API response for agent fields
  if (agentFieldsResponse.statusCode >= 400) {
    throw new Error("Could not fetch agent fields to build the form.");
  }

  const agentFields = agentFieldsResponse.data?.agent_fields || [];
  const requesterFields = requesterFieldsResponse.data?.requester_fields || [];
  const requesterDropdownMap = requesterFields.reduce((acc: any, field: any) => {
    if (field.choices && (Array.isArray(field.choices) || Object.keys(field.choices).length > 0)) {
      acc[field.name] = field.choices;
    }
    return acc;
  }, {});
  // 4. Deticle type and control mappings
  const fieldTypeMapping: Record<string, FieldType> = {
    custom_text: "string",
    custom_paragraph: "string",
    custom_number: "number",
    custom_date: "date_time",
    custom_checkbox: "boolean",
    custom_decimal: "number",
    custom_dropdown: "string",
  };

  const controlTypeMapping: Record<string, ControlType> = {
    custom_text: "text",
    custom_paragraph: "text-area",
    custom_number: "number",
    custom_date: "datetime",
    custom_checkbox: "select",
    custom_decimal: "number",
    custom_dropdown: "select",
  };

  // 5. Map API fields to DSL schema fields
  let schemaFields: Field[] = agentFields
    .filter((field: any) => field.type !== "lookup") // Exclude unsupported fields
    .map((field: any) => {
      const isCustom = field?.default_field ? !field.default_field : !field.default;
      const nameMapping: Record<string, string> = {
        phone: "work_phone_number",
        mobile: "mobile_phone_number",
        agent_group: "group_ids",
        department: "department_ids",
        reporting_manager: "reporting_manager_id",
        department_head: "can_see_all_tickets_from_associated_departments",
      };
      const name = nameMapping[field.name] || field.name;

      const baseField: Field = {
        name, // Prefix custom fields
        label: field.label_for_admins ? field.label_for_admins : field.label,
        optional: mode === "update" ? true : !field.required_for_agents,
        type: fieldTypeMapping[field.type] || "string",
        control_type: controlTypeMapping[field.type] || "text",
        custom: isCustom,
      };

      if (Array.isArray(field.choices) && field.choices.length > 0) {
        baseField.pick_list = field.choices.map((choice: any) => ({
          label: String(choice),
          value: String(choice),
        }));
        baseField.control_type = "select";
      }
      // else if (typeof field.choices === "object" && Object.keys(field.choices).length) {
      //   baseField.pick_list = Object.entries(field.choices).map(([key, choice]) => ({
      //     label: String(choice),
      //     value: String(key),
      //   }));
      // }
      else if (requesterDropdownMap[field.name]) {
        const choices = requesterDropdownMap[field.name];
        if (Array.isArray(choices)) {
          baseField.pick_list = choices.map((choice: any) => ({
            label: String(choice),
            value: String(choice),
          }));
          baseField.control_type = "select";
        } else {
          baseField.pick_list = Object.entries(choices).map(([key, choice]) => ({
            label: String(choice),
            value: String(key),
          }));
          baseField.control_type = "select";
        }
      }
      // Special handling for boolean (checkbox) fields
      if (baseField.type === "boolean") {
        baseField.control_type = "select";
        baseField.pick_list = [
          { label: "True", value: "true" },
          { label: "False", value: "false" },
        ];
      }

      return baseField;
    });

  // 6. Apply specific transformations and enrich with dynamic picklists
  schemaFields = schemaFields.map((item) => {
    if (item.name === "first_name" || item.name === "email" || item.name === "last_name") {
      item.optional = false;
    }
    if (item.name === "location_id") {
      item.pick_list = locationDropdown;
      item.control_type = "select";
    }
    if (item.name === "reporting_manager_id") {
      ((item.type = "number"), (item.control_type = "text"));
    }
    if (item.name === "description") {
      item.control_type = "text-area";
      item.name = "background_information";
    }
    if (item.name === "vip_user" || item.name === "can_see_all_tickets_from_associated_departments") {
      ((item.type = "boolean"),
        (item.control_type = "select"),
        (item.pick_list = [
          {
            label: "True",
            value: "true",
          },
          {
            label: "False",
            value: "false",
          },
        ]));
    }
    if (item.name === "department_ids") {
      item.type = "array";
      item.of = "number";
      item.control_type = "multiselect";
      item.pick_list = departmentDropdown;
    }

    if (item.name === "time_format") {
      item.control_type = "select";
      item.pick_list = [
        { label: "12h (12 hour format)", value: "12h" },
        { label: "24h (24 hour format)", value: "24h" },
      ];
    }
    return item;
  });

  // 7. Add any hardcoded optional fields
  const optionalFields: Field[] = [
    {
      name: "occasional",
      label: "Occasional Agent",
      type: "boolean",
      optional: true,
      control_type: "select",
      pick_list: [
        { label: "True", value: "true" },
        { label: "False", value: "false" },
      ],
    },
    {
      name: "roles:role_id",
      label: "Role ID",
      type: "string",
      optional: true,
      control_type: "select",
      pick_list: rolesDropdown,
      of: "number",
      hint: "Unique ID of the role assigned",
    },
    {
      name: "roles:assignment_scope",
      label: "Role Assignment Scope",
      type: "string",
      optional: true,
      control_type: "select",
      pick_list: [
        { label: "Entire Helpdesk", value: "entire_helpdesk" },
        { label: "Member Groups", value: "member_groups" },
        { label: "Specified Groups", value: "specified_groups" },
        { label: "Assigned Items", value: "assigned_items" },
      ],
      hint: "The scope in which the agent can use the permissions granted by this role",
    },
    {
      name: "roles:groups",
      label: "Role groups",
      type: "string",
      optional: true,
      control_type: "select",
      pick_list: groupDropdown,
      hint: "Unique IDs of Groups in which the permissions granted by the role applies. Mandatory only when the assignment_scope is specified_groups, and should be ignored otherwise.",
      of: "number",
    },
    {
      name: "member_of",
      label: "Member Of",
      type: "array",
      optional: true,
      control_type: "multiselect",
      pick_list: groupDropdown,
      of: "number",
    },
    {
      name: "observer_of",
      label: "Observer Of",
      type: "array",
      optional: true,
      control_type: "multiselect",
      pick_list: groupDropdown,
      of: "number",
    },
    {
      name: "workspace_ids",
      label: "Workspace IDS",
      type: "array",
      optional: true,
      control_type: "multiselect",
      pick_list: workspaces,
      of: "number",
    },
  ];

  const finalSchema = [...schemaFields, ...optionalFields];

  // 8. Prepend the ID field for update mode
  if (mode === "update") {
    return [
      {
        name: "agent_id",
        label: "Agent ID",
        type: "number",
        control_type: "text",
        optional: false,
        hint: "The unique ID of the agent to update.",
      },
      ...finalSchema.map((item) => {
        if (item.optional === false) {
          item.optional = true;
        }
        return item;
      }),
    ];
  }

  return finalSchema;
}
async function getRequesterInputSchema(context: AppContext, mode: "create" | "update"): Promise<Field[]> {
  const { data: fieldsResponse, statusCode } = await makeApiCall(context, `requester_fields`, "GET");

  // const location = await makeApiCall(context, "locations", "GET");
  // const locationDropdown =
  //   location?.data?.locations && location.data.locations.length
  //     ? location.data.locations.map((choice) => ({
  //         label: choice.name,
  //         value: String(choice.id),
  //       }))
  //     : [];
  const getAllLocations = await getLocations(context);
  ////console.log(getAllLocations);
  const department = await makeApiCall(context, "departments", "GET");
  // //console.log(department);
  const departmentDropdown =
    department.data.departments && department.data.departments.length
      ? department.data.departments.map((choice) => ({
          label: choice.name,
          value: String(choice.id),
        }))
      : [];
  if (statusCode >= 400 || !fieldsResponse?.requester_fields) {
    throw new Error("Could not fetch requester fields to build the form.");
  }
  const requesterFields = fieldsResponse.requester_fields;
  // const NondefaultFields = requesterFields.filter((f) => !f.default).map((item) => item.name);
  // //console.log(NondefaultFields);

  // Type mappings from Freshservice API to Konnectify DSL
  const fieldTypeMapping: Record<string, FieldType> = {
    custom_text: "string",
    custom_paragraph: "string",
    custom_number: "number",
    custom_date: "date_time",
    custom_checkbox: "boolean",
    custom_decimal: "number",
    custom_dropdown: "string",
    custom_url: "string",
  };

  const controlTypeMapping: Record<string, ControlType> = {
    custom_text: "text",
    custom_paragraph: "text-area",
    custom_number: "text",
    custom_date: "datetime",
    custom_checkbox: "select",
    custom_decimal: "text",
    custom_dropdown: "select",
    custom_url: "text",
  };

  let schemaFields: Field[] = requesterFields
    .filter((field: any) => field.type !== "lookup") // Exclude unsupported lookup fields
    .map((field: any) => {
      // Correctly map API field names to the names expected by the payload
      const isCustom = !field.default;
      const nameMapping: Record<string, string> = {
        phone: "work_phone_number",
        mobile: "mobile_phone_number",
        email: "primary_email",
        department: "department_ids",
        reporting_manager: "reporting_manager_id",
      };
      const name = nameMapping[field.name] || field.name;

      const baseField: Field = {
        name,
        label: field.label,
        optional: mode === "update" ? true : !field.required_for_agents,
        type: fieldTypeMapping[field.type] || "string",
        control_type: controlTypeMapping[field.type] || "text",
        custom: isCustom,
      };

      // Populate pick_list for dropdowns
      if (Array.isArray(field.choices) && field.choices.length > 0) {
        baseField.pick_list = field.choices.map((choice: any) => ({
          label: String(choice),
          value: String(choice),
        }));
        baseField.control_type = "select";
      }
      if (typeof field.choices === "object" && Object.keys(field.choices).length) {
        baseField.pick_list = Object.entries(field.choices).map(([key, choice]) => ({
          label: String(choice),
          value: String(key),
        }));
        baseField.control_type = "select";
      }

      // Special handling for boolean (checkbox) fields
      if (baseField.type === "boolean") {
        baseField.control_type = "select";
        baseField.pick_list = [
          { label: "True", value: "true" },
          { label: "False", value: "false" },
        ];
      }

      return baseField;
    });

  schemaFields = schemaFields
    .map((item) => {
      if (item.name === "reporting_manager_id") {
        ((item.type = "number"), (item.control_type = "text"));
      }
      if (item.name === "description") {
        item.name = "background_information";
      }
      if (item.name === "vip_user") {
        ((item.type = "boolean"),
          (item.control_type = "select"),
          (item.pick_list = [
            {
              label: "True",
              value: "true",
            },
            {
              label: "False",
              value: "false",
            },
          ]));
      }
      if (item.name === "location_id") {
        item.pick_list = getAllLocations;
        item.control_type = "select";
        item.type = "string";
      }
      if (item.name === "department_ids") {
        ((item.type = "array"),
          (item.of = "number"),
          (item.control_type = "multiselect"),
          (item.pick_list = departmentDropdown));
      }
      if (item.name === "time_format") {
        item.control_type = "select";
        item.pick_list = [
          {
            label: "12h (12 hour format)",
            value: "12h",
          },
          {
            label: "24h (24 hour format)",
            value: "24h",
          },
        ];
      }
      return item;
    })
    .filter((f) => f.name !== "department_head" && f.name !== "change_department_head");

  // Add hardcoded standard fields
  const OptinalFields: Field[] = [
    {
      name: "can_see_all_tickets_from_associated_departments",
      label: "Can See All Tickets From Associated Departments",
      type: "boolean",
      optional: true,
      control_type: "select",
      pick_list: [
        { label: "True", value: "true" },
        { label: "False", value: "false" },
      ],
    },
    {
      name: "secondary_emails",
      label: "Secondary emails",
      type: "array",
      optional: true,
      control_type: "text",
    },
  ];

  const finalSchema = [...schemaFields, ...OptinalFields];

  // For "update" mode, prepend the mandatory requester_id field
  if (mode === "update") {
    return [
      {
        name: "requester_id",
        label: "Requester ID",
        type: "number",
        control_type: "number",
        optional: false,
        hint: "The unique ID of the requester to update.",
      },
      ...finalSchema,
    ];
  }

  return finalSchema;
}

async function getDepartmentInputSchema(context: AppContext, mode: "create" | "update"): Promise<Field[]> {
  //   const { data: fieldsResponse, statusCode } = await makeApiCall(context, `department_fields`, "GET");

  //   if (statusCode >= 400 || !fieldsResponse?.department_fields) {
  //     throw new Error("Could not fetch requester fields to build the form.");
  //   }
  const updateData =
    mode == "update"
      ? [
          {
            name: "id",
            label: "Id",
            type: "string",
            control_type: "text",
            optional: false,
            hint: "Enter Department Id",
          },
        ]
      : [];
  const result: any = [
    {
      name: "name",
      label: "Name",
      type: "string",
      control_type: "text",
      optional: mode == "update" ? true : false,
      hint: "Enter Name",
    },
    {
      name: "description",
      label: "description",
      type: "string",
      control_type: "text-area",
      optional: true,
      hint: "Enter description",
    },
    {
      name: "domains",
      label: "Domains",
      type: "string",
      control_type: "text",
      optional: true,
      hint: "Enter Domain eg:abc.com,abc.in,abc.co",
    },
    ...updateData,
  ];

  // -----------
  //     When using the "department_fields" endpoint, fields are available but there is no "type" field included,
  //     and trying to use some of these fields to create records gives an error.
  //     After discussing with ATS, only three fields are returned by this endpoint.
  // -----------
  return result;
}

function transformRolesPayload(payload: Record<string, any>) {
  const roles: any = {};
  const rest: Record<string, any> = {};

  for (const [key, value] of Object.entries(payload)) {
    if (key.startsWith("roles:")) {
      const newKey = key.replace("roles:", "");

      // Ensure groups always becomes an array
      if (newKey === "groups") {
        roles[newKey] = [isNaN(Number(value)) ? value : Number(value)];
      } else {
        roles[newKey] = isNaN(Number(value)) ? value : Number(value);
      }
    } else {
      rest[key] = value;
    }
  }

  if (Object.keys(roles).length > 0) {
    rest["roles"] = [roles];
  }

  return rest;
}
// function generatePayload(fieldSchema: any[], payload: Record<string, any>): Promise<any> {
//   const result: any = {};
//   const customFields: any = {};

//   for (const [key, value] of Object.entries(payload)) {
//     const field = fieldSchema.find((f) => f.name === key);

//     // default: keep raw value if field not found
//     let newValue: any = value;

//     if (field) {
//       // 🔹 Handle array or multiselect
//       if (field.type === "array" || field.control_type === "multiselect") {
//         if (typeof value === "string") {
//           newValue = [value];
//         }

//         if (Array.isArray(newValue)) {
//           newValue = newValue.flatMap((v) =>
//             typeof v === "string" && v.includes(",") ? v.split(",").map((s) => s.trim()) : [v]
//           );

//           if (field.of === "number") {
//             newValue = newValue.map((v) => Number(v));
//           } else {
//             newValue = newValue.map((v) => String(v));
//           }
//         }
//       }

//       // 🔹 Handle number
//       else if (field.type === "number") {
//         newValue = Number(value);
//       }

//       // 🔹 Handle boolean
//       else if (field.type === "boolean") {
//         if (typeof value === "string") {
//           newValue = value.toLowerCase() === "true";
//         }
//       }

//       // 🔹 Fallback: string
//       else {
//         newValue = String(value);
//       }

//       // 🔹 Put into correct place
//       if (field.custom) {
//         const cleanKey: any = key.includes("parent:") ? key.split(":").pop() : key;
//         customFields[cleanKey] = newValue;
//         continue; // don’t also push to result
//       }
//     }

//     // ✅ if not custom, or no fieldSchema match — keep it as-is
//     result[key] = newValue;
//   }

//   if (Object.keys(customFields).length > 0) {
//     result["custom_fields"] = customFields;
//   }

//   return result;
// }
function generatePayload(fieldSchema: any[], payload: Record<string, any>): any {
  const result: any = {};
  const customFields: any = {};

  for (const [key, value] of Object.entries(payload)) {
    const field = fieldSchema.find((f) => f.name === key);
    let newValue: any = value;

    if (field) {
      // 🔹 Handle array or multiselect
      if (field.type === "array" || field.control_type === "multiselect") {
        if (typeof value === "string") newValue = [value];
        if (Array.isArray(newValue)) {
          newValue = newValue.flatMap((v) =>
            typeof v === "string" && v.includes(",") ? v.split(",").map((s) => s.trim()) : [v]
          );
          newValue = field.of === "number" ? newValue.map((v) => Number(v)) : newValue.map((v) => String(v));
        }
      }

      // 🔹 Handle number
      else if (field.type === "number") {
        newValue = value === null || value === undefined ? value : Number(value);
      }

      // 🔹 Handle boolean
      else if (field.type === "boolean") {
        if (typeof value === "string") {
          newValue = value.toLowerCase() === "true";
        } else if (typeof value === "boolean") {
          newValue = value;
        } else {
          newValue = value === null || value === undefined ? value : Boolean(value);
        }
      }

      // 🔹 Fallback: string (but skip null/undefined)
      else {
        newValue = value === null || value === undefined ? value : String(value);
      }

      // 🔹 Put into correct place
      if (field.custom) {
        const cleanKey: any = key.includes("parent:") ? key.split(":").pop() : key;
        customFields[cleanKey] = newValue;
        continue;
      }
    }

    // ✅ Default for non-custom fields
    result[key] = newValue;
  }

  if (Object.keys(customFields).length > 0) {
    result["custom_fields"] = customFields;
  }

  return result;
}
function generateAssetPayload(fieldSchema: any[], payload: Record<string, any>): any {
  const result: any = {};
  const type_fields: any = {};

  for (const [key, value] of Object.entries(payload)) {
    const field = fieldSchema.find((f) => f.name === key);
    let newValue: any = value;

    if (field) {
      // 🔹 Handle array or multiselect
      if (field.type === "array" || field.control_type === "multiselect") {
        if (typeof value === "string") newValue = [value];
        if (Array.isArray(newValue)) {
          newValue = newValue.flatMap((v) =>
            typeof v === "string" && v.includes(",") ? v.split(",").map((s) => s.trim()) : [v]
          );
          newValue = field.of === "number" ? newValue.map((v) => Number(v)) : newValue.map((v) => String(v));
        }
      }

      // 🔹 Handle number
      else if (field.type === "number") {
        newValue = value === null || value === undefined ? value : Number(value);
      }

      // 🔹 Handle boolean
      else if (field.type === "boolean") {
        if (typeof value === "string") {
          newValue = value.toLowerCase() === "true";
        } else if (typeof value === "boolean") {
          newValue = value;
        } else {
          newValue = value === null || value === undefined ? value : Boolean(value);
        }
      }

      // 🔹 Fallback: string (but skip null/undefined)
      else {
        newValue = value === null || value === undefined ? value : String(value);
      }

      // 🔹 Put into correct place
      if (field.custom) {
        const cleanKey: any = key.includes("parent:") ? key.split(":").pop() : key;
        type_fields[cleanKey] = newValue;
        continue;
      }
    }

    // ✅ Default for non-custom fields
    result[key] = newValue;
  }

  if (Object.keys(type_fields).length > 0) {
    result["type_fields"] = type_fields;
  }

  return result;
}

async function getAllFreshserviceData(context: AppContext, module: string) {
  try {
    let page = 1;
    const perPage = 100;
    let allRecords: any[] = [];
    let hasMore = true;

    while (hasMore) {
      const response = await makeApiCall(context, `${module}?page=${page}&per_page=${perPage}`, "GET");

      if (response.statusCode >= 400) {
        throw new Error(response.data?.message || response?.data?.code || `Unable to retrive the ${module}`);
      }

      const moduleData = response.data[module];
      if (Array.isArray(moduleData) && moduleData.length > 0) {
        allRecords = [...allRecords, ...moduleData];
        page++;
      } else {
        hasMore = false;
      }
    }

    const formattedData = allRecords.map((item) => ({
      label: item.name || item.subject || `#${item.id}`,
      value: String(item.id),
    }));

    return formattedData;
  } catch (error) {
    throw new Error(error?.message || `Unable to retrive the ${module}`);
  }
}
async function getAllCustomObject(context: AppContext, module: string) {
  let page = 1;
  const perPage = 100;
  let allRecords: any[] = [];
  let hasMore = true;

  while (hasMore) {
    const response = await makeApiCall(context, `${module}?page=${page}&per_page=${perPage}`, "GET");

    if (response.statusCode >= 210) {
      break;
    }

    const moduleData = response.data.custom_objects;
    if (Array.isArray(moduleData) && moduleData.length > 0) {
      allRecords = [...allRecords, ...moduleData];
      page++;
    } else {
      hasMore = false;
    }
  }
  ////console.log(allRecords.slice(0, 2));
  const formattedData = allRecords.map((item) => ({
    label: item.title || item.description || `#${item.id}`,
    value: String(item.id),
  }));

  return formattedData;
}
async function getallWorkspaces(context: AppContext) {
  const workspaces = await makeApiCall(context, `workspaces`, "GET");
  if (workspaces.statusCode >= 210) {
    return [];
  }
  const workspacesData =
    workspaces.data.workspaces && workspaces.data.workspaces.length
      ? workspaces.data.workspaces.map((item) => {
          return {
            label: item.name,
            value: String(item.id),
          };
        })
      : [];
  return workspacesData;
}

function getNoteInputschema() {
  return [
    {
      name: "ticket_id",
      label: "Ticket ID",
      type: "number",
      control_type: "number",
      optional: false,
      hint: "The unique ID of the ticket to which the note will be added.",
    },
    {
      name: "body",
      label: "Body",
      type: "string",
      control_type: "text-area",
      optional: false,
      hint: "The content of the note.",
    },
    {
      name: "private",
      label: "Private Note",
      type: "boolean",
      control_type: "select",
      optional: true,
      pick_list: [
        { label: "True", value: "true" },
        { label: "False", value: "false" },
      ],
      hint: "Set to true if the note should only be visible to agents.",
    },
    {
      name: "attachment",
      label: "Attachment URL",
      control_type: "text",
      type: "string",
      optional: true,
      hint: "Attachment URL commo seperated ",
    },
    {
      name: "attachment_name",
      label: "Attachment name",
      type: "string",
      control_type: "text",
      optional: true,
      hint: "Attachment name is mandatory for attachment content",
    },
    { name: "attachment_content", label: "Attachment Content", control_type: "text", type: "string", optional: true },
    {
      name: "incoming",
      label: "Incoming",
      type: "boolean",
      control_type: "select",
      optional: true,
      pick_list: [
        { label: "True", value: "true" },
        { label: "False", value: "false" },
      ],
      hint: "Set to true if the note is from a customer.",
    },
    {
      name: "user_id",
      label: "User ID",
      type: "number",
      control_type: "number",
      optional: true,
      hint: "The ID of the user who created the note (agent or requester).",
    },
    {
      name: "notify_emails",
      label: "Notify Emails",
      type: "array",
      of: "string",
      control_type: "text",
      optional: true,
      hint: "Comma-separated list of email addresses to be notified of this note.",
    },
  ];
}
function getNoteReplyInputschema() {
  return [
    {
      name: "ticket_id",
      label: "Ticket ID",
      type: "number",
      control_type: "number",
      optional: false,
      hint: "The unique ID of the ticket to reply to.",
    },
    {
      name: "body",
      label: "Body",
      type: "string",
      control_type: "text-area",
      optional: false,
      hint: "The content of the reply.",
    },
    {
      name: "from_email",
      label: "From Email",
      type: "string",
      control_type: "text",
      optional: true,
      hint: "Custom 'From' email address for the reply (if configured).",
    },
    {
      name: "user_id",
      label: "User ID",
      type: "number",
      control_type: "text",
      optional: true,
      hint: "The ID of the user (agent) sending the reply.",
    },
    {
      name: "cc_emails",
      label: "CC Emails",
      type: "array",
      of: "string",
      control_type: "text",
      optional: true,
      hint: "Comma-separated list of email addresses to CC.",
    },
    {
      name: "bcc_emails",
      label: "BCC Emails",
      type: "array",
      of: "string",
      control_type: "text",
      optional: true,
      hint: "Comma-separated list of email addresses to BCC.",
    },
    {
      name: "attachment",
      label: "Attachment URL",
      type: "string",
      control_type: "text",
      optional: true,
      hint: "Attachment URL commo seperated ",
    },
    {
      name: "attachment_name",
      label: "Attachment name",
      control_type: "text",
      type: "string",
      optional: true,
      hint: "Attachment name is mandatory for attachment content",
    },
    { name: "attachment_content", label: "Attachment Content", control_type: "text", type: "string", optional: true },
  ];
}

function normalizeChoices(rawChoices: any[]): any[] {
  if (!Array.isArray(rawChoices)) return [];

  return rawChoices.map((choice: any) => {
    const [label, value, children] = choice;

    return {
      label,
      value,
      nested_options: Array.isArray(children) ? normalizeChoices(children) : [],
    };
  });
}
function getChildOptions(choiceList: any[], selectedValue: string) {
  const choice = choiceList.find((c: any) => c.value === selectedValue);
  if (!choice || !choice.nested_options) return [];
  return choice.nested_options.map((opt: any) => ({
    label: opt.value,
    value: opt.value,
  }));
}
function getAssetChildOptions(choiceList: any[], selectedValue: string) {
  const choice = choiceList.find((c: any) => c.value === selectedValue);
  if (!choice || !choice.choices) return [];
  return choice.choices.map((opt: any) => ({
    label: opt.value,
    value: opt.value,
  }));
}
function makeServiceItemDependentResolver(parentIndex: number, depIndex: number) {
  return async (context: AppContext) => {
    const eventData = context.payload.data as any;

    // 🔹 Fetch the service item (instead of ticket_form_fields)
    const serviceItemId = context?.payload?.config_fields?.item_id;
    const Fields = await makeApiCall(context, `service_catalog/items/${serviceItemId}`, "GET");
    if (Fields.data?.error) return [];

    const serviceItem = Fields.data.service_item;
    if (!serviceItem?.custom_fields) return [];

    // 🔹 Only look at nested_field type
    const nestedFields = serviceItem.custom_fields.filter((f: any) => f.field_type === "nested_field");
    // //console.log(nestedFields);
    // 🟢 Find the parent field by key in payload
    const parentKey = Object.keys(eventData).find((k) => k.startsWith(`parent:${parentIndex}:`));
    if (!parentKey) return [];
    const parentName = parentKey.split(":").pop();
    const parentField = nestedFields.find((f: any) => f.name === parentName);
    if (!parentField) return [];

    // Start with nested_field_choices
    let currentChoices = normalizeChoices(parentField.nested_field_choices);
    const parentValue = eventData[parentKey];

    // For direct child
    if (depIndex === 1) {
      return getChildOptions(currentChoices, parentValue);
    }

    // For deeper levels
    let selectedValue = parentValue;
    for (let i = 1; i < depIndex; i++) {
      const childKey = Object.keys(eventData).find((k) => k.startsWith(`parent:${parentIndex}:child:${i}:`));
      if (!childKey) {
        console.warn(`⚠️ Missing child:${i} selection for parent:${parentIndex}`);
        return [];
      }

      const val = eventData[childKey];

      const choice = currentChoices.find((c: any) => c.value === selectedValue);
      if (!choice || !choice.nested_options) return [];

      // go one level deeper
      currentChoices = choice.nested_options;
      selectedValue = val;
    }

    // finally return next level options
    return (
      currentChoices
        .find((c: any) => c.value === selectedValue)
        ?.nested_options?.map((opt: any) => ({
          label: opt.value,
          value: opt.value,
        })) || []
    );
  };
}
function makeAssetsDependentResolver(parentIndex: number, depIndex: number) {
  return async (context: AppContext) => {
    const eventData = context.payload.data as any;

    // 🔹 Fetch the service item (instead of ticket_form_fields)
    const asset_type_id = context?.payload?.config_fields?.asset_type_id;
    const Fields = await makeApiCall(context, `asset_types/${asset_type_id}/fields`, "GET");
    if (Fields.data?.error) return [];

    const serviceItem = Fields.data.asset_type_fields;

    // 🔹 Only look at nested_field type
    // //console.log(serviceItem.length);
    // const nestedFields = serviceItem.flatMap((item) => item.fields).filter((f: any) => f.field_type === "nested_field");
    const nestedFields = serviceItem
      .flatMap((section: any) =>
        section.fields.map((field: any) => ({
          ...field,
          __section: section.field_header, // ✅ track source section
        }))
      )
      .filter((item) => item.field_type === "nested_field");
    //  //console.log(nestedFields.length);
    // 🟢 Find the parent field by key in payload
    const parentKey = Object.keys(eventData).find((k) => k.startsWith(`parent:${parentIndex}:`));
    if (!parentKey) return [];
    const parentName = parentKey.split(":").pop();
    const parentField = nestedFields.find((f: any) => f.name === parentName);
    if (!parentField) return [];

    // Start with nested_field_choices
    let currentChoices = normalizeChoices(parentField.choices);
    const parentValue = eventData[parentKey];

    // For direct child
    if (depIndex === 1) {
      return getChildOptions(currentChoices, parentValue);
    }

    // For deeper levels
    let selectedValue = parentValue;
    for (let i = 1; i < depIndex; i++) {
      const childKey = Object.keys(eventData).find((k) => k.startsWith(`parent:${parentIndex}:child:${i}:`));
      if (!childKey) {
        console.warn(`⚠️ Missing child:${i} selection for parent:${parentIndex}`);
        return [];
      }

      const val = eventData[childKey];

      const choice = currentChoices.find((c: any) => c.value === selectedValue);
      if (!choice || !choice.nested_options) return [];

      // go one level deeper
      currentChoices = choice.nested_options;
      selectedValue = val;
    }

    // finally return next level options
    return (
      currentChoices
        .find((c: any) => c.value === selectedValue)
        ?.nested_options?.map((opt: any) => ({
          label: opt.value,
          value: opt.value,
        })) || []
    );
  };
}

// ✅ Example resolvers
const Requestparent1dependent1 = makeServiceItemDependentResolver(1, 1);
const Requestparent1dependent2 = makeServiceItemDependentResolver(1, 2);
const Requestparent2dependent1 = makeServiceItemDependentResolver(2, 1);
const Requestparent2dependent2 = makeServiceItemDependentResolver(2, 2);
const Requestparent3dependent1 = makeServiceItemDependentResolver(3, 1);
const Requestparent3dependent2 = makeServiceItemDependentResolver(3, 2);
const Requestparent4dependent1 = makeServiceItemDependentResolver(4, 1);
const Requestparent4dependent2 = makeServiceItemDependentResolver(4, 2);
const Requestparent5dependent1 = makeServiceItemDependentResolver(5, 1);
const Requestparent5dependent2 = makeServiceItemDependentResolver(5, 2);
const Requestparent6dependent1 = makeServiceItemDependentResolver(6, 1);
const Requestparent6dependent2 = makeServiceItemDependentResolver(6, 2);

const Assetsparent1dependent1 = makeAssetsDependentResolver(1, 1);
const Assetsparent1dependent2 = makeAssetsDependentResolver(1, 2);
const Assetsparent2dependent1 = makeAssetsDependentResolver(2, 1);
const Assetsparent2dependent2 = makeAssetsDependentResolver(2, 2);
const Assetsparent3dependent1 = makeAssetsDependentResolver(3, 1);
const Assetsparent3dependent2 = makeAssetsDependentResolver(3, 2);
const Assetsparent4dependent1 = makeAssetsDependentResolver(4, 1);
const Assetsparent4dependent2 = makeAssetsDependentResolver(4, 2);
const Assetsparent5dependent1 = makeAssetsDependentResolver(5, 1);
const Assetsparent5dependent2 = makeAssetsDependentResolver(5, 2);
const Assetsparent6dependent1 = makeAssetsDependentResolver(6, 1);
const Assetsparent6dependent2 = makeAssetsDependentResolver(6, 2);

function makeDependentResolver(parentIndex: number, depIndex: number, module?: string) {
  return async (context: AppContext) => {
    const eventData = context.payload.data as any;
    //  //console.log("📩 eventData:", eventData);

    const Fields = await makeApiCall(
      context,
      `${module}_form_fields?workspace_id=${context?.payload?.config_fields?.workspace_id}`,
      "GET"
    );
    if (Fields.data?.error) return [];
    const moduleKey = `${module}_fields`;
    const ticketFields = Fields?.data?.[moduleKey] || Fields?.[moduleKey] || Fields?.data || [];
    // //console.log("problemField", ticketFields);
    const nestedFields = ticketFields
      .filter((f: any) => f.field_type === "nested_field")
      .sort((a, b) => a.position - b.position);

    // 🟢 Find the parent field
    const parentKey = Object.keys(eventData).find((k) => k.startsWith(`parent:${parentIndex}:`));
    if (!parentKey) return [];
    const parentName = parentKey.split(":").pop();
    const parentField = nestedFields.find((f: any) => f.name === parentName);
    if (!parentField) return [];

    //  //console.log(`🎯 parentIndex=${parentIndex}, depIndex=${depIndex}, parentField=${parentField.name}`);

    // 🟡 Start with parent choices
    let currentChoices = parentField.choices;
    const parentValue = eventData[parentKey];

    // For child 1: filter directly from parent
    if (depIndex === 1) {
      return getChildOptions(currentChoices, parentValue);
    }

    // For child 2 or deeper: walk down the chain
    // Example: depIndex=2 → walk through child:1, then return child:2 options
    let selectedValue = parentValue;
    for (let i = 1; i < depIndex; i++) {
      const childKey = Object.keys(eventData).find((k) => k.startsWith(`parent:${parentIndex}:child:${i}:`));
      if (!childKey) {
        console.warn(`⚠️ Missing child:${i} selection for parent:${parentIndex}`);
        return [];
      }

      const val = eventData[childKey];
      //   //console.log(`🔎 Resolving child:${i} (${childKey}) with value=${val}`);

      const choice = currentChoices.find((c: any) => c.value === selectedValue);
      if (!choice || !choice.nested_options) return [];

      // Move deeper
      currentChoices = choice.nested_options;
      selectedValue = val;
    }

    // After walking depIndex-1 times, return options for the next child
    return (
      currentChoices
        .find((c: any) => c.value === selectedValue)
        ?.nested_options?.map((opt: any) => ({
          label: opt.value,
          value: opt.value,
        })) || []
    );
  };
}

const ticketparent1dependent1 = makeDependentResolver(1, 1, "ticket");
const ticketparent1dependent2 = makeDependentResolver(1, 2, "ticket");
const ticketparent2dependent1 = makeDependentResolver(2, 1, "ticket");
const ticketparent2dependent2 = makeDependentResolver(2, 2, "ticket");
const ticketparent3dependent1 = makeDependentResolver(3, 1, "ticket");
const ticketparent3dependent2 = makeDependentResolver(3, 2, "ticket");
const ticketparent4dependent1 = makeDependentResolver(4, 1, "ticket");
const ticketparent4dependent2 = makeDependentResolver(4, 2, "ticket");
const ticketparent5dependent1 = makeDependentResolver(5, 1, "ticket");
const ticketparent5dependent2 = makeDependentResolver(5, 2, "ticket");
const ticketparent6dependent1 = makeDependentResolver(6, 1, "ticket");
const ticketparent6dependent2 = makeDependentResolver(6, 2, "ticket");

const problemparent1dependent1 = makeDependentResolver(1, 1, "problem");
const problemparent1dependent2 = makeDependentResolver(1, 2, "problem");
const problemparent2dependent1 = makeDependentResolver(2, 1, "problem");
const problemparent2dependent2 = makeDependentResolver(2, 2, "problem");
const problemparent3dependent1 = makeDependentResolver(3, 1, "problem");
const problemparent3dependent2 = makeDependentResolver(3, 2, "problem");
const problemparent4dependent1 = makeDependentResolver(4, 1, "problem");
const problemparent4dependent2 = makeDependentResolver(4, 2, "problem");
const problemparent5dependent1 = makeDependentResolver(5, 1, "problem");
const problemparent5dependent2 = makeDependentResolver(5, 2, "problem");
const problemparent6dependent1 = makeDependentResolver(6, 1, "problem");
const problemparent6dependent2 = makeDependentResolver(6, 2, "problem");
// … up to parent6dependent2

// For changes
const changeparent1dependent1 = makeDependentResolver(1, 1, "change");
const changeparent1dependent2 = makeDependentResolver(1, 2, "change");
const changeparent2dependent1 = makeDependentResolver(2, 1, "change");
const changeparent2dependent2 = makeDependentResolver(2, 2, "change");
const changeparent3dependent1 = makeDependentResolver(3, 1, "change");
const changeparent3dependent2 = makeDependentResolver(3, 2, "change");
const changeparent4dependent1 = makeDependentResolver(4, 1, "change");
const changeparent4dependent2 = makeDependentResolver(4, 2, "change");
const changeparent5dependent1 = makeDependentResolver(5, 1, "change");
const changeparent5dependent2 = makeDependentResolver(5, 2, "change");
const changeparent6dependent1 = makeDependentResolver(6, 1, "change");
const changeparent6dependent2 = makeDependentResolver(6, 2, "change");

const releaseparent1dependent1 = makeDependentResolver(1, 1, "release");
const releaseparent1dependent2 = makeDependentResolver(1, 2, "release");
const releaseparent2dependent1 = makeDependentResolver(2, 1, "release");
const releaseparent2dependent2 = makeDependentResolver(2, 2, "release");
const releaseparent3dependent1 = makeDependentResolver(3, 1, "release");
const releaseparent3dependent2 = makeDependentResolver(3, 2, "release");
const releaseparent4dependent1 = makeDependentResolver(4, 1, "release");
const releaseparent4dependent2 = makeDependentResolver(4, 2, "release");
const releaseparent5dependent1 = makeDependentResolver(5, 1, "release");
const releaseparent5dependent2 = makeDependentResolver(5, 2, "release");
const releaseparent6dependent1 = makeDependentResolver(6, 1, "release");
const releaseparent6dependent2 = makeDependentResolver(6, 2, "release");
// … up to parent6dependent2

function makeCustomObjectDependentResolver(parentIndex: number, depIndex: number) {
  return async (context: AppContext) => {
    const eventData = context.payload.data as any;

    // 🔹 Fetch the custom object schema
    const customObjects = await makeApiCall(context, `objects/${context.payload.config_fields.object_id}`, "GET");
    if (!customObjects?.data?.custom_object?.fields) return [];
    // //console.log(customObjects?.data?.custom_object);
    const dropdownObjects = customObjects?.data?.custom_object.fields.filter(
      (obj: any) => obj.type === "dropdown" && obj.fields?.length
    );
    //  //console.log("dropdownObjects", dropdownObjects);
    const targetDropdown = dropdownObjects[parentIndex - 1];
    if (!targetDropdown) return [];

    // ✅ Get top-level choices (Category / Parent)
    let currentChoices = targetDropdown.choices;
    if (!currentChoices?.length) return [];

    // 🔹 Parent key detection
    const parentKey = Object.keys(eventData).find((k) => k.startsWith(`parent:${parentIndex}:`));
    if (!parentKey) return [];
    const parentValue = eventData[parentKey];

    // 🧩 Case 1: Child 1 (Subcategory)
    if (depIndex === 1) {
      const parentOption = currentChoices.find((c: any) => c.value === parentValue);
      if (!parentOption?.nested_options?.length) return [];
      return parentOption.nested_options.map((opt: any) => ({
        label: opt.value,
        value: opt.value,
      }));
    }

    // 🧩 Case 2: Child 2 (Item)
    let selectedValue = parentValue;
    for (let i = 1; i < depIndex; i++) {
      const childKey = Object.keys(eventData).find((k) => k.startsWith(`parent:${parentIndex}:child:${i}:`));
      if (!childKey) return [];

      const childValue = eventData[childKey];
      const parentOption = currentChoices.find((c: any) => c.value === selectedValue);
      if (!parentOption?.nested_options?.length) return [];

      currentChoices = parentOption.nested_options;
      selectedValue = childValue;
    }

    const finalOption = currentChoices.find((c: any) => c.value === selectedValue);
    return (
      finalOption?.nested_options?.map((opt: any) => ({
        label: opt.value,
        value: opt.value,
      })) || []
    );
  };
}
// For tickset_source
const customparent1dependent1 = makeCustomObjectDependentResolver(1, 1); // Subcategory
const customparent1dependent2 = makeCustomObjectDependentResolver(1, 2); // Item

// For test_dependent
const customparent2dependent1 = makeCustomObjectDependentResolver(2, 1);
const customparent2dependent2 = makeCustomObjectDependentResolver(2, 2);
const customparent3dependent1 = makeCustomObjectDependentResolver(3, 1);
const customparent3dependent2 = makeCustomObjectDependentResolver(3, 2);
const customparent4dependent1 = makeCustomObjectDependentResolver(4, 1);
const customparent4dependent2 = makeCustomObjectDependentResolver(4, 2);
const customparent5dependent1 = makeCustomObjectDependentResolver(5, 1);
const customparent5dependent2 = makeCustomObjectDependentResolver(5, 2);
const customparent6dependent1 = makeCustomObjectDependentResolver(6, 1);
const customparent6dependent2 = makeCustomObjectDependentResolver(6, 2);

export async function buildNotePayload(context: any, reply?: boolean) {
  const { ticket_id, ...eventData } = context.payload.data as any;
  const inputSchema = reply ? getNoteReplyInputschema() : getNoteInputschema();
  let payload: any = generatePayload(inputSchema, eventData);
  const finalPayload = await Assignattchments(context, payload);
  if (finalPayload?.statusCode > 210) {
    return {
      statusCode: finalPayload.statusCode,
      data: {
        error: finalPayload,
      },
    };
  }
  return finalPayload;
}
function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}
function appendFormData(form: FormData, keyPrefix: string, value: any) {
  if (value === null || value === undefined) return;

  if (Array.isArray(value)) {
    // Handle arrays: append each with []
    value.forEach((v) => {
      appendFormData(form, `${keyPrefix}[]`, v);
    });
  } else if (typeof value === "object" && !(value instanceof File) && !(value instanceof Blob)) {
    // Handle nested objects
    for (const [subKey, subVal] of Object.entries(value)) {
      appendFormData(form, `${keyPrefix}[${subKey}]`, subVal);
    }
  } else {
    // Handle primitive values
    form.append(keyPrefix, String(value));
  }
}

async function Assignattchments(context: any, eventData: any) {
  let payload: any = {
    ...eventData,
  };
  if (payload?.attachment || (payload.attachment_content && payload.attachment_name)) {
    const form = new FormData();

    // Append everything dynamically
    for (const [key, value] of Object.entries(payload) as [string, any][]) {
      if (["attachment", "attachment_content", "attachment_name"].includes(key)) continue;
      appendFormData(form, key, value);
    }

    // ✅ Handle URL-based attachments
    if (eventData.attachment) {
      const urls =
        typeof eventData.attachment === "string"
          ? eventData.attachment.split(",").map((u: string) => u.trim())
          : eventData.attachment;

      for (const url of urls) {
        if (!isValidUrl(url)) {
          return {
            statusCode: 400,
            data: {
              error: "Give valid attachment URL to upload attachmnet",
            },
          };
        }
        const cleanUrl = url.split("?")[0];
        const fileName = cleanUrl.substring(cleanUrl.lastIndexOf("/") + 1);
        const response = await fetch(url);
        if (!response.ok) {
          const errorText = await response.text();
          return {
            statusCode: response.status,
            data: {
              error: errorText,
            },
          };
        }

        const blob = await response.blob();
        form.append("attachments[]", blob, fileName);
      }
    }

    // ✅ Handle Base64 attachments
    if (eventData.attachment_content && eventData.attachment_name) {
      const byteCharacters = atob(eventData.attachment_content);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);

      const mimeType = getMimeTypeFromBase64(eventData.attachment_content);
      const blob = new Blob([byteArray], { type: mimeType });

      form.append("attachments[]", blob, eventData.attachment_name);
    }

    payload = form;
  }

  return payload;
}

function removeEmpty(obj: any): any {
  Object.keys(obj).forEach((key) => {
    if (typeof obj[key] === "object" && obj[key] !== null) {
      if (Array.isArray(obj[key])) {
        if (obj[key].length === 0) {
          delete obj[key];
        } else {
          obj[key] = obj[key].filter((item: any) => {
            if (typeof item === "object" && item !== null) {
              removeEmpty(item);
              return Object.keys(item).length > 0;
            } else {
              return item !== "";
            }
          });
          if (obj[key].length === 0) {
            delete obj[key];
          }
        }
      } else {
        removeEmpty(obj[key]);
        if (Object.keys(obj[key]).length === 0) {
          delete obj[key];
        }
      }
    } else if (obj[key] === "" || obj[key] === null || obj[key] === undefined) {
      delete obj[key];
    }
  });
  return obj;
}
async function buildProblemInputSchema(context: AppContext, mode: "create" | "update"): Promise<Field[]> {
  const workspaceId = context.payload.config_fields?.workspace_id;
  if (!workspaceId) {
    throw new Error("Workspace ID is required to build the problem input schema.");
  }
  const isUpdate = mode === "update";

  // Fetch workspace-related metadata
  const [groupRes, deptRes, agentRes, fieldsRes] = await Promise.all([
    makeApiCall(context, `groups?workspace_id=${workspaceId}`, "GET"),
    makeApiCall(context, "departments", "GET"),
    makeApiCall(context, "agents", "GET"),
    makeApiCall(context, `problem_form_fields?workspace_id=${workspaceId}`, "GET"),
  ]);

  const groupDropdown = groupRes.data?.groups?.map((g: any) => ({ label: g.name, value: String(g.id) })) || [];
  groupDropdown.unshift({ label: "None", value: "None" });
  const departmentDropdown = deptRes.data?.departments?.map((d: any) => ({ label: d.name, value: String(d.id) })) || [];
  if (fieldsRes.statusCode >= 400 || !fieldsRes.data?.problem_fields) {
    throw new Error("Could not fetch problem fields for the selected workspace.");
  }

  const problemFieldsApi = fieldsRes.data.problem_fields;

  const defaultFields: Field[] = [
    {
      name: "email",
      label: "Requester Email",
      type: "string",
      control_type: "text",
      hint: "Enter Email",
      optional: false,
    },
  ];
  const customFields: Field[] = [];
  let categoryChoices: PickListValue[] = [];

  // Nested fields
  const nested_fields = problemFieldsApi
    .filter((item) => item.field_type === "nested_field")
    .sort((a, b) => a.position - b.position);

  const normalfields = problemFieldsApi
    .filter((item) => item.field_type !== "nested_field")
    .sort((a, b) => a.position - b.position);

  const parsedNestedFields = transformNestedFields(nested_fields, "problem");

  // Mode-specific required field

  // Mapping for default fields
  const fieldPropName: Record<string, string> = {
    group: "group_id",
    department: "department_id",
    agent: "agent_id",
  };

  // Map dropdowns by their final names
  const dropdownMap: Record<string, PickListValue[]> = {
    group_id: groupDropdown,
    department_id: departmentDropdown,
  };

  // Process fields
  for (const field of normalfields) {
    if (["requester", "agent", "group", "workspace_id"].includes(field.name)) continue;

    // Handle category separately
    if (field.name === "category" && Array.isArray(field.choices)) {
      categoryChoices = field.choices.map((c: any) => ({ label: c.value, value: c.value }));
      continue;
    }
    const fieldName = field.default_field ? fieldPropName[field.name] || field.name : field.name;
    const custom = !field.default_field;
    // Build picklist
    let pick_lists: any[] = [];
    if (Array.isArray(field.choices)) {
      pick_lists = field.choices.map((c: any) => ({
        label: c.value,
        value: field.default_field ? String(c.id) : c.value,
      }));
    } else if (typeof field.choices === "object") {
      pick_lists = Object.entries(field.choices).map(([key, value]) => ({
        label: String(value),
        value: String(key),
      }));
    }

    // --- Override with workspace dropdowns if applicable ---
    if (dropdownMap[fieldName]) {
      pick_lists = dropdownMap[fieldName];
    }

    const baseField: Field = {
      name: fieldName,
      label: field.label,
      optional: isUpdate ? true : !field.required_for_agents,
      type: mapType(field.field_type) || "string",
      hint: field.description,
      control_type:
        field.field_type === "custom_multi_select_dropdown"
          ? "multiselect"
          : pick_lists.length > 0
            ? "select"
            : mapControlType(field.field_type),
      pick_list: pick_lists.length ? pick_lists : undefined,
      custom,
    };

    // Boolean fallback picklist
    if (baseField.type === "boolean" && !baseField.pick_list) {
      baseField.pick_list = [
        { label: "True", value: "true" },
        { label: "False", value: "false" },
      ];
      baseField.control_type = "select";
    }

    if (field.field_type === "custom_file") continue; // skip files

    if (field.default_field) {
      defaultFields.push(baseField);
    } else {
      customFields.push(baseField);
    }
  }

  // Standard fields
  const categoryRelatedFields: any = [
    {
      label: "Group",
      optional: true,
      type: "string",
      control_type: "select",
      pick_list: groupDropdown,
      name: "group_id",
      hint: "ID of the group to whom the problem has been assigned.",
    },
    {
      label: "Agent ID",
      optional: true,
      function: "getAgentByGroupId",
      dependentTo: ["group_id"],
      type: "number",
      control_type: "select",
      name: "agent_id",
      hint: "ID of the agent to whom the ticket has been assigned.",
    },
    {
      name: "pc_description",
      label: "Problem Cause Description",
      type: "string",
      control_type: "text-area",
      optional: true,
      hint: "Enter Problem Cause Description",
    },
    {
      name: "ps_description",
      label: "Problem Symptom Description",
      type: "string",
      control_type: "text-area",
      optional: true,
      hint: "Enter Problem Symptom Description",
    },
    {
      name: "pi_description",
      label: "Problem Impact Description",
      type: "string",
      control_type: "text-area",
      optional: true,
      hint: "Enter Impact Description",
    },
    {
      name: "attachment",
      label: "Attachment URL",
      type: "string",
      optional: true,
      control_type: "text",
      hint: "Attachment URL commo seperated ",
    },
    {
      name: "attachment_name",
      label: "Attachment name",
      type: "string",
      control_type: "text",
      optional: true,
      hint: "Attachment name is mandatory for attachment content",
    },
    { name: "attachment_content", label: "Attachment Content", control_type: "text", type: "string", optional: true },
    {
      name: "category",
      label: "Category",
      type: "string",
      control_type: "select",
      optional: true,
      pick_list: categoryChoices,
      hint: "Enter category",
    },
    {
      name: "sub_category",
      label: "Sub-Category",
      type: "string",
      control_type: "select",
      optional: true,
      function: "getLevelTwoTicketsValues",
      hint: "Enter Sub category",
      dependentTo: ["category"],
    },
    {
      name: "item_category",
      label: "Item Category",
      type: "string",
      hint: "Enter Item category",
      control_type: "select",
      optional: true,
      function: "getLevel3TicketsValues",
      dependentTo: ["category", "sub_category"],
    },
  ];
  let allFields = [...defaultFields, ...customFields, ...categoryRelatedFields, ...parsedNestedFields];
  const numberFields = ["workspace_id", "agent_id", "priority", "status", "impact", "department_id"];
  const mandatoryFields = ["status", "subject", "priority", "impact", "description"];
  allFields = allFields.map((field) => ({
    ...field,
    type: numberFields.includes(field.name) ? "number" : field.type,
    optional:
      mode === "update"
        ? true // update → always optional
        : mandatoryFields.includes(field.name)
          ? false // enforce mandatory
          : field.optional, // fallback to original
  }));
  if (isUpdate) {
    allFields.push({ name: "problem_id", label: "Problem ID", control_type: "text", type: "number", optional: false });
  }

  return allFields;
}

async function buildChangeInputSchema(context: AppContext, mode: "create" | "update"): Promise<Field[]> {
  const workspaceId = context.payload.config_fields?.workspace_id;
  if (!workspaceId) {
    throw new Error("Workspace ID is required to build the change input schema.");
  }

  const isUpdate = mode === "update";

  // Fetch workspace-related metadata in parallel
  const [groupRes, deptRes, assetRes, fieldsRes] = await Promise.all([
    makeApiCall(context, `groups?workspace_id=${workspaceId}`, "GET"),
    makeApiCall(context, "departments", "GET"),
    makeApiCall(context, `assets?workspace_id=${workspaceId}`, "GET"),
    makeApiCall(context, `change_form_fields?workspace_id=${workspaceId}`, "GET"),
  ]);

  // Create dropdowns
  const groupDropdown = groupRes.data?.groups?.map((g: any) => ({ label: g.name, value: String(g.id) })) || [];
  groupDropdown.unshift({ label: "None", value: "None" });
  const departmentDropdown = deptRes.data?.departments?.map((d: any) => ({ label: d.name, value: String(d.id) })) || [];
  const assetsDropdown =
    assetRes.data?.assets?.map((asset: any) => ({ label: asset.name, value: String(asset.display_id) })) || [];

  // Validate Change Fields API response
  if (fieldsRes.statusCode >= 400 || !fieldsRes.data?.change_fields) {
    throw new Error("Could not fetch change fields for the selected workspace.");
  }
  const changeFieldsApi = fieldsRes.data.change_fields;

  const defaultFields: Field[] = [];
  const customFields: Field[] = [];
  let categoryChoices: PickListValue[] = [];

  // --- Add Mode-Specific Required Fields ---
  if (mode === "create") {
    defaultFields.push({
      name: "email",
      label: "Requester Email",
      control_type: "text",
      type: "string",
      hint: "Enter Email",
      optional: false,
    });
  }
  // change_id added later for update

  // --- Separate Nested and Normal Fields ---
  const nestedApiFields = changeFieldsApi
    .filter((item: any) => item.field_type === "nested_field")
    .sort((a: any, b: any) => a.position - b.position);

  const normalApiFields = changeFieldsApi
    .filter((item: any) => item.field_type !== "nested_field")
    .sort((a: any, b: any) => a.position - b.position);

  // --- Transform Nested Fields ---
  const parsedNestedFields = transformNestedFields(nestedApiFields, "change"); // Assuming this handles naming

  // --- Mappings ---
  // **Include ALL specified default field name mappings**
  const nameMapping: Record<string, string> = {
    product: "product_id",
    group: "group_id",
    company: "company_id", // Assuming company maps if needed
    department: "department_id",
    ticket_type: "type", // Assuming change might have a 'type'
    agent: "agent_id",
    change_window: "maintenance_window",
    // Add other change-specific mappings if they exist
  };

  // Map dropdowns by their final DSL field names
  const dropdownMap: Record<string, PickListValue[]> = {
    group_id: groupDropdown,
    department_id: departmentDropdown,
    // agent_id uses dependent function
  };

  // --- Process Normal Fields ---
  for (const field of normalApiFields) {
    if (["requester", "agent", "group", "workspace_id", "assets"].includes(field.name)) continue;

    if (field.name === "category" && Array.isArray(field.choices)) {
      categoryChoices = field.choices.map((c: any) => ({ label: c.value, value: c.value }));
      continue;
    }

    const isCustom = !field.default_field;
    // Use mapped name for default, original name otherwise
    const fieldName = field.default_field ? nameMapping[field.name] || field.name : field.name;

    // Build picklist
    let pick_lists: PickListValue[] = [];
    if (Array.isArray(field.choices)) {
      pick_lists = field.choices.map((c: any) => ({
        label: c.value,
        value: field.default_field ? String(c.id) : c.value,
      }));
    } else if (typeof field.choices === "object" && field.choices !== null) {
      pick_lists = Object.entries(field.choices).map(([key, value]) => ({ label: String(value), value: String(key) }));
    }

    // Override with pre-fetched workspace dropdowns
    if (dropdownMap[fieldName]) {
      pick_lists = dropdownMap[fieldName];
    }

    const baseField: Field = {
      // *** Use original or mapped name WITHOUT prefix ***
      name: fieldName,
      label: field.label,
      optional: isUpdate ? true : !field.required_for_agents, // Adjusted optional logic
      type: mapType(field.field_type) || "string",
      hint: field.description || `Enter ${field.label}`,
      control_type: pick_lists.length > 0 ? "select" : mapControlType(field.field_type) || "text",
      pick_list: pick_lists.length > 0 ? pick_lists : undefined,
      custom: isCustom,
    };

    // Boolean fallback
    if (baseField.type === "boolean" && !baseField.pick_list) {
      baseField.pick_list = [
        { label: "True", value: "true" },
        { label: "False", value: "false" },
      ];
      baseField.control_type = "select";
    }

    // Text area control type
    const multiLineFields = ["reason_for_change", "impact_plan", "rollout_plan", "backout_plan", "description"];
    if (multiLineFields.includes(fieldName)) {
      baseField.control_type = "text-area";
    }

    if (field.field_type === "custom_file") continue;

    // Add to correct array based on 'custom' flag
    if (isCustom) {
      customFields.push(baseField);
    } else {
      defaultFields.push(baseField);
    }
  }
  const standardFields: any = [
    {
      label: "Group",
      optional: true,
      type: "string",
      control_type: "select",
      pick_list: groupDropdown,
      name: "group_id",
      hint: "Group assigned to the change.",
    },
    {
      label: "Agent",
      optional: true,
      function: "getAgentByGroupId",
      dependentTo: ["group_id"],
      type: "number",
      control_type: "select",
      name: "agent_id",
      hint: "Agent assigned to the change.",
    },
    {
      name: "assets",
      label: "Assets",
      type: "array",
      control_type: "multiselect",
      optional: true,
      of: "number",
      pick_list: assetsDropdown,
      hint: "Select associated assets (use Asset Display IDs).",
    },
    {
      name: "attachment",
      label: "Attachment URL",
      control_type: "text",
      type: "string",
      optional: true,
      hint: "Attachment URL comma separated",
    },
    {
      name: "attachment_name",
      label: "Attachment name",
      control_type: "text",
      type: "string",
      optional: true,
      hint: "Attachment name is mandatory for attachment content",
    },
    { name: "attachment_content", label: "Attachment Content", control_type: "text", type: "string", optional: true },
    {
      name: "category",
      label: "Category",
      type: "string",
      control_type: "select",
      optional: true,
      pick_list: categoryChoices,
      hint: "Select category",
    },
    {
      name: "sub_category",
      label: "Sub-Category",
      type: "string",
      control_type: "select",
      optional: true,
      function: "getLevelTwoTicketsValues",
      hint: "Select sub-category",
      dependentTo: ["category"],
    },
    {
      name: "item_category",
      label: "Item",
      type: "string",
      hint: "Select item",
      control_type: "select",
      optional: true,
      function: "getLevel3TicketsValues",
      dependentTo: ["category", "sub_category"],
    },
    {
      name: "planned_start_date",
      label: "Planned Start Date",
      type: "date_time",
      control_type: "datetime",
      optional: true,
    },
    {
      name: "planned_end_date",
      label: "Planned End Date",
      type: "date_time",
      control_type: "datetime",
      optional: true,
    },
  ];

  // Combine all fields
  let allFields = [...defaultFields, ...customFields, ...standardFields, ...parsedNestedFields];

  const numberFields = [
    "workspace_id",
    "agent_id",
    "priority",
    "status",
    "location_id",
    "impact",
    "department_id",
    "maintenance_window",
    "risk",
    "change_type",
    "approval_status",
    "product_id",
    "company_id",
  ];
  // Define mandatory fields for CHANGE CREATE
  const mandatoryFieldsCreate = [
    "status",
    "planned_start_date",
    "planned_end_date",
    "subject",
    "priority",
    "impact",
    "description",
    "change_type",
  ]; // Confirm these

  allFields = allFields.map((field) => {
    // Correct type for number fields
    if (numberFields.includes(field.name)) {
      field.type = "number";
      // Set control_type only if not a dropdown/select already
      if (field.control_type !== "select" && field.control_type !== "multiselect") {
        field.control_type = "number";
      }
    }
    // Adjust optionality
    field.optional = isUpdate ? true : mandatoryFieldsCreate.includes(field.name) ? false : field.optional;
    return field;
  });

  // Add/Update ID field for update mode
  if (isUpdate) {
    allFields.unshift({
      name: "change_id",
      label: "Change ID",
      control_type: "text",
      type: "number",
      optional: false,
      hint: "Enter the change id to update the data",
    });
  }

  // --- Deduplicate using JavaScript Map ---
  const uniqueFieldsMap = new Map<string, Field>();
  allFields.forEach((field) => {
    if (!uniqueFieldsMap.has(field.name)) {
      uniqueFieldsMap.set(field.name, field);
    }
  });
  const uniqueFields = Array.from(uniqueFieldsMap.values());
  // -----------------------------------------

  return uniqueFields;
}
function normalizePlanningFields(eventData: Record<string, any>) {
  const planning_fieldsMapping: Record<string, string> = {
    change_reason: "reason_for_change",
    change_impact: "change_impact",
    change_plan: "rollout_plan",
    backout_plan: "backout_plan",
  };

  const normalizedPayload = { ...eventData };

  // check if any mapped field exists in payload
  const hasPlanningFields = Object.keys(planning_fieldsMapping).some((key) => eventData[key]);

  if (hasPlanningFields) {
    normalizedPayload.planning_fields = {};

    Object.entries(planning_fieldsMapping).forEach(([flatKey, nestedKey]) => {
      if (eventData[flatKey]) {
        normalizedPayload.planning_fields[nestedKey] = normalizedPayload.planning_fields[nestedKey] || {};
        normalizedPayload.planning_fields[nestedKey].description = eventData[flatKey];
        delete normalizedPayload[flatKey];
      }
    });
  }

  return normalizedPayload;
}
function getTaskModulePicklist(): PickListValue[] {
  return [
    { label: "Tickets", value: "tickets" },
    { label: "Problems", value: "problems" },
    { label: "Changes", value: "changes" },
    { label: "Releases", value: "releases" },
  ];
}

async function buildTaskInputSchema(context: AppContext, mode: "create" | "update"): Promise<Field[]> {
  const isUpdate = mode === "update";
  const requiredFieldsCreate = ["workspace_id", "title"]; // Fields required only for create
  // Fetch workspace-specific groups if needed for dropdowns
  const actualModule = {
    tickets: "ticket",
    problems: "problem",
    changes: "change",
    releases: "release",
  };
  const workspaceId = context.payload.config_fields?.workspace_id; // Get workspace ID if available
  const fields = await makeApiCall(
    context,
    `${actualModule[context.payload.config_fields.module as string]}_task_fields`,
    "GET"
  );
  if (fields.statusCode > 210) {
    return fields;
  }
  // //console.log(fields);
  let groupDropdown: PickListValue[] = [];
  if (workspaceId) {
    const groupRes = await makeApiCall(context, `groups?workspace_id=${workspaceId}`, "GET");
    //    //console.log(groupRes);
    groupDropdown = groupRes.data?.groups?.map((g: any) => ({ label: g.name, value: String(g.id) })) || [];
    groupDropdown.unshift({ label: "None", value: "None" });
  }
  const schemaFields = fields.data?.[`${actualModule[context.payload.config_fields.module as string]}_task_fields`]
    .map((f: any) => {
      // Skip agent_id and group_id
      if (["owner_id", "group_id", "workspace_id"].includes(f.name)) return null;
      const numberFields = ["status", "notify_before"];
      const field: Field = {
        name: f.name,
        label: f.label,
        type: numberFields.includes(f.name) ? "number" : mapType(f.field_type),
        control_type: mapControlType(f.field_type),
        optional: !f.mandatory,
        hint: `Enter ${f.label}`, // adjust if needed
      };

      // Handle dropdowns with choices
      if (Array.isArray(f.choices) && f.choices.length > 0) {
        field.pick_list = f.choices.map((c: any) => ({
          label: c.value,
          value: c.id,
        }));
      }

      // Mark as custom if not a default field
      if (!f.is_default_field) {
        field.custom = true;
      }

      return field;
    })
    // filter out skipped fields
    .filter((f: any) => f !== null);
  // Define the base fields for a task
  const baseFields: Field[] = [
    ...schemaFields,
    {
      name: "group_id",
      label: "Group",
      type: "string",
      control_type: "select",
      optional: true,
      pick_list: groupDropdown,
      hint: "Group assigned to the task",
    },
    {
      name: "agent_id",
      label: "Agent",
      type: "number",
      control_type: "select",
      optional: true,
      function: "getAgentByGroupId",
      dependentTo: ["group_id"],
      hint: "Agent assigned to the task",
    },
  ];

  // Adjust optionality for create mode
  if (!isUpdate) {
    baseFields.forEach((field) => {
      if (requiredFieldsCreate.includes(field.name)) {
        field.optional = false;
      }
    });
  }

  // Add task_id field for update mode
  if (isUpdate) {
    return [
      {
        name: "task_id",
        label: "Task ID",
        type: "number",
        control_type: "number",
        optional: false,
        hint: "The ID of the task to update.",
      },
      ...baseFields,
    ];
  }

  return baseFields;
}
async function buildTimeSheetInputSchema(context: AppContext, mode: "create" | "update"): Promise<Field[]> {
  const isUpdate = mode === "update";
  const requiredFieldsCreate = ["user_id", "executed_at"]; // fields required during create
  // Fetch time_sheet_fields dynamically
  const numberFields = ["agent_id", "task_id"];
  const module = context.payload.config_fields.module as string;
  const actualModule = {
    tickets: "Ticket ID",
    problems: "Problem ID",
    changes: "Change ID",
    releases: "Celease ID",
  };
  const response = await makeApiCall(context, "time_sheet_fields", "GET");
  const allAgents = await getAllAgents(context);
  const nameMapping: Record<string, string> = {
    user_id: "agent_id",
  };
  //  //console.log(allAgents.length);
  if (response.statusCode > 210 || !response.data?.time_sheet_fields) {
    return [];
  }

  const timeSheetFields = response.data.time_sheet_fields;

  // Map API field schema into Konnectify Field objects
  const schemaFields: Field[] = timeSheetFields.map((f: any) => {
    const fieldName = f.is_default_field ? nameMapping[f.name] || f.name : f.name;
    const field: Field = {
      name: fieldName,
      label: f.label,
      type: mapType(f.field_type),
      control_type: mapControlType(f.field_type),
      optional: !f.mandatory,
      hint: `Enter ${f.label}`,
      ...(f.is_default_field ? {} : { custom: true }),
    };

    // Handle dropdown fields with choices
    if (Array.isArray(f.choices) && f.choices.length > 0) {
      field.pick_list = f.choices.map((c: any) => ({
        label: c.value,
        value: c.id,
      }));
    }

    // Handle boolean checkbox fields
    if (f.field_type === "custom_checkbox") {
      field.type = "boolean";
      field.control_type = "select";
      field.pick_list = [
        { label: "True", value: "true" },
        { label: "False", value: "false" },
      ];
    }
    if (!f.is_default_field) {
      field.custom = true;
    }

    if (numberFields.includes(field.name)) {
      field.type = "number";
      field.control_type = "text";
    }
    if (field.name === "agent_id") {
      field.control_type = "select";
      field.pick_list = allAgents;
    }
    if (requiredFieldsCreate.includes(field.name)) {
      field.optional = false;
    }
    return field;
  });

  // Append additional common fields if needed

  // For create mode — enforce required fields
  schemaFields.unshift({
    name: "module_id",
    label: `${actualModule[module]}`,
    type: "number",
    control_type: "number",
    optional: false,
    hint: "The ID of the time entry to update.",
  });
  // For update mode — all fields required except time_entry_id
  if (isUpdate) {
    return [
      {
        name: "time_entry_id",
        label: "Time Entry ID",
        type: "number",
        control_type: "number",
        optional: false,
        hint: "The ID of the time entry to update.",
      },
      ...schemaFields.map((f) => ({ ...f, optional: f.name === "module_id" ? false : true })),
    ];
  }

  return schemaFields;
}

function getFindDeleteTaskInputSchema(context: AppContext): Field[] {
  const module = (context.payload.config_fields?.module as string) || "tickets"; // Default or from config

  const moduleLabels: Record<string, string> = {
    tickets: "Ticket ID",
    problems: "Problem ID",
    changes: "Change ID",
    releases: "Release ID",
  };

  return [
    {
      name: "module_id",
      label: moduleLabels[module] || "Parent Item ID", // Dynamic label based on module
      type: "number",
      control_type: "number",
      optional: false,
      hint: `Enter the ID of the ${module.slice(0, -1)} this task belongs to.`, // Dynamic hint
    },
    {
      name: "task_id",
      label: "Task ID",
      type: "number",
      control_type: "number",
      optional: false,
      hint: "Enter the unique ID of the task.",
    },
  ];
}

async function buildReleaseInputSchema(context: AppContext, mode: "create" | "update"): Promise<Field[]> {
  const workspaceId = context.payload.config_fields?.workspace_id;
  if (!workspaceId) {
    throw new Error("Workspace ID is required to build the release input schema.");
  }

  const isUpdate = mode === "update";

  // Fetch workspace-related metadata in parallel
  // NOTE: Assets are removed as they were not in the 'problem' base schema you liked.
  // Add assets back if releases require them.
  const [groupRes, deptRes, assetRes, fieldsRes] = await Promise.all([
    makeApiCall(context, `groups?workspace_id=${workspaceId}`, "GET"),
    makeApiCall(context, "departments", "GET"),
    makeApiCall(context, `assets?workspace_id=${workspaceId}`, "GET"),
    makeApiCall(context, `release_form_fields?workspace_id=${workspaceId}`, "GET"), // Target release_form_fields
  ]);

  // Create dropdowns
  const groupDropdown = groupRes.data?.groups?.map((g: any) => ({ label: g.name, value: String(g.id) })) || [];
  groupDropdown.unshift({ label: "None", value: "None" });
  const departmentDropdown = deptRes.data?.departments?.map((d: any) => ({ label: d.name, value: String(d.id) })) || [];
  const assetsDropdown =
    assetRes.data?.assets?.map((asset: any) => ({ label: asset.name, value: String(asset.display_id) })) || [];

  // Validate Release Fields API response
  if (fieldsRes.statusCode >= 400 || !fieldsRes.data?.release_fields) {
    // Check for release_fields
    throw new Error("Could not fetch release fields for the selected workspace.");
  }
  const releaseFieldsApi = fieldsRes.data.release_fields; // Use release_fields

  const defaultFields: Field[] = [];
  const customFields: Field[] = [];
  let categoryChoices: PickListValue[] = [];
  const nestedApiFields = releaseFieldsApi
    .filter((item: any) => item.field_type === "nested_field")
    .sort((a: any, b: any) => a.position - b.position);

  const normalApiFields = releaseFieldsApi
    .filter((item: any) => item.field_type !== "nested_field")
    .sort((a: any, b: any) => a.position - b.position);

  // --- Transform Nested Fields ---
  const parsedNestedFields = transformNestedFields(nestedApiFields, "release"); // Reuse helper

  // --- Mappings ---
  const nameMapping: Record<string, string> = {
    product: "product_id",
    group: "group_id",
    company: "company_id",
    department: "department_id",
    agent: "agent_id",
  };

  const dropdownMap: Record<string, PickListValue[]> = {
    group_id: groupDropdown,
    department_id: departmentDropdown,
  };

  // --- Process Normal Fields ---
  for (const field of normalApiFields) {
    if (["requester", "agent", "group", "planned_end_date", "planned_start_date", "workspace_id"].includes(field.name))
      continue;

    if (field.name === "category" && Array.isArray(field.choices)) {
      categoryChoices = field.choices.map((c: any) => ({ label: c.value, value: c.value }));
      continue;
    }

    const isCustom = !field.default_field;
    const fieldName = field.default_field ? nameMapping[field.name] || field.name : field.name;

    let pick_lists: PickListValue[] = [];
    if (Array.isArray(field.choices)) {
      pick_lists = field.choices.map((c: any) => ({
        label: c.value,
        value: field.default_field ? String(c.id) : c.value,
      }));
    } else if (typeof field.choices === "object" && field.choices !== null) {
      pick_lists = Object.entries(field.choices).map(([key, value]) => ({ label: String(value), value: String(key) }));
    }

    if (dropdownMap[fieldName]) {
      pick_lists = dropdownMap[fieldName];
    }

    const baseField: Field = {
      name: fieldName,
      label: field.label,
      optional: isUpdate ? true : !field.required_for_agents,
      type: mapType(field.field_type) || "string",
      hint: field.description || `Enter ${field.label}`,
      control_type: pick_lists.length > 0 ? "select" : mapControlType(field.field_type) || "text",
      pick_list: pick_lists.length > 0 ? pick_lists : undefined,
      custom: isCustom,
    };

    if (baseField.type === "boolean" && !baseField.pick_list) {
      baseField.pick_list = [
        { label: "True", value: "true" },
        { label: "False", value: "false" },
      ];
      baseField.control_type = "select";
    }

    // Add text-area for release-specific fields if needed
    const multiLineFields = ["description", "release_notes"]; // Example for releases
    if (multiLineFields.includes(fieldName)) {
      baseField.control_type = "text-area";
    }
    if (field.field_type === "custom_file") continue;
    if (isCustom) {
      customFields.push(baseField);
    } else {
      defaultFields.push(baseField);
    }
  }

  // --- Standard Fields ---
  const standardFields: any = [
    {
      label: "Group",
      optional: true,
      type: "string",
      control_type: "select",
      pick_list: groupDropdown,
      name: "group_id",
      hint: "Group assigned to the release.",
    },
    {
      label: "Agent",
      optional: true,
      function: "getAgentByGroupId",
      dependentTo: ["group_id"],
      type: "number",
      control_type: "select",
      name: "agent_id",
      hint: "Agent assigned to the release.",
    },
    {
      name: "attachment",
      label: "Attachment URL",
      type: "string",
      control_type: "text",
      optional: true,
      hint: "Attachment URL comma separated",
    },
    {
      name: "attachment_name",
      label: "Attachment name",
      control_type: "text",
      type: "string",
      optional: true,
      hint: "Attachment name is mandatory for attachment content",
    },
    { name: "attachment_content", label: "Attachment Content", control_type: "text", type: "string", optional: true },
    {
      name: "category",
      label: "Category",
      type: "string",
      control_type: "select",
      optional: true,
      pick_list: categoryChoices,
      hint: "Select category",
    },
    {
      name: "sub_category",
      label: "Sub-Category",
      type: "string",
      control_type: "select",
      optional: true,
      function: "getLevelTwoTicketsValues",
      hint: "Select sub-category",
      dependentTo: ["category"],
    },
    {
      name: "item_category",
      label: "Item",
      type: "string",
      hint: "Select item",
      control_type: "select",
      optional: true,
      function: "getLevel3TicketsValues",
      dependentTo: ["category", "sub_category"],
    },
    {
      name: "planned_start_date",
      label: "Planned Start Date",
      type: "string",
      control_type: "datetime",
      optional: true,
    },
    {
      name: "planned_end_date",
      label: "Planned End Date",
      type: "string",
      control_type: "datetime",
      optional: true,
    },
    {
      name: "assets",
      label: "Assets",
      optional: true,
      pick_list: assetsDropdown,
      type: "array",
      control_type: "multiselect",
      of: "number",
    },
  ];

  let allFields = [...defaultFields, ...customFields, ...standardFields, ...parsedNestedFields];

  // --- Final Adjustments ---
  // Update numberFields and mandatoryFields for RELEASES
  const numberFields = ["workspace_id", "agent_id", "priority", "status", "department_id", "release_type"];
  const mandatoryFieldsCreate = [
    "status",
    "subject",
    "priority",
    "planned_start_date",
    "planned_end_date",
    "description",
    "release_type",
  ];

  allFields = allFields.map((field) => {
    if (numberFields.includes(field.name)) {
      field.type = "number";
    }

    field.optional = isUpdate ? true : mandatoryFieldsCreate.includes(field.name) ? false : field.optional;
    return field;
  });

  if (isUpdate) {
    // Check for release_id
    const idFieldIndex = allFields.findIndex((f) => f.name === "release_id");
    if (idFieldIndex > -1) {
      allFields[idFieldIndex].optional = false;
      allFields[idFieldIndex].type = "number";
    } else {
      allFields.push({
        name: "release_id",
        label: "Release ID",
        type: "number",
        control_type: "text",
        optional: false,
      });
    }
  }

  // --- Deduplicate using JavaScript ---
  const uniqueFieldsMap = new Map<string, Field>();
  allFields.forEach((field) => {
    if (!uniqueFieldsMap.has(field.name)) {
      uniqueFieldsMap.set(field.name, field);
    }
  });
  const uniqueFields = Array.from(uniqueFieldsMap.values());
  return uniqueFields;
}
function getCreateReleaseNoteInputSchema(): Field[] {
  return [
    {
      name: "release_id",
      label: "Release ID",
      type: "number",
      control_type: "number",
      optional: false,
      hint: "The unique ID of the release to add the note to.",
    },
    {
      name: "body",
      label: "Body",
      type: "string", // Corrected from Number in source
      control_type: "text-area",
      optional: false,
      hint: "The content of the note.",
    },
    {
      name: "notify_emails",
      label: "Notify Emails",
      type: "array", // Corrected from Number in source
      of: "string",
      control_type: "text",
      optional: true,
      hint: "Comma-separated list of email addresses to notify.",
    },
    {
      name: "attachment",
      label: "Attachment URL",
      control_type: "text",
      type: "string",
      optional: true,
      hint: "Attachment URL comma separated",
    },
    {
      name: "attachment_name",
      label: "Attachment name",
      type: "string",
      control_type: "text",
      optional: true,
      hint: "Attachment name is mandatory for attachment content",
    },
    { name: "attachment_content", label: "Attachment Content", control_type: "text", type: "string", optional: true },
  ];
}

function getUpdateReleaseNoteInputSchema(): Field[] {
  return [
    {
      name: "release_id",
      label: "Release ID",
      type: "number",
      control_type: "number",
      optional: false,
      hint: "The unique ID of the release.",
    },
    {
      name: "note_id",
      label: "Note ID",
      type: "number",
      control_type: "number",
      optional: false,
      hint: "The unique ID of the note to update.",
    },
    {
      name: "body",
      label: "Body",
      type: "string", // Corrected from Number in source
      control_type: "text-area",
      optional: false, // Body is required for an update
      hint: "The new content for the note.",
    },
  ];
}

function getFindDeleteReleaseNoteInputSchema(): Field[] {
  return [
    {
      name: "release_id",
      label: "Release ID",
      type: "number",
      control_type: "number",
      optional: false,
      hint: "The unique ID of the release.",
    },
    {
      name: "note_id",
      label: "Note ID",
      type: "number",
      control_type: "number",
      optional: false,
      hint: "The unique ID of the note to find or delete.",
    },
  ];
}
// async function buildContractInputSchema(context: AppContext, mode: "create" | "update"): Promise<Field[]> {
//   const isUpdate = mode === "update";
//   const requiredFieldsCreate = [
//     "name",
//     "vendor_id",
//     "approver_id",
//     "start_date",
//     "end_date",
//     "cost",
//     "contract_number",
//   ]; // Fields required only for create
//   const contractTypeId = context.payload.config_fields?.contract_type_id; // Get workspace ID if available
//   const [fields, vendors, groups] = await Promise.all([
//     makeApiCall(context, `contract_types/${contractTypeId}/fields`, "GET"),
//     getAllFreshserviceData(context, "vendors"),
//     getAllFreshserviceData(context, "groups"),
//   ]);
//   if (fields.statusCode > 210) {
//     return fields;
//   }
//   groups.unshift({ label: "None", value: "None" });
//   const schemaFields = fields.data?.contract_type_fields
//     .map((f: any) => {
//       // Skip agent_id and group_id
//       if (["contract_type_id", "workspace_id", "visible_to_id", "approver_id"].includes(f.name)) return null;

//       const field: Field = {
//         name: f.name,
//         label: f.label,
//         type: mapType(f.field_type),
//         control_type: mapControlType(f.field_type),
//         optional: !f.required,
//         hint: `Enter ${f.label}`,
//       };

//       // Handle dropdowns or choice fields
//       if (Array.isArray(f.choices) && f.choices.length > 0) {
//         field.pick_list = f.choices.map((c: any) =>
//           typeof c === "string" ? { label: c, value: c } : { label: c.value ?? c.label ?? c, value: c.id ?? c }
//         );
//       }

//       // Mark as custom if not a default field
//       if (!f.default_field) {
//         field.custom = true;
//       }
//       if (field.type === "boolean") {
//         field.pick_list = [
//           { label: "True", value: "true" },
//           { label: "False", value: "false" },
//         ];
//       }
//       if (field.name === "vendor_id") {
//         field.pick_list = vendors;
//       }

//       return field;
//     })
//     // Remove skipped fields
//     .filter((f: any) => f !== null);
//   // Define the base fields for a task
//   const baseFields: Field[] = [
//     ...schemaFields,
//     {
//       name: "attachment",
//       label: "Attachment URL",
//       type: "string",
//       optional: true,
//       hint: "Attachment URL comma separated",
//     },
//     {
//       name: "attachment_name",
//       label: "Attachment name",
//       type: "string",
//       optional: true,
//       hint: "Attachment name is mandatory for attachment content",
//     },
//     { name: "attachment_content", label: "Attachment Content", type: "string", optional: true },
//   ];

//   // Adjust optionality for create mode

//   // Add task_id field for update mode
//   if (isUpdate) {
//     return [
//       {
//         name: "contract_id",
//         label: "Contract ID",
//         type: "number",
//         control_type: "number",
//         optional: false,
//         hint: "The ID of the contract to update.",
//       },
//       ...baseFields,
//     ];
//   }
//   const schemaFielda: any = [
//     ...baseFields,
//     {
//       name: "visible_to_id",
//       label: "Visible To",
//       type: "string",
//       control_type: "text",
//       optional: true,
//       hint: "Group assigned to the contract",
//       pick_list: groups,
//     },
//     {
//       label: "Approver",
//       optional: true,
//       function: "getAgentByGroupId",
//       dependentTo: ["visible_to_id"],
//       type: "number",
//       control_type: "select",
//       name: "approver_id",
//       hint: "Agent assigned to the release.",
//     },
//   ];
//    if (!isUpdate) {
//      schemaFielda.forEach((field) => {
//        if (requiredFieldsCreate.includes(field.name)) {
//          field.optional = false;
//        }
//      });
//    }

//   return schemaFielda;
// }
async function buildContractInputSchema(context: AppContext, mode: "create" | "update"): Promise<Field[]> {
  const isUpdate = mode === "update";
  const requiredFieldsCreate = [
    "name",
    "vendor_id",
    "approver_id",
    "start_date",
    "end_date",
    "cost",
    "contract_number",
  ];

  const contractTypeId = context.payload.config_fields?.contract_type_id;

  // Parallel API calls
  const [fieldsRes, vendors, groups] = await Promise.all([
    makeApiCall(context, `contract_types/${contractTypeId}/fields`, "GET"),
    getAllFreshserviceData(context, "vendors"),
    getAllFreshserviceData(context, "groups"),
  ]);

  if (fieldsRes.statusCode >= 400 || !fieldsRes.data?.contract_type_fields) {
    throw new Error(fieldsRes.data || "unable to retrive contract type fields");
  }

  const groupsWithNone = [{ label: "None", value: "None" }, ...groups];

  // Map fields into schema format
  const schemaFields: Field[] = fieldsRes.data.contract_type_fields
    .filter((f: any) => !["contract_type_id", "workspace_id", "visible_to_id", "approver_id"].includes(f.name))
    .map((f: any) => {
      const field: Field = {
        name: f.name,
        label: f.label,
        type: mapType(f.field_type),
        control_type: mapControlType(f.field_type),
        optional: !f.required,
        hint: `Enter ${f.label}`,
        ...(f.default_field ? {} : { custom: true }),
      };

      // Handle dropdowns
      if (Array.isArray(f.choices) && f.choices.length) {
        field.pick_list = f.choices.map((c: any) =>
          typeof c === "string" ? { label: c, value: c } : { label: c.label ?? c.value ?? c, value: c.id ?? c }
        );
      }

      // Boolean pick list
      if (field.type === "boolean") {
        field.control_type = "select";
        field.pick_list = [
          { label: "True", value: "true" },
          { label: "False", value: "false" },
        ];
      }

      // Vendor pick list
      if (field.name === "vendor_id") {
        field.pick_list = vendors;
        field.type = "number";
        field.control_type = "select";
      }

      return field;
    });

  // Base common fields
  const baseFields: Field[] = [
    ...schemaFields,
    {
      name: "attachment",
      label: "Attachment URL",
      control_type: "text",
      type: "string",
      optional: true,
      hint: "Attachment URL comma separated",
    },
    {
      name: "attachment_name",
      label: "Attachment name",
      control_type: "text",
      type: "string",
      optional: true,
      hint: "Attachment name is mandatory for attachment content",
    },
    {
      name: "attachment_content",
      label: "Attachment Content",
      control_type: "text",
      type: "string",
      optional: true,
    },
  ];

  const createFields: any = [
    ...baseFields,
    {
      name: "visible_to_id",
      label: "Visible To",
      type: "string",
      control_type: "select",
      optional: true,
      hint: "Group assigned to the contract",
      pick_list: groupsWithNone,
    },
    {
      name: "approver_id",
      label: "Approver",
      optional: true,
      function: "getAgentByGroupId",
      dependentTo: ["visible_to_id"],
      type: "number",
      control_type: "select",
      hint: "Agent assigned to the contract.",
    },
  ];

  // Mark required fields for create mode
  createFields.forEach((field) => {
    if (requiredFieldsCreate.includes(field.name)) {
      field.optional = false;
    }
  });
  if (isUpdate) {
    return [
      {
        name: "contract_id",
        label: "Contract ID",
        type: "number",
        control_type: "number",
        optional: false,
        hint: "The ID of the contract to update.",
      },
      ...createFields
        .filter((f) => f.name !== "attachment" && f.name !== "attachment_name" && f.name !== "attachment_content")
        .map((f) => ({ ...f, optional: true })),
    ];
  }
  return createFields;
}

function getTimeEntryModulePicklist(): PickListValue[] {
  return [
    { label: "Tickets", value: "tickets" },
    { label: "Problems", value: "problems" },
    { label: "Changes", value: "changes" },
    { label: "Releases", value: "releases" },
  ];
}

async function getModuleGroups(context: AppContext): Promise<PickListValue[]> {
  const workspaceId = context.payload.data?.workspace_id || context.payload.config_fields?.workspace_id;
  if (!workspaceId) {
    // Cannot fetch groups without a workspace.
    return [{ label: "Select a Workspace first", value: "" }];
  }

  try {
    const groupRes = await makeApiCall(context, `groups?workspace_id=${workspaceId}`, "GET");
    const groupDropdown = groupRes.data?.groups?.map((g: any) => ({ label: g.name, value: String(g.id) })) || [];
    groupDropdown.unshift({ label: "None of the Above", value: "none_of_the_above" });
    return groupDropdown;
  } catch (error) {
    return [{ label: "Error fetching groups", value: "" }];
  }
}

function getFindDeleteTimeEntryInputSchema(context: AppContext): Field[] {
  const module = (context.payload.config_fields?.module as string) || "tickets";
  const moduleLabels: Record<string, string> = {
    tickets: "Ticket ID",
    problems: "Problem ID",
    changes: "Change ID",
    releases: "Release ID",
  };

  return [
    {
      name: "module_id",
      label: moduleLabels[module] || "Parent Item ID",
      type: "number",
      control_type: "number",
      optional: false,
      hint: `ID of the ${module.slice(0, -1)}`,
    },
    {
      name: "entry_id", // Changed from task_id
      label: "Time Entry ID",
      type: "number",
      control_type: "number",
      optional: false,
      hint: "Enter the unique ID of the time entry.",
    },
  ];
}

async function getAllAgents(context: AppContext): Promise<any[]> {
  let page = 1;
  const perPage = 100; // Freshservice max per page
  let allAgents: any[] = [];
  let hasMore = true;

  while (hasMore) {
    const res = await makeApiCall(context, `agents?page=${page}&per_page=${perPage}`, "GET");

    if (res.statusCode >= 200 && res.statusCode < 300 && res.data?.agents?.length) {
      allAgents = allAgents.concat(res.data.agents);
      page++;
      // If less than perPage, stop looping
      hasMore = res.data.agents.length === perPage;
    } else {
      hasMore = false;
    }
  }

  return allAgents && allAgents.length
    ? allAgents.map((a: any) => ({
        label: a.first_name ? `${a.first_name} ${a.last_name || ""}`.trim() : a.email,
        value: String(a.id),
      }))
    : [];
}

async function getCustomObjectList(context: AppContext): Promise<PickListValue[]> {
  try {
    const { statusCode, data } = await makeApiCall(context, "objects", "GET");
    if (statusCode >= 400 || !data?.custom_objects) {
      return [];
    }

    return data.custom_objects.map((obj: any) => ({
      label: obj.title, // Use title for the label
      value: String(obj.id), // Use id for the value
    }));
  } catch (error: any) {
    return [];
  }
}

async function buildCustomObjectSchema(context: AppContext, mode: "create" | "update"): Promise<Field[]> {
  const objectId = context.payload.config_fields?.object_id as string;
  if (!objectId) {
    throw new Error("Custom Object ID is required to build the input schema.");
  }

  try {
    // Fetch the specific custom object's definition
    const { statusCode, data } = await makeApiCall(context, `objects/${objectId}`, "GET");

    if (statusCode >= 400 || !data?.custom_object?.fields) {
      throw new Error(`Could not fetch schema for Custom Object ID: ${objectId}`);
    }

    const customObjectFields = data.custom_object.fields;

    // Map the API's field definitions to DSL Field definitions
    const schemaFields: Field[] = customObjectFields
      // Include:
      // 1️⃣ Non-dropdowns
      // 2️⃣ Dropdowns that have choices (and not nested fields)
      .filter(
        (item) =>
          (item.type !== "dropdown" && !item.fields) ||
          (item.type === "dropdown" &&
            (!item.fields || item.fields.length === 0) &&
            Array.isArray(item.choices) &&
            item.choices.length > 0)
      )
      .map((field: any) => {
        const fieldType = mapType(field.type); // existing helper
        const controlType = mapControlType(field.type); // existing helper

        const baseField: Field = {
          name: field.name,
          label: field.label,
          optional: !field.required,
          type: fieldType,
          control_type: controlType,
          hint: field.description || `Enter ${field.label}`,
        };

        // 🟢 Convert dropdowns with choices → pick_list
        if (Array.isArray(field.choices) && field.choices.length > 0) {
          baseField.pick_list = field.choices.map((choice: any) => ({
            label: choice.label || choice.value || String(choice),
            value: choice.value || choice.label || String(choice),
          }));
          baseField.control_type = "select";
        }

        // 🟡 Boolean fallback
        if (baseField.type === "boolean" && !baseField.pick_list) {
          baseField.pick_list = [
            { label: "True", value: "true" },
            { label: "False", value: "false" },
          ];
          baseField.control_type = "select";
        }

        return baseField;
      });

    const nestedDropdownSchema: any = [];
    const validDropdowns = customObjectFields.filter((f) => f.type === "dropdown" && f.fields && f.fields.length > 0);

    validDropdowns.forEach((dropdown, parentIndex) => {
      const parentNumber = parentIndex + 1; // numbering 1,2,3,...

      dropdown.fields.forEach((field, index) => {
        if (index === 0) {
          // 🟢 Parent
          nestedDropdownSchema.push({
            name: `parent:${parentNumber}:${field.name}`,
            label: field.label,
            type: "string",
            control_type: "select",
            optional: true,
            pick_list: dropdown.choices.map((c) => ({
              label: c.value,
              value: c.value,
            })),
          });
        } else if (index === 1) {
          // 🟡 Child 1
          nestedDropdownSchema.push({
            name: `parent:${parentNumber}:child:1:${field.name}`,
            label: field.label,
            type: "string",
            control_type: "select",
            optional: true,
            function: `customparent${parentNumber}dependent1`,
            dependentTo: [`parent:${parentNumber}:${dropdown.fields[0].name}`], // ✅ fixed
          });
        } else if (index === 2) {
          // 🔵 Child 2
          nestedDropdownSchema.push({
            name: `parent:${parentNumber}:child:2:${field.name}`,
            label: field.label,
            type: "string",
            control_type: "select",
            optional: true,
            function: `customparent${parentNumber}dependent2`,
            dependentTo: [
              `parent:${parentNumber}:${dropdown.fields[0].name}`, // ✅ fixed
              `parent:${parentNumber}:child:1:${dropdown.fields[1].name}`, // ✅ fixed
            ],
          });
        }
      });
    });

    if (nestedDropdownSchema.length) {
      schemaFields.push(...nestedDropdownSchema);
    }
    if (mode === "update") {
      // For "update" mode, prepend the mandatory record_id field
      return [
        {
          name: "record_id",
          label: "Record ID",
          type: "number",
          control_type: "number",
          optional: false,
          hint: "The unique ID of the custom object record to update.",
        },
        ...schemaFields.map((item) => ({ ...item, optional: true })),
      ];
    }

    return schemaFields;
  } catch (error: any) {
    throw error;
  }
}
async function buildAssetInputSchema(context: AppContext, mode: "create" | "update"): Promise<Field[]> {
  const assetTypeId = context.payload.config_fields?.asset_type_id as any;

  // 1. Fetch dependencies
  const [fieldsRes, locations, agents, departments, groups, workspaces] = await Promise.all([
    assetTypeId
      ? makeApiCall(context, `asset_types/${assetTypeId}/fields`, "GET")
      : Promise.resolve({ statusCode: 200, data: { asset_type_fields: [] } }),
    getLocations(context),
    getAllAgents(context),
    getDepartmentsByValue(context, true), // Note: Original code mapped departments by name in one place, ID in another. Standardizing on ID usually safer, but following your utils.
    makeApiCall(context, "groups", "GET"),
    getallWorkspaces(context),
  ]);
  departments.unshift({ label: "None", value: "None" });
  const groupDropdown = groups.data?.groups?.map((g: any) => ({ label: g.name, value: String(g.id) })) || [];
  groupDropdown.unshift({ label: "None", value: "None" });
  // 2. Base Fields (Static)
  const baseFields: any = [
    {
      label: "Group",
      optional: true,
      type: "string",
      control_type: "select",
      pick_list: groupDropdown,
      name: "group_id",
      hint: "Group assigned to the release.",
    },
    {
      label: "Agent (Managed By)",
      optional: true,
      function: "getAgentByGroupId",
      dependentTo: ["group_id"],
      type: "number",
      control_type: "select",
      name: "agent_id",
      hint: "Agent assigned to the release.",
    },
    {
      name: "workspace_id",
      pick_list: workspaces,
      label: "Workspace",
      optional: true,
      type: "number",
      control_type: "select",
      hint: "Select the workspace where the asset will be created.",
    },
    {
      name: "attachment",
      label: "Attachment URL",
      control_type: "text",
      type: "string",
      optional: true,
      hint: "Attachment URL comma separated",
    },
    {
      name: "attachment_name",
      label: "Attachment name",
      control_type: "text",
      type: "string",
      optional: true,
      hint: "Attachment name is mandatory for attachment content",
    },
    {
      name: "attachment_content",
      label: "Attachment Content",
      control_type: "text",
      type: "string",
      optional: true,
      hint: "Give Base64 content to upload an attachment",
    },
    {
      name: "usage_type",
      label: "Usage Type",
      type: "string",
      control_type: "select",
      pick_list: [
        { label: "permanent", value: "permanent" },
        { label: "loaner", value: "loaner" },
      ],
      optional: true,
    },
  ];

  // 3. Dynamic Fields from Asset Type
  let dynamicFields: Field[] = [];

  if (fieldsRes.data?.asset_type_fields) {
    const rawFields = fieldsRes.data.asset_type_fields
      .flatMap((section: any) =>
        section.fields.map((field: any) => ({
          ...field,
          __section: section.field_header, // ✅ track source section
        }))
      )
      .filter((item) => item.field_type !== "nested_field");

    const SKIP_NAMES = new Set(["asset_type_id", "workspace", "agent_id", "group_id"]);

    const NON_CUSTOM_SECTIONS = new Set(["General", "Assignment"]);

    dynamicFields = rawFields
      .filter((f: any) => !SKIP_NAMES.has(f.name)) // ✅ name-based exclusion
      .map((f: any) => {
        const isCustom = !NON_CUSTOM_SECTIONS.has(f.__section); // ✅ section-based custom flag

        const field: any = {
          name: f.name,
          label: f.label,
          type: mapType(f.data_type),
          control_type: mapControlType(f.field_type),
          optional: mode === "update" ? true : !f.required,
          custom: isCustom, // ✅ ONLY true for non-General & non-Assignment
        };

        if (Array.isArray(f.choices) && f.choices.length) {
          const detectedType = f.data_type === "integer" || f.data_type === "decimal" ? "number" : "string";

          field.pick_list = f.choices.map(([label, value]) => ({
            label,
            value: String(label),
          }));

          field.type = "string";
          field.control_type = "select";
        }
        if (field.name === "location_id") {
          field.pick_list = locations;
          ((field.control_type = "select"), (field.type = "number"));
        }
        if (field.name === "department_id") {
          field.pick_list = departments;
          ((field.control_type = "select"), (field.type = "string"));
        }
        if (field.name === "user_id") {
          field.control_type = "select";
          field.type = "number";
          field.function = "getAgentByDepartment";
          field.dependentTo = ["department_id"]; // ✅ Correct dependency
          field.hint = "Select the user based on the chosen department."; // ✅ Correct hint
        }

        return field;
      });
  }
  const rawDependantFields = fieldsRes.data.asset_type_fields
    .flatMap((section: any) =>
      section.fields.map((field: any) => ({
        ...field,
        __section: section.field_header, // ✅ track source section
      }))
    )
    .filter((item) => item.field_type === "nested_field");
  // //console.log("rawDependantFields", rawDependantFields);
  const getDependentFeilds = AssetDependentCustomFieldstransformFields(rawDependantFields);

  // console.dir(getDependentFeilds, { depth: null, colors: true });
  const allFields = [...baseFields, ...dynamicFields, ...getDependentFeilds];

  if (mode === "update") {
    return [
      { name: "asset_id", label: "Asset Display ID", type: "number", control_type: "number", optional: false },
      ...allFields.filter((item) => item.name !== "workspace_id").map((f) => ({ ...f, optional: true })),
    ];
  }

  return allFields;
}

// Logic to move dynamic fields into "type_fields" object for the API
function processAssetPayload(eventData: any, schema: Field[]) {
  const payload: any = { type_fields: {} };

  // Fields that stay at root
  const rootFields = [
    "name",
    "description",
    "asset_type_id",
    "workspace_id",
    "location_id",
    "agent_id",
    "user_id",
    "department_id",
    "group_id",
    "impact",
    "asset_tag",
    "cost",
    "acquisition_date",
  ];

  for (const key in eventData) {
    if (rootFields.includes(key)) {
      payload[key] = eventData[key];
    } else {
      // It's likely a dynamic type_field
      payload.type_fields[key] = eventData[key];
    }
  }

  // Integer conversion for standard IDs
  ["workspace_id", "location_id", "agent_id", "user_id", "department_id", "group_id"].forEach((k) => {
    if (payload[k]) payload[k] = parseInt(payload[k]);
  });

  return payload;
}
async function getAssetTypes(context: AppContext): Promise<PickListValue[]> {
  try {
    const allTypes: PickListValue[] = [];
    let page = 1;
    while (true) {
      const response = await makeApiCall(context, `asset_types?per_page=100&page=${page}`, "GET");
      if (response.statusCode >= 400 || !response.data?.asset_types) {
        throw new Error(response.data?.message || response.data?.code || "unable to fetch the aaset type");
      }

      const types = response.data.asset_types;
      if (types.length === 0) break;

      allTypes.push(...types.map((t: any) => ({ label: t.name, value: String(t.id) })));
      if (types.length < 100) break;
      page++;
    }
    return allTypes;
  } catch (error) {
    throw new Error(error.message);
  }
}
function formatAssetResponse(asset: any, statusCode: number) {
  return {
    statusCode,
    data: {
      ...asset,
      attachment_ids: asset.attachments?.map((a) => a.id) || [],
      attachments_url: asset.attachments?.map((a) => a.attachment_url).join(",") || "",
      first_attachment_id: asset.attachments?.[0]?.id || null,
      stringified_attachments: JSON.stringify(asset.attachments || []),
      datafound: true,
    },
  };
}
const actionsAlloption = {
  retry_on_response: [],
  retry_on_request: [],
  max_retries: 0,
  help: "",
  display_priority: 0,
  batch: false,
  batch_size: 0,
  bulk: false,
  deprecated: false,
  cursor_enabled: true,
};

function flattenAndReplace(obj: any, parentKey = "", result: any = {}) {
  for (const key in obj) {
    const value = obj[key];
    const separator = Array.isArray(value) ? "::" : ":";
    const newKey = parentKey ? `${parentKey}${separator}${key}` : key;

    if (Array.isArray(value)) {
      // Flatten array of objects
      if (value.length && typeof value[0] === "object") {
        value.forEach((item, index) => {
          flattenAndReplace(item, `${newKey}::${index}`, result);
        });
      } else {
        // Direct array
        result[newKey] = value;
      }
    } else if (typeof value === "object" && value !== null) {
      // Recurse for nested objects
      flattenAndReplace(value, newKey, result);
    } else {
      result[newKey] = value;
    }
  }
  return result;
}
function unflattenObject(flatObj: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};

  for (const flatKey in flatObj) {
    const value = flatObj[flatKey];

    // Split by ":" but preserve "::" as array indicators
    const parts = flatKey.split(/(::|:)/g).filter(Boolean);
    let current = result;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];

      if (part === ":") continue; // skip single colon separators

      // Handle array syntax (::index)
      if (part === "::") continue;

      // If next part is "::", next-next is the array index
      if (parts[i + 1] === "::") {
        const arrayKey = part;
        const index = Number(parts[i + 2]);
        if (!Array.isArray(current[arrayKey])) current[arrayKey] = [];
        if (!current[arrayKey][index]) current[arrayKey][index] = {};
        current = current[arrayKey][index];
        i += 2; // skip "::" and index
      } else if (i === parts.length - 1) {
        // Last key → assign value
        current[part] = value;
      } else {
        // Nested object path
        if (!current[part] || typeof current[part] !== "object") {
          current[part] = {};
        }
        current = current[part];
      }
    }
  }

  return result;
}
function addStringifiedArrayProperty(obj: Record<string, any>): Record<string, any> {
  function recurse(target: any) {
    if (!target || typeof target !== "object") return;
    Object.keys(target).forEach((key) => {
      const value = target[key];
      if (
        Array.isArray(value) &&
        value.length > 0 &&
        value.every((item) => item && typeof item === "object" && !Array.isArray(item))
      ) {
        const stringifiedKey = `stringified_${key}`;
        target[stringifiedKey] = JSON.stringify(value);
      }
      if (value && typeof value === "object") {
        recurse(value);
        if (Array.isArray(value)) {
          value.forEach((item) => {
            if (item && typeof item === "object") recurse(item);
          });
        }
      }
    });
  }
  recurse(obj);
  return obj;
}

const actions: Actions = {
  // ---------  Department Modules  ------------
  create_location: {
    id: "create_location",
    name: "Create Location",
    title: "Create Location",
    subtitle: "Create a new location.",
    description: "Creates a new location in Freshservice.",
    has_config_fields: false,
    pick_lists: {},
    config_fields: {
      fields: async (_context: AppContext) => {
        return [];
      },
    },

    input_schema: {
      fields: async (context: AppContext) => {
        const locations: any = await getLocations(context);
        console.log("locations", locations);
        if (locations?.error) {
          throw new Error(locations.error);
        }
        const agents = await getAllAgents(context);
        const mockLocation = {
          name: "HQ",
          parent_location_id: 2,
          primary_contact_id: 33232,
          contact_name: "Mahendran ramar",
          email: "mahendran.ramar@konnectify.co",
          phone: "09786047798",
          address: {
            line1: "1250 Bayhill Drive",
            line2: "Suite 315",
            city: "San Bruno",
            state: "California",
            country: "US",
            zipcode: "94066",
          },
        };
        const flattenData = flattenAndReplace(mockLocation);
        let dropdowns = {
          parent_location_id: locations,
          //  primary_contact_id: agents,
        };
        let schema: any[] = GenerateSchema(flattenData, ["name"], dropdowns);
        schema = schema.map((item) => {
          if (item.label.includes(":")) {
            item.label = item.label.replace(":", " ");
          }
          return item;
        });
        return schema;
      },
    },

    output_schema: {
      fields: async (_context: AppContext): Promise<any> => {
        const sample = await sampleDataForm(_context, "locations", "locations");
        if (sample?.error) {
          throw new Error(sample.error || "Cannot able to retrieve output schema");
        }
        return GenerateSchema(sample);
      },
    },

    execute: async (context: AppContext): Promise<ExecutionPayload> => {
      try {
        const { ...eventData } = context.payload.data as any;
        const payload = unflattenObject(eventData);
        // Remove undefined fields
        let body = removeEmpty(payload);
        // //console.log(body);
        const result = await makeApiCall(context, "locations", "POST", body);
        const { statusCode, data } = result;

        if (statusCode >= 200 && statusCode < 300) {
          return {
            statusCode,
            data: data.location,
          };
        }

        return {
          statusCode,
          data: {
            error: data || "Unable to create a",
          },
        };
      } catch (error: any) {
        return handleActionError(error, context, "Create Location");
      }
    },

    sample: {
      output: {
        id: 501,
        name: "Chennai Office",
        city: "Chennai",
        country: "India",
      },
    },

    ...actionsAlloption,
  },
  update_location: {
    id: "update_location",
    name: "Update Location",
    title: "Update Location",
    subtitle: "Update an existing location.",
    description: "Updates an existing location in Freshservice.",
    has_config_fields: false,
    pick_lists: {},
    config_fields: {
      fields: async (_context: AppContext) => {
        return [];
      },
    },

    input_schema: {
      fields: async (context: AppContext) => {
        const locations = await getLocations(context);
        const mockLocation = {
          id: 2,
          name: "HQ - Updated",
          parent_location_id: 1,
          primary_contact_id: 33232,
          contact_name: "Mahendran ramar",
          email: "mahendran.ramar@konnectify.co",
          phone: "09786047798",
          primary: true,
          address: {
            line1: "1250 Bayhill Drive",
            line2: "Suite 315",
            city: "San Bruno",
            state: "California",
            country: "US",
            zipcode: "94066",
          },
        };

        const flattenData = flattenAndReplace(mockLocation);
        let dropdowns = {
          id: locations, // 👈 required to know which location to update
          parent_location_id: locations,
        };

        let schema: any[] = GenerateSchema(
          flattenData,
          ["id"], // 👈 ID is required
          dropdowns
        );

        schema = schema.map((item) => {
          if (item.label.includes(":")) {
            item.label = item.label.replace(":", " ");
          }
          return item;
        });

        return schema;
      },
    },

    output_schema: {
      fields: async (_context: AppContext): Promise<any> => {
        const sample = await sampleDataForm(_context, "locations", "locations");
        if (sample?.error) {
          throw new Error(sample.error || "Cannot able to retrieve output schema");
        }
        return GenerateSchema(sample);
      },
    },

    execute: async (context: AppContext): Promise<ExecutionPayload> => {
      try {
        const { id, ...eventData } = context.payload.data as any;

        if (!id) {
          return {
            statusCode: 400,
            data: { error: "Location ID is required for update." },
          };
        }

        // Convert flat → nested
        const payload = unflattenObject(eventData);

        // Remove empty / undefined fields
        const body = removeEmpty(payload);

        // //console.log("Update Location Payload:", body);

        const result = await makeApiCall(context, `locations/${id}`, "PUT", body);

        const { statusCode, data } = result;

        if (statusCode >= 200 && statusCode < 300) {
          return {
            statusCode,
            data: data.location,
          };
        }

        return {
          statusCode,
          data: {
            error: data || "Unable to update location",
          },
        };
      } catch (error: any) {
        return handleActionError(error, context, "Update Location");
      }
    },

    sample: {
      output: {
        id: 2,
        name: "HQ - Updated",
        city: "San Bruno",
        country: "US",
      },
    },

    ...actionsAlloption,
  },
  find_location: {
    id: "find_location",
    name: "Find Location",
    title: "Find Location",
    subtitle: "Find a location by ID or Name.",
    description: "Retrieves location details using its ID or Name.",
    config_fields: {
      fields: async (): Promise<any> => [
        {
          name: "find",
          label: "Find By",
          type: "string",
          control_type: "select",
          optional: false,
          pick_list: [
            { label: "Location ID", value: "id" },
            { label: "Location Name", value: "name" },
          ],
        },
      ],
    },
    ...actionsAlloption,
    pick_lists: {},
    input_schema: {
      fields: async (context: AppContext) => {
        const findKey = context.payload.config_fields?.find as string;
        const schemaObject = { [findKey]: "string" };
        return GenerateSchema(schemaObject, [findKey]);
      },
    },

    // -----------------------------
    // 3️⃣ Output Schema
    // -----------------------------

    output_schema: {
      fields: async (_context: AppContext): Promise<any> => {
        const sample = await sampleDataForm(_context, "locations", "locations");
        if (sample?.error) {
          throw new Error(sample.error || "Cannot able to retrieve output schema");
        }
        const schema = GenerateSchema(sample);
        schema.push({ name: "datafound", type: "boolean", control_type: "select", optional: true });
        return schema;
      },
    },

    // -----------------------------
    // 4️⃣ Execute
    // -----------------------------
    execute: async (context: AppContext): Promise<ExecutionPayload> => {
      const { find } = context.payload.config_fields as any;
      const input = context.payload.data as any;

      try {
        // ---------------------------
        // 🔍 FIND BY ID
        // ---------------------------
        if (find === "id") {
          const locationId = input.id;

          if (!locationId) {
            return { statusCode: 200, data: { datafound: false } };
          }

          const result = await makeApiCall(context, `locations/${locationId}`, "GET");

          if (result.statusCode === 404 || !result.data?.location) {
            return { statusCode: 200, data: { datafound: false } };
          }

          return {
            statusCode: 200,
            data: { ...result.data.location, datafound: true },
          };
        }
        if (find === "name") {
          const locationName = input.name;

          if (!locationName) {
            return { statusCode: 200, data: { datafound: false } };
          }

          const matches: any[] = [];
          let page = 1;
          let limit = 100;

          while (true) {
            const query = `name:'${locationName}'`;
            const result = await makeApiCall(context, `locations?query=${query}&page=${page}&per_page=${limit}`, "GET");
            ////console.log(result);
            const locations = result?.data?.locations || [];
            if (!locations.length) break;

            const filtered = locations.filter((l) => l.name === locationName);

            matches.push(...filtered);

            if (locations.length < limit) break;
            page++;
          }
          if (!matches.length) {
            return { statusCode: 200, data: { datafound: false } };
          }

          const latest = matches.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())[0];

          const finalResult = await makeApiCall(context, `locations/${latest.id}`, "GET");

          if (!finalResult?.data?.location) {
            return { statusCode: 200, data: { datafound: false } };
          }

          return {
            statusCode: 200,
            data: { ...finalResult.data.location, datafound: true },
          };
        }

        return { statusCode: 200, data: { datafound: false } };
      } catch (error: any) {
        return handleActionError(error, context, "Find Location");
      }
    },

    sample: {
      output: {
        id: 15,
        name: "United Kingdom",
        country: "UK",
        datafound: true,
      },
    },

    cursor_enabled: true,
    has_config_fields: true,
  },

  delete_location: {
    id: "delete_location",
    name: "Delete Location",
    title: "Delete Location",
    subtitle: "Permanently delete a location.",
    description: "Deletes a location from Freshservice.",
    ...actionsAlloption,
    input_schema: {
      fields: async () => [
        {
          name: "location_id",
          label: "Location ID",
          type: "number",
          control_type: "number",
          optional: false,
        },
      ],
    },

    output_schema: {
      fields: async () => [
        { name: "success", type: "boolean", label: "Success" },
        { name: "message", type: "string", label: "Message" },
      ],
    },

    execute: async (context: AppContext): Promise<ExecutionPayload> => {
      const { location_id } = context.payload.data;

      if (!location_id) {
        return { statusCode: 400, data: { error: "Location ID is required." } };
      }

      try {
        const result = await makeApiCall(context, `locations/${location_id}`, "DELETE");

        if (result.statusCode >= 200 && result.statusCode < 300) {
          return {
            statusCode: 200,
            data: { success: true, message: "Location deleted successfully." },
          };
        }

        if (result.statusCode === 404) {
          return {
            statusCode: 404,
            data: { success: false, message: "Location not found." },
          };
        }

        return {
          statusCode: result.statusCode,
          data: { success: false, error: result.data },
        };
      } catch (error: any) {
        return handleActionError(error, context, "Delete Location");
      }
    },

    sample: {
      output: {
        success: true,
        message: "Location deleted successfully.",
      },
    },

    cursor_enabled: true,
    has_config_fields: false,
    pick_lists: {},
    config_fields: {
      fields: async () => {
        return [];
      },
    },
  },
  find_assets_by_asset_type_id: {
    id: "find_assets_by_asset_type_id",
    name: "Find Assets By Asset Type",
    title: "Find Assets By Asset Type",
    subtitle: "Get all assets for an asset type",
    description: "Retrieves all assets that belong to a given Asset Type ID.",
    config_fields: {
      fields: async (): Promise<any[]> => [],
    },
    pick_lists: {},
    input_schema: {
      fields: async (context): Promise<any> => {
        const [types, workspaces] = await Promise.all([
          getAssetTypes(context),
          getAllFreshserviceData(context, "workspaces"),
        ]);
        return [
          {
            name: "asset_type_id",
            label: "Asset Type",
            type: "number",
            control_type: "select",
            pick_list: types,
            optional: false,
            hint: "Select the type of asset to create.",
          },
          {
            name: "workspace_id",
            pick_list: workspaces,
            label: "Workspace",
            optional: true,
            type: "number",
            control_type: "select",
            hint: "Select the workspace where the release will be created.",
          },
        ];
      },
    },

    // -----------------------------
    // 3️⃣ Output Schema
    // -----------------------------
    output_schema: {
      fields: async (): Promise<any[]> => {
        const sampleResult = {
          assets_id: [1, 2],
          datafound: true,
        };

        return GenerateSchema(sampleResult);
      },
    },

    // -----------------------------
    // 4️⃣ Execute
    // -----------------------------
    execute: async (context: AppContext): Promise<ExecutionPayload> => {
      const { asset_type_id, workspace_id } = context.payload.data as any;

      if (!asset_type_id) {
        return {
          statusCode: 200,
          data: { datafound: false },
        };
      }
      let page = 1;
      const all_assets: any[] = [];

      // 🧠 build dynamic filter
      let filterParts = [`asset_type_id:${asset_type_id}`];

      if (workspace_id) {
        filterParts.push(`workspace_id:${workspace_id}`);
      }

      const filterQuery = filterParts.join(" AND ");
      const filter = encodeURIComponent(`"${filterQuery}"`);

      while (true) {
        const result = await makeApiCall(context, `assets?page=${page}&filter=${filter}`, "GET");
        if (result?.statusCode >= 400) {
          return {
            data: { error: result.data },
            statusCode: result.statusCode,
          };
        }
        const assets = result?.data?.assets || [];
        all_assets.push(...assets);
        if (!assets.length) break;
        page++;
      }

      if (!all_assets.length) {
        return {
          statusCode: 200,
          data: { datafound: false },
        };
      }

      return {
        statusCode: 200,
        data: {
          assets_id: all_assets.map((item) => item.display_id),
          datafound: true,
        },
      };
    },

    // -----------------------------
    // 5️⃣ Sample
    // -----------------------------
    sample: {
      output: {
        assets: '[{"id":12345,"name":"Dell Inspiron"}]',
        datafound: true,
      },
    },

    cursor_enabled: false,
    has_config_fields: false,
    retry_on_response: [],
    retry_on_request: [],
    max_retries: 0,
    help: "",
    display_priority: 0,
    batch: false,
    batch_size: 0,
    bulk: false,
    deprecated: false,
  },

  create_asset: {
    id: "create_asset",
    name: "Create Asset",
    title: "Create Asset",
    subtitle: "Create a new asset.",
    description: "Creates a new asset based on a selected asset type.",
    has_config_fields: true,
    pick_lists: {
      getAgentByGroupId: async (context: AppContext) => {
        context = {
          ...context,
          payload: {
            ...context.payload,
            config_fields: {
              ...context.payload.config_fields,
              module: "asset",
            },
          },
        };
        return getAgentByGroupId(context);
      },
      getAgentByDepartment: async (context: AppContext) => {
        context = {
          ...context,
          payload: {
            ...context.payload,
            config_fields: {
              ...context.payload.config_fields,
              module: "asset",
            },
          },
        };
        return getAgentByDepartment(context);
      },
      Assetsparent1dependent1,
      Assetsparent1dependent2,
      Assetsparent2dependent1,
      Assetsparent2dependent2,
      Assetsparent3dependent1,
      Assetsparent3dependent2,
      Assetsparent4dependent1,
      Assetsparent4dependent2,
      Assetsparent5dependent1,
      Assetsparent5dependent2,
      Assetsparent6dependent1,
      Assetsparent6dependent2,
    },
    config_fields: {
      fields: async (context: AppContext) => {
        const [types] = await Promise.all([getAssetTypes(context)]);
        return [
          {
            name: "asset_type_id",
            label: "Asset Type",
            type: "number",
            control_type: "select",
            pick_list: types,
            optional: false,
            hint: "Select the type of asset to create.",
          },
        ];
      },
    },
    input_schema: {
      fields: async (context: AppContext) => buildAssetInputSchema(context, "create"),
    },
    output_schema: {
      fields: async (context: AppContext): Promise<any> => {
        const assetTypeId = context.payload.config_fields?.asset_type_id as any;
        const workspaceId = context.payload.config_fields?.workspace_id as any;
        const filter = workspaceId
          ? `"asset_type_id:${assetTypeId} AND workspace_id:${workspaceId}"`
          : `"asset_type_id:${assetTypeId}"`;
        const schema = await getOutputSchemaForm(
          context,
          `assets?include=type_fields&filter=${encodeURIComponent(filter)}`,
          "assets",
          "cannot fetch output fields"
        );
        if (schema?.error) {
          throw new Error(schema.error);
        }
        console.log();
        const data = GenerateSchema({
          attachments: [
            {
              attachment_url:
                "https://konnectify-desk.euc-attachments.freshservice.com/data/helpdesk/attachments/production/52064060441/original/sample.pdf?response-content-type=application/pdf&Expires=1765552354&Signature=DlrUZZGhA7dfCvn21xSje-lTUD5SCfkO9NcgeqGDkI~iJnnISejOlOob2e1ssop1qig9QGRWB24E1N~d7O5bMBOq~QV6fAfl2A4MQEngypbfVUTs~JTgattR8~tdGNo6R3xKEnUqe4MOJhdJHQ3Jw3o58aZ2pf3eGt8kHQ3V~kH2SdGGnYOBT~3DNr7TFpfKDFUaQqj7zKJR8SzdXalAx9evjR2Fl9LRqkfMHn7ac8YYufyk3Vp2hs-272u9b94sWxuhiJRWqY8B1Y6RYFZC-hP85IubX8jsDLVhstRHSIe0hMdoa~HLn0XBfMdvPaV~S0kNti24ylwiVqvkMZXSuA__&Key-Pair-Id=APKAIPHBXWY2KT5RCMPQ",
              canonical_url: "https://konnectify-desk.freshservice.com/helpdesk/attachments/52064060441",
              content_type: "application/pdf",
              created_at: "2025-12-09T13:39:15Z",
              has_access: true,
              id: 52064060441,
              name: "sample.pdf",
              size: 18810,
              updated_at: "2025-12-09T13:39:15Z",
            },
          ],
        });
        return [...schema, ...data];
      },
    },

    execute: async (context: AppContext): Promise<ExecutionPayload> => {
      try {
        const { asset_type_id } = context.payload.config_fields as any;
        const eventData = context.payload.data;

        // Build schema to identify fields
        const schema = await buildAssetInputSchema(context, "create");
        // Use generic payload generator first
        const body = generateAssetPayload(schema, { ...eventData, asset_type_id });

        // Process specific asset structure (moving custom fields to type_fields)
        // const body = processAssetPayload({ ...rawPayload, asset_type_id: parseInt(asset_type_id) }, schema);
        if (body.group_id) {
          if (body.group_id.toString().toLowerCase() === "none") {
            delete body.group_id;
          } else if (!isNaN(Number(body.group_id))) {
            body.group_id = Number(body.group_id);
          }
        }
        if (body.department_id) {
          if (body.department_id.toString().toLowerCase() === "none") {
            delete body.department_id;
          } else if (!isNaN(Number(body.department_id))) {
            body.department_id = Number(body.department_id);
          }
        }
        // //console.log(JSON.stringify(body));
        const finalPayload = await Assignattchments(context, body);
        if (finalPayload?.statusCode > 210) {
          return {
            statusCode: finalPayload.statusCode,
            data: {
              error: finalPayload,
            },
          };
        }
        // //console.log("finalPayload", finalPayload);
        // //console.log("finalPayload", JSON.stringify(finalPayload));
        const result = await ApiCallWithAttachment(context, "assets", "POST", finalPayload);
        const { statusCode, data } = result;

        if (statusCode >= 200 && statusCode < 300) {
          if (data?.asset?.attachments && data?.asset?.attachments?.length) {
            const asset = result?.data?.asset as any;
            const attachments_url =
              asset?.attachments && asset?.attachments.length
                ? asset.attachments.map((item) => item.attachment_url).join(",")
                : [];
            const attachment_ids =
              asset?.attachments && asset?.attachments.length ? asset.attachments.map((item) => item.id) : [];
            const first_attachment_id = asset?.attachments.length ? asset.attachments[0]?.id : null;
            return {
              statusCode,
              data: {
                ...asset,
                attachment_ids,
                attachments_url,
                first_attachment_id,
                stringified_attachments: JSON.stringify(asset?.attachments),
              },
            };
          }
          return { statusCode, data: data.asset };
        }

        return {
          statusCode,
          data: { error: data?.message || "Failed to create contract.", details: data?.errors || null },
        };
      } catch (error: any) {
        return handleActionError(error, context, "Create Asset");
      }
    },
    sample: {
      output: { id: 101, name: "MacBook Pro", asset_tag: "MBP-001" },
    },
    ...actionsAlloption,
  },
  update_asset: {
    id: "update_asset",
    name: "Update Asset",
    title: "Update Asset",
    subtitle: "Update an existing asset.",
    description: "Updates an existing asset based on the selected asset ID.",
    has_config_fields: true,

    pick_lists: {
      getAgentByGroupId: async (context: AppContext) => {
        context = {
          ...context,
          payload: {
            ...context.payload,
            config_fields: {
              ...context.payload.config_fields,
              module: "asset",
            },
          },
        };
        return getAgentByGroupId(context);
      },

      getAgentByDepartment: async (context: AppContext) => {
        context = {
          ...context,
          payload: {
            ...context.payload,
            config_fields: {
              ...context.payload.config_fields,
              module: "asset",
            },
          },
        };
        return getAgentByDepartment(context);
      },

      Assetsparent1dependent1,
      Assetsparent1dependent2,
      Assetsparent2dependent1,
      Assetsparent2dependent2,
      Assetsparent3dependent1,
      Assetsparent3dependent2,
      Assetsparent4dependent1,
      Assetsparent4dependent2,
      Assetsparent5dependent1,
      Assetsparent5dependent2,
      Assetsparent6dependent1,
      Assetsparent6dependent2,
    },

    // ✅ CONFIG FIELDS — SELECT ASSET FIRST
    config_fields: {
      fields: async (context: AppContext) => {
        const [types, workspaces] = await Promise.all([
          getAssetTypes(context),
          getAllFreshserviceData(context, "workspaces"),
        ]);
        return [
          {
            name: "asset_type_id",
            label: "Asset Type",
            type: "number",
            control_type: "select",
            pick_list: types,
            optional: false,
            hint: "Select the asset type to filter assets.",
          },
        ];
      },
    },

    // ✅ INPUT SCHEMA — UPDATE MODE
    input_schema: {
      fields: async (context: AppContext) => buildAssetInputSchema(context, "update"),
    },

    // ✅ OUTPUT SCHEMA — LOAD SELECTED ASSET
    output_schema: {
      fields: async (context: AppContext): Promise<any> => {
        const assetTypeId = context.payload.config_fields?.asset_type_id as any;
        const filter = `"asset_type_id:${assetTypeId}"`;
        const schema = await getOutputSchemaForm(
          context,
          `assets?include=type_fields&filter=${encodeURIComponent(filter)}`,
          "assets",
          "cannot fetch output fields"
        );
        if (schema?.error) {
          throw new Error(schema.error);
        }
        const data = GenerateSchema({
          attachments: [
            {
              attachment_url:
                "https://konnectify-desk.euc-attachments.freshservice.com/data/helpdesk/attachments/production/52064060441/original/sample.pdf?response-content-type=application/pdf&Expires=1765552354&Signature=DlrUZZGhA7dfCvn21xSje-lTUD5SCfkO9NcgeqGDkI~iJnnISejOlOob2e1ssop1qig9QGRWB24E1N~d7O5bMBOq~QV6fAfl2A4MQEngypbfVUTs~JTgattR8~tdGNo6R3xKEnUqe4MOJhdJHQ3Jw3o58aZ2pf3eGt8kHQ3V~kH2SdGGnYOBT~3DNr7TFpfKDFUaQqj7zKJR8SzdXalAx9evjR2Fl9LRqkfMHn7ac8YYufyk3Vp2hs-272u9b94sWxuhiJRWqY8B1Y6RYFZC-hP85IubX8jsDLVhstRHSIe0hMdoa~HLn0XBfMdvPaV~S0kNti24ylwiVqvkMZXSuA__&Key-Pair-Id=APKAIPHBXWY2KT5RCMPQ",
              canonical_url: "https://konnectify-desk.freshservice.com/helpdesk/attachments/52064060441",
              content_type: "application/pdf",
              created_at: "2025-12-09T13:39:15Z",
              has_access: true,
              id: 52064060441,
              name: "sample.pdf",
              size: 18810,
              updated_at: "2025-12-09T13:39:15Z",
            },
          ],
        });
        return [...schema, ...data, { name: "datafound", label: "Data Found", type: "boolean" }];
      },
    },

    // ✅ EXECUTION — PATCH EXISTING ASSET
    execute: async (context: AppContext): Promise<ExecutionPayload> => {
      try {
        const { asset_type_id } = context.payload.config_fields as any;
        const { asset_id, ...eventData } = context.payload.data as any;

        // ✅ Build UPDATE schema
        if (!asset_id) {
          return {
            statusCode: 404,
            data: { error: "Asset id is mandatory to update" },
          };
        }
        if (!asset_type_id) {
          return {
            statusCode: 404,
            data: { error: "Asset type id is mandatory to update" },
          };
        }
        const schema = await buildAssetInputSchema(context, "update");

        // ✅ Generate update-only payload
        const body = generateAssetPayload(schema, eventData);

        // ✅ Sanitize numeric IDs
        if (body.group_id) {
          if (body.group_id.toString().toLowerCase() === "none") {
            delete body.group_id;
          } else if (!isNaN(Number(body.group_id))) {
            body.group_id = Number(body.group_id);
          }
        }

        if (body.department_id) {
          if (body.department_id.toString().toLowerCase() === "none") {
            delete body.department_id;
          } else if (!isNaN(Number(body.department_id))) {
            body.department_id = Number(body.department_id);
          }
        }

        // //console.log("UPDATE PAYLOAD", JSON.stringify(body));

        const finalPayload = await Assignattchments(context, { ...body, asset_type_id });

        if (finalPayload?.statusCode > 210) {
          return {
            statusCode: finalPayload.statusCode,
            data: { error: finalPayload },
          };
        }

        // ✅ PATCH request instead of POST
        const result = await ApiCallWithAttachment(context, `assets/${asset_id}`, "PUT", finalPayload);

        const { statusCode, data } = result;

        if (statusCode >= 200 && statusCode < 300) {
          if (data?.asset?.attachments?.length) {
            const asset = data.asset;

            return {
              statusCode,
              data: {
                ...asset,
                attachment_ids: asset.attachments.map((a) => a.id),
                attachments_url: asset.attachments.map((a) => a.attachment_url).join(","),
                first_attachment_id: asset.attachments?.[0]?.id || null,
                stringified_attachments: JSON.stringify(asset.attachments),
              },
            };
          }

          return { statusCode, data: data.asset };
        }

        return {
          statusCode,
          data: {
            error: data?.message || "Failed to update asset.",
            details: data?.errors || null,
          },
        };
      } catch (error: any) {
        return handleActionError(error, context, "Update Asset");
      }
    },

    sample: {
      output: { id: 101, name: "MacBook Pro", asset_tag: "MBP-001-UPDATED" },
    },

    ...actionsAlloption,
  },

  // find_asset: {
  //   id: "find_asset",
  //   name: "Find Asset",
  //   title: "Find Asset",
  //   subtitle: "Find an asset by Display ID.",
  //   description: "Retrieves details of a specific asset.",
  //   config_fields: {
  //     fields: async (context: AppContext) => {
  //       const [types, workspaces] = await Promise.all([
  //         getAssetTypes(context),
  //         getAllFreshserviceData(context, "workspaces"),
  //       ]);
  //       return [
  //         {
  //           name: "asset_type_id",
  //           label: "Asset Type",
  //           type: "number",
  //           control_type: "select",
  //           pick_list: types,
  //           optional: false,
  //           hint: "Select the asset type to filter assets.",
  //         },
  //       ];
  //     },
  //   },
  //   input_schema: {
  //     fields: async () => [
  //       { name: "asset_id", label: "Asset Display ID", type: "number", control_type: "number", optional: false },
  //     ],
  //   },
  //   output_schema: {
  //     fields: async (context: AppContext): Promise<any> => {
  //       const assetTypeId = context.payload.config_fields?.asset_type_id as any;
  //       const filter = `"asset_type_id:${assetTypeId}"`;
  //       const schema = await getOutputSchemaForm(
  //         context,
  //         `assets?include=type_fields&filter=${encodeURIComponent(filter)}`,
  //         "assets",
  //         "cannot able to fetch output fields for mapping"
  //       );
  //       if (schema?.error) {
  //         throw new Error(schema.error || "cannot able to fetch output fields for mapping");
  //       }
  //       return [...schema, { name: "datafound", type: "boolean", label: "Data Found" }];
  //     },
  //   },
  //   execute: async (context: AppContext): Promise<ExecutionPayload> => {
  //     const { asset_id } = context.payload.data as any;
  //     if (!asset_id) return { statusCode: 200, data: { datafound: false } };
  //     try {
  //       const result = await makeApiCall(context, `assets/${asset_id}`, "GET");
  //       if (result.statusCode >= 200 && result.statusCode < 300 && result.data?.asset) {
  //         if (result.data?.asset?.attachments?.length) {
  //           const asset = result.data.asset;
  //           return {
  //             statusCode: result.statusCode,
  //             data: {
  //               ...asset,
  //               attachment_ids: asset.attachments.map((a) => a.id),
  //               attachments_url: asset.attachments.map((a) => a.attachment_url).join(","),
  //               first_attachment_id: asset.attachments?.[0]?.id || null,
  //               stringified_attachments: JSON.stringify(asset.attachments),
  //               datafound: true,
  //             },
  //           };
  //         }
  //         return { statusCode: 200, data: { ...result.data.asset, datafound: true } };
  //       }
  //       if (result?.statusCode === 404) return { statusCode: 200, data: { datafound: false } };
  //       return { statusCode: result.statusCode, data: { error: result.data, datafound: false } };
  //     } catch (error: any) {
  //       return handleActionError(error, context, "Find Asset");
  //     }
  //   },
  //   sample: {
  //     output: { id: 101, name: "Dell Monitor", datafound: true },
  //   },
  //   retry_on_response: [],
  //   retry_on_request: [],
  //   max_retries: 0,
  //   help: "",
  //   display_priority: 0,
  //   batch: false,
  //   batch_size: 0,
  //   bulk: false,
  //   deprecated: false,
  //   cursor_enabled: true,
  //   has_config_fields: true,
  // },
  find_asset: {
    id: "find_asset",
    name: "Find Asset",
    title: "Find Asset",
    subtitle: "Find an asset by ID or Name.",
    description: "Retrieves details of an asset using its unique ID or Name.",
    pick_lists: {},
    // -----------------------------
    // 1️⃣ Dynamic Config Fields
    // -----------------------------
    config_fields: {
      fields: async (context: AppContext): Promise<any> => {
        const assetTypes = await getAssetTypes(context);
        return [
          {
            name: "find",
            label: "Find By",
            type: "string",
            control_type: "select",
            optional: false,
            pick_list: [
              { label: "Asset Display ID", value: "id" },
              { label: "Asset Name", value: "name" },
            ],
            hint: "Choose how you want to look up this asset.",
          },
          {
            name: "asset_type_id",
            label: "Asset Type",
            type: "number",
            control_type: "select",
            pick_list: assetTypes,
            optional: false,
            hint: "Used to filter and generate correct output schema.",
          },
        ];
      },
    },

    // -----------------------------
    // 2️⃣ Dynamic Input Schema
    // -----------------------------
    input_schema: {
      fields: async (_context: Context) => {
        const findKey = _context.payload.config_fields?.find as string;
        // we dynamically construct the schema based on selected find method
        const schemaObject = { [findKey]: "string" };
        return GenerateSchema(schemaObject, [findKey]);
      },
    },

    // -----------------------------
    // 3️⃣ Output Schema (unchanged)
    // -----------------------------
    output_schema: {
      fields: async (context: AppContext): Promise<any> => {
        const assetTypeId = context.payload.config_fields?.asset_type_id as any;
        const filter = `"asset_type_id:${assetTypeId}"`;
        const schema = await getOutputSchemaForm(
          context,
          `assets?include=type_fields&filter=${encodeURIComponent(filter)}`,
          "assets",
          "cannot fetch output fields"
        );
        if (schema?.error) {
          throw new Error(schema.error);
        }
        const data = GenerateSchema({
          attachments: [
            {
              attachment_url:
                "https://konnectify-desk.euc-attachments.freshservice.com/data/helpdesk/attachments/production/52064060441/original/sample.pdf?response-content-type=application/pdf&Expires=1765552354&Signature=DlrUZZGhA7dfCvn21xSje-lTUD5SCfkO9NcgeqGDkI~iJnnISejOlOob2e1ssop1qig9QGRWB24E1N~d7O5bMBOq~QV6fAfl2A4MQEngypbfVUTs~JTgattR8~tdGNo6R3xKEnUqe4MOJhdJHQ3Jw3o58aZ2pf3eGt8kHQ3V~kH2SdGGnYOBT~3DNr7TFpfKDFUaQqj7zKJR8SzdXalAx9evjR2Fl9LRqkfMHn7ac8YYufyk3Vp2hs-272u9b94sWxuhiJRWqY8B1Y6RYFZC-hP85IubX8jsDLVhstRHSIe0hMdoa~HLn0XBfMdvPaV~S0kNti24ylwiVqvkMZXSuA__&Key-Pair-Id=APKAIPHBXWY2KT5RCMPQ",
              canonical_url: "https://konnectify-desk.freshservice.com/helpdesk/attachments/52064060441",
              content_type: "application/pdf",
              created_at: "2025-12-09T13:39:15Z",
              has_access: true,
              id: 52064060441,
              name: "sample.pdf",
              size: 18810,
              updated_at: "2025-12-09T13:39:15Z",
            },
          ],
        });
        return [...schema, ...data, { name: "datafound", label: "Data Found", type: "boolean" }];
      },
    },

    // -----------------------------
    // 4️⃣ Execute Logic
    // -----------------------------
    execute: async (context: AppContext): Promise<ExecutionPayload> => {
      const { find } = context.payload.config_fields as any;
      const input = context.payload.data as any;

      try {
        // ---------------------------
        // 🔍 FIND BY ID
        // ---------------------------
        if (find === "id") {
          const assetId = input.id as any;

          if (!assetId) {
            return { statusCode: 200, data: { datafound: false } };
          }

          const result = await makeApiCall(context, `assets/${assetId}`, "GET");

          if (result.statusCode === 404 || !result.data?.asset) {
            return { statusCode: 200, data: { datafound: false } };
          }

          return formatAssetResponse(result.data.asset, 200);
        }

        // ---------------------------
        // 🔍 FIND BY NAME → fetch latest updated asset
        // ---------------------------
        if (find === "name") {
          const assetName = input.name as string;

          if (!assetName) {
            return { statusCode: 200, data: { datafound: false } };
          }

          const allAssets: any[] = [];
          let page = 1;

          while (true) {
            const search = encodeURIComponent(`name:'${assetName}'`);
            const result = await makeApiCall(context, `assets?search="${search}"&page=${page}`, "GET");

            const assets = result?.data?.assets || [];

            // Stop pagination when no more records
            if (!assets.length) break;

            // Case-insensitive exact match
            const filtered = assets.filter((item) => item.name?.toLowerCase() === assetName.toLowerCase());

            allAssets.push(...filtered);

            // Freshservice default limit ~30 per page
            if (assets.length < 30) break;
            page++;
          }

          // No match found
          if (!allAssets.length) {
            return { statusCode: 200, data: { datafound: false } };
          }

          // Pick latest updated asset
          const latest = allAssets.sort(
            (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
          )[0];
          //  //console.log(latest);
          const finalResult = await makeApiCall(context, `assets/${latest.display_id}`, "GET");

          if (!finalResult?.data?.asset) {
            return { statusCode: 200, data: { datafound: false } };
          }

          return formatAssetResponse(finalResult.data.asset, 200);
        }

        return { statusCode: 200, data: { datafound: false } };
      } catch (err: any) {
        return handleActionError(err, context, "Find Asset");
      }
    },

    sample: {
      output: { id: 101, name: "Dell Monitor", datafound: true },
    },

    cursor_enabled: true,
    has_config_fields: true,
    retry_on_response: [],
    retry_on_request: [],
    max_retries: 0,
    help: "",
    display_priority: 0,
    batch: false,
    batch_size: 0,
    bulk: false,
    deprecated: false,
  },

  delete_asset: {
    id: "delete_asset",
    name: "Delete Asset",
    title: "Delete Asset",
    subtitle: "Permanently delete an asset.",
    description: "Deletes an asset from Freshservice.",
    pick_lists: {},
    input_schema: {
      fields: async () => [
        { name: "asset_id", label: "Asset Display ID", type: "number", control_type: "number", optional: false },
      ],
    },
    output_schema: {
      fields: async () => [
        { name: "success", type: "boolean", label: "Success" },
        { name: "message", type: "string", label: "Message" },
      ],
    },
    execute: async (context: AppContext): Promise<ExecutionPayload> => {
      const { asset_id } = context.payload.data;
      if (!asset_id) return { statusCode: 400, data: { error: "Asset ID is required." } };

      try {
        const result = await makeApiCall(context, `assets/${asset_id}`, "DELETE");
        if (result.statusCode >= 200 && result.statusCode < 300) {
          return { statusCode: 200, data: { success: true, message: "Asset deleted successfully." } };
        }
        if (result.statusCode === 404) {
          return { statusCode: 404, data: { success: false, message: "Asset not found." } };
        }
        return { statusCode: result.statusCode, data: { success: false, error: result.data } };
      } catch (error: any) {
        return handleActionError(error, context, "Delete Asset");
      }
    },
    sample: {
      output: { success: true, message: "Asset deleted successfully." },
    },
    retry_on_response: [],
    retry_on_request: [],
    max_retries: 0,
    help: "",
    display_priority: 0,
    batch: false,
    batch_size: 0,
    bulk: false,
    deprecated: false,
    cursor_enabled: true,
    has_config_fields: false,
    config_fields: {
      fields: async () => {
        return [];
      },
    },
  },
  restore_asset: {
    id: "restore_asset",
    name: "Restore Asset",
    title: "Restore Asset",
    subtitle: "Restore a deleted asset.",
    description: "Restores a previously deleted asset in Freshservice.",
    pick_lists: {},
    input_schema: {
      fields: async () => [
        {
          name: "asset_id",
          label: "Asset ID",
          type: "number",
          control_type: "number",
          optional: false,
        },
      ],
    },

    output_schema: {
      fields: async () => [
        { name: "success", type: "boolean", label: "Success" },
        { name: "id", type: "number", label: "Id" },
        { name: "message", type: "string", label: "Message" },
      ],
    },

    execute: async (context: AppContext): Promise<ExecutionPayload> => {
      const { asset_id } = context.payload.data;

      if (!asset_id) {
        return {
          statusCode: 400,
          data: { success: false, message: "Asset ID is required." },
        };
      }

      try {
        // ✅ RESTORE instead of DELETE
        const result = await makeApiCall(context, `assets/${asset_id}/restore`, "PUT");
        if (result.statusCode >= 200 && result.statusCode < 300) {
          //   //console.log(result);
          return {
            statusCode: 200,
            data: {
              success: true,
              id: asset_id,
              message: "Asset restored successfully.",
            },
          };
        }
        if (result.statusCode === 404) {
          return {
            statusCode: 404,
            data: {
              success: false,
              message: "Asset not found or already active.",
            },
          };
        }
        return {
          statusCode: result.statusCode,
          data: {
            success: false,
            error: result.data,
          },
        };
      } catch (error: any) {
        return handleActionError(error, context, "Restore Asset");
      }
    },

    sample: {
      output: { success: true, message: "Asset restored successfully." },
    },

    retry_on_response: [],
    retry_on_request: [],
    max_retries: 0,
    help: "",
    display_priority: 0,
    batch: false,
    batch_size: 0,
    bulk: false,
    deprecated: false,
    cursor_enabled: true,
    has_config_fields: false,
    config_fields: {
      fields: async () => [],
    },
  },
  search_asset: {
    id: "search_asset",
    name: "Search Asset",
    title: "Search Asset",
    subtitle: "Search for an asset in Freshservice.",
    description:
      "Search for assets using fields like name, asset tag, serial number, etc. Supports pagination to fetch all matching assets.",
    ...actionsAlloption,
    has_config_fields: false,
    pick_lists: {},
    config_fields: {
      fields: async () => [],
    },
    input_schema: {
      fields: async () => [
        {
          name: "name",
          label: "Name",
          type: "string",
          control_type: "text",
          optional: true,
          hint: "Display name of the asset.",
        },
        {
          name: "asset_tag",
          label: "Asset Tag",
          type: "string",
          control_type: "text",
          optional: true,
          hint: "Tag that is assigned to the asset.",
        },
        // {
        //   name: "serial_number",
        //   label: "Serial Number",
        //   type: "string",
        //   control_type: "text",
        //   optional: true,
        //   hint: "Serial number of the asset.",
        // },
        // {
        //   name: "mac_addresses",
        //   label: "MAC Addresses",
        //   type: "string",
        //   control_type: "text",
        //   optional: true,
        //   hint: "MAC Address of the asset.",
        // },
        // {
        //   name: "ip_addresses",
        //   label: "IP Addresses",
        //   type: "string",
        //   control_type: "text",
        //   optional: true,
        //   hint: "IP Address of the asset.",
        // },
        // {
        //   name: "uuid",
        //   label: "UUID",
        //   type: "string",
        //   control_type: "text",
        //   optional: true,
        //   hint: "UUID of the asset.",
        // },
        // {
        //   name: "item_id",
        //   label: "Item ID",
        //   type: "string",
        //   control_type: "text",
        //   optional: true,
        //   hint: "Item ID of the asset.",
        // },
        // {
        //   name: "imei_number",
        //   label: "IMEI Number",
        //   type: "string",
        //   control_type: "text",
        //   optional: true,
        //   hint: "IMEI number of the asset.",
        // },
        {
          name: "raw_query",
          label: "Raw Search Query",
          type: "string",
          control_type: "text",
          optional: true,
          hint: "Raw Lucene query if you need advanced filtering. Example: name:'dell'",
        },
      ],
    },
    output_schema: {
      fields: async (context: AppContext) => {
        try {
          // Attempt to get an accurate schema dynamically from an existing asset in the account
          const sample = await sampleDataForm(context, "assets?per_page=1", "assets");
          return GenerateSchema({ assets: [sample], count: 0, datafound: true });
        } catch (error) {
          throw new Error(error.message);
        }
      },
    },
    execute: async (context: AppContext): Promise<ExecutionPayload> => {
      try {
        const { name, asset_tag, serial_number, mac_addresses, ip_addresses, uuid, item_id, imei_number, raw_query } =
          context.payload.data as any;

        // Construct the query string
        let queryParts: string[] = [];
        if (name) queryParts.push(`name:'${name}'`);
        if (asset_tag) queryParts.push(`asset_tag:'${asset_tag}'`);
        if (serial_number) queryParts.push(`serial_number:'${serial_number}'`);
        if (mac_addresses) queryParts.push(`mac_addresses:'${mac_addresses}'`);
        if (ip_addresses) queryParts.push(`ip_addresses:'${ip_addresses}'`);
        if (uuid) queryParts.push(`uuid:'${uuid}'`);
        if (item_id) queryParts.push(`item_id:'${item_id}'`);
        if (imei_number) queryParts.push(`imei_number:'${imei_number}'`);
        if (raw_query) queryParts.push(raw_query);

        if (queryParts.length === 0) {
          return {
            statusCode: 400,
            data: { error: "Please provide at least one field to search by." },
          };
        }

        // Join parts using AND according to Lucene syntax rules
        const finalQuery = queryParts.join(" AND ");
        const encodedQuery = encodeURIComponent(`"${finalQuery}"`); // Must be double-quoted in the URL for search endpoints

        let page = 1;
        const allAssets: any[] = [];
        while (true) {
          const endpoint = `assets?search=${encodedQuery}&page=${page}`;
          const result = await makeApiCall(context, endpoint, "GET");

          // Handle API error
          if (result.statusCode >= 400) {
            if (page === 1) {
              return { statusCode: result.statusCode, data: { error: result.data, datafound: false } };
            }
            break; // Stop paginating and return what we have if later pages error
          }

          const assets = result.data?.assets || [];

          if (assets.length === 0) break;

          allAssets.push(...assets);

          // Freshservice paginates search results typically at 30 items per page
          if (assets.length < 30) break;
          page++;
        }

        return {
          statusCode: 200,
          data: {
            assets: allAssets,
            datafound: allAssets.length > 0,
            count: allAssets.length,
          },
        };
      } catch (error: any) {
        return handleActionError(error, context, "Search Asset");
      }
    },
    sample: {
      output: {
        assets: [
          {
            id: 12345,
            name: "Dell Inspiron",
            asset_tag: "DELL-001",
            serial_number: "ABCDEF123",
          },
        ],
        datafound: true,
      },
    },
  },
  // Departments Actions  ( Developed by Raja)
  create_department: {
    id: "create_department",
    name: "Create Department",
    title: "Create Department",
    subtitle: "Create a new Department in Freshservice.",
    description: "Creates a new Department with default and custom fields.",
    help: "This trigger polls a worksheet and fires for each new row. Use the 'Start With' field to skip a specific number of columns.",
    display_priority: 1,
    batch_size: 1,
    batch: false,
    bulk: false,
    pick_lists: {},
    deprecated: false,
    has_config_fields: false,
    cursor_enabled: true,
    config_fields: { fields: (_: AppContext) => Promise.reject("Function not implemented.") },
    input_schema: {
      fields: async (context: AppContext) => getDepartmentInputSchema(context, "create"),
    },

    output_schema: {
      fields: async (context: AppContext) => {
        return await getOutputSchema(
          context,
          "departments",
          "Create a Department in your account to generate the schema."
        );
      },
    },

    execute: async (context: AppContext): Promise<ExecutionPayload> => {
      try {
        const eventData = context.payload.data;
        removeEmpty(eventData);

        let payload = eventData;
        payload.domains = [eventData.domains];
        const result = await makeApiCall(context, "departments", "POST", payload);
        const { statusCode, data } = result;

        if (statusCode >= 200 && statusCode < 300) {
          // Return the 'department' object on success
          return { statusCode, data: data.department ?? data };
        }
        // Return a structured error response
        return {
          statusCode,
          data: {
            error: data,
          },
        };
      } catch (error: any) {
        return handleActionError(error, context, "Create Department");
      }
    },

    sample: {
      fields: async (context: AppContext) => {
        return await sampleData(context, "departments", "Create at least one department in your account.");
      },
    },
    retry_on_response: [],
    retry_on_request: [],
    max_retries: 0,
  },
  find_department: {
    id: "find_department",
    name: "Find Department",
    title: "Find Department",
    subtitle: "Find a department by their ID or Email",
    description: "Retrieves the details of a single department using either their unique ID or Name address.",
    help: "Retrieves the details of a single department using either their unique ID or Name address.",
    display_priority: 1,
    batch_size: 1,
    batch: false,
    bulk: false,
    deprecated: false,
    cursor_enabled: true,
    has_config_fields: true,
    pick_lists: {},
    config_fields: {
      fields: async (context: Context): Promise<any> => {
        return [
          {
            name: "find",
            label: "Find By",
            type: "string",
            control_type: "select",
            optional: false,
            pick_list: [
              { label: "ID", value: "id" },
              { label: "Name", value: "name" },
            ],
            hint: "Select whether to find the departments by their unique ID or Name address.",
          },
        ];
      },
    },

    // 📝 Dynamically generates the input field based on the user's choice above.
    input_schema: {
      fields: async function (_context: Context) {
        const findKey = _context.payload.config_fields?.find as string;
        const object = { [findKey]: "string" };
        return GenerateSchema(object, [findKey]);
      },
    },

    // 📤 Defines the expected output, including a helpful 'datafound' flag.
    output_schema: {
      fields: async (context: AppContext) => {
        const schema = await getOutputSchema(context, "departments", "Create a departments to see the output schema.");
        if (schema?.error) throw new Error(schema.error);
        return [
          ...schema,
          { name: "datafound", type: "boolean", label: "Data Found", control_type: "text", optional: false },
        ];
      },
    },

    // 🚀 The core logic that executes the search.
    execute: async (context: AppContext): Promise<ExecutionPayload> => {
      const { find } = context.payload.config_fields as { find: "id" | "name" };
      const value = context.payload.data[find] as any;
      if (!value) {
        return {
          data: {
            datafound: false,
          },
          statusCode: 200,
        };
      }
      let endpoint = "";
      let notFoundMessage = "";

      // Construct the correct API endpoint based on the chosen search method.
      if (find === "id") {
        endpoint = `departments/${value}`;
        notFoundMessage = `Department with ID '${value}' not found.`;
      } else {
        endpoint = `departments?query=name:'${value}'`;
        notFoundMessage = `Department with Name '${value}' not found.`;
      }
      try {
        const { statusCode, data } = await makeApiCall(context, endpoint, "GET");

        // Not Found Case: API returned 404 or an empty array for email search.
        if (find === "name" && data?.departments?.length === 0) {
          return { statusCode: 200, data: { datafound: false } };
        }

        if (statusCode >= 200 && statusCode < 300) {
          const department = find == "name" ? data?.departments?.[0] : data?.department;

          if (department) {
            return { statusCode: 200, data: { ...department, datafound: true } };
          }
        }
        // ❌ Error Case: Handle all other API errors.
        return {
          statusCode,
          data: {
            error: data?.message || "An unexpected error occurred.",
            details: data?.errors || null,
            datafound: false,
          },
        };
      } catch (error: any) {
        return handleActionError(error, context, "Find department");
      }
    },
    retry_on_response: [],
    retry_on_request: [],
    max_retries: 0,
    sample: function (context: AppContext): Promise<any> {
      throw new Error("Function not implemented.");
    },
  },
  update_department: {
    id: "update_department",
    name: "Update Department",
    title: "Update Department",
    subtitle: "Update an existing department by their ID.",
    description: "Updates an existing department's default and custom fields.",
    retry_on_response: [],
    retry_on_request: [],
    pick_lists: {},
    max_retries: 0,
    help: "Updates an existing department's default and custom fields.",
    display_priority: 0,
    batch: false,
    batch_size: 0,
    bulk: false,
    deprecated: false,
    cursor_enabled: true,
    has_config_fields: false,
    config_fields: { fields: (_: AppContext) => Promise.reject("Function not implemented.") },
    input_schema: {
      fields: async (context: AppContext) => getDepartmentInputSchema(context, "update"),
    },
    output_schema: {
      fields: async (context: AppContext) => {
        return await getOutputSchema(
          context,
          "departments",
          "Update a department in your account to generate the schema."
        );
      },
    },
    execute: async (context: AppContext): Promise<ExecutionPayload> => {
      try {
        const { id, ...eventData } = context.payload.data;
        delete eventData.id;
        if (!id) {
          return {
            statusCode: 400,
            data: { error: "Department ID is required for an update operation." },
          };
        }
        let payload = eventData;
        payload.domains = [eventData.domains];
        const result = await makeApiCall(context, `departments/${id}`, "PUT", payload);
        const { statusCode, data } = result;

        if (statusCode >= 200 && statusCode < 300) {
          return { statusCode, data: data.department };
        }

        return {
          statusCode,
          data: {
            error: data?.message || `Failed to update department ${id}.`,
            details: data?.errors || null,
          },
        };
      } catch (error: any) {
        return handleActionError(error, context, "Update department");
      }
    },
    sample: {
      fields: async (context: AppContext) => {
        return await sampleData(context, "departments", "Create at least one department in your account.");
      },
    },
  },
  // ==============================
  // Notes Actions. ( Developed by Raja)

  create_bulk_note_in_ticket: {
    id: "create_bulk_note_in_ticket",
    name: "Create Bulk Note in Ticket",
    title: "Create Bulk Note in Ticket",
    subtitle: "Add a bulk note to a ticket",
    description:
      "Adds a bulk note (conversation) to a specified ticket. The note can be marked as private and can notify specific email addresses.",
    ...actionsAlloption,
    help: "Create a bulk note in a ticket by providing the Ticket ID and the note content.",
    cursor_enabled: true,
    has_config_fields: false,
    pick_lists: {},
    config_fields: { fields: async () => [] },

    input_schema: {
      fields: async (): Promise<Field[]> => [
        {
          name: "ticket_id",
          label: "Ticket ID",
          type: "string",
          control_type: "text",
        },
        {
          name: "body",
          label: "Payload",
          control_type: "plain-text",
          type: "string",
          hint: "give the payload in array of object in the string format",
        },
        {
          name: "hasPrivate",
          label: "Private",
          type: "string",
          control_type: "text",

          optional: true,
          hint: "If true, the note will be private; if false, it will be public. Default is true.",
        },
      ],
    },

    output_schema: {
      fields: async () => {
        return GenerateSchema({ message: "", success: true, successCount: 0, failureCount: 0 });
      },
    },

    execute: async (context: AppContext): Promise<ExecutionPayload> => {
      const { ticket_id, body, hasPrivate } = context.payload.data as any;
      if (!ticket_id) {
        return {
          statusCode: 400,
          data: { error: "Ticket ID is required to add a note." },
        };
      }
      const payload: any = JSON.parse(body);
      if (payload.length == 0) {
        return {
          statusCode: 200,
          data: {
            message: "No conversation found.",
            success: true,
            successCount: 0,
            failureCount: 0,
          },
        };
      }

      async function delay(ms: any) {
        return new Promise((resolve) => setTimeout(resolve, ms));
      }

      let message = "All notes were created successfully.";
      let success = true;
      let successCount = 0;
      let failureCount = 0;

      async function createNoteWithRetry(objPayload: any) {
        const endpoint = `tickets/${ticket_id}/notes`;

        let payload: any = {
          body: objPayload.body,
        };
        if (hasPrivate && hasPrivate == false) {
          payload.private = false;
        }
        payload.private = true;

        if (objPayload.attachments.length > 0) {
          const urls = objPayload.attachments
            .map((item: any) => item.attachment_url)
            .filter((url: any) => !!url) // remove null/undefined
            .join(","); // join with comma

          payload.attachment = urls;
        }

        const finalPayload = await Assignattchments(context, payload);
        if (finalPayload?.statusCode > 210) {
          return {
            statusCode: finalPayload.statusCode,
            data: finalPayload,
          };
        }
        let attempt = 1;
        while (attempt <= 3) {
          const res = await ApiCallWithAttachment(context, endpoint, "POST", finalPayload);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            return res;
          }
          if (res.statusCode !== 429) {
            return res;
          }
          attempt++;
          if (attempt <= 3) {
            await delay(3000);
          }
        }
        return { statusCode: 429, message: "API Rate limit exceeded" };
      }

      // MAIN LOOP
      for (let i = 0; i < payload.length; i++) {
        const res = await createNoteWithRetry(payload[i]);
        if (res.statusCode == 429) {
          success = false;
          message = res.message || "API Rate limit exceeded";
          failureCount = payload.length - successCount;
          break;
        }
        if (res.statusCode >= 200 && res.statusCode < 300) {
          successCount++;
          continue;
        }
        failureCount = payload.length - successCount;
        success = false;
        message =
          res.message ||
          res.data.message ||
          JSON.stringify(res.error || res.data.errors || res.data.errors) ||
          `Failed at index ${i}`;
        break;
      }

      return {
        statusCode: 200,
        data: { success, message, successCount, failureCount },
      };
    },

    sample: { fields: async () => [] },
  },

  list_all_notes_in_ticket: {
    id: "list_all_notes_in_ticket",
    name: "List All Notes In Ticket",
    title: "List All Notes In Ticket",
    subtitle: "List All Notes In Ticket",
    description: "Lists all notes (conversations) associated with a specified ticket.",
    ...actionsAlloption,
    help: "List all notes in a ticket by providing the Ticket ID.",
    cursor_enabled: true,
    has_config_fields: false,
    pick_lists: {},
    config_fields: { fields: async () => [] },
    input_schema: {
      fields: async () => [
        {
          name: "ticket_id",
          label: "Ticket ID",
          type: "string",
          control_type: "text",
        },
      ],
    },
    output_schema: {
      fields: async () => {
        return GenerateSchema({ output: "", dataFound: true });
      },
    },

    execute: async (context: AppContext): Promise<ExecutionPayload> => {
      const { ticket_id } = context.payload.data as any;
      if (!ticket_id) {
        return {
          statusCode: 400,
          data: { error: "Ticket ID is required to get a notes.", dataFound: false },
        };
      }

      let nextPage = 1;
      let allConversations: any[] = [];

      while (true) {
        const endpoint = `tickets/${ticket_id}/conversations?page=${nextPage}`;
        const result = await makeApiCall(context, endpoint, "GET");
        const { statusCode, data } = result;
        if (statusCode !== 200) {
          const error = data?.message || data?.error || JSON.stringify(data);
          return {
            statusCode,
            data: { error: error, dataFound: false },
          };
        }
        // Append conversations from this page
        if (Array.isArray(data.conversations)) {
          allConversations = allConversations.concat(data.conversations);
        }
        // If no more pages → exit loop
        if (!data.meta || data.meta.has_more !== true) {
          break;
        }
        nextPage++;
      }

      const conversations = JSON.stringify(allConversations);
      return {
        data: { output: conversations, dataFound: true },
        statusCode: 200,
      };
    },
    sample: { fields: async () => {} },
  },

  // ==============================
  create_custom_object_record: {
    id: "create_custom_object_record",
    name: "Create Custom Object Record",
    title: "Create Custom Object Record",
    subtitle: "Create a new record in a specific Custom Object.",
    description: "Creates a new record with custom fields for the selected Custom Object.",

    // ⚙️ Config field to select the Custom Object
    ...actionsAlloption,
    pick_lists: {
      customparent1dependent1,
      customparent1dependent2,
      customparent2dependent1,
      customparent2dependent2,
      customparent3dependent1,
      customparent3dependent2,
      customparent4dependent1,
      customparent4dependent2,
      customparent5dependent1,
      customparent5dependent2,
      customparent6dependent1,
      customparent6dependent2,
    },
    has_config_fields: true,
    config_fields: {
      fields: async (context: AppContext) => {
        const allObject = await getAllCustomObject(context, "objects");
        return [
          {
            name: "object_id",
            label: "Custom Object",
            type: "number",
            control_type: "select",
            optional: false,
            pick_list: allObject, // Use registered picklist
            hint: "Select the Custom Object where the record will be created.",
          },
        ];
      },
    },

    // 📝 Dynamically generates the input form based on the selected object
    input_schema: {
      fields: async (context: AppContext) => buildCustomObjectSchema(context, "create"),
    },

    // 📤 Dynamically generates the output schema
    output_schema: {
      fields: async (context: AppContext) => {
        const objectId = context?.payload?.config_fields?.object_id;
        if (!objectId) {
          throw new Error("Select proper object id to retrive the schema");
        }
        return await getOutputSchemaCustom(
          context,
          `objects/${objectId}/records?page_size=1`,
          "records",
          "Update a record in the selected Custom Object to generate schema."
        );
      },
    },

    // 🚀 The core logic to create the record
    execute: async (context: AppContext): Promise<ExecutionPayload> => {
      const objectId = context.payload.config_fields?.object_id as string;
      if (!objectId) {
        return { statusCode: 400, data: { error: "Custom Object ID is missing from configuration." } };
      }

      try {
        const eventData = context.payload.data as any;
        const Input = await buildCustomObjectSchema(context, "create");
        const payload: any = generatePayload(Input, { ...eventData });
        const noramalizedEventdata = normalizeEventData(payload);
        //  //console.log(payload);
        const finalpayload = { data: noramalizedEventdata };
        const endpoint = `objects/${objectId}/records`;

        const result = await makeApiCall(context, endpoint, "POST", finalpayload);
        const { statusCode, data } = result;
        // //console.log(data);
        if (statusCode >= 200 && statusCode < 300) {
          // The response is usually { "record": {...} }
          return { statusCode, data: data.custom_object?.data || data };
        }

        return {
          statusCode,
          data: { error: data || "Failed to create custom object record.", details: data?.errors || null },
        };
      } catch (error: any) {
        return handleActionError(error, context, "Create Custom Object Record");
      }
    },

    sample: {
      output: {
        id: 123,
        created_at: "2025-10-31T18:00:00Z",
        updated_at: "2025-10-31T18:00:00Z",
        // ...other custom fields
      },
    },
  },

  update_custom_object_record: {
    id: "update_custom_object_record",
    name: "Update Custom Object Record",
    title: "Update Custom Object Record",
    subtitle: "Update an existing record in a specific Custom Object.",
    description: "Updates an existing record's custom fields in the selected Custom Object.",
    pick_lists: {
      customparent1dependent1,
      customparent1dependent2,
      customparent2dependent1,
      customparent2dependent2,
      customparent3dependent1,
      customparent3dependent2,
      customparent4dependent1,
      customparent4dependent2,
      customparent5dependent1,
      customparent5dependent2,
      customparent6dependent1,
      customparent6dependent2,
    },
    has_config_fields: true,
    config_fields: {
      fields: async (context: AppContext) => {
        const allObject = await getAllCustomObject(context, "objects");
        return [
          {
            name: "object_id",
            label: "Custom Object",
            type: "number",
            control_type: "select",
            optional: false,
            pick_list: allObject, // Use registered picklist
            hint: "Select the Custom Object where the record will be created.",
          },
        ];
      },
    },

    // 📝 Dynamically generates the input form (includes record_id)
    input_schema: {
      fields: async (context: AppContext) => buildCustomObjectSchema(context, "update"),
    },

    // 📤 Dynamically generates the output schema
    output_schema: {
      fields: async (context: AppContext) => {
        const objectId = context?.payload?.config_fields?.object_id;
        if (!objectId) {
          throw new Error("Select proper object id to retrive the schema");
        }
        return await getOutputSchemaCustom(
          context,
          `objects/${objectId}/records?page_size=1`,
          "records",
          "Update a record in the selected Custom Object to generate schema."
        );
      },
    },

    // 🚀 The core logic to update the record
    execute: async (context: AppContext): Promise<ExecutionPayload> => {
      const objectId = context.payload.config_fields?.object_id as string;
      const { record_id, ...eventData } = context.payload.data; // Extract record_id

      if (!objectId) {
        return { statusCode: 400, data: { error: "Custom Object ID is missing from configuration." } };
      }
      if (!record_id) {
        return { statusCode: 400, data: { error: "Record ID is required for update." } };
      }

      try {
        // Wrap the remaining fields in the "data" object
        //  //console.log(eventData);
        const taskFields = await buildCustomObjectSchema(context, "update");
        const payload: any = generatePayload(taskFields, { ...eventData });
        const noramalizedEventdata = normalizeEventData(payload);

        const finalpayload = { data: noramalizedEventdata };
        //  //console.log(finalpayload);
        const endpoint = `objects/${objectId}/records/${record_id}`;

        const result = await makeApiCall(context, endpoint, "PUT", finalpayload); // Use PUT for update
        const { statusCode, data } = result;
        if (statusCode >= 200 && statusCode < 300) {
          // The response is usually { "record": {...} }
          return { statusCode, data: data.custom_object?.data || data };
        }

        return {
          statusCode,
          data: { error: data || `Failed to update record ${record_id}.`, details: data?.errors || null },
        };
      } catch (error: any) {
        return handleActionError(error, context, "Update Custom Object Record");
      }
    },

    sample: {
      output: {
        id: 123,
        created_at: "2025-10-31T18:00:00Z",
        updated_at: "2025-10-31T18:05:00Z",
        // ...other custom fields
      },
    },
    ...actionsAlloption,
  },
  find_custom_object_record: {
    id: "find_custom_object_record",
    name: "Find Custom Object Record",
    title: "Find Custom Object Record",
    subtitle: "Find a specific record in a Custom Object by its Display ID.",
    description: "Retrieves a record from a Custom Object using its 'bo_display_id' (Record ID).",

    // ⚙️ Config field to select the Custom Object
    has_config_fields: true,
    pick_lists: {},
    config_fields: {
      fields: async (context: AppContext) => {
        const allObject = await getAllCustomObject(context, "objects");
        return [
          {
            name: "object_id",
            label: "Custom Object",
            type: "number",
            control_type: "select",
            optional: false,
            pick_list: allObject, // Use registered picklist
            hint: "Select the Custom Object where the record will be created.",
          },
        ];
      },
    },
    // 📝 Input schema requires the Record's Display ID
    input_schema: {
      fields: async () => [
        {
          name: "record_id",
          label: "Record ID (Display ID)",
          type: "number",
          control_type: "number",
          optional: false,
          hint: "Enter the 'bo_display_id' of the record (e.g., 11).",
        },
      ],
    },

    // 📤 Dynamically generates the output schema and adds 'datafound'
    output_schema: {
      fields: async (context: AppContext) => {
        const objectId = context?.payload?.config_fields?.object_id;
        if (!objectId) {
          throw new Error("Select proper object id to retrive the schema");
        }
        return await getOutputSchemaCustom(
          context,
          `objects/${objectId}/records?page_size=1`,
          "records",
          "Update a record in the selected Custom Object to generate schema."
        );
      },
    },

    // 🚀 The core logic to query for the record
    execute: async (context: AppContext): Promise<ExecutionPayload> => {
      const objectId = context.payload.config_fields?.object_id as string;
      const { record_id } = context.payload.data; // This is the bo_display_id

      if (!objectId) {
        return {
          statusCode: 400,
          data: { error: "Custom Object ID is missing from configuration.", datafound: false },
        };
      }
      if (!record_id) {
        return { statusCode: 400, data: { error: "Record ID (bo_display_id) is required.", datafound: false } };
      }

      try {
        // Construct the query as specified: query="bo_display_id : 11"
        const query = `bo_display_id : ${record_id}`;
        // The query string must be URL-encoded
        const endpoint = `objects/${objectId}/records?query=${encodeURIComponent(`${query}`)}`;

        const result = await makeApiCall(context, endpoint, "GET");
        const { statusCode, data } = result;

        // Successful API call
        if (statusCode >= 200 && statusCode < 300) {
          // Check if the 'records' array exists and has at least one item
          if (data?.records && Array.isArray(data.records) && data.records.length > 0) {
            // Return the first record found
            return { statusCode: 200, data: { ...data.records[0]?.data, datafound: true } };
          } else {
            return { statusCode: 200, data: { datafound: false } };
          }
        }

        // Handle 404 (e.g., Object ID not found)
        if (statusCode === 404) {
          return { statusCode: 200, data: { datafound: false } };
        }

        // Handle other errors
        return {
          statusCode,
          data: {
            error: data?.message || "Failed to find custom object record.",
            details: data?.errors || null,
            datafound: false,
          },
        };
      } catch (error: any) {
        const errorResult = handleActionError(error, context, "Find Custom Object Record");
        return { ...errorResult, data: { ...(errorResult.data as object), datafound: false } };
      }
    },

    sample: {
      output: {
        id: 123, // Internal Freshservice ID
        bo_display_id: 11, // The ID you searched for
        created_at: "2025-10-31T18:00:00Z",
        updated_at: "2025-10-31T18:00:00Z",
        // ...other custom fields
        datafound: true,
      },
    },
    retry_on_response: [],
    retry_on_request: [],
    max_retries: 0,
    help: "",
    display_priority: 0,
    batch: false,
    batch_size: 0,
    bulk: false,
    deprecated: false,
    cursor_enabled: true,
  },
  create_time_entry: {
    id: "create_time_entry",
    name: "Create Time Entry",
    title: "Create Time Entry",
    subtitle: "Log time against a Ticket, Problem, Change, or Release.",
    description: "Creates a new time entry linked to a parent Freshservice item.",

    has_config_fields: true,
    config_fields: {
      fields: async () => [
        {
          name: "module",
          label: "Parent Module",
          type: "string",
          control_type: "select",
          optional: false,
          pick_list: getTimeEntryModulePicklist(), // Use helper function
          hint: "Select the type of item this time entry belongs to.",
        },
      ],
    },
    ...actionsAlloption,
    input_schema: {
      fields: async (context: AppContext) => buildTimeSheetInputSchema(context, "create"),
    },

    output_schema: {
      fields: async (context: AppContext) => {
        const sampleTask = {
          id: 52002521215,
          created_at: "2025-11-03T13:25:56Z",
          updated_at: "2025-11-03T13:25:56Z",
          start_time: "2025-11-03T13:25:56Z",
          timer_running: false,
          billable: true,
          time_spent: "02:15",
          executed_at: "2025-11-03T11:30:00Z",
          task_id: 2753,
          workspace_id: 2,
          note: "Completed post-deployment verification for release v2.1. No further issues found.",
          agent_id: 52003353587,
          custom_fields: {},
        };

        const fields = await makeApiCall(context, `time_sheet_fields`, "GET");
        if (fields.statusCode > 210) {
          throw new Error(
            fields.data ? JSON.stringify(fields.data) : "Cannot fetch output schema,some thing went wrong"
          );
        }
        const schemaFields = fields.data?.time_sheet_fields;
        const custom_fields = schemaFields
          .filter((item) => item.is_default_field === false)
          .reduce((acc, value) => {
            // //console.log(value);
            acc[value.name] = makeDublicateValue(value.field_type);
            return acc;
          }, {});
        //  //console.log(custom_fields);
        return GenerateSchema({ ...sampleTask, custom_fields: custom_fields });
      },
    },

    execute: async (context: AppContext): Promise<ExecutionPayload> => {
      const { module } = context.payload.config_fields as { module: string };
      const { module_id, ...eventData } = context.payload.data;

      if (!module || !module_id) {
        return { statusCode: 400, data: { error: "Parent Module and Module ID are required." } };
      }

      // Optional: Check if parent module exists
      try {
        // if (payload.group_id) {
        //   if (payload.group_id.toString().toLowerCase() === "none") {
        //     delete payload.group_id;
        //   } else if (!isNaN(Number(payload.group_id))) {
        //     payload.group_id = Number(payload.group_id);
        //   }
        // }
        const check = await makeApiCall(context, `${module}/${module_id}`, "GET");
        if (check.statusCode >= 400) throw new Error(`Parent ${module} with ID ${module_id} not found.`);
      } catch (e: any) {
        return handleActionError(e, context, `Verifying Parent ${module}`);
      }

      try {
        const taskFields = await buildTimeSheetInputSchema(context, "create");
        const payload: any = generatePayload(taskFields, { ...eventData });
        //  //console.log(payload);
        const endpoint = `${module}/${module_id}/time_entries`;

        const result = await makeApiCall(context, endpoint, "POST", payload);
        const { statusCode, data } = result;

        if (statusCode >= 200 && statusCode < 300) {
          return { statusCode, data: data.time_entry }; // Expect 'time_entry' object
        }

        return {
          statusCode,
          data: { error: data },
        };
      } catch (error: any) {
        return handleActionError(error, context, "Create Time Entry");
      }
    },
    pick_lists: {
      getModuleGroups,
      getAgentByGroupId,
    },
    sample: {
      output: { id: 1, time_spent: "01:30", note: "Looked into issue." },
    },
  },

  update_time_entry: {
    id: "update_time_entry",
    name: "Update Time Entry",
    title: "Update Time Entry",
    subtitle: "Update an existing time entry.",
    description: "Updates an existing time entry on a Ticket, Problem, Change, or Release.",

    has_config_fields: true,
    config_fields: {
      fields: async () => [
        {
          name: "module",
          label: "Parent Module",
          type: "string",
          control_type: "select",
          optional: false,
          pick_list: getTimeEntryModulePicklist(),
          hint: "Select the type of item this time entry belongs to.",
        },
      ],
    },

    input_schema: {
      fields: async (context: AppContext) => buildTimeSheetInputSchema(context, "update"),
    },

    output_schema: {
      fields: async (context: AppContext) => {
        const sampleTask = {
          id: 52002521215,
          created_at: "2025-11-03T13:25:56Z",
          updated_at: "2025-11-03T13:25:56Z",
          start_time: "2025-11-03T13:25:56Z",
          timer_running: false,
          billable: true,
          time_spent: "02:15",
          executed_at: "2025-11-03T11:30:00Z",
          task_id: 2753,
          workspace_id: 2,
          note: "Completed post-deployment verification for release v2.1. No further issues found.",
          agent_id: 52003353587,
          custom_fields: {},
        };

        const fields = await makeApiCall(context, `time_sheet_fields`, "GET");
        if (fields.statusCode > 210) {
          throw new Error(
            fields.data ? JSON.stringify(fields.data) : "Cannot fetch output schema,some thing went wrong"
          );
        }
        const schemaFields = fields.data?.time_sheet_fields;
        const custom_fields = schemaFields
          .filter((item) => item.is_default_field === false)
          .reduce((acc, value) => {
            //     //console.log(value);
            acc[value.name] = makeDublicateValue(value.field_type);
            return acc;
          }, {});
        //  //console.log(custom_fields);
        return GenerateSchema({ ...sampleTask, custom_fields: custom_fields });
      },
    },

    execute: async (context: AppContext): Promise<ExecutionPayload> => {
      const { module } = context.payload.config_fields as { module: string };
      const { module_id, time_entry_id, ...eventData } = context.payload.data; // Extract IDs

      if (!module || !module_id || !time_entry_id) {
        return { statusCode: 400, data: { error: "Parent Module, Module ID, and Time Entry ID are required." } };
      }

      // Optional: Check if parent module exists
      try {
        const check = await makeApiCall(context, `${module}/${module_id}`, "GET");
        if (check.statusCode >= 400) {
          return {
            statusCode: 404,
            data: {
              error: check?.data ? check.data : "Some thing went wrong",
            },
          };
        }
      } catch (e: any) {
        return handleActionError(e, context, `Verifying Parent ${module}`);
      }

      try {
        const taskFields = await buildTimeSheetInputSchema(context, "update");
        const payload: any = generatePayload(taskFields, { ...eventData });
        const endpoint = `${module}/${module_id}/time_entries/${time_entry_id}`; // Target specific time entry

        const result = await makeApiCall(context, endpoint, "PUT", payload);
        const { statusCode, data } = result;

        if (statusCode >= 200 && statusCode < 300) {
          return { statusCode, data: data.time_entry }; // Expect 'time_entry' object
        }

        return {
          statusCode,
          data: {
            error: data,
          },
        };
      } catch (error: any) {
        return handleActionError(error, context, "Update Time Entry");
      }
    },
    pick_lists: {
      getModuleGroups,
      getAgentByGroupId,
    },
    sample: {
      output: { id: 1, time_spent: "02:00", note: "Updated note." },
    },
    ...actionsAlloption,
  },

  find_time_entry: {
    id: "find_time_entry",
    name: "Find Time Entry",
    title: "Find Time Entry",
    subtitle: "Find a specific time entry by its ID.",
    description: "Retrieves the details of a single time entry from a specific parent item.",
    has_config_fields: true,
    pick_lists: {},
    config_fields: {
      fields: async () => [
        {
          name: "module",
          label: "Parent Module",
          type: "string",
          control_type: "select",
          optional: false,
          pick_list: getTimeEntryModulePicklist(),
          hint: "Select the type of item the time entry belongs to.",
        },
      ],
    },
    input_schema: {
      fields: async (context: AppContext) => getFindDeleteTimeEntryInputSchema(context),
    },
    output_schema: {
      fields: async (context: AppContext) => {
        const sampleTask = {
          id: 52002521215,
          created_at: "2025-11-03T13:25:56Z",
          updated_at: "2025-11-03T13:25:56Z",
          start_time: "2025-11-03T13:25:56Z",
          timer_running: false,
          billable: true,
          time_spent: "02:15",
          executed_at: "2025-11-03T11:30:00Z",
          task_id: 2753,
          workspace_id: 2,
          note: "Completed post-deployment verification for release v2.1. No further issues found.",
          agent_id: 52003353587,
          custom_fields: {},
          datafound: true,
        };

        const fields = await makeApiCall(context, `time_sheet_fields`, "GET");
        if (fields.statusCode > 210) {
          throw new Error(
            fields.data ? JSON.stringify(fields.data) : "Cannot fetch output schema,some thing went wrong"
          );
        }
        const schemaFields = fields.data?.time_sheet_fields;
        const custom_fields = schemaFields
          .filter((item) => item.is_default_field === false)
          .reduce((acc, value) => {
            //  //console.log(value);
            acc[value.name] = makeDublicateValue(value.field_type);
            return acc;
          }, {});
        // //console.log(custom_fields);
        return GenerateSchema({ ...sampleTask, custom_fields: custom_fields });
      },
    },

    execute: async (context: AppContext): Promise<ExecutionPayload> => {
      const { module } = context.payload.config_fields as { module: string };
      const { module_id, entry_id } = context.payload.data;

      if (!module || !module_id || !entry_id) {
        return {
          statusCode: 400,
          data: { datafound: false },
        };
      }

      const endpoint = `${module}/${module_id}/time_entries/${entry_id}`;

      try {
        const result = await makeApiCall(context, endpoint, "GET");
        const { statusCode, data } = result;

        if (statusCode >= 200 && statusCode < 300 && data?.time_entry) {
          return { statusCode, data: { ...data.time_entry, datafound: true } };
        }

        if (statusCode === 404) {
          return { statusCode: 200, data: { datafound: false } };
        }

        return {
          statusCode,
          data: {
            error: data?.message || "Failed to find time entry.",
            details: data?.errors || null,
            datafound: false,
          },
        };
      } catch (error: any) {
        const errorResult = handleActionError(error, context, "Find Time Entry");
        return { ...errorResult, data: { ...(errorResult.data as object), datafound: false } };
      }
    },
    sample: {
      output: { id: 1, time_spent: "01:30", datafound: true },
    },
    retry_on_response: [],
    retry_on_request: [],
    max_retries: 0,
    help: "",
    display_priority: 0,
    batch: false,
    batch_size: 0,
    bulk: false,
    deprecated: false,
    cursor_enabled: true,
  },

  delete_time_entry: {
    id: "delete_time_entry",
    name: "Delete Time Entry",
    title: "Delete Time Entry",
    subtitle: "Delete a specific time entry by its ID.",
    description: "Permanently deletes a time entry from a specific parent item.",
    has_config_fields: true,
    pick_lists: {},
    config_fields: {
      fields: async () => [
        {
          name: "module",
          label: "Parent Module",
          type: "string",
          control_type: "select",
          optional: false,
          pick_list: getTimeEntryModulePicklist(),
          hint: "Select the type of item the time entry belongs to.",
        },
      ],
    },

    input_schema: {
      fields: async (context: AppContext) => getFindDeleteTimeEntryInputSchema(context),
    },

    output_schema: {
      fields: async () => [
        { name: "success", label: "Success", type: "boolean" },
        { name: "message", label: "Message", type: "string", optional: true },
        { name: "error", label: "Error", type: "string", optional: true },
      ],
    },

    execute: async (context: AppContext): Promise<ExecutionPayload> => {
      const { module } = context.payload.config_fields as { module: string };
      const { module_id, entry_id } = context.payload.data;

      if (!module || !module_id || !entry_id) {
        return {
          statusCode: 400,
          data: { success: false, error: "Parent Module, Module ID, and Time Entry ID are required." },
        };
      }

      const endpoint = `${module}/${module_id}/time_entries/${entry_id}`;

      try {
        const result = await makeApiCall(context, endpoint, "DELETE");
        const { statusCode, data } = result;

        if (statusCode >= 200 && statusCode < 300) {
          // Typically 204
          return { statusCode: 200, data: { success: true, message: `Time Entry ${entry_id} deleted successfully.` } };
        }

        if (statusCode === 404) {
          return {
            statusCode: 404,
            data: { success: false, error: `Time Entry ${entry_id} not found for ${module} ${module_id}.` },
          };
        }

        return {
          statusCode,
          data: {
            success: false,
            error: data?.message || "Failed to delete time entry.",
            details: data?.errors || null,
          },
        };
      } catch (error: any) {
        return handleActionError(error, context, "Delete Time Entry");
      }
    },
    sample: {
      output: { success: true, message: "Time Entry 1 deleted successfully." },
    },
    retry_on_response: [],
    retry_on_request: [],
    max_retries: 0,
    help: "",
    display_priority: 0,
    batch: false,
    batch_size: 0,
    bulk: false,
    deprecated: false,
    cursor_enabled: true,
  },
  create_contract: {
    id: "create_contract",
    name: "Create Contract",
    title: "Create Contract",
    subtitle: "Create a new contract record in Freshservice.",
    description: "Creates a new contract with details like vendor, cost, dates, and custom fields.",

    // Config field to select workspace and type
    pick_lists: {
      // Register release-specific nested field functions
      getAgentByGroupId: async (context: AppContext) => {
        context = {
          ...context,
          payload: {
            ...context.payload,
            config_fields: {
              ...context.payload.config_fields,
              module: "contract",
            },
          },
        };
        return getAgentByGroupId(context);
      },
    },
    has_config_fields: true,
    config_fields: {
      fields: async (context: AppContext) => {
        const [workspaces, contracts] = await Promise.all([
          getAllFreshserviceData(context, "workspaces"),
          getAllFreshserviceData(context, "contract_types"),
        ]);
        return [
          {
            name: "contract_type_id",
            pick_list: contracts,
            label: "Contract Type",
            optional: false,
            type: "number",
            control_type: "select",
            hint: "Select the contract type",
          },
          {
            name: "workspace_id",
            pick_list: workspaces,
            label: "Workspace",
            optional: false,
            type: "number",
            control_type: "select",
            hint: "Select the workspace where the release will be created.",
          },
        ];
      },
    },

    // Dynamic input schema for contract creation
    input_schema: {
      fields: async (context: AppContext) => {
        return await buildContractInputSchema(context, "create");
      },
    },

    // Output schema for created contract
    output_schema: {
      fields: async (context: AppContext) => {
        return await getOutputSchemaForm(context, "contracts", "contracts");
      },
    },

    // Execution logic
    execute: async (context: AppContext): Promise<ExecutionPayload> => {
      const { workspace_id, contract_type_id } = context.payload.config_fields as any;
      const eventData = context.payload.data;
      try {
        const contractFields = await buildContractInputSchema(context, "create");
        //   //console.log(contractFields);
        const payload: any = generatePayload(contractFields, { ...eventData, contract_type_id, workspace_id });
        // Handle special case for vendor_id or dropdowns
        const body = removeEmpty(payload);
        if (body.visible_to_id) {
          if (body.visible_to_id.toString().toLowerCase() === "none") {
            delete body.visible_to_id;
          } else if (!isNaN(Number(body.visible_to_id))) {
            body.visible_to_id = Number(body.visible_to_id);
          }
        }
        const finalPayload = await Assignattchments(context, body);
        if (finalPayload?.statusCode > 210) {
          return {
            statusCode: finalPayload.statusCode,
            data: {
              error: finalPayload,
            },
          };
        }
        //console.log("finalPayload", finalPayload);
        const endpoint = "contracts";
        const result = await ApiCallWithAttachment(context, endpoint, "POST", finalPayload);
        const { statusCode, data } = result;

        if (statusCode >= 200 && statusCode < 300) {
          if (data?.contract?.attachments && data?.contract?.attachments?.length) {
            const contract = result?.data?.contract as any;
            const attachments_url =
              contract?.attachments && contract?.attachments.length
                ? contract.attachments.map((item) => item.attachment_url).join(",")
                : [];
            const attachment_ids =
              contract?.attachments && contract?.attachments.length ? contract.attachments.map((item) => item.id) : [];
            const first_attachment_id = contract?.attachments.length ? contract.attachments[0]?.id : null;
            return { statusCode, data: { ...contract, attachment_ids, attachments_url, first_attachment_id } };
          }
          return { statusCode, data: data.contract };
        }

        return {
          statusCode,
          data: { error: data?.message || "Failed to create contract.", details: data?.errors || null },
        };
      } catch (error: any) {
        return handleActionError(error, context, "Create Contract");
      }
    },

    sample: {
      output: { id: 10001, name: "Vendor Agreement - FY2025", status: "Active" },
    },
    ...actionsAlloption,
  },
  find_contract: {
    id: "find_contract",
    name: "Find Contract",
    title: "Find Contract by ID",
    subtitle: "Find a specific contract by its ID",
    description: "Retrieves the complete details of a single contract using its unique ID.",
    pick_lists: {},
    // Input schema requires Contract ID
    input_schema: {
      fields: async (): Promise<any> => [
        { name: "id", label: "Contract ID", type: "number", control_type: "text", optional: false },
      ],
    },

    // Output schema targets 'contracts' endpoint
    output_schema: {
      fields: async (context: AppContext) => {
        try {
          const schema = await getOutputSchemaForm(
            context,
            "contracts",
            "contracts",
            "Create a contract in your account to generate the schema."
          );
          if (schema.error) {
            throw new Error(schema.error);
          }
          return [
            ...schema,
            { name: "dataFound", type: "boolean", label: "Data Found", control_type: "text", optional: false },
          ];
        } catch (error: any) {
          throw new Error(error.message || "Unexpected error while building output schema.");
        }
      },
    },

    // Execution logic targets 'contracts/{id}' endpoint
    execute: async (context: AppContext): Promise<ExecutionPayload> => {
      const { id } = context.payload.data;
      if (!id) {
        return { statusCode: 200, data: { dataFound: false } };
      }

      try {
        const result = await makeApiCall(context, `contracts/${id}`, "GET");
        const { statusCode, data } = result;

        if (statusCode >= 200 && statusCode < 300 && data?.contract) {
          const contract = data.contract as any;

          // Extract attachment-related info if available
          const attachments_url = contract?.attachments?.map((item: any) => item.attachment_url).join(",") || null;
          const attachment_ids = contract?.attachments?.map((item: any) => item.id) || [];
          const first_attachment_id = contract?.attachments?.[0]?.id || null;

          return {
            statusCode,
            data: {
              ...contract,
              attachments_url,
              attachment_ids,
              first_attachment_id,
              dataFound: true,
            },
          };
        }

        if (statusCode === 404 || statusCode === 204) {
          return { statusCode: 200, data: { dataFound: false } };
        }

        // Handle known error responses
        if ([400, 422].includes(statusCode)) {
          const message = data?.message || data?.error?.message || "Invalid request.";
          return { statusCode, data: { error: message, dataFound: false } };
        }
        if ([401, 403].includes(statusCode)) {
          const message = data?.message || "Authentication failed or access denied.";
          return { statusCode, data: { error: message, dataFound: false } };
        }
        if (statusCode >= 500) {
          const message = data?.message || "Internal server error occurred.";
          return { statusCode, data: { error: message, dataFound: false } };
        }

        return {
          statusCode,
          data: { error: `Unexpected API response (${statusCode}).`, dataFound: false },
        };
      } catch (err: any) {
        const errorResult = handleActionError(err, context, "Find Contract");
        return { ...errorResult, data: { ...(errorResult.data as object), dataFound: false } };
      }
    },

    // Standard action properties
    retry_on_response: [],
    retry_on_request: [],
    max_retries: 0,
    help: "",
    display_priority: 0,
    batch: false,
    batch_size: 0,
    bulk: false,
    deprecated: false,
    cursor_enabled: true,
    has_config_fields: false,
    config_fields: { fields: async () => [] },

    // Sample output
    sample: {
      output: {
        id: 456,
        name: "Enterprise Software License Agreement",
        description: "Annual renewal contract for SaaS subscription services.",
        vendor_id: "52000061154",
        cost: 120000,
        start_date: "2025-11-01",
        end_date: "2026-10-31",
        auto_renew: true,
        notify_expiry: true,
        attachments_url: "url1,url2",
        attachment_ids: [111, 222],
        first_attachment_id: 111,
        dataFound: true,
      },
    },
  },
  update_contract: {
    id: "update_contract",
    name: "Update Contract",
    title: "Update Contract",
    subtitle: "Update an existing contract record in Freshservice.",
    description: "Updates a contract with new details such as vendor, cost, dates, or custom fields.",

    // Reuse pick list registration for dependent fields
    pick_lists: {
      getAgentByGroupId: async (context: AppContext) => {
        context = {
          ...context,
          payload: {
            ...context.payload,
            config_fields: {
              ...context.payload.config_fields,
              module: "contract",
            },
          },
        };
        return getAgentByGroupId(context);
      },
    },

    has_config_fields: true,
    config_fields: {
      fields: async (context: AppContext) => {
        const [workspaces, contracts] = await Promise.all([
          getAllFreshserviceData(context, "workspaces"),
          getAllFreshserviceData(context, "contract_types"),
        ]);
        return [
          {
            name: "contract_type_id",
            pick_list: contracts,
            label: "Contract Type",
            optional: false,
            type: "number",
            control_type: "select",
            hint: "Select the contract type to update.",
          },
          {
            name: "workspace_id",
            pick_list: workspaces,
            label: "Workspace",
            optional: false,
            type: "number",
            control_type: "select",
            hint: "Select the workspace where the contract exists.",
          },
        ];
      },
    },

    // Input schema: same fields as create, but require contract ID
    input_schema: {
      fields: async (context: AppContext) => {
        const baseFields = await buildContractInputSchema(context, "update");
        return baseFields;
      },
    },

    // Output schema identical to create
    output_schema: {
      fields: async (context: AppContext) => {
        return await getOutputSchemaForm(context, "contracts", "contracts");
      },
    },

    // Main execution logic
    execute: async (context: AppContext): Promise<ExecutionPayload> => {
      const { workspace_id, contract_type_id } = context.payload.config_fields as any;
      const { contract_id, ...eventData } = context.payload.data;

      if (!contract_id) {
        return { statusCode: 400, data: { error: "Contract ID is required for update." } };
      }

      try {
        const contractFields = await buildContractInputSchema(context, "update");
        const payload: any = generatePayload(contractFields, { ...eventData, contract_type_id });

        const body = removeEmpty(payload);
        // Handle visible_to_id cleanup
        if (body.visible_to_id) {
          if (body.visible_to_id.toString().toLowerCase() === "none") {
            delete body.visible_to_id;
          } else if (!isNaN(Number(body.visible_to_id))) {
            body.visible_to_id = Number(body.visible_to_id);
          }
        }
        //console.log(body);
        const finalPayload = await Assignattchments(context, body);
        //console.log(finalPayload);
        if (finalPayload?.statusCode > 210) {
          return {
            statusCode: finalPayload.statusCode,
            data: { error: finalPayload },
          };
        }
        const endpoint = `contracts/${contract_id}`;
        const result = await ApiCallWithAttachment(context, endpoint, "PUT", finalPayload);
        const { statusCode, data } = result;

        if (statusCode >= 200 && statusCode < 300) {
          if (data?.contract?.attachments?.length) {
            const contract = result?.data?.contract as any;
            const attachments_url = contract.attachments.map((i: any) => i.attachment_url).join(",");
            const attachment_ids = contract.attachments.map((i: any) => i.id);
            const first_attachment_id = contract.attachments[0]?.id || null;

            return {
              statusCode,
              data: { ...contract, attachment_ids, attachments_url, first_attachment_id },
            };
          }
          return { statusCode, data: data.contract };
        }

        return {
          statusCode,
          data: { error: data?.message || "Failed to update contract.", details: data?.errors || null },
        };
      } catch (error: any) {
        return handleActionError(error, context, "Update Contract");
      }
    },

    sample: {
      output: {
        id: 10001,
        name: "Vendor Agreement - FY2025",
        status: "Active",
        updated_at: "2025-11-03T10:00:00Z",
      },
    },
    ...actionsAlloption,
  },
  approve_contract: {
    id: "approve_contract",
    name: "Approve Contract",
    title: "Approve Contract",
    subtitle: "Approves a specific contract by its ID.",
    description: "Marks a contract as approved using its unique ID.",
    // 📝 Input: Just the Contract ID
    input_schema: {
      fields: async () => [
        {
          name: "contract_id",
          label: "Contract ID",
          type: "number",
          control_type: "number",
          optional: false,
          hint: "The unique ID of the contract to approve.",
        },
      ],
    },

    // 📤 Output: A simple success status
    output_schema: {
      fields: async () => [
        { name: "success", label: "Success", type: "boolean" },
        { name: "message", label: "Message", type: "string", optional: true },
      ],
    },

    // 🚀 Execution: Calls the approve operation endpoint
    execute: async (context: AppContext): Promise<ExecutionPayload> => {
      const { contract_id } = context.payload.data;

      if (!contract_id) {
        return {
          statusCode: 400,
          data: { success: false, error: "Contract ID is required." },
        };
      }

      // The operation is part of the URL, and it's changing state, so PUT is appropriate.
      const endpoint = `contracts/${contract_id}?operation=approve`;

      try {
        // Using PUT as this operation modifies the state of the contract.
        const result = await makeApiCall(context, endpoint, "PUT"); // No body needed for approve
        const { statusCode, data } = result;

        if (statusCode >= 200 && statusCode < 300) {
          return {
            statusCode: 200,
            data: { success: true, message: `Contract ${contract_id} approved successfully.` },
          };
        }

        // Handle specific errors like 404 Not Found
        if (statusCode === 404) {
          return { statusCode: 404, data: { success: false, error: `Contract ${contract_id} not found.` } };
        }

        // Handle other API errors
        return {
          statusCode,
          data: {
            success: false,
            error: data?.message || `Failed to approve contract ${contract_id}.`,
            details: data?.errors || null,
          },
        };
      } catch (error: any) {
        return handleActionError(error, context, "Approve Contract");
      }
    },
    pick_lists: {},
    sample: {
      output: {
        success: true,
        message: "Contract 123 approved successfully.",
      },
    },
    retry_on_response: [],
    retry_on_request: [],
    max_retries: 0,
    help: "",
    display_priority: 0,
    batch: false,
    batch_size: 0,
    bulk: false,
    deprecated: false,
    cursor_enabled: true,
    has_config_fields: false,
    config_fields: {
      fields: async () => [],
    },
  },

  // reject_contract: {
  //   id: "reject_contract",
  //   name: "Reject Contract",
  //   title: "Reject Contract",
  //   subtitle: "Rejects a specific contract by its ID.",
  //   description: "Marks a contract as rejected, optionally providing a reason.",
  //   // 📝 Input: Contract ID and a reason for rejection
  //   input_schema: {
  //     fields: async () => [
  //       {
  //         name: "contract_id",
  //         label: "Contract ID",
  //         type: "number",
  //         control_type: "number",
  //         optional: false,
  //         hint: "The unique ID of the contract to reject.",
  //       },
  //       {
  //         name: "reason", // Assuming 'reason' is the field from rejectInput()
  //         label: "Reason for Rejection",
  //         type: "string",
  //         control_type: "text-area",
  //         optional: true, // Making reason optional
  //         hint: "Provide a reason for rejecting this contract.",
  //       },
  //     ],
  //   },
  //   pick_lists: {},
  //   // 📤 Output: A simple success status
  //   output_schema: {
  //     fields: async () => [
  //       { name: "success", label: "Success", type: "boolean" },
  //       { name: "message", label: "Message", type: "string", optional: true },
  //       { name: "error", label: "Error", type: "string", optional: true },
  //     ],
  //   },

  //   // 🚀 Execution: Calls the reject operation endpoint with a reason in the body
  //   execute: async (context: AppContext): Promise<ExecutionPayload> => {
  //     const { contract_id, ...eventData } = context.payload.data;

  //     if (!contract_id) {
  //       return {
  //         statusCode: 400,
  //         data: { success: false, error: "Contract ID is required." },
  //       };
  //     }

  //     const endpoint = `contracts/${contract_id}?operation=reject`;
  //     // The NestJS code passes the remaining eventData as the body.
  //     try {
  //       // Using PUT as this operation modifies state and sends a body.
  //       const result = await makeApiCall(context, endpoint, "PUT", eventData);
  //       const { statusCode, data } = result;

  //       if (statusCode >= 200 && statusCode < 300) {
  //         return {
  //           statusCode: 200,
  //           data: { success: true, message: `Contract ${contract_id} rejected successfully.` },
  //         };
  //       }

  //       if (statusCode === 404) {
  //         return { statusCode: 404, data: { success: false, error: `Contract ${contract_id} not found.` } };
  //       }

  //       return {
  //         statusCode,
  //         data: {
  //           success: false,
  //           error: data?.message || `Failed to reject contract ${contract_id}.`,
  //           details: data?.errors || null,
  //         },
  //       };
  //     } catch (error: any) {
  //       return handleActionError(error, context, "Reject Contract");
  //     }
  //   },

  //   sample: {
  //     output: {
  //       success: true,
  //       message: "Contract 123 rejected successfully.",
  //     },
  //   },
  //   retry_on_response: [],
  //   retry_on_request: [],
  //   max_retries: 0,
  //   help: "",
  //   display_priority: 0,
  //   batch: false,
  //   batch_size: 0,
  //   bulk: false,
  //   deprecated: false,
  //   cursor_enabled: true,
  //   has_config_fields: false,
  //   config_fields: {
  //     fields: async () => [],
  //   },
  // },
  view_service_item: {
    id: "view_service_item",
    name: "View Service Item",
    title: "View Service Item",
    subtitle: "Find a specific service catalog item by its ID.",
    description: "Retrieves the complete details of a single service catalog item using its unique ID.",
    // 📝 Input schema requires the Service Item ID
    input_schema: {
      fields: async (): Promise<any> => [
        {
          name: "display_id", // Matching the NestJS code
          label: "Service Item ID",
          type: "number",
          control_type: "number",
          optional: false,
          hint: "Enter the unique ID (Display ID) of the service catalog item.",
        },
      ],
    },
    // 📤 Output schema targets 'service_catalog/items' and adds 'dataFound'
    output_schema: {
      fields: async (context: AppContext) => {
        try {
          const response = await makeApiCall(context, "service_catalog/items?per_page=100&page=1", "GET");
          if (response.statusCode >= 400) {
            throw response.data;
          }
          // Extract actual data — safely handle if API returns wrapped data
          const data = response.data?.service_items ?? [];
          data.push(sampleServiceCatalogItem);
          const mergedData = deepMergeAll(data);
          return GenerateSchema({ ...mergedData, dataFound: true });
        } catch (error: any) {
          throw new Error(error.message || "Unexpected error while building output schema.");
        }
      },
    },

    // 🚀 Execution logic targets 'service_catalog/items/{id}' endpoint
    execute: async (context: AppContext): Promise<ExecutionPayload> => {
      const { display_id } = context.payload.data; // Use display_id
      if (!display_id) {
        return { statusCode: 200, data: { dataFound: false } };
      }
      try {
        // Target the 'service_catalog/items/{id}' endpoint
        const result = await makeApiCall(context, `service_catalog/items/${display_id}`, "GET");
        const { statusCode, data } = result;

        if (statusCode >= 200 && statusCode < 300 && data?.service_item) {
          const serviceItem = data.service_item as any;
          return {
            statusCode,
            data: {
              ...serviceItem,
              stringified_custom_fields: serviceItem.custom_fields.length
                ? JSON.stringify(serviceItem.custom_fields)
                : "",
              dataFound: true,
            },
          };
        }

        if (statusCode === 404) {
          return { statusCode: 200, data: { dataFound: false } };
        }
        return { statusCode: statusCode || 400, data: { error: data } };
      } catch (err: any) {
        const errorResult = handleActionError(err, context, "View Service Item");
        return { ...errorResult, data: { ...(errorResult.data as object), dataFound: false } };
      }
    },

    // Standard action properties
    retry_on_response: [],
    retry_on_request: [],
    max_retries: 0,
    help: "",
    display_priority: 0,
    batch: false,
    batch_size: 0,
    bulk: false,
    deprecated: false,
    cursor_enabled: true,
    has_config_fields: false,
    config_fields: { fields: async () => [] },
    sample: {
      // Sample output for find_service_item
      output: {
        id: 12345,
        display_id: 123,
        name: "Request New Laptop",
        description: "Service item for requesting a new developer laptop.",
        dataFound: true,
        attachments_url: "url1,url2",
        attachment_ids: [111, 222],
        first_attachment_id: 111,
      },
    },
    pick_lists: {},
  },
  create_release_note: {
    id: "create_release_note",
    name: "Create Release Note",
    title: "Create Note on Release",
    subtitle: "Adds a note to a specific release.",
    description: "Adds a note to a release and can notify specified email addresses.",
    pick_lists: {},
    input_schema: {
      fields: async () => getCreateReleaseNoteInputSchema(),
    },

    output_schema: {
      fields: async () => {
        // Based on 'noteoutput'
        return GenerateSchema({
          id: 52000524542,
          created_at: "2025-10-31T12:39:06Z",
          updated_at: "2025-10-31T12:43:33Z",
          body: "<div>test updated </div>",
          body_text: "test updated",
          user_id: 52003162124,
          notify_emails: ["mahendran.ramar@konnectify.co"],
          attachments: [
            {
              attachment_url:
                "https://konnectify-desk.euc-attachments.freshservice.com/data/helpdesk/attachments/production/52061656990/original/testUpload.pdf?response-content-type=application/pdf&Expires=1762001013&Signature=Yh0GOaSVTBzp4lfF5WXGGxz3DEd9zA-pc83Yk7r-Wb~9A2ZecEHk6-KludTyLL1W6XW580j-gU~Fl53VJbtePNVvgGD1MZ5LXIhlDzM0i8qVi~W-HzSiYZ~Il44y~rLSeBe2XOgXQxYWQj1r1pC9dyAQ~cIbK0S2aacGmb3cDQkMguPd-lSw3koWPNDka~VyCBB7Ypm~dOLmdAH5TdG9fOI4WeI7wY8AC2GUsYTn3T4qoe9-CQ5VA0zApZ1RTOuPOh4OkmNfgoTWy-lNpgEXOhKkiOuACfr4v0zj0Zhlsx9PnDdByfHHgkl8XJHH~LMIE8rgxSTJWHWMwX3-3smAtQ__&Key-Pair-Id=APKAIPHBXWY2KT5RCMPQ",
              canonical_url: "https://konnectify-desk.freshservice.com/helpdesk/attachments/52061656990",
              content_type: "application/pdf",
              created_at: "2025-10-31T12:39:05Z",
              has_access: true,
              id: 52061656990,
              name: "testUpload.pdf",
              size: 513483,
              updated_at: "2025-10-31T12:39:06Z",
            },
          ],
          attachment_ids: [52061656990],
          attachments_url:
            "https://konnectify-desk.euc-attachments.freshservice.com/data/helpdesk/attachments/production/52061656990/original/testUpload.pdf?response-content-type=application/pdf&Expires=1762001013&Signature=Yh0GOaSVTBzp4lfF5WXGGxz3DEd9zA-pc83Yk7r-Wb~9A2ZecEHk6-KludTyLL1W6XW580j-gU~Fl53VJbtePNVvgGD1MZ5LXIhlDzM0i8qVi~W-HzSiYZ~Il44y~rLSeBe2XOgXQxYWQj1r1pC9dyAQ~cIbK0S2aacGmb3cDQkMguPd-lSw3koWPNDka~VyCBB7Ypm~dOLmdAH5TdG9fOI4WeI7wY8AC2GUsYTn3T4qoe9-CQ5VA0zApZ1RTOuPOh4OkmNfgoTWy-lNpgEXOhKkiOuACfr4v0zj0Zhlsx9PnDdByfHHgkl8XJHH~LMIE8rgxSTJWHWMwX3-3smAtQ__&Key-Pair-Id=APKAIPHBXWY2KT5RCMPQ",
          first_attachment_id: 52061656990,
        });
      },
    },

    execute: async (context: AppContext): Promise<ExecutionPayload> => {
      const { release_id, ...eventData } = context.payload.data;

      if (!release_id) {
        return { statusCode: 400, data: { error: "Release ID is required." } };
      }
      const inputshema = getCreateReleaseNoteInputSchema();
      const payload: Record<string, any> = await generatePayload(inputshema, eventData);
      const finalPayload = await Assignattchments(context, payload);
      if (finalPayload?.statusCode > 210) {
        return {
          statusCode: finalPayload.statusCode,
          data: {
            error: finalPayload,
          },
        };
      }
      const endpoint = `releases/${release_id}/notes`;

      try {
        const result = await ApiCallWithAttachment(context, endpoint, "POST", finalPayload);
        const { statusCode, data } = result;

        if (statusCode >= 200 && statusCode < 300) {
          const note = data?.note as any; // Expect 'release' object
          const attachments_url = note?.attachments?.map((item: any) => item.attachment_url).join(",") || null;
          const attachment_ids = note?.attachments?.map((item: any) => item.id) || [];
          const first_attachment_id = note?.attachments.length > 0 ? note?.attachments[0]?.id : null;
          return { statusCode, data: { ...note, attachment_ids, attachments_url, first_attachment_id } };
        }

        return {
          statusCode,
          data: { error: data?.message || "Failed to create release note.", details: data?.errors || null },
        };
      } catch (error: any) {
        return handleActionError(error, context, "Create Release Note");
      }
    },

    sample: {
      output: {
        id: 101,
        body_text: "This is a new note on the release.",
        release_id: 789,
      },
    },
    retry_on_response: [],
    retry_on_request: [],
    max_retries: 0,
    help: "",
    display_priority: 0,
    batch: false,
    batch_size: 0,
    bulk: false,
    deprecated: false,
    cursor_enabled: true,
    has_config_fields: false,
    config_fields: {
      fields: async () => [],
    },
  },

  update_release_note: {
    id: "update_release_note",
    name: "Update Release Note",
    title: "Update Note on Release",
    subtitle: "Updates an existing note on a specific release.",
    description: "Updates the body of an existing note on a release.",
    pick_lists: {},
    input_schema: {
      fields: async () => getUpdateReleaseNoteInputSchema(),
    },

    output_schema: {
      fields: async () => {
        // Based on 'noteoutput'
        return GenerateSchema({
          id: 52000524542,
          created_at: "2025-10-31T12:39:06Z",
          updated_at: "2025-10-31T12:43:33Z",
          body: "<div>test updated </div>",
          body_text: "test updated",
          user_id: 52003162124,
          notify_emails: ["mahendran.ramar@konnectify.co"],
          attachments: [
            {
              attachment_url:
                "https://konnectify-desk.euc-attachments.freshservice.com/data/helpdesk/attachments/production/52061656990/original/testUpload.pdf?response-content-type=application/pdf&Expires=1762001013&Signature=Yh0GOaSVTBzp4lfF5WXGGxz3DEd9zA-pc83Yk7r-Wb~9A2ZecEHk6-KludTyLL1W6XW580j-gU~Fl53VJbtePNVvgGD1MZ5LXIhlDzM0i8qVi~W-HzSiYZ~Il44y~rLSeBe2XOgXQxYWQj1r1pC9dyAQ~cIbK0S2aacGmb3cDQkMguPd-lSw3koWPNDka~VyCBB7Ypm~dOLmdAH5TdG9fOI4WeI7wY8AC2GUsYTn3T4qoe9-CQ5VA0zApZ1RTOuPOh4OkmNfgoTWy-lNpgEXOhKkiOuACfr4v0zj0Zhlsx9PnDdByfHHgkl8XJHH~LMIE8rgxSTJWHWMwX3-3smAtQ__&Key-Pair-Id=APKAIPHBXWY2KT5RCMPQ",
              canonical_url: "https://konnectify-desk.freshservice.com/helpdesk/attachments/52061656990",
              content_type: "application/pdf",
              created_at: "2025-10-31T12:39:05Z",
              has_access: true,
              id: 52061656990,
              name: "testUpload.pdf",
              size: 513483,
              updated_at: "2025-10-31T12:39:06Z",
            },
          ],
          attachment_ids: [52061656990],
          attachments_url:
            "https://konnectify-desk.euc-attachments.freshservice.com/data/helpdesk/attachments/production/52061656990/original/testUpload.pdf?response-content-type=application/pdf&Expires=1762001013&Signature=Yh0GOaSVTBzp4lfF5WXGGxz3DEd9zA-pc83Yk7r-Wb~9A2ZecEHk6-KludTyLL1W6XW580j-gU~Fl53VJbtePNVvgGD1MZ5LXIhlDzM0i8qVi~W-HzSiYZ~Il44y~rLSeBe2XOgXQxYWQj1r1pC9dyAQ~cIbK0S2aacGmb3cDQkMguPd-lSw3koWPNDka~VyCBB7Ypm~dOLmdAH5TdG9fOI4WeI7wY8AC2GUsYTn3T4qoe9-CQ5VA0zApZ1RTOuPOh4OkmNfgoTWy-lNpgEXOhKkiOuACfr4v0zj0Zhlsx9PnDdByfHHgkl8XJHH~LMIE8rgxSTJWHWMwX3-3smAtQ__&Key-Pair-Id=APKAIPHBXWY2KT5RCMPQ",
          first_attachment_id: 52061656990,
        });
      },
    },

    execute: async (context: AppContext): Promise<ExecutionPayload> => {
      const { release_id, note_id, ...eventData } = context.payload.data;

      if (!release_id) {
        return { statusCode: 400, data: { error: "Release ID is required." } };
      }
      if (!note_id) {
        return { statusCode: 400, data: { error: "Note ID is required." } };
      }
      const inputshema = getUpdateReleaseNoteInputSchema();
      const payload: Record<string, any> = await generatePayload(inputshema, eventData);
      const finalPayload = await Assignattchments(context, payload);
      if (finalPayload?.statusCode > 210) {
        return {
          statusCode: finalPayload.statusCode,
          data: {
            error: finalPayload,
          },
        };
      }
      const endpoint = `releases/${release_id}/notes/${note_id}`;

      try {
        const result = await ApiCallWithAttachment(context, endpoint, "PUT", finalPayload);
        const { statusCode, data } = result;
        if (statusCode >= 200 && statusCode < 300) {
          const note = data?.note as any; // Expect 'release' object
          const attachments_url = note?.attachments?.map((item: any) => item.attachment_url).join(",") || null;
          const attachment_ids = note?.attachments?.map((item: any) => item.id) || [];
          const first_attachment_id = note?.attachments.length > 0 ? note?.attachments[0]?.id : null;
          return { statusCode, data: { ...note, attachment_ids, attachments_url, first_attachment_id } };
        }

        return {
          statusCode,
          data: { error: data?.message || "Failed to update release note.", details: data?.errors || null },
        };
      } catch (error: any) {
        return handleActionError(error, context, "Update Release Note");
      }
    },

    sample: {
      output: {
        id: 101,
        body_text: "This is the updated note.",
        updated_at: "2025-10-31T17:05:00Z",
      },
    },
    retry_on_response: [],
    retry_on_request: [],
    max_retries: 0,
    help: "",
    display_priority: 0,
    batch: false,
    batch_size: 0,
    bulk: false,
    deprecated: false,
    cursor_enabled: true,
    has_config_fields: false,
    config_fields: {
      fields: async () => [],
    },
  },

  find_release_note: {
    id: "find_release_note",
    name: "Find Release Note",
    title: "Find Note on Release",
    subtitle: "Finds a specific note on a release by its ID.",
    description: "Retrieves the details of a single note on a release.",
    pick_lists: {},
    input_schema: {
      fields: async () => getFindDeleteReleaseNoteInputSchema(),
    },

    output_schema: {
      fields: async () => {
        const sampleNote = {
          id: 52000524542,
          created_at: "2025-10-31T12:39:06Z",
          updated_at: "2025-10-31T12:43:33Z",
          body: "<div>test updated </div>",
          body_text: "test updated",
          user_id: 52003162124,
          notify_emails: ["mahendran.ramar@konnectify.co"],
          attachments: [
            {
              attachment_url:
                "https://konnectify-desk.euc-attachments.freshservice.com/data/helpdesk/attachments/production/52061656990/original/testUpload.pdf?response-content-type=application/pdf&Expires=1762001013&Signature=Yh0GOaSVTBzp4lfF5WXGGxz3DEd9zA-pc83Yk7r-Wb~9A2ZecEHk6-KludTyLL1W6XW580j-gU~Fl53VJbtePNVvgGD1MZ5LXIhlDzM0i8qVi~W-HzSiYZ~Il44y~rLSeBe2XOgXQxYWQj1r1pC9dyAQ~cIbK0S2aacGmb3cDQkMguPd-lSw3koWPNDka~VyCBB7Ypm~dOLmdAH5TdG9fOI4WeI7wY8AC2GUsYTn3T4qoe9-CQ5VA0zApZ1RTOuPOh4OkmNfgoTWy-lNpgEXOhKkiOuACfr4v0zj0Zhlsx9PnDdByfHHgkl8XJHH~LMIE8rgxSTJWHWMwX3-3smAtQ__&Key-Pair-Id=APKAIPHBXWY2KT5RCMPQ",
              canonical_url: "https://konnectify-desk.freshservice.com/helpdesk/attachments/52061656990",
              content_type: "application/pdf",
              created_at: "2025-10-31T12:39:05Z",
              has_access: true,
              id: 52061656990,
              name: "testUpload.pdf",
              size: 513483,
              updated_at: "2025-10-31T12:39:06Z",
            },
          ],
          attachment_ids: [52061656990],
          attachments_url:
            "https://konnectify-desk.euc-attachments.freshservice.com/data/helpdesk/attachments/production/52061656990/original/testUpload.pdf?response-content-type=application/pdf&Expires=1762001013&Signature=Yh0GOaSVTBzp4lfF5WXGGxz3DEd9zA-pc83Yk7r-Wb~9A2ZecEHk6-KludTyLL1W6XW580j-gU~Fl53VJbtePNVvgGD1MZ5LXIhlDzM0i8qVi~W-HzSiYZ~Il44y~rLSeBe2XOgXQxYWQj1r1pC9dyAQ~cIbK0S2aacGmb3cDQkMguPd-lSw3koWPNDka~VyCBB7Ypm~dOLmdAH5TdG9fOI4WeI7wY8AC2GUsYTn3T4qoe9-CQ5VA0zApZ1RTOuPOh4OkmNfgoTWy-lNpgEXOhKkiOuACfr4v0zj0Zhlsx9PnDdByfHHgkl8XJHH~LMIE8rgxSTJWHWMwX3-3smAtQ__&Key-Pair-Id=APKAIPHBXWY2KT5RCMPQ",
          first_attachment_id: 52061656990,
        };
        const schema = GenerateSchema(sampleNote);
        return [
          ...schema,
          { name: "datafound", type: "boolean", label: "Data Found", control_type: "text", optional: false },
        ];
      },
    },

    execute: async (context: AppContext): Promise<ExecutionPayload> => {
      const { release_id, note_id } = context.payload.data;

      if (!release_id) {
        return { statusCode: 400, data: { error: "Release ID is required.", datafound: false } };
      }
      if (!note_id) {
        return { statusCode: 400, data: { error: "Note ID is required.", datafound: false } };
      }

      const endpoint = `releases/${release_id}/notes/${note_id}`;

      try {
        const result = await makeApiCall(context, endpoint, "GET");
        const { statusCode, data } = result;

        if (statusCode >= 200 && statusCode < 300 && (data.note || data.conversation)) {
          return { statusCode, data: { ...(data.note || data.conversation), datafound: true } };
        }

        if (statusCode === 404) {
          return { statusCode: 200, data: { datafound: false } };
        }

        return {
          statusCode,
          data: {
            error: data?.message || "Failed to find release note.",
            details: data?.errors || null,
            datafound: false,
          },
        };
      } catch (error: any) {
        const errorResult = handleActionError(error, context, "Find Release Note");
        return { ...errorResult, data: { ...(errorResult.data as object), datafound: false } };
      }
    },

    sample: {
      output: {
        id: 101,
        body_text: "This is the note content.",
        datafound: true,
      },
    },
    retry_on_response: [],
    retry_on_request: [],
    max_retries: 0,
    help: "",
    display_priority: 0,
    batch: false,
    batch_size: 0,
    bulk: false,
    deprecated: false,
    cursor_enabled: true,
    has_config_fields: false,
    config_fields: {
      fields: async () => [],
    },
  },

  delete_release_note: {
    id: "delete_release_note",
    name: "Delete Release Note",
    title: "Delete Note from Release",
    subtitle: "Deletes a specific note from a release.",
    description: "Permanently deletes a note from a release using its ID.",
    pick_lists: {},
    input_schema: {
      fields: async () => getFindDeleteReleaseNoteInputSchema(),
    },

    output_schema: {
      fields: async () => [
        { name: "success", label: "Success", type: "boolean" },
        { name: "message", label: "Message", type: "string", optional: true },
        { name: "error", label: "Error", type: "string", optional: true },
      ],
    },

    execute: async (context: AppContext): Promise<ExecutionPayload> => {
      const { release_id, note_id } = context.payload.data;

      if (!release_id) {
        return { statusCode: 400, data: { success: false, error: "Release ID is required." } };
      }
      if (!note_id) {
        return { statusCode: 400, data: { success: false, error: "Note ID is required." } };
      }

      const endpoint = `releases/${release_id}/notes/${note_id}`;

      try {
        const result = await makeApiCall(context, endpoint, "DELETE");
        const { statusCode, data } = result;

        if (statusCode >= 200 && statusCode < 300) {
          // Typically 204
          return {
            statusCode: 200,
            data: { success: true, message: `Note ${note_id} from release ${release_id} deleted successfully.` },
          };
        }

        if (statusCode === 404) {
          return {
            statusCode: 404,
            data: { success: false, error: `Note ${note_id} on release ${release_id} not found.` },
          };
        }

        const errorMessage = data?.message || `Failed to delete note ${note_id}.`;
        return {
          statusCode,
          data: { success: false, error: errorMessage, details: data?.errors || null },
        };
      } catch (error: any) {
        return handleActionError(error, context, "Delete Release Note");
      }
    },

    sample: {
      output: {
        success: true,
        message: "Note 101 from release 789 deleted successfully.",
      },
    },
    retry_on_response: [],
    retry_on_request: [],
    max_retries: 0,
    help: "",
    display_priority: 0,
    batch: false,
    batch_size: 0,
    bulk: false,
    deprecated: false,
    cursor_enabled: true,
    has_config_fields: false,
    config_fields: {
      fields: async () => [],
    },
  },
  create_release: {
    id: "create_release",
    name: "Create Release",
    title: "Create Release",
    subtitle: "Create a new release in Freshservice",
    description: "Creates a new release record with associated details and custom fields.",
    has_config_fields: true,
    config_fields: {
      fields: async (context): Promise<any> => {
        const workspaces = await getAllFreshserviceData(context, "workspaces");
        return [
          {
            name: "workspace_id",
            pick_list: workspaces,
            label: "Workspace",
            optional: false,
            type: "number",
            control_type: "select",
            hint: "Select the workspace where the release will be created.",
          },
        ];
      },
    },
    // Use release-specific picklist functions
    pick_lists: {
      // Register release-specific nested field functions
      getLevelTwoTicketsValues: async (context: AppContext) => {
        context = {
          ...context,
          payload: {
            ...context.payload,
            config_fields: {
              ...context.payload.config_fields,
              module: "release",
            },
          },
        };
        return getLevelTwoTicketsValues(context);
      },
      getLevel3TicketsValues: async (context: AppContext) => {
        context = {
          ...context,
          payload: {
            ...context.payload,
            config_fields: {
              ...context.payload.config_fields,
              module: "release",
            },
          },
        };
        return getLevel3TicketsValues(context);
      },
      getAgentByGroupId: async (context: AppContext) => {
        context = {
          ...context,
          payload: {
            ...context.payload,
            config_fields: {
              ...context.payload.config_fields,
              module: "release",
            },
          },
        };
        return getAgentByGroupId(context);
      },
      releaseparent1dependent1,
      releaseparent1dependent2,
      releaseparent2dependent1,
      releaseparent2dependent2,
      releaseparent3dependent1,
      releaseparent3dependent2,
      releaseparent4dependent1,
      releaseparent4dependent2,
      releaseparent5dependent1,
      releaseparent5dependent2,
      releaseparent6dependent1,
      releaseparent6dependent2,
    },

    // Use buildReleaseInputSchema
    input_schema: {
      fields: async (context: AppContext): Promise<any> => {
        try {
          return await buildReleaseInputSchema(context, "create"); // Call release schema builder
        } catch (error: any) {
          throw new Error(`Failed to generate input fields: ${error.message}`);
        }
      },
    },

    // Output schema targets 'releases' endpoint
    output_schema: {
      fields: async (context: AppContext) => {
        // Target 'releases' endpoint and key
        return await getOutputSchemaForm(context, "releases", "releases", "Create a release to see the output schema.");
      },
    },

    // Execution logic adapted for releases
    execute: async (context: AppContext): Promise<ExecutionPayload> => {
      try {
        const { workspace_id } = context.payload.config_fields as any;
        const { ...eventData } = context.payload.data;
        const Inputschema = await buildReleaseInputSchema(context, "create");
        const payload = generatePayload(Inputschema, { ...eventData, workspace_id });
        let normalizedPayload = normalizeEventData(payload);

        // --- Release-Specific Payload Processing ---
        // (Remove or adapt change-specific logic)
        //  normalizedPayload = normalizePlanningFields(normalizedPayload); // <-- Remove if not for releases

        // Asset mapping (if releases use assets)

        if (Array.isArray(normalizedPayload.assets) && normalizedPayload.assets.length > 0) {
          normalizedPayload.assets = normalizedPayload.assets.map((id: string | number) => ({
            display_id: Number(id),
          }));
        } else {
          delete normalizedPayload.assets;
        }
        const body = removeEmpty(normalizedPayload);
        //console.log("body", body);
        if (body.group_id) {
          if (body.group_id.toString().toLowerCase() === "none") {
            delete body.group_id;
          } else if (!isNaN(Number(body.group_id))) {
            body.group_id = Number(body.group_id);
          }
        }
        const finalPayload = await Assignattchments(context, body);
        if (finalPayload?.statusCode > 210) {
          return {
            statusCode: finalPayload.statusCode,
            data: {
              error: finalPayload,
            },
          };
        }
        //console.log("finalPayload", finalPayload);
        const endpoint = "releases"; // Target the 'releases' endpoint

        const result = await ApiCallWithAttachment(context, endpoint, "POST", finalPayload);
        const { statusCode, data } = result;

        if (statusCode >= 200 && statusCode < 300) {
          const release = result?.data?.release as any; // Expect 'release' object
          const attachments_url = release?.attachments?.map((item: any) => item.attachment_url).join(",") || null;
          const attachment_ids = release?.attachments?.map((item: any) => item.id) || [];
          const first_attachment_id = release?.attachments.length > 0 ? release?.attachments[0]?.id : null;
          return { statusCode, data: { ...release, attachment_ids, attachments_url, first_attachment_id } };
        }
        return {
          statusCode,
          data: { error: data?.message || "Failed to create release.", details: data?.errors || null },
        };
      } catch (error: any) {
        return handleActionError(error, context, "Create Release");
      }
    },

    sample: {
      // Update sample output for a release
      output: {
        id: 789,
        subject: "Quarterly Software Update",
        status: 1,
        priority: 2,
        release_type: 1,
      },
    },
    ...actionsAlloption,
  },

  update_release: {
    id: "update_release",
    name: "Update Release",
    title: "Update Release",
    subtitle: "Update an existing release in Freshservice",
    description: "Updates an existing release record with new details and custom field values.",

    has_config_fields: true,
    config_fields: {
      fields: async (context): Promise<any> => {
        const workspaces = await getallWorkspaces(context);
        return [
          {
            name: "workspace_id",
            pick_list: workspaces,
            label: "Workspace",
            optional: false,
            type: "number",
            control_type: "select",
            hint: "Select the workspace where the release is located.",
          },
        ];
      },
    },
    pick_lists: {
      // Register release-specific nested field functions
      getLevelTwoTicketsValues: async (context: AppContext) => {
        context = {
          ...context,
          payload: {
            ...context.payload,
            config_fields: {
              ...context.payload.config_fields,
              module: "release",
            },
          },
        };
        return getLevelTwoTicketsValues(context);
      },
      getLevel3TicketsValues: async (context: AppContext) => {
        context = {
          ...context,
          payload: {
            ...context.payload,
            config_fields: {
              ...context.payload.config_fields,
              module: "release",
            },
          },
        };
        return getLevel3TicketsValues(context);
      },
      getAgentByGroupId: async (context: AppContext) => {
        context = {
          ...context,
          payload: {
            ...context.payload,
            config_fields: {
              ...context.payload.config_fields,
              module: "release",
            },
          },
        };
        return getAgentByGroupId(context);
      },
      releaseparent1dependent1,
      releaseparent1dependent2,
      releaseparent2dependent1,
      releaseparent2dependent2,
      releaseparent3dependent1,
      releaseparent3dependent2,
      releaseparent4dependent1,
      releaseparent4dependent2,
      releaseparent5dependent1,
      releaseparent5dependent2,
      releaseparent6dependent1,
      releaseparent6dependent2,
    },

    input_schema: {
      fields: async (context: AppContext): Promise<any> => {
        return await buildReleaseInputSchema(context, "update");
      },
    },

    output_schema: {
      fields: async (context: AppContext) => {
        return await getOutputSchemaForm(context, "releases", "releases", "Update a release to see the output schema.");
      },
    },

    execute: async (context: AppContext): Promise<ExecutionPayload> => {
      try {
        const { workspace_id } = context.payload.config_fields as any;
        const { release_id, ...eventData } = context.payload.data;
        const Inputschema = await buildReleaseInputSchema(context, "create");
        const payload = generatePayload(Inputschema, { ...eventData });
        let normalizedPayload = normalizeEventData(payload);
        if (Array.isArray(normalizedPayload.assets) && normalizedPayload.assets.length > 0) {
          normalizedPayload.assets = normalizedPayload.assets.map((id: string | number) => ({
            display_id: Number(id),
          }));
        } else {
          delete normalizedPayload.assets;
        }
        const body = removeEmpty(normalizedPayload);
        // //console.log("body", body);
        if (body.group_id) {
          if (body.group_id.toString().toLowerCase() === "none") {
            delete body.group_id;
          } else if (!isNaN(Number(body.group_id))) {
            body.group_id = Number(body.group_id);
          }
        }
        const finalPayload = await Assignattchments(context, body);
        if (finalPayload?.statusCode > 210) {
          return {
            statusCode: finalPayload.statusCode,
            data: {
              error: finalPayload,
            },
          };
        }
        //console.log("finalPayload", finalPayload);
        const endpoint = `releases/${release_id}`; // --- Endpoint change for UPDATE ---

        const result = await ApiCallWithAttachment(context, endpoint, "PUT", finalPayload); // --- Method change for UPDATE ---
        const { statusCode, data } = result;

        if (statusCode >= 200 && statusCode < 300) {
          const release = result?.data?.release as any;
          const attachments_url = release?.attachments?.map((item: any) => item.attachment_url).join(",") || null;
          const attachment_ids = release?.attachments?.map((item: any) => item.id) || [];
          const first_attachment_id = release?.attachments.length > 0 ? release?.attachments[0]?.id : null;
          return { statusCode, data: { ...release, attachment_ids, attachments_url, first_attachment_id } };
        }
        return {
          statusCode,
          data: { error: data || `Failed to update release ${release_id}.`, details: data?.errors || null },
        };
      } catch (error: any) {
        return handleActionError(error, context, "Update Release");
      }
    },
    ...actionsAlloption,
    sample: {
      output: {
        id: 789,
        subject: "Quarterly Software Update - In Progress",
        status: 2, // Example: "In Progress"
        updated_at: "2025-10-27T11:00:00Z",
      },
    },
  },
  find_release: {
    id: "find_release",
    name: "Find Release",
    title: "Find Release by ID",
    subtitle: "Find a specific release by its ID",
    description: "Retrieves the complete details of a single release using its unique ID.",
    pick_lists: {},
    // Input schema requires Release ID
    input_schema: {
      fields: async (): Promise<any> => [
        { name: "id", label: "Release ID", type: "number", control_type: "text", optional: false },
      ],
    },

    // Output schema targets 'releases' endpoint
    output_schema: {
      fields: async (context: AppContext) => {
        try {
          // Target 'releases' endpoint and key
          const schema = await getOutputSchemaForm(
            context,
            "releases", // Use base endpoint for schema generation
            "releases",
            "Create a release in your account to generate the schema."
          );
          if (schema.error) {
            throw new Error(schema.error);
          }

          return [
            ...schema,
            { name: "dataFound", type: "boolean", label: "Data Found", control_type: "text", optional: false },
          ];
        } catch (error: any) {
          throw new Error(error.message || "Unexpected error while building output schema.");
        }
      },
    },

    // Execution logic targets 'releases/{id}' endpoint
    execute: async (context: AppContext): Promise<ExecutionPayload> => {
      const { id } = context.payload.data;
      if (!id) {
        return { statusCode: 200, data: { dataFound: false } };
      }
      try {
        // Target the 'releases/{id}' endpoint
        const result = await makeApiCall(context, `releases/${id}`, "GET"); // Include requester if needed: `releases/${id}?include=requester`
        const { statusCode, data } = result;

        if (statusCode >= 200 && statusCode < 300 && data?.release) {
          // Check for 'release' key
          const release = data.release as any;
          const attachments_url = release?.attachments?.map((item: any) => item.attachment_url).join(",") || null;
          const attachment_ids = release?.attachments?.map((item: any) => item.id) || []; // Keep as array
          const first_attachment_id = release?.attachments?.[0]?.id || null;
          return {
            statusCode,
            data: {
              ...release,
              attachments_url,
              attachment_ids,
              first_attachment_id,
              dataFound: true,
            },
          };
        }

        if (statusCode === 404 || statusCode === 204) {
          return { statusCode: 200, data: { dataFound: false } };
        }
        // Handle other errors consistently
        if ([400, 422].includes(statusCode)) {
          const message = data?.message || data?.error?.message || "Invalid request.";
          return { statusCode, data: { error: message, dataFound: false } };
        }
        if ([401, 403].includes(statusCode)) {
          const message = data?.message || "Authentication failed or access denied.";
          return { statusCode, data: { error: message, dataFound: false } };
        }
        if (statusCode >= 500) {
          const message = data?.message || "Internal server error occurred.";
          return { statusCode, data: { error: message, dataFound: false } };
        }

        return { statusCode, data: { error: `Unexpected API response (${statusCode}).`, dataFound: false } };
      } catch (err: any) {
        const errorResult = handleActionError(err, context, "Find Release");
        return { ...errorResult, data: { ...(errorResult.data as object), dataFound: false } };
      }
    },

    // Standard action properties
    retry_on_response: [],
    retry_on_request: [],
    max_retries: 0,
    help: "",
    display_priority: 0,
    batch: false,
    batch_size: 0,
    bulk: false,
    deprecated: false,
    cursor_enabled: true,
    has_config_fields: false,
    config_fields: { fields: async () => [] },
    sample: {
      // Update sample output for find_release
      output: {
        id: 789,
        subject: "Quarterly Software Update",
        // ... other fields ...
        attachments_url: "url1,url2",
        attachment_ids: [111, 222],
        first_attachment_id: 111,
        dataFound: true,
      },
    },
  },
  delete_release: {
    id: "delete_release",
    name: "Delete Release",
    title: "Delete Release",
    subtitle: "Deletes a specific release by its ID.",
    description: "Permanently deletes a release using its unique ID.",
    pick_lists: {},
    input_schema: {
      fields: async () => [
        {
          name: "release_id", // Use release_id
          label: "Release ID",
          type: "number",
          control_type: "number",
          optional: false,
          hint: "The unique ID of the release to delete.",
        },
      ],
    },

    output_schema: {
      fields: async () => [
        { name: "success", label: "Success", type: "boolean" },
        { name: "message", label: "Message", type: "string", optional: true },
        { name: "error", label: "Error", type: "string", optional: true },
      ],
    },

    execute: async (context: AppContext): Promise<ExecutionPayload> => {
      const { release_id } = context.payload.data; // Use release_id

      if (!release_id) {
        return {
          statusCode: 400,
          data: { success: false, error: "Release ID is required." }, // Updated error
        };
      }

      const endpoint = `releases/${release_id}`; // Target 'releases' endpoint

      try {
        const result = await makeApiCall(context, endpoint, "DELETE");
        const { statusCode, data } = result;

        if (statusCode >= 200 && statusCode < 300) {
          return {
            statusCode: 200,
            data: { success: true, message: `Release ${release_id} deleted successfully.` }, // Updated message
          };
        }

        if (statusCode === 404) {
          return {
            statusCode: 404,
            data: { success: false, error: `Release with ID ${release_id} not found.` }, // Updated message
          };
        }

        const errorMessage = data?.message || data?.description || `Failed to delete release ${release_id}.`; // Updated message
        return {
          statusCode,
          data: {
            success: false,
            error: errorMessage,
            details: data?.errors || null,
          },
        };
      } catch (error: any) {
        return handleActionError(error, context, "Delete Release"); // Updated name
      }
    },

    sample: {
      output: {
        success: true,
        message: "Release 789 deleted successfully.", // Updated sample
      },
    },
    retry_on_response: [],
    retry_on_request: [],
    max_retries: 0,
    help: "",
    display_priority: 0,
    batch: false,
    batch_size: 0,
    bulk: false,
    deprecated: false,
    cursor_enabled: true,
    has_config_fields: false,
    config_fields: {
      fields: async () => [],
    },
  },

  create_task: {
    id: "create_task",
    name: "Create Task",
    title: "Create Task",
    subtitle: "Create a new task associated with a Ticket, Problem, Change, or Release.",
    description: "Creates a new task linked to a parent Freshservice item (Ticket, Problem, Change, or Release).",

    // Config field to select the parent module
    has_config_fields: true,
    config_fields: {
      fields: async (context: AppContext) => {
        const workspaces = await getallWorkspaces(context);
        return [
          {
            name: "module",
            label: "Parent Module",
            type: "string",
            control_type: "select",
            optional: false,
            pick_list: getTaskModulePicklist(), // Use helper function
            hint: "Select the type of item this task belongs to.",
          },
          {
            name: "workspace_id",
            pick_list: workspaces,
            label: "Workspace",
            optional: false,
            type: "number", // Ensure type consistency
            control_type: "select",
            hint: "Select the workspace where the change will be created.",
          },
        ];
      },
    },
    // Reuse existing helper
    // Dynamic input schema based on task fields
    input_schema: {
      fields: async (context: AppContext) => {
        // Add module_id field dynamically based on selected module
        const module = context.payload.config_fields?.module as string;
        const moduleLabels: Record<string, string> = {
          tickets: "Ticket ID",
          problems: "Problem ID",
          changes: "Change ID",
          releases: "Release ID",
        };
        const parentIdField: Field = {
          name: "module_id",
          label: moduleLabels[module] || "Parent Item ID",
          type: "number",
          control_type: "number",
          optional: false,
          hint: `Enter the ID of the ${module.slice(0, -1)} this task belongs to.`,
        };
        const taskFields = await buildTaskInputSchema(context, "create");
        return [parentIdField, ...taskFields];
      },
    },
    // Output schema for a task
    output_schema: {
      fields: async (context: AppContext) => {
        const sampleTask = {
          id: 2737,
          agent_id: 52003591759,
          status: 1,
          due_date: "2025-11-01T17:30:00Z",
          notify_before: 900,
          title: "Test Reset VPN Access",
          description: "Task to reset VPN access for the remote employee.",
          created_at: "2025-10-30T10:45:16Z",
          updated_at: "2025-10-30T10:45:16Z",
          closed_at: "2025-10-30T10:45:16Z",
          group_id: 686,
          deleted: false,
          workspace_id: 2,
          custom_fields: {},
          stack_rank: 6,
        };
        const actualModule = {
          tickets: "ticket",
          problems: "problem",
          changes: "change",
          releases: "release",
        };
        const fields = await makeApiCall(
          context,
          `${actualModule[context.payload.config_fields.module as string]}_task_fields`,
          "GET"
        );
        const schemaFields =
          fields.data?.[`${actualModule[context.payload.config_fields.module as string]}_task_fields`];
        const custom_fields = schemaFields
          .filter((item) => item.is_default_field === false)
          .reduce((acc, value) => {
            acc[value.name] = makeDublicateValue(value.field_type);
            return acc;
          }, {});
        //console.log(custom_fields);
        return GenerateSchema({ ...sampleTask, custom_fields: custom_fields });
      },
    },

    // Execution logic
    execute: async (context: AppContext): Promise<ExecutionPayload> => {
      const { module, workspace_id } = context.payload.config_fields as any;
      const { module_id, ...eventData } = context.payload.data;

      if (!module || !module_id) {
        return { statusCode: 400, data: { error: "Parent Module and Module ID are required." } };
      }
      // Basic check if parent module exists (optional but recommended)
      try {
        const check = await makeApiCall(context, `${module}/${module_id}`, "GET");
        if (check.statusCode >= 210) {
          //console.log(check);
          return {
            statusCode: check.statusCode,
            data: {
              error:
                check.statusCode === 404
                  ? `${module}/${module_id} Not found`
                  : check?.data
                    ? check.data
                    : "Something went wrong",
            },
          };
        }
      } catch (e: any) {
        return handleActionError(e, context, `Verifying Parent ${module}`);
      }
      try {
        const taskFields = await buildTaskInputSchema(context, "create");
        const payload: any = generatePayload(taskFields, { ...eventData, workspace_id });
        //console.log(payload);
        if (payload.group_id) {
          if (payload.group_id.toString().toLowerCase() === "none") {
            delete payload.group_id;
          } else if (!isNaN(Number(payload.group_id))) {
            payload.group_id = Number(payload.group_id);
          }
        }
        const endpoint = `${module}/${module_id}/tasks`;
        const result = await makeApiCall(context, endpoint, "POST", payload);
        const { statusCode, data } = result;
        if (statusCode >= 200 && statusCode < 300) {
          return { statusCode, data: data.task }; // Expect 'task' object in response
        }

        return {
          statusCode,
          data: { error: data?.message || "Failed to create task.", details: data?.errors || null },
        };
      } catch (error: any) {
        return handleActionError(error, context, "Create Task");
      }
    },
    pick_lists: {
      getAgentByGroupId,
    },
    sample: {
      output: { id: 1, title: "Sample Task", status: 1 },
    },
    ...actionsAlloption,
  },

  update_task: {
    id: "update_task",
    name: "Update Task",
    title: "Update Task",
    subtitle: "Update an existing task associated with a parent item.",
    description: "Updates an existing task linked to a Ticket, Problem, Change, or Release.",
    // Config field to select the parent module
    has_config_fields: true,
    ...actionsAlloption,
    config_fields: {
      fields: async (context: AppContext) => {
        const workspaces = await getallWorkspaces(context);
        return [
          {
            name: "module",
            label: "Parent Module",
            type: "string",
            control_type: "select",
            optional: false,
            pick_list: getTaskModulePicklist(), // Use helper function
            hint: "Select the type of item this task belongs to.",
          },
          {
            name: "workspace_id",
            pick_list: workspaces,
            label: "Workspace",
            optional: false,
            type: "number", // Ensure type consistency
            control_type: "select",
            hint: "Select the workspace where the change will be created.",
          },
        ];
      },
    },

    // Input schema includes module_id, task_id, and task fields
    input_schema: {
      fields: async (context: AppContext) => {
        const module = (context.payload.config_fields?.module as string) || "tickets";
        const moduleLabels: Record<string, string> = {
          tickets: "Ticket ID",
          problems: "Problem ID",
          changes: "Change ID",
          releases: "Release ID",
        };
        const parentIdField: Field = {
          name: "module_id",
          label: moduleLabels[module] || "Parent Item ID",
          type: "number",
          control_type: "number",
          optional: false,
          hint: `ID of the ${module.slice(0, -1)}`,
        };

        // Get task fields for update mode (includes task_id)
        const taskFields = await buildTaskInputSchema(context, "update");
        return [parentIdField, ...taskFields]; // Prepend parent ID field
      },
    },

    // Output schema is the same as create
    output_schema: {
      fields: async (context: AppContext) => {
        const sampleTask = {
          id: 2737,
          agent_id: 52003591759,
          status: 1,
          due_date: "2025-11-01T17:30:00Z",
          notify_before: 900,
          title: "Test Reset VPN Access",
          description: "Task to reset VPN access for the remote employee.",
          created_at: "2025-10-30T10:45:16Z",
          updated_at: "2025-10-30T10:45:16Z",
          closed_at: "2025-10-30T10:45:16Z",
          group_id: 686,
          deleted: false,
          workspace_id: 2,
          custom_fields: {},
          stack_rank: 6,
        };
        return GenerateSchema(sampleTask);
      },
    },

    // Execution logic
    execute: async (context: AppContext): Promise<ExecutionPayload> => {
      const { module, workspace_id } = context.payload.config_fields as any;
      const { module_id, task_id, ...eventData } = context.payload.data; // Extract IDs
      if (!module || !module_id || !task_id) {
        return { statusCode: 400, data: { error: "Parent Module, Module ID, and Task ID are required." } };
      }
      // Optional: Check if parent module exists
      try {
        const check = await makeApiCall(context, `${module}/${module_id}`, "GET");
        if (check.statusCode >= 210) {
          //console.log(check);
          return {
            statusCode: check.statusCode,
            data: {
              error:
                check.statusCode === 404
                  ? `${module}/${module_id} Not found`
                  : check?.data
                    ? check.data
                    : "Something went wrong",
            },
          };
        }
      } catch (e: any) {
        return handleActionError(e, context, `Verifying Parent ${module}`);
      }

      try {
        const taskFields = await buildTaskInputSchema(context, "create");
        const payload: any = generatePayload(taskFields, { ...eventData });
        if (payload.group_id) {
          if (payload.group_id.toString().toLowerCase() === "none") {
            delete payload.group_id;
          } else if (!isNaN(Number(payload.group_id))) {
            payload.group_id = Number(payload.group_id);
          }
        }
        const endpoint = `${module}/${module_id}/tasks/${task_id}`; // Target specific task

        const result = await makeApiCall(context, endpoint, "PUT", payload); // Use PUT for update
        const { statusCode, data } = result;

        if (statusCode >= 200 && statusCode < 300) {
          return { statusCode, data: data.task }; // Expect 'task' object
        }

        return {
          statusCode,
          data: { error: data?.message || `Failed to update task ${task_id}.`, details: data?.errors || null },
        };
      } catch (error: any) {
        return handleActionError(error, context, "Update Task");
      }
    },
    pick_lists: {
      getAgentByGroupId,
    },
    sample: {
      output: { id: 1, title: "Updated Task", status: 2, updated_at: "2025-11-01T10:00:00Z" },
    },
  },

  find_task: {
    id: "find_task",
    name: "Find Task",
    title: "Find Task",
    subtitle: "Find a specific task by its ID and parent item.",
    description: "Retrieves the details of a single task belonging to a specific parent item (Ticket, Problem, etc.).",
    pick_lists: {},
    // Config field to select the parent module
    has_config_fields: true,
    config_fields: {
      fields: async () => [
        {
          name: "module",
          label: "Parent Module",
          type: "string",
          control_type: "select",
          optional: false,
          pick_list: getTaskModulePicklist(),
          hint: "Select the type of item the task belongs to.",
        },
      ],
    },

    // Input schema requires module_id and task_id
    input_schema: {
      fields: async (context: AppContext) => getFindDeleteTaskInputSchema(context),
    },

    // Output schema includes task details and dataFound flag
    output_schema: {
      fields: async (context: AppContext) => {
        const sampleTask = {
          id: 2737,
          agent_id: 52003591759,
          status: 1,
          due_date: "2025-11-01T17:30:00Z",
          notify_before: 900,
          title: "Test Reset VPN Access",
          description: "Task to reset VPN access for the remote employee.",
          created_at: "2025-10-30T10:45:16Z",
          updated_at: "2025-10-30T10:45:16Z",
          closed_at: "2025-10-30T10:45:16Z",
          group_id: 686,
          deleted: false,
          workspace_id: 2,
          custom_fields: {},
          stack_rank: 6,
        };
        const schema = GenerateSchema(sampleTask);
        return [
          ...schema,
          { name: "datafound", type: "boolean", label: "Data Found", control_type: "text", optional: false },
        ];
      },
    },

    // Execution logic
    execute: async (context: AppContext): Promise<ExecutionPayload> => {
      const { module } = context.payload.config_fields as { module: string };
      const { module_id, task_id } = context.payload.data;

      if (!module || !module_id || !task_id) {
        return {
          statusCode: 400,
          data: { error: "Parent Module, Module ID, and Task ID are required.", datafound: false },
        };
      }

      const endpoint = `${module}/${module_id}/tasks/${task_id}`;

      try {
        const result = await makeApiCall(context, endpoint, "GET");
        const { statusCode, data } = result;

        if (statusCode >= 200 && statusCode < 300 && data?.task) {
          return { statusCode, data: { ...data.task, datafound: true } };
        }

        if (statusCode === 404) {
          return { statusCode: 200, data: { datafound: false } }; // Return 200 OK with datafound: false
        }

        // Handle other errors
        return {
          statusCode,
          data: { error: data?.message || "Failed to find task.", details: data?.errors || null, datafound: false },
        };
      } catch (error: any) {
        const errorResult = handleActionError(error, context, "Find Task");
        return { ...errorResult, data: { ...(errorResult.data as object), datafound: false } };
      }
    },
    sample: {
      output: { id: 1, title: "Sample Task", datafound: true },
    },
    retry_on_response: [],
    retry_on_request: [],
    max_retries: 0,
    help: "",
    display_priority: 0,
    batch: false,
    batch_size: 0,
    bulk: false,
    deprecated: false,
    cursor_enabled: true,
  },
  delete_task: {
    id: "delete_task",
    name: "Delete Task",
    title: "Delete Task",
    subtitle: "Delete a specific task by its ID and parent item.",
    description: "Permanently deletes a task belonging to a specific parent item (Ticket, Problem, etc.).",
    has_config_fields: true,
    config_fields: {
      fields: async () => [
        {
          name: "module",
          label: "Parent Module",
          type: "string",
          control_type: "select",
          optional: false,
          pick_list: getTaskModulePicklist(),
          hint: "Select the type of item the task belongs to.",
        },
      ],
    },
    pick_lists: {},
    // Input schema requires module_id and task_id
    input_schema: {
      fields: async (context: AppContext) => getFindDeleteTaskInputSchema(context),
    },

    // Simple success/error output schema
    output_schema: {
      fields: async () => [
        { name: "success", label: "Success", type: "boolean" },
        { name: "message", label: "Message", type: "string", optional: true },
        { name: "error", label: "Error", type: "string", optional: true },
      ],
    },

    // Execution logic
    execute: async (context: AppContext): Promise<ExecutionPayload> => {
      const { module } = context.payload.config_fields as { module: string };
      const { module_id, task_id } = context.payload.data;

      if (!module || !module_id || !task_id) {
        return {
          statusCode: 400,
          data: { success: false, error: "Parent Module, Module ID, and Task ID are required." },
        };
      }

      const endpoint = `${module}/${module_id}/tasks/${task_id}`;
      try {
        const result = await makeApiCall(context, endpoint, "DELETE");
        const { statusCode, data } = result;

        if (statusCode >= 200 && statusCode < 300) {
          // Usually 204 No Content
          return { statusCode: 200, data: { success: true, message: `Task ${task_id} deleted successfully.` } };
        }

        if (statusCode === 404) {
          return {
            statusCode: 404,
            data: { success: false, error: `Task ${task_id} not found for ${module} ${module_id}.` },
          };
        }

        // Handle other errors
        return {
          statusCode,
          data: { success: false, error: data?.message || "Failed to delete task.", details: data?.errors || null },
        };
      } catch (error: any) {
        return handleActionError(error, context, "Delete Task");
      }
    },
    sample: {
      output: { success: true, message: "Task 1 deleted successfully." },
    },
    retry_on_response: [],
    retry_on_request: [],
    max_retries: 0,
    help: "",
    display_priority: 0,
    batch: false,
    batch_size: 0,
    bulk: false,
    deprecated: false,
    cursor_enabled: true,
  },
  create_change: {
    id: "create_change",
    name: "Create Change",
    title: "Create Change",
    subtitle: "Create a new change request in Freshservice",
    description: "Creates a new change record with associated details and custom fields.",

    has_config_fields: true,
    config_fields: {
      fields: async (context): Promise<any> => {
        const workspaces = await getallWorkspaces(context); // Reuse existing helper
        return [
          {
            name: "workspace_id",
            pick_list: workspaces,
            label: "Workspace",
            optional: false,
            type: "number", // Ensure type consistency
            control_type: "select",
            hint: "Select the workspace where the change will be created.",
          },
        ];
      },
    },
    // Use change-specific picklist functions
    pick_lists: {
      getLevelTwoTicketsValues: async (context: AppContext) => {
        context = {
          ...context,
          payload: {
            ...context.payload,
            config_fields: {
              ...context.payload.config_fields,
              module: "change",
            },
          },
        };
        return getLevelTwoTicketsValues(context);
      },
      getLevel3TicketsValues: async (context: AppContext) => {
        context = {
          ...context,
          payload: {
            ...context.payload,
            config_fields: {
              ...context.payload.config_fields,
              module: "change",
            },
          },
        };
        return getLevel3TicketsValues(context);
      },
      getAgentByGroupId: async (context: AppContext) => {
        context = {
          ...context,
          payload: {
            ...context.payload,
            config_fields: {
              ...context.payload.config_fields,
              module: "change",
            },
          },
        };
        return getAgentByGroupId(context);
      },
      changeparent1dependent1,
      changeparent1dependent2,
      changeparent2dependent1,
      changeparent2dependent2,
      changeparent3dependent1,
      changeparent3dependent2,
      changeparent4dependent1,
      changeparent4dependent2,
      changeparent5dependent1,
      changeparent5dependent2,
      changeparent6dependent1,
      changeparent6dependent2,
    },

    // Use buildChangeInputSchema
    input_schema: {
      fields: async (context: AppContext): Promise<any> => {
        try {
          return await buildChangeInputSchema(context, "create"); // Call change schema builder
        } catch (error: any) {
          throw new Error(`Failed to generate input fields: ${error.message}`);
        }
      },
    },

    // Output schema targets 'changes' endpoint
    output_schema: {
      fields: async (context: AppContext) => {
        // Target 'changes' endpoint and key
        return await getOutputSchemaForm(context, "changes", "changes", "Create a change to see the output schema.");
      },
    },

    // Execution logic adapted for changes
    execute: async (context: AppContext): Promise<ExecutionPayload> => {
      try {
        const { workspace_id } = context.payload.config_fields as any;
        // Handle group_id potentially being 'None'
        const { ...eventData } = context.payload.data;
        if (!eventData.email) return { statusCode: 400, data: { error: "Requester email is required." } };
        const Inputschema = await buildChangeInputSchema(context, "create");
        const payload = generatePayload(Inputschema, { ...eventData, workspace_id }); // Pass workspace_id if needed
        let normalizedPayload = normalizeEventData(payload);
        normalizedPayload = normalizePlanningFields(normalizedPayload);
        if (Array.isArray(normalizedPayload.assets) && normalizedPayload.assets.length > 0) {
          normalizedPayload.assets = normalizedPayload.assets.map((id: string | number) => ({
            display_id: Number(id),
          }));
        } else {
          delete normalizedPayload.assets;
        }
        //   //console.log(JSON.stringify(normalizedPayload));
        const maintenance_window = {
          id: normalizedPayload.maintenance_window,
        };
        delete normalizedPayload.maintenance_window;
        const body = removeEmpty({ ...normalizedPayload, maintenance_window });
        if (body.group_id) {
          if (body.group_id.toString().toLowerCase() === "none") {
            delete body.group_id;
          } else if (!isNaN(Number(body.group_id))) {
            body.group_id = Number(body.group_id);
          }
        }
        const finalPayload = await Assignattchments(context, body);
        if (finalPayload?.statusCode > 210) {
          return {
            statusCode: finalPayload.statusCode,
            data: {
              error: finalPayload,
            },
          };
        }
        const endpoint = "changes"; // Target the 'changes' endpoint

        const result = await ApiCallWithAttachment(context, endpoint, "POST", finalPayload);
        const { statusCode, data } = result;
        if (statusCode >= 200 && statusCode < 300) {
          const change = result?.data?.change as any; // Expect 'change' object
          const attachments_url = change?.attachments?.map((item: any) => item.attachment_url).join(",") || null;
          const attachment_ids = change?.attachments?.map((item: any) => item.id) || [];
          const first_attachment_id = change?.attachments.length > 0 ? change?.attachments[0]?.id : null;
          return { statusCode, data: { ...change, attachment_ids, attachments_url, first_attachment_id } };
        }
        return {
          statusCode,
          data: { error: data?.message || "Failed to create change.", details: data?.errors || null },
        };
      } catch (error: any) {
        return handleActionError(error, context, "Create Change");
      }
    },

    sample: {
      // Update sample output for a change
      output: {
        id: 567,
        subject: "Implement New Firewall Rules",
        description: "Update firewall to allow new service.",
        status: 1,
        priority: 2,
        impact: 2,
        change_type: 1,
      },
    },
    ...actionsAlloption,
  },

  find_change: {
    id: "find_change",
    name: "Find Change",
    title: "Find Change by ID",
    subtitle: "Find a specific change by its ID",
    description: "Retrieves the complete details of a single change request using its unique ID.",
    pick_lists: {},
    // Input schema requires Change ID
    input_schema: {
      fields: async (): Promise<any> => [
        { name: "id", label: "Change ID", type: "number", control_type: "text", optional: false },
      ],
    },

    // Output schema targets 'changes' endpoint
    output_schema: {
      fields: async (context: AppContext) => {
        try {
          // Target 'changes' endpoint and key
          const schema = await getOutputSchemaForm(
            context,
            "changes", // Use base endpoint for schema generation
            "changes",
            "Create a change in your account to generate the schema."
          );
          if (schema.error) {
            throw new Error(schema.error);
          }
          return [
            ...schema,
            { name: "dataFound", type: "boolean", label: "Data Found", control_type: "text", optional: false },
          ];
        } catch (error: any) {
          throw new Error(error.message || "Unexpected error while building output schema.");
        }
      },
    },

    // Execution logic targets 'changes/{id}' endpoint
    execute: async (context: AppContext): Promise<ExecutionPayload> => {
      const { id } = context.payload.data;
      if (!id) {
        return { statusCode: 200, data: { dataFound: false } };
      }
      try {
        // Target the 'changes/{id}' endpoint
        const result = await makeApiCall(context, `changes/${id}`, "GET"); // Include requester if needed: `changes/${id}?include=requester`
        const { statusCode, data } = result;

        if (statusCode >= 200 && statusCode < 300 && data?.change) {
          // Check for 'change' key
          const change = data.change as any;

          const attachments_url = change?.attachments?.map((item: any) => item.attachment_url).join(",") || null;
          const attachment_ids = change?.attachments?.map((item: any) => item.id) || []; // Keep as array
          const first_attachment_id = change?.attachments?.[0]?.id || null;

          return {
            statusCode,
            data: {
              ...change,
              attachments_url,
              attachment_ids,
              first_attachment_id,
              dataFound: true,
            },
          };
        }

        if (statusCode === 404 || statusCode === 204) {
          return { statusCode: 200, data: { dataFound: false } };
        }
        // Handle other errors consistently
        if ([400, 422].includes(statusCode)) {
          const message = data?.message || data?.error?.message || "Invalid request.";
          return { statusCode, data: { error: message, dataFound: false } };
        }
        if ([401, 403].includes(statusCode)) {
          const message = data?.message || "Authentication failed or access denied.";
          return { statusCode, data: { error: message, dataFound: false } };
        }
        if (statusCode >= 500) {
          const message = data?.message || "Internal server error occurred.";
          return { statusCode, data: { error: message, dataFound: false } };
        }

        return { statusCode, data: { error: `Unexpected API response (${statusCode}).`, dataFound: false } };
      } catch (err: any) {
        const errorResult = handleActionError(err, context, "Find Change");
        return { ...errorResult, data: { ...(errorResult.data as object), dataFound: false } };
      }
    },

    // Standard action properties (copied from find_problem)
    retry_on_response: [],
    retry_on_request: [],
    max_retries: 0,
    help: "",
    display_priority: 0,
    batch: false,
    batch_size: 0,
    bulk: false,
    deprecated: false,
    cursor_enabled: true,
    has_config_fields: false,
    config_fields: { fields: async () => [] },
    sample: {
      // Update sample output for find_change
      output: {
        id: 567,
        subject: "Implement New Firewall Rules",
        // ... other fields ...
        attachments_url: "url1,url2",
        attachment_ids: [111, 222],
        first_attachment_id: 111,
        dataFound: true,
      },
    },
  },

  update_change: {
    id: "update_change",
    name: "Update Change",
    title: "Update Change",
    subtitle: "Update an existing change request in Freshservice",
    description: "Updates an existing change record with new details and custom field values.",

    has_config_fields: true,
    config_fields: {
      fields: async (context): Promise<any> => {
        const workspaces = await getallWorkspaces(context); // Reuse existing helper
        return [
          {
            name: "workspace_id",
            pick_list: workspaces,
            label: "Workspace",
            optional: false,
            type: "number", // Ensure type consistency
            control_type: "select",
            hint: "Select the workspace where the change is located.",
          },
        ];
      },
    },
    // Picklists are the same, needed for the input schema
    pick_lists: {
      getLevelTwoTicketsValues: async (context: AppContext) => {
        context = {
          ...context,
          payload: {
            ...context.payload,
            config_fields: {
              ...context.payload.config_fields,
              module: "change",
            },
          },
        };
        return getLevelTwoTicketsValues(context);
      },
      getLevel3TicketsValues: async (context: AppContext) => {
        context = {
          ...context,
          payload: {
            ...context.payload,
            config_fields: {
              ...context.payload.config_fields,
              module: "change",
            },
          },
        };
        return getLevel3TicketsValues(context);
      },
      getAgentByGroupId: async (context: AppContext) => {
        context = {
          ...context,
          payload: {
            ...context.payload,
            config_fields: {
              ...context.payload.config_fields,
              module: "change",
            },
          },
        };
        return getAgentByGroupId(context);
      },
      changeparent1dependent1,
      changeparent1dependent2,
      changeparent2dependent1,
      changeparent2dependent2,
      changeparent3dependent1,
      changeparent3dependent2,
      changeparent4dependent1,
      changeparent4dependent2,
      changeparent5dependent1,
      changeparent5dependent2,
      changeparent6dependent1,
      changeparent6dependent2,
    },

    // Use buildChangeInputSchema with 'update' mode
    input_schema: {
      fields: async (context: AppContext): Promise<any> => {
        try {
          return await buildChangeInputSchema(context, "update"); // Call change schema builder for update
        } catch (error: any) {
          throw new Error(`Failed to generate input fields: ${error.message}`);
        }
      },
    },

    // Output schema targets 'changes' endpoint (same as create)
    output_schema: {
      fields: async (context: AppContext) => {
        // Target 'changes' endpoint and key
        return await getOutputSchemaForm(context, "changes", "changes", "Create a change to see the output schema.");
      },
    },

    // Execution logic adapted for updating a change
    execute: async (context: AppContext): Promise<ExecutionPayload> => {
      try {
        const { workspace_id } = context.payload.config_fields as any;
        // Handle group_id potentially being 'None'
        const { change_id, ...eventData } = context.payload.data;

        // --- Add Required Field Checks Specific to Changes ---
        // (Update these based on actual Change API requirements)
        if (!change_id) return { statusCode: 400, data: { error: "Change Id is required to update." } };

        const Inputschema = await buildChangeInputSchema(context, "update");
        const payload = generatePayload(Inputschema, { ...eventData }); // Pass workspace_id if needed
        let normalizedPayload = normalizeEventData(payload);
        normalizedPayload = normalizePlanningFields(normalizedPayload);
        if (Array.isArray(normalizedPayload.assets) && normalizedPayload.assets.length > 0) {
          normalizedPayload.assets = normalizedPayload.assets.map((id: string | number) => ({
            display_id: Number(id),
          }));
        } else {
          delete normalizedPayload.assets;
        }
        //   //console.log(JSON.stringify(normalizedPayload));
        const maintenance_window = {
          id: normalizedPayload.maintenance_window,
        };
        delete normalizedPayload.maintenance_window;
        const body = removeEmpty({ ...normalizedPayload, maintenance_window });
        // //console.log(body);
        if (body.group_id) {
          if (body.group_id.toString().toLowerCase() === "none") {
            delete body.group_id;
          } else if (!isNaN(Number(body.group_id))) {
            body.group_id = Number(body.group_id);
          }
        }
        const finalPayload = await Assignattchments(context, body);
        if (finalPayload?.statusCode > 210) {
          return {
            statusCode: finalPayload.statusCode,
            data: {
              error: finalPayload,
            },
          };
        }
        const endpoint = `changes/${change_id}`; // --- Endpoint change for UPDATE ---

        const result = await ApiCallWithAttachment(context, endpoint, "PUT", finalPayload); // --- Method change for UPDATE ---
        const { statusCode, data } = result;

        if (statusCode >= 200 && statusCode < 300) {
          const change = result?.data?.change as any;
          const attachments_url = change?.attachments?.map((item: any) => item.attachment_url).join(",") || null;
          const attachment_ids = change?.attachments?.map((item: any) => item.id) || [];
          const first_attachment_id = change?.attachments.length > 0 ? change?.attachments[0]?.id : null;
          return { statusCode, data: { ...change, attachment_ids, attachments_url, first_attachment_id } };
        }
        return {
          statusCode,
          data: { error: data || `Failed to update change ${change_id}.`, details: data?.errors || null },
        };
      } catch (error: any) {
        return handleActionError(error, context, "Update Change");
      }
    },

    sample: {
      // Update sample output for an updated change
      output: {
        id: 567,
        subject: "Implement New Firewall Rules",
        description: "Update firewall to allow new service.",
        status: 2, // Example: "Pending"
        priority: 2,
        impact: 2,
        change_type: 1,
        updated_at: "2025-10-27T10:00:00Z",
      },
    },
    ...actionsAlloption,
  },
  delete_change: {
    id: "delete_change",
    name: "Delete Change",
    title: "Delete Change",
    subtitle: "Deletes a specific change request by its ID.",
    description: "Permanently deletes a change request using its unique ID.",
    pick_lists: {},
    // 📝 Defines the input field: the ID of the change to delete.
    input_schema: {
      fields: async () => [
        {
          name: "change_id", // Changed from requester_id
          label: "Change ID",
          type: "number",
          control_type: "number",
          optional: false,
          hint: "The unique ID of the change request to delete.",
        },
      ],
    },

    // 📤 Defines the simple success/error output structure.
    output_schema: {
      fields: async () => [
        { name: "success", label: "Success", type: "boolean" },
        { name: "message", label: "Message", type: "string", optional: true }, // Optional for success case
      ],
    },

    // 🚀 The core logic that executes the delete request.
    execute: async (context: AppContext): Promise<ExecutionPayload> => {
      const { change_id } = context.payload.data; // Use change_id

      if (!change_id) {
        return {
          statusCode: 400,
          data: { success: false, error: "Change ID is required." }, // Updated error message
        };
      }

      const endpoint = `changes/${change_id}`; // Target the 'changes' endpoint

      try {
        const result = await makeApiCall(context, endpoint, "DELETE");
        const { statusCode, data } = result;

        // ✅ Success (Usually 204 No Content for DELETE)
        if (statusCode >= 200 && statusCode < 300) {
          return {
            statusCode: 200, // Return 200 OK for consistency
            data: { success: true, message: `Change ${change_id} deleted successfully.` }, // Updated success message
          };
        }

        // 🤷 Not Found (404)
        if (statusCode === 404) {
          return {
            statusCode: 404,
            data: { success: false, error: `Change with ID ${change_id} not found.` }, // Updated error message
          };
        }

        // ❌ Other Errors
        const errorMessage = data?.message || data?.description || `Failed to delete change ${change_id}.`; // Updated error message
        return {
          statusCode,
          data: {
            success: false,
            error: errorMessage,
            details: data?.errors || null,
          },
        };
      } catch (error: any) {
        // Use the standard error handler
        return handleActionError(error, context, "Delete Change"); // Updated operation name
      }
    },

    // 📊 Provides a sample output for a successful deletion.
    sample: {
      output: {
        success: true,
        message: "Change 567 deleted successfully.", // Updated sample message
      },
    },
    retry_on_response: [],
    retry_on_request: [],
    max_retries: 0,
    help: "",
    display_priority: 0,
    batch: false,
    batch_size: 0,
    bulk: false,
    deprecated: false,
    cursor_enabled: true,
    has_config_fields: false,
    config_fields: {
      fields: async () => [],
    },
  },
  create_problem: {
    id: "create_problem",
    name: "Create Problem",
    title: "Create Problem",
    subtitle: "Create a new problem in Freshservice",
    description: "Creates a new problem record with associated details and custom fields.",
    has_config_fields: true,
    config_fields: {
      fields: async (context): Promise<any> => {
        const workspaces = await getallWorkspaces(context); // Reuse existing helper
        return [
          {
            name: "workspace_id",
            pick_list: workspaces,
            label: "Workspace",
            optional: false,
            type: "number",
            control_type: "select",
            hint: "Select the workspace where the problem will be created.",
          },
        ];
      },
    },
    pick_lists: {
      getLevelTwoTicketsValues: async (context: AppContext) => {
        context = {
          ...context,
          payload: {
            ...context.payload,
            config_fields: {
              ...context.payload.config_fields,
              module: "change",
            },
          },
        };
        return getLevelTwoTicketsValues(context);
      },
      getLevel3TicketsValues: async (context: AppContext) => {
        context = {
          ...context,
          payload: {
            ...context.payload,
            config_fields: {
              ...context.payload.config_fields,
              module: "change",
            },
          },
        };
        return getLevel3TicketsValues(context);
      },
      getAgentByGroupId: async (context: AppContext) => {
        context = {
          ...context,
          payload: {
            ...context.payload,
            config_fields: {
              ...context.payload.config_fields,
              module: "change",
            },
          },
        };
        return getAgentByGroupId(context);
      },
      problemparent1dependent1,
      problemparent1dependent2,
      problemparent2dependent1,
      problemparent2dependent2,
      problemparent3dependent1,
      problemparent3dependent2,
      problemparent4dependent1,
      problemparent4dependent2,
      problemparent5dependent1,
      problemparent5dependent2,
      problemparent6dependent1,
      problemparent6dependent2,
    },

    // Use the new helper to build the input schema dynamically
    input_schema: {
      fields: async (context: AppContext): Promise<any> => {
        return await buildProblemInputSchema(context, "create");
      },
    },

    // Define the output schema, likely similar to a ticket
    output_schema: {
      fields: async (context: AppContext) => {
        return await getOutputSchemaForm(context, "problems", "problems", "Create a problem to see the output schema.");
      },
    },

    // Define the execution logic
    execute: async (context: AppContext): Promise<ExecutionPayload> => {
      try {
        const { workspace_id } = context.payload.config_fields as any;
        const { ...eventData } = context.payload.data;
        const Inputschema = await buildProblemInputSchema(context, "create");
        const payload = generatePayload(Inputschema, { ...eventData, workspace_id });
        const noramalizedEventdata = normalizeEventData(payload); // Use the specific payload processor
        // //console.log("noramalizedEventdata", noramalizedEventdata);
        const analysisFieldMap: Record<string, string> = {
          pc_description: "problem_cause",
          pi_description: "problem_impact",
          ps_description: "problem_symptom",
        };
        let touched = false; // track if we moved anything
        Object.entries(analysisFieldMap).forEach(([fieldKey, nestedKey]) => {
          if (eventData[fieldKey]) {
            noramalizedEventdata.analysis_fields = noramalizedEventdata.analysis_fields || {};
            noramalizedEventdata.analysis_fields[nestedKey] = noramalizedEventdata.analysis_fields[nestedKey] || {};
            noramalizedEventdata.analysis_fields[nestedKey].description = noramalizedEventdata[fieldKey];
            delete noramalizedEventdata[fieldKey];
            touched = true;
          }
        });
        // Remove analysis_fields if it ended up empty
        if (!touched) {
          delete noramalizedEventdata.analysis_fields;
        }
        const body = removeEmpty(noramalizedEventdata);
        if (body.group_id) {
          if (body.group_id.toString().toLowerCase() === "none") {
            delete body.group_id;
          } else if (!isNaN(Number(body.group_id))) {
            body.group_id = Number(body.group_id);
          }
        }
        const finalPayload = await Assignattchments(context, body);
        if (finalPayload?.statusCode > 210) {
          return {
            statusCode: finalPayload.statusCode,
            data: {
              error: finalPayload,
            },
          };
        }

        const result = await ApiCallWithAttachment(context, "problems", "POST", finalPayload);
        const { statusCode, data } = result;
        if (statusCode >= 200 && statusCode < 300) {
          // Adjust response key based on API ('problem', etc.)
          const problem = result?.data?.problem as any;
          const attachments_url =
            problem?.attachments && problem?.attachments.length
              ? problem.attachments.map((item) => item.attachment_url).join(",")
              : [];
          const attachment_ids =
            problem?.attachments && problem?.attachments.length ? problem.attachments.map((item) => item.id) : [];
          const first_attachment_id = problem?.attachments?.length ? problem.attachments[0]?.id : null;
          return { statusCode, data: { ...problem, attachment_ids, attachments_url, first_attachment_id } };
        }

        return {
          statusCode,
          data: {
            error: data?.message || "Failed to create problem.",
            details: data?.errors || null,
          },
        };
      } catch (error: any) {
        return handleActionError(error, context, "Create Problem");
      }
    },

    sample: {
      // Provide a sample output based on the expected problem structure
      output: {
        id: 987,
        subject: "Network Outage",
        description: "Users reporting inability to connect.",
        status: 1, // Example: Open
        priority: 3, // Example: High
        impact: 3, // Example: High
      },
    },
    ...actionsAlloption,
  },
  find_problem: {
    id: "find_problem",
    name: "Find Problem",
    title: "Find Problem by ID",
    subtitle: "Find a specific problem by its ID",
    description: "Retrieves the complete details of a single problem using its unique ID.",
    pick_lists: {},
    // Input schema requires only the Problem ID
    input_schema: {
      fields: async (): Promise<any> => [
        { name: "id", label: "Problem ID", type: "number", control_type: "text", optional: false },
      ],
    },

    // Output schema fetches problem details and adds the dataFound flag
    output_schema: {
      fields: async (context: AppContext) => {
        const schema = await getOutputSchemaForm(
          context,
          "problems",
          "problems",
          "Create a problem in your account to generate the schema."
        );
        if (schema?.error) {
          throw new Error(schema?.error || "unable to retrieve output schema");
        }
        return [
          ...schema,
          { name: "dataFound", type: "boolean", label: "Data Found", control_type: "text", optional: false },
        ];
      },
    },

    // Execution logic mirrors find_ticket but targets the problems endpoint
    execute: async (context: AppContext): Promise<ExecutionPayload> => {
      const { id } = context.payload.data;

      if (!id) {
        // Return not found immediately if ID is missing
        return { statusCode: 200, data: { dataFound: false } };
      }

      try {
        // Target the problems endpoint, include requester if applicable
        const result = await makeApiCall(context, `problems/${id}`, "GET");
        const { statusCode, data } = result;

        // ✅ Success (2xx)
        if (statusCode >= 200 && statusCode < 300 && data?.problem) {
          // Check for 'problem' key
          const problem = data.problem as any; // Cast to 'any' for flexibility

          // Process attachments similar to find_ticket
          const attachments_url = problem?.attachments?.map((item: any) => item.attachment_url).join(",") || null;
          const attachment_ids = problem?.attachments?.map((item: any) => item.id);
          const first_attachment_id = problem?.attachments?.[0]?.id || null;

          return {
            statusCode,
            data: {
              ...problem, // Spread the problem data
              attachments_url,
              attachment_ids,
              first_attachment_id,
              dataFound: true, // Add dataFound flag
            },
          };
        }

        // ✅ Not found (404, 204)
        if (statusCode === 404 || statusCode === 204) {
          return { statusCode: 200, data: { dataFound: false } };
        }

        // ⚠️ Client errors (400, 422)
        if ([400, 422].includes(statusCode)) {
          const message = data?.message || data?.error?.message || "Invalid request.";
          // Return error structure consistent with find_ticket
          return { statusCode, data: { error: message, dataFound: false } };
        }

        // 🚫 Auth errors (401, 403)
        if ([401, 403].includes(statusCode)) {
          const message = data?.message || "Authentication failed or access denied.";
          return { statusCode, data: { error: message, dataFound: false } };
        }

        // 💥 Server errors (500+)
        if (statusCode >= 500) {
          const message = data?.message || "Internal server error occurred.";
          return { statusCode, data: { error: message, dataFound: false } };
        }

        // ❓ Unexpected response
        return { statusCode, data: { error: `Unexpected API response (${statusCode}).`, dataFound: false } };
      } catch (err: any) {
        // Use the standard error handler, ensuring dataFound: false
        const errorResult = handleActionError(err, context, "Find Problem");
        return { ...errorResult, data: { ...(errorResult.data as object), dataFound: false } };
      }
    },

    // Copy remaining properties from find_ticket
    retry_on_response: [],
    retry_on_request: [],
    max_retries: 0,
    help: "",
    display_priority: 0, // Adjust priority as needed
    batch: false,
    batch_size: 0,
    bulk: false,
    deprecated: false,
    cursor_enabled: true,
    has_config_fields: false,
    config_fields: { fields: async () => [] },
    sample: {
      id: 987,
    },
  },
  update_problem: {
    id: "update_problem",
    name: "Update Problem",
    title: "Update Problem",
    subtitle: "Update an existing problem in Freshservice",
    description: "Updates an existing problem record with new details and custom field values.",

    // Config fields remain the same as create, needed for schema building
    has_config_fields: true,
    config_fields: {
      fields: async (context): Promise<any> => {
        const workspaces = await getallWorkspaces(context);
        return [
          {
            name: "workspace_id",
            pick_list: workspaces,
            label: "Workspace",
            optional: false, // Workspace is needed to fetch the correct fields
            type: "number",
            control_type: "select",
            hint: "Select the workspace containing the problem.",
          },
        ];
      },
    },
    // Picklists remain the same as create
    pick_lists: {
      getLevelTwoTicketsValues: async (context: AppContext) => {
        context = {
          ...context,
          payload: {
            ...context.payload,
            config_fields: {
              ...context.payload.config_fields,
              module: "problem",
            },
          },
        };
        return getLevelTwoTicketsValues(context);
      },
      getLevel3TicketsValues: async (context: AppContext) => {
        context = {
          ...context,
          payload: {
            ...context.payload,
            config_fields: {
              ...context.payload.config_fields,
              module: "problem",
            },
          },
        };
        return getLevel3TicketsValues(context);
      },
      getAgentByGroupId: async (context: AppContext) => {
        context = {
          ...context,
          payload: {
            ...context.payload,
            config_fields: {
              ...context.payload.config_fields,
              module: "problem",
            },
          },
        };
        return getAgentByGroupId(context);
      },
      problemparent1dependent1,
      problemparent1dependent2,
      problemparent2dependent1,
      problemparent2dependent2,
      problemparent3dependent1,
      problemparent3dependent2,
      problemparent4dependent1,
      problemparent4dependent2,
      problemparent5dependent1,
      problemparent5dependent2,
      problemparent6dependent1,
      problemparent6dependent2,
    },

    // Use buildProblemInputSchema with 'update' mode
    input_schema: {
      fields: async (context: AppContext): Promise<any> => {
        try {
          // Call the schema builder with 'update' mode
          return await buildProblemInputSchema(context, "update");
        } catch (error: any) {
          throw new Error(`Failed to generate input fields: ${error.message}`);
        }
      },
    },

    // Output schema is the same as create
    output_schema: {
      fields: async (context: AppContext) => {
        // Fetch schema for 'problems' endpoint or use ticket schema as approximation
        return await getOutputSchemaForm(context, "problems", "problems", "Update a problem to see the output schema.");
      },
    },

    // Define the execution logic for update
    execute: async (context: AppContext): Promise<ExecutionPayload> => {
      try {
        const { workspace_id } = context.payload.config_fields as any;
        const { problem_id, ...eventData } = context.payload.data; // Extract problem_id

        if (!problem_id) {
          return { statusCode: 400, data: { error: "Problem ID is required for update." } };
        }

        // Build schema for 'update' to correctly identify fields
        const Inputschema = await buildProblemInputSchema(context, "update");
        // Generate payload, including workspace_id if the API requires it even for update
        const payload = generatePayload(Inputschema, eventData); // Pass eventData without problem_id
        const normalizedPayload: any = normalizeEventData(payload);

        // --- Handle Analysis Fields ---
        const analysisFieldMap: Record<string, string> = {
          pc_description: "problem_cause",
          pi_description: "problem_impact",
          ps_description: "problem_symptom",
        };
        let analysisFieldsModified = false;
        Object.entries(analysisFieldMap).forEach(([fieldKey, nestedKey]) => {
          if (normalizedPayload[fieldKey] !== undefined) {
            // Check if the field exists in the payload
            normalizedPayload.analysis_fields = normalizedPayload.analysis_fields || {};
            normalizedPayload.analysis_fields[nestedKey] = normalizedPayload.analysis_fields[nestedKey] || {};
            normalizedPayload.analysis_fields[nestedKey].description = normalizedPayload[fieldKey];
            delete normalizedPayload[fieldKey];
            analysisFieldsModified = true;
          }
        });
        // Only include analysis_fields if something was actually added/updated
        if (
          !analysisFieldsModified &&
          normalizedPayload.analysis_fields &&
          Object.keys(normalizedPayload.analysis_fields).length === 0
        ) {
          delete normalizedPayload.analysis_fields;
        } else if (!analysisFieldsModified) {
          delete normalizedPayload.analysis_fields; // Ensure it's removed if nothing was added
        }

        // --- Handle Attachments ---
        // Note: Updating attachments via PUT might replace existing ones.
        // The API might require a different endpoint or method for adding/removing attachments individually.
        // Assuming PUT replaces attachments based on the provided Assignattchments function.
        const body = removeEmpty(normalizedPayload);
        if (body.group_id) {
          if (body.group_id.toString().toLowerCase() === "none") {
            delete body.group_id;
          } else if (!isNaN(Number(body.group_id))) {
            body.group_id = Number(body.group_id);
          }
        }
        const finalPayload = await Assignattchments(context, body);
        if (finalPayload?.statusCode > 210) {
          return {
            statusCode: finalPayload.statusCode,
            data: {
              error: finalPayload,
            },
          };
        }
        const endpoint = `problems/${problem_id}`; // Target specific problem ID

        // Use PUT method for update, use ApiCallWithAttachment if attachments (FormData) are possible
        const result = await ApiCallWithAttachment(context, endpoint, "PUT", finalPayload);
        const { statusCode, data } = result;

        if (statusCode >= 200 && statusCode < 300) {
          const problem = result?.data?.problem as any;
          // Process attachments in response similar to create
          const attachments_url = problem?.attachments?.map((item: any) => item.attachment_url).join(",") || null;
          const attachment_ids = problem?.attachments?.map((item: any) => item.id) || [];
          return { statusCode, data: { ...problem, attachment_ids, attachments_url } };
        }

        return {
          statusCode,
          data: {
            error: data?.message || `Failed to update problem ${problem_id}.`,
            details: data?.errors || null,
          },
        };
      } catch (error: any) {
        return handleActionError(error, context, "Update Problem");
      }
    },

    sample: {
      // Provide a sample output reflecting an updated problem
      output: {
        id: 987,
        subject: "Network Outage - Resolved",
        description: "Root cause identified and fixed.",
        status: 4, // Example: Resolved
        priority: 3,
        impact: 3,
        updated_at: "2025-10-25T14:30:00Z", // Add updated_at
      },
    },
    ...actionsAlloption,
  },
  delete_problem: {
    id: "delete_problem",
    name: "Delete Problem",
    title: "Delete Problem",
    subtitle: "Deletes a specific problem by its ID.",
    description: "Permanently deletes a problem record using its unique ID.",
    pick_lists: {},
    // 📝 Defines the input field: the ID of the problem to delete.
    input_schema: {
      fields: async () => [
        {
          name: "problem_id", // Changed from change_id
          label: "Problem ID",
          type: "number",
          control_type: "number",
          optional: false,
          hint: "The unique ID of the problem record to delete.",
        },
      ],
    },

    // 📤 Defines the simple success/error output structure.
    output_schema: {
      fields: async () => [
        { name: "success", label: "Success", type: "boolean" },
        { name: "message", label: "Message", type: "string", optional: true },
        { name: "error", label: "Error", type: "string", optional: true },
      ],
    },

    // 🚀 The core logic that executes the delete request.
    execute: async (context: AppContext): Promise<ExecutionPayload> => {
      const { problem_id } = context.payload.data; // Use problem_id

      if (!problem_id) {
        return {
          statusCode: 400,
          data: { success: false, error: "Problem ID is required." }, // Updated error message
        };
      }

      const endpoint = `problems/${problem_id}`; // Target the 'problems' endpoint

      try {
        const result = await makeApiCall(context, endpoint, "DELETE");
        const { statusCode, data } = result;

        // ✅ Success (Usually 204 No Content for DELETE)
        if (statusCode >= 200 && statusCode < 300) {
          return {
            statusCode: 200, // Return 200 OK for consistency
            data: { success: true, message: `Problem ${problem_id} deleted successfully.` }, // Updated success message
          };
        }

        // 🤷 Not Found (404)
        if (statusCode === 404) {
          return {
            statusCode: 404,
            data: { success: false, error: `Problem with ID ${problem_id} not found.` }, // Updated error message
          };
        }

        // ❌ Other Errors
        const errorMessage = data?.message || data?.description || `Failed to delete problem ${problem_id}.`; // Updated error message
        return {
          statusCode,
          data: {
            success: false,
            error: errorMessage,
            details: data?.errors || null,
          },
        };
      } catch (error: any) {
        return handleActionError(error, context, "Delete Problem"); // Updated operation name
      }
    },

    // 📊 Provides a sample output for a successful deletion.
    sample: {
      output: {
        success: true,
        message: "Problem 987 deleted successfully.", // Updated sample message
      },
    },
    retry_on_response: [],
    retry_on_request: [],
    max_retries: 0,
    help: "",
    display_priority: 0,
    batch: false,
    batch_size: 0,
    bulk: false,
    deprecated: false,
    cursor_enabled: true,
    has_config_fields: false,
    config_fields: {
      fields: async () => [],
    },
  },
  create_service_request: {
    id: "create_service_request",
    name: "Create Service Request",
    title: "Create Service Request",
    subtitle: "Requests an item from the service catalog.",
    description: "Places a request for a specific service catalog item, filling out its associated form.",

    // ⚙️ Config fields to select the category and item first.
    has_config_fields: true,
    config_fields: {
      fields: async (context: AppContext) => {
        const categories = await getServiceCategories(context);
        return [
          {
            name: "category_id",
            label: "Service Category",
            type: "string",
            control_type: "select",
            optional: false,
            hint: "Select the category of the service item.",
            pick_list: categories,
          },
          {
            name: "item_id",
            label: "Service Item",
            type: "string",
            control_type: "select",
            optional: false,
            function: "getServiceItemsByCategory", // Reference registered picklist function
            dependentTo: ["category_id"], // Make this field dependent
            hint: "Select the specific service item to request.",
          },
        ];
      },
    },

    // 📝 Dynamically generates the input form based on the selected item.
    input_schema: {
      fields: async (context: AppContext) => buildServiceRequestInputSchema(context, "create"),
    },

    // 📤 Defines the output, which is typically the created ticket/request details.
    output_schema: {
      fields: async (context: AppContext) => {
        return await getOutputSchemaForm(
          context,
          "tickets?updated_since=1990-01-01T02:00:00Z&order_type=desc&per_page=100&page=1",
          "tickets",
          "Create a ticket in the account"
        );
      },
    },

    // 🚀 The core logic to process inputs and place the request.
    execute: async (context: AppContext): Promise<ExecutionPayload> => {
      const itemId = context.payload.config_fields?.item_id;
      if (!itemId) {
        return { statusCode: 400, data: { error: "Service Item ID is missing from configuration." } };
      }

      try {
        const eventData = context.payload.data;
        if (!eventData.email) {
          return { statusCode: 400, data: { error: "Requester Email ID is missing." } };
        }
        // const payload = processServiceRequestPayload(context, noramalizedEventdata);
        const Inputschema = await buildServiceRequestInputSchema(context, "create");
        const payload = generatePayload(Inputschema, eventData);
        const noramalizedEventdata = normalizeEventData(payload);
        const endpoint = `service_catalog/items/${itemId}/place_request`;
        removeEmpty(noramalizedEventdata);
        const result = await makeApiCall(context, endpoint, "POST", noramalizedEventdata);
        const { statusCode, data } = result;

        if (statusCode >= 200 && statusCode < 300) {
          // Adjust the response key based on actual API output ('service_request', 'ticket', etc.)
          const service_request = data?.service_request;
          const attachments_url =
            service_request?.attachments && service_request?.attachments.length
              ? service_request.attachments.map((item) => item.attachment_url).join(",")
              : "";
          const attachment_ids =
            service_request?.attachments && service_request?.attachments.length
              ? service_request.attachments.map((item) => item.id)
              : "";
          const first_attachment_id = service_request?.attachments?.[0]?.id || null;
          return { statusCode, data: { ...service_request, attachments_url, attachment_ids, first_attachment_id } };
        }

        return {
          statusCode,
          data: {
            error: data?.message || "Failed to create service request.",
            details: data?.errors || null,
          },
        };
      } catch (error: any) {
        return handleActionError(error, context, "Create Service Request");
      }
    },

    // ✨ Register the dynamic picklist functions
    pick_lists: {
      getServiceItemsByCategory,
      Requestparent1dependent1,
      Requestparent1dependent2,
      Requestparent2dependent1,
      Requestparent2dependent2,
      Requestparent3dependent1,
      Requestparent3dependent2,
      Requestparent4dependent1,
      Requestparent4dependent2,
      Requestparent5dependent1,
      Requestparent5dependent2,
      Requestparent6dependent1,
      Requestparent6dependent2,
    },

    // 📊 Sample data
    sample: {
      // Sample output might resemble a ticket object
      output: {
        id: 12345,
        subject: "Service Request for New Laptop",
        status: 2, // Example status code for 'Open'
        requester_id: 1001,
        // ... other relevant fields
      },
    },
    ...actionsAlloption,
  },
  create_child_service_request: {
    id: "create_child_service_request",
    name: "Create Child Service Request",
    title: "Create Child Service Request",
    subtitle: "Requests a service item as a child of an existing ticket.",
    description: "Places a request for a specific service catalog item, linking it as a child to a parent ticket.",

    // Config fields are the same as create_service_request
    has_config_fields: true,
    config_fields: {
      fields: async (context: AppContext) => {
        const categories = await getServiceCategories(context);
        return [
          {
            name: "category_id",
            label: "Service Category",
            type: "string",
            control_type: "select",
            optional: false,
            hint: "Select the category of the service item.",
            pick_list: categories,
          },
          {
            name: "item_id",
            label: "Service Item",
            type: "string",
            control_type: "select",
            optional: false,
            function: "getServiceItemsByCategory", // Reference registered picklist function
            dependentTo: ["category_id"], // Make this field dependent
            hint: "Select the specific service item to request.",
          },
        ];
      },
    },

    // Input schema uses the 'child' mode
    input_schema: {
      fields: async (context: AppContext) => buildServiceRequestInputSchema(context, "child"),
    },
    // Output schema is likely the same as create
    output_schema: {
      fields: async (context: AppContext) => {
        return await getOutputSchemaForm(
          context,
          "tickets?updated_since=1990-01-01T02:00:00Z&order_type=desc&per_page=100&page=1",
          "tickets",
          "Create a ticket in the account"
        );
      },
    },

    // Execute method uses the 'child' logic check
    execute: async (context: AppContext): Promise<ExecutionPayload> => {
      const itemId = context.payload.config_fields?.item_id;
      if (!itemId) {
        return { statusCode: 400, data: { error: "Service Item ID is missing from configuration." } };
      }

      try {
        const eventData = context.payload.data;
        // Specific checks for child mode
        if (!eventData.parent_ticket_id) {
          return { statusCode: 400, data: { error: "Parent Ticket ID is missing." } };
        }
        if (!eventData.email) {
          return { statusCode: 400, data: { error: "Requester Email ID is missing." } };
        }

        const Inputschema = await buildServiceRequestInputSchema(context, "child");
        const payload = generatePayload(Inputschema, eventData);
        //console.log(payload);
        const noramalizedEventdata = normalizeEventData(payload);
        const endpoint = `service_catalog/items/${itemId}/place_request`;
        removeEmpty(noramalizedEventdata);
        const result = await makeApiCall(context, endpoint, "POST", noramalizedEventdata);
        const { statusCode, data } = result;

        if (statusCode >= 200 && statusCode < 300) {
          const service_request = data?.service_request;
          const attachments_url =
            service_request?.attachments && service_request?.attachments.length
              ? service_request.attachments.map((item) => item.attachment_url).join(",")
              : "";
          const attachment_ids =
            service_request?.attachments && service_request?.attachments.length
              ? service_request.attachments.map((item) => item.id)
              : [];
          const first_attachment_id = service_request?.attachments?.[0]?.id || null;
          return { statusCode, data: { ...service_request, attachments_url, attachment_ids, first_attachment_id } };
        }

        return {
          statusCode,
          data: { error: data?.message || "Failed to create child service request.", details: data?.errors || null },
        };
      } catch (error: any) {
        return handleActionError(error, context, "Create Child Service Request");
      }
    },

    // Register picklists (reuse from create)
    pick_lists: {
      getServiceItemsByCategory,
      Requestparent1dependent1,
      Requestparent1dependent2,
      Requestparent2dependent1,
      Requestparent2dependent2,
      Requestparent3dependent1,
      Requestparent3dependent2,
      Requestparent4dependent1,
      Requestparent4dependent2,
      Requestparent5dependent1,
      Requestparent5dependent2,
      Requestparent6dependent1,
      Requestparent6dependent2,
    },

    sample: {
      output: {
        /* Similar to create_service_request sample */
      },
    },
    ...actionsAlloption,
  },
  update_service_request: {
    id: "update_service_request",
    name: "Update Service Request Item",
    title: "Update Requested Item",
    subtitle: "Updates a requested item within a service request ticket.",
    description: "Updates the status and custom fields of a specific requested item linked to a ticket.",

    has_config_fields: true,
    config_fields: {
      fields: async (context: AppContext) => {
        // Fetch categories for item selection (needed to get item_id for schema)
        const categories = await getServiceCategories(context);
        return [
          {
            name: "category_id",
            label: "Service Category",
            type: "string",
            control_type: "select",
            optional: false,
            pick_list: categories,
            hint: "Select category to find the item.",
          },
          {
            name: "item_id",
            label: "Service Item",
            type: "string",
            control_type: "select",
            optional: false,
            function: "getServiceItemsByCategory",
            dependentTo: ["category_id"],
            hint: "Select the type of item being updated to load correct fields.",
          },
        ];
      },
    },

    input_schema: {
      // Input schema uses 'update' mode. Pass item_id from config indirectly or add it to data
      fields: async (context: AppContext) => {
        // Temporarily add item_id to data payload for schema builder if needed
        return buildServiceRequestInputSchema(context as AppContext, "update");
      },
    },

    output_schema: {
      fields: async (context: AppContext) => {
        // Output is likely the updated 'requested_item' object
        // Fetch a sample requested item for schema generation if possible,
        // otherwise, use a static representation or ticket schema.
        // Using ticket schema as fallback.
        const { statusCode, data: itemDetails } = await makeApiCall(
          context,
          `service_catalog/items/${context.payload.config_fields.item_id}`,
          "GET"
        );
        //console.log(itemDetails);
        if (statusCode > 210) {
          throw new Error(itemDetails?.message ? itemDetails.message : "something went wrong");
        }

        const customItemFields = itemDetails?.service_item.custom_fields || [];
        const custom_fields = buildDublicateCustomObjects(customItemFields);
        //console.log(custom_fields);
        const sampleData = {
          id: 29001052725,
          from_date: null,
          to_date: null,
          item_id: 12,
          location: null,
          quantity: 2,
          service_request_id: 29011863378,
          remarks: "for wrongly updated",
          is_parent: true,
          fulfilled_quantity: 0,
          stage: {
            id: 3,
            name: "Cancelled",
          },
          cost: "2198.00",
          ticket_id: 3967,
          document_fulfilled: false,
          custom_fields: custom_fields,
          item: {
            id: 29001039781,
            name: "Apple iMac",
            display_id: 12,
            deleted: false,
            item_type: {
              id: 1,
              name: "permanent",
            },
            workspace_id: 2,
            cost_visibility: true,
            quantity_visibility: true,
            icon_detail: {
              name: "apple-imac-new.png",
              type: "image/png",
              url: "https://assets3.freshservice.com/assets/cdn-ignored/sprites/service-catalog/apple-imac-new-08779b50c316012bd2d5af93787ec4974dc443948e29d809cf81444a58f9085e.png",
            },
            attachment_mandatory: false,
            ci_type: {
              id: 29004479283,
              name: "computer_732609",
              label: "Computer",
              is_consumable: false,
            },
            product: {},
            short_description: "Request for a new Apple iMac.",
            description:
              '<p class="fixture-sitem">27-inch (diagonal) LED-backlit display with IPS technology; 2560*1440 resolution with\n                  support for millions of colours</p><p></p><p>PRODUCT FEATURES</p><p>3.2GHz quad-core Intel Core i5 processor\n                  (Turbo Boost upto 3.6 GHz) with 6MB L3 cache</p><p>8GB (two 4GB) of 1600 MHz DDR3 memory</p><p>1TB (7200-rpm)\n                  hard drive</p><p>NVIDIA GeForce GT 755M graphics processor with 1GB of GDDR5 memory</p><p>FaceTime HD camera</p>\n                  <p></p><p></p>\n',
          },
        };
        return GenerateSchema(sampleData);
        // Ideally: return await getOutputSchema(context, `tickets/SOME_ID/requested_items`, "Update item...")
      },
    },

    execute: async (context: AppContext): Promise<ExecutionPayload> => {
      const { ticket_id, requested_item_id, ...eventData } = context.payload.data;
      const itemIdForSchema = context.payload.config_fields?.item_id; // Used to build schema
      const stage = (context.payload?.config_fields?.stage as string) || null;
      if (!ticket_id || !requested_item_id) {
        return { statusCode: 400, data: { error: "Ticket ID and Requested Item ID are required." } };
      }
      if (!itemIdForSchema) {
        return {
          statusCode: 400,
          data: { error: "Service Item must be selected in configuration to determine fields." },
        };
      }

      try {
        // Temporarily add item_id to data payload for schema builder

        const Inputschema = await buildServiceRequestInputSchema(context as AppContext, "update");
        //console.log(stage);
        const payload = generatePayload(Inputschema, { ...eventData });
        //console.log(payload);
        const noramalizedEventdata = normalizeEventData(payload); // Use original data
        // Handle cancellation remarks
        if (stage === "3" && !noramalizedEventdata.remarks) {
          return {
            statusCode: 400,
            data: { error: "Reason for cancellation (remarks) is required when status is Cancelled." },
          };
        }
        const endpoint = `tickets/${ticket_id}/requested_items/${requested_item_id}`;
        const result = await makeApiCall(context, endpoint, "PUT", noramalizedEventdata); // Use PUT for update
        const { statusCode, data } = result;

        if (statusCode >= 200 && statusCode < 300) {
          // Adjust response key based on API ('requested_item', etc.)
          return { statusCode, data: data.requested_item || data };
        }

        return {
          statusCode,
          data: { error: data?.message || "Failed to update service request item.", details: data?.errors || null },
        };
      } catch (error: any) {
        return handleActionError(error, context, "Update Service Request Item");
      }
    },

    // Register picklists
    pick_lists: {
      getServiceItemsByCategory,
      Requestparent1dependent1,
      Requestparent1dependent2,
      Requestparent2dependent1,
      Requestparent2dependent2,
      Requestparent3dependent1,
      Requestparent3dependent2,
      Requestparent4dependent1,
      Requestparent4dependent2,
      Requestparent5dependent1,
      Requestparent5dependent2,
      Requestparent6dependent1,
      Requestparent6dependent2,
    },
    ...actionsAlloption,
    sample: {
      output: {
        id: 54321,
        ticket_id: 12345,
        status: 3,
      },
    },
  },
  // --- NEW ONBOARDING ACTIONS ---
  create_employee_onboarding: {
    id: "create_employee_onboarding",
    name: "Create Employee Onboarding Request",
    title: "Create Employee Onboarding Request",
    subtitle: "Initiate a new employee onboarding process.",
    description: "Creates a formal request to onboard a new employee, triggering associated workflows.",
    // input_schema: object_definitions.onboarding_request_input_schema,
    pick_lists: {
      DynamicFunctionGetoffboardcategory0,
      DynamicFunctionGetoffboardcategory1,
      DynamicFunctionGetonboardcategory0,
      DynamicFunctionGetonboardcategory1,
    },

    input_schema: {
      ///  const ticketsResp = await makeApiCall(ctx, "offboarding_requests/form", "GET");
      //  const tickets = ticketsResp.data;

      fields: async (context: AppContext): Promise<any> => await inputOnboarding(context),
    },

    //inputOnboarding
    output_schema: {
      fields: async (context: AppContext) =>
        getOutputSchema(context, "onboarding_requests", "Create On-Boarding Request In Your Acoount"),
    },
    execute: async (context: AppContext): Promise<ExecutionPayload> => {
      try {
        const input: any = await inputOnboarding(context);
        const payload: any = { ...context.payload.data };
        // //console.log("payload", payload);

        const parsedEventData: any = await parsePostData(input, payload);
        // //console.log("parsedEventData===>", parsedEventData);

        const updatedEventData = Object.entries(parsedEventData).reduce((result: any, [key, value]) => {
          const newKey: any = key.replace(/dynamic_\d+_/, "");
          result[newKey] = value;
          return result;
        }, {});
        // //console.log("updatedEventData", updatedEventData);

        const changedData = [{ fields: updatedEventData }];
        // //console.log("changedData[0]====>", changedData[0]);

        const result = await makeApiCall(context, "onboarding_requests", "POST", changedData[0]);

        if (!result) {
          return { statusCode: 500, data: { error: "No response from the FreshService API." } };
        }

        const { statusCode, data } = result;

        // Success
        if (statusCode >= 200 && statusCode < 300) {
          return { statusCode, data: data.onboarding_request };
        }

        // Handle 400 with detailed messages
        if (statusCode === 400) {
          let message = "";

          // Primary error message
          if (data?.error?.message) {
            message = data.error.message;
          } else if (data?.message) {
            message = data.message; // fallback for responses like yours
          }

          // Validation errors array
          const errorsArray = data?.error?.errors || data?.errors;
          if (Array.isArray(errorsArray)) {
            for (const err of errorsArray) {
              if (err?.message) {
                message += (message ? " AND " : "") + `${err.field || ""}: ${err.message}`.trim();
              }
            }
          }

          return {
            statusCode,
            data: { error: message || "Unknown validation error occurred." },
          };
        }

        return { statusCode, data };
      } catch (error: any) {
        return {
          statusCode: error.statusCode || 500,
          error: error.message || "Unknown error",
        };
      }
    },

    retry_on_response: [],
    retry_on_request: [],
    max_retries: 0,
    help: "",
    display_priority: 0,
    batch: false,
    batch_size: 0,
    bulk: false,
    deprecated: false,
    cursor_enabled: true,
    has_config_fields: false,
    config_fields: { fields: async () => [] },
    sample: { fields: async () => [] },
  }, //dependent need to test
  view_onboarding_request: {
    id: "view_onboarding_request",
    name: "View Onboarding Request",
    title: "View Onboarding Request",
    subtitle: "Get details of a specific onboarding request.",
    description: "Retrieves complete information for a single employee onboarding request by its ID.",
    pick_lists: {},
    input_schema: {
      fields: async (context: AppContext): Promise<any> => {
        const result: any = [
          {
            name: "id",
            label: "ID",
            type: "string",
            optional: "false",
            control_type: "text",
          },
        ];
        return result;
      },
    },
    output_schema: {
      fields: async (context: AppContext) => {
        const schema = await getOutputSchema(
          context,
          "onboarding_requests",
          "Create On-Boarding Request In Your Acoount"
        );
        if (schema?.error) throw new Error(schema.error);
        return [
          ...schema,
          { name: "dataFound", type: "boolean", label: "Data Found", control_type: "text", optional: false },
        ];
      },
    },
    execute: async (context: AppContext): Promise<ExecutionPayload> => {
      const { id } = context.payload.data;

      if (!id) {
        return { statusCode: 400, data: { error: "ID is required." } };
      }

      try {
        const result = await makeApiCall(context, `onboarding_requests/${id}`, "GET");
        //  //console.log("⬅️ Raw result from makeApiCall:", result);

        if (!result) {
          //   //console.log("❌ No response from Freshservice API.");
          return {
            statusCode: 500,
            data: { error: "No response from Freshservice API." },
          };
        }

        const { statusCode, data } = result;

        // ✅ Success (200 with data)
        if (statusCode >= 200 && statusCode < 300 && data?.onboarding_request) {
          //  //console.log("✅ Onboarding request found:", data.onboarding_request);
          return {
            statusCode: 200,
            data: { ...data.onboarding_request, dataFound: true },
          };
        }

        // ✅ Not found → treat as 200 with `dataFound: false`
        if (statusCode === 404 || statusCode === 204) {
          //  //console.log(`ℹ️ Onboarding request not found (status ${statusCode}).`);
          return {
            statusCode: 200,
            data: { dataFound: false },
          };
        }

        // ⚠️ Other client errors (400, 422)
        if ([400, 422].includes(statusCode)) {
          const message = data?.message || data?.error?.message || "Invalid request.";
          //  //console.log("❌ Client error:", message);
          return { statusCode, data: { error: message } };
        }

        // 🚫 Auth errors (401, 403)
        if ([401, 403].includes(statusCode)) {
          const message = data?.message || "Authentication failed or access denied.";
          //  //console.log("❌ Auth error:", message);
          return { statusCode, data: { error: message } };
        }

        // 💥 Server errors (500+)
        if (statusCode >= 500) {
          const message = data?.message || "Internal server error occurred.";
          //  //console.log("❌ Server error:", message);
          return { statusCode, data: { error: message } };
        }

        // ❓ Unknown / unexpected status
        //  //console.log("❌ Unexpected response:", result);
        return {
          statusCode,
          data: { error: `Unexpected API response (${statusCode}).` },
        };
      } catch (error: any) {
        return {
          statusCode: 500,
          data: { error: error.message || "Unexpected error fetching onboarding request." },
        };
      }
    },

    retry_on_response: [],
    retry_on_request: [],
    max_retries: 0,
    help: "",
    display_priority: 0,
    batch: false,
    batch_size: 0,
    bulk: false,
    deprecated: false,
    cursor_enabled: true,
    has_config_fields: false,
    config_fields: { fields: async () => [] },
    sample: { fields: async () => [] },
  },

  // --- NEW OFFBOARDING ACTIONS ---
  create_employee_offboarding: {
    id: "create_employee_offboarding",
    name: "Create Employee Offboarding Request",
    title: "Create Employee Offboarding Request",
    subtitle: "Initiate a new employee offboarding process.",
    description: "Creates a formal request to offboard a departing employee, triggering associated workflows.",
    pick_lists: {
      DynamicFunctionGetoffboardcategory0,
      DynamicFunctionGetoffboardcategory1,
      DynamicFunctionGetonboardcategory0,
      DynamicFunctionGetonboardcategory1,
    },

    input_schema: {
      fields: async (context: AppContext): Promise<any> => await inputOffboarding(context),
    },
    output_schema: {
      fields: async (context: AppContext) =>
        getOutputSchema(context, "offboarding_requests", "Create On-Boarding Request In Your Acoount"),
    },
    execute: async (context: AppContext): Promise<ExecutionPayload> => {
      try {
        const input: any = await inputOffboarding(context);
        const payload: any = { ...context.payload.data };
        //  //console.log("payload", payload);

        const parsedEventData: any = await parsePostData(input, payload);
        //  //console.log("parsedEventData===>", parsedEventData);

        const updatedEventData = Object.entries(parsedEventData).reduce((result: any, [key, value]) => {
          const newKey: any = key.replace(/dynamic_\d+_/, "");
          result[newKey] = value;
          return result;
        }, {});
        //  //console.log("updatedEventData", updatedEventData);

        const changedData = [{ fields: updatedEventData }];
        //   //console.log("changedData[0]====>", changedData[0]);

        const result = await makeApiCall(context, "offboarding_requests", "POST", changedData[0]);

        if (!result) {
          return { statusCode: 500, data: { error: "No response from the FreshService API." } };
        }

        const { statusCode, data } = result;

        // Success
        if (statusCode >= 200 && statusCode < 300) {
          return { statusCode, data: data.offboarding_request };
        }

        // Handle 400 with detailed messages
        if (statusCode === 400) {
          let message = "";

          // Primary error message
          if (data?.error?.message) {
            message = data.error.message;
          } else if (data?.message) {
            message = data.message; // fallback for responses like yours
          }

          // Validation errors array
          const errorsArray = data?.error?.errors || data?.errors;
          if (Array.isArray(errorsArray)) {
            for (const err of errorsArray) {
              if (err?.message) {
                message += (message ? " AND " : "") + `${err.field || ""}: ${err.message}`.trim();
              }
            }
          }

          return {
            statusCode,
            data: { error: message || "Unknown validation error occurred." },
          };
        }

        return { statusCode, data };
      } catch (error: any) {
        return {
          statusCode: error.statusCode || 500,
          error: error.message || "Unknown error",
        };
      }
    },
    retry_on_response: [],
    retry_on_request: [],
    max_retries: 0,
    help: "",
    display_priority: 0,
    batch: false,
    batch_size: 0,
    bulk: false,
    deprecated: false,
    cursor_enabled: true,
    has_config_fields: false,
    config_fields: { fields: async () => [] },
    sample: { fields: async () => [] },
  }, //multi select need to test
  view_offboarding_request: {
    id: "view_offboarding_request",
    name: "View Offboarding Request",
    title: "View Offboarding Request",
    subtitle: "Get details of a specific offboarding request.",
    description: "Retrieves complete information for a single employee offboarding request by its ID.",
    pick_lists: {},
    input_schema: {
      fields: async (context: AppContext): Promise<any> => {
        const result: any = [
          {
            name: "id",
            label: "ID",
            type: "string",
            optional: "false",
            control_type: "text",
          },
        ];
        return result;
      },
    },
    output_schema: {
      fields: async (context: AppContext) => {
        const schema = await getOutputSchema(
          context,
          "offboarding_requests",
          "Create Off-Boarding Request In Your Acoount"
        );
        if (schema?.error) throw new Error(schema.error);
        return [
          ...schema,
          { name: "dataFound", type: "boolean", label: "Data Found", control_type: "text", optional: false },
        ];
      },
    },

    execute: async (context: AppContext): Promise<ExecutionPayload> => {
      const { id } = context.payload.data;

      if (!id) {
        return { statusCode: 400, data: { error: "ID is required." } };
      }

      try {
        const result = await makeApiCall(context, `offboarding_requests/${id}`, "GET");
        //  //console.log("⬅️ Raw result from makeApiCall:", result);

        if (!result) {
          ////console.log("❌ No response from Freshservice API.");
          return {
            statusCode: 500,
            data: { error: "No response from Freshservice API." },
          };
        }

        const { statusCode, data } = result;

        // ✅ Success (200 with data)
        if (statusCode >= 200 && statusCode < 300 && data?.offboarding_request) {
          /// //console.log("✅ Offboarding request found:", data.offboarding_request);
          return {
            statusCode: 200,
            data: { ...data.offboarding_request, dataFound: true },
          };
        }

        // ✅ Not found → treat as 200 with `dataFound: false`
        if (statusCode === 404 || statusCode === 204) {
          // //console.log(`ℹ️ Offboarding request not found (status ${statusCode}).`);
          return {
            statusCode: 200,
            data: { dataFound: false },
          };
        }

        // ⚠️ Other client errors (400, 422)
        if ([400, 422].includes(statusCode)) {
          const message = data?.message || data?.error?.message || "Invalid request.";
          //  //console.log("❌ Client error:", message);
          return { statusCode, data: { error: message } };
        }

        // 🚫 Auth errors (401, 403)
        if ([401, 403].includes(statusCode)) {
          const message = data?.message || "Authentication failed or access denied.";
          // //console.log("❌ Auth error:", message);
          return { statusCode, data: { error: message } };
        }

        // 💥 Server errors (500+)
        if (statusCode >= 500) {
          const message = data?.message || "Internal server error occurred.";
          //  //console.log("❌ Server error:", message);
          return { statusCode, data: { error: message } };
        }

        // ❓ Unknown / unexpected status
        // //console.log("❌ Unexpected response:", result);
        return {
          statusCode,
          data: { error: `Unexpected API response (${statusCode}).` },
        };
      } catch (error: any) {
        return {
          statusCode: 500,
          data: { error: error.message || "Unexpected error fetching offboarding request." },
        };
      }
    },
    retry_on_response: [],
    retry_on_request: [],
    max_retries: 0,
    help: "",
    display_priority: 0,
    batch: false,
    batch_size: 0,
    bulk: false,
    deprecated: false,
    cursor_enabled: true,
    has_config_fields: false,
    config_fields: { fields: async () => [] },
    sample: { fields: async () => [] },
  },

  // --- NEW JOURNEY ACTIVITY ACTIONS ---

  create_journey_activity: {
    id: "create_journey_activity",
    name: "Create Journey",
    title: "Create Journey",
    subtitle: "Create a new journey request.",
    description: "Create a new journey request.",
    input_schema: {
      fields: async (context: AppContext): Promise<any> => {
        // //console.log("Config Journey ID ====>", context?.payload.config_fields?.journey_id);
        const journeyFormFields: any = await makeApiCall(
          context,
          `journeys/configs/${context?.payload.config_fields?.journey_id}/data-fields`,
          "GET"
        );
        // //console.log("Journey Form Fields======>", journeyFormFields);

        const inputSchema = await buildInputSchema(context, journeyFormFields.data?.fields || [], false);

        //console.log("Final Input =====>", JSON.stringify(inputSchema));

        return inputSchema;
      },
    },
    pick_lists: {},
    output_schema: {
      fields: async (context: AppContext) => {
        try {
          // 1️⃣ Get the Journey Type ID
          const journeyType: any = await getJourneyTypeById(context);
          if (!journeyType) throw new Error("Journey Type ID could not be resolved.");

          // 2️⃣ Prepare query body
          const body = {
            data: {
              query: {
                filter: [
                  {
                    attributes: [{ field: "type", operator: "is_in", value: [journeyType] }],
                  },
                ],
              },
            },
          };

          // 3️⃣ Fetch data
          const response = await makeApiCall(context, "journeys/requests/view", "POST", body);

          const { statusCode, data } = response;
          if (statusCode >= 400) {
            throw new Error(`Failed to fetch journey view data. ${data?.message || "Unknown error."}`);
          }
          // 4️⃣ Validate response
          if (!data?.meta || data.meta.count === 0) {
            throw new Error("No sample data found for the given Journey Type.");
          }

          const datat = await makeApiCall(context, `journeys/requests/${data.journey_requests[0].display_id}`, "GET");
          // //console.log(datat);
          const finalSchema2 = GenerateSchema(datat.data.journey_request);

          // // 5️⃣ Deep merge & flatten all entities
          // const mergedJourneyReqs = deepMergeAll(data.journey_requests ?? []);
          // //console.log("Mergeed Jouenry Re",mergedJourneyReqs)
          // const mergedUsers = deepMergeAll(data.users ?? []);
          //       //console.log("Mergeed users Re",mergedUsers)

          // const mergedJourneyTypes = deepMergeAll(data.journey_types ?? []);

          //       //console.log("Mergeed Jouenry types",mergedJourneyTypes)

          // // 6️⃣ Combine for a unified schema
          // const combinedData = {
          //   journey_requests: [mergedJourneyReqs],
          //   users:[ mergedUsers],
          //   journey_types:[ mergedJourneyTypes],
          // };

          // const finalSchema = GenerateSchema(combinedData);

          return finalSchema2;
        } catch (error: any) {
          throw new Error(error.message || "Unexpected error while building output schema.");
        }
      },
    },

    retry_on_response: [],
    retry_on_request: [],
    max_retries: 0,
    help: "",
    display_priority: 0,
    batch: false,
    batch_size: 0,
    bulk: false,
    deprecated: false,
    cursor_enabled: true,
    has_config_fields: true,
    config_fields: {
      fields: async (context: AppContext): Promise<any> => {
        const journeyType: any = await getJourneyType(context);
        //console.log("Jorney Type====>", journeyType);
        const result: any[] = [
          {
            name: "journey_id",
            label: "Journey",
            type: "string",
            control_type: "select",
            pick_list: journeyType,
          },
        ];
        return result;
      },
    },
    sample: { fields: async () => [] },
    execute: async (context: AppContext): Promise<ExecutionPayload> => {
      try {
        const { request_for, ...payload } = context.payload.data;
        const journey_id = context.payload.config_fields.journey_id;
        // Only include fields with values
        const custom_fields = Object.fromEntries(
          Object.entries(payload).filter(([_, v]) => v !== undefined && v !== null)
        );

        const body = {
          journey_id,
          initiator_data: {
            request_for,
            custom_fields,
          },
        };

        const result = await makeApiCall(context, "journeys/requests", "POST", body);

        if (!result) {
          return { statusCode: 500, data: { error: "No response from the FreshService API." } };
        }

        const { statusCode, data } = result;

        // Success
        if (statusCode >= 200 && statusCode < 300) {
          return { statusCode, data: data.journey_request };
        }

        // Handle 400 with detailed messages
        if (statusCode === 400) {
          let message = "";

          // Primary error message
          if (data?.error?.message) {
            message = data.error.message;
          } else if (data?.message) {
            message = data.message; // fallback for responses like yours
          }

          // Validation errors array
          const errorsArray = data?.error?.errors || data?.errors;
          if (Array.isArray(errorsArray)) {
            for (const err of errorsArray) {
              if (err?.message) {
                message += (message ? " AND " : "") + `${err.field || ""}: ${err.message}`.trim();
              }
            }
          }

          return {
            statusCode,
            data: { error: message || "Unknown validation error occurred." },
          };
        }

        return { statusCode, data };
      } catch (error: any) {
        return handleActionError(error, context, "Create Journey");
      }
    },
  },

  view_journey_activity: {
    id: "view_journey_activity",
    name: "View Journey",
    title: "View Journey",
    subtitle: "View a journey request.",
    description: "View a journey request.",
    pick_lists: {},
    input_schema: {
      fields: async (context: AppContext): Promise<any> => {
        const result: any[] = [
          {
            name: "id",
            label: "Journey ID",
            type: "string",
            control_type: "text",
            optional: "false",
          },
        ];
        return result;
      },
    },
    output_schema: {
      fields: async (context: AppContext) => {
        try {
          // 1️⃣ Get the Journey Type ID
          const journeyType: any = await getJourneyTypeById(context);
          if (!journeyType) throw new Error("Journey Type ID could not be resolved.");

          // 2️⃣ Prepare query body
          const body = {
            data: {
              query: {
                filter: [
                  {
                    attributes: [{ field: "type", operator: "is_in", value: [journeyType] }],
                  },
                ],
              },
            },
          };

          // 3️⃣ Fetch data
          const response = await makeApiCall(context, "journeys/requests/view", "POST", body);

          const { statusCode, data } = response;
          if (statusCode >= 400) {
            throw new Error(`Failed to fetch journey view data. ${data?.message || "Unknown error."}`);
          }
          // 4️⃣ Validate response
          if (!data?.meta || data.meta.count === 0) {
            throw new Error("No sample data found for the given Journey Type.");
          }

          const datat = await makeApiCall(context, `journeys/requests/${data.journey_requests[0].display_id}`, "GET");
          const finalSchema2 = GenerateSchema(datat.data);

          // // 5️⃣ Deep merge & flatten all entities
          // const mergedJourneyReqs = deepMergeAll(data.journey_requests ?? []);
          // //console.log("Mergeed Jouenry Re",mergedJourneyReqs)
          // const mergedUsers = deepMergeAll(data.users ?? []);
          //       //console.log("Mergeed users Re",mergedUsers)
          // const mergedJourneyTypes = deepMergeAll(data.journey_types ?? []);
          //       //console.log("Mergeed Jouenry types",mergedJourneyTypes)
          // // 6️⃣ Combine for a unified schema
          // const combinedData = {
          //   journey_requests: [mergedJourneyReqs],
          //   users:[ mergedUsers],
          //   journey_types:[ mergedJourneyTypes],
          // };
          // const finalSchema = GenerateSchema(combinedData);

          return [
            ...finalSchema2,
            { name: "dataFound", type: "boolean", label: "Data Found", control_type: "text", optional: false },
          ];
        } catch (error: any) {
          throw new Error(error.message || "Unexpected error while building output schema.");
        }
      },
    },
    config_fields: {
      fields: async (context: AppContext): Promise<any> => {
        const journeyType: any = await getJourneyType(context);
        // //console.log("Jorney Type====>", journeyType);
        const result: any[] = [
          {
            name: "journey_id",
            label: "Journey Type",
            type: "string",
            control_type: "select",
            pick_list: journeyType,
          },
        ];
        return result;
      },
    },
    execute: async (context: AppContext): Promise<ExecutionPayload> => {
      const { id } = context.payload.data;

      if (!id) {
        return { statusCode: 400, data: { error: "ID is required." } };
      }

      try {
        const result = await makeApiCall(context, `journeys/requests/${id}`, "GET");
        // //console.log("Result============>", result);
        const { statusCode, data } = result;

        // ✅ 1️⃣ Success (2xx)
        if (statusCode >= 200 && statusCode < 300) {
          // //console.log("data============>", data);
          return {
            statusCode,
            data: {
              ...(data || {}),
              dataFound: !!data, // Add dataFound flag
            },
          };
        }

        // ✅ 2️⃣ Not found → treat as 200 with `dataFound: false`
        if (statusCode === 404 || statusCode === 204) {
          // //console.log(`ℹ️ Journey request not found (status ${statusCode}).`);
          return {
            statusCode: 200,
            data: { dataFound: false },
          };
        }

        // ⚠️ 3️⃣ Client / Validation Errors (400, 422)
        if ([400, 422].includes(statusCode)) {
          let message = data?.message || data?.error?.message || "Invalid request.";

          // Detailed field-level validation
          if (Array.isArray(data?.errors) && data.errors.length > 0) {
            const details = data.errors.map((err: any) => `${err.field || "Field"}: ${err.message}`).join(" | ");
            message += message ? ` — ${details}` : details;
          }

          return {
            statusCode,
            data: { error: message },
          };
        }

        // 🚫 4️⃣ Authentication Errors (401, 403)
        if ([401, 403].includes(statusCode)) {
          const message = data?.message || "Authentication failed or access denied.";
          // //console.log("data error 2============>", data);
          return {
            statusCode,
            data: { error: message },
          };
        }

        // 💥 5️⃣ Server errors (500+)
        if (statusCode >= 500) {
          const message = data?.message || "Internal server error occurred.";
          //   //console.log("data error 3============>", data);
          return { statusCode, data: { error: message } };
        }

        // ❓ 6️⃣ Unknown / Unexpected Response
        return {
          statusCode,
          data: { error: `Unexpected API response (${statusCode}).` },
        };
      } catch (err: any) {
        const errorMessage = err?.message || "Unexpected error occurred during execution.";

        return {
          statusCode: 500,
          data: { error: errorMessage, dataFound: false },
        };
      }
    },

    retry_on_response: [],
    retry_on_request: [],
    max_retries: 0,
    help: "",
    display_priority: 0,
    batch: false,
    batch_size: 0,
    bulk: false,
    deprecated: false,
    cursor_enabled: true,
    has_config_fields: true,
    sample: function (context: AppContext): Promise<any> {
      throw new Error("Function not implemented.");
    },
  },
  update_journey_activity: {
    id: "update_journey_activity",
    name: "Update Journey Activity",
    title: "Update Journey Activity",
    subtitle: "Update a journey request.",
    description: "Update a journey request.",
    retry_on_response: [],
    retry_on_request: [],
    max_retries: 0,
    help: "",
    pick_lists: {},
    display_priority: 0,
    batch: false,
    batch_size: 0,
    bulk: false,
    deprecated: false,
    cursor_enabled: true,
    has_config_fields: true,
    input_schema: {
      fields: async (context: AppContext): Promise<any> => {
        // //console.log("Config Journey ID ====>", context?.payload.config_fields?.journey_id);

        // Fetch journey config form fields
        const journeyFormFields: any = await makeApiCall(
          context,
          `journeys/configs/${context?.payload.config_fields?.journey_id}/data-fields`,
          "GET"
        );
        ////console.log("Journey Form Fields ======>", journeyFormFields);
        // Safely extract the array
        const fields = journeyFormFields.data?.fields || [];

        // Build input schema first
        let inputSchema = await buildInputSchema(context, fields, true);

        ////console.log("Input Schema before filtering =====>", inputSchema);

        // Remove "request_for" after schema is built
        inputSchema = inputSchema.filter((f: any) => f.name !== "request_for");

        // Add ID field
        const IDField = {
          name: "id",
          label: "ID",
          type: "string",
          optional: false,
          control_type: "text",
        };

        const finalSchema = [IDField, ...inputSchema]; // add ID at the top

        ////console.log("Final Input Schema =====>", finalSchema);
        return finalSchema;
      },
    },

    output_schema: {
      fields: async (context: AppContext) => {
        try {
          // 1️⃣ Get the Journey Type ID
          const journeyType: any = await getJourneyTypeById(context);
          if (!journeyType) throw new Error("Journey Type ID could not be resolved.");

          // 2️⃣ Prepare query body
          const body = {
            data: {
              query: {
                filter: [
                  {
                    attributes: [{ field: "type", operator: "is_in", value: [journeyType] }],
                  },
                ],
              },
            },
          };

          // 3️⃣ Fetch data
          const response = await makeApiCall(context, "journeys/requests/view", "POST", body);

          const { statusCode, data } = response;
          if (statusCode >= 400) {
            throw new Error(`Failed to fetch journey view data. ${data?.message || "Unknown error."}`);
          }
          // 4️⃣ Validate response
          if (!data?.meta || data.meta.count === 0) {
            throw new Error("No sample data found for the given Journey Type.");
          }

          const datat = await makeApiCall(context, `journeys/requests/${data.journey_requests[0].display_id}`, "GET");
          // //console.log(datat);
          const finalSchema2 = GenerateSchema(datat.data.journey_request);

          // // 5️⃣ Deep merge & flatten all entities
          // const mergedJourneyReqs = deepMergeAll(data.journey_requests ?? []);
          // //console.log("Mergeed Jouenry Re",mergedJourneyReqs)
          // const mergedUsers = deepMergeAll(data.users ?? []);
          //       //console.log("Mergeed users Re",mergedUsers)

          // const mergedJourneyTypes = deepMergeAll(data.journey_types ?? []);

          //       //console.log("Mergeed Jouenry types",mergedJourneyTypes)

          // // 6️⃣ Combine for a unified schema
          // const combinedData = {
          //   journey_requests: [mergedJourneyReqs],
          //   users:[ mergedUsers],
          //   journey_types:[ mergedJourneyTypes],
          // };

          // const finalSchema = GenerateSchema(combinedData);

          return finalSchema2;
        } catch (error: any) {
          throw new Error(error.message || "Unexpected error while building output schema.");
        }
      },
    },
    config_fields: {
      fields: async (context: AppContext): Promise<any> => {
        const journeyType: any = await getJourneyType(context);
        // //console.log("Jorney Type====>", journeyType);
        const result: any[] = [
          {
            name: "journey_id",
            label: "Journey",
            type: "string",
            control_type: "select",
            pick_list: journeyType,
          },
        ];
        return result;
      },
    },
    sample: { fields: async () => [] },
    execute: async (context: AppContext): Promise<ExecutionPayload> => {
      try {
        const { request_for, id, ...payload } = context.payload.data;
        const journey_id = context.payload.config_fields.journey_id;

        // Only include fields with values
        const custom_fields = Object.fromEntries(
          Object.entries(payload).filter(([_, v]) => v !== undefined && v !== null)
        );

        const body = {
          initiator_data: {
            custom_fields,
          },
        };

        const result = await makeApiCall(context, `journeys/requests/${id}`, "PATCH", body);

        if (!result) {
          return { statusCode: 500, data: { error: "No response from the FreshService API." } };
        }

        const { statusCode, data } = result;

        // Success
        if (statusCode >= 200 && statusCode < 300) {
          return { statusCode, data: data.journey_request };
        }

        // Handle 400 with detailed messages
        if (statusCode === 400) {
          let message = "";

          // Primary error message
          if (data?.error?.message) {
            message = data.error.message;
          } else if (data?.message) {
            message = data.message; // fallback for responses like yours
          }

          // Validation errors array
          const errorsArray = data?.error?.errors || data?.errors;
          if (Array.isArray(errorsArray)) {
            for (const err of errorsArray) {
              if (err?.message) {
                message += (message ? " AND " : "") + `${err.field || ""}: ${err.message}`.trim();
              }
            }
          }

          return {
            statusCode,
            data: { error: message || "Unknown validation error occurred." },
          };
        }

        return { statusCode, data };
      } catch (error: any) {
        return handleActionError(error, context, "Create Journey");
      }
    },
  },

  delete_journey_activity: {
    id: "delete_journey_activity",
    name: "Delete Journey",
    title: "Delete Journey",
    subtitle: "Delete a journey request.",
    description: "Delete a journey request.",
    retry_on_response: [],
    retry_on_request: [],
    max_retries: 0,
    pick_lists: {},
    help: "",
    display_priority: 0,
    batch: false,
    batch_size: 0,
    bulk: false,
    deprecated: false,
    cursor_enabled: true,
    has_config_fields: false,
    config_fields: { fields: async () => [] },
    sample: { fields: async () => [] },
    input_schema: {
      fields: async (context: AppContext): Promise<any> => {
        const result: any[] = [
          {
            name: "id",
            label: "Journey ID",
            type: "string",
            control_type: "text",
            optional: "false",
          },
        ];
        return result;
      },
    },
    output_schema: {
      fields: async () => [
        { name: "success", label: "Success", type: "boolean" },
        { name: "message", label: "Message", type: "string" },
      ],
    },
    execute: async (context: AppContext): Promise<ExecutionPayload> => {
      const { id } = context.payload.data;
      const path = `journeys/requests/${id}`;
      if (!id) {
        return { statusCode: 400, data: { error: "ID is required." } };
      }

      try {
        // 🔹 Perform DELETE request
        const result = await makeApiCall(context, path, "DELETE");
        const { statusCode, data } = result;

        // ✅ Success (2xx)
        if (statusCode >= 200 && statusCode < 300) {
          return {
            statusCode,
            data: { success: true, message: "Activity deleted successfully." },
          };
        }

        // ⚠️ Handle 400 / 404 / 422 client errors
        if (statusCode === 400 || statusCode === 404 || statusCode === 422) {
          let message = data?.message || data?.error?.message || "Invalid request.";

          // Field-level errors
          const errorsArray = data?.errors || data?.error?.errors;
          if (Array.isArray(errorsArray) && errorsArray.length > 0) {
            const details = errorsArray.map((err: any) => `${err.field || "Field"}: ${err.message}`).join(" | ");
            message += message ? ` — ${details}` : details;
          }

          return { statusCode, data: { error: message } };
        }

        // 🚫 Authentication / Permission errors
        if (statusCode === 401 || statusCode === 403) {
          const message =
            statusCode === 401
              ? "Authentication failed — please check your API key."
              : "You do not have permission to delete this journey request.";

          return { statusCode, data: { error: message } };
        }

        // 💥 Server errors
        if (statusCode >= 500) {
          const message = data?.message || "Internal server error occurred.";
          return { statusCode, data: { error: message } };
        }
        return { statusCode, data: { error: `Unexpected API response (${statusCode})` } };
      } catch (err: any) {
        const errorMessage = err?.message || "Unexpected error occurred during deletion.";
        return { statusCode: 500, data: { error: errorMessage } };
      }
    },
  },

  // =======================================================================
  //                                TICKETS
  // =======================================================================
  create_ticket: {
    id: "create_ticket",
    name: "Create Ticket",
    title: "Create Ticket",
    subtitle: "Create a new ticket in Freshservice",
    description: "Creates a new ticket with required and optional fields.",
    sample: async (context: AppContext) => {},
    pick_lists: {
      getLevelTwoTicketsValues: async (context: AppContext) => {
        context = {
          ...context,
          payload: {
            ...context.payload,
            config_fields: {
              ...context.payload.config_fields,
              module: "ticket",
            },
          },
        };
        return getLevelTwoTicketsValues(context);
      },
      getLevel3TicketsValues: async (context: AppContext) => {
        context = {
          ...context,
          payload: {
            ...context.payload,
            config_fields: {
              ...context.payload.config_fields,
              module: "ticket",
            },
          },
        };
        return getLevel3TicketsValues(context);
      },
      getAgentByGroupId: async (context: AppContext) => {
        context = {
          ...context,
          payload: {
            ...context.payload,
            config_fields: {
              ...context.payload.config_fields,
              module: "ticket",
            },
          },
        };
        return getAgentByGroupId(context);
      },
      ticketparent1dependent1,
      ticketparent1dependent2,
      ticketparent2dependent1,
      ticketparent2dependent2,
      ticketparent3dependent1,
      ticketparent3dependent2,
      ticketparent4dependent1,
      ticketparent4dependent2,
      ticketparent5dependent1,
      ticketparent5dependent2,
      ticketparent6dependent1,
      ticketparent6dependent2,
    },
    ...actionsAlloption,
    has_config_fields: true,
    config_fields: {
      fields: async (context): Promise<any> => {
        const workspaces = await getallWorkspaces(context);
        const data = [
          {
            name: "workspace_id",
            pick_list: workspaces,
            label: "Workspace ID",
            optional: false,
            type: "number",
            control_type: "select",
            hint: `Select workspace ID to retrive the respective ticket fields`,
          },
        ];
        return data;
      },
    },
    input_schema: {
      fields: async (context: AppContext): Promise<any> => {
        const inputSchema: any = await buildTicketInputSchema(context, "create");
        // //console.log(inputSchema);
        if (inputSchema?.statusCode > 210) {
          throw new Error(
            `Error in inputschema ${JSON.stringify(inputSchema.data)} - status of ${inputSchema.statusCode}` ||
              `something went wrong.cant able to fetch Inputschema- with a statusCode of${inputSchema.statusCode}`
          );
        }
        // //console.log("✅ Final Ticket Input Schema =====>", inputSchema);
        return inputSchema;
      },
    },

    output_schema: {
      fields: async (context: AppContext) => {
        return await getOutputSchemaForm(
          context,
          "tickets?updated_since=1990-01-01T02:00:00Z&order_type=desc&per_page=100&page=1&include=requester",
          "tickets",
          "Create a ticket in the account"
        );
      },
    },
    execute: async (context: AppContext): Promise<ExecutionPayload> => {
      const result = await createOrUpdateTicket(context, "tickets", "create");
      const { statusCode, data } = result;
      //console.log(data);
      if (statusCode >= 200 && statusCode < 300) {
        return { statusCode, data: data };
      }
      return { statusCode, data: { error: data } };
    },
  },
  update_ticket: {
    id: "update_ticket",
    name: "Update Ticket",
    title: "Update Ticket",
    subtitle: "Update an existing ticket by its ID",
    description: "Updates the properties of a specific ticket.",
    pick_lists: {
      getLevelTwoTicketsValues: async (context: AppContext) => {
        context = {
          ...context,
          payload: {
            ...context.payload,
            config_fields: {
              ...context.payload.config_fields,
              module: "ticket",
            },
          },
        };
        return getLevelTwoTicketsValues(context);
      },
      getLevel3TicketsValues: async (context: AppContext) => {
        context = {
          ...context,
          payload: {
            ...context.payload,
            config_fields: {
              ...context.payload.config_fields,
              module: "ticket",
            },
          },
        };
        return getLevel3TicketsValues(context);
      },
      getAgentByGroupId: async (context: AppContext) => {
        context = {
          ...context,
          payload: {
            ...context.payload,
            config_fields: {
              ...context.payload.config_fields,
              module: "ticket",
            },
          },
        };
        return getAgentByGroupId(context);
      },
      ticketparent1dependent1,
      ticketparent1dependent2,
      ticketparent2dependent1,
      ticketparent2dependent2,
      ticketparent3dependent1,
      ticketparent3dependent2,
      ticketparent4dependent1,
      ticketparent4dependent2,
      ticketparent5dependent1,
      ticketparent5dependent2,
      ticketparent6dependent1,
      ticketparent6dependent2,
    },
    ...actionsAlloption,
    has_config_fields: true,
    config_fields: {
      fields: async (context: AppContext): Promise<any> => {
        const workspaces = await getallWorkspaces(context);
        const data = [
          {
            name: "workspace_id",
            pick_list: workspaces,
            label: "Workspace ID",
            optional: false,
            type: "number",
            control_type: "select",
            hint: `Select workspace ID to retrive the respective ticket fields`,
          },
        ];
        return data;
      },
    },
    input_schema: {
      fields: async (context: AppContext): Promise<any> => {
        const inputSchema: any = await buildTicketInputSchema(context, "update");
        if (inputSchema?.statusCode > 210) {
          throw new Error(
            `Error in inputschema ${JSON.stringify(inputSchema.data)} - status of ${inputSchema.statusCode}` ||
              `something went wrong.cant able to fetch Inputschema- with a statusCode of${inputSchema.statusCode}`
          );
        }
        // //console.log("✅ Final Ticket Input Schema =====>", inputSchema);
        return inputSchema;
      },
    },

    output_schema: {
      fields: async (context: AppContext) => {
        return await getOutputSchemaForm(
          context,
          "tickets?updated_since=1990-01-01T02:00:00Z&order_type=desc&per_page=100&page=1",
          "tickets",
          "Create a ticket in your account to generate the schema."
        );
      },
    },
    execute: async (context: AppContext): Promise<ExecutionPayload> => {
      const { ticket_id } = context.payload.data;
      if (!ticket_id) {
        return { statusCode: 400, data: { error: "Ticket ID is required." } };
      }
      const result = await createOrUpdateTicket(context, `tickets/${ticket_id}`, "update");
      const { statusCode, data } = result;

      if (statusCode >= 200 && statusCode < 300) {
        return { statusCode, data: data.ticket ?? data };
      }
      return { statusCode, data: { error: data } };
    },
    sample: async (context: AppContext) => {},
  },
  create_child_ticket: {
    id: "create_child_ticket",
    name: "Create Child Ticket",
    title: "Create Child Ticket",
    subtitle: "Update an existing ticket by its ID",
    description: "Updates the properties of a specific ticket.",
    ...actionsAlloption,
    has_config_fields: true,
    config_fields: {
      fields: async (context: AppContext): Promise<any> => {
        const workspaces = await getallWorkspaces(context);
        const data = [
          {
            name: "workspace_id",
            pick_list: workspaces,
            label: "Workspace ID",
            optional: false,
            type: "number",
            control_type: "select",
            hint: `Select workspace ID to retrive the respective ticket fields`,
          },
        ];
        return data;
      },
    },
    pick_lists: {
      getLevelTwoTicketsValues: async (context: AppContext) => {
        context = {
          ...context,
          payload: {
            ...context.payload,
            config_fields: {
              ...context.payload.config_fields,
              module: "ticket",
            },
          },
        };
        return getLevelTwoTicketsValues(context);
      },
      getLevel3TicketsValues: async (context: AppContext) => {
        context = {
          ...context,
          payload: {
            ...context.payload,
            config_fields: {
              ...context.payload.config_fields,
              module: "ticket",
            },
          },
        };
        return getLevel3TicketsValues(context);
      },
      getAgentByGroupId: async (context: AppContext) => {
        context = {
          ...context,
          payload: {
            ...context.payload,
            config_fields: {
              ...context.payload.config_fields,
              module: "ticket",
            },
          },
        };
        return getAgentByGroupId(context);
      },
      ticketparent1dependent1,
      ticketparent1dependent2,
      ticketparent2dependent1,
      ticketparent2dependent2,
      ticketparent3dependent1,
      ticketparent3dependent2,
      ticketparent4dependent1,
      ticketparent4dependent2,
      ticketparent5dependent1,
      ticketparent5dependent2,
      ticketparent6dependent1,
      ticketparent6dependent2,
    },
    input_schema: {
      fields: async (context: AppContext): Promise<any> => {
        const inputSchema: any = await buildTicketInputSchema(context, "create");
        if (inputSchema?.statusCode > 210) {
          throw new Error(
            `Error in inputschema ${JSON.stringify(inputSchema.data)} - status of ${inputSchema.statusCode}` ||
              `something went wrong.cant able to fetch Inputschema- with a statusCode of${inputSchema.statusCode}`
          );
        }
        // //console.log("✅ Final Ticket Input Schema =====>", inputSchema);
        inputSchema.push({
          name: "parent_id",
          label: "Parent Ticket ID",
          optional: false,
          type: "string",
          control_type: "text",
          hint: `Enter Parent Ticket ID create child ticket`,
        });
        return inputSchema;
      },
    },
    output_schema: {
      fields: async (context: AppContext) => {
        return await getOutputSchemaForm(
          context,
          "tickets?updated_since=1990-01-01T02:00:00Z&order_type=desc&per_page=100&page=1",
          "tickets",
          "Create a ticket in the account"
        );
      },
    },
    execute: async (context: AppContext): Promise<ExecutionPayload> => {
      const { parent_id } = context.payload.data;
      if (!parent_id) {
        return { statusCode: 400, data: { error: "Parent Ticket ID is required." } };
      }
      const result = await createOrUpdateTicket(context, `tickets/${parent_id}/create_child_ticket`, "create");
      const { statusCode, data } = result;

      if (statusCode >= 200 && statusCode < 300) {
        return { statusCode, data: data.ticket ?? data };
      }
      return { statusCode, data: { error: data } };
    },
    sample: async (context: AppContext) => {},
  },
  get_requested_item_in_ticket: {
    id: "get_requested_item_in_ticket",
    name: "Get Requested Items In ticket",
    title: "Get Requested Items In ticket",
    subtitle: "Get requested items linked to a ticket",
    description: "Retrieves requested items associated with a given Ticket ID.",
    config_fields: {
      fields: async (): Promise<any[]> => [],
    },

    pick_lists: {},
    input_schema: {
      fields: async (_context: AppContext): Promise<any[]> => {
        return [
          {
            name: "ticket_id",
            label: "Ticket ID",
            type: "number",
            control_type: "text",
            optional: false,
          },
        ];
      },
    },

    // -----------------------------
    // 3️⃣ Output Schema
    // -----------------------------
    output_schema: {
      fields: async (_context: AppContext): Promise<any[]> => {
        const sampleResult: any = {
          requested_items: [
            {
              custom_fields: {},
              custom_dropdown_tags: ["bc98ccab-6c4b-47cd-adaa-008b56048fd6::$::fb4b928a-87b9-41dc-b3e3-43f1c2288ef5"],
              custom_boolean_tags: [],
              ff_single_line_tf: ["Firm / Fixe"],
              custom_paragraphs: [],
              quantity: 1,
              remarks: null,
              updated_at: "2025-11-14T18:38:23Z",
              stage: 1,
              loaned: false,
              cost_per_request: 0,
              custom_multi_select_dropdown_tags: [null],
              custom_multi_select_dropdowns: [null],
              id: 21007148401,
              created_at: "2025-11-14T18:38:23Z",
              delivery_time: null,
              is_parent: true,
              service_item_id: 80,
              service_item_name: "Engineering Projects",
              attachments: [
                {
                  attachment_url:
                    "https://webp.attachments.freshservice.com/data/helpdesk/attachments/production/21087654602/original/Precitech.pdf?response-content-type=application/pdf&Expires=1763231905&Signature=g-JMJYimdmVJWyapYGfLuQVyydfo1zevdZOyypvCGjOV55yqROORd4mQ6RLbOZDwUDCDFSRyjtJTyQG5uAq4uCjrOgv3ColSv5CDWFA0LhnylW465pEi4bYOr6SZIQXdYX3mMr3wFpBm3ShQlcvxpJsq5tyY1CGveVGNhJgsntdfeQ9ZEafbSH5yQUgQsWPqrExQehsWoJB6BdFteBjWH56D8vPlK06ezyYiIzXqKvFwqT3NTY3CnkhbuZ-YsBBkq5H0~V1sTeDTh2tv~hYIn-6SzEVSGFc8e9EGBMptazp1H49veqYSfuOEMOgj9UbSOqNHgriyDrwB7REXXhSCdA__&Key-Pair-Id=APKAIPHBXWY2KT5RCMPQ",
                  canonical_url: "https://webp.freshservice.com/helpdesk/attachments/21087654602",
                  content_type: "application/pdf",
                  created_at: "2025-11-14T18:38:14Z",
                  has_access: true,
                  id: 21087654602,
                  name: "Precitech.pdf",
                  size: 679815,
                  updated_at: "2025-11-14T18:38:23Z",
                },
              ],

              cloud_files: [],
            },
          ],
          stringified_requested_items:
            '[{"custom_fields":{"first_name":"Mahendran","last_name":"ramar","mobile_number":"09786047798","email":"mahiram@gmail.com"},"quantity":1,"id":52004048698}]',
          datafound: true,
        };
        return GenerateSchema(sampleResult);
      },
    },

    // -----------------------------
    // 4️⃣ Execute
    // -----------------------------
    execute: async (context: AppContext): Promise<ExecutionPayload> => {
      const { ticket_id } = context.payload.data as any;

      if (!ticket_id) {
        return {
          statusCode: 200,
          data: { datafound: false },
        };
      }
      let limit = 100;
      let page = 1;
      const all_requested_items: any[] = [];

      while (true) {
        const result = await makeApiCall(
          context,
          `tickets/${ticket_id}/requested_items?per_page=${limit}&page=${page}`,
          "GET"
        );

        if (result?.statusCode >= 400) {
          return {
            data: { error: result.data },
            statusCode: result.statusCode,
          };
        }
        const items = result?.data?.requested_items || [];
        all_requested_items.push(...items);
        // ✅ stop when last page
        if (items.length < limit) break;

        page++;
      }

      if (!all_requested_items.length) {
        return {
          data: {
            dataFound: false,
          },
          statusCode: 200,
        };
      }

      return {
        statusCode: 200,
        data: {
          requested_items: all_requested_items,
          stringified_requested_items: JSON.stringify(all_requested_items),
          datafound: true,
        },
      };
    },

    sample: {
      output: {
        requested_items: '[{"custom_fields":{"first_name":"Mahendran","last_name":"ramar"},"quantity":1}]',
        datafound: true,
      },
    },
    cursor_enabled: false,
    has_config_fields: false,
    retry_on_response: [],
    retry_on_request: [],
    max_retries: 0,
    help: "",
    display_priority: 0,
    batch: false,
    batch_size: 0,
    bulk: false,
    deprecated: false,
  },

  find_ticket: {
    id: "find_ticket",
    name: "Find Ticket",
    title: "Find Ticket by ID",
    subtitle: "Find a specific ticket by its ID",
    description: "Retrieves the complete details of a single ticket using its unique ID.",
    pick_lists: {},
    input_schema: {
      fields: async (): Promise<any> => [
        { name: "id", label: "Ticket ID", type: "number", control_type: "text", optional: false },
      ],
    },

    output_schema: {
      fields: async (context: AppContext) => {
        try {
          const schema = await getOutputSchemaForm(
            context,
            "tickets?updated_since=1990-01-01T02:00:00Z&order_type=desc&per_page=100&page=1&include=requester",
            "tickets",
            "Create a ticket in your account to generate the schema."
          );
          if (schema.error) {
            throw new Error(schema.error);
          }
          return [
            ...schema,
            { name: "dataFound", type: "boolean", label: "Data Found", control_type: "text", optional: false },
          ];
        } catch (error: any) {
          throw new Error(error.message || "Unexpected error while building output schema.");
        }
      },
    },

    execute: async (context: AppContext): Promise<ExecutionPayload> => {
      const { id } = context.payload.data;

      if (!id) {
        return { statusCode: 200, data: { dataFound: false } };
      }
      try {
        const result = await makeApiCall(context, `tickets/${id}?include=requester`, "GET");

        const { statusCode, data } = result;

        // ✅ Success (2xx)
        if (statusCode >= 200 && statusCode < 300 && data?.ticket) {
          const ticket = data?.ticket as any;
          // //console.log("ticket", ticket);
          const attachments_url =
            ticket?.attachments && ticket?.attachments.length
              ? ticket.attachments.map((item: any) => item.attachment_url).join(",")
              : "";
          const attachment_ids =
            ticket?.attachments && ticket?.attachments.length ? ticket.attachments.map((item: any) => item.id) : [];
          const first_attachment_id = ticket?.attachments?.[0]?.id || null;
          return {
            statusCode,
            data: {
              ...data.ticket,
              attachments_url,
              attachment_ids,
              first_attachment_id,
              dataFound: true,
            },
          };
        }

        // ✅ Not found → treat as 200 with `dataFound: false`
        if (statusCode === 404 || statusCode === 204) {
          return { statusCode: 200, data: { dataFound: false } };
        }

        // ⚠️ Client errors (400, 422)
        if ([400, 422].includes(statusCode)) {
          const message = data?.message || data?.error?.message || "Invalid request.";
          return { statusCode, data: { error: message } };
        }

        // 🚫 Auth errors (401, 403)
        if ([401, 403].includes(statusCode)) {
          const message = data?.message || "Authentication failed or access denied.";
          return { statusCode, data: { error: message } };
        }

        // 💥 Server errors (500+)
        if (statusCode >= 500) {
          const message = data?.message || "Internal server error occurred.";
          return { statusCode, data: { error: message } };
        }

        // ❓ Unexpected response
        return { statusCode, data: { error: `Unexpected API response (${statusCode})` } };
      } catch (err: any) {
        const errorMessage = err?.message || "Unexpected error occurred while fetching ticket.";
        return { statusCode: 500, data: { error: errorMessage, dataFound: false } };
      }
    },

    retry_on_response: [],
    retry_on_request: [],
    max_retries: 0,
    help: "",
    display_priority: 0,
    batch: false,
    batch_size: 0,
    bulk: false,
    deprecated: false,
    cursor_enabled: true,
    has_config_fields: false,
    config_fields: { fields: async () => [] },
    sample: { fields: async () => [] },
  },

  delete_ticket: {
    id: "delete_ticket",
    name: "Delete Ticket",
    title: "Delete Ticket",
    subtitle: "Delete a ticket by its ID",
    description: "Permanently deletes a specific ticket from Freshservice.",

    input_schema: {
      fields: async (): Promise<any> => [
        { name: "id", label: "Ticket ID", type: "number", control_type: "text", optional: false },
      ],
    },

    output_schema: {
      fields: async () => [
        { name: "success", label: "Success", type: "boolean" },
        { name: "message", label: "Message", type: "string" },
      ],
    },

    execute: async (context: AppContext): Promise<ExecutionPayload> => {
      const { id } = context.payload.data;

      if (!id) {
        return { statusCode: 400, data: { error: "Ticket ID is required." } };
      }

      try {
        const result = await makeApiCall(context, `tickets/${id}`, "DELETE");
        const { statusCode, data } = result;

        // ✅ Success
        if (statusCode >= 200 && statusCode < 300) {
          return {
            statusCode,
            data: { success: true, message: "Ticket deleted successfully." },
          };
        }

        // ⚠️ Client errors (400, 404, 422)
        if ([400, 404, 422].includes(statusCode)) {
          let message = data?.message || data?.error?.message || "Invalid request.";

          // Field-level errors
          const errorsArray = data?.errors || data?.error?.errors;
          if (Array.isArray(errorsArray) && errorsArray.length > 0) {
            const details = errorsArray.map((err: any) => `${err.field || "Field"}: ${err.message}`).join(" | ");
            message += message ? ` — ${details}` : details;
          }
          return { statusCode, data: { error: message } };
        }

        // 🚫 Auth / Permission errors
        if ([401, 403].includes(statusCode)) {
          const message =
            statusCode === 401
              ? "Authentication failed — please check your API key."
              : "You do not have permission to delete this ticket.";

          return { statusCode, data: { error: message } };
        }

        // 💥 Server errors
        if (statusCode >= 500) {
          const message = data?.message || "Internal server error occurred.";
          return { statusCode, data: { error: message } };
        }

        // ❓ Unexpected response
        return { statusCode, data: { error: `Unexpected API response (${statusCode})` } };
      } catch (err: any) {
        const errorMessage = err?.message || "Unexpected error occurred during deletion.";
        return { statusCode: 500, data: { error: errorMessage } };
      }
    },

    retry_on_response: [],
    retry_on_request: [],
    max_retries: 0,
    help: "",
    display_priority: 0,
    batch: false,
    batch_size: 0,
    bulk: false,
    deprecated: false,
    cursor_enabled: true,
    has_config_fields: false,
    pick_lists: {},
    config_fields: { fields: async () => [] },
    sample: { fields: async () => [] },
  },

  create_note_in_ticket: {
    id: "create_note_in_ticket",
    name: "Create Note in Ticket",
    title: "Create Note in Ticket",
    subtitle: "Adds a private or public note to an existing ticket.",
    description:
      "Adds a note (conversation) to a specified ticket. The note can be marked as private and can notify specific email addresses.",
    pick_lists: {},
    // 📝 Defines the input fields for creating the note.
    input_schema: {
      fields: async (ctx): Promise<any> => {
        return getNoteInputschema();
      },
    },
    // 📤 Defines the structure of a successful response.
    output_schema: {
      fields: async (context: AppContext) => {
        // A conversation object is the expected output. We can get a sample from any existing ticket.
        return GenerateSchema({
          id: 1070049569303,
          user_id: 29003111001,
          to_emails: ["mahendran.ramar@konnectify.co"],
          body: "<div>Customer reported VPN is not working since morning.</div>",
          body_text: "Customer reported VPN is not working since morning.",
          ticket_id: 3943,
          created_at: "2025-10-16T13:03:33Z",
          updated_at: "2025-10-16T13:03:33Z",
          incoming: false,
          private: true,
          support_email: null,
          attachments: [
            {
              attachment_url:
                "https://konnectify-assist.ind-attachments.freshservice.com/data/helpdesk/attachments/production/29015353695/original/testUpload.pdf?response-content-type=application/pdf&Expires=1760706213&Signature=jzWlXVLF4U8uCEfYLcXGoup1EiigbiVhvlVvt9Bw0iALfJpXWvmAUWHW6tjDus8v2xBGq2m~G1NjYnrzdLqqDAd7F9hQ3hok~TQrnuZGnrPAxevRDt3Ob7BZiuuszi3~8syNp0L80pTs2keYQ4X2Wil0p994Km9s1yukvlDI3GOwip8DzyBX5I7FZGodCVuChCMSq5dJMxyqFDuG62eZ-kvoCanxT1cU8PBOUU7Q6FOUtDj~W21CnbTOy514T4jsCZ7cTmIPGlFmmuXqX3EgB0goBmY6nqRj2YHVW4QAg-dJ8R~PjvCVZ~MyDc8gpgMLc7E-dGs4EPpDkAkoSH30Dw__&Key-Pair-Id=APKAIPHBXWY2KT5RCMPQ",
              canonical_url: "https://konnectify-assist.freshservice.com/helpdesk/attachments/29015353695",
              content_type: "application/pdf",
              created_at: "2025-10-16T13:03:33Z",
              has_access: true,
              id: 29015353695,
              name: "testUpload.pdf",
              size: 513483,
              updated_at: "2025-10-16T13:03:33Z",
            },
            {
              attachment_url:
                "https://konnectify-assist.ind-attachments.freshservice.com/data/helpdesk/attachments/production/29015353696/original/testUpload.pdf?response-content-type=application/pdf&Expires=1760706213&Signature=Qo7oWEHz~LkNyLgN7AUQSDtuYsgi65AURogcWEhDQeSeXHmnYEx-wsngZj9ewnwtIjFjKD8Jvr4fl8qX9ZTmCMwMSOicKrKQBxkKhaNbMHMbU9rRJT3xJo4ltgONwYYT81yL00U27flarTX3T3UDTHo9ehiO7whjbCL~g3Q0~1zcbqbHhziFOSJ64LSs8d7neB---cnliYJYNZzKm6VCZ1A0w7X5axrYNQoY15IRDAHle2v8ga0D-KuB7wNxZgMHExPDRcQbhJ1SjzbXsbL7cpRNNiI~9TcA0k6eVywNZIAkeOVcf4FQHSlFr9oS2yDZJGjmmFXtD5L7SZHDhCEP1w__&Key-Pair-Id=APKAIPHBXWY2KT5RCMPQ",
              canonical_url: "https://konnectify-assist.freshservice.com/helpdesk/attachments/29015353696",
              content_type: "application/pdf",
              created_at: "2025-10-16T13:03:33Z",
              has_access: true,
              id: 29015353696,
              name: "testUpload.pdf",
              size: 513483,
              updated_at: "2025-10-16T13:03:33Z",
            },
          ],
          attachment_ids: ["3", "3"],
          attachments_url:
            "https://konnectify-assist.ind-attachments.freshservice.com/data/helpdesk/attachments/production/29015353695/original/testUpload.pdf?response-content-type=application/pdf&Expires=1760706213&Signature=jzWlXVLF4U8uCEfYLcXGoup1EiigbiVhvlVvt9Bw0iALfJpXWvmAUWHW6tjDus8v2xBGq2m~G1NjYnrzdLqqDAd7F9hQ3hok~TQrnuZGnrPAxevRDt3Ob7BZiuuszi3~8syNp0L80pTs2keYQ4X2Wil0p994Km9s1yukvlDI3GOwip8DzyBX5I7FZGodCVuChCMSq5dJMxyqFDuG62eZ-kvoCanxT1cU8PBOUU7Q6FOUtDj~W21CnbTOy514T4jsCZ7cTmIPGlFmmuXqX3EgB0goBmY6nqRj2YHVW4QAg-dJ8R~PjvCVZ~MyDc8gpgMLc7E-dGs4EPpDkAkoSH30Dw__&Key-Pair-Id=APKAIPHBXWY2KT5RCMPQ,https://konnectify-assist.ind-attachments.freshservice.com/data/helpdesk/attachments/production/29015353696/original/testUpload.pdf?response-content-type=application/pdf&Expires=1760706213&Signature=Qo7oWEHz~LkNyLgN7AUQSDtuYsgi65AURogcWEhDQeSeXHmnYEx-wsngZj9ewnwtIjFjKD8Jvr4fl8qX9ZTmCMwMSOicKrKQBxkKhaNbMHMbU9rRJT3xJo4ltgONwYYT81yL00U27flarTX3T3UDTHo9ehiO7whjbCL~g3Q0~1zcbqbHhziFOSJ64LSs8d7neB---cnliYJYNZzKm6VCZ1A0w7X5axrYNQoY15IRDAHle2v8ga0D-KuB7wNxZgMHExPDRcQbhJ1SjzbXsbL7cpRNNiI~9TcA0k6eVywNZIAkeOVcf4FQHSlFr9oS2yDZJGjmmFXtD5L7SZHDhCEP1w__&Key-Pair-Id=APKAIPHBXWY2KT5RCMPQ",
        });
      },
    },

    // 🚀 The core logic that processes inputs and calls the API.
    execute: async (context: AppContext): Promise<ExecutionPayload> => {
      const { ticket_id } = context.payload.data as any;
      if (!ticket_id) {
        return {
          statusCode: 400,
          data: { error: "Ticket ID is required to add a note." },
        };
      }
      const payload = await buildNotePayload(context);
      if (payload?.statusCode > 210) {
        return {
          statusCode: payload.statusCode,
          data: {
            error: payload,
          },
        };
      }
      const endpoint = `tickets/${ticket_id}/notes`;
      const body = removeEmpty(payload);
      const result = await ApiCallWithAttachment(context, endpoint, "POST", body);
      const { statusCode, data } = result;
      if (data?.conversation && statusCode < 210) {
        const conversation = result?.data?.conversation as any;
        const attachments_url =
          conversation?.attachments && conversation?.attachments.length
            ? conversation.attachments.map((item: any) => item.attachment_url).join(",")
            : [];
        const attachment_ids =
          conversation?.attachments && conversation?.attachments.length
            ? conversation.attachments.map((item: any) => item.id)
            : [];
        const first_attachment_id = conversation?.attachments?.[0]?.id || null;
        return {
          data: { ...conversation, attachments_url, attachment_ids, first_attachment_id },
          statusCode: statusCode,
        };
      }
      return {
        statusCode,
        data: {
          error: data,
        },
      };
    },

    // 📊 Provides a sample for users to understand the output structure.
    sample: {
      fields: async (context: AppContext) => {
        return await sampleData(context, "conversations", "Add a note to any ticket to generate a sample.");
      },
    },
    ...actionsAlloption,
    has_config_fields: false,
    config_fields: {
      fields: async () => [],
    },
  },
  update_note_in_ticket: {
    id: "update_note_in_ticket",
    name: "Update Note in Ticket",
    title: "Update Note in Ticket",
    subtitle: "Updates an existing note in a ticket.",
    description: "Updates the body of a specific note (conversation) within a ticket.",
    pick_lists: {},
    // 📝 Defines the input fields required to identify and update the note.
    input_schema: {
      fields: async (ctx): Promise<any> => {
        // Re-use the create schema but add the conversation_id and make body optional
        const schema = getNoteInputschema();
        return [
          ...schema.filter(
            (field) =>
              field.name !== "notify_emails" &&
              field.name !== "private" &&
              field.name !== "incoming" &&
              field.name !== "user_id" &&
              field.name !== "ticket_id"
          ), // Attachments cannot be updated
          {
            name: "conversation_id",
            label: "Conversation ID",
            type: "number",
            control_type: "number",
            optional: false,
            hint: "The unique ID of the note/conversation to update.",
          },
        ].map((field) => {
          // Make all fields except IDs optional for an update
          if (field.name !== "conversation_id") {
            return { ...field, optional: true };
          }
          return field;
        });
      },
    },

    // 📤 The output schema is the same as the create action.
    output_schema: {
      fields: async (context: AppContext) => {
        return GenerateSchema({
          id: 1070049569303,
          user_id: 29003111001,
          to_emails: ["mahendran.ramar@konnectify.co"],
          body: "<div>Customer reported VPN is not working since morning.</div>",
          body_text: "Customer reported VPN is not working since morning.",
          ticket_id: 3943,
          created_at: "2025-10-16T13:03:33Z",
          updated_at: "2025-10-16T13:03:33Z",
          incoming: false,
          private: true,
          support_email: null,
          attachments: [
            {
              attachment_url:
                "https://konnectify-assist.ind-attachments.freshservice.com/data/helpdesk/attachments/production/29015353695/original/testUpload.pdf?response-content-type=application/pdf&Expires=1760706213&Signature=jzWlXVLF4U8uCEfYLcXGoup1EiigbiVhvlVvt9Bw0iALfJpXWvmAUWHW6tjDus8v2xBGq2m~G1NjYnrzdLqqDAd7F9hQ3hok~TQrnuZGnrPAxevRDt3Ob7BZiuuszi3~8syNp0L80pTs2keYQ4X2Wil0p994Km9s1yukvlDI3GOwip8DzyBX5I7FZGodCVuChCMSq5dJMxyqFDuG62eZ-kvoCanxT1cU8PBOUU7Q6FOUtDj~W21CnbTOy514T4jsCZ7cTmIPGlFmmuXqX3EgB0goBmY6nqRj2YHVW4QAg-dJ8R~PjvCVZ~MyDc8gpgMLc7E-dGs4EPpDkAkoSH30Dw__&Key-Pair-Id=APKAIPHBXWY2KT5RCMPQ",
              canonical_url: "https://konnectify-assist.freshservice.com/helpdesk/attachments/29015353695",
              content_type: "application/pdf",
              created_at: "2025-10-16T13:03:33Z",
              has_access: true,
              id: 29015353695,
              name: "testUpload.pdf",
              size: 513483,
              updated_at: "2025-10-16T13:03:33Z",
            },
          ],
          attachment_ids: ["1", "2"],
          attachments_url:
            "https://konnectify-assist.ind-attachments.freshservice.com/data/helpdesk/attachments/production/29015353695/original/testUpload.pdf?response-content-type=application/pdf&Expires=1760706213&Signature=jzWlXVLF4U8uCEfYLcXGoup1EiigbiVhvlVvt9Bw0iALfJpXWvmAUWHW6tjDus8v2xBGq2m~G1NjYnrzdLqqDAd7F9hQ3hok~TQrnuZGnrPAxevRDt3Ob7BZiuuszi3~8syNp0L80pTs2keYQ4X2Wil0p994Km9s1yukvlDI3GOwip8DzyBX5I7FZGodCVuChCMSq5dJMxyqFDuG62eZ-kvoCanxT1cU8PBOUU7Q6FOUtDj~W21CnbTOy514T4jsCZ7cTmIPGlFmmuXqX3EgB0goBmY6nqRj2YHVW4QAg-dJ8R~PjvCVZ~MyDc8gpgMLc7E-dGs4EPpDkAkoSH30Dw__&Key-Pair-Id=APKAIPHBXWY2KT5RCMPQ,https://konnectify-assist.ind-attachments.freshservice.com/data/helpdesk/attachments/production/29015353696/original/testUpload.pdf?response-content-type=application/pdf&Expires=1760706213&Signature=Qo7oWEHz~LkNyLgN7AUQSDtuYsgi65AURogcWEhDQeSeXHmnYEx-wsngZj9ewnwtIjFjKD8Jvr4fl8qX9ZTmCMwMSOicKrKQBxkKhaNbMHMbU9rRJT3xJo4ltgONwYYT81yL00U27flarTX3T3UDTHo9ehiO7whjbCL~g3Q0~1zcbqbHhziFOSJ64LSs8d7neB---cnliYJYNZzKm6VCZ1A0w7X5axrYNQoY15IRDAHle2v8ga0D-KuB7wNxZgMHExPDRcQbhJ1SjzbXsbL7cpRNNiI~9TcA0k6eVywNZIAkeOVcf4FQHSlFr9oS2yDZJGjmmFXtD5L7SZHDhCEP1w__&Key-Pair-Id=APKAIPHBXWY2KT5RCMPQ",
        });
      },
    },

    // 🚀 The core logic that executes the update.
    execute: async (context: AppContext): Promise<ExecutionPayload> => {
      const { ticket_id, conversation_id } = context.payload.data;

      if (!conversation_id) {
        return {
          statusCode: 400,
          data: { error: " Conversation ID are required to update a note." },
        };
      }
      const payload = await buildNotePayload(context);
      if (payload?.statusCode > 210) {
        return {
          statusCode: payload.statusCode,
          data: {
            error: payload,
          },
        };
      }
      //payload.append("ticket_id", ticket_id);
      const endpoint = `conversations/${conversation_id}`;
      //  //console.log("payload", payload);
      const result = await ApiCallWithAttachment(context, endpoint, "PUT", payload);
      const { statusCode, data } = result;
      if (data?.conversation && statusCode < 210) {
        const conversation = result?.data?.conversation as any;
        const attachments_url =
          conversation?.attachments && conversation?.attachments.length
            ? conversation.attachments.map((item: any) => item.attachment_url).join(",")
            : [];
        const attachment_ids =
          conversation?.attachments && conversation?.attachments.length
            ? conversation.attachments.map((item: any) => item.id)
            : [];
        const first_attachment_id = conversation?.attachments?.[0]?.id || null;
        return { statusCode, data: { ...data.conversation, attachments_url, attachment_ids, first_attachment_id } };
      }
      return {
        statusCode,
        data: {
          error: data,
        },
      };
    },

    sample: {
      output: {
        id: 1070049569303,
        body: "<div>Updated note content.</div>",
        ticket_id: 3943,
        updated_at: "2025-10-16T13:05:00Z",
      },
    },
    ...actionsAlloption,
    has_config_fields: false,
    config_fields: {
      fields: async () => [],
    },
  },
  create_reply_to_ticket: {
    id: "create_reply_to_ticket",
    name: "Create Reply to Ticket",
    title: "Create Reply",
    subtitle: "Sends a reply to an existing ticket, optionally with attachments.",
    description:
      "Adds a reply (conversation) to a specified ticket. Can include CC/BCC recipients and file attachments.",
    // 📝 Defines the input fields using the new helper function.
    input_schema: {
      fields: async (context): Promise<any> => {
        return getNoteReplyInputschema();
      },
    },
    has_config_fields: false,
    config_fields: {
      fields: async (ctx): Promise<any> => {
        return getNoteReplyInputschema();
      },
    },
    // 📤 Defines the structure of a successful reply response.
    output_schema: {
      fields: async (context: AppContext) => {
        // The reply output is essentially a conversation object.
        return GenerateSchema({
          id: 1070049696772,
          user_id: 29003111001,
          to_emails: ["test1@gmail.com"],
          body: "<h3>Issue</h3>\n<div>My laptop won’t start.</div>\n<ul>\n<li>Tried safe mode</li>\n<li>Battery reseated</li>\n</ul>\n<div>\n<strong>Urgency:</strong> High</div>",
          body_text: "Issue  My laptop won’t start.   Tried safe mode  Battery reseated   Urgency: High",
          ticket_id: 3962,
          created_at: "2025-10-22T06:55:02Z",
          updated_at: "2025-10-22T06:55:02Z",
          from_email: "it@konnectify-assist.freshservice.com",
          cc_emails: ["ats@konnectify.co", "raja@konnectify.co"],
          bcc_emails: ["mohammed.akram@konnectify.co"],
          attachments: [
            {
              attachment_url:
                "https://konnectify-assist.ind-attachments.freshservice.com/data/helpdesk/attachments/production/29015439351/original/apollo.jpg?response-content-type=image/jpeg&Expires=1761202502&Signature=STwCkKhN2XwvlHMc~TDJkA6-iPRNHzkuWDgxX1eqSZA-FWAw0cqAys5s0M1rG4STe1gyqt2eVBSD~Nhwg45FKBCyZM1TwlNCkXY0O5gg3WmuSyDysldQfQYxQ7Ab15f2~b39f0lyzo8l-HFjGTL3dC2JlAGUH0QP5prrBmYdypYgRpKNEOTWqsnJnjUuuE~4tx2wYWUB0jkA0FOLHs3K9~VpLrlBrWYuAcMbn~fwM6rsjUKPUeHvnrpofEENUHZZpJGqcKbifUwuAaXkYhSEYLdaSRtDw1NwYT8VjozfRCPJ-HOx~ntN-2vttAjTWPvUdwH4Qd1WAKQuodsOQAfaOQ__&Key-Pair-Id=APKAIPHBXWY2KT5RCMPQ",
              canonical_url: "https://konnectify-assist.freshservice.com/helpdesk/attachments/29015439351",
              content_type: "image/jpeg",
              created_at: "2025-10-22T06:55:01Z",
              has_access: true,
              id: 29015439351,
              name: "apollo.jpg",
              size: 4640,
              updated_at: "2025-10-22T06:55:02Z",
            },
            {
              attachment_url:
                "https://konnectify-assist.ind-attachments.freshservice.com/data/helpdesk/attachments/production/29015439352/original/testUpload.pdf?response-content-type=application/pdf&Expires=1761202502&Signature=oc9bMMXWFRorUXVyN1phA-FlB6oM2KUZQBGQJEzidPkai0XyECPcnApMjzWeORfMuoUSA0HnVfRAb-XzRl2HjR7~bePMs-7sn608Dm1cefiJN5vmQ4WlV1FIfRkCNbs~oUqXXkFal4350MV57v~d0Ztl-XHeM8Lv8IxDQTNONs90aBPgvW0AqG-1KeSajHmesBogVKgbv2c5~Uugvv1wpPTPV7OTg6VAEnNTtUFgYof846yOpAa91dU1hCLA2e5HH01u1E7vpXbk4oy9r3Xj-rFj4d~NDQbrna5ZzvGrn7-DRotyOQP~ZK1oserXW~3SSJrTEGqbMliNw~sYemqUPw__&Key-Pair-Id=APKAIPHBXWY2KT5RCMPQ",
              canonical_url: "https://konnectify-assist.freshservice.com/helpdesk/attachments/29015439352",
              content_type: "application/pdf",
              created_at: "2025-10-22T06:55:01Z",
              has_access: true,
              id: 29015439352,
              name: "testUpload.pdf",
              size: 513483,
              updated_at: "2025-10-22T06:55:02Z",
            },
          ],
          attachments_url: "url1,url2", // Combined URLs
        });
      },
    },

    // 🚀 The core logic that processes inputs, handles attachments, and calls the API.
    execute: async (context: AppContext): Promise<ExecutionPayload> => {
      const { ticket_id } = context.payload.data as any;

      if (!ticket_id) {
        return {
          statusCode: 400,
          data: { error: "Ticket ID is required to add a reply." },
        };
      }

      // Reuse the note payload builder as the structure is the same
      let isreply = true;
      const payload = await buildNotePayload(context, isreply);
      const endpoint = `tickets/${ticket_id}/reply`;

      // Use ApiCallWithAttachment to handle potential FormData (attachments)
      //console.log(payload);
      const result = await ApiCallWithAttachment(context, endpoint, "POST", payload);
      const { statusCode, data } = result;

      // Process successful response
      if (data?.conversation && statusCode >= 200 && statusCode < 300) {
        const conversation = data.conversation as any;
        // Combine attachment URLs for convenience
        const attachments_url = conversation?.attachments?.map((item: any) => item.attachment_url).join(",") || null;
        return { data: { ...conversation, attachments_url }, statusCode: statusCode };
      }

      // Handle errors
      return {
        statusCode: statusCode || 500,
        data: {
          error: data?.message || data || "Failed to create reply.",
          details: data?.errors || null,
        },
      };
    },

    // 📊 Provides a sample for users.
    sample: {
      output: {
        // Using a simplified sample based on the output schema
        id: 1070049569304,
        ticket_id: 3943,
        body_text: "Reply content here.",
        created_at: "2025-10-16T14:00:00Z",
        private: false,
        incoming: false,
        attachments_url: "url1,url2",
      },
    },
    ...actionsAlloption,
    pick_lists: {},
  },
  delete_note_in_ticket: {
    id: "delete_note_in_ticket",
    name: "Delete Note in Ticket",
    title: "Delete Note",
    subtitle: "Deletes a specific note (conversation) from a ticket.",
    description: "Permanently deletes a note/conversation using its unique ID.",
    has_config_fields: false,
    config_fields: {
      fields: async () => [],
    },
    pick_lists: {},
    // 📝 Defines the input field: the ID of the note/conversation to delete.
    input_schema: {
      fields: async () => [
        {
          name: "conversation_id",
          label: "Conversation ID",
          type: "number",
          control_type: "number",
          optional: false,
          hint: "The unique ID of the note/conversation to delete.",
        },
      ],
    },

    // 📤 Defines the simple success/error output structure.
    output_schema: {
      fields: async () => [
        { name: "success", label: "Success", type: "boolean" },
        { name: "message", label: "Message", type: "string", optional: true }, // Optional for success case
        { name: "error", label: "Error", type: "string", optional: true }, // Optional for error case
      ],
    },

    // 🚀 The core logic that executes the delete request.
    execute: async (context: AppContext): Promise<ExecutionPayload> => {
      const { conversation_id } = context.payload.data;

      if (!conversation_id) {
        return {
          statusCode: 400,
          data: { success: false, error: "Conversation ID is required." },
        };
      }

      const endpoint = `conversations/${conversation_id}`;

      try {
        const result = await makeApiCall(context, endpoint, "DELETE");
        const { statusCode, data } = result;
        //console.log("data", data);
        // ✅ Success (Usually 204 No Content for DELETE)
        if (statusCode >= 200 && statusCode < 300) {
          return {
            statusCode: 200, // Return 200 OK for consistency
            data: { success: true, message: `Note ${conversation_id} deleted successfully.` },
          };
        }

        // 🤷 Not Found (404)
        if (statusCode === 404) {
          return {
            statusCode: 404,
            data: { success: false, error: `Note with ID ${conversation_id} not found.` },
          };
        }

        // ❌ Other Errors
        const errorMessage = data?.message || data?.description || `Failed to delete note ${conversation_id}.`;
        return {
          statusCode,
          data: {
            error: data,
          },
        };
      } catch (error: any) {
        // Use the standard error handler
        return handleActionError(error, context, "Delete Note in Ticket");
      }
    },

    // 📊 Provides a sample output for a successful deletion.
    sample: {
      output: {
        success: true,
        message: "Note 123456789 deleted successfully.",
      },
    },
    retry_on_response: [],
    retry_on_request: [],
    max_retries: 0,
    help: "",
    display_priority: 0,
    batch: false,
    batch_size: 0,
    bulk: false,
    deprecated: false,
    cursor_enabled: true,
  },

  create_requester: {
    id: "create_requester",
    name: "Create Requester",
    title: "Create Requester",
    subtitle: "Create a new requester in Freshservice.",
    description: "Creates a new requester with default and custom fields.",
    input_schema: {
      fields: async (context: AppContext) => getRequesterInputSchema(context, "create"),
    },
    pick_lists: {},
    output_schema: {
      fields: async (context: AppContext) => {
        // Use a sample requester to generate a dynamic output schema
        return await getOutputSchema(
          context,
          "requesters",
          "Create a requester in your account to generate the schema."
        );
      },
    },

    execute: async (context: AppContext): Promise<ExecutionPayload> => {
      try {
        const eventData = context.payload.data;
        const Inputschema = await getRequesterInputSchema(context, "create");
        const payload = generatePayload(Inputschema, eventData);
        //  //console.log(payload);
        removeEmpty(payload);
        const result = await makeApiCall(context, "requesters", "POST", payload);
        const { statusCode, data } = result;

        if (statusCode >= 200 && statusCode < 300) {
          // Return the 'requester' object on success
          return { statusCode, data: data.requester ?? data };
        }

        // Return a structured error response
        return {
          statusCode,
          data: {
            error: data,
          },
        };
      } catch (error: any) {
        return handleActionError(error, context, "Create Requester");
      }
    },
    sample: {
      fields: async (context: AppContext) => {
        return await sampleData(context, "requesters", "Create at least one requester in your account.");
      },
    },
    retry_on_response: [],
    retry_on_request: [],
    max_retries: 0,
    help: "",
    display_priority: 0,
    batch: false,
    batch_size: 0,
    bulk: false,
    deprecated: false,
    cursor_enabled: true,
    has_config_fields: false,
    config_fields: {
      fields: async () => [],
    },
  },
  find_requester: {
    id: "find_requester",
    name: "Find Requester",
    title: "Find Requester",
    subtitle: "Find a requester by their ID or Email",
    description: "Retrieves the details of a single requester using either their unique ID or email address.",
    pick_lists: {},
    has_config_fields: true,
    config_fields: {
      fields: async (context: Context): Promise<any> => {
        return [
          {
            name: "find",
            label: "Find By",
            type: "string",
            control_type: "select",
            optional: false,
            pick_list: [
              { label: "ID", value: "id" },
              { label: "Email", value: "email" },
            ],
            hint: "Select whether to find the requester by their unique ID or email address.",
          },
        ];
      },
    },

    // 📝 Dynamically generates the input field based on the user's choice above.
    input_schema: {
      fields: async function (_context: Context) {
        const findKey = _context.payload.config_fields?.find as string;
        const object = { [findKey]: "string" };
        return GenerateSchema(object, [findKey]);
      },
    },

    // 📤 Defines the expected output, including a helpful 'datafound' flag.
    output_schema: {
      fields: async (context: AppContext) => {
        const schema = await getOutputSchema(context, "requesters", "Create a requester to see the output schema.");
        if (schema?.error) throw new Error(schema.error);
        return [
          ...schema,
          { name: "datafound", type: "boolean", label: "Data Found", control_type: "text", optional: false },
        ];
      },
    },

    // 🚀 The core logic that executes the search.
    execute: async (context: AppContext): Promise<ExecutionPayload> => {
      const { find } = context.payload.config_fields as { find: "id" | "email" };
      const value = context.payload.data[find] as any;
      if (!value) {
        return {
          data: {
            datafound: false,
          },
          statusCode: 200,
        };
      }
      let endpoint = "";
      let notFoundMessage = "";

      // Construct the correct API endpoint based on the chosen search method.
      if (find === "id") {
        endpoint = `requesters/${value}`;
        notFoundMessage = `Requester with ID '${value}' not found.`;
      } else {
        endpoint = `requesters?email=${encodeURIComponent(value as string)}`;
        notFoundMessage = `Requester with Email '${value}' not found.`;
      }
      try {
        const { statusCode, data } = await makeApiCall(context, endpoint, "GET");

        // ✅ Success Case: Found the requester.
        if (statusCode >= 200 && statusCode < 300) {
          // For email search, the API returns an array. We extract the first result.
          const requester = find === "email" ? data?.requesters?.[0] : data?.requester;

          if (requester) {
            return { statusCode: 200, data: { ...requester, datafound: true } };
          }
        }

        // 🤷 Not Found Case: API returned 404 or an empty array for email search.
        if (statusCode === 404 || (find === "email" && data?.requesters?.length === 0)) {
          return { statusCode: 200, data: { datafound: false } };
        }

        // ❌ Error Case: Handle all other API errors.
        return {
          statusCode,
          data: {
            error: data?.message || "An unexpected error occurred.",
            details: data?.errors || null,
            datafound: false,
          },
        };
      } catch (error: any) {
        return handleActionError(error, context, "Find Requester");
      }
    },
    retry_on_response: [],
    retry_on_request: [],
    max_retries: 0,
    help: "",
    display_priority: 0,
    batch: false,
    batch_size: 0,
    bulk: false,
    deprecated: false,
    cursor_enabled: true,
    sample: function (context: AppContext): Promise<any> {
      throw new Error("Function not implemented.");
    },
  },
  update_requester: {
    id: "update_requester",
    name: "Update Requester",
    title: "Update Requester",
    subtitle: "Update an existing requester by their ID.",
    description: "Updates an existing requester's default and custom fields.",
    pick_lists: {},
    input_schema: {
      fields: async (context: AppContext) => getRequesterInputSchema(context, "update"),
    },

    output_schema: {
      fields: async (context: AppContext) => {
        return await getOutputSchema(
          context,
          "requesters",
          "Update a requester in your account to generate the schema."
        );
      },
    },

    execute: async (context: AppContext): Promise<ExecutionPayload> => {
      try {
        const { requester_id, ...eventData } = context.payload.data;

        if (!requester_id) {
          return {
            statusCode: 400,
            data: { error: "Requester ID is required for an update operation." },
          };
        }
        const input_schema = await getRequesterInputSchema(context, "update");
        const payload = generatePayload(input_schema, eventData);

        const result = await makeApiCall(context, `requesters/${requester_id}`, "PUT", payload);
        const { statusCode, data } = result;

        if (statusCode >= 200 && statusCode < 300) {
          return { statusCode, data: data.requester };
        }

        return {
          statusCode,
          data: {
            error: data?.message || `Failed to update requester ${requester_id}.`,
            details: data?.errors || null,
          },
        };
      } catch (error: any) {
        return handleActionError(error, context, "Update Requester");
      }
    },
    sample: {
      fields: async (context: AppContext) => {
        return await sampleData(context, "requesters", "Create at least one requester in your account.");
      },
    },
    retry_on_response: [],
    retry_on_request: [],
    max_retries: 0,
    help: "",
    display_priority: 0,
    batch: false,
    batch_size: 0,
    bulk: false,
    deprecated: false,
    cursor_enabled: true,
    has_config_fields: false,
    config_fields: {
      fields: async () => [],
    },
  },
  create_agent: {
    id: "create_agent",
    name: "Create Agent",
    title: "Create Agent",
    subtitle: "Create a new agent in Freshservice.",
    description: "Creates a new agent with specified roles, departments, and custom field information.",
    pick_lists: {},
    input_schema: {
      fields: async (context: AppContext) => getAgentInputSchema(context, "create"),
    },
    output_schema: {
      fields: async (context: AppContext) => {
        return await getOutputSchema(context, "agents", "Create an agent in your account to generate the schema.");
      },
    },
    execute: async (context: AppContext): Promise<ExecutionPayload> => {
      try {
        const eventData = context.payload.data;
        const inputschema: any = await getAgentInputSchema(context, "create");
        //  //console.log(inputschema);
        const payload = generatePayload(inputschema, eventData);
        const payloadRoles = transformRolesPayload(payload);
        // //console.log(payloadRoles);
        removeEmpty(payload);
        const result = await makeApiCall(context, "agents", "POST", { ...payloadRoles });
        const { statusCode, data } = result;

        if (statusCode >= 200 && statusCode < 300) {
          return { statusCode, data: data.agent ?? data };
        }
        return {
          statusCode,
          data: {
            error: data,
          },
        };
      } catch (error: any) {
        return handleActionError(error, context, "Create Agent");
      }
    },
    sample: {
      fields: async (context: AppContext) => {
        return await sampleData(context, "agents", "Create at least one agent in your account.");
      },
    },
    retry_on_response: [],
    retry_on_request: [],
    max_retries: 0,
    help: "",
    display_priority: 0,
    batch: false,
    batch_size: 0,
    bulk: false,
    deprecated: false,
    cursor_enabled: true,
    has_config_fields: false,
    config_fields: {
      fields: async () => [],
    },
  },
  find_agent: {
    id: "find_agent",
    name: "Find Agent",
    title: "Find Agent",
    subtitle: "Find an agent by their ID or Email",
    description: "Retrieves the details of a single agent using either their unique ID or email address.",
    pick_lists: {},
    has_config_fields: true,
    config_fields: {
      fields: async (context: Context): Promise<any> => {
        return [
          {
            name: "find",
            label: "Find By",
            type: "string",
            control_type: "select",
            optional: false,
            pick_list: [
              { label: "ID", value: "id" },
              { label: "Email", value: "email" },
            ],
            hint: "Select whether to find the agent by their unique ID or email address.",
          },
        ];
      },
    },

    // 📝 Dynamically generates the input field based on the user's choice above.
    input_schema: {
      fields: async function (_context: Context) {
        const findKey = _context.payload.config_fields?.find as string;
        // This creates a dynamic input field named either "id" or "email"
        const object = { [findKey || "id"]: "string" };
        return GenerateSchema(object, [findKey || "id"]);
      },
    },

    // 📤 Defines the expected output, including a helpful 'datafound' flag.
    output_schema: {
      fields: async (context: AppContext) => {
        const schema = await getOutputSchema(context, "agents", "Create an agent to see the output schema.");
        if (schema?.error) throw new Error(schema.error);
        return [
          ...schema,
          { name: "datafound", type: "boolean", label: "Data Found", control_type: "text", optional: false },
        ];
      },
    },

    // 🚀 The core logic that executes the search.
    execute: async (context: AppContext): Promise<ExecutionPayload> => {
      const { find } = context.payload.config_fields as { find: "id" | "email" };
      const value = context.payload.data[find] as any;
      if (!value) {
        return {
          data: { datafound: false },
          statusCode: 200,
        };
      }

      let endpoint = "";
      let notFoundMessage = "";

      // Construct the correct API endpoint based on the chosen search method.
      if (find === "id") {
        endpoint = `agents/${value}`;
        notFoundMessage = `Agent with ID '${value}' not found.`;
      } else {
        endpoint = `agents?email=${encodeURIComponent(value as string)}`;
        notFoundMessage = `Agent with Email '${value}' not found.`;
      }

      try {
        const { statusCode, data } = await makeApiCall(context, endpoint, "GET");

        // ✅ Success Case: Found the agent.
        if (statusCode >= 200 && statusCode < 300) {
          // For email search, the API returns an array. Sort and take the most recent.
          let agent;
          if (find === "email") {
            const agents = data?.agents;
            if (Array.isArray(agents) && agents.length > 0) {
              agents.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
              agent = agents[0];
            }
          } else {
            agent = data?.agent;
          }

          if (agent) {
            return { statusCode: 200, data: { ...agent, datafound: true } };
          }
        }

        // 🤷 Not Found Case: API returned 404 or an empty array for email search.
        if (statusCode === 404 || (find === "email" && (!data?.agents || data.agents.length === 0))) {
          return { statusCode: 200, data: { datafound: false } };
        }

        // ❌ Error Case: Handle all other API errors.
        return {
          statusCode,
          data: {
            error: data?.message || "An unexpected error occurred.",
            details: data?.errors || null,
            datafound: false,
          },
        };
      } catch (error: any) {
        return handleActionError(error, context, "Find Agent");
      }
    },

    // 📊 Provides a sample for users to understand the output structure.
    sample: {
      fields: async (context: AppContext) => {
        const sample = await sampleData(context, "agents", "Create at least one agent in your account.");
        if (sample?.error) {
          throw new Error(sample.error);
        }
        return { ...sample, datafound: true };
      },
    },
    retry_on_response: [],
    retry_on_request: [],
    max_retries: 0,
    help: "",
    display_priority: 0,
    batch: false,
    batch_size: 0,
    bulk: false,
    deprecated: false,
    cursor_enabled: true,
  },
  update_agent: {
    id: "update_agent",
    name: "Update Agent",
    title: "Update Agent",
    subtitle: "Update an existing agent by their ID.",
    description: "Updates an existing agent's details, including roles, departments, and custom fields.",
    pick_lists: {},
    input_schema: {
      fields: async (context: AppContext) => getAgentInputSchema(context, "update"),
    },

    output_schema: {
      fields: async (context: AppContext) => {
        return await getOutputSchema(context, "agents", "Update an agent in your account to generate the schema.");
      },
    },

    execute: async (context: AppContext): Promise<ExecutionPayload> => {
      try {
        const { agent_id, ...eventData } = context.payload.data;

        if (!agent_id) {
          return {
            statusCode: 400,
            data: { error: "Agent ID is required for an update operation." },
          };
        }

        const inputschema: any = await getAgentInputSchema(context, "create");
        //  //console.log(inputschema);
        const payload = generatePayload(inputschema, eventData);

        const payloadwithRoles = transformRolesPayload(payload);
        // //console.log(payloadwithRoles);

        const result = await makeApiCall(context, `agents/${agent_id}`, "PUT", payloadwithRoles);
        const { statusCode, data } = result;

        if (statusCode >= 200 && statusCode < 300) {
          return { statusCode, data: data.agent };
        }

        return {
          statusCode,
          data: {
            error: data?.message || `Failed to update agent ${agent_id}.`,
            details: data?.errors || null,
          },
        };
      } catch (error: any) {
        return handleActionError(error, context, "Update Agent");
      }
    },
    sample: {
      fields: async (context: AppContext) => {
        return await sampleData(context, "agents", "Create at least one agent in your account.");
      },
    },
    retry_on_response: [],
    retry_on_request: [],
    max_retries: 0,
    help: "",
    display_priority: 0,
    batch: false,
    batch_size: 0,
    bulk: false,
    deprecated: false,
    cursor_enabled: true,
    has_config_fields: false,
    config_fields: {
      fields: async () => [],
    },
  },
  get_attachment_content: {
    id: "get_attachment_content",
    name: "Get Attachment Content",
    title: "Get Attachment Content",
    subtitle: "Retrieves the Base64 encoded content of an attachment",
    description: "Fetches a specific attachment by its ID and returns its content as a Base64 string.",
    pick_lists: {},
    config_fields: {
      fields: async (context) => [
        {
          name: "find",
          label: "Find by",
          type: "string",
          control_type: "select",
          optional: false,
          pick_list: [
            { label: "Id", value: "id" },
            { label: "URL", value: "URL" },
          ],
          hint: "Enter the Attachment ID Or URLof the attachment to retrieve.",
        },
      ],
    },
    has_config_fields: true,
    // 📝 Defines the single, mandatory input field: the attachment ID.
    input_schema: {
      fields: async function (_context) {
        const findKey = _context.payload.config_fields?.find as string;
        const object = { [findKey]: "string" };
        return GenerateSchema(object, [findKey]);
      },
    },

    // 📤 Defines the output, which is the Base64 content of the file.
    output_schema: {
      fields: async () => [
        {
          name: "base64Content",
          label: "Base64 Content",
          type: "string",
          control_type: "text-area",
          optional: false,
          hint: "The content of the attachment, encoded in Base64.",
        },
        {
          name: "datafound",
          label: "Datafound",
          type: "string",
          optional: false,
          hint: "The content of the attachment, encoded in Base64.",
        },
      ],
    },

    // 🚀 The core logic that fetches and encodes the attachment.
    execute: async (context: AppContext): Promise<ExecutionPayload> => {
      const { find } = context.payload.config_fields as any;
      const value = context.payload.data[find] as any;

      if (!value) {
        return {
          statusCode: 200,
          data: { datafound: false, error: "Attachment ID  Or URL is required." },
        };
      }
      // Fetch the raw attachment data as an ArrayBuffer.
      // const response = await makeApiCall(context, find === "id" ? `attachments/${value}` : value, "GET");
      // //console.log(response);
      const url = find === "id" ? `https://${context.auth.domain}.freshservice.com/api/v2/attachments/${value}` : value;
      const headers: any =
        find === "id"
          ? {
              Authorization: "Basic " + Buffer.from(context.auth.api_key + ":X").toString("base64"),
            }
          : {};
      // Fetch the raw attachment data as an ArrayBuffer.
      const response = await context.fetch(url, { method: "GET", headers });
      if (!response.ok) {
        const errorText = await response.text();
        return {
          data: {
            datafound: false,
            error: errorText,
          },
          statusCode: 200,
        };
      }
      // //console.log(response);
      const arrayBuffer = await response.arrayBuffer();
      const base64Content = Buffer.from(arrayBuffer).toString("base64");
      //   //console.log(base64Content.length);
      return {
        statusCode: 200,
        data: { base64Content, datafound: true },
      };
    },

    // 📊 Provides a sample for users to understand the output structure.
    sample: {
      output: {
        base64Content: "U2FtcGxlIGNvbnRlbnQgZm9yIGEgdGV4dCBmaWxlLg==", // "Sample content for a text file." in Base64
      },
    },
    retry_on_response: [],
    retry_on_request: [],
    max_retries: 0,
    help: "",
    display_priority: 0,
    batch: false,
    batch_size: 0,
    bulk: false,
    deprecated: false,
    cursor_enabled: true,
  },
};
async function pollRequesters(
  context: AppContext,
  dateField: "created_at" | "updated_at",
  Module: "requesters" | "agents"
): Promise<PollResponse> {
  const since: any = context?.payload?.data?.since || new Date(Date.now() - 5 * 60 * 1000).toISOString();
  const till: any = context?.payload?.data?.till || new Date().toISOString();
  const cursor: any = context?.payload?.data?.cursor || {};
  let page = cursor.page || 1;

  const allRecords: any[] = [];
  const perPageLimit = 100; // Max records per API call
  const totalRecordLimit = 1000; // Max records to return in one poll cycle
  let hasMore = false;

  // The Freshservice API requires spaces around the operator and no milliseconds in ISO string
  const cleanSince = since.split(".")[0] + "Z";
  const cleanTill = till.split(".")[0] + "Z";
  //console.log(cleanSince);
  //console.log(cleanTill);
  const query = `${dateField} :> '${cleanSince}' AND ${dateField} :< '${cleanTill}'`;
  const encodedQuery = encodeURIComponent(query);
  //console.log("encodedQuery", encodedQuery);

  while (allRecords.length < totalRecordLimit) {
    const endpoint = `${Module}?per_page=${perPageLimit}&page=${page}&query=${encodedQuery}`;

    const response: any = await makeApiCall(context, endpoint, "GET");
    //console.log(response);

    if (response.statusCode !== 200 || !response.data) {
      hasMore = false;
      break;
    }

    const records = response.data[Module] ?? [];

    if (records.length === 0) {
      hasMore = false;
      break;
    }

    // Local filter (defensive) — though query should already restrict it
    const filtered = records.filter((r: any) => {
      return r[dateField] >= cleanSince && r[dateField] <= cleanTill;
    });

    allRecords.push(...filtered);

    if (records.length < perPageLimit) {
      hasMore = false;
      break;
    }

    if (allRecords.length >= totalRecordLimit) {
      hasMore = true;
      page++;
      break;
    }

    page++;
  }

  return {
    since: cleanSince,
    till: cleanTill,
    hasMore,
    cursor: hasMore ? { page: page } : {},
    records: allRecords,
  };
}
async function pollProblems(context: AppContext, dateField: "created_at" | "updated_at"): Promise<PollResponse> {
  const since: any = context?.payload?.data?.since || new Date(Date.now() - 5 * 60 * 1000).toISOString();
  const till: any = context?.payload?.data?.till || new Date().toISOString();
  const cursor: any = context?.payload?.data?.cursor || {};
  let nextCursor = cursor.nextCursor || 1; // Use nextCursor for page number

  let allRecords: any[] = [];
  const perPageLimit = 100; // API limit per page
  const totalPollLimit = 1000; // Max records to fetch in one cycle
  let hasMore = false;

  // Use updated_since for efficient initial filtering on the API side
  const efficientSince = new Date(since).toISOString();

  while (allRecords.length < totalPollLimit) {
    // Target the /problems endpoint, include requester if needed
    const endpoint = `problems?updated_since=${efficientSince}&per_page=${perPageLimit}&page=${nextCursor}`;
    const response: any = await makeApiCall(context, endpoint, "GET");

    // Defensive check for API errors
    if (response.statusCode !== 200 || !response.data) {
      hasMore = false; // Stop polling on error
      break;
    }

    const records = response.data?.problems ?? []; // Use 'problems' key
    const meta = response.data?.meta ?? {};

    // Stop if API returns no records for this page
    if (records.length === 0) {
      hasMore = false;
      break;
    }

    // Filter records precisely by the requested dateField and time window (since/till)
    const filtered = records.filter((r: any) => {
      const recordDate = new Date(r[dateField]);
      return recordDate >= new Date(since) && recordDate <= new Date(till);
    });
    allRecords.push(...filtered);

    // Determine if there are more pages based on API response
    const hasNext = meta?.has_next || records.length === perPageLimit; // Check meta or if full page was returned

    // Stop conditions
    if (!hasNext || allRecords.length >= totalPollLimit) {
      hasMore = hasNext && allRecords.length >= totalPollLimit; // More exists if API had next AND we hit our limit
      nextCursor++; // Increment cursor page for the next cycle if hasMore is true
      break;
    }

    nextCursor++; // Go to the next page
  }

  // Process attachments for each record before returning
  allRecords = allRecords.map((item) => {
    const attachments = item.attachments || [];
    return {
      ...item,
      // Convert attachments array to comma-separated URLs
      attachments_url: attachments.map((att: any) => att.attachment_url).join(","),
      // Keep attachment IDs as an array
      attachment_ids: attachments.map((att: any) => att.id),
      // Get the ID of the first attachment, or null if none
      first_attachment_id: attachments.length > 0 ? attachments[0].id : null,
    };
  });

  return {
    since,
    till,
    hasMore,
    cursor: hasMore ? { nextCursor } : {}, // Store the next page number
    records: allRecords,
  };
}

async function pollChanges(context: AppContext, dateField: "created_at" | "updated_at"): Promise<PollResponse> {
  const since: any = context?.payload?.data?.since || new Date(Date.now() - 5 * 60 * 1000).toISOString();
  const till: any = context?.payload?.data?.till || new Date().toISOString();
  const cursor: any = context?.payload?.data?.cursor || {};
  let nextCursor = cursor.nextCursor || 1; // Use nextCursor for page number

  let allRecords: any[] = [];
  const perPageLimit = 100; // API limit per page
  const totalPollLimit = 1000; // Max records to fetch in one cycle
  let hasMore = false;

  // Use updated_since for efficient initial filtering on the API side
  const efficientSince = new Date(since).toISOString();

  while (allRecords.length < totalPollLimit) {
    // Target the /changes endpoint, include requester if needed
    const endpoint = `changes?updated_since=${efficientSince}&per_page=${perPageLimit}&page=${nextCursor}`; // Target 'changes' endpoint
    const response: any = await makeApiCall(context, endpoint, "GET");

    // Defensive check for API errors
    if (response.statusCode !== 200 || !response.data) {
      hasMore = false; // Stop polling on error
      break;
    }

    const records = response.data?.changes ?? []; // Use 'changes' key
    const meta = response.data?.meta ?? {};

    // Stop if API returns no records for this page
    if (records.length === 0) {
      hasMore = false;
      break;
    }

    // Filter records precisely by the requested dateField and time window (since/till)
    const filtered = records.filter((r: any) => {
      const recordDate = new Date(r[dateField]);
      return recordDate >= new Date(since) && recordDate <= new Date(till);
    });
    allRecords.push(...filtered);

    // Determine if there are more pages based on API response
    const hasNext = meta?.has_next || records.length === perPageLimit; // Check meta or if full page was returned

    // Stop conditions
    if (!hasNext || allRecords.length >= totalPollLimit) {
      hasMore = hasNext && allRecords.length >= totalPollLimit; // More exists if API had next AND we hit our limit
      nextCursor++; // Increment cursor page for the next cycle if hasMore is true
      break;
    }

    nextCursor++; // Go to the next page
  }

  // Process attachments for each record before returning
  allRecords = allRecords.map((item) => {
    const attachments = item.attachments || [];
    return {
      ...item,
      // Convert attachments array to comma-separated URLs
      attachments_url: attachments.map((att: any) => att.attachment_url).join(","),
      // Keep attachment IDs as an array
      attachment_ids: attachments.map((att: any) => att.id),
      // Get the ID of the first attachment, or null if none
      first_attachment_id: attachments.length > 0 ? attachments[0].id : null,
    };
  });

  return {
    since,
    till,
    hasMore,
    cursor: hasMore ? { nextCursor } : {}, // Store the next page number
    records: allRecords,
  };
}

async function pollReleases(context: AppContext, dateField: "created_at" | "updated_at"): Promise<PollResponse> {
  const since: any = context?.payload?.data?.since || new Date(Date.now() - 5 * 60 * 1000).toISOString();
  const till: any = context?.payload?.data?.till || new Date().toISOString();
  const cursor: any = context?.payload?.data?.cursor || {};
  let nextCursor = cursor.nextCursor || 1; // Use nextCursor for page number

  let allRecords: any[] = [];
  const perPageLimit = 100; // API limit per page
  const totalPollLimit = 1000; // Max records to fetch in one cycle
  let hasMore = false;

  // Use updated_since for efficient initial filtering on the API side
  const efficientSince = new Date(since).toISOString();

  while (allRecords.length < totalPollLimit) {
    // Target the /releases endpoint
    const endpoint = `releases?updated_since=${efficientSince}&per_page=${perPageLimit}&page=${nextCursor}`; // Target 'releases' endpoint
    const response: any = await makeApiCall(context, endpoint, "GET");

    // Defensive check for API errors
    if (response.statusCode !== 200 || !response.data) {
      hasMore = false; // Stop polling on error
      break;
    }

    const records = response.data?.releases ?? []; // Use 'releases' key
    const meta = response.data?.meta ?? {};

    // Stop if API returns no records for this page
    if (records.length === 0) {
      hasMore = false;
      break;
    }

    // Filter records precisely by the requested dateField and time window (since/till)
    const filtered = records.filter((r: any) => {
      const recordDate = new Date(r[dateField]);
      return recordDate >= new Date(since) && recordDate <= new Date(till);
    });
    allRecords.push(...filtered);

    // Determine if there are more pages based on API response
    const hasNext = meta?.has_next || records.length === perPageLimit; // Check meta or if full page was returned

    // Stop conditions
    if (!hasNext || allRecords.length >= totalPollLimit) {
      hasMore = hasNext && allRecords.length >= totalPollLimit; // More exists if API had next AND we hit our limit
      nextCursor++; // Increment cursor page for the next cycle if hasMore is true
      break;
    }

    nextCursor++; // Go to the next page
  }

  // Process attachments for each record before returning
  allRecords = allRecords.map((item) => {
    const attachments = item.attachments || [];
    return {
      ...item,
      // Convert attachments array to comma-separated URLs
      attachments: attachments.map((att: any) => att.attachment_url).join(","),
      // Keep attachment IDs as an array
      attachment_ids: attachments.map((att: any) => att.id),
      // Get the ID of the first attachment, or null if none
      first_attachment_id: attachments.length > 0 ? attachments[0].id : null,
    };
  });

  return {
    since,
    till,
    hasMore,
    cursor: hasMore ? { nextCursor } : {}, // Store the next page number
    records: allRecords,
  };
}
async function pollContracts(context: AppContext, dateField: "created_at" | "updated_at"): Promise<PollResponse> {
  const since: any = context?.payload?.data?.since || new Date(Date.now() - 5 * 60 * 1000).toISOString();
  const till: any = context?.payload?.data?.till || new Date().toISOString();
  const cursor: any = context?.payload?.data?.cursor || {};
  let nextCursor = cursor.nextCursor || 1; // Use nextCursor for page number

  let allRecords: any[] = [];
  const perPageLimit = 100; // API limit per page
  const totalPollLimit = 1000; // Max records to fetch in one cycle
  let hasMore = false;

  // Use updated_since for efficient initial filtering on the API side

  while (allRecords.length < totalPollLimit) {
    // Target the /releases endpoint
    const endpoint = `contracts?per_page=${perPageLimit}&page=${nextCursor}`; // Target 'releases' endpoint
    const response: any = await makeApiCall(context, endpoint, "GET");

    // Defensive check for API errors
    if (response.statusCode !== 200 || !response.data) {
      hasMore = false; // Stop polling on error
      break;
    }

    const records = response.data?.contracts ?? []; // Use 'releases' key
    const meta = response.data?.meta ?? {};

    // Stop if API returns no records for this page
    if (records.length === 0) {
      hasMore = false;
      break;
    }

    // Filter records precisely by the requested dateField and time window (since/till)
    const filtered = records.filter((r: any) => {
      const recordDate = new Date(r[dateField]);
      return recordDate >= new Date(since) && recordDate <= new Date(till);
    });
    allRecords.push(...filtered);

    // Determine if there are more pages based on API response
    const hasNext = meta?.has_next || records.length === perPageLimit; // Check meta or if full page was returned

    // Stop conditions
    if (!hasNext || allRecords.length >= totalPollLimit) {
      hasMore = hasNext && allRecords.length >= totalPollLimit; // More exists if API had next AND we hit our limit
      nextCursor++; // Increment cursor page for the next cycle if hasMore is true
      break;
    }

    nextCursor++; // Go to the next page
  }

  // Process attachments for each record before returning
  allRecords = allRecords.map((item) => {
    const attachments = item.attachments || [];
    return {
      ...item,
      // Convert attachments array to comma-separated URLs
      attachments: attachments.map((att: any) => att.attachment_url).join(","),
      // Keep attachment IDs as an array
      attachment_ids: attachments.map((att: any) => att.id),
      // Get the ID of the first attachment, or null if none
      first_attachment_id: attachments.length > 0 ? attachments[0].id : null,
    };
  });

  return {
    since,
    till,
    hasMore,
    cursor: hasMore ? { nextCursor } : {}, // Store the next page number
    records: allRecords,
  };
} //pollContracts
async function pollAssets(context: AppContext, dateField: "created_at" | "updated_at"): Promise<PollResponse> {
  const since: any = context?.payload?.data?.since || new Date(Date.now() - 5 * 60 * 1000).toISOString();
  const till: any = context?.payload?.data?.till || new Date().toISOString();
  const cursor: any = context?.payload?.data?.cursor || {};
  let nextCursor = cursor.nextCursor || 1;

  let allRecords: any[] = [];
  const perPageLimit = 100; // Freshservice API page size
  const totalPollLimit = 1000; // Max total fetched
  let hasMore = false;

  const efficientSince = new Date(since).toISOString();

  while (allRecords.length < totalPollLimit) {
    const endpoint = `assets?per_page=${perPageLimit}&page=${nextCursor}`;
    const response: any = await makeApiCall(context, endpoint, "GET");

    if (response.statusCode !== 200 || !response.data) {
      hasMore = false;
      break;
    }

    const records = response.data?.assets ?? [];
    const meta = response.data?.meta ?? {};

    if (records.length === 0) {
      hasMore = false;
      break;
    }

    // Filter within time window
    const filtered = records.filter((r: any) => {
      const recordDate = new Date(r[dateField]);
      return recordDate >= new Date(since) && recordDate <= new Date(till);
    });
    allRecords.push(...filtered);

    const hasNext = meta?.has_next || records.length === perPageLimit;
    if (!hasNext || allRecords.length >= totalPollLimit) {
      hasMore = hasNext && allRecords.length >= totalPollLimit;
      nextCursor++;
      break;
    }

    nextCursor++;
  }

  // Normalize asset attachments & enrich data
  // //console.log(allRecords.slice(0, 1));
  allRecords = allRecords.map((item) => {
    const attachments = item.attachments || [];
    return {
      ...item,
      attachments: attachments.map((att: any) => att.attachment_url).join(","),
      attachment_ids: attachments.map((att: any) => att.id),
      first_attachment_id: attachments.length > 0 ? attachments[0].id : null,
    };
  });

  return {
    since,
    till,
    hasMore,
    cursor: hasMore ? { nextCursor } : {},
    records: allRecords,
  };
}
async function pollCustomRecords(
  context: AppContext,
  dateField: "bo_created_at" | "bo_updated_at"
): Promise<PollResponse> {
  const since: any = context?.payload?.data?.since || new Date(Date.now() - 5 * 60 * 1000).toISOString();
  const till: any = context?.payload?.data?.till || new Date().toISOString();
  const cursor: any = context?.payload?.data?.cursor || {};
  let nextCursor = cursor.nextCursor || 1;

  const objectId = context?.payload?.config_fields?.object_id;
  if (!objectId) throw new Error("Missing required config field: object_id");

  let allRecords: any[] = [];
  const perPageLimit = 100;
  const totalPollLimit = 1000;
  let hasMore = false;

  while (allRecords.length < totalPollLimit) {
    const endpoint = `objects/${objectId}/records?page_size=${perPageLimit}&page=${nextCursor}`;
    const response: any = await makeApiCall(context, endpoint, "GET");

    if (response.statusCode !== 200 || !response.data) {
      hasMore = false;
      break;
    }

    const records = response.data?.records?.map((r: any) => r.data) ?? [];
    const meta = response.data?.meta ?? {};

    if (records.length === 0) {
      hasMore = false;
      break;
    }

    // Filter by date range
    const filtered = records.filter((r: any) => {
      const recordDate = new Date(r[dateField]);
      return recordDate >= new Date(since) && recordDate <= new Date(till);
    });

    allRecords.push(...filtered);

    const hasNext = meta?.has_more || records.length === perPageLimit;
    if (!hasNext || allRecords.length >= totalPollLimit) {
      hasMore = hasNext && allRecords.length >= totalPollLimit;
      nextCursor++;
      break;
    }

    nextCursor++;
  }

  return {
    since,
    till,
    hasMore,
    cursor: hasMore ? { nextCursor } : {},
    records: allRecords,
  };
}

const triggers: Triggers = {
  new_custom_record: {
    id: "new_custom_record",
    name: "New Custom Record",
    type: "poll",
    title: "New Custom Record",
    subtitle: "Triggers when a new record is created in a selected Custom Object.",
    description: "Polls for newly created records in the selected Freshservice Custom Object.",
    pick_lists: {},
    dedup: (record: any) => record.id as string,

    poll: async (context: AppContext) => pollCustomRecords(context, "bo_created_at"),

    output_schema: {
      fields: async (context: AppContext) => {
        const objectId = context?.payload?.config_fields?.object_id;
        if (!objectId) {
          throw new Error("Select proper object id to retrive the schema");
        }
        return await getOutputSchemaCustom(
          context,
          `objects/${objectId}/records?page_size=1`,
          "records",
          "Create a record in the selected Custom Object to generate schema."
        );
      },
    },

    sample: async (context: AppContext) => {
      const objectId = context?.payload?.config_fields?.object_id;
      if (!objectId) throw new Error("select the objects to retrive the related sample data");
      const sampledata: any = await sampleDataForm(context, `objects/${objectId}/records?page_size=1`, "records");
      if (sampledata.error) {
        throw new Error(sampledata.error);
      }
      return sampledata.data;
    },

    help: "",
    display_priority: 0,
    batch: false,
    batch_size: 0,
    bulk: false,
    deprecated: false,
    cursor_enabled: true,
    has_config_fields: true,
    config_fields: {
      fields: async (context: AppContext) => {
        const allObject = await getAllCustomObject(context, "objects");
        return [
          {
            name: "object_id",
            label: "Custom Object",
            type: "number",
            control_type: "select",
            optional: false,
            pick_list: allObject,
            hint: "Select the Custom Object where the record will be created.",
          },
        ];
      },
    },
    input_schema: { fields: async () => [] },
  },
  updated_custom_record: {
    id: "updated_custom_record",
    name: "Updated Custom Record",
    type: "poll",
    title: "Custom Record Updated",
    subtitle: "Triggers when a record is updated in a selected Custom Object.",
    description: "Polls for updated records in the selected Freshservice Custom Object.",
    pick_lists: {},
    dedup: (record: any) => `${record.id}_${record.updated_at}`,

    poll: async (context: AppContext) => pollCustomRecords(context, "bo_updated_at"),

    output_schema: {
      fields: async (context: AppContext) => {
        const objectId = context?.payload?.config_fields?.object_id;
        if (!objectId) {
          throw new Error("Select proper object id to retrive the schema");
        }
        return await getOutputSchemaCustom(
          context,
          `objects/${objectId}/records?page_size=1`,
          "records",
          "Update a record in the selected Custom Object to generate schema."
        );
      },
    },

    sample: async (context: AppContext) => {
      const objectId = context?.payload?.config_fields?.object_id;
      if (!objectId) throw new Error("select the objects to retrive the related sample data");
      const sampledata: any = await sampleDataForm(context, `objects/${objectId}/records?page_size=1`, "records");
      if (sampledata.error) {
        throw new Error(sampledata.error);
      }
      return sampledata.data;
    },

    help: "",
    display_priority: 0,
    batch: false,
    batch_size: 0,
    bulk: false,
    deprecated: false,
    cursor_enabled: true,
    has_config_fields: true,
    config_fields: {
      fields: async (context: AppContext) => {
        const allObject = await getAllCustomObject(context, "objects");
        return [
          {
            name: "object_id",
            label: "Custom Object",
            type: "number",
            control_type: "select",
            optional: false,
            pick_list: allObject,
            hint: "Select the Custom Object to monitor for record updates.",
          },
        ];
      },
    },
    input_schema: { fields: async () => [] },
  },

  new_asset_created: {
    id: "new_asset_created",
    name: "New Asset Created",
    type: "poll",
    title: "New Asset",
    subtitle: "Triggers when a new asset is created in Freshservice.",
    description: "Polls for newly created assets in Freshservice.",
    pick_lists: {},
    // Dedup using asset ID
    dedup: (record: any) => record.id as string,

    // Use pollAssets helper for created records
    poll: async (context: AppContext) => pollAssets(context, "created_at"),

    // Output schema targeting assets endpoint
    output_schema: {
      fields: async (context: AppContext) => {
        return await getOutputSchemaForm(
          context,
          "assets?per_page=1&order_by=created_at&order_type=desc",
          "assets",
          "Create a new asset in the account to generate schema."
        );
      },
    },

    // Sample data targeting assets endpoint
    sample: async (context: AppContext) => {
      return await sampleDataForm(context, "assets?per_page=1&order_by=created_at&order_type=desc", "assets");
    },

    // Standard trigger properties
    help: "",
    display_priority: 0,
    batch: false,
    batch_size: 0,
    bulk: false,
    deprecated: false,
    cursor_enabled: true,
    has_config_fields: false,
    config_fields: { fields: async () => [] },
    input_schema: { fields: async () => [] },
  },
  updated_asset: {
    id: "updated_asset",
    name: "Asset Updated",
    type: "poll",
    title: "Asset Updated",
    subtitle: "Triggers when an asset is updated in Freshservice.",
    description: "Polls for assets that have been updated in Freshservice.",
    pick_lists: {},
    // Dedup using asset ID + updated timestamp
    dedup: (record: any) => `${record.id}_${record.updated_at}`,

    // Use pollAssets helper for updated records
    poll: async (context: AppContext) => pollAssets(context, "updated_at"),

    // Output schema targeting assets endpoint
    output_schema: {
      fields: async (context: AppContext) => {
        return await getOutputSchemaForm(
          context,
          "assets?per_page=1",
          "assets",
          "Update an asset in the account to generate schema."
        );
      },
    },

    // Sample data targeting assets endpoint
    sample: async (context: AppContext) => {
      return await sampleDataForm(context, "assets?per_page=1&order_by=updated_at&order_type=desc", "assets");
    },

    // Standard trigger properties
    help: "",
    display_priority: 0,
    batch: false,
    batch_size: 0,
    bulk: false,
    deprecated: false,
    cursor_enabled: true,
    has_config_fields: false,
    config_fields: { fields: async () => [] },
    input_schema: { fields: async () => [] },
  },

  new_release_created: {
    id: "new_release_created",
    name: "New Release Created",
    type: "poll",
    title: "New Release",
    subtitle: "Triggers when a new release is created.",
    description: "Polls for newly created releases in Freshservice.",
    pick_lists: {},
    // Dedup using release ID
    dedup: (record: any) => record.id as string,

    // Use the specific pollReleases helper
    poll: async (context: AppContext) => pollReleases(context, "created_at"),

    // Output schema targeting releases endpoint
    output_schema: {
      fields: async (context: AppContext) => {
        // Use getOutputSchemaForm and target 'releases' endpoint
        return await getOutputSchemaForm(
          context,
          // Endpoint should include requester if needed by schema
          "releases?updated_since=1990-01-01T02:00:00Z",
          "releases", // Key to extract from response data
          "Create a release in the account to generate schema."
        );
      },
    },

    // Sample data targeting releases endpoint
    sample: async (context: AppContext) => {
      // Use sampleDataForm and target 'releases' endpoint
      return await sampleDataForm(
        context,
        "releases?updated_since=1990-01-01T02:00:00Z&per_page=1",
        "releases" // Key to extract sample from
      );
    },
    // Standard trigger properties
    help: "",
    display_priority: 0, // Adjust priority as needed
    batch: false,
    batch_size: 0,
    bulk: false,
    deprecated: false,
    cursor_enabled: true,
    has_config_fields: false,
    config_fields: { fields: async () => [] },
    input_schema: { fields: async () => [] },
  },

  updated_release: {
    id: "updated_release",
    name: "Release Updated",
    type: "poll",
    title: "Release Updated",
    subtitle: "Triggers when a release is updated in Freshservice.",
    description: "Polls for releases that have been updated in Freshservice.",
    pick_lists: {},
    // Dedup using release ID + updated timestamp
    dedup: (record: any) => `${record.id}_${record.updated_at}`,

    // Use the specific pollReleases helper
    poll: async (context: AppContext) => pollReleases(context, "updated_at"),

    // Output schema targeting releases endpoint
    output_schema: {
      fields: async (context: AppContext) => {
        return await getOutputSchemaForm(
          context,
          "releases?updated_since=1990-01-01T02:00:00Z",
          "releases",
          "Update a release in the account to generate schema."
        );
      },
    },

    // Sample data targeting releases endpoint
    sample: async (context: AppContext) => {
      return await sampleDataForm(context, "releases?updated_since=1990-01-01T02:00:00Z&per_page=1", "releases");
    },
    // Standard trigger properties
    help: "",
    display_priority: 0, // Adjust priority as needed
    batch: false,
    batch_size: 0,
    bulk: false,
    deprecated: false,
    cursor_enabled: true,
    has_config_fields: false,
    config_fields: { fields: async () => [] },
    input_schema: { fields: async () => [] },
  },
  new_contract_created: {
    id: "new_contract_created",
    name: "New Contract Created",
    type: "poll",
    title: "New Contract",
    subtitle: "Triggers when a new contract is created in Freshservice.",
    description: "Polls for newly created contracts in Freshservice.",
    pick_lists: {},
    // Dedup using contract ID
    dedup: (record: any) => record.id as string,

    // Use pollContracts helper for created_at field
    poll: async (context: AppContext) => pollContracts(context, "created_at"),

    // Output schema targeting contracts endpoint
    output_schema: {
      fields: async (context: AppContext) => {
        return await getOutputSchemaForm(
          context,
          "contracts",
          "contracts",
          "Create a contract in the account to generate schema."
        );
      },
    },

    // Sample data targeting contracts endpoint
    sample: async (context: AppContext) => {
      return await sampleDataForm(context, "contracts?per_page=1", "contracts");
    },

    // Standard trigger properties
    help: "",
    display_priority: 0,
    batch: false,
    batch_size: 0,
    bulk: false,
    deprecated: false,
    cursor_enabled: true,
    has_config_fields: false,
    config_fields: { fields: async () => [] },
    input_schema: { fields: async () => [] },
  },

  updated_contract: {
    id: "updated_contract",
    name: "Contract Updated",
    type: "poll",
    title: "Contract Updated",
    subtitle: "Triggers when a contract is updated in Freshservice.",
    description: "Polls for contracts that have been updated in Freshservice.",
    pick_lists: {},
    // Dedup using contract ID + updated timestamp
    dedup: (record: any) => `${record.id}_${record.updated_at}`,

    // Use pollContracts helper for updated_at field
    poll: async (context: AppContext) => pollContracts(context, "updated_at"),

    // Output schema targeting contracts endpoint
    output_schema: {
      fields: async (context: AppContext) => {
        return await getOutputSchemaForm(
          context,
          "contracts",
          "contracts",
          "Update a contract in the account to generate schema."
        );
      },
    },

    // Sample data targeting contracts endpoint
    sample: async (context: AppContext) => {
      return await sampleDataForm(context, "contracts?per_page=1", "contracts");
    },

    // Standard trigger properties
    help: "",
    display_priority: 0,
    batch: false,
    batch_size: 0,
    bulk: false,
    deprecated: false,
    cursor_enabled: true,
    has_config_fields: false,
    config_fields: { fields: async () => [] },
    input_schema: { fields: async () => [] },
  },

  new_change_created: {
    id: "new_change_created",
    name: "New Change Created",
    type: "poll",
    title: "New Change",
    subtitle: "Triggers when a new change request is created.",
    description: "Polls for newly created change requests in Freshservice.",
    pick_lists: {},
    // Dedup using change ID
    dedup: (record: any) => record.id as string,

    // Use the specific pollChanges helper
    poll: async (context: AppContext) => pollChanges(context, "created_at"),

    // Output schema targeting changes endpoint
    output_schema: {
      fields: async (context: AppContext) => {
        // Use getOutputSchemaForm and target 'changes' endpoint
        return await getOutputSchemaForm(
          context,
          // Endpoint should include requester if needed by schema
          "changes?updated_since=1990-01-01T02:00:00Z",
          "changes", // Key to extract from response data
          "Create a change request in the account to generate schema."
        );
      },
    },

    // Sample data targeting changes endpoint
    sample: async (context: AppContext) => {
      // Use sampleDataForm and target 'changes' endpoint
      return await sampleDataForm(
        context,
        "changes?updated_since=1990-01-01T02:00:00Z&per_page=1",
        "changes" // Key to extract sample from
      );
    },
    // Standard trigger properties
    help: "",
    display_priority: 0, // Adjust priority as needed
    batch: false,
    batch_size: 0,
    bulk: false,
    deprecated: false,
    cursor_enabled: true,
    has_config_fields: false,
    config_fields: { fields: async () => [] },
    input_schema: { fields: async () => [] },
  },

  updated_change: {
    id: "updated_change",
    name: "Change Updated",
    type: "poll",
    title: "Change Updated",
    subtitle: "Triggers when a change request is updated in Freshservice.",
    description: "Polls for change requests that have been updated in Freshservice.",
    pick_lists: {},
    // Dedup using change ID + updated timestamp
    dedup: (record: any) => `${record.id}_${record.updated_at}`,

    // Use the specific pollChanges helper
    poll: async (context: AppContext) => pollChanges(context, "updated_at"),

    // Output schema targeting changes endpoint
    output_schema: {
      fields: async (context: AppContext) => {
        return await getOutputSchemaForm(
          context,
          "changes?updated_since=1990-01-01T02:00:00Z",
          "changes",
          "Update a change request in the account to generate schema."
        );
      },
    },

    // Sample data targeting changes endpoint
    sample: async (context: AppContext) => {
      return await sampleDataForm(context, "changes?updated_since=1990-01-01T02:00:00Z&per_page=1", "changes");
    },
    // Standard trigger properties
    help: "",
    display_priority: 0, // Adjust priority as needed
    batch: false,
    batch_size: 0,
    bulk: false,
    deprecated: false,
    cursor_enabled: true,
    has_config_fields: false,
    config_fields: { fields: async () => [] },
    input_schema: { fields: async () => [] },
  },
  new_requester_created: {
    id: "new_requester_created",
    name: "New Requester Created",
    type: "poll",
    title: "New Requester",
    subtitle: "Triggers when a new requester is created.",
    description: "Polls for newly created requesters in Freshservice.",
    help: "",
    batch_size: 1,
    cursor_enabled: true,
    display_priority: 2,
    batch: false,
    bulk: false,
    deprecated: false,
    has_config_fields: false,
    pick_lists: {},
    config_fields: {
      fields: async () => [],
    },
    input_schema: {
      fields: async () => [],
    },
    // Use the requester's unique ID for deduplication.
    dedup: (record: DataPayload) => record.id as string,

    // The polling logic is now handled by our robust, paginated helper function.
    poll: async (context: AppContext) => pollRequesters(context, "created_at", "requesters"),

    output_schema: {
      fields: async (context: AppContext) => {
        return await getOutputSchema(context, "requesters", "Create a requester to see the output schema.");
      },
    },

    sample: async (context: AppContext) => {
      return await sampleData(context, "requesters", "Create at least one requester in your account.");
    },
  },

  updated_requester: {
    id: "updated_requester",
    name: "Requester Updated",
    type: "poll",
    title: "Requester Updated",
    subtitle: "Triggers when an existing requester is updated.",
    description: "Polls for recently updated requesters in Freshservice.",
    help: "",
    pick_lists: {},
    batch_size: 1,
    cursor_enabled: true,
    display_priority: 2,
    batch: false,
    bulk: false,
    deprecated: false,
    has_config_fields: false,
    config_fields: {
      fields: async () => [],
    },
    input_schema: {
      fields: async () => [],
    },
    // Deduplicate using a combination of ID and the updated_at timestamp.
    dedup: (record: DataPayload) => `${record.id}-${record.updated_at}`,

    // The polling logic is now handled by our robust, paginated helper function.
    poll: async (context: AppContext) => pollRequesters(context, "updated_at", "requesters"),

    output_schema: {
      fields: async (context: AppContext) => {
        return await getOutputSchema(context, "requesters", "Update a requester to see the output schema.");
      },
    },

    sample: async (context: AppContext) => {
      return await sampleData(context, "requesters", "Update at least one requester in your account.");
    },
  },
  new_agent_created: {
    id: "new_agent_created",
    name: "New Agent Created",
    type: "poll",
    title: "New Agent",
    subtitle: "Triggers when a new agent is created.",
    description: "Polls for newly created agents in Freshservice.",
    help: "",
    batch_size: 1,
    pick_lists: {},
    cursor_enabled: true,
    display_priority: 2, // Or adjust as needed
    batch: false,
    bulk: false,
    deprecated: false,
    has_config_fields: false,
    config_fields: {
      fields: async () => [],
    },
    input_schema: {
      fields: async () => [],
    },
    // Use the agent's unique ID for deduplication.
    dedup: (record: DataPayload) => record.id as string,

    // Use the new pollAgents helper function.
    poll: async (context: AppContext) => pollRequesters(context, "created_at", "agents"),

    output_schema: {
      fields: async (context: AppContext) => {
        // Fetch schema based on the 'agents' endpoint.
        return await getOutputSchema(context, "agents", "Create an agent to see the output schema.");
      },
    },

    sample: async (context: AppContext) => {
      // Fetch sample data from the 'agents' endpoint.
      return await sampleData(context, "agents", "Create at least one agent in your account.");
    },
  },
  updated_agent: {
    id: "updated_agent",
    name: "Agent Updated",
    type: "poll",
    title: "Agent Updated",
    subtitle: "Triggers when an existing agent is updated.",
    description: "Polls for recently updated agents in Freshservice.",
    help: "",
    batch_size: 1,
    cursor_enabled: true,
    pick_lists: {},
    display_priority: 2, // Or adjust as needed
    batch: false,
    bulk: false,
    deprecated: false,
    has_config_fields: false,
    config_fields: {
      fields: async () => [],
    },
    input_schema: {
      fields: async () => [],
    },
    // Deduplicate using a combination of ID and the updated_at timestamp.
    dedup: (record: DataPayload) => `${record.id}-${record.updated_at}`,

    // Use the new pollAgents helper function.
    poll: async (context: AppContext) => pollRequesters(context, "updated_at", "agents"),

    output_schema: {
      fields: async (context: AppContext) => {
        // Fetch schema based on the 'agents' endpoint.
        return await getOutputSchema(context, "agents", "Update an agent to see the output schema.");
      },
    },

    sample: async (context: AppContext) => {
      // Fetch sample data from the 'agents' endpoint.
      return await sampleData(context, "agents", "Update at least one agent in your account.");
    },
  },
  new_onboarding_request: {
    id: "new_onboarding_request",
    name: "New Onboarding Request",
    type: "poll",
    title: "New Onboarding Request",
    subtitle: "Triggers when a new employee onboarding request is created.",
    description: "Polls for new onboarding requests created in Freshservice.",
    pick_lists: {},
    // Use the request ID for deduplication to ensure each request triggers only once.
    dedup: (record: DataPayload) => record.id as string,

    poll: async (context: AppContext): Promise<PollResponse> => {
      const since: any = context?.payload?.data?.since || new Date(Date.now() - 5 * 60 * 1000).toISOString();
      const till: any = context?.payload?.data?.till || new Date().toISOString();
      const cursor: any = context?.payload?.data?.cursor || {};
      let nextCursor = cursor.nextCursor || 1;

      const allRecords: any[] = [];
      const limit = 100;
      let hasMore = false;

      while (allRecords.length < 1000) {
        const response: any = await makeApiCall(
          context,
          `onboarding_requests?per_page=${limit}&page=${nextCursor}`,
          "GET"
        );

        // ⚙️ Defensive check in case API failed
        if (response.statusCode !== 200 || !response.data) {
          break;
        }

        const records = response.data?.onboarding_requests ?? [];
        const meta = response.data?.meta ?? {};

        // 🧩 Filter records by date range
        const filtered = records.filter((r: any) => r.created_at >= since && r.created_at <= till);
        allRecords.push(...filtered);

        // 🔁 Pagination handling
        const hasNext = meta?.has_next || records.length === limit;

        if (!hasNext || allRecords.length >= 1000) {
          hasMore = hasNext && allRecords.length >= 1000;
          nextCursor++;
          break;
        }

        nextCursor++;
      }

      return {
        since,
        till,
        hasMore,
        cursor: hasMore ? { nextCursor } : {},
        records: allRecords,
      };
    },

    // Define the structure of the data that this trigger will output.
    output_schema: {
      fields: async (context: AppContext) => {
        const schema = await getOutputSchema(
          context,
          "onboarding_requests",
          "Create On-Boarding Request In Your Acoount"
        );
        if (schema?.error) throw new Error(schema.error);
        return schema;
      },
    },

    sample: async (context: AppContext) => {
      const schema = await sampleData(context, "onboarding_requests");
      if (schema?.error) {
        throw new Error(schema.error);
      }
      return schema;
    },
    help: "",
    display_priority: 0,
    batch: false,
    batch_size: 0,
    bulk: false,
    deprecated: false,
    cursor_enabled: true,
    has_config_fields: false,
    config_fields: {
      fields: async function (_context) {
        return [];
      },
    },
    input_schema: {
      fields: async function (_context) {
        return [];
      },
    },
  },

  new_offboarding_request: {
    id: "new_offboarding_request",
    name: "New Offboarding Request",
    type: "poll",
    title: "New Offboarding Request",
    subtitle: "Triggers when a new employee offboarding request is created.",
    description: "Polls for new offboarding requests created in Freshservice.",
    pick_lists: {},
    dedup: (record: DataPayload) => record.id as string,
    poll: async (context: AppContext): Promise<PollResponse> => {
      const since: any = context?.payload?.data?.since || new Date(Date.now() - 5 * 60 * 1000).toISOString();
      const till: any = context?.payload?.data?.till || new Date().toISOString();
      const cursor: any = context?.payload?.data?.cursor || {};
      let nextCursor = cursor.nextCursor || 1;

      const allRecords: any[] = [];
      const limit = 100;
      let hasMore = false;

      while (allRecords.length < 1000) {
        const response: any = await makeApiCall(
          context,
          `offboarding_requests?per_page=${limit}&page=${nextCursor}`,
          "GET"
        );

        // ⚙️ Defensive check in case API failed
        if (response.statusCode !== 200 || !response.data) {
          break;
        }

        const records = response.data?.offboarding_requests ?? [];
        const meta = response.data?.meta ?? {};

        // 🧩 Filter records by date range
        const filtered = records.filter((r: any) => r.created_at >= since && r.created_at <= till);
        allRecords.push(...filtered);

        // 🔁 Pagination handling
        const hasNext = meta?.has_next || records.length === limit;

        if (!hasNext || allRecords.length >= 1000) {
          hasMore = hasNext && allRecords.length >= 1000;
          nextCursor++;
          break;
        }

        nextCursor++;
      }

      return {
        since,
        till,
        hasMore,
        cursor: hasMore ? { nextCursor } : {},
        records: allRecords,
      };
    },

    // Define the structure of the data that this trigger will output.
    output_schema: {
      fields: async (context: AppContext) => {
        const schema = await getOutputSchema(
          context,
          "offboarding_requests",
          "Create Off-Boarding Request In Your Acoount"
        );
        if (schema?.error) throw new Error(schema.error);
        return schema;
      },
    },

    sample: async (context: AppContext) => {
      const schema = await sampleData(context, "offboarding_requests");
      if (schema?.error) {
        throw new Error(schema.error);
      }
      return schema;
    },
    help: "",
    display_priority: 0,
    batch: false,
    batch_size: 0,
    bulk: false,
    deprecated: false,
    cursor_enabled: true,
    has_config_fields: false,
    config_fields: {
      fields: async function (_context) {
        return [];
      },
    },
    input_schema: {
      fields: async function (_context) {
        return [];
      },
    },
  },

  updated_onboarding_request: {
    id: "updated_onboarding_request",
    name: "Updated Onboarding Request",
    type: "poll",
    title: "Updated Onboarding Request",
    subtitle: "Triggers when an existing employee onboarding request is updated.",
    description: "Polls for onboarding requests updated in Freshservice.",
    pick_lists: {},
    // Deduplication using request ID + updated_at to avoid duplicate triggers
    dedup: (record: any) => `${record.id}-${record.updated_at}`,

    poll: async (context: AppContext): Promise<PollResponse> => {
      const since: any = context?.payload?.data?.since || new Date(Date.now() - 5 * 60 * 1000).toISOString();
      const till: any = context?.payload?.data?.till || new Date().toISOString();
      const cursor: any = context?.payload?.data?.cursor || {};
      let nextCursor = cursor.nextCursor || 1;

      const allRecords: any[] = [];
      const limit = 100;
      let hasMore = false;

      while (allRecords.length < 1000) {
        const response: any = await makeApiCall(
          context,
          `onboarding_requests?per_page=${limit}&page=${nextCursor}`,
          "GET"
        );

        if (response.statusCode !== 200 || !response.data) {
          break;
        }

        const records = response.data?.onboarding_requests ?? [];
        const meta = response.data?.meta ?? {};

        // Filter by updated_at instead of created_at
        const filtered = records.filter((r: any) => r.updated_at >= since && r.updated_at <= till);
        allRecords.push(...filtered);

        const hasNext = meta?.has_next || records.length === limit;

        if (!hasNext || allRecords.length >= 1000) {
          hasMore = hasNext && allRecords.length >= 1000;
          nextCursor++;
          break;
        }

        nextCursor++;
      }

      return {
        since,
        till,
        hasMore,
        cursor: hasMore ? { nextCursor } : {},
        records: allRecords,
      };
    },

    output_schema: {
      fields: async (context: AppContext) => {
        return await getOutputSchema(context, "onboarding_requests", "Create On-Boarding Request In Your Acoount");
      },
    },

    sample: async (context: AppContext) => {
      return await sampleData(context, "onboarding_requests");
    },

    help: "",
    display_priority: 1,
    batch: false,
    batch_size: 0,
    bulk: false,
    deprecated: false,
    cursor_enabled: true,
    has_config_fields: false,
    config_fields: {
      fields: async function (_context) {
        return [];
      },
    },
    input_schema: {
      fields: async function (_context) {
        return [];
      },
    },
  },

  updated_offboarding_request: {
    id: "updated_offboarding_request",
    name: "Updated Offboarding Request",
    type: "poll",
    title: "Updated Offboarding Request",
    subtitle: "Triggers when an existing employee offboarding request is updated.",
    description: "Polls for offboarding requests updated in Freshservice.",
    pick_lists: {},
    // Deduplication using request ID + updated_at to avoid duplicate triggers
    dedup: (record: any) => `${record.id}-${record.updated_at}`,

    poll: async (context: AppContext): Promise<PollResponse> => {
      const since: any = context?.payload?.data?.since || new Date(Date.now() - 5 * 60 * 1000).toISOString();
      const till: any = context?.payload?.data?.till || new Date().toISOString();
      const cursor: any = context?.payload?.data?.cursor || {};
      let nextCursor = cursor.nextCursor || 1;

      const allRecords: any[] = [];
      const limit = 100;
      let hasMore = false;

      while (allRecords.length < 1000) {
        const response: any = await makeApiCall(
          context,
          `offboarding_requests?per_page=${limit}&page=${nextCursor}`,
          "GET"
        );
        ////console.log(response);

        if (response.statusCode !== 200 || !response.data) {
          break;
        }

        const records = response.data?.offboarding_requests ?? [];
        const meta = response.data?.meta ?? {};

        //  //console.log("records===>", records);
        // Filter by updated_at instead of created_at
        const filtered = records.filter((r: any) => r.updated_at >= since && r.updated_at <= till);
        allRecords.push(...filtered);

        const hasNext = meta?.has_next || records.length === limit;

        if (!hasNext || allRecords.length >= 1000) {
          hasMore = hasNext && allRecords.length >= 1000;
          nextCursor++;
          break;
        }

        nextCursor++;
      }

      return {
        since,
        till,
        hasMore,
        cursor: hasMore ? { nextCursor } : {},
        records: allRecords,
      };
    },

    output_schema: {
      fields: async (context: AppContext) => {
        const schema = await getOutputSchema(
          context,
          "offboarding_requests",
          "Create Off-Boarding Request In Your Acoount"
        );
        if (schema?.error) throw new Error(schema.error);
        return schema;
      },
    },

    sample: async (context: AppContext) => {
      const schema = await sampleData(context, "offboarding_requests");
      if (schema?.error) {
        throw new Error(schema.error);
      }
      return schema;
    },

    help: "",
    display_priority: 1,
    batch: false,
    batch_size: 0,
    bulk: false,
    deprecated: false,
    cursor_enabled: true,
    has_config_fields: false,
    config_fields: {
      fields: async function (_context) {
        return [];
      },
    },
    input_schema: {
      fields: async function (_context) {
        return [];
      },
    },
  },

  new_journey_request: {
    id: "new_journey_request",
    name: "New Journey Request",
    type: "poll",
    title: "New Journey Request",
    subtitle: "Triggers when a new journey request is created.",
    description: "Polls for new journey requests created in Freshservice.",
    pick_lists: {},
    dedup: (record: any) => record.id as string,

    poll: async (context: AppContext): Promise<PollResponse> => {
      const since: any = context?.payload?.data?.since || new Date(Date.now() - 5 * 60 * 1000).toISOString();
      const till: any = context?.payload?.data?.till || new Date().toISOString();
      const cursor: any = context?.payload?.data?.cursor || {};
      let nextCursor: number = cursor.nextCursor || 1;

      const allRecords: any[] = [];
      const limit = 2; // default per_page from API
      let hasMore = false;

      while (allRecords.length < 2) {
        // Build POST body for filtering
        const body = {
          data: {
            query: {
              filter: [
                {
                  attributes: [
                    {
                      field: "created_at",
                      operator: "is_between",
                      value: { from: since, to: till },
                    },
                  ],
                },
              ],
            },
          },
        };

        const url = `journeys/requests/view?page=${nextCursor}&per_page=${limit}`;
        // //console.log("url===>", url);
        // //console.log("body====>", body);
        const response: any = await makeApiCall(context, url, "POST", body);
        //  //console.log("response====>", response.data.journey_requests.length);

        // ⚙️ Defensive check
        if (response.statusCode !== 200 || !response.data) {
          break;
        }

        const records = response.data.journey_requests ?? [];
        // //console.log("records====>", records);

        const meta = response.data.meta ?? {};

        // 🧩 Filter by date range just in case
        //   const filtered = records.filter((r: any) => r.created_at >= since && r.created_at <= till);
        const filtered = records.filter((r: any) => {
          const createdAt = new Date(r.created_at).getTime();
          const sinceTime = new Date(since).getTime();
          const tillTime = new Date(till).getTime();
          return createdAt >= sinceTime && createdAt <= tillTime;
        });

        allRecords.push(...filtered);

        // 🔁 Pagination handling
        const hasNext = meta?.has_next || records.length === limit;

        if (!hasNext || allRecords.length >= 2) {
          hasMore = hasNext && allRecords.length >= 2;
          nextCursor++;
          break;
        }

        nextCursor++;
      }

      return {
        since,
        till,
        hasMore,
        cursor: hasMore ? { nextCursor } : {},
        records: allRecords,
      };
    },

    output_schema: {
      fields: async (context: AppContext) =>
        getOutputSchemajourneyRequests(context, "journeys/requests", "Create Journey Request In Your Acoount"),
    },

    sample: async (context: AppContext) => {
      const schema = await SampleDataForJounrey(context, "journeys/requests");
      if (schema?.error) {
        throw new Error(schema.error);
      }
      return schema;
    },

    help: "",
    display_priority: 0,
    batch: false,
    batch_size: 0,
    bulk: false,
    deprecated: false,
    cursor_enabled: true,
    has_config_fields: false,
    config_fields: {
      fields: async function (_context) {
        return [];
      },
    },
    input_schema: {
      fields: async function (_context) {
        return [];
      },
    },
  },

  new_ticket_created: {
    id: "new_ticket_created",
    name: "New Ticket Created",
    type: "poll",
    title: "New Ticket Created",
    subtitle: "Triggers when a new ticket is created in Freshservice.",
    description: "Polls for new tickets created in Freshservice.",
    pick_lists: {},
    // Dedup using ticket ID
    dedup: (record: any) => record.id as string,

    poll: async (context: AppContext): Promise<PollResponse> => {
      const since: any = context?.payload?.data?.since || new Date(Date.now() - 5 * 60 * 1000).toISOString();
      const till: any = context?.payload?.data?.till || new Date().toISOString();
      const cursor: any = context?.payload?.data?.cursor || {};
      let nextCursor = cursor.nextCursor || 1;

      let allRecords: any[] = [];
      const limit = 100;
      const PollLimit = 1000;
      let hasMore = false;

      while (allRecords.length < PollLimit) {
        const response: any = await makeApiCall(
          context,
          `tickets?updated_since=${since}&per_page=${limit}&page=${nextCursor}&include=requester`,
          "GET"
        );

        // ⚙️ Defensive check
        if (response.statusCode !== 200 || !response.data) {
          break;
        }

        const records = response.data?.tickets ?? [];
        const meta = response.data?.meta ?? {};

        // 🧩 Filter records by creation time
        const filtered = records.filter((r: any) => r.created_at >= since && r.created_at <= till);
        allRecords.push(...filtered);

        // 🔁 Pagination handling
        const hasNext = meta?.has_next || records.length === limit;
        if (!hasNext || allRecords.length >= PollLimit) {
          hasMore = hasNext && allRecords.length >= PollLimit;
          nextCursor++;
          break;
        }

        nextCursor++;
      }
      allRecords = allRecords.map((item) => {
        const attachments = item.attachments || [];
        // //console.log(attachments);
        return {
          ...item,
          attachments_url: attachments.map((att) => att.attachment_url).join(","),
          attachment_ids: attachments.map((att) => att.id),
          first_attachment_id: attachments.length > 0 ? attachments[0].id : null,
        };
      });
      return {
        since,
        till,
        hasMore,
        cursor: hasMore ? { nextCursor } : {},
        records: allRecords,
      };
    },

    // Output schema for the ticket
    output_schema: {
      fields: async (context: AppContext) => {
        return await getOutputSchemaForm(
          context,
          "tickets?updated_since=1990-01-01T02:00:00Z&order_type=desc&per_page=100&page=1&include=requester",
          "tickets",
          "Create a ticket in the account"
        );
      },
    },

    sample: async (context: AppContext) => {
      return await sampleDataForm(
        context,
        "tickets?updated_since=1990-01-01T02:00:00Z&order_type=desc&per_page=1&page=1&include=requester",
        "tickets"
      );
    },

    help: "",
    display_priority: 0,
    batch: false,
    batch_size: 0,
    bulk: false,
    deprecated: false,
    cursor_enabled: true,
    has_config_fields: false,
    config_fields: { fields: async () => [] },
    input_schema: { fields: async () => [] },
  },
  updated_ticket: {
    id: "updated_ticket",
    name: "Ticket Updated",
    type: "poll",
    title: "Ticket Updated",
    subtitle: "Triggers when a ticket is updated in Freshservice.",
    description: "Polls for tickets that have been updated in Freshservice.",
    pick_lists: {},
    // Dedup using ticket ID + updated timestamp to catch multiple updates
    dedup: (record: any) => `${record.id}_${record.updated_at}`,

    poll: async (context: AppContext): Promise<PollResponse> => {
      const since: any = context?.payload?.data?.since || new Date(Date.now() - 5 * 60 * 1000).toISOString();
      const till: any = context?.payload?.data?.till || new Date().toISOString();
      const cursor: any = context?.payload?.data?.cursor || {};
      let nextCursor = cursor?.nextCursor || 1;

      let allRecords: any[] = [];
      const limit = 100;
      let hasMore = false;
      const PollLimit = 1000;
      while (allRecords.length < PollLimit) {
        const response: any = await makeApiCall(
          context,
          `tickets?updated_since=${since}&per_page=${limit}&page=${nextCursor}&include=requester`,
          "GET"
        );

        // ⚙️ Defensive check
        if (response.statusCode !== 200 || !response.data) {
          break;
        }

        const records = response.data?.tickets ?? [];
        const meta = response.data?.meta ?? {};

        // 🧩 Filter records by updated time
        const filtered = records.filter((r: any) => r.updated_at >= since && r.updated_at <= till);
        allRecords.push(...filtered);

        // 🔁 Pagination handling
        const hasNext = meta?.has_next || records.length === limit;
        if (!hasNext || allRecords.length >= PollLimit) {
          hasMore = hasNext && allRecords.length >= PollLimit;
          nextCursor++;
          break;
        }

        nextCursor++;
      }
      allRecords = allRecords.map((item) => {
        const attachments = item.attachments || [];
        //   //console.log(attachments);
        return {
          ...item,
          attachments_url: attachments.map((att) => att.attachment_url).join(","),
          attachment_ids: attachments.map((att) => att.id),
          first_attachment_id: attachments.length > 0 ? attachments[0].id : null,
        };
      });
      return {
        since,
        till,
        hasMore,
        cursor: hasMore ? { nextCursor } : {},
        records: allRecords,
      };
    },

    // Output schema for the ticket
    output_schema: {
      fields: async (context: AppContext) => {
        return await getOutputSchemaForm(
          context,
          "tickets?updated_since=1990-01-01T02:00:00Z&order_type=desc&per_page=100&page=1&include=requester",
          "tickets",
          "Create a ticket in the account"
        );
      },
    },

    sample: async (context: AppContext) => {
      return await sampleDataForm(
        context,
        "tickets?updated_since=1990-01-01T02:00:00Z&order_type=desc&per_page=1&page=1",
        "tickets"
      );
    },

    help: "",
    display_priority: 0,
    batch: false,
    batch_size: 0,
    bulk: false,
    deprecated: false,
    cursor_enabled: true,
    has_config_fields: false,
    config_fields: { fields: async () => [] },
    input_schema: { fields: async () => [] },
  },
  new_problem_created: {
    id: "new_problem_created",
    name: "New Problem Created",
    type: "poll",
    title: "New Problem",
    subtitle: "Triggers when a new problem is created.",
    description: "Polls for newly created problems in Freshservice.",
    pick_lists: {},
    // Dedup using problem ID
    dedup: (record: any) => record.id as string,

    // Use the specific pollProblems helper
    poll: async (context: AppContext) => pollProblems(context, "created_at"),

    // Output schema targeting problems endpoint
    output_schema: {
      fields: async (context: AppContext) => {
        // Use getOutputSchemaForm and target 'problems' endpoint
        return await getOutputSchemaForm(
          context,
          // Endpoint should include requester if needed by schema
          "problems?updated_since=1990-01-01T02:00:00Z",
          "problems", // Key to extract from response data
          "Create a problem in the account to generate schema."
        );
      },
    },

    // Sample data targeting problems endpoint
    sample: async (context: AppContext) => {
      // Use sampleDataForm and target 'problems' endpoint
      return await sampleDataForm(
        context,
        "problems?updated_since=1990-01-01T02:00:00Z&per_page=1",
        "problems" // Key to extract sample from
      );
    },

    // Standard trigger properties
    help: "",
    display_priority: 0, // Adjust priority as needed
    batch: false,
    batch_size: 0,
    bulk: false,
    deprecated: false,
    cursor_enabled: true,
    has_config_fields: false,
    config_fields: { fields: async () => [] },
    input_schema: { fields: async () => [] },
  },
  updated_problem: {
    id: "updated_problem",
    name: "Problem Updated",
    type: "poll",
    title: "Problem Updated",
    subtitle: "Triggers when a problem is updated in Freshservice.",
    description: "Polls for problems that have been updated in Freshservice.",
    pick_lists: {},
    // Dedup using problem ID + updated timestamp
    dedup: (record: any) => `${record.id}_${record.updated_at}`,

    // Use the specific pollProblems helper
    poll: async (context: AppContext) => pollProblems(context, "updated_at"),

    // Output schema targeting problems endpoint
    output_schema: {
      fields: async (context: AppContext) => {
        return await getOutputSchemaForm(
          context,
          "problems?updated_since=1990-01-01T02:00:00Z",
          "problems",
          "Update a problem in the account to generate schema."
        );
      },
    },

    // Sample data targeting problems endpoint
    sample: async (context: AppContext) => {
      return await sampleDataForm(context, "problems?updated_since=1990-01-01T02:00:00Z&per_page=1", "problems");
    },

    // Standard trigger properties
    help: "",
    display_priority: 0, // Adjust priority as needed
    batch: false,
    batch_size: 0,
    bulk: false,
    deprecated: false,
    cursor_enabled: true,
    has_config_fields: false,
    config_fields: { fields: async () => [] },
    input_schema: { fields: async () => [] },
  },
};

export const Freshservice: App = {
  id: "freshservice",
  name: "Freshservice",
  description: "A service desk and IT service management (ITSM) solution.",
  version: "1.0.0",
  iconUrl: "URL_to_Freshservice_icon.svg", // Replace with actual icon URL
  category: ["Helpdesk"],
  tags:["dev", "support"],
    appType: "App",
  visibility: "public",
  secure_tunnel: false,
  has_custom_action: false,
  has_triggers: true,
  has_actions: true,
  connection: {
    auth: {
      type: "credentials",
      validate: async (context: AppContext): Promise<any> => {
        // //console.log("🔍 Validating Freshservice connection...");

        const result = await validateConnection(context);
        // //console.log("✅ Validation Result:", result);

        if (!result.success) {
          console.error("❌ Freshservice connection failed:", result.error);
          return { validated: false, error: result.error };
        }

        //  //console.log("✅ Freshservice connection successful!");
        return { validated: true };
      },
    },
    fields: [
      {
        name: "domain",
        type: "string",
        control_type: "subdomain",
        label: "Domain",
        placeholder: "your-company",
        required: { value: true, message: "Domain is required." },
      },
      {
        name: "api_key",
        type: "string",
        control_type: "password",
        label: "API Key",
        placeholder: "Enter your API Key",
        required: { value: true, message: "API Key is required." },
      },
    ],
  },

  test: async (context: AppContext) => {
    try {
      // Makes a call to a simple endpoint to verify that the credentials are correct.
      await makeApiCall(context, "/api/v2/agents/me", "GET");
      return true;
    } catch (error) {
      return false;
    }
  },

  actions: actions,
  triggers: triggers, // No triggers defined in this scope
  object_definitions: {},
  pick_lists: {},
  methods: {
    test: async function (context: AppContext): Promise<boolean> {
      const response = await validateConnection(context);
      return !!(response && response.data);
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
    validate: async function (context: AppContext): Promise<Record<string, unknown>> {
      const response = await validateConnection(context);
      return { valid: !!(response && response.data) };
    },
    pkce: function (): Promise<Record<string, unknown>> {
      throw new Error("PKCE not supported for this app");
    },
  },

  streams: {},
};

export default Freshservice;