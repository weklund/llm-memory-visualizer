import { describe, expect, it } from "vitest";
import { modules } from "./modules";
import { getGuidedSteps, guidedStepsBySlug } from "./guidedSteps";
import { collectParamWarnings } from "@/lib/paramGuards";
import type { SimulationParams } from "@/state/simulationStore";

describe("guidedSteps", () => {
  it("covers every module slug with at least 2 steps", () => {
    for (const mod of modules) {
      const steps = getGuidedSteps(mod.slug);
      expect(steps.length, mod.slug).toBeGreaterThanOrEqual(2);
    }
  });

  it("has unique step ids per lesson", () => {
    for (const [slug, steps] of Object.entries(guidedStepsBySlug)) {
      const ids = steps.map((s) => s.id);
      expect(new Set(ids).size, slug).toBe(ids.length);
    }
  });
});

describe("collectParamWarnings", () => {
  const base: SimulationParams = {
    batchSize: 1,
    sequenceLength: 512,
    layers: 32,
    kvHeads: 8,
    headDim: 128,
    bytesPerElement: 2,
    blockSize: 16,
    hbmBudgetBytes: 2 * 1024 ** 3,
    quantBytesPerElement: 2,
    sharedPrefixTokens: 0,
    phase: "decode",
    generateProgress: 0.5,
    presetId: "demo-small",
    evictionPolicy: "none",
    evictionBudget: 12,
    cacheIsolation: false,
  };

  it("flags quant payload larger than base", () => {
    const w = collectParamWarnings({
      ...base,
      quantBytesPerElement: 4,
      bytesPerElement: 2,
    });
    expect(w.some((x) => x.id === "quant-gt-base")).toBe(true);
  });

  it("flags isolation with shared prefix control", () => {
    const w = collectParamWarnings({
      ...base,
      cacheIsolation: true,
      sharedPrefixTokens: 128,
    });
    expect(w.some((x) => x.id === "isolation-share")).toBe(true);
  });
});
