/** Token usage reported by the model, used for cost metering (spec §15). */
export interface TokenUsage {
  inputTokens: number;
  cachedTokens: number;
  outputTokens: number;
}

export interface GenerateRequest {
  model: string;
  systemInstruction?: string;
  /** The variable user payload (JSON string). */
  contents: string;
  responseSchema?: Record<string, unknown>;
  responseMimeType?: string;
  /** Name of registered cached content (system prompt + rules + vendor base). */
  cachedContentName?: string;
  temperature?: number;
}

export interface GenerateResponse {
  text: string;
  usage: TokenUsage;
}

export interface EmbedRequest {
  model: string;
  text: string;
  dim: number;
}

export interface EmbedResponse {
  embedding: number[];
  usage: TokenUsage;
}

/** Pluggable transport so the model layer can be exercised with a mock in tests. */
export interface LlmTransport {
  generate(req: GenerateRequest): Promise<GenerateResponse>;
  embed(req: EmbedRequest): Promise<EmbedResponse>;
}

export type LlmOperation = 'validation' | 'embedding' | 'rerank' | 'ingestion';
