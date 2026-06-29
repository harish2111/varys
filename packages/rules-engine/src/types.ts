import type { DocumentationContract, ExtractedConnector, ExtractedUnit, Finding } from '@varys/contracts';

/** Context handed to every rule. `contract` is the best-matched documentation contract,
 * or undefined when none could be matched (e.g. KB not yet ingested for this unit). */
export interface RuleContext {
  connector: ExtractedConnector;
  unit: ExtractedUnit;
  contract?: DocumentationContract;
  /** All candidate contracts retrieved for the unit (top-k). */
  candidates: DocumentationContract[];
}

/** A deterministic rule (spec §11). Implementations are pure: same input -> same findings. */
export interface Rule {
  readonly id: string;
  /** Whether this rule requires a matched contract to produce findings. */
  readonly requiresContract: boolean;
  evaluate(ctx: RuleContext): Finding[];
}
