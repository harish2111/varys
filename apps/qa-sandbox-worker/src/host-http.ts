import type { DocumentationContract, ExtractedUnit } from '@varys/contracts';

/** A request captured from the connector's injected `fetch` (no real network in mock mode). */
export interface CapturedRequest {
  method: string;
  url: string;
  path: string;
  headers: Record<string, string>;
  body?: unknown;
}

export interface SynthesizedResponse {
  status: number;
  body: unknown;
}

/**
 * Host-side handler for the `fetch` shim injected into the isolate. In mock mode it records
 * the outbound request and returns a synthesized response (built from the documentation
 * contract / connector sample) so the connector's execute path runs to completion without
 * touching the network. This is the spec §13 mock interception, adapted to the DSL's
 * `context.fetch` (resolving the nock-in-isolate contradiction).
 */
export class MockHttpHost {
  readonly captured: CapturedRequest[] = [];

  constructor(private readonly responder: (req: CapturedRequest) => SynthesizedResponse) {}

  /** Invoked from inside the isolate via a host reference. Input/output are plain JSON. */
  handle(method: string, url: string, headers: Record<string, string>, bodyText?: string): {
    status: number;
    body: string;
  } {
    const req: CapturedRequest = {
      method: (method || 'GET').toUpperCase(),
      url,
      path: urlToPath(url),
      headers: lowercaseKeys(headers),
      body: parseMaybeJson(bodyText),
    };
    this.captured.push(req);
    const res = this.responder(req);
    return { status: res.status, body: typeof res.body === 'string' ? res.body : JSON.stringify(res.body ?? {}) };
  }
}

/** Default mock responder: returns the documented/connector sample as the response body. */
export function mockResponder(unit: ExtractedUnit, contract?: DocumentationContract): (req: CapturedRequest) => SynthesizedResponse {
  const body = unit.outputSample ?? sampleFromContract(contract) ?? { ok: true };
  return () => ({ status: 200, body });
}

function sampleFromContract(contract?: DocumentationContract): Record<string, unknown> | undefined {
  if (!contract?.responseFields?.length) return undefined;
  const obj: Record<string, unknown> = {};
  for (const f of contract.responseFields) obj[f.name] = f.type === 'number' ? 0 : f.type === 'boolean' ? false : '';
  return obj;
}

export function urlToPath(url: string): string {
  try {
    const u = new URL(url);
    return u.pathname;
  } catch {
    const noQuery = url.split('?')[0];
    const m = noQuery.match(/^https?:\/\/[^/]+(\/.*)?$/);
    return m?.[1] ?? noQuery;
  }
}

function lowercaseKeys(h: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(h ?? {})) out[k.toLowerCase()] = v;
  return out;
}

function parseMaybeJson(text?: string): unknown {
  if (!text) return undefined;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}
