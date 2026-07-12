import { describe, expect, it } from "vitest";
import {
  CONTEXT_SCENARIOS,
  DEMO_REPLY_TOKENS,
  contextLengthAtStep,
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
});
