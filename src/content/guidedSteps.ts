/**
 * Guided-mode tour steps per lesson (Milestone 6 / #24).
 * Each step applies a partial param overlay and shows one teaching focus.
 */

import type { SimulationParams } from "@/state/simulationStore";

export type GuidedStep = {
  id: string;
  title: string;
  focus: string;
  /** Partial overrides applied on top of lesson defaults */
  params: Partial<SimulationParams>;
};

/** Defaults restored when entering guided mode for a lesson */
export const guidedBaseParams: Partial<SimulationParams> = {
  batchSize: 1,
  sequenceLength: 512,
  blockSize: 16,
  sharedPrefixTokens: 128,
  phase: "decode",
  generateProgress: 0.55,
  evictionPolicy: "none",
  evictionBudget: 12,
  cacheIsolation: false,
  hbmBudgetBytes: 2 * 1024 ** 3,
};

export const guidedStepsBySlug: Record<string, GuidedStep[]> = {
  // Lesson 1 is essay workspace with embedded interactives (no guided lab steps).
  "looking-back": [
    {
      id: "early",
      title: "Early in generation",
      focus:
        "Attention looks over a short past; the heatmap is still mostly prompt-side.",
      params: { generateProgress: 0.2 },
    },
    {
      id: "sinks",
      title: "Looking back denser",
      focus:
        "Later tokens still look at early positions—setup for sinks and importance later.",
      params: { generateProgress: 0.75 },
    },
    {
      id: "full",
      title: "Near the end",
      focus: "Almost all positions are written; looking-back work covers a long past.",
      params: { generateProgress: 0.95 },
    },
  ],
  "remembering-work": [
    {
      id: "small",
      title: "Modest cache",
      focus: "Short context, batch 1: KV is present but not yet dominant.",
      params: { sequenceLength: 512, batchSize: 1, generateProgress: 0.5 },
    },
    {
      id: "double-s",
      title: "Double sequence",
      focus: "Doubling S roughly doubles logical KV bytes—watch the metric formula.",
      params: { sequenceLength: 1024, batchSize: 1 },
    },
    {
      id: "batch",
      title: "Many chats",
      focus: "Batch multiplies independent caches (no sharing yet).",
      params: { sequenceLength: 1024, batchSize: 8 },
    },
    {
      id: "wall",
      title: "Memory wall demo",
      focus:
        "Long context + batch can exceed the teaching HBM budget (over-budget flag).",
      params: {
        sequenceLength: 4096,
        batchSize: 16,
        hbmBudgetBytes: 512 * 1024 * 1024,
      },
    },
  ],
  "prompt-vs-generation": [
    {
      id: "prefill",
      title: "Reading the prompt",
      focus:
        "Prefill: populate KV for the whole prompt—compute-leaning emphasis in the scene.",
      params: {
        phase: "prefill",
        sequenceLength: 1024,
        batchSize: 2,
        generateProgress: 0.2,
      },
    },
    {
      id: "decode",
      title: "Writing the reply",
      focus: "Decode: append one token at a time; bandwidth / KV-read story dominates.",
      params: {
        phase: "decode",
        sequenceLength: 1024,
        batchSize: 2,
        generateProgress: 0.7,
      },
    },
    {
      id: "mixed",
      title: "Hybrid batch intuition",
      focus: "Mixed phase: servers often blend a prefill chunk with ongoing decodes.",
      params: {
        phase: "mixed",
        sequenceLength: 2048,
        batchSize: 8,
        generateProgress: 0.5,
      },
    },
  ],
  "packing-memory": [
    {
      id: "small-p",
      title: "Small pages",
      focus: "Smaller P → more blocks, usually less internal waste on the last page.",
      params: { sequenceLength: 1000, blockSize: 8 },
    },
    {
      id: "large-p",
      title: "Large pages",
      focus: "Larger P → fewer blocks but more empty seats on a partial last page.",
      params: { sequenceLength: 1000, blockSize: 64 },
    },
    {
      id: "grow",
      title: "Longer sequence",
      focus:
        "As S grows, logical block count rises; holes illustrate external fragmentation.",
      params: { sequenceLength: 4096, blockSize: 16 },
    },
  ],
  "reusing-work": [
    {
      id: "no-share",
      title: "No shared prefix",
      focus: "Each request pays full prefill/cache cost for its own opening text.",
      params: { sharedPrefixTokens: 0, cacheIsolation: false, sequenceLength: 1024 },
    },
    {
      id: "share",
      title: "Shared system prompt",
      focus:
        "A long shared prefix reuses physical pages—metrics show shared vs unique tokens.",
      params: { sharedPrefixTokens: 512, cacheIsolation: false, sequenceLength: 1024 },
    },
    {
      id: "isolated",
      title: "Isolation on",
      focus: "Per-tenant isolation zeros teaching share metrics—safer, less reuse.",
      params: { sharedPrefixTokens: 512, cacheIsolation: true, sequenceLength: 1024 },
    },
  ],
  "fewer-bits": [
    {
      id: "fp16",
      title: "Full payload",
      focus: "bpe = 2 (FP16/BF16-class payload) is the baseline size.",
      params: { bytesPerElement: 2, quantBytesPerElement: 2, sequenceLength: 2048 },
    },
    {
      id: "fp8",
      title: "Half the bytes",
      focus: "Payload bpe = 1 ≈ 2× smaller cache (metadata still ignored).",
      params: { bytesPerElement: 2, quantBytesPerElement: 1, sequenceLength: 2048 },
    },
    {
      id: "int4",
      title: "Aggressive payload",
      focus: "bpe = 0.5 ≈ 4× on payload alone—real schemes add scales and residuals.",
      params: { bytesPerElement: 2, quantBytesPerElement: 0.5, sequenceLength: 2048 },
    },
  ],
  "forgetting-on-purpose": [
    {
      id: "none",
      title: "Keep everything",
      focus: "No eviction: full history retained (unbounded growth).",
      params: { evictionPolicy: "none", sequenceLength: 2048, evictionBudget: 16 },
    },
    {
      id: "window",
      title: "Recent window only",
      focus: "Drop early tokens—simple but can destroy attention sinks.",
      params: { evictionPolicy: "window", sequenceLength: 2048, evictionBudget: 8 },
    },
    {
      id: "sinks",
      title: "Sinks + window",
      focus: "Keep early sinks plus recent tokens (StreamingLLM-style intuition).",
      params: { evictionPolicy: "sinks", sequenceLength: 2048, evictionBudget: 12 },
    },
    {
      id: "h2o",
      title: "Heavy hitters mix",
      focus: "Budget split across sinks, important middles, and recency.",
      params: { evictionPolicy: "h2o", sequenceLength: 2048, evictionBudget: 12 },
    },
  ],
  "when-sharing-leaks": [
    {
      id: "shared",
      title: "Shared pool",
      focus: "Efficiency: common prefixes hit the shared pool (timing oracle risk).",
      params: {
        cacheIsolation: false,
        sharedPrefixTokens: 256,
        sequenceLength: 1024,
      },
    },
    {
      id: "probe-risk",
      title: "Longer shared trunk",
      focus: "More shared tokens → larger reuse benefit and larger shared surface.",
      params: {
        cacheIsolation: false,
        sharedPrefixTokens: 768,
        sequenceLength: 1024,
      },
    },
    {
      id: "isolate",
      title: "Mitigation: isolate",
      focus: "Isolation partitions the pool—less reuse, smaller multi-tenant signal.",
      params: {
        cacheIsolation: true,
        sharedPrefixTokens: 768,
        sequenceLength: 1024,
      },
    },
  ],
};

export function getGuidedSteps(slug: string): GuidedStep[] {
  return guidedStepsBySlug[slug] ?? [];
}
