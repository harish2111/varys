import { submitConnectorSchema } from '@varys/contracts';

describe('submitConnectorSchema', () => {
  it('accepts a minimal valid submission and applies option defaults', () => {
    const parsed = submitConnectorSchema.safeParse({ source: 'export const App = {};', meta: {} });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.options.deterministicOnly).toBe(false);
      expect(parsed.data.options.runtime).toBe(false);
    }
  });

  it('rejects an empty source', () => {
    const parsed = submitConnectorSchema.safeParse({ source: '', meta: {} });
    expect(parsed.success).toBe(false);
  });

  it('carries namespace override and credentials', () => {
    const parsed = submitConnectorSchema.safeParse({
      source: 'x',
      meta: { namespace: 'hubspot-v3' },
      credentials: { api_key: 'secret' },
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.meta.namespace).toBe('hubspot-v3');
      expect(parsed.data.credentials?.api_key).toBe('secret');
    }
  });
});
