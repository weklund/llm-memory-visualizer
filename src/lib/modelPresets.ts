import type { KvMemoryParams } from "./kvMemory";

export type ModelPresetId = "demo-small" | "llama-7b-class" | "llama-70b-gqa";

export type ModelPreset = {
  id: ModelPresetId;
  label: string;
  description: string;
  /** Default KV-facing hyperparameters (not a claim about a specific checkpoint) */
  params: Pick<KvMemoryParams, "layers" | "kvHeads" | "headDim" | "bytesPerElement"> & {
    queryHeads: number;
    /** Approximate parameter count for weight-vs-KV teaching demos */
    approximateParams: number;
  };
};

/**
 * Illustrative configs for lessons. Labels are “class of model,” not audited HF configs.
 */
export const modelPresets: Record<ModelPresetId, ModelPreset> = {
  "demo-small": {
    id: "demo-small",
    label: "Tiny demo",
    description: "Small numbers for readable 3D scenes.",
    params: {
      layers: 8,
      queryHeads: 8,
      kvHeads: 8,
      headDim: 64,
      bytesPerElement: 2,
      approximateParams: 100_000_000,
    },
  },
  "llama-7b-class": {
    id: "llama-7b-class",
    label: "~7B class (MHA-style)",
    description: "32 layers, 32 KV heads — glossary-style teaching default without GQA.",
    params: {
      layers: 32,
      queryHeads: 32,
      kvHeads: 32,
      headDim: 128,
      bytesPerElement: 2,
      approximateParams: 7_000_000_000,
    },
  },
  "llama-70b-gqa": {
    id: "llama-70b-gqa",
    label: "~70B-class GQA shape",
    description: "Illustrative GQA: many query heads, fewer KV heads.",
    params: {
      layers: 80,
      queryHeads: 64,
      kvHeads: 8,
      headDim: 128,
      bytesPerElement: 2,
      approximateParams: 70_000_000_000,
    },
  },
};

export const defaultPresetId: ModelPresetId = "demo-small";
