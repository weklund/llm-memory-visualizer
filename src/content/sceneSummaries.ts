/**
 * Non-visual summaries for each lesson scene (a11y / #23).
 * Keep in sync with lesson MDX “What the scene shows” sections.
 */

export const sceneSummaries: Record<string, string> = {
  "next-word-loop":
    "A looping animation of autoregressive generation: fixed prompt tokens on the left, a growing reply on the right. Phase labels cycle through read past, choose next token, append, and repeat. In free explore you can scrub progress manually.",
  "looking-back":
    "A row of past tokens above a grid of attention weights. Brighter cells mean the model looks more at that past position when forming the next word. The pattern is schematic, not a real model run.",
  "remembering-work":
    "A 3D grid of memory cells for the key-value cache. The grid grows with sequence length, layers, and batch size. When cache size exceeds the HBM budget, the scene flags over-budget.",
  "prompt-vs-generation":
    "A GPU node with a compute brick and memory tray. Prefill phase emphasizes compute; decode emphasizes bandwidth traffic and reading the growing cache. Batch slots suggest multi-request scheduling.",
  "packing-memory":
    "A pool of fixed-size memory pages with a block table mapping logical token ranges to physical pages. Some pages are partially full (internal waste); some free holes illustrate external fragmentation.",
  "reusing-work":
    "Shared prefix pages versus unique suffix pages. Raising shared prefix tokens marks more of the pool as reused work. Isolation off means a shared pool; isolation on reduces reuse.",
  "fewer-bits":
    "Cache storage shown at different payload sizes. Lower bytes-per-element shrinks the visualized footprint; metrics use payload-only compression and ignore quant metadata.",
  "forgetting-on-purpose":
    "A token stream where some positions stay kept and others fade as evicted. Policy controls choose recent-only, sinks plus window, heavy hitters, or a mixed H2O-style budget.",
  "when-sharing-leaks":
    "Multi-tenant metaphor: shared cache pages can speed common prefixes but also create timing signals. Isolation on partitions the pool and zeros shared-prefix metrics.",
};

export function getSceneSummary(slug: string): string {
  return (
    sceneSummaries[slug] ??
    "Interactive 3D teaching scene. Use the lesson text and metrics for the full explanation."
  );
}
