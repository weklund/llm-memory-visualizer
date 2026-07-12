import { describe, expect, it } from "vitest";
import { buildDemoAttentionMatrix, downsampleAttention } from "./attentionDemo";
import { buildContiguousLayout, buildPagedLayout } from "./paging";
import { deriveSimulationMetrics, displayTokens } from "./simulationMetrics";

describe("deriveSimulationMetrics", () => {
  const base = {
    batchSize: 1,
    sequenceLength: 4096,
    layers: 32,
    kvHeads: 8,
    headDim: 128,
    bytesPerElement: 2,
    blockSize: 16,
    hbmBudgetBytes: 1024 ** 3,
  };

  it("matches glossary 512 MiB logical KV", () => {
    const m = deriveSimulationMetrics(base);
    expect(m.kvLogical.mebibytes).toBe(512);
    expect(m.isOom).toBe(false);
  });

  it("flags OOM when budget is below cache", () => {
    const m = deriveSimulationMetrics({
      ...base,
      hbmBudgetBytes: 100 * 1024 * 1024,
    });
    expect(m.isOom).toBe(true);
    expect(m.hbmUtilization).toBeGreaterThan(1);
  });

  it("reports compression ratio for lower payload bpe", () => {
    const m = deriveSimulationMetrics({
      ...base,
      quantBytesPerElement: 0.5,
    });
    expect(m.compressionRatio).toBeCloseTo(4, 5);
  });

  it("tracks shared prefix unique tokens", () => {
    const m = deriveSimulationMetrics({
      ...base,
      sequenceLength: 100,
      sharedPrefixTokens: 40,
    });
    expect(m.sharedPrefixTokens).toBe(40);
    expect(m.uniqueSequenceTokens).toBe(60);
  });

  it("decode intensity proxy is lower than prefill for long S", () => {
    const m = deriveSimulationMetrics(base);
    expect(m.prefillIntensityProxy).toBeGreaterThan(m.decodeIntensityProxy);
  });
});

describe("paging layouts", () => {
  it("contiguous layout internal waste", () => {
    const layout = buildContiguousLayout(17, 16);
    expect(layout.logicalBlocks).toBe(2);
    expect(layout.internalWasteTokens).toBe(15);
  });

  it("paged layout inserts free holes", () => {
    const layout = buildPagedLayout(64, 16, { holeEvery: 2 });
    expect(layout.physical.some((b) => b.free)).toBe(true);
    expect(layout.table.length).toBe(4);
  });
});

describe("attention demo", () => {
  it("rows roughly sum to 1", () => {
    const m = buildDemoAttentionMatrix({ rows: 8, cols: 8, causal: true });
    for (let i = 0; i < m.rows; i++) {
      let sum = 0;
      for (let j = 0; j < m.cols; j++) sum += m.weights[i * m.cols + j] ?? 0;
      expect(sum).toBeCloseTo(1, 5);
    }
  });

  it("downsamples large matrices", () => {
    const m = buildDemoAttentionMatrix({ rows: 32, cols: 32 });
    const d = downsampleAttention(m, 8);
    expect(d.rows).toBe(8);
    expect(d.cols).toBe(8);
  });
});

describe("displayTokens", () => {
  it("caps growth for long sequences", () => {
    expect(displayTokens(10, 24)).toBe(10);
    expect(displayTokens(8192, 24)).toBeLessThanOrEqual(24);
    expect(displayTokens(8192, 24)).toBeGreaterThan(displayTokens(256, 24));
  });
});
