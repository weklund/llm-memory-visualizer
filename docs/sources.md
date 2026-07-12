# Source inventory and paper map

Canonical literature and systems inventory for the LLM Memory Visualizer.  
This document grounds learning modules in peer-reviewed papers, preprints, system docs, and high-quality explainers.

**Last reviewed:** 2026-07-12  
**Status:** Milestone 0 — research foundation  
**Related issues:** #1, #21, #22

---

## How to read this inventory

| Field               | Meaning                                                                                                                                                                            |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Category**        | `paper` · `preprint` · `system-docs` · `blog` · `survey-adjacent`                                                                                                                  |
| **Confidence**      | `high` — claims well-replicated / widely implemented · `medium` — solid primary source, nuances TBD in module QA · `low` — secondary or evolving; validate before teaching as fact |
| **Modules**         | Maps to planned learning modules (1–7)                                                                                                                                             |
| **Viz opportunity** | What a 3D / interactive scene should show                                                                                                                                          |

Claims that still need lesson-level validation are tagged **[NEEDS-VALIDATION]** in notes.

---

## Module → source coverage matrix

Each planned module should map to **at least two** supporting sources where possible.

| Module | Topic                                 | Primary sources                                                                      | Secondary / systems                                                 |
| ------ | ------------------------------------- | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------- |
| 1      | KV cache growth and memory wall       | Attention is All You Need; MQA (Shazeer); GQA (Ainslie et al.)                       | vLLM design docs; common KV-size derivations                        |
| 2      | PagedAttention and fragmentation      | Kwon et al. (vLLM / PagedAttention)                                                  | vLLM PagedAttention design docs                                     |
| 3      | KV cache quantization                 | KIVI (Liu et al.); KVQuant (Hooper et al.); SmoothQuant (Xiao et al.)                | vLLM FP8 KV notes (production practice)                             |
| 4      | Prefill vs decode scheduling          | Orca (Yu et al.); DistServe (Zhong et al.); Sarathi / Sarathi-Serve (Agrawal et al.) | Continuous-batching industry writeups                               |
| 5      | Prefix caching and RadixAttention     | SGLang / RadixAttention (Zheng et al.)                                               | LMSYS blog; SGLang docs                                             |
| 6      | Token eviction and attention sparsity | H₂O (Zhang et al.); StreamingLLM (Xiao et al.)                                       | Q-Hitter (follow-on)                                                |
| 7      | Security risks in shared caches       | PromptPeek / Wu et al. (NDSS 2025)                                                   | Timing side-channel follow-ons (e.g. selective sharing mitigations) |

---

## Source table

### Foundations (attention, KV cache math)

| ID  | Title / artifact                                                                     | Authors / org  | Year | Category      | Core idea                                                                 | Techniques                             | Modules | Confidence | Link                             | Viz opportunity                                          | Notes                                                                                 |
| --- | ------------------------------------------------------------------------------------ | -------------- | ---- | ------------- | ------------------------------------------------------------------------- | -------------------------------------- | ------- | ---------- | -------------------------------- | -------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| S01 | Attention Is All You Need                                                            | Vaswani et al. | 2017 | paper         | Multi-head self-attention; scaled dot-product attention                   | MHA, Q/K/V projections                 | 1       | high       | https://arxiv.org/abs/1706.03762 | Heads as parallel “channels”; QKᵀ heatmaps               | Original MHA definition. Does **not** discuss KV cache (inference-serving concern).   |
| S02 | Fast Transformer Decoding: One Write-Head Is All You Need                            | Noam Shazeer   | 2019 | preprint      | Share K/V across query heads to cut decode bandwidth                      | Multi-Query Attention (MQA)            | 1, 3    | high       | https://arxiv.org/abs/1911.02150 | Collapse H KV heads → 1; memory bar shrinks              | Primary MQA source. **[NEEDS-VALIDATION]** quality trade-offs depend on model family. |
| S03 | GQA: Training Generalized Multi-Query Transformer Models from Multi-Head Checkpoints | Ainslie et al. | 2023 | paper (EMNLP) | Intermediate # of KV heads between MHA and MQA                            | Grouped-Query Attention (GQA)          | 1       | high       | https://arxiv.org/abs/2305.13245 | Groups of query heads sharing one KV head                | De facto architecture for many open models (Llama 2/3-style GQA).                     |
| S04 | FlashAttention: Fast and Memory-Efficient Exact Attention                            | Dao et al.     | 2022 | paper         | IO-aware tiled attention; avoids materializing full \(S \times S\) matrix | FlashAttention, tiling, online softmax | 1, 4    | high       | https://arxiv.org/abs/2205.14135 | SRAM tiles streaming over HBM; no giant attention matrix | Orthogonal to **KV cache storage**, but essential for prefill FLOPs/memory story.     |

### Paging and memory management

| ID  | Title / artifact                                                                 | Authors / org | Year    | Category     | Core idea                                                              | Techniques                                          | Modules | Confidence | Link                             | Viz opportunity                                             | Notes                                                                                                                                                                                                          |
| --- | -------------------------------------------------------------------------------- | ------------- | ------- | ------------ | ---------------------------------------------------------------------- | --------------------------------------------------- | ------- | ---------- | -------------------------------- | ----------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| S05 | Efficient Memory Management for Large Language Model Serving with PagedAttention | Kwon et al.   | 2023    | paper (SOSP) | Virtualize KV into fixed-size blocks + block table (OS paging analogy) | PagedAttention, block tables, copy-on-write sharing | 2, 5    | high       | https://arxiv.org/abs/2309.06180 | Logical blocks → physical pages; fragmentation before/after | Foundational for Module 2. Reports large waste from contiguous reservation in prior systems. **[NEEDS-VALIDATION]** exact % waste figures are workload-dependent—present as paper-reported, not universal law. |
| S06 | vLLM PagedAttention design docs                                                  | vLLM project  | ongoing | system-docs  | Production layout of paged K/V caches and kernels                      | Block size, strided layouts, scheduler integration  | 2       | high       | https://docs.vllm.ai/            | Live block pool + free list                                 | Prefer docs for implementation detail; paper for conceptual claims.                                                                                                                                            |

### Quantization of KV cache

| ID  | Title / artifact                                                                         | Authors / org | Year  | Category           | Core idea                                                               | Techniques                                                      | Modules | Confidence | Link                                 | Viz opportunity                                  | Notes                                                                                           |
| --- | ---------------------------------------------------------------------------------------- | ------------- | ----- | ------------------ | ----------------------------------------------------------------------- | --------------------------------------------------------------- | ------- | ---------- | ------------------------------------ | ------------------------------------------------ | ----------------------------------------------------------------------------------------------- |
| S07 | KIVI: A Tuning-Free Asymmetric 2bit Quantization for KV Cache                            | Liu et al.    | 2024  | paper (ICML)       | K and V have different outlier structure → asymmetric quant axes        | Per-channel K, per-token V, residual full-precision window      | 3       | high       | https://arxiv.org/abs/2402.02750     | Channel vs token grouping; bit-width meter       | Strong primary for Module 3. Residual length / group size are hyperparameters—call out as such. |
| S08 | KVQuant: Towards 10 Million Context Length LLM Inference with KV Cache Quantization      | Hooper et al. | 2024  | paper (NeurIPS)    | Sub-4-bit KV with per-channel keys, pre-RoPE options, non-uniform types | Dense-and-sparse, sensitivity-weighted datatypes                | 3       | medium     | https://arxiv.org/abs/2401.18079     | Outlier isolation; extreme context length “room” | Complementary to KIVI; more aggressive precision story.                                         |
| S09 | SmoothQuant: Accurate and Efficient Post-Training Quantization for Large Language Models | Xiao et al.   | 2023  | paper (ICML)       | Migrate activation difficulty into weights via smoothing                | W8A8-style smoothing; also applied to KV at 8-bit in follow-ons | 3       | high       | https://arxiv.org/abs/2211.10438     | Activation outlier “transfer” diagram            | Weight/activation PTQ; useful bridge to why naive low-bit KV fails. Not KV-only.                |
| S10 | vLLM FP8 KV-cache notes                                                                  | vLLM project  | 2026+ | blog / system-docs | Production FP8 KV reduces footprint & memory traffic in decode          | `--kv-cache-dtype fp8`, e4m3                                    | 3       | medium     | https://vllm.ai/ (project blog/docs) | FP16 vs FP8 cache striping                       | Practice evolves quickly—label as engineering practice, not timeless theory.                    |

### Prefill, decode, and scheduling

| ID  | Title / artifact                                                                                  | Authors / org  | Year | Category     | Core idea                                                      | Techniques                                                | Modules | Confidence | Link                                                     | Viz opportunity                                  | Notes                                                                           |
| --- | ------------------------------------------------------------------------------------------------- | -------------- | ---- | ------------ | -------------------------------------------------------------- | --------------------------------------------------------- | ------- | ---------- | -------------------------------------------------------- | ------------------------------------------------ | ------------------------------------------------------------------------------- |
| S11 | Orca: A Distributed Serving System for Transformer-Based Generative Models                        | Yu et al.      | 2022 | paper (OSDI) | Schedule at **iteration** granularity, not whole-request       | Continuous / iteration-level batching, selective batching | 4       | high       | https://www.usenix.org/conference/osdi22/presentation/yu | Batches reforming every step as sequences finish | Canonical continuous-batching paper. Throughput multipliers are setup-specific. |
| S12 | DistServe: Disaggregating Prefill and Decoding for Goodput-optimized Large Language Model Serving | Zhong et al.   | 2024 | paper (OSDI) | Run prefill and decode on separate resource pools              | Prefill–decode disaggregation; TTFT/TPOT goodput          | 4       | high       | https://arxiv.org/abs/2401.09670                         | Two GPU pools + KV transfer link                 | Explains interference between compute-bound prefill and memory-bound decode.    |
| S13 | SARATHI: Efficient LLM Inference by Piggybacking Decodes with Chunked Prefills                    | Agrawal et al. | 2023 | preprint     | Split prefills into chunks; fill leftover compute with decodes | Chunked prefill, decode-maximal batching                  | 4       | high       | https://arxiv.org/abs/2308.16369                         | Hybrid batch: small prefill chunk + many decodes | Precursor ideas to Sarathi-Serve.                                               |
| S14 | Taming Throughput-Latency Tradeoff in LLM Inference with Sarathi-Serve                            | Agrawal et al. | 2024 | paper (OSDI) | Stall-free schedules via chunked prefills for online serving   | Chunked prefills + stall-free batching                    | 4       | high       | https://arxiv.org/abs/2403.02310                         | Timeline without long prefill stalls             | Primary for modern hybrid batching pedagogy.                                    |

### Prefix caching / automatic reuse

| ID  | Title / artifact                                                      | Authors / org   | Year    | Category          | Core idea                                                    | Techniques                                           | Modules | Confidence | Link                                          | Viz opportunity                                        | Notes                                                                        |
| --- | --------------------------------------------------------------------- | --------------- | ------- | ----------------- | ------------------------------------------------------------ | ---------------------------------------------------- | ------- | ---------- | --------------------------------------------- | ------------------------------------------------------ | ---------------------------------------------------------------------------- |
| S15 | Efficiently Programming Large Language Models Using SGLang            | Zheng et al.    | 2023–   | preprint / system | Automatic multi-request KV reuse via radix tree of prefixes  | RadixAttention, prefix match, cache-aware scheduling | 5, 7    | high       | https://arxiv.org/abs/2312.07104              | Radix tree of tokens; shared trunk, branching suffixes | Core Module 5. Cache retention after request finish is the key mental model. |
| S16 | LMSYS: Fast and Expressive LLM Inference with SGLang & RadixAttention | LMSYS / authors | 2024    | blog              | Accessible explanation of RadixAttention reuse opportunities | System prompt sharing, multi-turn, few-shot reuse    | 5       | medium     | https://www.lmsys.org/blog/2024-01-17-sglang/ | Before/after TTFT with shared prefix                   | Good learner on-ramp; cite paper for formal claims.                          |
| S17 | Automatic Prefix Caching (vLLM and peers)                             | vLLM / industry | ongoing | system-docs       | Prefix caching without necessarily a radix tree API          | Block hashing / prefix hash tables                   | 5       | medium     | vLLM docs (prefix caching)                    | Hash-matched block chains                              | Teach as **family** of techniques; RadixAttention is one prominent design.   |

### Eviction and sparsity

| ID  | Title / artifact                                                                     | Authors / org | Year | Category          | Core idea                                                         | Techniques                              | Modules | Confidence | Link                             | Viz opportunity                                           | Notes                                                                                                                           |
| --- | ------------------------------------------------------------------------------------ | ------------- | ---- | ----------------- | ----------------------------------------------------------------- | --------------------------------------- | ------- | ---------- | -------------------------------- | --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| S18 | H₂O: Heavy-Hitter Oracle for Efficient Generative Inference of Large Language Models | Zhang et al.  | 2023 | paper (NeurIPS)   | Keep recent tokens + high cumulative-attention “heavy hitters”    | Dynamic KV eviction, submodular framing | 6       | high       | https://arxiv.org/abs/2306.14048 | Tokens glowing by cumulative attention; drop the dim ones | Classic eviction policy. Budget often described as recent + H₂ split (e.g. half/half in simple impls)—present as policy family. |
| S19 | Efficient Streaming Language Models with Attention Sinks                             | Xiao et al.   | 2023 | paper (ICLR 2024) | Initial tokens act as attention sinks; keep them + sliding window | Attention sinks, StreamingLLM           | 6       | high       | https://arxiv.org/abs/2309.17453 | Fixed sink tokens + moving window                         | Explains why naive window eviction collapses quality.                                                                           |
| S20 | Q-Hitter: A Better Token Oracle for Efficient LLM Inference                          | Zhang et al.  | 2024 | paper (MLSys)     | Combine heavy-hitter selection with quant-friendliness            | Joint eviction + quant                  | 6, 3    | medium     | https://proceedings.mlsys.org/   | Dual score (attention + quant fit)                        | Advanced; optional Module 6 extension.                                                                                          |

### Security of shared caches

| ID  | Title / artifact                                                                                    | Authors / org | Year  | Category     | Core idea                                                                               | Techniques                            | Modules | Confidence | Link                                                                                                                                                                                                                                           | Viz opportunity                                                 | Notes                                                                                                                                                                  |
| --- | --------------------------------------------------------------------------------------------------- | ------------- | ----- | ------------ | --------------------------------------------------------------------------------------- | ------------------------------------- | ------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| S21 | I Know What You Asked: Prompt Leakage via KV-Cache Sharing in Multi-Tenant LLM Serving (PROMPTPEEK) | Wu et al.     | 2025  | paper (NDSS) | Shared KV / prefix match creates timing & scheduling side channels; reconstruct prompts | PROMPTPEEK, LPM-aware probing         | 7       | high       | https://www.ndss-symposium.org/ndss-paper/i-know-what-you-asked-prompt-leakage-via-kv-cache-sharing-in-multi-tenant-llm-serving/ · PDF: https://www.ndss-symposium.org/wp-content/uploads/2025-1772-paper.pdf · DOI: 10.14722/ndss.2025.241772 | Attacker probes; cache-hit timing bars; token-by-token recovery | Flagship Module 7 paper. Do **not** present attack recipes as tutorials—teach threat model, observables (TTFT/order), and mitigations (isolation, rate limits, noise). |
| S22 | Selective KV-Cache Sharing to Mitigate Timing Side-Channels (and related mitigations literature)    | various       | 2025– | preprint     | Share less / share carefully to reduce API-visible leakage                              | Selective sharing, isolation policies | 7       | medium     | e.g. https://arxiv.org/html/2508.08438                                                                                                                                                                                                         | Tenant-colored cache partitions                                 | Fast-moving space; use for mitigation design space, not fixed “best practice.”                                                                                         |

### Systems and pedagogy anchors

| ID  | Title / artifact                                    | Authors / org                  | Year  | Category    | Core idea                                                              | Techniques                   | Modules | Confidence | Link                                                            | Viz opportunity                            | Notes                                               |
| --- | --------------------------------------------------- | ------------------------------ | ----- | ----------- | ---------------------------------------------------------------------- | ---------------------------- | ------- | ---------- | --------------------------------------------------------------- | ------------------------------------------ | --------------------------------------------------- |
| S23 | vLLM project                                        | UC Berkeley et al. / community | 2023– | system-docs | Production stack combining paging + continuous batching + prefix cache | Full serving stack           | 1–5     | high       | https://github.com/vllm-project/vllm                            | End-to-end “where memory goes” dashboard   | Primary open system reference.                      |
| S24 | SGLang project                                      | LMSYS / community              | 2023– | system-docs | Structured generation + RadixAttention runtime                         | Frontend + runtime           | 5, 7    | high       | https://github.com/sgl-project/sglang                           | Tree of shared prefixes in multi-user load | Pair with S15/S21.                                  |
| S25 | Continuous batching explainers (e.g. Anyscale blog) | industry                       | 2023  | blog        | Intuition for iteration-level batching vs static batches               | Continuous batching diagrams | 4       | medium     | https://www.anyscale.com/blog/continuous-batching-llm-inference | Static vs continuous timeline              | Cite Orca for priority claims; blogs for intuition. |

---

## Claims explicitly marked for later validation (Milestone 5 / issue #21)

These appear often in secondary content and must **not** be stated as universal facts without context:

1. **“KV cache is X% of GPU memory”** — Depends on model size, context, batch, weight precision, and concurrent sequences. Always parameterize with a worked example.
2. **“Systems waste 60–80% of KV memory without paging”** — Figures originate in PagedAttention/vLLM evaluations under specific reservation policies; restate as paper-reported results.
3. **Exact throughput multipliers** (e.g. “24× vs HuggingFace”) — Benchmark- and version-dependent; teach _mechanism_, show _example numbers_ with source.
4. **Quantization quality at 2-bit / 3-bit** — Model- and method-specific (KIVI vs KVQuant vs FP8); always name the method and residual strategy.
5. **Security success rates** — From specific lab setups (PROMPTPEEK scenarios); teach residual risk and mitigations, not guaranteed exploitability of every deployment.
6. **“Infinite context” claims** (StreamingLLM-style) — Means _streaming with bounded cache_, not lossless infinite memory of all past tokens.

---

## Suggested citation policy for lessons

1. Prefer **peer-reviewed** or widely cited arXiv primaries for mechanisms and formulas.
2. Use **system docs** for layouts, APIs, and production defaults.
3. Use **blogs** only for intuition; never as sole evidence of quantitative claims.
4. Every interactive metric panel should list **assumptions** (precision, GQA, block size, batch).
5. Cross-link glossary variables (`docs/glossary.md`) so formulas stay consistent across modules.

---

## Source type summary

| Type                              | Count (this inventory)  | Role                                          |
| --------------------------------- | ----------------------- | --------------------------------------------- |
| Peer-reviewed / conference papers | majority of S01–S21     | Authority for mechanisms                      |
| Preprints                         | several                 | Early systems + evolving security mitigations |
| System docs / repos               | S06, S10, S17, S23, S24 | Implementation truth                          |
| Blogs                             | S16, S25                | Pedagogy only                                 |

---

## Changelog

| Date       | Change                                                                                 |
| ---------- | -------------------------------------------------------------------------------------- |
| 2026-07-12 | Initial inventory for Milestone 0 (#1); module coverage matrix; NEEDS-VALIDATION list. |
