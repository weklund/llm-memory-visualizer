import { create } from "zustand";
import { computeKvCacheBytes, type KvMemoryParams } from "@/lib/kvMemory";

/** Shared simulation knobs used by the lesson shell metric panel. */
export type SimulationParams = KvMemoryParams & {
  blockSize: number;
};

export type SimulationState = {
  params: SimulationParams;
  setParam: <K extends keyof SimulationParams>(
    key: K,
    value: SimulationParams[K],
  ) => void;
  reset: () => void;
};

const defaultParams: SimulationParams = {
  batchSize: 1,
  sequenceLength: 4096,
  layers: 32,
  kvHeads: 8,
  headDim: 128,
  bytesPerElement: 2,
  blockSize: 16,
};

export const useSimulationStore = create<SimulationState>((set) => ({
  params: defaultParams,
  setParam: (key, value) =>
    set((state) => ({
      params: { ...state.params, [key]: value },
    })),
  reset: () => set({ params: defaultParams }),
}));

export function selectKvMetrics(params: SimulationParams) {
  return computeKvCacheBytes(params);
}
