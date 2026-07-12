import { describe, expect, it } from "vitest";
import {
  CONTEXT_SCENARIOS,
  DEMO_REPLY_TOKENS,
  TIMELINE_SCENARIOS,
  contextLengthAtStep,
  maxPastLength,
  pastLengthAt,
  priorTokens,
  seriesForScenario,
} from "./lesson1Demo";

describe("lesson1Demo", () => {
  it("has a fixed reply path", () => {
    expect(DEMO_REPLY_TOKENS.length).toBeGreaterThan(5);
  });

  it("grows context by one token per reply step", () => {
    const s = CONTEXT_SCENARIOS[0]!;
    expect(contextLengthAtStep(s, 0)).toBe(s.baseTokens);
    expect(contextLengthAtStep(s, 3)).toBe(s.baseTokens + 3);
  });

  it("series ends at base + replySteps", () => {
    for (const s of CONTEXT_SCENARIOS) {
      const series = seriesForScenario(s);
      expect(series[0]?.tokens).toBe(s.baseTokens);
      expect(series.at(-1)?.tokens).toBe(s.baseTokens + s.replySteps);
    }
  });

  it("timeline scenarios use distinct reply paths that match their prompts", () => {
    const paths = TIMELINE_SCENARIOS.map((s) => s.replyTokens.join(" "));
    expect(new Set(paths).size).toBe(TIMELINE_SCENARIOS.length);
    const longP = TIMELINE_SCENARIOS.find((s) => s.id === "long-prompt")!;
    const grow = TIMELINE_SCENARIOS.find((s) => s.id === "growing-reply")!;
    const multi = TIMELINE_SCENARIOS.find((s) => s.id === "multi-turn")!;
    expect(grow.replyTokens.join(" ")).toContain("Soft rain");
    expect(longP.replyTokens.join(" ")).toMatch(/Night rain/i);
    expect(multi.replyTokens.join(" ")).toMatch(/shell/i);
  });

  it("long prompt starts taller than growing-reply", () => {
    const longP = TIMELINE_SCENARIOS.find((s) => s.id === "long-prompt")!;
    const grow = TIMELINE_SCENARIOS.find((s) => s.id === "growing-reply")!;
    expect(pastLengthAt(longP, 0)).toBeGreaterThan(pastLengthAt(grow, 0));
  });

  it("multi-turn includes prior tokens in the past", () => {
    const multi = TIMELINE_SCENARIOS.find((s) => s.id === "multi-turn")!;
    expect(priorTokens(multi)).toBeGreaterThan(0);
    expect(pastLengthAt(multi, 0)).toBe(priorTokens(multi) + multi.promptTokens);
    expect(maxPastLength(multi)).toBe(
      priorTokens(multi) + multi.promptTokens + multi.replyTokens.length,
    );
  });
});
