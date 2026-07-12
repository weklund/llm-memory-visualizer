import { describe, expect, it } from "vitest";
import { modules } from "./modules";
import { papers, papersForModule, techniques } from "./paperIndex";
import { sceneSummaries } from "./sceneSummaries";

describe("paperIndex", () => {
  it("has unique source IDs", () => {
    const ids = papers.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("covers lessons 3–9 with at least one paper each", () => {
    for (let n = 3; n <= 9; n++) {
      expect(papersForModule(n).length).toBeGreaterThan(0);
    }
  });

  it("maps technique rows to existing lesson numbers", () => {
    const nums = new Set(modules.map((m) => m.number));
    for (const row of techniques) {
      expect(nums.has(row.lesson)).toBe(true);
    }
  });
});

describe("sceneSummaries", () => {
  it("covers every module slug", () => {
    for (const mod of modules) {
      expect(sceneSummaries[mod.slug]).toBeTruthy();
      expect(sceneSummaries[mod.slug]!.length).toBeGreaterThan(40);
    }
  });
});
