import { response } from "express";
import {
  App,
  AppContext,
  ExecutionPayload,
  Field,
  FieldType,
  ControlType,
  DataPayload,
  PollResponse,
} from "../src/dsl/konnectify-dsl";

const SUPEROPS_OAUTH_BASE_URLS = {
  US: "https://usauth.superops.ai",
  EU: "https://euauth.superops.ai",
} as const;

const SUPEROPS_IT_API_BASE_URLS = {
  US: "https://api.superops.ai/it",
  EU: "https://euapi.superops.ai/it",
} as const;

const SUPEROPS_IT_SCOPES = [
  "offline_access",
  "cp:configuration_company:read",
  "cp:configuration_company:write",
  "cp:companyUser:read",
  "cp:companyUser:write",
  "cp:serviceCatalog:read",
  "cp:serviceCatalog:write",
  "cp:ticket:read",
  "cp:ticket:write",
  "cp:configuration_ticket:read",
  "cp:configuration_ticket:write",
  "cp:asset:read",
  "cp:asset:write",
  "cp:configuration_asset:read",
  "cp:configuration_asset:write",
  "cp:itDoc:read",
  "cp:itDoc:write",
  "cp:knowledgeBase:read",
  "cp:knowledgeBase:write",
  "cp:integration:read",
  "cp:webhook:read",
  "cp:webhook:write",
  "cp:companySite:read",
  "cp:companySite:write",
  "cp:companyDepartment:read",
  "cp:companyDepartment:write",
] as const;

function base64UrlEncode(buffer: Buffer): string {
  return buffer
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function normalizeSuperOpsRegion(region: unknown): "US" | "EU" {
  const normalized = String(region || "")
    .trim()
    .toUpperCase();
  if (normalized === "US" || normalized === "EU") {
    return normalized;
  }
  throw new Error("Region must be either US or EU.");
}

function normalizeCustomerDomain(domain: unknown): string {
  const rawValue = String(domain || "").trim();
  if (!rawValue) {
    throw new Error("Customer domain is required.");
  }
  const withoutScheme = rawValue
    .replace(/^https?:\/\//i, "")
    .replace(/\/.*$/, "")
    .toLowerCase();
  if (!withoutScheme) {
    throw new Error("Customer domain is required.");
  }
  if (withoutScheme.endsWith(".superops.ai")) {
    const subdomain = withoutScheme.slice(0, -".superops.ai".length).trim();
    if (!subdomain) {
      throw new Error("Invalid SuperOps customer domain.");
    }
    return subdomain;
  }
  return withoutScheme;
}

function getSuperOpsOAuthBaseUrl(region: unknown): string {
  return SUPEROPS_OAUTH_BASE_URLS[normalizeSuperOpsRegion(region)];
}

function getSuperOpsItApiBaseUrl(region: unknown): string {
  return SUPEROPS_IT_API_BASE_URLS[normalizeSuperOpsRegion(region)];
}

function getSuperOpsApiBaseUrl(auth: Record<string, unknown>): string {
  const configuredBaseUrl = String(auth.base_url || "").trim();
  if (configuredBaseUrl) {
    return configuredBaseUrl;
  }
  return getSuperOpsItApiBaseUrl(auth.region);
}

function getSuperOpsTokenUrl(context: AppContext): string {
  const explicitOAuthBaseUrl = String(
    (context.auth as any)?.oauth_base_url || "",
  ).trim();
  if (explicitOAuthBaseUrl) {
    return `${explicitOAuthBaseUrl.replace(/\/+$/, "")}/api/oauth/token`;
  }
  return `${getSuperOpsOAuthBaseUrl((context.auth as any)?.region)}/api/oauth/token`;
}

// 🧩 Common Utility

function handleActionError(
  error: unknown,
  context: AppContext,
  operation: string,
): ExecutionPayload {
  context.logger?.error(`Operation '${operation}' failed:`, error);
  let statusCode = 500;
  let errorMessage = "An unknown error occurred.";
  let retryable = false;
  if (error instanceof Error) {
    errorMessage = error.message || errorMessage;
    if ((error as any).statusCode) {
      statusCode = (error as any).statusCode;
    } else if (
      errorMessage.includes("404") ||
      errorMessage.includes("Not Found")
    ) {
      statusCode = 404;
      errorMessage = "Resource not found.";
    } else if (
      errorMessage.includes("401") ||
      errorMessage.includes("Unauthorized")
    ) {
      statusCode = 401;
      errorMessage = "Authentication error. Please check your connection.";
    } else if (
      errorMessage.includes("403") ||
      errorMessage.includes("Forbidden")
    ) {
      statusCode = 403;
      errorMessage =
        "Permission denied. Please check your  scopes and permissions.";
    }
    retryable =
      errorMessage.includes("timeout") ||
      errorMessage.includes("rate limit") ||
      errorMessage.includes("502") ||
      errorMessage.includes("503") ||
      errorMessage.includes("504");
  }
  return {
    statusCode,
    data: {
      error: errorMessage,
      retryable,
    },
  };
}
function flattenAndGenerateSchema(
  obj: Record<string, any>,
  requiredFields: string[] = [],
  options: Record<string, any> = {},
  labelFields: Record<string, string> = {}, // New parameter
): any[] {
  const result: Record<string, any> = {};

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

  // function prettifyLabel(key: string): string {
  //   return key
  //     .replace(/([a-z])([A-Z])/g, "$1 $2")
  //     .replace(/[._-]/g, " ")
  //     .split(" ")
  //     .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
  //     .join(" ");
  // }
  function prettifyLabel(key: string): string {
    return (
      key
        // split camelCase
        .replace(/([a-z])([A-Z])/g, "$1 $2")

        // replace separators with space
        .replace(/[._-]/g, " ")

        // 🚀 remove numbers + special chars
        //  .replace(/[^a-zA-Z\s]/g, " ")

        // collapse extra spaces
        .replace(/\s+/g, " ")

        .trim()

        // Title Case
        .split(" ")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(" ")
    );
  }

  // Get label - check labelFields first, fallback to prettifyLabel
  function getLabel(key: string): string {
    if (labelFields && labelFields[key]) {
      return labelFields[key];
    }
    return prettifyLabel(key);
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
      label: getLabel(name), // Use getLabel instead of prettifyLabel
      optional: true,
      type,
      control_type: getControlType(type),
      hint: `Enter ${prettifyLabel(name)}`, // Keep hint with prettifyLabel
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
      else if (value.length > 0 && typeof value[0] === "string")
        field.of = "string";
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
        label: getLabel(key), // Use getLabel instead of prettifyLabel
        type,
        control_type: getControlType(type),
        optional: !requiredFields.includes(key),
        hint: `Enter ${prettifyLabel(key)}`, // Keep hint with prettifyLabel
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
      // if (type === "array" && Array.isArray(value) && value.length > 0 && typeof value[0] === "object") {
      //   field.of = "object";
      //   field.label = `${getLabel(key)} (iteration)`; // Use getLabel here too
      //   if (!isIndexedArrayPath(key)) {
      //     field.propChildren = generateFieldsShallow(value[0]);
      //   }
      // }

      // // Arrays of strings
      // if (type === "array" && Array.isArray(value) && value.length > 0 && typeof value[0] === "string") {
      //   field.of = "string";
      //   field.label = `${getLabel(key)} (iteration)`; // Use getLabel here too
      // }
      // if (type === "array" && Array.isArray(value) && value.length > 0 && typeof value[0] === "number") {
      //   field.of = "number";
      //   field.label = `${getLabel(key)} (iteration)`; // Use getLabel here too
      // }
      if (type === "array" && Array.isArray(value) && value.length > 0) {
        const first = value[0];

        field.label = `${getLabel(key)} (Iteration)`;

        if (typeof first === "object") {
          field.of = "object";

          if (!isIndexedArrayPath(key)) {
            field.propChildren = generateFieldsShallow(first);
          }
        } else if (typeof first === "string") {
          field.of = "string";
        } else if (typeof first === "number") {
          field.of = "number"; // <- small fix (was incorrectly string before)
        }
      }

      return field;
    });
}
function removeEmpty(obj: any): any {
  Object.keys(obj).forEach((key) => {
    const val = obj[key];

    if (Array.isArray(val)) {
      // Clean each array item
      obj[key] = val
        .map((item) =>
          typeof item === "object" && item !== null ? removeEmpty(item) : item,
        )
        .filter(
          (item) =>
            item !== "" &&
            item !== null &&
            item !== undefined &&
            !(typeof item === "number" && isNaN(item)) &&
            (typeof item !== "object" || Object.keys(item).length > 0),
        );

      if (obj[key].length === 0) delete obj[key];
    } else if (typeof val === "object" && val !== null) {
      removeEmpty(val);
      if (Object.keys(val).length === 0) delete obj[key];
    } else if (
      val === "" ||
      val === null ||
      val === undefined ||
      (typeof val === "number" && isNaN(val))
    ) {
      delete obj[key];
    }
  });

  return obj;
}
function flattenObject(
  obj: any,
  parentKey: string = "",
  result: Record<string, any> = {},
): Record<string, any> {
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
function deepMergeAll(objects: any) {
  function deepMerge(obj1: any, obj2: any) {
    if (Array.isArray(obj1) && Array.isArray(obj2)) {
      // Merge all unique entries
      return Array.from(new Set([...obj1, ...obj2]));
    }

    if (isPlainObject(obj1) && isPlainObject(obj2)) {
      const result = { ...obj1 };
      for (const key of Object.keys(obj2)) {
        result[key] =
          key in result ? deepMerge(result[key], obj2[key]) : obj2[key];
      }
      return result;
    }

    return obj1 !== undefined ? obj1 : obj2;
  }

  function isPlainObject(value: any) {
    return typeof value === "object" && value !== null && !Array.isArray(value);
  }

  return objects
    .filter((o: any) => o && typeof o === "object")
    .reduce((acc: any, obj: any) => deepMerge(acc, obj), {});
}
function cleanNestedObject(obj: any): any {
  if (Array.isArray(obj)) {
    const cleaned = obj
      .map((v) => cleanNestedObject(v))
      .filter(
        (v) =>
          v !== undefined &&
          v !== null &&
          (typeof v !== "object" || Object.keys(v).length > 0),
      );
    return cleaned.length > 0 ? cleaned : undefined;
  }

  if (obj && typeof obj === "object") {
    const cleaned: any = {};
    for (const [k, v] of Object.entries(obj)) {
      const cv = cleanNestedObject(v);
      if (
        cv !== undefined &&
        cv !== null &&
        cv !== "" &&
        (typeof cv !== "object" || Object.keys(cv).length > 0)
      ) {
        cleaned[k] = cv;
      }
    }
    return Object.keys(cleaned).length > 0 ? cleaned : undefined;
  }

  return obj === "" || obj === undefined ? undefined : obj;
}
async function buildUserIdArray(groups: any): Promise<any[]> {
  if (!groups) return [];

  let raw: string[] = [];

  if (typeof groups === "string") {
    groups = groups.trim();

    if (groups.startsWith("[") && groups.endsWith("]")) {
      try {
        raw = JSON.parse(groups).map((v: any) => String(v));
      } catch {
        raw = groups.split(",").map((v: any) => v.trim());
      }
    } else {
      raw = groups.split(",").map((v: any) => v.trim());
    }
  } else if (Array.isArray(groups)) {
    raw = groups.map((v) => String(v.trim()));
  }

  const unique = Array.from(new Set(raw));
  return unique.map((v) => ({ userId: v }));
}

async function buildassetid(input: any): Promise<any[]> {
  if (!input) return [];

  let values: string[] = [];

  // Case 1: Already array → convert all elements to string
  if (Array.isArray(input)) {
    values = input.map((v: any) => String(v).trim()).filter(Boolean);
  }

  // Case 2: String input → handle JSON array or comma separated
  else if (typeof input === "string") {
    const trimmed = input.trim();

    // Case 2A: JSON array string → e.g. "[1,2]" or ["1","2"]
    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          values = parsed.map((v: any) => String(v).trim()).filter(Boolean);
        }
      } catch {
        // Fall back to comma split
        values = trimmed
          .replace(/[\[\]"]+/g, "") // remove brackets & quotes
          .split(",")
          .map((v: any) => String(v).trim())
          .filter(Boolean);
      }
    }

    // Case 2B: Comma separated string
    else if (trimmed.includes(",")) {
      values = trimmed
        .split(",")
        .map((v: any) => String(v).trim())
        .filter(Boolean);
    }

    // Case 2C: Single string number
    else {
      values = [trimmed];
    }
  }

  // Case 3: Any other primitive (number, boolean etc.)
  else {
    values = [String(input).trim()];
  }

  // Remove duplicates
  const unique = Array.from(new Set(values));

  // Final mapping
  return unique.map((v) => ({ assetId: v }));
}

// 🧠 Validate Connection via Profile Endpoint
async function validateConnection(
  context: AppContext,
): Promise<{ success: boolean; error?: string }> {
  const variables = {
    input: {
      page: 1,
      pageSize: 50,
      sort: null,
      condition: null,
    },
  };
  try {
    // Call the SuperOps API to validate the connection
    const response: any = await makeSuperOpsRequest(
      context,
      "getTicketList",
      variables,
    );

    if (
      response.statusCode >= 200 &&
      response.statusCode < 300 &&
      response.data?.getTicketList
    ) {
      return { success: true };
    }
    return {
      success: false,
      error: response?.data?.error || "Connection check failed",
    };
  } catch (err: any) {
    return { success: false, error: err?.message || "Unexpected error" };
  }
}
const dynamicFunctions = {
  getClientList: `
      query getClientList($input: ListInfoInput!) {
        getClientList(input: $input) {
          clients {
            accountId
            name
            stage
            status
            emailDomains
            accountManager
            primaryContact
            secondaryContact
            hqSite
            technicianGroups
            customFields
          }
          listInfo {
            page
            pageSize
            hasMore
            totalCount
          }
        }
      }
    `,
  updateTicket: `mutation updateTicket($input: UpdateTicketInput!) {
    updateTicket(input: $input) {
      ticketId
      displayId
      subject
      requestType
      site
      requester
      additionalRequester
      followers
      techGroup
      technician
      status
      priority
      impact
      urgency
      category
      subcategory
      cause
      subcause
      resolutionCode
      sla
      createdTime
      updatedTime
      firstResponseDueTime
      firstResponseTime
      firstResponseViolated
      resolutionDueTime
      resolutionTime
      resolutionViolated
      customFields
      worklogTimespent
    }
  }
  `,
  getDepartmentList: `query getDepartmentList {
    getDepartmentList {
      departmentId
      name
      head
    }
  }
  `,
  getTicketList: `query getTicketList($input: ListInfoInput!) {
      getTicketList(input: $input) {
        tickets {
          ticketId
          displayId
          subject
          source
          department 
          site
          requester
          additionalRequester
          followers
          techGroup
          technician
          status
          priority
          impact
          urgency
          category
          subcategory
          cause
          subcause
          resolutionCode
          sla
          createdTime
          updatedTime
          firstResponseDueTime
          firstResponseTime
          firstResponseViolated
          resolutionDueTime
          resolutionTime
          resolutionViolated
          customFields
          requestType
          worklogTimespent
        }
        listInfo {
          page      
          pageSize      
          hasMore      
          totalCount      
          sort {        
              attribute        
              order      
          }  
        }
      }
    }`,
  deleteWebhookSubscription: `mutation deleteWebhookSubscription($input: WebhookSubscriptionIdentifierInput!) {
  deleteWebhookSubscription(input: $input)
}`,
  getTicket: `query getTicket($input: TicketIdentifierInput!) {
    getTicket(input: $input) {
    ticketId
      displayId
      subject
      source
      department
      site
      requester
      additionalRequester
      followers
      techGroup
      technician
      status
      priority
      impact
      urgency
      category
      subcategory
      cause
      subcause
      resolutionCode
      sla
      createdTime
      updatedTime
      firstResponseDueTime
      firstResponseTime
      firstResponseViolated
      resolutionDueTime
      resolutionTime
      resolutionViolated
      customFields
      requestType
      worklogTimespent
    }
  }
  `,
  getTask: `query getTask($input: TaskIdentifierInput!) {
    getTask(input: $input) {
      taskId
      displayId
      title
      description
      status
      estimatedTime
      scheduledStartDate
      dueDate
      overdue
      actualStartDate
      actualEndDate
      technician
      techGroup
      taskOrder
      workItem
    }
  }
  `,
  getTaskList: `query getTaskList($input: ListInfoInput!) {
      getTaskList(input: $input) {
        tasks {
          taskId
          displayId
          title
          description
          status
          estimatedTime
          scheduledStartDate
          dueDate
          overdue
          actualStartDate
          actualEndDate
          technician
          techGroup
        workItem 
        taskOrder 
        }
        listInfo {
          page      
          pageSize      
          hasMore      
          totalCount      
          sort {        
              attribute        
              order      
          }  
              condition 
        }
      }
    }`,
  getSite: `query getSite($input: SiteIdentifierInput!) {
    getSite(input: $input) {
      id
      name
      businessHour {
        day
        start 
        end
      }
      holidayList {
      id
      name
      }
      timezoneCode
      working24x7
      address {
        addressId 
        line1
        line2
        line3
        city
        postalCode
        countryCode 
        stateCode 
      }
      contactNumber
      installerInfo {
      id
      installerDownloadUrl 
  installerName 
  os
      }
    }
  }
  `,
  getSiteList: `query getSiteList($input: ListInfoInput!) {
    getSiteList(input: $input) {
      sites {
      id
      name
      businessHour {
      day
      start 
      end
      }
      holidayList {
      id 
      name}
  working24x7 
      timezoneCode 
      address {
      addressId 
      line1
      line2
      line3
      city
      postalCode
      countryCode 
      stateCode 
      }
      contactNumber 
      }
      listInfo {
          page
            pageSize
            hasMore 
            totalCount
      }
    }
  }
  `,
  getBasicSiteList: `query getSiteList($input: ListInfoInput!) {
    getSiteList(input: $input) {
      sites {
        id
        name
      }
      listInfo {
        page
        pageSize
        hasMore
      }
    }
  }`,
  getServiceCatalogItem: `query getServiceCatalogItem($input: ServiceCatalogItemIdentifierInput!) { 
      getServiceCatalogItem(input: $input) { 
      itemId 
      name
      description 
      category { 
      categoryId 
    name } } }`,
  getServiceCatalogItemList: `query getServiceCatalogItemList($input: ListInfoInput!) { 
          getServiceCatalogItemList(input: $input) { 
          items {
          itemId 
          name 
          description
          category { 
            categoryId 
            name }     
            } listInfo { 
            page 
            pageSize 
            hasMore 
            totalCount 
    } } }`,
  getServiceItemList: `
    query getServiceItemList($input: ListInfoInput!) {
      getServiceItemList(input: $input) {
        items {
          itemId
          name
          description
          category {
            categoryId
            name
          }
      
    
        }
        listInfo {
          page
          pageSize
          hasMore
          totalCount
        }
      }
    }
  `,
  getServiceItem: `query getServiceItem($input: ServiceItemIdentifierInput!) {
    getServiceItem(input: $input) {
      itemId
      name
      description
      category {
        categoryId 
        name
      }
    }
  }
  `,
  getAsset: `query getAsset($input: AssetIdentifierInput!) {
    getAsset(input: $input) {
      assetId
      name
      assetClass

      site
      requester
      primaryMac
      loggedInUser
      serialNumber
      manufacturer
      model
      hostName
      publicIp
      gateway
      platform
      domain
      status
      sysUptime
      lastCommunicatedTime
      agentVersion
      platformFamily
      platformCategory
      platformVersion
      patchStatus
      warrantyExpiryDate
      purchasedDate
      customFields
      lastReportedTime
  
    }
  }
  `,
  getAssetList: `query getAssetList($input: ListInfoInput!) {
    getAssetList(input: $input) {
      assets {
        assetId
    name
    assetClass
    site
department 
    requester
createdTime
updatedTime
    primaryMac
    loggedInUser
    serialNumber
    manufacturer
    model
    hostName
    publicIp
    gateway
    platform
    domain
    status
    sysUptime
    lastCommunicatedTime
    agentVersion
    platformFamily
    platformCategory
    platformVersion
    patchStatus
    warrantyExpiryDate
    purchasedDate
    customFields
    lastReportedTime
      }
      listInfo {
         page      
        pageSize      
        hasMore      
        totalCount      
        sort {        
            attribute        
            order      
        }  
      }
    }
  }`,
  getKbItems: `query getKbItems($listInfo: ListInfoInput!) { 
  getKbItems(listInfo: $listInfo) { 
  items  
  { itemId name itemType description status createdBy createdOn lastModifiedBy lastModifiedOn viewCount articleType loginRequired } listInfo { page pageSize hasMore totalCount } } }`,
  getKbItem: `query getKbItem($input: KBItemIdentifierInput!) {
    getKbItem(input: $input) {
      itemId
      name
      
      itemType
      description
      status
      createdBy
      createdOn
      lastModifiedBy
      lastModifiedOn
      viewCount
      articleType
    
      loginRequired
    }
  }`,
  getAlert: `query getAlert($input: AlertIdentifierInput!) {
    getAlert(input: $input) {
      id
      message
      createdTime
      status
      severity
      description
      asset
      policy
      resolvedTime
    }
  }`,
  getTicketNoteList: `query getTicketNoteList($input: TicketIdentifierInput!) {
    getTicketNoteList(input: $input) {
      noteId
      addedBy
      addedOn
      content
      attachments {
        fileName
        originalFileName
        fileSize
      }
      privacyType
    }
  }`,
  getTicketConversationList: `query getTicketConversationList($input: TicketIdentifierInput!) {
    getTicketConversationList(input: $input) {
      conversationId
      content
      time
      user
      type
    }
  }`,
  getAssetSummary: `query getAssetSummary($input: AssetIdentifierInput!) {
    getAssetSummary(input: $input) {
      cpu {
        assetId
        cpuName 
        currentSpeed 
        maxSpeed 
        physicalCore 
        logicalCore 
        architecture 
        l1Cache 
        l2Cache 
        l3Cache 
        processCount 
        threadsCount 
        handlesCount 
        cpuUsage 
      }
      memory {
      totalMemory 
      usedMemory 
      availableMemory 
      cachedMemory 
      pagedPoolByte 
      nonPagedPoolByte 
  memoryUsage 
  swapTotalMemory 
  swapAvailableMemory 
  swapUsedMemory 
      }
      disk {
        totalSize 
        totalFreeSpace 
        disks {drive 
        discType 
        fileSystem 
        maxFileLength 
        autoMounted 
        compressed 
        pageFile 
        indexed 
        size 
        freeSize 
        activeTime 
        responseTime 
        readSpeed 
        writeSpeed 
        driveUsage }
      }
      assetInterface {
    name 
    mac 
    ipv4Address 
    ipv6Address 
    infIndex 
    mtu 
    connectType 
    lineSpeed 
    dataInPerSec 
    dataOutPerSec 
    adapterName 
      }
      lastUserLog {
        id 
        name 
        lastLoginTime 
      }
    }
  }
  `,
  resolveAlerts: `mutation resolveAlerts($input: [ResolveAlertInput]) {
  resolveAlerts(input: $input)
}`,
  createAlert: `mutation createAlert($input: CreateAlertInput!) {
  createAlert(input: $input) {
    id
    message
    createdTime
    status
    severity
    description
    asset
    policy
    resolvedTime
  }
}`,
  getTechnicianList: `
      query getTechnicianList($input: ListInfoInput!) {
        getTechnicianList(input: $input) {
          userList {
            userId
            firstName 
            lastName 
            name
            email
            contactNumber 
            emailSignature 
            designation 
            department 
            associations 
            team 
            reportingManager 
            roles 
            groups 
            
          }
          listInfo {
            page
            pageSize
            hasMore
            totalCount
          }
        }
      }
    `,
  getTechnicianGroupList: `
    query getTechnicianGroupList {
      getTechnicianGroupList {
        groupId
        name
      }
    }
  `,
  createTask: `mutation createTask($input: CreateTaskInput!) {
    createTask(input: $input) {
      taskId
      displayId
      title
      description
      status
      estimatedTime
      scheduledStartDate
      dueDate
      overdue
      actualStartDate
      actualEndDate
      technician
      techGroup
      workItem
      taskOrder
    }
  }
  `,

  createTicketNote: `mutation createTicketNote($input: CreateTicketNoteInput!) {
    createTicketNote(input: $input) {
      noteId
      addedBy
      addedOn
      content
      attachments {
        fileName 
        originalFileName 
        fileSize 
      }
      privacyType
    }
  }
  `,

  getServiceCategoryList: `query getServiceCategoryList {
    getServiceCategoryList {
      categoryId
      name
      
    }
  }`,
  createServiceItem: `mutation createServiceItem($input: CreateServiceItemInput!) {
    createServiceItem(input: $input) {
      itemId
      name
      description
      category {
        categoryId 
        name
      }
    }
  }
  `,
  getAllFields: `query getAllFields($input: String!) {
    getAllFields(input: $input) {
      id
      module
      columnName
      label
      description
      fieldType
      options {
        id
        value
        order
        description
      }
      showToRequester
      fieldCategory
      mandatoryOnCreate
      mandatoryOnClosure
    }
  }
  `,
  createTicket: `mutation createTicket($input: CreateTicketInput!) {
    createTicket(input: $input) {
        ticketId
      displayId
      subject
      source
      department
      site
      requester
      additionalRequester
      followers
        techGroup
      technician
      status
      priority
      impact
      urgency
      category
      subcategory
      cause
      subcause
      resolutionCode
      sla
      createdTime
      updatedTime
      firstResponseDueTime
      firstResponseTime
      firstResponseViolated
      resolutionDueTime
      resolutionTime
      resolutionViolated
      customFields
      requestType
      worklogTimespent
    }
  }
  `,
  createWebhookSubscription: `mutation createWebhookSubscription($input: CreateWebhookSubscriptionInput) {
  createWebhookSubscription(input: $input) {
    webhookSubscriptionId
    webhookUrl
    headers
    description
    events {
      eventType
    }
    signingSecret
    status
    createdAt
    updatedAt
  }
}`,

  updateWebhookSubscription: `mutation updateWebhookSubscription($input: UpdateWebhookSubscriptionInput) {
  updateWebhookSubscription(input: $input) {
    webhookSubscriptionId
    webhookUrl
    headers
    description
    events {
      eventType
    }
    signingSecret
    status
    createdAt
    updatedAt
  }
}`,

  getSLAList: `query getSLAList {
    getSLAList {
      id
      name
    }
  }
  `,
  getUserList: `query getUserList($input: ListInfoInput!) {
    getUserList(input: $input) {
      userList {
      userId 
      name 
      }
      listInfo {
      page
            pageSize
            hasMore
            totalCount
      }
    }
  }
  `,
  getUnMonitoredAssetList: `query getUnMonitoredAssetList($input: ListInfoInput!) {
    getUnMonitoredAssetList(input: $input) {
      assets {
        assetId
        name
        assetClass
    
        site
      }
      listInfo {
        page
        pageSize
        hasMore
        totalCount
        sort {
          attribute
          order
        }
      }
    }
  }
  `,
  getAlertList: `query getAlertList($input: ListInfoInput!) {
    getAlertList(input: $input) {
      alerts {
        id
        message
        createdTime
        status
        severity
        description
        asset
        policy
        resolvedTime
      }
      listInfo {
        page      
        pageSize      
        hasMore      
        totalCount
      }
    }
  }`,
  getAssetClassListV3: `
query getAssetClassList($listInfo: ListInfoInput!) {
  getAssetClassListV3(listInfo: $listInfo) {
    assetClass {
      classId
      name
      moduleType
      isNonMonitored
      isSystemGenerated
    }
    listInfo {
      totalCount
      page
      pageSize
    }
  }
}
`,

  getAssetClassFieldsForIntegration: `
query getAssetClassFields($input: AssetClassIdentifierInput!) {
  getAssetClassFieldsForIntegration(input: $input) {
    fields {
      fieldKey
      fieldLabel
      isCustomField
    }
    keyFields
  }
}
`,
};

// ─────────────────────────────────────────────────────────────────
// 🔔 ALERT WEBHOOK HELPERS
// ─────────────────────────────────────────────────────────────────

async function superOpsWebhookSubscribe(
  context: AppContext,
  eventType: string,
): Promise<any> {
  const webhookUrl = (context.payload?.data as any)?.webhookEndpoint;

  if (!webhookUrl) {
    throw new Error("Invalid webhook URL.");
  }

  const result: any = await makeSuperOpsRequest(
    context,
    "createWebhookSubscription",
    {
      input: {
        webhookUrl,
        description: `Konnectify - ${eventType}`,
        status: "ENABLED",
        addEvents: [{ eventType }],
      },
    },
  );

  if (result?.data?.error || result?.data?.errors) {
    throw new Error(
      `Webhook subscription failed: ${JSON.stringify(result.data.error || result.data.errors)}`,
    );
  }

  const sub = result?.data?.createWebhookSubscription;

  if (!sub?.webhookSubscriptionId) {
    throw new Error("Failed to create SuperOps webhook subscription.");
  }

  return {
    webhook_id: sub.webhookSubscriptionId,
    webhook_url: webhookUrl,
  };
}

async function superOpsWebhookUnsubscribe(context: AppContext): Promise<any> {
  const { webhook_id } =
    (context?.payload?.data as any)?.webhookSubscribeOutput || {};

  if (!webhook_id) {
    throw new Error("Webhook subscription ID not found. Cannot unsubscribe.");
  }

  const result: any = await makeSuperOpsRequest(
    context,
    "deleteWebhookSubscription",
    {
      input: { webhookSubscriptionId: webhook_id },
    },
  );

  if (result?.data?.error || result?.data?.errors) {
    throw new Error(
      `Webhook unsubscribe failed: ${JSON.stringify(result.data.error || result.data.errors)}`,
    );
  }

  return { status: "Success", statusCode: 200 };
}

async function superOpsWebhookRefresh(
  context: AppContext,
  eventType: string,
): Promise<any> {
  // Re-subscribe fresh — simplest safe strategy
  return superOpsWebhookSubscribe(context, eventType);
}

function superOpsWebhookVerify(
  context: AppContext,
  input: any,
  payload: any,
  headers: Record<string, string>,
  params: Record<string, string>,
  webhookSubscribeOutput: any,
): any {
  if (!payload) {
    return { status: "ignored" };
  }
  return { status: "success", event: payload };
}

function superOpsWebhookNotification(
  context: AppContext,
  input: any,
  payload: any,
  headers: Record<string, string>,
  params: Record<string, string>,
  webhookSubscribeOutput: any,
): any {
  return payload;
}

// Static alert sample payload (shape sent by SuperOps for all 3 alert events)
const alertWebhookSample = {
  data: {
    id: 5150178940650622977,
    status: "Resolved",
    resolvedTime: "2026-04-20T10:38:22.833009",
    assetId: 760949899021733900,
    message: "Medium CPU Usage",
    severity: "High",
    createdTime: "2026-05-06T05:32:24.044363",
    description: "Medium CPU Usage Test",
  },
  webhookSubscriptionId: 6224830002699943936,
  eventId: 4001221482143629312,
  customerId: 5771572659835318272,
  eventType: "ALERT_RESOLVED",
  createdTime: "2026-04-20T10:38:22.841",
  webhookDeliveryTime: "2026-04-20T10:38:22.886358",
};

function createSuperOpsAlertWebhookTrigger(eventType: string, meta: any) {
  return {
    ...meta,

    type: "webhook",
    hook_type: "per_event",

    batch: false,
    bulk: false,
    deprecated: false,
    cursor_enabled: false,
    has_config_fields: false,
    display_priority: 1,

    config_fields: { fields: async () => [] },

    dedup: (record: any) =>
      record?.data?.id || record?.id || `${eventType}_${Date.now()}`,

    webhook_key: (context: AppContext): string =>
      `superops_${eventType.toLowerCase()}_${context?.auth?.domain || "default"}`,

    webhook_response_type: "application/json",
    webhook_response_body: '{"status":"received"}',
    webhook_response_headers: '{"Content-Type":"application/json"}',
    webhook_response_status: 200,
    webhook_payload_type: "json",

    sample: async (_context: AppContext): Promise<any> => alertWebhookSample,

    output_schema: {
      fields: async (_context: AppContext): Promise<any> => {
        return flattenAndGenerateSchema(alertWebhookSample);
      },
    },

    input_schema: { fields: async () => [] },

    webhook_subscribe: (ctx: AppContext) =>
      superOpsWebhookSubscribe(ctx, eventType),

    webhook_unsubscribe: (ctx: AppContext) => superOpsWebhookUnsubscribe(ctx),

    webhook_refresh: (ctx: AppContext) =>
      superOpsWebhookRefresh(ctx, eventType),

    webhook_verify: superOpsWebhookVerify,

    webhook_notification: superOpsWebhookNotification,

    help: meta.help,
  };
}
// 🧩 Common Utility for GraphQL requests
async function makeSuperOpsRequest(
  context: AppContext,
  queryName: keyof typeof dynamicFunctions, // Dynamically select query name from dynamicFunctions
  variables: any, // Accept variables as a separate parameter
): Promise<ExecutionPayload> {
  const auth = (context.auth || {}) as Record<string, unknown>;
  const accessToken = String(auth.access_token || auth.api_key || "").trim();

  let baseUrl = "";
  let customerDomain = "";
  try {
    baseUrl = getSuperOpsApiBaseUrl(auth);
    customerDomain = normalizeCustomerDomain(auth.domain);
  } catch (error: any) {
    return {
      statusCode: 400,
      data: {
        error: error?.message || "Missing SuperOps connection configuration.",
      },
    };
  }

  if (!accessToken || !baseUrl) {
    return {
      statusCode: 401,
      data: {
        error:
          "Missing OAuth credentials. Please reconnect your SuperOps account.",
      },
    };
  }

  // 🧱 Fetch the query based on the queryName
  const query = dynamicFunctions[queryName];

  if (!query) {
    return {
      statusCode: 400,
      data: { error: `Query for "${queryName}" not found.` },
    };
  }

  const url = `${baseUrl.replace(/\/+$/, "")}`;

  const headers: Record<string, string> = {
    Authorization: `Bearer ${accessToken}`,
    "Content-type": "application/json;",
    CustomerSubDomain: customerDomain,
  };

  // 🧩 Prepare the request body with query and variables
  const body = JSON.stringify({ query, variables });

  try {
    const response = await context.fetch(url, {
      method: "POST",
      headers,
      body,
    });
    const text = await response.text();

    let parsed: any;

    try {
      parsed = text ? JSON.parse(text) : {};
    } catch {
      parsed = text; // If parsing fails, return raw text
    }
    // ❌ Handle errors in response (GraphQL or HTTP level)
    if (!response.ok) {
      const errorMessage =
        parsed?.error ||
        parsed?.errors?.map((err: any) => err.message).join(",") ||
        response.statusText;
      return {
        statusCode: response.status,
        data: { error: errorMessage },
      };
    }
    if (parsed.errors) {
      return {
        statusCode: response.status,
        data: { error: parsed.errors, data: parsed.data },
      };
    }

    // ✅ Return parsed success response
    return { statusCode: response.status, data: parsed.data };
  } catch (err: any) {
    context.logger?.error("SuperOps API Error:", err);
    return {
      statusCode: 500,
      data: { error: err?.message || "Unexpected API error" },
    };
  }
}

async function getSuperOpsOutputSchema(
  context: AppContext,
  module: any,
  variables: any,
): Promise<any> {
  try {
    const result = await makeSuperOpsRequest(context, module, variables);
    if (result?.data?.error || result?.data?.errors) {
      throw new Error(`Error:${result?.data?.error || result?.data?.errors}`);
    }
    return result.data?.[module];

    //   // ❌ Handle failed API calls gracefully
    //   if (!response || response.statusCode >= 400) {
    //     const msg: any =
    //       response?.data?.message ||
    //       response?.data?.error ||
    //       errorMessage ||
    //       `Failed to fetch data for module: ${module}`;
    //     context.logger?.error(`[getSuperOpsOutputSchema] API error for module ${module}:`, response?.data);
    //     throw new Error(msg);
    //   }

    //   // ✅ Extract main data (handle wrapped formats)
    //   const data = response.data?.[module] ?? response.data?.results ?? response.data ?? [];
    //   if (!data || (Array.isArray(data) && data.length === 0)) {
    //     throw new Error(errorMessage || `No sample data found for module: ${module}`);
    //   }

    //   // 🧩 Merge and flatten the schema
    //   const mergedData = Array.isArray(data) ? deepMergeAll(data) : data;
    //   const schema = flattenAndGenerateSchema(mergedData);

    //   return schema;
  } catch (error: any) {
    context.logger?.error(
      `[getSuperOpsOutputSchema] Unexpected error for ${module}:`,
      error,
    );
    throw new Error(
      error?.message || `Error generating schema for module: ${module}`,
    );
  }
}

//poll
async function pollTickets(context: AppContext): Promise<any> {
  let page = 1;
  const pageSize = 100;
  const allTickets: any[] = [];

  while (true) {
    const variables = {
      input: {
        page,
        pageSize,
        sort: null,
        condition: null,
      },
    };

    const result: any = await makeSuperOpsRequest(
      context,
      "getTicketList",
      variables,
    );

    if (result?.data?.error || result?.data?.errors) {
      throw new Error(result?.data?.error || "Error fetching tickets");
    }

    const responseData = result?.data?.getTicketList;
    if (!responseData) break;

    const tickets = responseData?.tickets || [];
    if (tickets.length === 0) {
      break;
    }

    allTickets.push(...tickets);

    if (tickets.length < pageSize) {
      break;
    }

    page++;
  }

  return { tickets: allTickets, total: allTickets.length };
}
async function pollKbItems(
  context: AppContext,
): Promise<{ items: any[]; total: number }> {
  let page = 1;
  const pageSize = 100;
  const allItems: any[] = [];

  while (true) {
    const variables = {
      listInfo: {
        page,
        pageSize,
        sort: null,
        condition: null,
      },
    };

    const result: any = await makeSuperOpsRequest(
      context,
      "getKbItems",
      variables,
    );

    // ❌ Errors from API
    if (result?.data?.error || result?.data?.errors) {
      throw new Error(result?.data?.error || "Error fetching KB items");
    }

    const responseData = result?.data?.getKbItems;
    if (!responseData) break;

    const items = responseData?.items || [];
    if (items.length === 0) break;

    allItems.push(...items);

    if (items.length < pageSize) {
      break;
    }

    page++;
  }

  return { items: allItems, total: allItems.length };
}
async function pollAssets(
  context: AppContext,
): Promise<{ assets: any[]; total: number }> {
  let page = 1;
  const pageSize = 50;
  const allAssets: any[] = [];

  while (true) {
    const variables = {
      input: {
        page,
        pageSize,
        sort: null,
        condition: null,
      },
    };

    const result: any = await makeSuperOpsRequest(
      context,
      "getAssetList",
      variables,
    );

    // ❌ API Error
    if (result?.data?.error || result?.data?.errors) {
      throw new Error(result?.data?.error || "Error fetching assets");
    }

    const responseData = result?.data?.getAssetList;
    if (!responseData) break;

    const assets = responseData?.assets || [];
    if (assets.length === 0) break;

    allAssets.push(...assets);

    if (assets.length < pageSize) {
      break;
    }

    page++;
  }

  return { assets: allAssets, total: allAssets.length };
}
async function pollServiceCatalog(
  context: AppContext,
): Promise<{ items: any[]; total: number }> {
  let page = 1;
  const pageSize = 50;
  const allItems: any[] = [];

  while (true) {
    const variables = {
      input: {
        page,
        pageSize,
        sort: null,
        condition: null,
      },
    };

    const result: any = await makeSuperOpsRequest(
      context,
      "getServiceCatalogItemList",
      variables,
    );

    // ❌ Error from API
    if (result?.data?.error || result?.data?.errors) {
      throw new Error(
        result?.data?.error || "Error fetching service catalog items",
      );
    }

    const responseData = result?.data?.getServiceCatalogItemList;
    if (!responseData) break;

    const items = responseData?.items || [];
    if (items.length === 0) break;

    allItems.push(...items);

    if (items.length < pageSize) {
      break;
    }
    page++;
  }

  return { items: allItems, total: allItems.length };
}
async function pollAlerts(
  context: AppContext,
): Promise<{ items: any[]; total: number }> {
  let page = 1;
  const pageSize = 100;
  const allItems: any[] = [];

  while (true) {
    const variables = {
      input: {
        page,
        pageSize,
        sort: null,
        condition: null,
      },
    };

    const result: any = await makeSuperOpsRequest(
      context,
      "getAlertList",
      variables,
    );

    // ❌ Errors from API
    if (result?.data?.error || result?.data?.errors) {
      throw new Error(result?.data?.error || "Error fetching alerts");
    }

    const responseData = result?.data?.getAlertList;
    if (!responseData) break;

    const items = responseData?.alerts || [];
    if (items.length === 0) break;

    allItems.push(...items);

    if (items.length < pageSize) {
      break;
    }

    page++;
  }

  return { items: allItems, total: allItems.length };
}

//Option
async function getTechnicians(context: AppContext): Promise<any[]> {
  let page = 1;
  const pageSize = 200;
  const technicians: any[] = [];
  let hasMore = true;

  while (hasMore) {
    const result: any = await makeSuperOpsRequest(
      context,
      "getTechnicianList",
      {
        input: { page, pageSize },
      },
    );

    const resp = result?.data?.getTechnicianList;
    if (!resp?.userList) break;

    // Push formatted result
    technicians.push(
      ...resp?.userList?.map((t: any) => ({
        label: t.name,
        value: t.userId,
      })),
    );

    hasMore = resp?.listInfo?.hasMore;
    page++;
  }

  return technicians;
}
async function getTechnicianGroups(context: AppContext): Promise<any[]> {
  const result: any = await makeSuperOpsRequest(
    context,
    "getTechnicianGroupList",
    {},
  );

  const resp = result?.data?.getTechnicianGroupList || [];

  return resp?.map((g: any) => ({
    label: g.name,
    value: g.groupId,
  }));
}
async function getServiceCategories(context: AppContext): Promise<any[]> {
  const resp: any = await makeSuperOpsRequest(
    context,
    "getServiceCategoryList",
    {},
  );

  const categories = resp?.data?.getServiceCategoryList || [];
  return categories?.map((c: any) => ({
    label: c.name,
    value: c.categoryId,
  }));
}
async function getSiteList(context: AppContext): Promise<any[]> {
  let page = 1;
  const pageSize = 50;
  const sites: any[] = [];
  let hasMore = true;

  while (hasMore) {
    const result: any = await makeSuperOpsRequest(context, "getSiteList", {
      input: { page, pageSize },
    });

    const list = result?.data?.getSiteList;

    if (!list?.sites) break;

    sites.push(
      ...list.sites.map((s: any) => ({
        id: s.id,
        name: s.name,
      })),
    );

    hasMore = list.listInfo?.hasMore;
    page++;
  }

  return sites;
}
async function getDepartmentList(context: AppContext): Promise<any[]> {
  let page = 1;
  const pageSize = 50;
  const departments: any[] = [];
  let hasMore = true;

  while (hasMore) {
    const result: any = await makeSuperOpsRequest(
      context,
      "getDepartmentList",
      {
        input: { page, pageSize },
      },
    );

    const list = result?.data?.getDepartmentList;

    if (!list) break;

    // SuperOps returns array directly → list is the array
    // Example: [ { departmentId, name }, ... ]
    departments?.push(
      ...list?.map((d: any) => ({
        id: d.departmentId,
        name: d.name,
      })),
    );

    hasMore = result?.data?.listInfo?.hasMore;
    page++;
  }

  return departments;
}
async function getUserList(context: AppContext): Promise<any[]> {
  let page = 1;
  const pageSize = 50;
  const users: any[] = [];
  let hasMore = true;

  while (hasMore) {
    const result: any = await makeSuperOpsRequest(context, "getUserList", {
      input: { page, pageSize },
    });

    const list = result?.data?.getUserList;

    if (!list) break;

    users.push(
      ...list?.userList?.map((u: any) => ({
        id: u.userId,
        name: u.name,
      })),
    );

    hasMore = result?.data?.listInfo?.hasMore;
    page++;
  }

  return users;
}
async function getSLAList(context: AppContext): Promise<any[]> {
  const result: any = await makeSuperOpsRequest(context, "getSLAList", {});

  const list = result?.data?.getSLAList;
  if (!list || !Array.isArray(list)) return [];

  return list?.map((s: any) => ({
    id: s.id,
    name: s.name,
  }));
}
async function getAssetList(context: AppContext): Promise<any[]> {
  let page = 1;
  const pageSize = 50;

  const allAssets: any[] = [];

  while (true) {
    const variables = {
      input: {
        page,
        pageSize,
        sort: null,
        condition: null,
      },
    };

    const result: any = await makeSuperOpsRequest(
      context,
      "getAssetList",
      variables,
    );

    const resp = result?.data?.getAssetList;
    if (!resp) break;

    const assets = resp?.assets || [];
    if (assets.length === 0) break;

    allAssets.push(...assets);

    const hasMore = resp?.listInfo?.hasMore;
    if (!hasMore) break;

    page++;
  }

  return allAssets;
}
async function getUnMonitoredAssetList(context: AppContext): Promise<any[]> {
  let page = 1;
  const pageSize = 50;

  const allAssets: any[] = [];

  while (true) {
    const variables = {
      input: {
        page,
        pageSize,
        sort: null,
        condition: null,
      },
    };

    const result: any = await makeSuperOpsRequest(
      context,
      "getUnMonitoredAssetList",
      variables,
    );

    const resp = result?.data?.getUnMonitoredAssetList;
    if (!resp) break;

    const assets = resp?.assets || [];
    if (assets.length === 0) break;

    allAssets.push(...assets);

    const hasMore = resp?.listInfo?.hasMore;
    if (!hasMore) break;

    page++;
  }

  return allAssets;
}

async function getAllAssetClasses(context: AppContext): Promise<any[]> {
  const pageSize = 100;
  let page = 1;

  const assetClasses: any[] = [];

  while (true) {
    const response: any = await makeSuperOpsRequest(
      context,
      "getAssetClassListV3",
      {
        listInfo: {
          page,
          pageSize,
        },
      },
    );

    if (response?.data?.error || response?.data?.errors) {
      throw new Error(
        response?.data?.error || JSON.stringify(response?.data?.errors),
      );
    }

    const result = response?.data?.getAssetClassListV3;

    if (!result) {
      break;
    }

    assetClasses.push(...(result.assetClass || []));

    const totalCount = result?.listInfo?.totalCount || 0;

    if (assetClasses.length >= totalCount) {
      break;
    }

    page++;
  }

  return assetClasses;
}

const actionsMap: any = {
  //Get Individual
  get_ticket: {
    id: "get_ticket",
    name: "Get Ticket",
    title: "Retrieve Ticket Details",
    subtitle: "Fetch detailed information about a specific ticket.",
    description:
      "Retrieves detailed information about a specific ticket using its ticket ID.",
    display_priority: 1,
    help: "Use this action to fetch detailed information about a ticket by providing the ticket ID. This action is useful for retrieving ticket metadata and updating or analyzing ticket data in workflows.",
    batch: false,
    bulk: false,
    deprecated: false,
    has_config_fields: false,
    config_fields: { fields: async () => [] },

    input_schema: {
      fields: async (context: AppContext): Promise<any> => {
        return [
          {
            name: "ticketId",
            label: "Ticket ID",
            type: "string",
            optional: false,
            control_type: "text",
            hint: "Enter Ticket ID.",
          },
        ];
      },
    },

    output_schema: {
      fields: async (context: AppContext): Promise<any> => {
        const variables = {
          input: {
            page: 1,
            pageSize: 50,
            sort: [{ attribute: "createdTime", order: "DESC" }],
            condition: null,
          },
        };

        const ticketDetails = await getSuperOpsOutputSchema(
          context,
          "getTicketList",
          variables,
        );
        if (ticketDetails?.statusCode >= 400) {
          let error =
            typeof ticketDetails?.data?.error === "string"
              ? ticketDetails?.data?.error
              : JSON.stringify(ticketDetails.data.error);
          throw new Error(error || "unable to retrieve sample data");
        }
        const data = ticketDetails?.tickets;
        if (data.length == 0) {
          throw new Error(
            `No tickets found. Cannot generate schema without sample data. `,
          );
        }
        const mergedData = Array.isArray(data) ? deepMergeAll(data) : data;
        const schema = flattenAndGenerateSchema(mergedData);
        return [
          ...schema,
          {
            name: "dataFound",
            label: "Data Found",
            type: "boolean",
            control_type: "checkbox",
            optional: true,
            hint: "Enter Data Found.",
          },
        ];
      },
    },

    sample: { fields: async () => [] },

    execute: async (context: AppContext): Promise<ExecutionPayload> => {
      try {
        const { ticketId }: any = context?.payload?.data;
        if (!ticketId || ticketId === "null" || ticketId === "") {
          return { statusCode: 400, data: { error: "Ticket ID is required." } };
        }
        const variables = { input: { ticketId } };
        const result: any = await makeSuperOpsRequest(
          context,
          "getTicket",
          variables,
        );
        if (result?.data?.data?.getTicket === null) {
          return {
            statusCode: 200,
            data: { dataFound: false },
          };
        }
        if (result?.data?.error || result?.data?.errors) {
          return {
            statusCode: result?.statusCode || 500,
            data: {
              error:
                result?.data?.error ||
                result?.data?.errors ||
                "Error fetching ticket details.",
            },
          };
        }
        return {
          statusCode: 200,
          data: {
            ...result?.data?.getTicket,
            dataFound: true,
          },
        };
      } catch (error: any) {
        return handleActionError(error, context, "Find Ticket");
      }
    },

    retry_on_response: [],
    retry_on_request: [],
    max_retries: 0,
    batch_size: 0,
    cursor_enabled: true,
  }, //done
  get_task: {
    id: "get_task",
    name: "Get Task",
    title: "Retrieve Task Details",
    subtitle: "Fetch detailed information about a specific task.",
    description:
      "Retrieves detailed information about a task using its Task ID.",
    display_priority: 1,
    help: "Use this action to fetch detailed information about a task by providing the Task ID. This action is useful for retrieving task metadata and using it in workflows for automation, updates, or analysis.",

    batch: false,
    bulk: false,
    deprecated: false,
    has_config_fields: false,
    config_fields: { fields: async () => [] },
    retry_on_response: [],
    retry_on_request: [],
    max_retries: 0,
    batch_size: 0,
    cursor_enabled: true,

    input_schema: {
      fields: async (context: AppContext): Promise<any> => {
        return [
          {
            name: "taskId",
            label: "Task ID",
            type: "string",
            optional: false,
            control_type: "text",
            hint: "Enter Task ID.",
          },
        ];
      },
    },

    output_schema: {
      fields: async (context: AppContext): Promise<any> => {
        const variables = {
          input: {
            page: 1,
            pageSize: 50,
            sort: [{ attribute: "createdTime", order: "DESC" }],
            condition: null,
          },
        };

        const Response = await getSuperOpsOutputSchema(
          context,
          "getTaskList",
          variables,
        );
        if (Response?.statusCode >= 400) {
          let error =
            typeof Response?.data?.error === "string"
              ? Response?.data?.error
              : JSON.stringify(Response.data.error);
          throw new Error(error || "unable to retrieve sample data");
        }
        const data = Response?.tasks;
        if (data.length == 0) {
          throw new Error(
            `No tasks found. Cannot generate schema without sample data. `,
          );
        }
        const mergedData = Array.isArray(data) ? deepMergeAll(data) : data;
        const schema = flattenAndGenerateSchema(mergedData);
        return [
          ...schema,
          {
            name: "dataFound",
            label: "Data Found",
            type: "boolean",
            control_type: "checkbox",
            optional: true,
            hint: "Enter Data Found.",
          },
        ];
      },
    },

    sample: { fields: async () => [] },

    execute: async (context: AppContext): Promise<ExecutionPayload> => {
      try {
        const { taskId }: any = context?.payload?.data;
        if (!taskId || taskId === "null" || taskId === "") {
          return { statusCode: 400, data: { error: "Ticket ID is required." } };
        }
        const variables = { input: { taskId } };
        const result: any = await makeSuperOpsRequest(
          context,
          "getTask",
          variables,
        );
        if (result?.data?.data?.getTask === null) {
          return {
            statusCode: 200,
            data: { dataFound: false },
          };
        }
        if (result?.data?.error || result?.data?.errors) {
          return {
            statusCode: result?.statusCode || 500,
            data: {
              error:
                result?.data?.error ||
                result?.data?.errors ||
                "Error fetching task details.",
            },
          };
        }
        return {
          statusCode: 200,
          data: {
            ...result?.data?.getTask,
            dataFound: true,
          },
        };
      } catch (error: any) {
        return handleActionError(error, context, "Find Task");
      }
    },
  }, //done
  get_site: {
    id: "get_site",
    name: "Get Site",
    title: "Retrieve Site Details",
    subtitle: "Fetch detailed information about a specific site.",
    description:
      "Retrieves detailed information about a site using its Site ID.",
    display_priority: 1,
    help: "Use this action to fetch detailed information about a site by providing the Site ID. This action is useful for retrieving site metadata and using it in workflows for automation, updates, or analysis.",
    batch: false,
    bulk: false,
    deprecated: false,
    has_config_fields: false,
    config_fields: { fields: async () => [] },
    retry_on_response: [],
    retry_on_request: [],
    max_retries: 0,
    batch_size: 0,
    cursor_enabled: true,

    input_schema: {
      fields: async (context: AppContext): Promise<any> => {
        return [
          {
            name: "id",
            label: "Site ID",
            type: "string",
            optional: false,
            control_type: "text",
            hint: "Enter Site ID.",
          },
        ];
      },
    },

    output_schema: {
      fields: async (context: AppContext): Promise<any> => {
        const variables = {
          input: {
            page: 1,
            pageSize: 50,
            sort: null,
            condition: null,
          },
        };

        const Response = await getSuperOpsOutputSchema(
          context,
          "getSiteList",
          variables,
        );
        if (Response?.statusCode >= 400) {
          let error =
            typeof Response?.data?.error === "string"
              ? Response?.data?.error
              : JSON.stringify(Response.data.error);
          throw new Error(error || "unable to retrieve sample data");
        }
        const data = Response?.sites;
        if (data.length == 0) {
          throw new Error(
            `No items found. Cannot generate schema without sample data. `,
          );
        }
        const mergedData = Array.isArray(data) ? deepMergeAll(data) : data;
        const schema = flattenAndGenerateSchema(mergedData);
        return [
          ...schema,
          {
            name: "datafound",
            label: "Data Found",
            type: "boolean",
            control_type: "checkbox",
            optional: true,
            hint: "Enter Data Found.",
          },
        ];
      },
    },

    sample: { fields: async () => [] },

    execute: async (context: AppContext): Promise<ExecutionPayload> => {
      try {
        const { id }: any = context?.payload?.data;
        if (!id || id === "null" || id === "") {
          return { statusCode: 400, data: { error: "ID is required." } };
        }
        const variables = { input: { id } };
        const result: any = await makeSuperOpsRequest(
          context,
          "getSite",
          variables,
        );
        if (result?.data?.data?.getSite === null) {
          return {
            statusCode: 200,
            data: { dataFound: false },
          };
        }
        if (result?.data?.error || result?.data?.errors) {
          return {
            statusCode: result?.statusCode || 500,
            data: {
              error:
                result?.data?.error ||
                result?.data?.errors ||
                "Error fetching task details.",
            },
          };
        }
        return {
          statusCode: 200,
          data: {
            ...result?.data?.getSite,
            dataFound: true,
          },
        };
      } catch (error: any) {
        return handleActionError(error, context, "Find Task");
      }
    },
  }, //done
  get_service_catalog_item: {
    id: "get_service_catalog_item",
    name: "Get Service Catalog Item",
    title: "Retrieve Service Catalog Item Details",
    subtitle:
      "Fetch detailed information about a specific service catalog item.",
    description:
      "Retrieves detailed information about a service catalog item using its Item ID.",
    display_priority: 1,
    help: "Use this action to fetch detailed information about a service catalog item by providing the Item ID. This action is useful for retrieving catalog item metadata and using it in workflows for automation, updates, or analysis.",
    batch: false,
    bulk: false,
    deprecated: false,
    has_config_fields: false,
    config_fields: { fields: async () => [] },
    retry_on_response: [],
    retry_on_request: [],
    max_retries: 0,
    batch_size: 0,
    cursor_enabled: true,

    input_schema: {
      fields: async (context: AppContext): Promise<any> => {
        return [
          {
            name: "itemId",
            label: "Item ID",
            type: "string",
            optional: false,
            control_type: "text",
            hint: "Enter Item ID.",
          },
        ];
      },
    },

    output_schema: {
      fields: async (context: AppContext): Promise<any> => {
        const variables = {
          input: {
            page: 1,
            pageSize: 50,
            sort: null,
            condition: null,
          },
        };

        const Response = await getSuperOpsOutputSchema(
          context,
          "getServiceCatalogItemList",
          variables,
        );
        if (Response?.statusCode >= 400) {
          let error =
            typeof Response?.data?.error === "string"
              ? Response?.data?.error
              : JSON.stringify(Response.data.error);
          throw new Error(error || "unable to retrieve sample data");
        }
        const data = Response?.items;
        if (!data || data.length === 0) {
          throw new Error(
            `No items found. Cannot generate schema without sample data. `,
          );
        }
        const mergedData = Array.isArray(data) ? deepMergeAll(data) : data;
        const schema = flattenAndGenerateSchema(mergedData);
        return [
          ...schema,
          {
            name: "dataFound",
            label: "Data Found",
            type: "boolean",
            control_type: "checkbox",
            optional: true,
            hint: "Enter Data Found.",
          },
        ];
      },
    },

    sample: { fields: async () => [] },

    execute: async (context: AppContext): Promise<ExecutionPayload> => {
      try {
        const { itemId }: any = context?.payload?.data;
        if (!itemId || itemId === "null" || itemId === "") {
          return { statusCode: 400, data: { error: "Item ID is required." } };
        }
        const variables = { input: { itemId } };
        const result: any = await makeSuperOpsRequest(
          context,
          "getServiceCatalogItem",
          variables,
        );
        if (result?.data?.data?.getServiceCatalogItem === null) {
          return {
            statusCode: 200,
            data: { dataFound: false },
          };
        }
        if (result?.data?.error || result?.data?.errors) {
          return {
            statusCode: result?.statusCode || 500,
            data: {
              error:
                result?.data?.error ||
                result?.data?.errors ||
                "Error fetching Item details.",
            },
          };
        }
        return {
          statusCode: 200,
          data: {
            ...result?.data?.getServiceCatalogItem,
            dataFound: true,
          },
        };
      } catch (error: any) {
        return handleActionError(error, context, "Find Task");
      }
    },
  }, //done
  get_service_item: {
    id: "get_service_item",
    name: "Get Service Item",
    title: "Retrieve Service Item Details",
    subtitle: "Fetch detailed information about a specific service item.",
    description:
      "Retrieves detailed information about a service item using its Item ID.",
    display_priority: 1,
    help: "Use this action to fetch detailed information about a service item by providing the Item ID. This action is useful for retrieving service item metadata and using it in workflows for automation, updates, or analysis.",

    deprecated: false,
    has_config_fields: false,
    config_fields: { fields: async () => [] },
    retry_on_response: [],
    retry_on_request: [],
    max_retries: 0,
    batch_size: 0,
    cursor_enabled: true,

    input_schema: {
      fields: async (context: AppContext): Promise<any> => {
        return [
          {
            name: "itemId",
            label: "Item ID",
            type: "string",
            optional: false,
            control_type: "text",
            hint: "Enter Item ID.",
          },
        ];
      },
    },

    output_schema: {
      fields: async (context: AppContext): Promise<any> => {
        const variables = {
          input: {
            page: 1,
            pageSize: 50,
            sort: null,
            condition: null,
          },
        };

        const Response = await getSuperOpsOutputSchema(
          context,
          "getServiceItemList",
          variables,
        );
        if (Response?.statusCode >= 400) {
          let error =
            typeof Response?.data?.error === "string"
              ? Response?.data?.error
              : JSON.stringify(Response.data.error);
          throw new Error(error || "unable to retrieve sample data");
        }
        const data = Response?.items;
        if (!data || data.length === 0) {
          throw new Error(
            `No items found. Cannot generate schema without sample data. `,
          );
        }
        const mergedData = Array.isArray(data) ? deepMergeAll(data) : data;
        const schema = flattenAndGenerateSchema(mergedData);
        return [
          ...schema,
          {
            name: "dataFound",
            label: "Data Found",
            type: "boolean",
            control_type: "checkbox",
            optional: true,
            hint: "Enter Data Found.",
          },
        ];
      },
    },

    sample: { fields: async () => [] },

    execute: async (context: AppContext): Promise<ExecutionPayload> => {
      try {
        const { itemId }: any = context?.payload?.data;
        if (!itemId || itemId === "null" || itemId === "") {
          return { statusCode: 400, data: { error: "Item ID is required." } };
        }
        const variables = { input: { itemId } };
        const result: any = await makeSuperOpsRequest(
          context,
          "getServiceItem",
          variables,
        );
        if (result?.data?.data?.getServiceItem === null) {
          return {
            statusCode: 200,
            data: { dataFound: false },
          };
        }
        if (result?.data?.error || result?.data?.errors) {
          return {
            statusCode: result?.statusCode || 500,
            data: {
              error:
                result?.data?.error ||
                result?.data?.errors ||
                "Error fetching Item details.",
            },
          };
        }
        return {
          statusCode: 200,
          data: {
            ...result?.data?.getServiceItem,
            dataFound: true,
          },
        };
      } catch (error: any) {
        return handleActionError(error, context, "Find Service item");
      }
    },
  }, //done

  get_kb_item: {
    id: "get_kb_item",
    name: "Get Knowledge Base Item",
    title: "Retrieve Knowledge Base Item Details",
    subtitle:
      "Fetch detailed information about a specific knowledge base item.",
    description:
      "Retrieves detailed information about a knowledge base item using its Item ID.",
    display_priority: 1,
    help: "Use this action to fetch detailed information about a knowledge base item by providing the Item ID. This action is useful for retrieving KB metadata and using it in workflows for automation, updates, or analysis.",
    deprecated: false,
    has_config_fields: false,
    config_fields: { fields: async () => [] },
    retry_on_response: [],
    retry_on_request: [],
    max_retries: 0,
    batch_size: 0,
    cursor_enabled: true,

    input_schema: {
      fields: async (context: AppContext): Promise<any> => {
        return [
          {
            name: "itemId",
            label: "Article ID",
            type: "string",
            optional: false,
            control_type: "text",
            hint: "Enter Article ID.",
          },
        ];
      },
    },

    output_schema: {
      fields: async (context: AppContext): Promise<any> => {
        const variables = {
          listInfo: {
            page: 1,
            pageSize: 50,
            sort: null,
            condition: null,
          },
        };

        const Response = await getSuperOpsOutputSchema(
          context,
          "getKbItems",
          variables,
        );
        if (Response?.statusCode >= 400) {
          let error =
            typeof Response?.data?.error === "string"
              ? Response?.data?.error
              : JSON.stringify(Response.data.error);
          throw new Error(error || "unable to retrieve sample data");
        }
        const data = Response?.items;
        if (!data || data.length === 0) {
          throw new Error(
            `No items found. Cannot generate schema without sample data.`,
          );
        }
        const mergedData = Array.isArray(data) ? deepMergeAll(data) : data;
        const schema = flattenAndGenerateSchema(mergedData);
        return [
          ...schema,
          {
            name: "dataFound",
            label: "Data Found",
            type: "boolean",
            control_type: "checkbox",
            optional: true,
            hint: "Enter Data Found.",
          },
        ];
      },
    },

    sample: { fields: async () => [] },

    execute: async (context: AppContext): Promise<ExecutionPayload> => {
      try {
        const { itemId }: any = context?.payload?.data;
        if (!itemId || itemId === "null" || itemId === "") {
          return { statusCode: 400, data: { error: "Item ID is required." } };
        }
        const variables = { input: { itemId } };
        const result: any = await makeSuperOpsRequest(
          context,
          "getKbItem",
          variables,
        );
        if (result?.data?.data?.getKbItem === null) {
          return {
            statusCode: 200,
            data: { dataFound: false },
          };
        }
        if (result?.data?.error || result?.data?.errors) {
          return {
            statusCode: result?.statusCode || 500,
            data: {
              error:
                result?.data?.error ||
                result?.data?.errors ||
                "Error fetching Kb item details.",
            },
          };
        }
        return {
          statusCode: 200,
          data: {
            ...result?.data?.getKbItem,
            dataFound: true,
          },
        };
      } catch (error: any) {
        return handleActionError(error, context, "Find Kb Item");
      }
    },
  }, //done
  get_asset: {
    id: "get_asset",
    name: "Get Asset",
    title: "Retrieve Asset Details",
    subtitle: "Fetch detailed information about a specific asset.",
    description: "Retrieves detailed information about a asset",
    display_priority: 1,
    help: "Use this action to fetch detailed information about a asset by providing the Asset ID.",

    batch: false,
    bulk: false,
    deprecated: false,
    has_config_fields: false,
    config_fields: { fields: async () => [] },
    retry_on_response: [],
    retry_on_request: [],
    max_retries: 0,
    batch_size: 0,
    cursor_enabled: true,

    input_schema: {
      fields: async (context: AppContext): Promise<any> => {
        return [
          {
            name: "assetId",
            label: "Asset ID",
            type: "string",
            optional: false,
            control_type: "text",
            hint: "Enter Asset ID.",
          },
        ];
      },
    },

    output_schema: {
      fields: async (context: AppContext): Promise<any> => {
        const variables = {
          input: {
            page: 1,
            pageSize: 50,

            condition: null,
          },
        };

        const Response = await getSuperOpsOutputSchema(
          context,
          "getAssetList",
          variables,
        );
        if (Response?.statusCode >= 400) {
          let error =
            typeof Response?.data?.error === "string"
              ? Response?.data?.error
              : JSON.stringify(Response.data.error);
          throw new Error(error || "unable to retrieve sample data");
        }
        const data = Response?.assets;
        if (data.length == 0) {
          throw new Error(
            `No asset found. Cannot generate schema without sample data. `,
          );
        }
        const mergedData = Array.isArray(data) ? deepMergeAll(data) : data;
        const schema = flattenAndGenerateSchema(mergedData);
        return [
          ...schema,
          {
            name: "dataFound",
            label: "Data Found",
            type: "boolean",
            control_type: "checkbox",
            optional: true,
            hint: "Enter Data Found.",
          },
        ];
      },
    },

    sample: { fields: async () => [] },

    execute: async (context: AppContext): Promise<ExecutionPayload> => {
      try {
        const { assetId }: any = context?.payload?.data;
        if (!assetId || assetId === "null" || assetId === "") {
          return { statusCode: 400, data: { error: "Asset ID is required." } };
        }
        const variables = { input: { assetId } };
        const result: any = await makeSuperOpsRequest(
          context,
          "getAsset",
          variables,
        );
        if (result?.data?.data?.getAsset === null) {
          return {
            statusCode: 200,
            data: { dataFound: false },
          };
        }
        if (result?.data?.error || result?.data?.errors) {
          return {
            statusCode: result?.statusCode || 500,
            data: {
              error:
                result?.data?.error ||
                result?.data?.errors ||
                "Error fetching Asset details.",
            },
          };
        }
        return {
          statusCode: 200,
          data: {
            ...result?.data?.getAsset,
            dataFound: true,
          },
        };
      } catch (error: any) {
        return handleActionError(error, context, "Find Asset");
      }
    },
  },
  get_alert_by_id: {
    id: "get_alert_by_id",
    name: "Get Alert By ID",
    title: "Retrieve Alert Details",
    subtitle: "Fetch detailed information about a specific alert.",
    description:
      "Retrieves detailed information about an alert using its Alert ID.",
    display_priority: 1,
    help: "Use this action to fetch detailed information about an alert by providing the Alert ID. This action is useful for retrieving alert metadata and using it in workflows for automation, updates, or analysis.",
    deprecated: false,
    has_config_fields: false,
    config_fields: { fields: async () => [] },
    retry_on_response: [],
    retry_on_request: [],
    max_retries: 0,
    batch_size: 0,
    cursor_enabled: true,

    input_schema: {
      fields: async (context: AppContext): Promise<any> => {
        return [
          {
            name: "alertId",
            label: "Alert ID",
            type: "string",
            optional: false,
            control_type: "text",
            hint: "Enter Alert ID.",
          },
        ];
      },
    },

    output_schema: {
      fields: async (context: AppContext): Promise<any> => {
        const variables = {
          input: {
            page: 1,
            pageSize: 50,
            sort: null,
            condition: null,
          },
        };

        const Response = await getSuperOpsOutputSchema(
          context,
          "getAlertList",
          variables,
        );
        if (Response?.statusCode >= 400) {
          let error =
            typeof Response?.data?.error === "string"
              ? Response?.data?.error
              : JSON.stringify(Response.data.error);
          throw new Error(error || "unable to retrieve sample data");
        }
        const data = Response?.alerts;
        if (!data || data.length === 0) {
          throw new Error(
            `No items found. Cannot generate schema without sample data.`,
          );
        }
        const mergedData = Array.isArray(data) ? deepMergeAll(data) : data;
        const schema = flattenAndGenerateSchema(mergedData);
        return [
          ...schema,
          {
            name: "dataFound",
            label: "Data Found",
            type: "boolean",
            control_type: "checkbox",
            optional: true,
            hint: "Enter Data Found.",
          },
        ];
      },
    },

    sample: { fields: async () => [] },

    execute: async (context: AppContext): Promise<ExecutionPayload> => {
      try {
        const { alertId }: any = context?.payload?.data;
        if (!alertId || alertId === "null" || alertId === "") {
          return { statusCode: 400, data: { error: "Alert ID is required." } };
        }

        let page = 1;
        let foundAlert: any = null; // ✅ TS Fix: explicitly type as any
        let hasMore = true;

        // ✅ GraphQL Fix: Paginate through getAlertList until we find the matching ID
        while (hasMore) {
          const variables = {
            input: {
              page,
              pageSize: 100,
              sort: null,
              condition: null,
            },
          };

          const result: any = await makeSuperOpsRequest(
            context,
            "getAlertList",
            variables,
          );

          if (result?.data?.error || result?.data?.errors) {
            return {
              statusCode: result?.statusCode || 500,
              data: {
                error:
                  result?.data?.error ||
                  result?.data?.errors ||
                  "Error fetching Alert details.",
              },
            };
          }

          const alerts = result?.data?.getAlertList?.alerts || [];

          foundAlert = alerts.find(
            (a: any) => String(a.id) === String(alertId),
          );

          if (foundAlert) {
            break;
          }

          const listInfo = result?.data?.getAlertList?.listInfo;
          if (!listInfo || !listInfo.hasMore) {
            hasMore = false;
          } else {
            page++;
          }
        }

        if (!foundAlert) {
          return {
            statusCode: 200,
            data: { dataFound: false },
          };
        }

        return {
          statusCode: 200,
          data: {
            ...(foundAlert || {}), // ✅ TS Fix: Safe spread
            dataFound: true,
          },
        };
      } catch (error: any) {
        return handleActionError(error, context, "Find Alert");
      }
    },
  },
  //Get
  get_ticket_notes: {
    id: "get_ticket_notes",
    name: "Get Ticket Notes",
    title: "Retrieve Ticket Notes",
    subtitle: "Fetch detailed notes associated with a specific ticket.",
    description: "Retrieves all notes added to a ticket using its Ticket ID.",
    display_priority: 1,
    help: "Use this action to fetch detailed notes for a ticket by providing the Ticket ID. This action is useful for reviewing communication history, analysis, reporting, or triggering workflows based on note updates.",
    deprecated: false,
    has_config_fields: false,
    config_fields: { fields: async () => [] },
    retry_on_response: [],
    retry_on_request: [],
    max_retries: 0,
    batch_size: 0,
    cursor_enabled: true,

    input_schema: {
      fields: async (context: AppContext): Promise<any> => {
        return [
          {
            name: "ticketId",
            label: "Ticket ID",
            type: "string",
            optional: false,
            control_type: "text",
            hint: "Enter Ticket ID.",
          },
        ];
      },
    },

    output_schema: {
      fields: async (context: AppContext): Promise<any> => {
        const finalData = {
          notesData: "test",
          dataFound: true,
        };
        const schema = flattenAndGenerateSchema(finalData);
        return schema;
      },
    },

    sample: { fields: async () => [] },

    execute: async (context: AppContext): Promise<ExecutionPayload> => {
      try {
        const { ticketId }: any = context?.payload?.data;
        if (!ticketId || ticketId === "null" || ticketId === "") {
          return { statusCode: 400, data: { error: "Ticket ID is required." } };
        }
        const variables = { input: { ticketId } };
        const result: any = await makeSuperOpsRequest(
          context,
          "getTicketNoteList",
          variables,
        );
        if (result?.data?.data?.getTicketNoteList === null) {
          return {
            statusCode: 200,
            data: { dataFound: false },
          };
        }
        if (result?.data?.error || result?.data?.errors) {
          return {
            statusCode: result?.statusCode || 500,
            data: {
              error:
                result?.data?.error ||
                result?.data?.errors ||
                "Error fetching ticket notes details.",
            },
          };
        }
        const output = result?.data?.getTicketNoteList;
        let response = JSON.stringify(output);
        return {
          statusCode: 200,
          data: {
            notesData: response,
            dataFound: true,
          },
        };
      } catch (error: any) {
        return handleActionError(error, context, "Find ticket notes");
      }
    },
  }, //done
  get_ticket_conversation: {
    id: "get_ticket_conversation",
    name: "Get Ticket Conversation",
    title: "Retrieve Ticket Conversation",
    subtitle:
      "Fetch the complete conversation history associated with a specific ticket.",
    description:
      "Retrieves all conversation messages for a ticket using its Ticket ID.",
    display_priority: 1,
    help: "Use this action to fetch the full conversation history for a ticket by providing the Ticket ID. This action is helpful for auditing communication, analyzing ticket activity, or triggering workflows based on new messages.",
    deprecated: false,

    has_config_fields: false,
    config_fields: { fields: async () => [] },
    retry_on_response: [],
    retry_on_request: [],
    max_retries: 0,
    batch_size: 0,
    cursor_enabled: true,

    input_schema: {
      fields: async (context: AppContext): Promise<any> => {
        return [
          {
            name: "ticketId",
            label: "Ticket ID",
            type: "string",
            optional: false,
            control_type: "text",
            hint: "Enter Ticket ID.",
          },
        ];
      },
    },

    output_schema: {
      fields: async (context: AppContext): Promise<any> => {
        const finalData = {
          conversationData: "test",
          dataFound: true,
        };
        const schema = flattenAndGenerateSchema(finalData);
        return schema;
      },
    },

    sample: { fields: async () => [] },

    execute: async (context: AppContext): Promise<ExecutionPayload> => {
      try {
        const { ticketId }: any = context?.payload?.data;
        if (!ticketId || ticketId === "null" || ticketId === "") {
          return { statusCode: 400, data: { error: "Ticket ID is required." } };
        }
        const variables = { input: { ticketId } };
        const result: any = await makeSuperOpsRequest(
          context,
          "getTicketConversationList",
          variables,
        );
        if (result?.data?.data?.getTicketConversationList === null) {
          return {
            statusCode: 200,
            data: { dataFound: false },
          };
        }
        if (result?.data?.error || result?.data?.errors) {
          return {
            statusCode: result?.statusCode || 500,
            data: {
              error:
                result?.data?.error ||
                result?.data?.errors ||
                "Error fetching ticket Conversion details.",
            },
          };
        }
        const output = result?.data?.getTicketConversationList;
        let response = JSON.stringify(output);
        return {
          statusCode: 200,
          data: {
            conversationData: response,
            dataFound: true,
          },
        };
      } catch (error: any) {
        return handleActionError(error, context, "Find ticket Conversion");
      }
    },
  }, //done
  get_asset_summary: {
    id: "get_asset_summary",
    name: "Get Asset Summary",
    title: "Retrieve Asset Summary",
    subtitle:
      "Fetch the complete summary details associated with a specific asset.",
    description:
      "Retrieves key summary information about an asset using its Asset ID.",
    display_priority: 1,
    help: "Use this action to fetch the summary of an asset by providing the Asset ID. This is useful for asset audits, reporting, troubleshooting, or triggering workflows based on asset state.",
    deprecated: false,
    has_config_fields: false,
    config_fields: { fields: async () => [] },
    retry_on_response: [],
    retry_on_request: [],
    max_retries: 0,
    batch_size: 0,
    cursor_enabled: true,

    input_schema: {
      fields: async (context: AppContext): Promise<any> => {
        return [
          {
            name: "assetId",
            label: "Asset ID",
            type: "string",
            optional: false,
            control_type: "text",
            hint: "Enter Asset ID.",
          },
        ];
      },
    },

    output_schema: {
      fields: async (context: AppContext): Promise<any> => {
        const finalData = {
          assetSummaryData: "test",
          dataFound: true,
        };
        const schema = flattenAndGenerateSchema(finalData);
        return schema;
      },
    },

    sample: { fields: async () => [] },

    execute: async (context: AppContext): Promise<ExecutionPayload> => {
      try {
        const { assetId }: any = context?.payload?.data;
        if (!assetId || assetId === "null" || assetId === "") {
          return { statusCode: 400, data: { error: "Asset ID is required." } };
        }
        const variables = { input: { assetId } };
        const result: any = await makeSuperOpsRequest(
          context,
          "getAssetSummary",
          variables,
        );
        if (result?.data?.data?.getAssetSummary === null) {
          return {
            statusCode: 200,
            data: { dataFound: false },
          };
        }
        if (result?.data?.error || result?.data?.errors) {
          return {
            statusCode: result?.statusCode || 500,
            data: {
              error:
                result?.data?.error ||
                result?.data?.errors ||
                "Error fetching Asset Summary details.",
            },
          };
        }
        const output = result?.data?.getAssetSummary;
        let response = JSON.stringify(output);
        return {
          statusCode: 200,
          data: {
            assetSummaryData: response,
            dataFound: true,
          },
        };
      } catch (error: any) {
        return handleActionError(error, context, "Find Asset Summary");
      }
    },
  }, //done

  //Get All
  get_all_ticket_list: {
    id: "get_all_ticket_list",
    name: "Get All Ticket List",
    title: "Retrieve All Tickets",
    subtitle: "Fetch the complete list of tickets from SuperOps.",
    description: "Retrieves All Tickets",
    display_priority: 1,
    help: "Use this action to fetch the entire ticket list from SuperOps. This is helpful for integrations that require syncing ticket data, analyzing trends, or automating workflows based on ticket activity.",

    deprecated: false,
    has_config_fields: false,
    config_fields: { fields: async () => [] },
    retry_on_response: [],
    retry_on_request: [],
    max_retries: 0,
    batch_size: 0,
    cursor_enabled: true,

    input_schema: {
      fields: async (context: AppContext): Promise<any> => {
        return [
          {
            name: "type",
            label: "Type",
            control_type: "select",
            type: "string",
            pick_list: [{ label: "Tickets", value: "ticket" }],
            optional: false,
            hint: "Enter Type.",
          },
        ];
      },
    },

    output_schema: {
      fields: async (context: AppContext): Promise<any> => {
        const finalData = {
          allTicketsList: "test",
          totalTickets: "total",
        };
        const schema = flattenAndGenerateSchema(finalData);
        return schema;
      },
    },

    sample: { fields: async () => [] },

    execute: async (context: AppContext): Promise<ExecutionPayload> => {
      try {
        const { tickets, total } = await pollTickets(context);

        return {
          statusCode: 200,
          data: {
            allTicketsList: JSON.stringify(tickets),
            totalTickets: total,
          },
        };
      } catch (error: any) {
        return handleActionError(error, context, "Poll Tickets");
      }
    },
  }, //done
  get_all_kbitem_list: {
    id: "get_all_kbitem_list",
    name: "Get All KB Items",
    title: "Retrieve All Knowledge Base Items",
    subtitle: "Fetch the complete list of knowledge base items from SuperOps.",
    description: "Retrieve All Knowledge Base Items",
    display_priority: 1,
    help: "Use this action to fetch the entire list of knowledge base items from SuperOps. This is helpful for syncing KB content, analyzing documentation patterns, or triggering workflows when KB articles change.",

    deprecated: false,
    has_config_fields: false,
    config_fields: { fields: async () => [] },
    retry_on_response: [],
    retry_on_request: [],
    max_retries: 0,
    batch_size: 0,
    cursor_enabled: true,

    input_schema: {
      fields: async (context: AppContext): Promise<any> => {
        return [
          {
            name: "type",
            label: "Type",
            control_type: "select",
            type: "string",
            pick_list: [{ label: "KbItem", value: "KbItem" }],
            optional: false,
            hint: "Enter Type.",
          },
        ];
      },
    },

    output_schema: {
      fields: async (context: AppContext): Promise<any> => {
        const finalData = {
          allKbItemList: "test",
          totalKbItem: "total",
        };
        const schema = flattenAndGenerateSchema(finalData);
        return schema;
      },
    },

    sample: { fields: async () => [] },

    execute: async (context: AppContext): Promise<ExecutionPayload> => {
      try {
        const { items, total } = await pollKbItems(context);

        return {
          statusCode: 200,
          data: {
            allKbItemList: JSON.stringify(items),
            totalKbItem: total,
          },
        };
      } catch (error: any) {
        return handleActionError(error, context, "Poll Kb Item");
      }
    },
  }, //done
  get_all_asset_list: {
    id: "get_all_asset_list",
    name: "Get All Assets",
    title: "Retrieve All Assets",
    subtitle: "Fetch the complete list of assets from SuperOps.",
    description: "Retrieve All Assets",
    display_priority: 1,
    help: "Use this action to fetch the entire list of assets from SuperOps. This is helpful for syncing asset data, maintaining an up-to-date CMDB, performing audits, or triggering workflows when assets are added, updated, or removed.",
    deprecated: false,
    has_config_fields: false,
    config_fields: { fields: async () => [] },
    retry_on_response: [],
    retry_on_request: [],
    max_retries: 0,
    batch_size: 0,
    cursor_enabled: true,

    input_schema: {
      fields: async (context: AppContext): Promise<any> => {
        return [
          {
            name: "type",
            label: "Type",
            control_type: "select",
            type: "string",
            pick_list: [{ label: "Asset", value: "Asset" }],
            optional: false,
            hint: "Enter Type.",
          },
        ];
      },
    },

    output_schema: {
      fields: async (context: AppContext): Promise<any> => {
        const finalData = {
          allAssetsList: "test",
          totalAsset: "total",
        };
        const schema = flattenAndGenerateSchema(finalData);
        return schema;
      },
    },

    sample: { fields: async () => [] },

    execute: async (context: AppContext): Promise<ExecutionPayload> => {
      try {
        const { assets, total } = await pollAssets(context);

        return {
          statusCode: 200,
          data: {
            allAssetsList: JSON.stringify(assets),
            totalAsset: total,
          },
        };
      } catch (error: any) {
        return handleActionError(error, context, "Poll Assets");
      }
    },
  }, //done
  get_all_service_catalog_list: {
    id: "get_all_service_catalog_list",
    name: "Get All Service Catalog Items",
    title: "Retrieve All Service Catalog Items",
    subtitle: "Fetch the complete list of service catalog items from SuperOps.",
    description: "Retrieve All Service Catalog Items",
    display_priority: 1,
    help: "Use this action to fetch the entire list of service catalog items from SuperOps. This is helpful for syncing catalog entries, analyzing service offerings, or triggering workflows when catalog items are added, updated, or removed.",

    deprecated: false,
    has_config_fields: false,
    config_fields: { fields: async () => [] },
    retry_on_response: [],
    retry_on_request: [],
    max_retries: 0,
    batch_size: 0,
    cursor_enabled: true,

    input_schema: {
      fields: async (context: AppContext): Promise<any> => {
        return [
          {
            name: "type",
            label: "Type",
            control_type: "select",
            type: "string",
            pick_list: [{ label: "ServiceCatalog", value: "ServiceCatalog" }],
            optional: false,
            hint: "Enter Type.",
          },
        ];
      },
    },

    output_schema: {
      fields: async (context: AppContext): Promise<any> => {
        const finalData = {
          allServiceCatalogList: "test",
          totalServiceCatalog: "total",
        };
        const schema = flattenAndGenerateSchema(finalData);
        return schema;
      },
    },

    sample: { fields: async () => [] },

    execute: async (context: AppContext): Promise<ExecutionPayload> => {
      try {
        const { items, total } = await pollServiceCatalog(context);

        return {
          statusCode: 200,
          data: {
            allServiceCatalogList: JSON.stringify(items),
            totalServiceCatalog: total,
          },
        };
      } catch (error: any) {
        return handleActionError(error, context, "Poll Service Catalog");
      }
    },
  }, //done
  get_site_list: {
    id: "get_site_list",
    name: "Get Site List",
    title: "Retrieve Site List",
    subtitle: "Fetch a paginated list of sites from SuperOps.",
    description: "Retrieves site IDs and names from SuperOps.",
    display_priority: 1,
    help: "Use this action to fetch a paginated list of SuperOps sites with their IDs and names.",

    deprecated: false,
    has_config_fields: false,
    config_fields: { fields: async () => [] },
    retry_on_response: [],
    retry_on_request: [],
    max_retries: 0,
    batch_size: 0,
    cursor_enabled: true,

    input_schema: {
      fields: async (context: AppContext): Promise<any> => {
        return [
          {
            name: "info",
            label: "Info",
            type: "number",
            control_type: "number",
            optional: true,
            hint: "Optional",
          },
        ];
      },
    },

    output_schema: {
      fields: async (context: AppContext): Promise<any> => {
        const finalData = {
          sites: [
            {
              id: "6027178066613911552",
              name: "Headquarters",
            },
            {
              id: "6028532731314192384",
              name: "Michigan",
            },
          ],
          totalRecords: 2,
          dataFound: true,
        };

        return flattenAndGenerateSchema(finalData);
      },
    },

    sample: { fields: async () => [] },

    execute: async (context: AppContext): Promise<ExecutionPayload> => {
      try {
        const pageSize = 100;
        const allSites: any[] = [];
        let page = 1;
        let hasMore = true;

        while (hasMore) {
          const result: any = await makeSuperOpsRequest(
            context,
            "getBasicSiteList",
            {
              input: {
                page,
                pageSize,
              },
            },
          );

          if (result?.data?.error || result?.data?.errors) {
            return {
              statusCode: result?.statusCode || 500,
              data: {
                error:
                  result?.data?.error ||
                  result?.data?.errors ||
                  "Error fetching site list.",
              },
            };
          }

          const siteList = result?.data?.getSiteList;
          const sites = siteList?.sites || [];

          allSites.push(...sites);

          hasMore = siteList?.listInfo?.hasMore ?? false;
          page++;
        }

        return {
          statusCode: 200,
          data: {
            sites: allSites,
            totalRecords: allSites.length,
            dataFound: allSites.length > 0,
          },
        };
      } catch (error: any) {
        return handleActionError(error, context, "Get Site List");
      }
    },
  },
  get_all_alert_list: {
    id: "get_all_alert_list",
    name: "Get All Alerts",
    title: "Retrieve All Alerts",
    subtitle: "Fetch the complete list of alerts from SuperOps.",
    description: "Retrieve All Alerts",
    display_priority: 1,
    help: "Use this action to fetch the entire list of alerts from SuperOps. This is helpful for syncing alert data, auditing monitoring systems, or analyzing alert volume.",

    deprecated: false,
    has_config_fields: false,
    config_fields: { fields: async () => [] },
    retry_on_response: [],
    retry_on_request: [],
    max_retries: 0,
    batch_size: 0,
    cursor_enabled: true,

    input_schema: {
      fields: async (context: AppContext): Promise<any> => {
        return [
          {
            name: "type",
            label: "Type",
            control_type: "select",
            type: "string",
            pick_list: [{ label: "Alert", value: "Alert" }],
            optional: false,
            hint: "Enter Type.",
          },
        ];
      },
    },

    output_schema: {
      fields: async (context: AppContext): Promise<any> => {
        const finalData = {
          allAlertList: "test",
          totalAlert: "total",
        };
        const schema = flattenAndGenerateSchema(finalData);
        return schema;
      },
    },

    sample: { fields: async () => [] },

    execute: async (context: AppContext): Promise<ExecutionPayload> => {
      try {
        const { items, total } = await pollAlerts(context);

        return {
          statusCode: 200,
          data: {
            allAlertList: JSON.stringify(items),
            totalAlert: total,
          },
        };
      } catch (error: any) {
        return handleActionError(error, context, "Poll Alerts");
      }
    },
  },

  //Create
  create_task: {
    id: "create_task",
    name: "Create Task",
    title: "Create a New Task",
    subtitle:
      "Create a task and assign technicians, groups, and schedule details.",
    description: "Creates a new task in SuperOps.",
    display_priority: 1,
    help: "Use this action to create tasks related to TICKET or PROJECT modules with complete scheduling and technician details.",
    deprecated: false,
    batch: false,
    bulk: false,
    has_config_fields: false,

    // ------------------------------------------------------------
    // 💡 INPUT SCHEMA (Version 3)
    // ------------------------------------------------------------
    input_schema: {
      fields: async (context: AppContext): Promise<any[]> => {
        const techOptions = await getTechnicians(context);

        const groupOptions = await getTechnicianGroups(context);

        return [
          {
            name: "title",
            label: "Title",
            type: "string",
            optional: false,
            control_type: "text",
            hint: "Enter Title.",
          },
          {
            name: "workId",
            label: "Work ID",
            type: "string",
            optional: false,
            control_type: "text",
            hint: "Enter Work ID.",
          },
          {
            name: "module",
            label: "Work Module",
            type: "string",
            control_type: "select",
            pick_list: [
              { label: "TICKET", value: "TICKET" },
              { label: "PROJECT", value: "PROJECT" },
            ],
            optional: false,
            hint: "Enter Work Module.",
          },
          {
            name: "description",
            label: "Description",
            type: "string",
            optional: true,
            control_type: "text",
            hint: "Enter Description.",
          },
          {
            name: "status",
            label: "Status",
            type: "string",
            control_type: "select",
            pick_list: [
              { label: "PLANNED", value: "PLANNED" },
              { label: "BLOCKED", value: "BLOCKED" },
              { label: "COMPLETED", value: "COMPLETED" },
              { label: "IN PROGRESS", value: "IN PROGRESS" },
              { label: "CANCELLED", value: "CANCELLED" },
              { label: "DELETED", value: "DELETED" },
            ],
            optional: false,
            hint: "Enter Status.",
          },
          {
            name: "estimatedTime",
            label: "Estimated Time",
            type: "string",
            optional: true,
            control_type: "text",
            hint: "Enter Estimated Time.",
          },
          {
            name: "scheduledStartDate",
            label: "Scheduled Start Date",
            type: "string",
            optional: true,
            control_type: "text",
            hint: "Enter Scheduled Start Date.",
          },
          {
            name: "dueDate",
            label: "Due Date",
            type: "string",
            optional: true,
            control_type: "text",
            hint: "Enter Due Date.",
          },
          {
            name: "userId",
            label: "Technician ID",
            type: "string",
            control_type: "select",
            pick_list: techOptions,
            optional: true,
            hint: "Enter Technician ID.",
          },
          {
            name: "groupId",
            label: "Technician Group",
            type: "string",
            control_type: "select",
            pick_list: groupOptions,
            optional: true,
            hint: "Enter Technician Group.",
          },
        ];
      },
    },

    // ------------------------------------------------------------
    // 🧠 OUTPUT SCHEMA (Version 3)
    // ------------------------------------------------------------
    output_schema: {
      fields: async (context: AppContext): Promise<any> => {
        const variables = {
          input: {
            page: 1,
            pageSize: 50,
            sort: [{ attribute: "createdTime", order: "DESC" }],
            condition: null,
          },
        };

        const Response = await getSuperOpsOutputSchema(
          context,
          "getTaskList",
          variables,
        );
        const data = Response?.tasks;
        if (data.length == 0) {
          throw new Error(
            `No tasks found. Cannot generate schema without sample data.`,
          );
        }
        const mergedData = Array.isArray(data) ? deepMergeAll(data) : data;
        const schema = flattenAndGenerateSchema(mergedData);
        return schema;
      },
    },

    // ------------------------------------------------------------
    // 🚀 EXECUTE (Version 3)
    // ------------------------------------------------------------
    execute: async (context: AppContext): Promise<ExecutionPayload> => {
      try {
        const data: any = context?.payload?.data;
        const payload: any = {
          title: data?.title,
          description: data?.description,
          status: data?.status,
          estimatedTime: data?.estimatedTime,
          scheduledStartDate: data?.scheduledStartDate,
          dueDate: data?.dueDate,
          technician: data?.userId ? { userId: data?.userId } : undefined,
          techGroup: data?.groupId ? { groupId: data?.groupId } : undefined,
          workItem:
            data?.workId || data?.module
              ? {
                  workId: data?.workId,
                  module: data?.module,
                }
              : undefined,
        };

        Object.keys(payload).forEach((k) => {
          if (payload[k] === "" || payload[k] === undefined) delete payload[k];
        });

        // Clean nested workItem safely
        if (payload.workItem) {
          Object.keys(payload.workItem).forEach((k) => {
            if (
              payload.workItem[k] === "" ||
              payload.workItem[k] === undefined
            ) {
              delete payload.workItem[k];
            }
          });

          // Remove entire workItem if it becomes empty
          if (Object.keys(payload.workItem).length === 0) {
            delete payload.workItem;
          }
        }
        const result: any = await makeSuperOpsRequest(context, "createTask", {
          input: payload,
        });

        if (result?.data?.error || result?.data?.errors) {
          const status =
            result.statusCode && result.statusCode !== 200
              ? result.statusCode // return API status like 401, 403, 500
              : 400; // fallback for validations inside 200
          return {
            statusCode: status,
            data: { error: result.data.error || result.data.errors },
          };
        }
        return {
          statusCode: 200,
          data: {
            ...result?.data?.createTask,
          },
        };
      } catch (err: any) {
        return handleActionError(err, context, "Create Task");
      }
    },
  }, //done
  create_ticket_note: {
    id: "create_ticket_note",
    name: "Create Ticket Note",
    title: "Create Ticket Note",
    subtitle: "Add a new note to an existing ticket.",
    description: "Creates a new note on a ticket.",
    display_priority: 1,
    help: "Use this action to add public or private notes to a ticket. Useful for logging updates, communication, or internal remarks.",
    deprecated: false,
    batch: false,
    bulk: false,
    has_config_fields: false,

    // ------------------------------------------------------------
    // 💡 INPUT SCHEMA (Version 3)
    // ------------------------------------------------------------
    input_schema: {
      fields: async (context: AppContext): Promise<any[]> => {
        const techOptions = await getTechnicians(context);

        return [
          {
            name: "ticketId",
            label: "Ticket ID",
            type: "string",
            optional: false,
            control_type: "text",
            hint: "Enter Ticket ID.",
          },
          {
            name: "content",
            label: "Content",
            type: "string",
            optional: false,
            control_type: "text",
            hint: "Enter Content.",
          },
          {
            name: "userId",
            label: "Added By (Technician ID)",
            type: "string",
            control_type: "select",
            pick_list: techOptions,
            optional: true,
            hint: "Enter Added By (Technician ID).",
          },
          {
            name: "addedOn",
            label: "Added On",
            type: "string",
            optional: true,
            control_type: "text",
            hint: "Enter Added On.",
          },
          {
            name: "privacyType",
            label: "Privacy Type",
            type: "string",
            control_type: "select",
            pick_list: [
              { label: "PUBLIC", value: "PUBLIC" },
              { label: "PRIVATE", value: "PRIVATE" },
            ],
            optional: true,
            hint: "Enter Privacy Type.",
          },
        ];
      },
    },

    // ------------------------------------------------------------
    // 🧠 OUTPUT SCHEMA (Version 3)
    // ------------------------------------------------------------
    output_schema: {
      fields: async (context: AppContext): Promise<any[]> => {
        const sample = {
          noteId: "4",
          addedBy: { userId: "7928838372746166271", name: "Clovis Sonsimps" },
          addedOn: "2022-06-30T10:10:15",
          content:
            "I cannot access my internet! I'm not sure what's happening!",
          attachments: {
            fileName: "acme.pdf",
            originalFileName: "acme.pdf",
            fileSize: "20485",
          },
          privacyType: "PUBLIC",
        };

        const schema = flattenAndGenerateSchema(sample);
        return schema;
      },
    },

    // ------------------------------------------------------------
    // 🚀 EXECUTE (Version 3)
    // ------------------------------------------------------------
    execute: async (context: AppContext): Promise<ExecutionPayload> => {
      try {
        const data: any = context?.payload?.data;

        // Build payload
        let payload: any = {
          ticket: data?.ticketId ? { ticketId: data?.ticketId } : undefined,
          content: data?.content,
          addedBy: data?.userId ? { userId: data?.userId } : undefined,
          addedOn: data?.addedOn,
          privacyType: data?.privacyType,
        };

        // Clean nested + root keys
        payload = cleanNestedObject(payload);

        // Call SuperOps API
        const result: any = await makeSuperOpsRequest(
          context,
          "createTicketNote",
          {
            input: payload,
          },
        );

        // Handle errors with V3 logic
        if (result?.data?.error || result?.data?.errors) {
          const status =
            result.statusCode && result.statusCode !== 200
              ? result.statusCode
              : 400;

          return {
            statusCode: status,
            data: { error: result.data.error || result.data.errors },
          };
        }

        // Success
        return {
          statusCode: 200,
          data: {
            ...result?.data?.createTicketNote,
          },
        };
      } catch (err: any) {
        return handleActionError(err, context, "Create Ticket Note");
      }
    },
  }, //done

  create_service_item: {
    id: "create_service_item",
    name: "Create Service Item",
    title: "Create Service Catalog Item",
    subtitle: "Create a new service catalog item in SuperOps.",
    description: "Creates a new service item in SuperOps,",
    display_priority: 1,
    help: "Use this action to create a new service catalog item and assign it to a category.",
    deprecated: false,
    batch: false,
    bulk: false,
    has_config_fields: false,

    // ------------------------------------------------------------
    // 💡 INPUT SCHEMA (Version 3)
    // ------------------------------------------------------------
    input_schema: {
      fields: async (context: AppContext): Promise<any[]> => {
        const catOptions = await getServiceCategories(context);

        return [
          {
            name: "name",
            label: "Name",
            type: "string",
            optional: false,
            control_type: "text",
            hint: "Enter Name.",
          },
          {
            name: "description",
            label: "Description",
            type: "string",
            optional: true,
            control_type: "text",
            hint: "Enter Description.",
          },
          {
            name: "categoryId",
            label: "Category",
            type: "string",
            control_type: "select",
            pick_list: catOptions,
            optional: false,
            hint: "Enter Category.",
          },
        ];
      },
    },

    // ------------------------------------------------------------
    // 🧠 OUTPUT SCHEMA (Version 3)
    // ------------------------------------------------------------
    output_schema: {
      fields: async (context: AppContext): Promise<any[]> => {
        const variables = {
          input: {
            page: 1,
            pageSize: 50,
            sort: null,
            condition: null,
          },
        };

        const resp = await getSuperOpsOutputSchema(
          context,
          "getServiceItemList",
          variables,
        );
        if (resp?.statusCode >= 400) {
          let error =
            typeof resp?.data?.error === "string"
              ? resp?.data?.error
              : JSON.stringify(resp.data.error);
          throw new Error(error || "unable to retrieve sample data");
        }
        const items = resp?.items;

        if (!items || items?.length === 0) {
          throw new Error("No service items found. Cannot generate schema.");
        }

        const merged = Array.isArray(items) ? deepMergeAll(items) : items;

        return flattenAndGenerateSchema(merged);
      },
    },

    // ------------------------------------------------------------
    // 🚀 EXECUTE (Version 3)
    // ------------------------------------------------------------
    execute: async (context: AppContext): Promise<ExecutionPayload> => {
      try {
        const data = context?.payload?.data;

        let payload: any = {
          name: data?.name,
          description: data?.description,
          category: data?.categoryId
            ? { categoryId: data?.categoryId }
            : undefined,
        };

        payload = cleanNestedObject(payload);

        const result: any = await makeSuperOpsRequest(
          context,
          "createServiceItem",
          {
            input: payload,
          },
        );

        // ---------------------------------------
        // 🛑 Unified Error Handling Block
        // ---------------------------------------
        if (
          result?.data?.error ||
          result?.data?.errors ||
          result?.data?.data === null
        ) {
          const statusCode =
            result.statusCode && result.statusCode !== 200
              ? result.statusCode
              : 400;

          return {
            statusCode,
            data: { error: result.data.error || result.data.errors },
          };
        }

        // ---------------------------------------
        // ✅ Successful Response
        // ---------------------------------------
        return {
          statusCode: 200,
          data: {
            ...result?.data?.createServiceItem,
          },
        };
      } catch (err: any) {
        return handleActionError(err, context, "Create Service Item");
      }
    },
  }, //done

  create_ticket: {
    id: "create_ticket",
    name: "Create Ticket",
    title: "Readable Title for UI",
    subtitle: "Short subtitle explaining the action",
    description: "Create a Ticket in SuperOps.",
    display_priority: 1,
    help: "Help text shown in UI explaining the use case.",
    deprecated: false,
    batch: false,
    bulk: false,
    has_config_fields: false,

    input_schema: {
      fields: async (context: AppContext): Promise<any[]> => {
        // -----------------------------------------------------
        // 1️⃣ FETCH ALL TICKET METADATA FIELDS (DEFAULT + CUSTOM)
        // -----------------------------------------------------
        const allFieldsResp: any = await makeSuperOpsRequest(
          context,
          "getAllFields",
          {
            input: "TICKET",
          },
        );

        const allFields = allFieldsResp?.data?.getAllFields || [];

        // -----------------------------------------------------
        // 2️⃣ MAP DYNAMIC METADATA FIELDS
        // -----------------------------------------------------
        const dynamicCustomFields = allFields.map((field: any) => {
          const isCustom = field.fieldCategory === "CUSTOM";

          const options = field.options?.map((opt: any) => ({
            label: opt.value,
            value: opt.value,
          }));

          let name = isCustom ? `custom_${field.columnName}` : field.columnName;
          let label = field.label;
          let pick_list = options;

          if (field.columnName === "ticketType") {
            name = "requestType";
            label = "Request Type";
          }

          return {
            name,
            label,
            type: "string",
            control_type: pick_list?.length ? "select" : "text",
            optional: !field.mandatoryOnCreate,
            ...(pick_list?.length && { pick_list }),
          };
        });

        // -----------------------------------------------------
        // 3️⃣ STATIC FIELD LOOKUPS (SITE, DEPARTMENT, USER, TECH…)

        const site: any[] = await getSiteList(context);
        const siteOptions = site?.map((t) => ({ label: t.name, value: t.id }));

        // --- Departments ---
        const department: any[] = await getDepartmentList(context);
        const departmentOptions = department?.map((t) => ({
          label: t.name,
          value: t.id,
        }));

        // --- Users ---
        const user: any[] = await getUserList(context);
        const userOptions = user?.map((t) => ({ label: t.name, value: t.id }));

        // --- Technicians (already pre-processed in helper) ---
        const techOptions = await getTechnicians(context);

        // --- Technician Groups (already pre-processed in helper) ---
        const groupOptions = await getTechnicianGroups(context);

        // --- SLA ---
        const sla: any[] = await getSLAList(context);
        const slaOptions = sla?.map((s) => ({ label: s.name, value: s.id }));

        // --- Assets (Monitored + Unmonitored) ---
        const assets: any[] = await getAssetList(context);
        const unAssets: any[] = await getUnMonitoredAssetList(context);

        const assetOptions = [
          ...(assets?.map((a: any) => ({
            label: a.name,
            value: a.assetId,
          })) || []),

          ...(unAssets?.map((a: any) => ({
            label: a.name,
            value: a.assetId,
          })) || []),
        ];

        // -----------------------------------------------------
        // 4️⃣ STATIC FIELDS (NORMAL)
        // -----------------------------------------------------
        const staticFields = [
          {
            name: "subject",
            label: "Subject",
            type: "string",
            optional: false,
            control_type: "text",
            hint: "Enter Subject.",
          },

          {
            name: "description",
            label: "Description",
            type: "string",
            optional: true,
            control_type: "text",
            hint: "Enter Description.",
          },

          {
            name: "siteId",
            label: "Site ID",
            type: "string",
            control_type: "select",
            pick_list: siteOptions,
            optional: true,
            hint: "Enter Site ID.",
          },
          {
            name: "departmentId",
            label: "Department ID",
            type: "string",
            control_type: "select",
            pick_list: departmentOptions,
            optional: true,
            hint: "Enter Department ID.",
          },
          {
            name: "requesterid",
            label: "Requester ID",
            type: "string",
            control_type: "select",
            pick_list: userOptions,
            optional: true,
            hint: "Enter Requester ID.",
          },
          {
            name: "technicianid",
            label: "Technician ID",
            type: "string",
            control_type: "select",
            pick_list: techOptions,
            optional: true,
            hint: "Enter Technician ID.",
          },
          {
            name: "techGroup",
            label: "Technician Group ID",
            type: "string",
            control_type: "select",
            pick_list: groupOptions,
            optional: true,
            hint: "Enter Technician Group ID.",
          },

          {
            name: "source",
            label: "Source",
            type: "string",
            control_type: "select",
            pick_list: [
              { label: "FORM", value: "FORM" },
              { label: "AGENT", value: "AGENT" },
              { label: "EMAIL", value: "EMAIL" },
              { label: "AI", value: "AI" },
              { label: "PHONE", value: "PHONE" },
              { label: "INTEGRATION", value: "INTEGRATION" },
            ],
            optional: false,
            hint: "Enter Source.",
          },

          {
            name: "slaid",
            label: "SLA",
            type: "string",
            control_type: "select",
            pick_list: slaOptions,
            optional: true,
            hint: "Enter SLA.",
          },

          {
            name: "addAdditionalRequester",
            label: "Add Additional Requester",
            type: "array",
            control_type: "multiselect",
            pick_list: userOptions,
            optional: true,
            hint: "Enter Add Additional Requester.",
          },
          {
            name: "addFollowers",
            label: "Add Followers",
            type: "array",
            control_type: "multiselect",
            pick_list: techOptions,
            optional: true,
            hint: "Enter Add Followers.",
          },

          {
            name: "createdTime",
            label: "Created Time",
            type: "string",
            optional: true,
            control_type: "text",
            hint: "Enter Created Time.",
          },
          {
            name: "updatedTime",
            label: "Updated Time",
            type: "string",
            optional: true,
            control_type: "text",
            hint: "Enter Updated Time.",
          },
          {
            name: "subSource",
            label: "Sub Source",
            type: "string",
            optional: true,
            control_type: "text",
            hint: "Enter Sub Source.",
          },
          {
            name: "sourceReferenceId",
            label: "Source Reference ID",
            type: "string",
            optional: true,
            control_type: "text",
            hint: "Enter Source Reference ID.",
          },

          {
            name: "addAssets",
            label: "Add Assets",
            type: "array",
            control_type: "multiselect",
            pick_list: assetOptions,
            optional: true,
            hint: "Enter Add Assets.",
          },

          {
            name: "suppressCloseNotification",
            label: "Suppress Close Notification",
            type: "string",
            control_type: "select",
            pick_list: [
              { label: "True", value: "true" },
              { label: "False", value: "false" },
            ],
            optional: true,
            hint: "Enter Suppress Close Notification.",
          },

          {
            name: "firstResponseTime",
            label: "First Response Time",
            type: "string",
            optional: true,
            control_type: "text",
            hint: "Enter First Response Time.",
          },

          {
            name: "resolutionTime",
            label: "Resolution Time",
            type: "string",
            optional: true,
            control_type: "text",
            hint: "Enter Resolution Time.",
          },
        ];

        // -----------------------------------------------------
        // 5️⃣ FINAL SCHEMA (STATIC + CUSTOM)
        // -----------------------------------------------------
        return [...staticFields, ...dynamicCustomFields];
      },
    },

    output_schema: {
      fields: async (context: AppContext): Promise<any> => {
        const variables = {
          input: {
            page: 1,
            pageSize: 50,
            sort: [{ attribute: "createdTime", order: "DESC" }],
            condition: null,
          },
        };

        const ticketDetails = await getSuperOpsOutputSchema(
          context,
          "getTicketList",
          variables,
        );
        if (ticketDetails?.statusCode >= 400) {
          let error =
            typeof ticketDetails?.data?.error === "string"
              ? ticketDetails?.data?.error
              : JSON.stringify(ticketDetails.data.error);
          throw new Error(error || "unable to retrieve sample data");
        }
        const data = ticketDetails?.tickets;
        if (data.length == 0) {
          throw new Error(
            `No tickets found. Cannot generate schema without sample data. `,
          );
        }
        const mergedData = Array.isArray(data) ? deepMergeAll(data) : data;
        const schema = flattenAndGenerateSchema(mergedData);

        return schema;
      },
    },

    execute: async (context: AppContext): Promise<ExecutionPayload> => {
      try {
        const data: any = context?.payload?.data;

        const addAdditionalRequester = data?.addAdditionalRequester
          ? await buildUserIdArray(data?.addAdditionalRequester)
          : [];

        const addFollowers = data?.addFollowers
          ? await buildUserIdArray(data?.addFollowers)
          : [];

        const addAssets = data?.addAssets
          ? await buildassetid(data?.addAssets)
          : [];

        // -----------------------------------------------------
        // 2️⃣ FETCH ALL DEFAULT + CUSTOM FIELDS
        // -----------------------------------------------------
        const allFieldsResp: any = await makeSuperOpsRequest(
          context,
          "getAllFields",
          {
            input: "TICKET",
          },
        );

        const allFields = allFieldsResp?.data?.getAllFields || [];

        const customFields: Record<string, any> = {};
        const dynamicTopLevelFields: Record<string, any> = {};

        // -----------------------------------------------------
        // 3️⃣ MAP EVENT DATA TO SUPEROPS FIELDS
        // -----------------------------------------------------
        for (const field of allFields) {
          const key =
            field.fieldCategory === "CUSTOM"
              ? `custom_${field.columnName}`
              : field.columnName;

          if (data[key] === undefined) continue;

          let value = data[key];

          switch (field.fieldType.toUpperCase()) {
            case "MULTISELECT":
            case "CHECKBOX":
              value =
                typeof value === "string"
                  ? value.split(",").map((v) => v.trim())
                  : Array.isArray(value)
                    ? value.map(String)
                    : [];
              break;

            default:
              value = String(value);
          }

          if (field.fieldCategory === "CUSTOM") {
            customFields[field.columnName] = value;
          } else {
            if (field.columnName === "ticketType") {
              dynamicTopLevelFields["requestType"] = value;
            } else {
              dynamicTopLevelFields[field.columnName] = value;
            }
          }
        }

        // -----------------------------------------------------
        // 4️⃣ BUILD FINAL PAYLOAD
        // -----------------------------------------------------
        const payload: any = {
          subject: data?.subject,
          description: data?.description,
          site: data?.siteId ? { id: data?.siteId } : undefined,
          requester: data?.requesterid
            ? { userId: data?.requesterid }
            : undefined,
          department: data?.departmentId
            ? { departmentId: data?.departmentId }
            : undefined,
          techGroup: data?.techGroup ? { groupId: data?.techGroup } : undefined,
          technician: data?.technicianid
            ? { userId: data?.technicianid }
            : undefined,

          addAdditionalRequester,
          addFollowers,
          addAssets,

          customFields,

          // Required fields
          source: data?.source,
          priority: data?.priority,
          impact: data?.impact,
          urgency: data?.urgency,
          status: data?.status,
          requestType: data?.requestType,
          category: data?.category,
          subcategory: data?.subcategory,
          cause: data?.cause,
          subcause: data?.subcause,
          resolutionCode: data?.resolutionCode,

          // Dynamic fields
          ...dynamicTopLevelFields,

          // Other optional fields
          createdTime: data?.createdTime,
          updatedTime: data?.updatedTime,
          subSource: data?.subSource,
          sourceReferenceId: data?.sourceReferenceId,
          suppressCloseNotification: data?.suppressCloseNotification === "true",
          firstResponseTime: data?.firstResponseTime,
          resolutionTime: data?.resolutionTime,
          sla: data?.slaid ? { id: data?.slaid } : undefined,
        };

        // -----------------------------------------------------
        // 5️⃣ CLEAN EMPTY FIELDS
        // -----------------------------------------------------
        const cleanedPayload = await cleanNestedObject(payload);

        // -----------------------------------------------------
        // 6️⃣ SEND CREATE MUTATION
        // -----------------------------------------------------

        const result: any = await makeSuperOpsRequest(context, "createTicket", {
          input: cleanedPayload,
        });

        // -----------------------------------------------------
        // 7️⃣ HANDLE ERRORS
        // -----------------------------------------------------
        if (result?.data?.error || result?.data?.errors) {
          const status =
            result.statusCode && result.statusCode !== 200
              ? result.statusCode
              : 400;

          return {
            statusCode: status,
            data: { error: result.data.error || result.data.errors },
          };
        }

        // -----------------------------------------------------
        // 8️⃣ SUCCESS RESPONSE
        // -----------------------------------------------------
        return {
          statusCode: 200,
          data: {
            ...result?.data?.createTicket,
          },
        };
      } catch (err: any) {
        return handleActionError(err, context, "Create Ticket");
      }
    },
  },
  update_ticket: {
    id: "update_ticket",
    name: "Update Ticket",
    title: "Update an Existing Ticket",
    subtitle: "Modify fields of an existing ticket in SuperOps",
    description: "Update a ticket in SuperOps",
    display_priority: 1,
    help: "Provide the Ticket ID and the fields you want to update.",

    deprecated: false,
    batch: false,
    bulk: false,
    has_config_fields: false,

    input_schema: {
      fields: async (context: AppContext): Promise<any[]> => {
        // -----------------------------------------------------
        // 1️⃣ FETCH ALL TICKET METADATA (DEFAULT + CUSTOM)
        // -----------------------------------------------------
        const allFieldsResp: any = await makeSuperOpsRequest(
          context,
          "getAllFields",
          {
            input: "TICKET",
          },
        );

        const allFields = allFieldsResp?.data?.getAllFields || [];

        // -----------------------------------------------------
        // 2️⃣ DYNAMIC FIELDS (CUSTOM + DEFAULT)
        // -----------------------------------------------------
        const dynamicCustomFields = allFields?.map((field: any) => {
          const isCustom = field.fieldCategory === "CUSTOM";

          const options =
            field.options?.map((opt: any) => ({
              label: opt.value,
              value: opt.value,
            })) || undefined;

          let name = isCustom ? `custom_${field.columnName}` : field.columnName;
          let label = field.label;

          // Override: ticketType → requestType
          if (field.columnName === "ticketType") {
            name = "requestType";
            label = "Request Type";
          }
          return {
            name,
            label,
            type: "string",
            control_type: options.length ? "select" : "text",
            optional: true,
            ...(options.length && { pick_list: options }),
          };
        });

        // -----------------------------------------------------
        // 3️⃣ STATIC DROPDOWNS
        // -----------------------------------------------------
        const sites = await getSiteList(context);
        const siteOptions = sites?.map((s) => ({ label: s.name, value: s.id }));

        const departments = await getDepartmentList(context);
        const departmentOptions = departments?.map((d) => ({
          label: d.name,
          value: d.id,
        }));

        const users = await getUserList(context);
        const userOptions = users?.map((u) => ({ label: u.name, value: u.id }));

        const techOptions = await getTechnicians(context);
        const groupOptions = await getTechnicianGroups(context);

        // const slas = await getSLAList(context);
        // const slaOptions = slas.map((s) => ({ label: s.name, value: s.id }));

        // const assets = await getAssetList(context);
        // const unAssets = await getUnMonitoredAssetList(context);

        // const assetOptions = [
        //   ...assets.map((a) => ({ label: a.name, value: a.assetId })),
        //   ...unAssets.map((a) => ({ label: a.name, value: a.assetId })),
        // ];

        // -----------------------------------------------------
        // 4️⃣ STATIC FIELDS (UPDATE)
        // -----------------------------------------------------
        const staticFields = [
          {
            name: "ticketId",
            label: "Ticket ID",
            type: "string",
            optional: false,
            control_type: "text",
            hint: "Enter Ticket ID.",
          },

          {
            name: "subject",
            label: "Subject",
            type: "string",
            optional: true,
            control_type: "text",
            hint: "Enter Subject.",
          },

          {
            name: "siteId",
            label: "Site",
            type: "string",
            control_type: "select",
            pick_list: siteOptions,
            optional: true,
            hint: "Enter Site.",
          },

          {
            name: "departmentId",
            label: "Department",
            type: "string",
            control_type: "select",
            pick_list: departmentOptions,
            optional: true,
            hint: "Enter Department.",
          },

          {
            name: "requesterid",
            label: "Requester",
            type: "string",
            control_type: "select",
            pick_list: userOptions,
            optional: true,
            hint: "Enter Requester.",
          },

          {
            name: "technicianid",
            label: "Technician",
            type: "string",
            control_type: "select",
            pick_list: techOptions,
            optional: true,
            hint: "Enter Technician.",
          },

          {
            name: "techGroup",
            label: "Technician Group",
            type: "string",
            control_type: "select",
            pick_list: groupOptions,
            optional: true,
            hint: "Enter Technician Group.",
          },

          {
            name: "source",
            label: "Source",
            type: "string",
            control_type: "select",
            pick_list: [
              { label: "FORM", value: "FORM" },
              { label: "AGENT", value: "AGENT" },
              { label: "EMAIL", value: "EMAIL" },
              { label: "AI", value: "AI" },
              { label: "PHONE", value: "PHONE" },
              { label: "INTEGRATION", value: "INTEGRATION" },
            ],
            optional: true,
            hint: "Enter Source.",
          },

          // ---------------- MULTI SELECT OPERATIONS ----------------
          {
            name: "addAdditionalRequester",
            label: "Add Additional Requester",
            type: "array",
            control_type: "multiselect",
            pick_list: userOptions,
            optional: true,
            hint: "Enter Add Additional Requester.",
          },
          {
            name: "addFollowers",
            label: "Add Followers",
            type: "array",
            control_type: "multiselect",
            pick_list: techOptions,
            optional: true,
            hint: "Enter Add Followers.",
          },
          {
            name: "deleteAdditionalRequester",
            label: "Delete Additional Requester",
            type: "array",
            control_type: "multiselect",
            pick_list: userOptions,
            optional: true,
            hint: "Enter Delete Additional Requester.",
          },
          {
            name: "deleteFollowers",
            label: "Delete Followers",
            type: "array",
            control_type: "multiselect",
            pick_list: techOptions,
            optional: true,
            hint: "Enter Delete Followers.",
          },

          // ---------------- MISC FIELDS ----------------
          {
            name: "suppressCloseNotification",
            label: "Suppress Close Notification",
            type: "string",
            control_type: "select",
            pick_list: [
              { label: "True", value: "true" },
              { label: "False", value: "false" },
            ],
            optional: true,
            hint: "Enter Suppress Close Notification.",
          },

          {
            name: "firstResponseTime",
            label: "First Response Time",
            type: "string",
            optional: true,
            control_type: "text",
            hint: "Enter First Response Time.",
          },

          {
            name: "resolutionTime",
            label: "Resolution Time",
            type: "string",
            optional: true,
            control_type: "text",
            hint: "Enter Resolution Time.",
          },
        ];

        // -----------------------------------------------------
        // 5️⃣ FINAL MERGED SCHEMA
        // -----------------------------------------------------
        return [...staticFields, ...dynamicCustomFields];
      },
    },
    output_schema: {
      fields: async (context: AppContext): Promise<any> => {
        const variables = {
          input: {
            page: 1,
            pageSize: 50,
            sort: [{ attribute: "createdTime", order: "DESC" }],
            condition: null,
          },
        };

        const ticketDetails = await getSuperOpsOutputSchema(
          context,
          "getTicketList",
          variables,
        );
        if (ticketDetails?.statusCode >= 400) {
          let error =
            typeof ticketDetails?.data?.error === "string"
              ? ticketDetails?.data?.error
              : JSON.stringify(ticketDetails.data.error);
          throw new Error(error || "unable to retrieve sample data");
        }
        const data = ticketDetails?.tickets;
        if (data.length == 0) {
          throw new Error(
            `No tickets found. Cannot generate schema without sample data. `,
          );
        }
        const mergedData = Array.isArray(data) ? deepMergeAll(data) : data;
        const schema = flattenAndGenerateSchema(mergedData);

        return schema;
      },
    },

    execute: async (context: AppContext): Promise<ExecutionPayload> => {
      try {
        const data: any = context?.payload?.data;

        if (
          !data?.ticketId ||
          data?.ticketId === "null" ||
          data?.ticketId === ""
        ) {
          return {
            statusCode: 400,
            data: { error: "Ticket ID is required to update a ticket" },
          };
        }

        const addAdditionalRequester = data?.addAdditionalRequester
          ? await buildUserIdArray(data?.addAdditionalRequester)
          : [];

        const deleteAdditionalRequester = data?.deleteAdditionalRequester
          ? await buildUserIdArray(data?.deleteAdditionalRequester)
          : [];

        const addFollowers = data?.addFollowers
          ? await buildUserIdArray(data?.addFollowers)
          : [];

        const deleteFollowers = data?.deleteFollowers
          ? await buildUserIdArray(data?.deleteFollowers)
          : [];

        // const addAssets = data.addAssets
        //   ? await buildassetid(data.addAssets)
        //   : [];
        //  const addAssets = data.addAssets ? await buildassetid(data.addAssets) : [];

        const allFieldsResp: any = await makeSuperOpsRequest(
          context,
          "getAllFields",
          {
            input: "TICKET",
          },
        );

        const allFields = allFieldsResp?.data?.getAllFields || [];

        const customFields: Record<string, any> = {};
        const dynamicTopLevelFields: Record<string, any> = {};

        for (const field of allFields) {
          const key =
            field.fieldCategory === "CUSTOM"
              ? `custom_${field.columnName}`
              : field.columnName;

          if (data[key] === undefined) continue;

          let value = data[key];

          // Convert based on SuperOps field type
          switch (field.fieldType.toUpperCase()) {
            case "MULTISELECT":
            case "CHECKBOX":
              value =
                typeof value === "string"
                  ? value.split(",").map((v) => v.trim())
                  : Array.isArray(value)
                    ? value.map(String)
                    : [];
              break;

            default:
              value = String(value);
          }

          if (field.fieldCategory === "CUSTOM") {
            customFields[field.columnName] = value;
          } else {
            if (field.columnName === "ticketType") {
              dynamicTopLevelFields["requestType"] = value;
            } else {
              dynamicTopLevelFields[field.columnName] = value;
            }
          }
        }

        const payload: any = {
          // Required
          ticketId: data?.ticketId,
          subject: data?.subject,

          // Standard Fields
          site: data?.siteId ? { id: data.siteId } : undefined,
          requester: data?.requesterid
            ? { userId: data?.requesterid }
            : undefined,
          department: data?.departmentId
            ? { departmentId: data?.departmentId }
            : undefined,
          techGroup: data?.techGroup ? { groupId: data?.techGroup } : undefined,
          technician: data?.technicianid
            ? { userId: data?.technicianid }
            : undefined,

          // Multi-value operations
          addAdditionalRequester,
          deleteAdditionalRequester,
          addFollowers,
          deleteFollowers,
          // addAssets,

          customFields,

          // Required metadata fields
          source: data?.source,
          priority: data?.priority,
          impact: data?.impact,
          urgency: data?.urgency,
          status: data?.status,
          requestType: data?.requestType,
          category: data?.category,
          subcategory: data?.subcategory,
          cause: data?.cause,
          subcause: data?.subcause,
          resolutionCode: data?.resolutionCode,

          // Dynamic fields from metadata
          ...dynamicTopLevelFields,

          // Optional fields
          suppressCloseNotification: data?.suppressCloseNotification === "true",
          firstResponseTime: data?.firstResponseTime,
          resolutionTime: data?.resolutionTime,
        };

        const cleanedPayload = await cleanNestedObject(payload);

        const result: any = await makeSuperOpsRequest(context, "updateTicket", {
          input: cleanedPayload,
        });

        if (result?.data?.error || result?.data?.errors) {
          const status =
            result.statusCode && result.statusCode !== 200
              ? result.statusCode
              : 400;

          return {
            statusCode: status,
            data: { error: result.data.error || result.data.errors },
          };
        }

        return {
          statusCode: 200,
          data: {
            ...result?.data?.updateTicket,
          },
        };
      } catch (err: any) {
        return handleActionError(err, context, "Update Ticket");
      }
    },
  },
  create_alert: {
    id: "create_alert",
    name: "Create Alert",
    title: "Create Alert",
    subtitle: "Create a new alert in SuperOps.",
    description: "Creates an alert using SuperOps CreateAlertInput.",
    display_priority: 1,
    help: "Provide alert details as separate fields. This action sends { input: CreateAlertInput } to SuperOps.",
    batch: false,
    bulk: false,
    deprecated: false,
    has_config_fields: false,
    config_fields: { fields: async () => [] },
    retry_on_response: [],
    retry_on_request: [],
    max_retries: 0,
    batch_size: 0,
    cursor_enabled: true,

    input_schema: {
      fields: async (context: AppContext): Promise<any[]> => {
        const assets: any[] = await getAssetList(context);
        const unAssets: any[] = await getUnMonitoredAssetList(context);

        const assetOptions = [
          ...(assets?.map((a: any) => ({
            label: a.name,
            value: a.assetId,
          })) || []),
          ...(unAssets?.map((a: any) => ({
            label: a.name,
            value: a.assetId,
          })) || []),
        ];

        return [
          {
            name: "assetId",
            label: "Asset ID",
            type: "string",
            control_type: "select",
            pick_list: assetOptions,
            optional: false,
            hint: "Enter the SuperOps asset ID for this alert.",
          },
          {
            name: "message",
            label: "Message",
            type: "string",
            optional: false,
            control_type: "text-area",
            hint: "Enter alert message (e.g. High CPU Usage).",
          },
          {
            name: "description",
            label: "Description",
            type: "string",
            control_type: "text",
            optional: false,
            hint: "Enter alert description.",
          },
          {
            name: "severity",
            label: "Severity",
            type: "string",
            control_type: "text",
            optional: false,
            hint: "Enter severity (e.g. High).",
          },
        ];
      },
    },

    output_schema: {
      fields: async (context: AppContext): Promise<any> => {
        const variables = {
          input: {
            page: 1,
            pageSize: 50,
            sort: null,
            condition: null,
          },
        };

        const Response = await getSuperOpsOutputSchema(
          context,
          "getAlertList",
          variables,
        );
        if (Response?.statusCode >= 400) {
          let error =
            typeof Response?.data?.error === "string"
              ? Response?.data?.error
              : JSON.stringify(Response.data.error);
          throw new Error(error || "unable to retrieve sample data");
        }
        const data = Response?.alerts;
        if (!data || data.length === 0) {
          throw new Error(
            `No items found. Cannot generate schema without sample data.`,
          );
        }
        const mergedData = Array.isArray(data) ? deepMergeAll(data) : data;
        const schema = flattenAndGenerateSchema(mergedData);
        return [
          ...schema,
          {
            name: "dataFound",
            label: "Data Found",
            type: "boolean",
            control_type: "checkbox",
            optional: true,

            hint: "Enter Data Found",
          },
        ];
      },
    },

    sample: { fields: async () => [] },

    execute: async (context: AppContext): Promise<ExecutionPayload> => {
      try {
        const data: any = context?.payload?.data || {};

        if (
          !data?.assetId ||
          !data?.message ||
          !data?.description ||
          !data?.severity
        ) {
          return {
            statusCode: 400,
            data: {
              error:
                "assetId, message, description, and severity are required.",
            },
          };
        }

        const input: any = {
          assetId: data?.assetId,
          message: data?.message,
          description: data?.description,
          severity: data?.severity,
        };

        const result: any = await makeSuperOpsRequest(context, "createAlert", {
          input,
        });
        if (result?.data?.error || result?.data?.errors) {
          const statusCode =
            result.statusCode && result.statusCode !== 200
              ? result.statusCode
              : 400;
          return {
            statusCode,
            data: { error: result?.data?.error || result?.data?.errors },
          };
        }
        return {
          statusCode: 200,
          data: {
            ...result?.data?.createAlert,
          },
        };
      } catch (err: any) {
        return handleActionError(err, context, "Create Alert");
      }
    },
  },
  resolve_alerts: {
    id: "resolve_alerts",
    name: "Resolve Alerts",
    title: "Resolve Alerts",
    subtitle: "Mark one or more alerts as resolved in SuperOps.",
    description:
      "Resolves a list of alerts by their IDs. Use this to close alerts after remediation.",
    display_priority: 1,
    help: "Use this action to resolve one or more open alerts in SuperOps. Provide a comma-separated list of alert IDs. Useful for automated remediation workflows where you want to close alerts after fixing the underlying issue.",
    batch: false,
    bulk: false,
    deprecated: false,
    has_config_fields: false,
    config_fields: { fields: async () => [] },
    retry_on_response: [],
    retry_on_request: [],
    max_retries: 0,
    batch_size: 0,
    cursor_enabled: true,

    input_schema: {
      fields: async (context: AppContext): Promise<any> => {
        return [
          {
            name: "alertIds",
            label: "Alert IDs",
            type: "string",
            optional: false,
            hint: "Comma-separated alert IDs to resolve (e.g. 'id1,id2,id3')",
            control_type: "text",
          },
        ];
      },
    },

    output_schema: {
      fields: async (context: AppContext): Promise<any> => {
        return [
          {
            name: "success",
            label: "Success",
            type: "boolean",
            control_type: "select",
            pick_list: [
              { label: "True", value: "true" },
              { label: "False", value: "false" },
            ],
            optional: true,
            hint: "Enter Success.",
          },
        ];
      },
    },

    sample: { fields: async () => [] },

    execute: async (context: AppContext): Promise<ExecutionPayload> => {
      try {
        const data: any = context?.payload?.data;

        if (!data?.alertIds || data.alertIds === "") {
          return {
            statusCode: 400,
            data: { error: "At least one Alert ID is required." },
          };
        }

        // Parse comma-separated or JSON array of IDs
        let rawIds: string[] = [];
        const trimmed = String(data.alertIds).trim();

        if (trimmed.startsWith("[")) {
          try {
            rawIds = JSON.parse(trimmed).map((v: any) => String(v).trim());
          } catch {
            rawIds = trimmed
              .replace(/[\[\]"]+/g, "")
              .split(",")
              .map((v) => v.trim())
              .filter(Boolean);
          }
        } else {
          rawIds = trimmed
            .split(",")
            .map((v) => v.trim())
            .filter(Boolean);
        }

        const ids = Array.from(new Set(rawIds));

        // Build input as array of { id } objects — matches [ResolveAlertInput]
        const input = ids.map((id) => ({ id }));

        const result: any = await makeSuperOpsRequest(
          context,
          "resolveAlerts",
          { input },
        );

        if (result?.data?.error || result?.data?.errors) {
          const statusCode =
            result.statusCode && result.statusCode !== 200
              ? result.statusCode
              : 400;
          return {
            statusCode,
            data: { error: result.data.error || result.data.errors },
          };
        }
        return {
          statusCode: 200,
          data: {
            success: result?.data?.resolveAlerts,
          },
        };
      } catch (err: any) {
        return handleActionError(err, context, "Resolve Alerts");
      }
    },
  }, //done
  get_asset_classes: {
    id: "get_asset_classes",
    name: "Get Asset Classes",
    title: "Get Asset Classes",
    subtitle: "Retrieve all asset classes",
    description: "Retrieves all asset classes available in SuperOps.",

    help: "Returns all asset classes available in the account.",

    display_priority: 1,

    batch: false,
    batch_size: 0,
    bulk: false,
    deprecated: false,

    cursor_enabled: false,

    has_config_fields: false,
    has_custom_fields: false,

    config_fields: {
      fields: async () => [],
    },

    pick_lists: {},

    sample: {
      classId: 1,
      name: "Workstation",
      moduleType: "ASSET",
      isNonMonitored: false,
      isSystemGenerated: true,
    },

    input_schema: {
      fields: async () => [
        {
          name: "info",
          label: "Info",
          type: "string",
          optional: true,
          control_type: "text",
        },
      ],
    },

    output_schema: {
      fields: async (context: AppContext) => {
        const variables = {
          listInfo: {
            page: 1,
            pageSize: 50,
            sort: null,
            condition: null,
          },
        };

        const Response = await getSuperOpsOutputSchema(
          context,
          "getAssetClassListV3",
          variables,
        );
        if (Response?.statusCode >= 400) {
          let error =
            typeof Response?.data?.error === "string"
              ? Response?.data?.error
              : JSON.stringify(Response.data.error);
          throw new Error(error || "unable to retrieve sample data");
        }
        const data = Response;
        if (!data || data.length === 0) {
          throw new Error(
            `No items found. Cannot generate schema without sample data.`,
          );
        }

        return context.schemaUtils.generateFlattenedSchema(data);
      },
    },

    execute: async (context: AppContext): Promise<ExecutionPayload> => {
      try {
        const assetClasses = await getAllAssetClasses(context);

        if (!assetClasses || assetClasses.length === 0) {
          return {
            statusCode: 200,
            data: {
              dataFound: false,
            },
          };
        }

        return {
          statusCode: 200,
          data: {
            assetClasses,
            dataFound: true,
          },
        };
      } catch (error: any) {
        return handleActionError(error, context, "Get Asset Classes");
      }
    },

    retry_on_response: [],
    retry_on_request: [],
    max_retries: 0,
  },
  get_asset_class_fields: {
    id: "get_asset_class_fields",
    name: "Get Asset Class Fields",
    title: "Get Asset Class Fields",
    subtitle: "Retrieve fields for an asset class",

    description: "Retrieves all fields available for the selected asset class.",

    help: "Select an asset class and retrieve all supported fields.",

    display_priority: 1,

    batch: false,
    batch_size: 0,
    bulk: false,
    deprecated: false,

    cursor_enabled: false,

    has_config_fields: true,
    has_custom_fields: false,

    config_fields: {
      fields: async (context: AppContext) => {
        const assetClasses = await getAllAssetClasses(context);

        return [
          {
            name: "classId",
            label: "Asset Class",
            type: "string",
            optional: false,
            control_type: "select",

            pick_list: assetClasses.map((item) => ({
              label: item.name,
              value: item.classId,
            })),
          },
        ];
      },
    },

    pick_lists: {},

    sample: {
      fieldKey: "serialNumber",
      fieldLabel: "Serial Number",
      isCustomField: false,
      isKeyField: true,
    },

    input_schema: {
      fields: async (context: AppContext) => [],
    },

    output_schema: {
      fields: async (context: AppContext) => {
        const classId = context.payload.config_fields?.classId;
        if (!classId) {
          throw new Error(
            "ClassId is required for the generation of the output schema",
          );
        }
        const variables = {
          input: {
            classId: Number(classId),
          },
        };

        const Response = await getSuperOpsOutputSchema(
          context,
          "getAssetClassFieldsForIntegration",
          variables,
        );
        if (Response?.statusCode >= 400) {
          let error =
            typeof Response?.data?.error === "string"
              ? Response?.data?.error
              : JSON.stringify(Response.data.error);
          throw new Error(error || "unable to retrieve sample data");
        }
        const data = Response;
        if (!data || data.length === 0) {
          throw new Error(
            `No items found. Cannot generate schema without sample data.`,
          );
        }

        return context.schemaUtils.generateFlattenedSchema(data);
      },
    },

    execute: async (context: AppContext): Promise<ExecutionPayload> => {
      try {
        const { classId }: any = context?.payload?.config_fields;

        if (!classId || classId === "null" || classId === "") {
          return {
            statusCode: 400,
            data: {
              error: "Class ID is required.",
            },
          };
        }

        const result: any = await makeSuperOpsRequest(
          context,
          "getAssetClassFieldsForIntegration",
          {
            input: {
              classId: Number(classId),
            },
          },
        );

        if (result?.data?.getAssetClassFieldsForIntegration === null) {
          return {
            statusCode: 200,
            data: {
              dataFound: false,
            },
          };
        }

        if (result?.data?.error || result?.data?.errors) {
          return {
            statusCode: result?.statusCode || 500,
            data: {
              error:
                result?.data?.error ||
                result?.data?.errors ||
                "Error fetching asset class fields.",
            },
          };
        }

        const payload = result?.data?.getAssetClassFieldsForIntegration;

        const keyFields = payload?.keyFields || [];

        const fields = (payload?.fields || []).map((field: any) => ({
          ...field,
          isKeyField: keyFields.includes(field.fieldKey),
        }));

        return {
          statusCode: 200,
          data: {
            fields,
            dataFound: true,
          },
        };
      } catch (error: any) {
        return handleActionError(error, context, "Get Asset Class Fields");
      }
    },

    retry_on_response: [],
    retry_on_request: [],
    max_retries: 0,
  },
};

const triggerMap: any = {
  new_ticket_created: {
    id: "new_ticket_created",
    name: "New Ticket Created",
    type: "poll",
    title: "New Ticket Created",
    subtitle: "Triggers when a new ticket is created in SuperOps.",
    description:
      "Polls the SuperOps API to detect newly created tickets since the last run.",

    dedup: (record: DataPayload) => record.id as string,

    poll: async (context: AppContext): Promise<PollResponse> => {
      const sinceRaw: any =
        context?.payload?.data?.since ||
        new Date(Date.now() - 5 * 60 * 1000).toISOString();
      const tillRaw: any =
        context?.payload?.data?.till || new Date().toISOString();
      const cleanSince = sinceRaw.replace(/Z$/, "");
      const cleanTill = tillRaw.replace(/Z$/, "");
      const cursor: any = context?.payload?.data?.cursor || {};
      let page = cursor.page || 1;

      const perPageLimit = 100;
      const totalRecordLimit = 1000;
      const allRecords: any[] = [];
      let hasMore = false;
      while (allRecords.length < totalRecordLimit) {
        const variables = {
          input: {
            page,
            pageSize: perPageLimit,
            sort: [{ attribute: "createdTime", order: "DESC" }],
            condition: {
              attribute: "createdTime",
              operator: "after",
              value: cleanSince,
            },
          },
        };

        const response: any = await makeSuperOpsRequest(
          context,
          "getTicketList",
          JSON.stringify(variables),
        );
        const list = response.data?.getTicketList;
        const tickets = list?.tickets || [];
        const listInfo = list?.listInfo || {};

        if (tickets.length === 0) {
          hasMore = false;
          break;
        }

        const filtered = tickets.filter(
          (t: any) => t.createdTime >= cleanSince && t.createdTime <= cleanTill,
        );
        allRecords.push(...filtered);
        if (allRecords.length >= totalRecordLimit) {
          hasMore = !!listInfo.hasMore;
          page++;
          break;
        }

        if (!listInfo.hasMore) {
          hasMore = false;
          break;
        }
        hasMore = true;
        page++;
      }
      return {
        since: cleanSince,
        till: cleanTill,
        hasMore,
        cursor: hasMore ? { page } : {},
        records: allRecords,
      };
    },
    output_schema: {
      fields: async (context: AppContext): Promise<any> => {
        const variables = {
          input: {
            page: 1,
            pageSize: 50,
            sort: [{ attribute: "createdTime", order: "DESC" }],
            condition: null,
          },
        };
        const ticketDetails = await getSuperOpsOutputSchema(
          context,
          "getTicketList",
          variables,
        );
        if (ticketDetails?.statusCode >= 400) {
          let error =
            typeof ticketDetails?.data?.error === "string"
              ? ticketDetails?.data?.error
              : JSON.stringify(ticketDetails.data.error);
          throw new Error(error || "unable to retrieve sample data");
        }
        const data = ticketDetails?.tickets;
        if (data.length == 0) {
          throw new Error(
            `No tickets found. Cannot generate schema without sample data.`,
          );
        }
        const mergedData = Array.isArray(data) ? deepMergeAll(data) : data;
        const schema = flattenAndGenerateSchema(mergedData);
        return schema;
      },
    },
    sample: async (context: AppContext): Promise<any> => {
      const variables = {
        input: {
          page: 1,
          pageSize: 5,
          sort: [{ attribute: "createdTime", order: "DESC" }],
          condition: null,
        },
      };
      const ticketData: any = await makeSuperOpsRequest(
        context,
        "getTicketList",
        variables,
      );
      if (ticketData?.statusCode >= 400) {
        let error =
          typeof ticketData?.data?.error === "string"
            ? ticketData?.data?.error
            : JSON.stringify(ticketData.data.error);
        throw new Error(error || "unable to retrieve sample data");
      }
      const tickets: any = ticketData?.data.getTicketList.tickets || [];
      if (!tickets.length) {
        throw new Error("No Sample Ticket Data Available");
      }
      return flattenObject(tickets[0]);
    },
    has_config_fields: false,
    config_fields: {
      fields: async () => [],
    },
    input_schema: {
      fields: async () => [],
    },
    help: "Use this trigger to start workflows when new tickets are created in SuperOps.",
    display_priority: 0,
    batch: false,
    batch_size: 0,
    bulk: false,
    deprecated: false,
    cursor_enabled: true,
  },
  updated_ticket: {
    id: "updated_ticket",
    name: "Ticket Updated",
    type: "poll",
    title: "Ticket Updated",
    subtitle: "Triggers when a ticket is updated in SuperOps.",
    description:
      "Polls the SuperOps API to detect tickets updated since the last run.",

    // Use ticketId as dedupe field
    dedup: (record: DataPayload) => record.ticketId as string,

    poll: async (context: AppContext): Promise<PollResponse> => {
      const sinceRaw: any =
        context?.payload?.data?.since ||
        new Date(Date.now() - 5 * 60 * 1000).toISOString(); // default: last 5 minutes

      const tillRaw: any =
        context?.payload?.data?.till || new Date().toISOString();

      // clean timestamps (remove trailing Z)
      const cleanSince = sinceRaw.replace(/Z$/, "");
      const cleanTill = tillRaw.replace(/Z$/, "");

      const cursor: any = context?.payload?.data?.cursor || {};
      let page = cursor.page || 1;

      const perPageLimit = 100; // how many to fetch per page
      const totalRecordLimit = 1000; // maximum total to process in one run
      const allRecords: any[] = [];
      let hasMore = false;

      while (allRecords.length < totalRecordLimit) {
        const variables = {
          input: {
            page,
            pageSize: perPageLimit,
            sort: [{ attribute: "updatedTime", order: "DESC" }],
            condition: {
              attribute: "updatedTime",
              operator: "after",
              value: cleanSince,
            },
          },
        };

        const response: any = await makeSuperOpsRequest(
          context,
          "getTicketList",
          JSON.stringify(variables),
        );
        const list = response.data?.getTicketList;
        const tickets = list?.tickets || [];
        const listInfo = list?.listInfo || {};

        if (tickets.length === 0) {
          hasMore = false;
          break;
        }

        // Local filtered records
        const filtered = tickets.filter(
          (t: any) => t.updatedTime >= cleanSince && t.updatedTime <= cleanTill,
        );

        allRecords.push(...filtered);

        // reached record limit
        if (allRecords.length >= totalRecordLimit) {
          hasMore = !!listInfo.hasMore;
          page++;
          break;
        }

        // no more pages
        if (!listInfo.hasMore) {
          hasMore = false;
          break;
        }

        // continue pagination
        hasMore = true;
        page++;
      }

      return {
        since: cleanSince,
        till: cleanTill,
        hasMore,
        cursor: hasMore ? { page } : {},
        records: allRecords,
      };
    },

    output_schema: {
      fields: async (context: AppContext): Promise<any> => {
        const variables = {
          input: {
            page: 1,
            pageSize: 50,
            sort: [{ attribute: "createdTime", order: "DESC" }],
            condition: null,
          },
        };
        const ticketDetails = await getSuperOpsOutputSchema(
          context,
          "getTicketList",
          variables,
        );
        if (ticketDetails?.statusCode >= 400) {
          let error =
            typeof ticketDetails?.data?.error === "string"
              ? ticketDetails?.data?.error
              : JSON.stringify(ticketDetails.data.error);
          throw new Error(error || "unable to retrieve sample data");
        }
        const data = ticketDetails?.tickets;
        if (data.length == 0) {
          throw new Error(
            `No tickets found. Cannot generate schema without sample data.`,
          );
        }
        const mergedData = Array.isArray(data) ? deepMergeAll(data) : data;
        const schema = flattenAndGenerateSchema(mergedData);
        return schema;
      },
    },
    sample: async (context: AppContext): Promise<any> => {
      const variables = {
        input: {
          page: 1,
          pageSize: 5,
          sort: [{ attribute: "createdTime", order: "DESC" }],
          condition: null,
        },
      };
      const ticketData: any = await makeSuperOpsRequest(
        context,
        "getTicketList",
        variables,
      );
      if (ticketData?.statusCode >= 400) {
        let error =
          typeof ticketData?.data?.error === "string"
            ? ticketData?.data?.error
            : JSON.stringify(ticketData.data.error);
        throw new Error(error || "unable to retrieve sample data");
      }
      const tickets: any = ticketData?.data?.getTicketList?.tickets || [];
      if (!tickets.length) {
        throw new Error("No Sample Ticket Data Available");
      }
      return flattenObject(tickets[0]);
    },

    has_config_fields: false,
    config_fields: {
      fields: async () => [],
    },

    input_schema: {
      fields: async () => [],
    },

    help: "Use this trigger to start workflows whenever tickets are updated in SuperOps.",
    display_priority: 0,
    batch: false,
    batch_size: 0,
    bulk: false,
    deprecated: false,
    cursor_enabled: true,
  },
  new_task_created: {
    id: "new_task_created",
    name: "New Task Created",
    type: "poll",
    title: "New Task Created",
    subtitle: "Triggers when a new task is created in SuperOps.",
    description:
      "Polls the SuperOps API to detect newly created task since the last run.",

    dedup: (record: DataPayload) => record.id as string,

    poll: async (context: AppContext): Promise<PollResponse> => {
      const sinceRaw: any =
        context?.payload?.data?.since ||
        new Date(Date.now() - 5 * 60 * 1000).toISOString();
      const tillRaw: any =
        context?.payload?.data?.till || new Date().toISOString();
      const cleanSince = sinceRaw.replace(/Z$/, "");
      const cleanTill = tillRaw.replace(/Z$/, "");
      const cursor: any = context?.payload?.data?.cursor || {};
      let page = cursor.page || 1;

      const perPageLimit = 100;
      const totalRecordLimit = 1000;
      const allRecords: any[] = [];
      let hasMore = false;
      while (allRecords.length < totalRecordLimit) {
        const variables = {
          input: {
            page,
            pageSize: perPageLimit,
            sort: [{ attribute: "createdTime", order: "DESC" }],
            condition: {
              attribute: "createdTime",
              operator: "after",
              value: cleanSince,
            },
          },
        };

        const response: any = await makeSuperOpsRequest(
          context,
          "getTaskList",
          JSON.stringify(variables),
        );
        const list = response.data?.getTaskList;
        const tasks = list?.tasks || [];
        const listInfo = list?.listInfo || {};

        if (tasks.length === 0) {
          hasMore = false;
          break;
        }

        // const filtered = tasks.filter((t: any) => t.createdTime >= cleanSince && t.createdTime <= cleanTill);
        allRecords.push(...tasks);
        if (allRecords.length >= totalRecordLimit) {
          hasMore = !!listInfo.hasMore;
          page++;
          break;
        }

        if (!listInfo.hasMore) {
          hasMore = false;
          break;
        }
        hasMore = true;
        page++;
      }
      return {
        since: cleanSince,
        till: cleanTill,
        hasMore,
        cursor: hasMore ? { page } : {},
        records: allRecords,
      };
    },
    output_schema: {
      fields: async (context: AppContext): Promise<any> => {
        const variables = {
          input: {
            page: 1,
            pageSize: 50,
            sort: [{ attribute: "createdTime", order: "DESC" }],
            condition: null,
          },
        };

        const Response = await getSuperOpsOutputSchema(
          context,
          "getTaskList",
          variables,
        );
        if (Response?.statusCode >= 400) {
          let error =
            typeof Response?.data?.error === "string"
              ? Response?.data?.error
              : JSON.stringify(Response.data.error);
          throw new Error(error || "unable to retrieve sample data");
        }
        const data = Response.tasks;
        if (data.length == 0) {
          throw new Error(
            `No tasks found. Cannot generate schema without sample data. `,
          );
        }
        const mergedData = Array.isArray(data) ? deepMergeAll(data) : data;
        const schema = flattenAndGenerateSchema(mergedData);

        return schema;
      },
    },
    sample: async (context: AppContext): Promise<any> => {
      const variables = {
        input: {
          page: 1,
          pageSize: 50,
          sort: [
            {
              attribute: "createdTime",
              order: "DESC",
            },
          ],
          condition: null,
        },
      };
      const ticketData: any = await makeSuperOpsRequest(
        context,
        "getTaskList",
        variables,
      );
      if (ticketData?.statusCode >= 400) {
        let error =
          typeof ticketData?.data?.error === "string"
            ? ticketData?.data?.error
            : JSON.stringify(ticketData.data.error);
        throw new Error(error || "unable to retrieve sample data");
      }
      const tasks: any = ticketData?.data.getTaskList.tasks || [];
      if (!tasks.length) {
        throw new Error("No Sample Tasks Data Available");
      }
      return flattenObject(tasks[0]);
    },
    has_config_fields: false,
    config_fields: {
      fields: async () => [],
    },
    input_schema: {
      fields: async () => [],
    },
    help: "Use this trigger to start workflows when new tickets are created in SuperOps.",
    display_priority: 0,
    batch: false,
    batch_size: 0,
    bulk: false,
    deprecated: false,
    cursor_enabled: true,
  },
  asset_updated: {
    id: "asset_updated",
    name: "Asset Updated",
    type: "poll",
    title: "Asset Updated",
    subtitle: "Triggers when an asset is updated in SuperOps.",
    description:
      "Polls the SuperOps API to detect assets updated since the last run.",

    dedup: (record: DataPayload) => record.assetId as string,

    poll: async (context: AppContext): Promise<PollResponse> => {
      const sinceRaw: any =
        context?.payload?.config_fields?.since ||
        context?.payload?.data?.since ||
        new Date(Date.now() - 5 * 60 * 1000).toISOString();

      const tillRaw: any =
        context?.payload?.data?.till || new Date().toISOString();

      const cleanSince = sinceRaw.replace(/Z$/, "");
      const cleanTill = tillRaw.replace(/Z$/, "");

      const cursor: any = context?.payload?.data?.cursor || {};
      let page = cursor.page || 1;

      const perPageLimit = 100;
      const totalRecordLimit = 1000;

      const allRecords: any[] = [];
      let hasMore = false;

      while (allRecords.length < totalRecordLimit) {
        const variables = {
          input: {
            page,
            pageSize: perPageLimit,
            sort: [{ attribute: "updatedTime", order: "DESC" }],
            condition: {
              attribute: "updatedTime",
              operator: "after",
              value: cleanSince,
            },
          },
        };

        const response: any = await makeSuperOpsRequest(
          context,
          "getAssetList",
          JSON.stringify(variables),
        );

        const list = response?.data?.getAssetList;
        const assets = list?.assets || [];
        const listInfo = list?.listInfo || {};

        if (!assets.length) {
          hasMore = false;
          break;
        }

        const filtered = assets.filter(
          (a: any) => a.updatedTime >= cleanSince && a.updatedTime <= cleanTill,
        );

        allRecords.push(...filtered);

        if (allRecords.length >= totalRecordLimit) {
          hasMore = true;
          page++;
          break;
        }

        if (!listInfo?.totalCount || assets.length < perPageLimit) {
          hasMore = false;
          break;
        }

        hasMore = true;
        page++;
      }

      return {
        since: cleanSince,
        till: cleanTill,
        hasMore,
        cursor: hasMore ? { page } : {},
        records: allRecords,
      };
    },

    output_schema: {
      fields: async (context: AppContext): Promise<any> => {
        const variables = {
          input: {
            page: 1,
            pageSize: 20,
            sort: [{ attribute: "updatedTime", order: "DESC" }],
            condition: null,
          },
        };

        const assetDetails = await getSuperOpsOutputSchema(
          context,
          "getAssetList",
          variables,
        );
        if (assetDetails?.statusCode >= 400) {
          let error =
            typeof assetDetails?.data?.error === "string"
              ? assetDetails?.data?.error
              : JSON.stringify(assetDetails.data.error);
          throw new Error(error || "unable to retrieve sample data");
        }
        const data = assetDetails?.assets || [];

        if (!data.length) {
          throw new Error(
            "No assets found. Cannot generate schema without sample data.",
          );
        }

        const mergedData = Array.isArray(data) ? deepMergeAll(data) : data;

        const schema = flattenAndGenerateSchema(mergedData);
        return schema;
      },
    },

    sample: async (context: AppContext): Promise<any> => {
      const variables = {
        input: {
          page: 1,
          pageSize: 5,
          sort: [{ attribute: "updatedTime", order: "DESC" }],
          condition: null,
        },
      };

      const assetData: any = await makeSuperOpsRequest(
        context,
        "getAssetList",
        variables,
      );
      if (assetData?.statusCode >= 400) {
        let error =
          typeof assetData?.data?.error === "string"
            ? assetData?.data?.error
            : JSON.stringify(assetData.data.error);
        throw new Error(error || "unable to retrieve sample data");
      }
      const assets = assetData?.data?.getAssetList?.assets || [];

      if (!assets.length) {
        throw new Error("No Sample Asset Data Available");
      }

      return flattenObject(assets[0]);
    },

    has_config_fields: false,

    config_fields: {
      fields: async (context: AppContext): Promise<any> => {
        return [
          {
            name: "since",
            label: "Since",
            type: "string",
            optional: true,
          },
        ];
      },
    },
    help: "Use this trigger to start workflows when assets is updated in SuperOps.",
    display_priority: 1,
    batch: false,
    batch_size: 0,
    bulk: false,
    deprecated: false,
    cursor_enabled: true,
  },
  new_asset_created: {
    id: "new_asset_created",
    name: "New Asset Created",
    type: "poll",
    title: "New Asset Created",
    subtitle: "Triggers when a new asset is created in SuperOps.",
    description:
      "Polls the SuperOps API to detect assets created since the last run.",

    dedup: (record: DataPayload) => record.assetId as string,

    poll: async (context: AppContext): Promise<PollResponse> => {
      const clean = (iso: string) => iso.replace(/Z$/, "");

      const sinceRaw: any =
        context?.payload?.data?.since ||
        new Date(Date.now() - 5 * 60 * 1000).toISOString();

      const tillRaw: any =
        context?.payload?.data?.till || new Date().toISOString();

      const cfgSince = context?.payload?.config_fields?.since as
        | string
        | undefined;
      const data = context?.payload?.data || {};
      const cursor: any = { ...(data.cursor || {}) };

      // 1) Phase init
      if (!cursor.phase) cursor.phase = cfgSince ? "historic" : "live";

      // ✅ Read frozen window (for stable paging in LIVE)
      const frozenSince = cursor.windowSince as string | undefined;
      const frozenTill = cursor.windowTill as string | undefined;

      // 2) Resolve time window
      let cleanSince: string;
      let cleanTill: string;

      if (cursor.phase === "historic") {
        cleanSince = clean(cfgSince!);
        cleanTill = clean(tillRaw);
      } else {
        // ✅ LIVE: if paging is in progress, keep the same window
        cleanSince = clean(frozenSince || sinceRaw);
        cleanTill = clean(frozenTill || tillRaw);
      }

      // Guard invalid window
      if (!(cleanSince < cleanTill)) {
        return {
          since: cleanSince,
          till: cleanTill,
          hasMore: false,
          cursor,
          records: [],
        };
      }

      // 3) Pagination
      let page = cursor.page || 1;
      const PER_PAGE = 100;
      const MAX_RECORDS = 1000; // informational now, not a hard cap

      const allRecords: any[] = [];
      let hasMore = false;

      // 4) Fetch loop (can return > MAX_RECORDS — allowed)
      while (allRecords.length < MAX_RECORDS) {
        const variables = {
          input: {
            page,
            pageSize: PER_PAGE,
            sort: [{ attribute: "createdTime", order: "ASC" }],
            condition: {
              attribute: "createdTime",
              operator: "after",
              value: cleanSince,
            },
          },
        };

        const response: any = await makeSuperOpsRequest(
          context,
          "getAssetList",
          JSON.stringify(variables),
        );

        const assets: any[] = response?.data?.getAssetList?.assets || [];
        if (!assets.length) break;

        const filtered = assets.filter(
          (a) => a.createdTime > cleanSince && a.createdTime <= cleanTill,
        );

        allRecords.push(...filtered);

        if (allRecords.length >= MAX_RECORDS) {
          hasMore = true;
          page++;
          break;
        }

        if (assets.length < PER_PAGE) break;

        page++;
      }

      // 5) Cursor update + phase transition
      const wasHistoric = cursor.phase === "historic";

      if (hasMore) {
        cursor.page = page;
        cursor.windowSince = cleanSince;
        cursor.windowTill = cleanTill;
      } else {
        cursor.page = undefined;
        cursor.windowSince = undefined;
        cursor.windowTill = undefined;
        if (cursor.phase === "historic") cursor.phase = "live";
      }

      // 6) Return since
      const returnSince = wasHistoric ? cleanTill : cleanSince;

      return {
        since: returnSince,
        till: cleanTill,
        hasMore,
        cursor,
        records: allRecords,
      };
    },
    output_schema: {
      fields: async (context: AppContext): Promise<any> => {
        const variables = {
          input: {
            page: 1,
            pageSize: 20,
            // sort: [{ attribute: "createdTime", order: "DESC" }],
            // condition: null,
          },
        };

        const assetDetails = await getSuperOpsOutputSchema(
          context,
          "getAssetList",
          variables,
        );
        if (assetDetails?.statusCode >= 400) {
          let error =
            typeof assetDetails?.data?.error === "string"
              ? assetDetails?.data?.error
              : JSON.stringify(assetDetails.data.error);
          throw new Error(error || "unable to retrieve sample data");
        }
        const data = assetDetails?.assets || [];

        if (!data.length) {
          throw new Error(
            "No assets found. Cannot generate schema without sample data.",
          );
        }

        const mergedData = Array.isArray(data) ? deepMergeAll(data) : data;

        return flattenAndGenerateSchema(mergedData);
      },
    },

    sample: async (context: AppContext): Promise<any> => {
      const variables = {
        input: {
          page: 1,
          pageSize: 5,
          sort: [{ attribute: "createdTime", order: "DESC" }],
          condition: null,
        },
      };

      const assetData: any = await makeSuperOpsRequest(
        context,
        "getAssetList",
        variables,
      );

      if (assetData?.statusCode >= 400) {
        let error =
          typeof assetData?.data?.error === "string"
            ? assetData?.data?.error
            : JSON.stringify(assetData.data.error);
        throw new Error(error || "unable to retrieve sample data");
      }
      const assets = assetData?.data?.getAssetList?.assets || [];

      if (!assets.length) {
        throw new Error("No Sample Asset Data Available");
      }

      return flattenObject(assets[0]);
    },

    has_config_fields: true,

    config_fields: {
      fields: async (context: AppContext): Promise<any> => {
        return [
          {
            name: "since",
            label: "Since",
            type: "string",
            optional: true,
            hint: 'Specify the start timestamp in ISO 8601 format without "z". Example: "2026-01-01T00:00:00.000".',
          },
        ];
      },
    },

    input_schema: {
      fields: async () => [],
    },

    help: "Use this trigger to start workflows when new assets are created in SuperOps.",

    display_priority: 2,
    batch: false,
    batch_size: 0,
    bulk: false,
    deprecated: false,
    cursor_enabled: true,
  },
  // ─────────────────────────────────────────────────────────────────
  // 🔔 ALERT WEBHOOK TRIGGERS
  // ─────────────────────────────────────────────────────────────────

  alert_created: createSuperOpsAlertWebhookTrigger("ALERT_CREATED", {
    id: "alert_created",
    name: "Alert Created",
    title: "Alert Created",
    subtitle: "Triggers when a new alert is created in SuperOps.",
    description:
      "Fires in real-time when SuperOps raises a new alert against an asset.",
    help: "Use this trigger to start workflows the moment an alert is created — e.g. create a ticket, notify a channel, or page on-call.",
  }),

  alert_resolved: createSuperOpsAlertWebhookTrigger("ALERT_RESOLVED", {
    id: "alert_resolved",
    name: "Alert Resolved",
    title: "Alert Resolved",
    subtitle: "Triggers when an alert is resolved in SuperOps.",
    description: "Fires in real-time when SuperOps marks an alert as resolved.",
    help: "Use this trigger to close related tickets, send resolution notifications, or update asset health dashboards.",
  }),

  alert_deleted: createSuperOpsAlertWebhookTrigger("ALERT_DELETED", {
    id: "alert_deleted",
    name: "Alert Deleted",
    title: "Alert Deleted",
    subtitle: "Triggers when an alert is deleted in SuperOps.",
    description:
      "Fires in real-time when an alert is permanently deleted in SuperOps.",
    help: "Use this trigger to audit alert lifecycle events or clean up linked records in external systems.",
  }),
};
// 🧱 Base App Definition
export const SuperOpsApp: App = {
  id: "superopsit-1.0.0",
  name: "SuperOps IT",
  description:
    "SuperOps is a cloud-based ITSM platform designed to help IT service teams manage tickets and service items efficiently. It streamlines operations with real-time insights, automation, and reporting to enhance service delivery and business performance",
  version: "1.0.0",
  iconUrl: "https://app.superops.ai/favicon.ico",
  category: ["PSA", "RMM", "ITSM"],
  tags: ["dev", "support"],
  appType: "App",
  visibility: "public",
  has_actions: true, // You will enable later
  has_triggers: true, // You will enable later
  has_custom_action: false,
  secure_tunnel: false,

  // 🔐 Connection Setup
  connection: {
    fields: [
      {
        name: "region",
        type: "string",
        label: "Region",
        control_type: "select",
        required: { value: true, message: "Region is required." },
        pick_list: [
          { label: "US", value: "US" },
          { label: "EU", value: "EU" },
        ],
      },
      {
        name: "domain",
        type: "string",
        label: "Customer Domain",
        placeholder: "example : konnectify-support.superops.ai",
        required: { value: true, message: "Customer domain is required." },
      },
      // {
      //   name: "base_url",
      //   type: "string",
      //   label: "API Base URL",
      //   placeholder: "https://api.superops.ai/it or https://euapi.superops.ai/it",
      //   required: {
      //     value: false,
      //     message: "Optional. Auto-derived from region when empty.",
      //   },
      // },
    ],

    auth: {
      type: "oauth2",
      client_id: "{{connection.client_id}}",
      client_secret: "{{connection.client_secret}}",
      authorization_url: async (context: AppContext) => {
        const region = normalizeSuperOpsRegion((context.auth as any)?.region);
        const customerDomain = normalizeCustomerDomain(
          (context.auth as any)?.domain,
        );
        const oauthBaseUrl = SUPEROPS_OAUTH_BASE_URLS[region];
        const codeVerifier = base64UrlEncode(context.crypto.randomBytes(32));
        const codeChallenge = base64UrlEncode(
          context.crypto.createHash("sha256").update(codeVerifier).digest(),
        );
        const scope = encodeURIComponent(SUPEROPS_IT_SCOPES.join(" "));
        const state = base64UrlEncode(context.crypto.randomBytes(16));
        const authorizationUrl =
          region === "US"
            ? `https://usauth.superops.ai/api/oauth/authorize` +
              `?response_type=code` +
              `&client_id={{us_client_id}}` +
              `&redirect_uri={{redirect_uri}}` +
              `&scope=${scope}` +
              `&so_device_type=WEB` +
              `&so_customer_domain=${encodeURIComponent(customerDomain)}` +
              `&code_challenge=${codeChallenge}` +
              `&code_challenge_method=S256`
            : `https://euauth.superops.ai/api/oauth/authorize` +
              `?response_type=code` +
              `&client_id={{eu_client_id}}` +
              `&redirect_uri={{redirect_uri}}` +
              `&scope=${scope}` +
              `&so_device_type=WEB` +
              `&so_customer_domain=${encodeURIComponent(customerDomain)}` +
              `&code_challenge=${codeChallenge}` +
              `&code_challenge_method=S256`;
        // console.log(
        //   `${oauthBaseUrl}/api/oauth/authorize` +
        //     `?response_type=code` +
        //     `&client_id=konnectify-client` +
        //     `&redirect_uri=https://oauth.pstmn.io/v1/callback` +
        //     `&scope=${scope}` +
        //     `&state=${state}` +
        //     `&so_device_type=WEB` +
        //     `&so_customer_domain=${encodeURIComponent(customerDomain)}` +
        //     `&code_challenge=${codeChallenge}` +
        //     `&code_challenge_method=S256`
        // );
        return {
          code_verifier: codeVerifier,
          code_challenge: codeChallenge,
          code_challenge_method: "S256",
          oauth_base_url: oauthBaseUrl,
          domain: customerDomain,
          authorization_url: authorizationUrl,
        };
      },
      token_url: "https://usauth.superops.ai/api/oauth/token",
      noopener: false,
      authorize: async (
        context: AppContext,
      ): Promise<Record<string, unknown>> => {
        const tokenUrl = getSuperOpsTokenUrl(context);
        const region = context.auth.region as any;
        const params = new URLSearchParams();
        params.append("grant_type", "authorization_code");
        params.append("code", String((context.auth as any)?.code || ""));
        params.append(
          "redirect_uri",
          String((context.auth as any)?.redirect_uri || ""),
        );
        params.append(
          "code_verifier",
          String((context.auth as any)?.code_verifier || ""),
        );

        const credentials =
          region === "US"
            ? context.btoa(
                `${(context.auth as any)?.us_client_id || ""}:${(context.auth as any)?.us_client_secret || ""}`,
              )
            : context.btoa(
                `${(context.auth as any)?.eu_client_id || ""}:${(context.auth as any)?.eu_client_secret || ""}`,
              );
        // context.logger.info(tokenUrl);
        // context.logger.info("Context", JSON.stringify(context.auth));
        const response = await context.fetch(tokenUrl, {
          method: "POST",
          headers: {
            Authorization: `Basic ${credentials}`,
            "Content-Type": "application/x-www-form-urlencoded",
            Accept: "application/json",
          },
          body: params.toString(),
        });
        if (!response.ok) {
          const errorText = await response.text();
          context.logger?.error(
            `OAuth Authentication failed: ${response.statusText} - ${errorText}`,
          );
          throw new Error(
            `OAuth Authentication failed: ${response.statusText} - ${errorText}`,
          );
        }

        const authData = await response.json();
        return {
          region: context.auth.region,
          domain: context.auth.domain,
          access_token: authData.access_token,
          refresh_token: authData.refresh_token,
          token_type: authData.token_type,
          scope: authData.scope,
          expires_at: authData.expires_in - 100,
          isRolling: true,
        };
      },
      refresh: async (
        context: AppContext,
      ): Promise<Record<string, unknown>> => {
        const tokenUrl = getSuperOpsTokenUrl(context);
        const params = new URLSearchParams();
        params.append("grant_type", "refresh_token");
        params.append(
          "refresh_token",
          String((context.auth as any)?.refresh_token || ""),
        );
        const region = context.auth.region as any;
        const credentials =
          region === "US"
            ? context.btoa(
                `${(context.auth as any)?.us_client_id || ""}:${(context.auth as any)?.us_client_secret || ""}`,
              )
            : context.btoa(
                `${(context.auth as any)?.eu_client_id || ""}:${(context.auth as any)?.eu_client_secret || ""}`,
              );
        const response = await context.fetch(tokenUrl, {
          method: "POST",
          headers: {
            Authorization: `Basic ${credentials}`,
            "Content-Type": "application/x-www-form-urlencoded",
            Accept: "application/json",
          },
          body: params.toString(),
        });
        if (!response.ok) {
          const errorText = await response.text();
          context.logger?.error(
            `OAuth Refresh failed: ${response.statusText} - ${errorText}`,
          );
          throw new Error(
            `OAuth Refresh failed: ${response.statusText} - ${errorText}`,
          );
        }

        const authData = await response.json();
        return {
          region: context.auth.region,
          domain: context.auth.domain,
          access_token: authData.access_token,
          refresh_token: authData.refresh_token,
          token_type: authData.token_type,
          scope: authData.scope,
          expires_at: authData.expires_in - 100,
          isRolling: true,
        };
      },
      identity: async (): Promise<Record<string, unknown>> => {
        throw new Error("Identity endpoint not implemented for this app.");
      },
    },

    credentials: [
      {
        name: "us_client_id",
        type: "string",
        label: "US Client ID",
        placeholder: "Your SuperOps OAuth US Client ID",
        required: { value: true, message: "Client ID is required." },
      },
      {
        name: "us_client_secret",
        type: "string",
        label: "US Client Secret",
        placeholder: "Your SuperOps OAuth US Client Secret",
        required: { value: true, message: "Client secret is required." },
      },
      {
        name: "eu_client_id",
        type: "string",
        label: "EU Client ID",
        placeholder: "Your SuperOps OAuth EU Client ID",
        required: { value: true, message: "Client ID is required." },
      },
      {
        name: "eu_client_secret",
        type: "string",
        label: "EU Client Secret",
        placeholder: "Your SuperOps OAuth EU Client Secret",
        required: { value: true, message: "Client secret is required." },
      },
    ],
  },

  test: async (context: AppContext): Promise<any> => {
    const result = await validateConnection(context);
    return result.success;
  },

  object_definitions: {},
  pick_lists: {},
  actions: actionsMap,
  triggers: triggerMap,
  methods: {
    test: async function (context: AppContext): Promise<boolean> {
      const res = await makeSuperOpsRequest(context, "getClientList", "ping");
      return res.statusCode < 400;
    },
    authorize: async function (
      context: AppContext,
    ): Promise<Record<string, unknown>> {
      throw new Error("Authorixe not supported for this app");
    },
    refresh: async function (
      context: AppContext,
    ): Promise<Record<string, unknown>> {
      throw new Error("refresh not supported for this app");
    },
    identity: async function (): Promise<Record<string, unknown>> {
      throw new Error("Identity not supported for this app");
    },
    validate: async function (
      context: AppContext,
    ): Promise<Record<string, unknown>> {
      const res = await makeSuperOpsRequest(context, "getClientList", "ping");
      return { valid: res.statusCode < 400 };
    },
    pkce: async function (): Promise<Record<string, unknown>> {
      return { code_challenge_method: "S256" };
    },
  },
  streams: {},
};

export default SuperOpsApp;
