/**
 * Label unusual / edge-case param combinations in free exploration (#24).
 */

import type { SimulationParams } from "@/state/simulationStore";

export type ParamWarning = {
  id: string;
  message: string;
};

export function collectParamWarnings(params: SimulationParams): ParamWarning[] {
  const warnings: ParamWarning[] = [];

  if (params.quantBytesPerElement > params.bytesPerElement) {
    warnings.push({
      id: "quant-gt-base",
      message:
        "Quant payload bpe is larger than base bpe — unusual (expansion, not compression).",
    });
  }

  if (params.sharedPrefixTokens > params.sequenceLength) {
    warnings.push({
      id: "prefix-gt-s",
      message:
        "Shared prefix exceeds sequence length S — clamp effectively to S in metrics.",
    });
  }

  if (params.evictionPolicy !== "none" && params.evictionBudget >= 32) {
    warnings.push({
      id: "eviction-budget-large",
      message:
        "Eviction budget is large relative to the 16-token demo stream — few tokens will drop.",
    });
  }

  if (params.batchSize > 16 && params.sequenceLength >= 4096) {
    warnings.push({
      id: "stress-batch-s",
      message:
        "High batch × long context: teaching OOM demos only; real servers also store weights & overhead.",
    });
  }

  if (params.blockSize > params.sequenceLength && params.sequenceLength > 0) {
    warnings.push({
      id: "block-gt-s",
      message:
        "Block size P ≥ S means a single (mostly empty) last page for that sequence.",
    });
  }

  if (params.cacheIsolation && params.sharedPrefixTokens > 0) {
    warnings.push({
      id: "isolation-share",
      message:
        "Isolation is on: shared-prefix control is ignored for metrics (reuse treated as 0).",
    });
  }

  return warnings;
}
