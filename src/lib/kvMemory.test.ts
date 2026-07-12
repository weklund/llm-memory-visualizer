import { describe, expect, it } from "vitest";
import {
  computeKvCacheBytes,
  formatBytes,
  internalFragmentationTokens,
  logicalBlocksForSequence,
} from "./kvMemory";

describe("computeKvCacheBytes", () => {
  it("matches the glossary GQA worked example (512 MiB)", () => {
    const result = computeKvCacheBytes({
      batchSize: 1,
      sequenceLength: 4096,
      layers: 32,
      kvHeads: 8,
      headDim: 128,
      bytesPerElement: 2,
    });

    expect(result.bytes).toBe(536_870_912);
    expect(result.mebibytes).toBe(512);
    expect(result.elements).toBe(268_435_456);
  });

  it("scales linearly with batch size", () => {
    const base = computeKvCacheBytes({
      batchSize: 1,
      sequenceLength: 1024,
      layers: 16,
      kvHeads: 8,
      headDim: 64,
      bytesPerElement: 2,
    });
    const doubled = computeKvCacheBytes({
      batchSize: 2,
      sequenceLength: 1024,
      layers: 16,
      kvHeads: 8,
      headDim: 64,
      bytesPerElement: 2,
    });

    expect(doubled.bytes).toBe(base.bytes * 2);
  });

  it("uses H_kv so GQA is smaller than MHA", () => {
    const mha = computeKvCacheBytes({
      batchSize: 1,
      sequenceLength: 2048,
      layers: 32,
      kvHeads: 32,
      headDim: 128,
      bytesPerElement: 2,
    });
    const gqa = computeKvCacheBytes({
      batchSize: 1,
      sequenceLength: 2048,
      layers: 32,
      kvHeads: 8,
      headDim: 128,
      bytesPerElement: 2,
    });

    expect(gqa.bytes * 4).toBe(mha.bytes);
  });

  it("rejects invalid inputs", () => {
    expect(() =>
      computeKvCacheBytes({
        batchSize: -1,
        sequenceLength: 1,
        layers: 1,
        kvHeads: 1,
        headDim: 1,
        bytesPerElement: 2,
      }),
    ).toThrow(/batchSize/);
  });
});

describe("logicalBlocksForSequence", () => {
  it("ceil-divides sequence length by block size", () => {
    expect(logicalBlocksForSequence(0, 16)).toBe(0);
    expect(logicalBlocksForSequence(1, 16)).toBe(1);
    expect(logicalBlocksForSequence(16, 16)).toBe(1);
    expect(logicalBlocksForSequence(17, 16)).toBe(2);
  });
});

describe("internalFragmentationTokens", () => {
  it("reports unused slots in the last block", () => {
    expect(internalFragmentationTokens(16, 16)).toBe(0);
    expect(internalFragmentationTokens(17, 16)).toBe(15);
  });
});

describe("formatBytes", () => {
  it("formats common magnitudes", () => {
    expect(formatBytes(512)).toBe("512 B");
    expect(formatBytes(2048)).toBe("2 KiB");
    expect(formatBytes(536_870_912)).toBe("512 MiB");
  });
});
