import { FindingCategory } from '@varys/contracts';

export interface RoutingConfig {
  flashModel: string;
  proModel: string;
  escalationConfidence: number;
}

export interface RoutingInput {
  category?: FindingCategory;
  /** Whether this unit involves webhook signature / crypto auditing (always Pro, §12.1). */
  securityCritical?: boolean;
  /** Confidence from a prior Flash pass; below threshold escalates to Pro. */
  priorConfidence?: number;
}

/** Model routing: Flash-first, escalate to Pro on low confidence or security-critical work. */
export function chooseModel(input: RoutingInput, cfg: RoutingConfig): { model: string; escalated: boolean } {
  if (input.securityCritical || input.category === FindingCategory.AUTH) {
    return { model: cfg.proModel, escalated: true };
  }
  if (input.priorConfidence !== undefined && input.priorConfidence < cfg.escalationConfidence) {
    return { model: cfg.proModel, escalated: true };
  }
  return { model: cfg.flashModel, escalated: false };
}
