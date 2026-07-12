/**
 * Canonical KV cache math from docs/glossary.md.
 * Pure functions — unit-tested without WebGL.
 */

export type KvMemoryParams = {
  /** Batch size (concurrent sequences) */
  batchSize: number;
  /** Sequence length in tokens */
  sequenceLength: number;
  /** Transformer layers */
  layers: number;
  /** Key/value heads (H_kv); equals query heads for MHA */
  kvHeads: number;
  /** Head dimension d_h */
  headDim: number;
  /** Bytes per element (2 = FP16/BF16, 1 = FP8, …) */
  bytesPerElement: number;
};

export type KvMemoryResult = {
  /** 2 · B · L · H_kv · S · d_h */
  elements: number;
  /** elements · bpe */
  bytes: number;
  mebibytes: number;
};

/**
 * M_KV = 2 · B · L · H_kv · S · d_h · bpe
 *
 * Factor 2 accounts for keys and values.
 * Assumes no cross-sequence physical sharing and ignores quant metadata.
 */
export function computeKvCacheBytes(params: KvMemoryParams): KvMemoryResult {
  const { batchSize, sequenceLength, layers, kvHeads, headDim, bytesPerElement } = params;

  assertNonNegativeFinite("batchSize", batchSize);
  assertNonNegativeFinite("sequenceLength", sequenceLength);
  assertNonNegativeFinite("layers", layers);
  assertNonNegativeFinite("kvHeads", kvHeads);
  assertNonNegativeFinite("headDim", headDim);
  assertNonNegativeFinite("bytesPerElement", bytesPerElement);

  const elements = 2 * batchSize * layers * kvHeads * sequenceLength * headDim;
  const bytes = elements * bytesPerElement;

  return {
    elements,
    bytes,
    mebibytes: bytes / (1024 * 1024),
  };
}

/** Logical blocks for sequence length S and block size P: ceil(S / P). */
export function logicalBlocksForSequence(
  sequenceLength: number,
  blockSize: number,
): number {
  assertNonNegativeFinite("sequenceLength", sequenceLength);
  if (!Number.isFinite(blockSize) || blockSize <= 0) {
    throw new Error("blockSize must be a positive finite number");
  }
  return Math.ceil(sequenceLength / blockSize);
}

/** Worst-case internal fragmentation in tokens for one sequence (last partial block). */
export function internalFragmentationTokens(
  sequenceLength: number,
  blockSize: number,
): number {
  const blocks = logicalBlocksForSequence(sequenceLength, blockSize);
  if (sequenceLength === 0) return 0;
  return blocks * blockSize - sequenceLength;
}

/** Format bytes for metric readouts. */
export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes)) return "—";
  const abs = Math.abs(bytes);
  if (abs < 1024) return `${round(bytes, 0)} B`;
  if (abs < 1024 ** 2) return `${round(bytes / 1024, 1)} KiB`;
  if (abs < 1024 ** 3) return `${round(bytes / 1024 ** 2, 2)} MiB`;
  return `${round(bytes / 1024 ** 3, 2)} GiB`;
}

function assertNonNegativeFinite(name: string, value: number): void {
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`${name} must be a non-negative finite number`);
  }
}

function round(n: number, digits: number): number {
  const f = 10 ** digits;
  return Math.round(n * f) / f;
}
