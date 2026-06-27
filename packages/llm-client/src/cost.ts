import type { TokenUsage } from './types';

export interface ModelPricing {
  inputPerM: number;
  cachedPerM: number;
  outputPerM: number;
}

export interface PricingTable {
  flash: ModelPricing;
  pro: ModelPricing;
  embed: Pick<ModelPricing, 'inputPerM'>;
}

/** Compute USD cost for a generate call (spec §15 cost metering). */
export function computeGenerateCost(pricing: ModelPricing, usage: TokenUsage): number {
  const billedInput = Math.max(0, usage.inputTokens - usage.cachedTokens);
  return (
    (billedInput * pricing.inputPerM +
      usage.cachedTokens * pricing.cachedPerM +
      usage.outputTokens * pricing.outputPerM) /
    1_000_000
  );
}

export function computeEmbedCost(inputPerM: number, usage: TokenUsage): number {
  return (usage.inputTokens * inputPerM) / 1_000_000;
}

/** Resolve which pricing tier applies to a model id. */
export function pricingForModel(table: PricingTable, model: string): ModelPricing {
  if (/pro/i.test(model)) return table.pro;
  if (/embedding/i.test(model)) return { ...table.flash, ...table.embed, cachedPerM: 0, outputPerM: 0 };
  return table.flash;
}
