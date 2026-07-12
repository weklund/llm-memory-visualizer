/**
 * Shared derived metrics for all lessons — pure TypeScript, no Three.js.
 * Conventions documented in docs/glossary.md and docs/primitives.md.
 */

import {
  computeKvCacheBytes,
  internalFragmentationTokens,
  logicalBlocksForSequence,
  type KvMemoryParams,
} from "./kvMemory";
import { budgetFor, detectDeviceClass } from "./geometryBudget";
import { buildPagedLayout, physicalBytes } from "./paging";

export type Phase = "prefill" | "decode" | "mixed";

export type SimulationConfig = KvMemoryParams & {
  blockSize: number;
  /** Illustrative HBM budget for OOM demos (bytes) */
  hbmBudgetBytes: number;
  /** Optional quant payload bytes (defaults to bytesPerElement) */
  quantBytesPerElement?: number;
  /** Shared prefix length in tokens (prefix caching demos) */
  sharedPrefixTokens?: number;
  phase?: Phase;
};

export type SimulationMetrics = {
  kvLogical: ReturnType<typeof computeKvCacheBytes>;
  /** After optional payload quant (metadata ignored) */
  kvQuantizedBytes: number;
  compressionRatio: number;
  logicalBlocks: number;
  internalWasteTokens: number;
  /** Rough decode-step KV read bytes (reload full cache once) */
  kvBytesPerDecodeStep: number;
  /** Toy prefill FLOPs proxy: layers * batch * S^2 * heads * dim */
  prefillFlopsProxy: number;
  /** Toy decode FLOPs proxy: layers * batch * S * heads * dim */
  decodeFlopsProxy: number;
  hbmBudgetBytes: number;
  hbmUtilization: number;
  isOom: boolean;
  phase: Phase;
  /** Arithmetic intensity proxies (FLOPs / byte) — comparative only */
  prefillIntensityProxy: number;
  decodeIntensityProxy: number;
  sharedPrefixTokens: number;
  uniqueSequenceTokens: number;
  paging: {
    physicalBlockCount: number;
    freeHoles: number;
    reservedBytes: number;
    usedBytes: number;
    internalWasteBytes: number;
  };
};

export function deriveSimulationMetrics(config: SimulationConfig): SimulationMetrics {
  const {
    batchSize,
    sequenceLength,
    layers,
    kvHeads,
    headDim,
    bytesPerElement,
    blockSize,
    hbmBudgetBytes,
    quantBytesPerElement = bytesPerElement,
    sharedPrefixTokens = 0,
    phase = "decode",
  } = config;

  const kvLogical = computeKvCacheBytes({
    batchSize,
    sequenceLength,
    layers,
    kvHeads,
    headDim,
    bytesPerElement,
  });

  const kvQuantized = computeKvCacheBytes({
    batchSize,
    sequenceLength,
    layers,
    kvHeads,
    headDim,
    bytesPerElement: quantBytesPerElement,
  });

  const compressionRatio =
    kvQuantized.bytes > 0 ? kvLogical.bytes / kvQuantized.bytes : 1;

  const logicalBlocks = logicalBlocksForSequence(sequenceLength, blockSize);
  const internalWasteTokens = internalFragmentationTokens(sequenceLength, blockSize);

  // Per-token KV footprint (one sequence, all layers): 2 * L * H_kv * d_h * bpe
  const bytesPerToken = 2 * layers * kvHeads * headDim * bytesPerElement;

  const layout = buildPagedLayout(sequenceLength, blockSize, {
    sharedPrefixBlocks: Math.floor(sharedPrefixTokens / blockSize),
  });
  const pageBytes = physicalBytes(layout, bytesPerToken);
  const freeHoles = layout.physical.filter((b) => b.free).length;

  const kvBytesPerDecodeStep = kvLogical.bytes;
  const prefillFlopsProxy =
    layers * batchSize * sequenceLength * sequenceLength * kvHeads * headDim;
  const decodeFlopsProxy = layers * batchSize * sequenceLength * kvHeads * headDim;

  const prefillIntensityProxy =
    kvLogical.bytes > 0 ? prefillFlopsProxy / kvLogical.bytes : 0;
  const decodeIntensityProxy =
    kvBytesPerDecodeStep > 0 ? decodeFlopsProxy / kvBytesPerDecodeStep : 0;

  const hbmUtilization = hbmBudgetBytes > 0 ? kvLogical.bytes / hbmBudgetBytes : 0;

  const shared = Math.min(sharedPrefixTokens, sequenceLength);

  return {
    kvLogical,
    kvQuantizedBytes: kvQuantized.bytes,
    compressionRatio,
    logicalBlocks,
    internalWasteTokens,
    kvBytesPerDecodeStep,
    prefillFlopsProxy,
    decodeFlopsProxy,
    hbmBudgetBytes,
    hbmUtilization,
    isOom: kvLogical.bytes > hbmBudgetBytes,
    phase,
    prefillIntensityProxy,
    decodeIntensityProxy,
    sharedPrefixTokens: shared,
    uniqueSequenceTokens: Math.max(0, sequenceLength - shared),
    paging: {
      physicalBlockCount: layout.physical.length,
      freeHoles,
      reservedBytes: pageBytes.reserved,
      usedBytes: pageBytes.used,
      internalWasteBytes: pageBytes.waste,
    },
  };
}

/** Map full sequence length to a display count with log-ish growth (perf cap). */
export function displayTokens(sequenceLength: number, cap?: number): number {
  const resolved = cap ?? budgetFor(detectDeviceClass()).tokens;
  if (sequenceLength <= 0) return 1;
  if (sequenceLength <= resolved) return sequenceLength;
  const t = Math.log2(1 + sequenceLength) / Math.log2(1 + 8192);
  return Math.max(Math.min(8, resolved), Math.min(resolved, Math.round(resolved * t)));
}

export function displayLayers(layers: number, cap?: number): number {
  const resolved = cap ?? budgetFor(detectDeviceClass()).layers;
  if (layers <= 0) return 1;
  if (layers <= resolved) return layers;
  const t = Math.log2(1 + layers) / Math.log2(1 + 80);
  return Math.max(Math.min(2, resolved), Math.min(resolved, Math.round(resolved * t)));
}
