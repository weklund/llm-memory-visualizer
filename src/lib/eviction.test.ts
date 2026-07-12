import { describe, expect, it } from "vitest";
import { memorySavedRatio, planTokenKeep } from "./eviction";

describe("planTokenKeep", () => {
  it("keeps all when policy is none", () => {
    const p = planTokenKeep({ sequenceLength: 20, budgetTokens: 5, policy: "none" });
    expect(p.kept).toHaveLength(20);
    expect(p.evicted).toHaveLength(0);
  });

  it("window keeps only the tail", () => {
    const p = planTokenKeep({ sequenceLength: 20, budgetTokens: 5, policy: "window" });
    expect(p.kept).toEqual([15, 16, 17, 18, 19]);
    expect(p.evicted).toContain(0);
  });

  it("sinks keep early tokens plus recency", () => {
    const p = planTokenKeep({
      sequenceLength: 20,
      budgetTokens: 6,
      policy: "sinks",
      sinkCount: 2,
    });
    expect(p.kept).toContain(0);
    expect(p.kept).toContain(1);
    expect(p.kept).toContain(19);
    expect(p.kept.length).toBeLessThanOrEqual(6);
  });

  it("reports memory saved ratio", () => {
    const p = planTokenKeep({ sequenceLength: 10, budgetTokens: 4, policy: "window" });
    expect(memorySavedRatio(p)).toBeCloseTo(0.6);
  });
});
