import type { DocumentationContract, ExtractedUnit } from '@varys/contracts';
import type { RawLlmFinding } from './client';
import type { TokenUsage } from './types';

export interface ValidateUnitRequest {
  runId: string;
  orgId: string;
  unit: ExtractedUnit;
  contract: DocumentationContract;
  securityCritical?: boolean;
}

export interface ValidateUnitResponse {
  findings: RawLlmFinding[];
  model: string;
  costUsd: number;
  usage: TokenUsage;
  escalated: boolean;
}

export interface EmbedResponseDto {
  embedding: number[];
}

export interface RuntimeFailureAnalysisRequest {
  runId?: string;
  orgId: string;
  elementName: string;
  elementType: 'ACTION' | 'TRIGGER';
  runtimeError?: string;
  capturedRequest?: unknown;
  findingSummary?: string;
}

export interface RuntimeFailureAnalysisResponse {
  analysis: string;
  rootCause?: string;
  suggestedFix?: string;
  isRetryable: boolean;
}

/**
 * HTTP client used by workers to reach the llm-gateway — the sole Gemini conduit. Workers
 * never hold the Gemini key; the gateway governs rate, routes models, and meters cost.
 */
export class LlmGatewayClient {
  constructor(
    private readonly baseUrl: string,
    private readonly internalSecret: string,
  ) {}

  async validateUnit(req: ValidateUnitRequest): Promise<ValidateUnitResponse> {
    return this.post<ValidateUnitResponse>('/v1/llm/validate-unit', req);
  }

  async embed(text: string, runId?: string, orgId?: string): Promise<EmbedResponseDto> {
    return this.post<EmbedResponseDto>('/v1/llm/embed', { text, runId, orgId });
  }

  async analyzeFailure(req: RuntimeFailureAnalysisRequest): Promise<RuntimeFailureAnalysisResponse> {
    return this.post<RuntimeFailureAnalysisResponse>('/v1/llm/analyze-failure', req);
  }

  private async post<T>(path: string, body: unknown): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-internal-auth': this.internalSecret },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      throw new Error(`llm-gateway ${path} failed: ${res.status} ${await res.text().catch(() => '')}`);
    }
    return (await res.json()) as T;
  }
}
