/**
 * Teaching eviction policies for lesson 8 — pure TS, not production KV drop algorithms.
 */

export type EvictionPolicy = "none" | "window" | "sinks" | "heavy" | "h2o";

export type TokenKeepPlan = {
  policy: EvictionPolicy;
  sequenceLength: number;
  budgetTokens: number;
  /** Indices kept in the full sequence [0, S) */
  kept: number[];
  evicted: number[];
  sinkCount: number;
  heavyCount: number;
  windowSize: number;
};

/**
 * Deterministic keep-set under a budget.
 * - window: last W tokens
 * - sinks: first K + last W (StreamingLLM-style intuition)
 * - heavy: mid “heavy” indices + last W
 * - h2o: sinks + heavies + recency (budget split)
 * - none: keep all (budget ignored for keep list)
 */
export function planTokenKeep(options: {
  sequenceLength: number;
  budgetTokens: number;
  policy: EvictionPolicy;
  sinkCount?: number;
  heavyCount?: number;
}): TokenKeepPlan {
  const S = Math.max(0, Math.floor(options.sequenceLength));
  const budget = Math.max(1, Math.floor(options.budgetTokens));
  const sinkCount = Math.min(S, options.sinkCount ?? 2);
  const heavyCount = options.heavyCount ?? 3;
  const policy = options.policy;

  if (S === 0) {
    return {
      policy,
      sequenceLength: 0,
      budgetTokens: budget,
      kept: [],
      evicted: [],
      sinkCount,
      heavyCount,
      windowSize: 0,
    };
  }

  if (policy === "none" || budget >= S) {
    const kept = Array.from({ length: S }, (_, i) => i);
    return {
      policy,
      sequenceLength: S,
      budgetTokens: budget,
      kept,
      evicted: [],
      sinkCount,
      heavyCount,
      windowSize: S,
    };
  }

  const keptSet = new Set<number>();

  const addRecent = (w: number) => {
    for (let i = Math.max(0, S - w); i < S; i++) keptSet.add(i);
  };

  const heavyIndices = (): number[] => {
    const out: number[] = [];
    if (S <= sinkCount + 2) return out;
    const start = Math.floor(S * 0.35);
    for (let h = 0; h < heavyCount; h++) {
      const idx = Math.min(S - 2, start + h * Math.max(1, Math.floor(S / 8)));
      if (idx >= sinkCount) out.push(idx);
    }
    return out;
  };

  if (policy === "window") {
    addRecent(budget);
  } else if (policy === "sinks") {
    for (let i = 0; i < sinkCount; i++) keptSet.add(i);
    const remain = Math.max(0, budget - keptSet.size);
    addRecent(remain);
  } else if (policy === "heavy") {
    for (const h of heavyIndices()) keptSet.add(h);
    const remain = Math.max(0, budget - keptSet.size);
    addRecent(remain);
    // trim if over budget: prefer recency + heavies
    trimToBudget(keptSet, budget, S);
  } else if (policy === "h2o") {
    for (let i = 0; i < sinkCount; i++) keptSet.add(i);
    for (const h of heavyIndices()) keptSet.add(h);
    const remain = Math.max(0, budget - keptSet.size);
    addRecent(Math.max(remain, Math.floor(budget / 2)));
    trimToBudget(keptSet, budget, S);
  }

  const kept = [...keptSet].sort((a, b) => a - b);
  const evicted = Array.from({ length: S }, (_, i) => i).filter((i) => !keptSet.has(i));
  const windowSize = kept.filter((i) => i >= S - budget).length;

  return {
    policy,
    sequenceLength: S,
    budgetTokens: budget,
    kept,
    evicted,
    sinkCount,
    heavyCount,
    windowSize,
  };
}

export function memorySavedRatio(plan: TokenKeepPlan): number {
  if (plan.sequenceLength === 0) return 0;
  return plan.evicted.length / plan.sequenceLength;
}

function trimToBudget(kept: Set<number>, budget: number, S: number): void {
  if (kept.size <= budget) return;
  // Drop oldest non-recent tokens first (not in last budget/2)
  const recentStart = Math.max(0, S - Math.ceil(budget / 2));
  const victims = [...kept].filter((i) => i < recentStart).sort((a, b) => a - b);
  for (const v of victims) {
    if (kept.size <= budget) break;
    kept.delete(v);
  }
  // If still over, drop from oldest remaining
  const rest = [...kept].sort((a, b) => a - b);
  for (const v of rest) {
    if (kept.size <= budget) break;
    kept.delete(v);
  }
}
