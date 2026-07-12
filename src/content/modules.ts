import type { ComponentType } from "react";

export type ModuleMeta = {
  id: string;
  slug: string;
  number: number;
  title: string;
  summary: string;
  status: "placeholder" | "draft" | "ready";
};

export type ModuleDefinition = ModuleMeta & {
  /** Lazy MDX body for the lesson content region */
  loadContent: () => Promise<{ default: ComponentType }>;
};

/**
 * Canonical module registry. Order defines learning path / prev-next nav.
 * Keep in sync with docs/learning-outcomes.md and README planned modules.
 */
export const modules: ModuleDefinition[] = [
  {
    id: "module-01",
    slug: "kv-cache-growth",
    number: 1,
    title: "KV Cache Growth and the Memory Wall",
    summary:
      "How the KV cache scales with sequence length, batch size, layers, and precision — and why HBM fills up.",
    status: "placeholder",
    loadContent: () => import("@/content/lessons/module-01-placeholder.mdx"),
  },
  {
    id: "module-02",
    slug: "paged-attention",
    number: 2,
    title: "PagedAttention and Fragmentation",
    summary:
      "Virtualize KV into blocks to cut reservation waste and external fragmentation.",
    status: "placeholder",
    loadContent: () => import("@/content/lessons/module-stub.mdx"),
  },
  {
    id: "module-03",
    slug: "kv-quantization",
    number: 3,
    title: "KV Cache Quantization",
    summary: "Lower bit-width payloads, scales, and asymmetric K/V grouping.",
    status: "placeholder",
    loadContent: () => import("@/content/lessons/module-stub.mdx"),
  },
  {
    id: "module-04",
    slug: "prefill-decode",
    number: 4,
    title: "Prefill vs Decode Scheduling",
    summary: "Continuous batching, chunked prefills, and phase interference.",
    status: "placeholder",
    loadContent: () => import("@/content/lessons/module-stub.mdx"),
  },
  {
    id: "module-05",
    slug: "prefix-caching",
    number: 5,
    title: "Prefix Caching and RadixAttention",
    summary: "Reuse shared prompt prefixes across requests with a radix tree index.",
    status: "placeholder",
    loadContent: () => import("@/content/lessons/module-stub.mdx"),
  },
  {
    id: "module-06",
    slug: "token-eviction",
    number: 6,
    title: "Token Eviction and Attention Sparsity",
    summary: "Bounded caches via windows, sinks, and heavy-hitter policies.",
    status: "placeholder",
    loadContent: () => import("@/content/lessons/module-stub.mdx"),
  },
  {
    id: "module-07",
    slug: "shared-cache-security",
    number: 7,
    title: "Security Risks in Shared Caches",
    summary: "Multi-tenant prefix sharing side channels and isolation mitigations.",
    status: "placeholder",
    loadContent: () => import("@/content/lessons/module-stub.mdx"),
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
