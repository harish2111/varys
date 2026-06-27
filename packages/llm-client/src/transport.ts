import type { EmbedRequest, EmbedResponse, GenerateRequest, GenerateResponse, LlmTransport } from './types';

/**
 * Gemini transport over the @google/genai SDK. The SDK is referenced loosely (typed `any`)
 * so the package is resilient to minor SDK version drift; our own interfaces are the stable
 * contract. This is the only place that talks to the Gemini API.
 */
export class GeminiTransport implements LlmTransport {
  private clientPromise?: Promise<any>;

  constructor(private readonly apiKey: string) {}

  private async client(): Promise<any> {
    if (!this.clientPromise) {
      this.clientPromise = import('@google/genai').then((mod: any) => new mod.GoogleGenAI({ apiKey: this.apiKey }));
    }
    return this.clientPromise;
  }

  async generate(req: GenerateRequest): Promise<GenerateResponse> {
    const ai = await this.client();
    const config: Record<string, unknown> = {};
    if (req.systemInstruction) config.systemInstruction = req.systemInstruction;
    if (req.responseMimeType) config.responseMimeType = req.responseMimeType;
    if (req.responseSchema) config.responseSchema = req.responseSchema;
    if (req.cachedContentName) config.cachedContent = req.cachedContentName;
    if (req.temperature !== undefined) config.temperature = req.temperature;

    const res: any = await ai.models.generateContent({
      model: req.model,
      contents: req.contents,
      config,
    });

    const meta = res?.usageMetadata ?? {};
    return {
      text: typeof res?.text === 'string' ? res.text : (res?.text?.() ?? ''),
      usage: {
        inputTokens: meta.promptTokenCount ?? 0,
        cachedTokens: meta.cachedContentTokenCount ?? 0,
        outputTokens: meta.candidatesTokenCount ?? 0,
      },
    };
  }

  async embed(req: EmbedRequest): Promise<EmbedResponse> {
    const ai = await this.client();
    const res: any = await ai.models.embedContent({
      model: req.model,
      contents: req.text,
      config: { outputDimensionality: req.dim },
    });
    const values: number[] = res?.embeddings?.[0]?.values ?? res?.embedding?.values ?? [];
    return {
      embedding: normalize(values),
      usage: { inputTokens: res?.usageMetadata?.promptTokenCount ?? estimateTokens(req.text), cachedTokens: 0, outputTokens: 0 },
    };
  }
}

/** L2-normalize an embedding (required when using truncated output dimensionality). */
export function normalize(vec: number[]): number[] {
  const norm = Math.sqrt(vec.reduce((s, v) => s + v * v, 0));
  return norm > 0 ? vec.map((v) => v / norm) : vec;
}

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}
