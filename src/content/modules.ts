import type { ComponentType } from "react";

export type ModuleStage = "foundations" | "core-memory" | "systems" | "consequences";

export type ModuleWorkspace = "narrative" | "memory-lab";

export type ModuleMeta = {
  id: string;
  slug: string;
  number: number;
  /** Plain-language title (primary UI) */
  title: string;
  /** Industry / paper jargon — shown as secondary label */
  alsoKnownAs: string;
  /** One sentence: what you will understand after this lesson */
  summary: string;
  /** Short dependency note for path UI */
  buildsOn: string;
  stage: ModuleStage;
  /**
   * narrative = foundation explore knobs
   * memory-lab = full controls + metrics
   */
  workspace: ModuleWorkspace;
  status: "placeholder" | "draft" | "ready";
};

export type ModuleDefinition = ModuleMeta & {
  loadContent: () => Promise<{ default: ComponentType }>;
  /**
   * Optional second prose block for narrative lessons (after the scene).
   * Supports content → scene → more content cognitive order.
   */
  loadContentAfter?: () => Promise<{ default: ComponentType }>;
};

export const stageLabels: Record<ModuleStage, string> = {
  foundations: "Foundations",
  "core-memory": "Core memory",
  systems: "Systems tricks",
  consequences: "Consequences",
};

/**
 * Canonical module registry. Array order = learning path / prev-next nav.
 * Keep in sync with docs/learning-outcomes.md.
 *
 * Full path ready through lesson 9 (Milestones 3–4).
 */
export const modules: ModuleDefinition[] = [
  {
    id: "module-01",
    slug: "next-word-loop",
    number: 1,
    title: "Next word, again and again",
    alsoKnownAs: "Autoregressive generation",
    summary:
      "How a model writes text one piece at a time—and why the amount of past text keeps growing.",
    buildsOn: "Only a high-level idea of what an LLM is",
    stage: "foundations",
    workspace: "narrative",
    status: "ready",
    loadContent: () => import("@/content/lessons/module-01-next-word.mdx"),
    loadContentAfter: () => import("@/content/lessons/module-01-next-word-after.mdx"),
  },
  {
    id: "module-02",
    slug: "looking-back",
    number: 2,
    title: "Looking back at the past",
    alsoKnownAs: "Attention · queries, keys, and values",
    summary:
      "For each new word, the model decides which earlier words matter—and what to take from them.",
    buildsOn: "Lesson 1 — the generate loop",
    stage: "foundations",
    workspace: "narrative",
    status: "ready",
    loadContent: () => import("@/content/lessons/module-02-looking-back.mdx"),
  },
  {
    id: "module-03",
    slug: "remembering-work",
    number: 3,
    title: "Remembering work already done",
    alsoKnownAs: "KV cache · the memory wall",
    summary:
      "Why engines store past keys and values, how huge that storage gets, and when GPU memory runs out.",
    buildsOn: "Lesson 2 — what keys and values are for",
    stage: "core-memory",
    workspace: "memory-lab",
    status: "ready",
    loadContent: () => import("@/content/lessons/module-03-remembering-work.mdx"),
  },
  {
    id: "module-04",
    slug: "prompt-vs-generation",
    number: 4,
    title: "Reading the prompt vs writing the reply",
    alsoKnownAs: "Prefill vs decode · scheduling basics",
    summary:
      "Processing your whole prompt is a different job from emitting the next token—and the bottlenecks differ.",
    buildsOn: "Lesson 3 — a cache that grows over time",
    stage: "core-memory",
    workspace: "memory-lab",
    status: "ready",
    loadContent: () => import("@/content/lessons/module-04-prompt-vs-generation.mdx"),
  },
  {
    id: "module-05",
    slug: "packing-memory",
    number: 5,
    title: "Packing memory neatly",
    alsoKnownAs: "PagedAttention · fragmentation",
    summary:
      "How breaking cache storage into pages cuts waste when many conversations share one GPU.",
    buildsOn: "Lessons 3–4 — size pressure and many concurrent chats",
    stage: "systems",
    workspace: "memory-lab",
    status: "ready",
    loadContent: () => import("@/content/lessons/module-05-packing-memory.mdx"),
  },
  {
    id: "module-06",
    slug: "reusing-work",
    number: 6,
    title: "Reusing work others already did",
    alsoKnownAs: "Prefix caching · RadixAttention",
    summary:
      "When many requests share the same opening text, the server can reuse cached work instead of redo it.",
    buildsOn: "Lessons 3–5 — cache contents and page-friendly layout",
    stage: "systems",
    workspace: "memory-lab",
    status: "ready",
    loadContent: () => import("@/content/lessons/module-06-reusing-work.mdx"),
  },
  {
    id: "module-07",
    slug: "fewer-bits",
    number: 7,
    title: "Using fewer bits per value",
    alsoKnownAs: "KV cache quantization",
    summary:
      "Store each cached number with less precision to shrink memory—and what that trade-off costs.",
    buildsOn: "Lesson 3 — the size formula in bytes",
    stage: "systems",
    workspace: "memory-lab",
    status: "ready",
    loadContent: () => import("@/content/lessons/module-07-fewer-bits.mdx"),
  },
  {
    id: "module-08",
    slug: "forgetting-on-purpose",
    number: 8,
    title: "Forgetting on purpose",
    alsoKnownAs: "Token eviction · attention sinks · heavy hitters",
    summary:
      "When history is too long to keep, which past tokens do systems drop—and what that risks.",
    buildsOn: "Lessons 2–3 — attention importance and cache size",
    stage: "systems",
    workspace: "memory-lab",
    status: "ready",
    loadContent: () => import("@/content/lessons/module-08-forgetting-on-purpose.mdx"),
  },
  {
    id: "module-09",
    slug: "when-sharing-leaks",
    number: 9,
    title: "When sharing leaks",
    alsoKnownAs: "Shared-cache side channels · multi-tenant privacy",
    summary:
      "Shared prefixes make serving cheaper—and can create signals that leak what other users asked.",
    buildsOn: "Lesson 6 — cross-request cache reuse",
    stage: "consequences",
    workspace: "memory-lab",
    status: "ready",
    loadContent: () => import("@/content/lessons/module-09-when-sharing-leaks.mdx"),
  },
];

export function getModuleBySlug(slug: string): ModuleDefinition | undefined {
  return modules.find((m) => m.slug === slug);
}

export function getAdjacentModules(slug: string): {
  prev: ModuleDefinition | null;
  next: ModuleDefinition | null;
} {
  const index = modules.findIndex((m) => m.slug === slug);
  if (index < 0) return { prev: null, next: null };
  return {
    prev: index > 0 ? (modules[index - 1] ?? null) : null,
    next: index < modules.length - 1 ? (modules[index + 1] ?? null) : null,
  };
}

export function modulesByStage(): {
  stage: ModuleStage;
  label: string;
  items: ModuleDefinition[];
}[] {
  const order: ModuleStage[] = ["foundations", "core-memory", "systems", "consequences"];
  return order.map((stage) => ({
    stage,
    label: stageLabels[stage],
    items: modules.filter((m) => m.stage === stage),
  }));
}
