/**
 * Learner-facing paper index + technique matrix (Milestone 5 / #22).
 * Keep aligned with docs/paper-index.md and docs/sources.md.
 */

export type PaperCategory =
  | "foundations"
  | "scheduling"
  | "paging"
  | "prefix"
  | "quantization"
  | "eviction"
  | "security"
  | "systems";

export type PaperEntry = {
  id: string;
  title: string;
  year: string;
  category: PaperCategory;
  modules: number[];
  href: string;
  note?: string;
};

export type Band = "low" | "medium" | "high" | "varies" | "n/a" | "negative";

export type TechniqueRow = {
  technique: string;
  lesson: number;
  pressure: string;
  memorySaved: Band;
  latency: string;
  risk: string;
  complexity: Band;
  servingFit: string;
};

export const categoryLabels: Record<PaperCategory, string> = {
  foundations: "Foundations (attention & cache structure)",
  scheduling: "Prefill, decode, scheduling",
  paging: "Paging & memory management",
  prefix: "Prefix reuse",
  quantization: "KV quantization",
  eviction: "Eviction / streaming",
  security: "Security of shared caches",
  systems: "Systems anchors",
};

export const papers: PaperEntry[] = [
  {
    id: "S01",
    title: "Attention Is All You Need",
    year: "2017",
    category: "foundations",
    modules: [2, 3],
    href: "https://arxiv.org/abs/1706.03762",
  },
  {
    id: "S02",
    title: "Fast Transformer Decoding: One Write-Head Is All You Need (MQA)",
    year: "2019",
    category: "foundations",
    modules: [3],
    href: "https://arxiv.org/abs/1911.02150",
  },
  {
    id: "S03",
    title: "GQA: Training Generalized Multi-Query Transformer Models",
    year: "2023",
    category: "foundations",
    modules: [3],
    href: "https://arxiv.org/abs/2305.13245",
  },
  {
    id: "S04",
    title: "FlashAttention: Fast and Memory-Efficient Exact Attention",
    year: "2022",
    category: "foundations",
    modules: [3, 4],
    href: "https://arxiv.org/abs/2205.14135",
    note: "Orthogonal to KV storage; important for prefill IO story.",
  },
  {
    id: "S11",
    title: "Orca: A Distributed Serving System for Transformer-Based Generative Models",
    year: "2022",
    category: "scheduling",
    modules: [4],
    href: "https://www.usenix.org/conference/osdi22/presentation/yu",
  },
  {
    id: "S12",
    title: "DistServe: Disaggregating Prefill and Decoding",
    year: "2024",
    category: "scheduling",
    modules: [4],
    href: "https://arxiv.org/abs/2401.09670",
  },
  {
    id: "S13",
    title:
      "SARATHI: Efficient LLM Inference by Piggybacking Decodes with Chunked Prefills",
    year: "2023",
    category: "scheduling",
    modules: [4],
    href: "https://arxiv.org/abs/2308.16369",
  },
  {
    id: "S14",
    title: "Taming Throughput-Latency Tradeoff… Sarathi-Serve",
    year: "2024",
    category: "scheduling",
    modules: [4],
    href: "https://arxiv.org/abs/2403.02310",
  },
  {
    id: "S05",
    title: "Efficient Memory Management… with PagedAttention",
    year: "2023",
    category: "paging",
    modules: [5, 6],
    href: "https://arxiv.org/abs/2309.06180",
  },
  {
    id: "S06",
    title: "vLLM PagedAttention design docs",
    year: "ongoing",
    category: "paging",
    modules: [5],
    href: "https://docs.vllm.ai/",
  },
  {
    id: "S15",
    title: "Efficiently Programming Large Language Models Using SGLang",
    year: "2023–",
    category: "prefix",
    modules: [6, 9],
    href: "https://arxiv.org/abs/2312.07104",
  },
  {
    id: "S16",
    title: "LMSYS: SGLang & RadixAttention blog",
    year: "2024",
    category: "prefix",
    modules: [6],
    href: "https://www.lmsys.org/blog/2024-01-17-sglang/",
    note: "Pedagogy; cite S15 for formal claims.",
  },
  {
    id: "S17",
    title: "Automatic Prefix Caching (vLLM and peers)",
    year: "ongoing",
    category: "prefix",
    modules: [6],
    href: "https://docs.vllm.ai/",
    note: "Family of techniques; radix is one design.",
  },
  {
    id: "S07",
    title: "KIVI: Asymmetric 2bit Quantization for KV Cache",
    year: "2024",
    category: "quantization",
    modules: [7],
    href: "https://arxiv.org/abs/2402.02750",
  },
  {
    id: "S08",
    title: "KVQuant: Towards 10 Million Context Length…",
    year: "2024",
    category: "quantization",
    modules: [7],
    href: "https://arxiv.org/abs/2401.18079",
  },
  {
    id: "S09",
    title: "SmoothQuant",
    year: "2023",
    category: "quantization",
    modules: [7],
    href: "https://arxiv.org/abs/2211.10438",
    note: "Weight/activation PTQ bridge; not KV-only.",
  },
  {
    id: "S10",
    title: "vLLM FP8 KV-cache notes",
    year: "ongoing",
    category: "quantization",
    modules: [7],
    href: "https://docs.vllm.ai/",
    note: "Engineering practice evolves quickly.",
  },
  {
    id: "S18",
    title: "H₂O: Heavy-Hitter Oracle for Efficient Generative Inference",
    year: "2023",
    category: "eviction",
    modules: [8],
    href: "https://arxiv.org/abs/2306.14048",
  },
  {
    id: "S19",
    title: "Efficient Streaming Language Models with Attention Sinks",
    year: "2023",
    category: "eviction",
    modules: [8],
    href: "https://arxiv.org/abs/2309.17453",
  },
  {
    id: "S20",
    title: "Q-Hitter: A Better Token Oracle for Efficient LLM Inference",
    year: "2024",
    category: "eviction",
    modules: [8, 7],
    href: "https://proceedings.mlsys.org/",
  },
  {
    id: "S21",
    title: "PROMPTPEEK: Prompt Leakage via KV-Cache Sharing (NDSS)",
    year: "2025",
    category: "security",
    modules: [9],
    href: "https://www.ndss-symposium.org/ndss-paper/i-know-what-you-asked-prompt-leakage-via-kv-cache-sharing-in-multi-tenant-llm-serving/",
  },
  {
    id: "S22",
    title: "Selective KV-Cache Sharing / mitigations literature",
    year: "2025–",
    category: "security",
    modules: [9],
    href: "https://arxiv.org/html/2508.08438",
    note: "Fast-moving mitigation design space.",
  },
  {
    id: "S23",
    title: "vLLM project",
    year: "2023–",
    category: "systems",
    modules: [1, 2, 3, 4, 5],
    href: "https://github.com/vllm-project/vllm",
  },
  {
    id: "S24",
    title: "SGLang project",
    year: "2023–",
    category: "systems",
    modules: [6, 9],
    href: "https://github.com/sgl-project/sglang",
  },
  {
    id: "S25",
    title: "Continuous batching explainers (e.g. Anyscale)",
    year: "2023",
    category: "systems",
    modules: [4],
    href: "https://www.anyscale.com/blog/continuous-batching-llm-inference",
    note: "Intuition; cite Orca for priority claims.",
  },
];

export const techniques: TechniqueRow[] = [
  {
    technique: "MHA → GQA / MQA",
    lesson: 3,
    pressure: "KV storage & bandwidth",
    memorySaved: "high",
    latency: "Decode often improves",
    risk: "Model-dependent quality",
    complexity: "medium",
    servingFit: "Most open LLMs",
  },
  {
    technique: "Continuous / iteration batching",
    lesson: 4,
    pressure: "GPU idle slots",
    memorySaved: "varies",
    latency: "Higher throughput; TTFT trade-offs",
    risk: "Low (scheduling)",
    complexity: "high",
    servingFit: "Production servers",
  },
  {
    technique: "Chunked prefill / hybrid batch",
    lesson: 4,
    pressure: "Prefill–decode interference",
    memorySaved: "varies",
    latency: "Smoother TPOT under load",
    risk: "Low",
    complexity: "high",
    servingFit: "Online serving",
  },
  {
    technique: "Prefill–decode disaggregation",
    lesson: 4,
    pressure: "Phase interference",
    memorySaved: "varies",
    latency: "Goodput under SLOs",
    risk: "Low",
    complexity: "high",
    servingFit: "Large fleets",
  },
  {
    technique: "PagedAttention",
    lesson: 5,
    pressure: "Fragmentation / waste",
    memorySaved: "high",
    latency: "Enables larger batch",
    risk: "Low",
    complexity: "high",
    servingFit: "vLLM-class",
  },
  {
    technique: "Prefix / radix caching",
    lesson: 6,
    pressure: "Redundant prefill + pages",
    memorySaved: "high",
    latency: "Lower TTFT on hits",
    risk: "Privacy if multi-tenant",
    complexity: "high",
    servingFit: "Multi-user templates",
  },
  {
    technique: "KV quantization",
    lesson: 7,
    pressure: "Bytes per value",
    memorySaved: "high",
    latency: "Decode bandwidth help",
    risk: "Method-specific quality",
    complexity: "high",
    servingFit: "FP8 common; low-bit varies",
  },
  {
    technique: "Window eviction",
    lesson: 8,
    pressure: "Bound cache size",
    memorySaved: "high",
    latency: "Enables long streams",
    risk: "High quality risk",
    complexity: "low",
    servingFit: "Streaming",
  },
  {
    technique: "Attention sinks + window",
    lesson: 8,
    pressure: "Bound cache size",
    memorySaved: "high",
    latency: "Long streams",
    risk: "Lower than naïve window",
    complexity: "medium",
    servingFit: "StreamingLLM-style",
  },
  {
    technique: "Heavy-hitter / H₂O-style",
    lesson: 8,
    pressure: "Bound cache size",
    memorySaved: "high",
    latency: "Long streams",
    risk: "Policy-dependent",
    complexity: "medium",
    servingFit: "Research → systems",
  },
  {
    technique: "Cache isolation",
    lesson: 9,
    pressure: "Side-channel surface",
    memorySaved: "negative",
    latency: "May raise TTFT",
    risk: "Privacy improves",
    complexity: "medium",
    servingFit: "Multi-tenant",
  },
];

export function papersByCategory(): {
  category: PaperCategory;
  label: string;
  items: PaperEntry[];
}[] {
  const order: PaperCategory[] = [
    "foundations",
    "scheduling",
    "paging",
    "prefix",
    "quantization",
    "eviction",
    "security",
    "systems",
  ];
  return order.map((category) => ({
    category,
    label: categoryLabels[category],
    items: papers.filter((p) => p.category === category),
  }));
}

export function papersForModule(moduleNumber: number): PaperEntry[] {
  return papers.filter((p) => p.modules.includes(moduleNumber));
}
