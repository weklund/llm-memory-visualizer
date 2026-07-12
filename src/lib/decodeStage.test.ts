import { describe, expect, it } from "vitest";
import { TIMELINE_SCENARIOS, pastLengthAt } from "./lesson1Demo";
import {
  brickEmphasis,
  bricksAt,
  chunkCounts,
  totalTokenCount,
  workForPass,
} from "./decodeStage";

describe("decodeStage", () => {
  it("chunkCounts partitions totals", () => {
    expect(chunkCounts(0, 5)).toEqual([]);
    expect(chunkCounts(5, 5)).toEqual([1, 1, 1, 1, 1]);
    expect(chunkCounts(10, 3).reduce((a, b) => a + b, 0)).toBe(10);
    expect(chunkCounts(10, 3).length).toBeLessThanOrEqual(3);
  });

  it("bricksAt token sum matches past length", () => {
    for (const s of TIMELINE_SCENARIOS) {
      for (let step = 0; step <= s.replyTokens.length; step++) {
        const bricks = bricksAt(s, step);
        expect(totalTokenCount(bricks)).toBe(pastLengthAt(s, step));
      }
    }
  });

  it("reply bricks use real token labels", () => {
    const grow = TIMELINE_SCENARIOS.find((s) => s.id === "growing-reply")!;
    const bricks = bricksAt(grow, 3);
    const reply = bricks.filter((b) => b.role === "reply");
    expect(reply.map((b) => b.label)).toEqual(["Soft", "rain", "falls"]);
  });

  it("workForPass differs for naive vs kv", () => {
    const naive = workForPass(20, "naive");
    const kv = workForPass(20, "kv");
    expect(naive.recompute).toBe(20);
    expect(naive.cacheRead).toBe(0);
    expect(kv.recompute).toBe(1);
    expect(kv.cacheRead).toBe(19);
  });

  it("naive sweep lights early bricks first", () => {
    expect(brickEmphasis(0, 10, 0.2, "naive", "sweeping")).toBeGreaterThan(
      brickEmphasis(9, 10, 0.2, "naive", "sweeping"),
    );
  });
});
