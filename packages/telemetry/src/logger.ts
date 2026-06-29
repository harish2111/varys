import pino, { type Logger } from 'pino';

const SECRET_KEYS = [
  'api_key',
  'apiKey',
  'authorization',
  'Authorization',
  'password',
  'client_secret',
  'access_token',
  'refresh_token',
  'signingSecret',
  'GEMINI_API_KEY',
  'JWT_SECRET',
  'credentials',
];

/**
 * Create a structured pino logger with secret redaction (spec §16 — secrets never leak
 * into logs). In production, JSON goes to stdout for Cloud Logging ingestion.
 */
export function createLogger(opts: { service: string; level?: string }): Logger {
  return pino({
    name: opts.service,
    level: opts.level ?? process.env.LOG_LEVEL ?? 'info',
    redact: {
      paths: [
        ...SECRET_KEYS,
        ...SECRET_KEYS.map((k) => `*.${k}`),
        ...SECRET_KEYS.map((k) => `*.*.${k}`),
      ],
      censor: '[REDACTED]',
    },
    formatters: {
      level: (label) => ({ level: label }),
    },
  });
}

export type { Logger };
