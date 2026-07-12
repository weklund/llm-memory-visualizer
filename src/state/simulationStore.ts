import { create } from "zustand";
import { defaultPresetId, modelPresets, type ModelPresetId } from "@/lib/modelPresets";
import {
  deriveSimulationMetrics,
  type Phase,
  type SimulationMetrics,
} from "@/lib/simulationMetrics";
import type { KvMemoryParams } from "@/lib/kvMemory";

export type SimulationParams = KvMemoryParams & {
  blockSize: number;
  hbmBudgetBytes: number;
  quantBytesPerElement: number;
  sharedPrefixTokens: number;
  phase: Phase;
  /** Visible generation step for lesson 1 animation (0..1) */
  generateProgress: number;
  presetId: ModelPresetId;
};

export type SimulationState = {
  params: SimulationParams;
  setParam: <K extends keyof SimulationParams>(
    key: K,
    value: SimulationParams[K],
  ) => void;
  applyPreset: (id: ModelPresetId) => void;
  reset: () => void;
};

const preset = modelPresets[defaultPresetId];

const defaultParams: SimulationParams = {
  batchSize: 1,
  sequenceLength: 512,
  layers: preset.params.layers,
  kvHeads: preset.params.kvHeads,
  headDim: preset.params.headDim,
  bytesPerElement: preset.params.bytesPerElement,
  blockSize: 16,
  hbmBudgetBytes: 2 * 1024 ** 3,
  quantBytesPerElement: preset.params.bytesPerElement,
  sharedPrefixTokens: 0,
  phase: "decode",
  generateProgress: 0.55,
  presetId: defaultPresetId,
};

export const useSimulationStore = create<SimulationState>((set) => ({
  params: defaultParams,
  setParam: (key, value) =>
    set((state) => ({
      params: { ...state.params, [key]: value },
    })),
  applyPreset: (id) =>
    set((state) => {
      const p = modelPresets[id];
      return {
        params: {
          ...state.params,
          presetId: id,
          layers: p.params.layers,
          kvHeads: p.params.kvHeads,
          headDim: p.params.headDim,
          bytesPerElement: p.params.bytesPerElement,
          quantBytesPerElement: p.params.bytesPerElement,
        },
      };
    }),
  reset: () => set({ params: defaultParams }),
}));

export function selectMetrics(params: SimulationParams): SimulationMetrics {
  return deriveSimulationMetrics({
    batchSize: params.batchSize,
    sequenceLength: params.sequenceLength,
    layers: params.layers,
    kvHeads: params.kvHeads,
    headDim: params.headDim,
    bytesPerElement: params.bytesPerElement,
    blockSize: params.blockSize,
    hbmBudgetBytes: params.hbmBudgetBytes,
    quantBytesPerElement: params.quantBytesPerElement,
    sharedPrefixTokens: params.sharedPrefixTokens,
    phase: params.phase,
  });
}

/** @deprecated use selectMetrics */
export function selectKvMetrics(params: SimulationParams) {
  return selectMetrics(params).kvLogical;
}
