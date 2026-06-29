import type { MockHttpHost } from './host-http';

export interface IsolateOptions {
  /** Transpiled connector CommonJS. */
  code: string;
  unitKey: string;
  elementType: string;
  payload: Record<string, unknown>;
  auth: Record<string, unknown>;
  host: MockHttpHost;
  memoryMb: number;
  cpuTimeoutMs: number;
}

export interface IsolateResult {
  ok: boolean;
  returnValue?: unknown;
  error?: string;
  oom?: boolean;
  timeout?: boolean;
}

/**
 * Execute untrusted connector code inside an isolated-vm V8 isolate with no Node host APIs
 * (spec §5.4, §16): a memory cap, a CPU timeout, and a single injected `fetch` host call —
 * everything else (fs/net/process/child_process) is absent. isolated-vm is an optional native
 * dependency, loaded dynamically so non-runtime builds don't require the binary.
 */
export async function runConnectorInIsolate(opts: IsolateOptions): Promise<IsolateResult> {
  let ivm: any;
  try {
    ivm = (await import('isolated-vm')).default ?? (await import('isolated-vm'));
  } catch {
    return { ok: false, error: 'isolated-vm is not installed in this runtime' };
  }

  const isolate = new ivm.Isolate({ memoryLimit: opts.memoryMb });
  try {
    const context = await isolate.createContext();
    const jail = context.global;
    await jail.set('global', jail.derefInto());

    // The single host capability exposed to the isolate: a synchronous HTTP handler.
    const hostFetch = new ivm.Reference((method: string, url: string, headersJson: string, body?: string) =>
      JSON.stringify(opts.host.handle(method, url, JSON.parse(headersJson || '{}'), body)),
    );
    await jail.set('__hostFetch', hostFetch);
    await jail.set('__payload', new ivm.ExternalCopy(opts.payload).copyInto());
    await jail.set('__auth', new ivm.ExternalCopy(opts.auth).copyInto());
    await jail.set('__unitKey', opts.unitKey);
    await jail.set('__elementType', opts.elementType);

    const bootstrap = `
      const module = { exports: {} };
      const exports = module.exports;
      function require() { return {}; } // connector imports are type-only/unused at runtime
      function __mkResponse(status, bodyText) {
        return {
          ok: status >= 200 && status < 300,
          status,
          statusText: String(status),
          text: async () => bodyText,
          json: async () => JSON.parse(bodyText || '{}'),
        };
      }
      const context = {
        auth: __auth,
        payload: { data: __payload, config_fields: {} },
        config: {},
        params: {},
        logger: { debug(){}, info(){}, warn(){}, error(){} },
        btoa: (s) => Buffer ? Buffer.from(s).toString('base64') : s,
        fetch: async (url, opts) => {
          opts = opts || {};
          const out = JSON.parse(__hostFetch.applySync(undefined, [opts.method || 'GET', String(url), JSON.stringify(opts.headers || {}), opts.body]));
          return __mkResponse(out.status, out.body);
        },
      };
      (async () => {
        ${opts.code}
        const app = module.exports.default || module.exports[Object.keys(module.exports)[0]];
        const collection = __elementType === 'ACTION' ? app.actions : app.triggers;
        const unit = collection && collection[__unitKey];
        if (!unit) return { skipped: true };
        const fn = unit.execute || unit.poll;
        if (typeof fn !== 'function') return { skipped: true };
        return await fn(context);
      })();
    `;

    const script = await isolate.compileScript(bootstrap);
    const result = await script.run(context, { timeout: opts.cpuTimeoutMs, promise: true, copy: true });
    return { ok: true, returnValue: result };
  } catch (err) {
    const msg = (err as Error).message ?? String(err);
    return {
      ok: false,
      error: msg,
      oom: /memory limit/i.test(msg),
      timeout: /timed out|timeout/i.test(msg),
    };
  } finally {
    if (!isolate.isDisposed) isolate.dispose();
  }
}
