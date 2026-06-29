/** Reciprocal Rank Fusion (spec §9.2): merge ranked id lists without a model. */
export interface FusedResult {
  id: string;
  score: number;
}

export function reciprocalRankFusion(lists: string[][], k = 60): FusedResult[] {
  const scores = new Map<string, number>();
  for (const list of lists) {
    list.forEach((id, idx) => {
      const rank = idx + 1;
      scores.set(id, (scores.get(id) ?? 0) + 1 / (k + rank));
    });
  }
  return [...scores.entries()]
    .map(([id, score]) => ({ id, score }))
    .sort((a, b) => b.score - a.score);
}

/**
 * Whether the fused ranking is decisive enough to skip the rerank pass (spec §9.2 — rerank
 * is skippable when RRF margins are already clear), saving tokens. True when the top result's
 * score exceeds the runner-up by at least `margin` (relative).
 */
export function isFusionDecisive(fused: FusedResult[], margin: number): boolean {
  if (fused.length < 2) return true;
  const [first, second] = fused;
  if (first.score <= 0) return false;
  return (first.score - second.score) / first.score >= margin;
}
