# Paper index and technique comparison (Milestone 5 / #22)

Learner-facing literature map. Machine-readable twin: `src/content/paperIndex.ts` (References page in the app).

**Last reviewed:** 2026-07-12  
**Related:** `docs/sources.md` (full inventory), `/references` route

---

## How to use this page

1. Pick a **lesson** or a **technique family**.
2. Open primary sources (prefer peer-reviewed / arXiv primaries).
3. Use the **comparison matrix** for orientation only—cells are qualitative, not benchmarks.

**Precision rule:** Where papers report different workloads, we use relative bands (low / medium / high / varies), not fake single percentages.

---

## Paper index by category

### Foundations (attention & cache structure)

| ID  | Title                           | Year | Modules | Link                             |
| --- | ------------------------------- | ---- | ------- | -------------------------------- |
| S01 | Attention Is All You Need       | 2017 | 2, 3    | https://arxiv.org/abs/1706.03762 |
| S02 | Fast Transformer Decoding (MQA) | 2019 | 3       | https://arxiv.org/abs/1911.02150 |
| S03 | GQA                             | 2023 | 3       | https://arxiv.org/abs/2305.13245 |
| S04 | FlashAttention                  | 2022 | 3, 4    | https://arxiv.org/abs/2205.14135 |

### Prefill, decode, scheduling

| ID  | Title                           | Year | Modules | Link                                                     |
| --- | ------------------------------- | ---- | ------- | -------------------------------------------------------- |
| S11 | Orca (iteration-level batching) | 2022 | 4       | https://www.usenix.org/conference/osdi22/presentation/yu |
| S12 | DistServe                       | 2024 | 4       | https://arxiv.org/abs/2401.09670                         |
| S13 | SARATHI (chunked prefill)       | 2023 | 4       | https://arxiv.org/abs/2308.16369                         |
| S14 | Sarathi-Serve                   | 2024 | 4       | https://arxiv.org/abs/2403.02310                         |

### Paging & memory management

| ID  | Title                       | Year    | Modules | Link                             |
| --- | --------------------------- | ------- | ------- | -------------------------------- |
| S05 | PagedAttention / vLLM paper | 2023    | 5, 6    | https://arxiv.org/abs/2309.06180 |
| S06 | vLLM design docs            | ongoing | 5       | https://docs.vllm.ai/            |

### Prefix reuse

| ID  | Title                                  | Year    | Modules | Link                                          |
| --- | -------------------------------------- | ------- | ------- | --------------------------------------------- |
| S15 | SGLang / RadixAttention                | 2023–   | 6, 9    | https://arxiv.org/abs/2312.07104              |
| S16 | LMSYS SGLang blog                      | 2024    | 6       | https://www.lmsys.org/blog/2024-01-17-sglang/ |
| S17 | Automatic prefix caching (vLLM family) | ongoing | 6       | vLLM docs                                     |

### KV quantization

| ID  | Title             | Year    | Modules | Link                             |
| --- | ----------------- | ------- | ------- | -------------------------------- |
| S07 | KIVI              | 2024    | 7       | https://arxiv.org/abs/2402.02750 |
| S08 | KVQuant           | 2024    | 7       | https://arxiv.org/abs/2401.18079 |
| S09 | SmoothQuant       | 2023    | 7       | https://arxiv.org/abs/2211.10438 |
| S10 | vLLM FP8 KV notes | ongoing | 7       | vLLM project docs/blog           |

### Eviction / streaming

| ID  | Title                          | Year | Modules | Link                             |
| --- | ------------------------------ | ---- | ------- | -------------------------------- |
| S18 | H₂O                            | 2023 | 8       | https://arxiv.org/abs/2306.14048 |
| S19 | StreamingLLM (attention sinks) | 2023 | 8       | https://arxiv.org/abs/2309.17453 |
| S20 | Q-Hitter                       | 2024 | 8, 7    | MLSys proceedings                |

### Security of shared caches

| ID  | Title                           | Year  | Modules | Link                                                                                                                             |
| --- | ------------------------------- | ----- | ------- | -------------------------------------------------------------------------------------------------------------------------------- |
| S21 | PROMPTPEEK / Wu et al. (NDSS)   | 2025  | 9       | https://www.ndss-symposium.org/ndss-paper/i-know-what-you-asked-prompt-leakage-via-kv-cache-sharing-in-multi-tenant-llm-serving/ |
| S22 | Selective sharing / mitigations | 2025– | 9       | e.g. https://arxiv.org/html/2508.08438                                                                                           |

### Systems anchors

| ID  | Title                          | Modules | Link                                  |
| --- | ------------------------------ | ------- | ------------------------------------- |
| S23 | vLLM project                   | 1–5     | https://github.com/vllm-project/vllm  |
| S24 | SGLang project                 | 6, 9    | https://github.com/sgl-project/sglang |
| S25 | Continuous batching explainers | 4       | e.g. Anyscale blog                    |

---

## Technique comparison matrix

Qualitative only. **Memory saved** = typical direction under favorable load. **Accuracy risk** = quality/correctness or privacy risk if misapplied. **Complexity** = engineering surface area.

| Technique                       | Lesson | Primary pressure relieved   | Memory saved            | Latency impact                     | Accuracy / privacy risk      | Impl. complexity | Serving fit                          |
| ------------------------------- | ------ | --------------------------- | ----------------------- | ---------------------------------- | ---------------------------- | ---------------- | ------------------------------------ |
| MHA → GQA/MQA                   | 3      | KV storage & bandwidth      | High (vs MHA)           | Decode often better                | Model-dependent quality      | Medium (arch)    | Most open LLMs                       |
| Continuous / iteration batching | 4      | GPU idle slots              | Indirect (util.)        | Higher throughput; TTFT trade-offs | Low (scheduling)             | High             | Production servers                   |
| Chunked prefill / hybrid batch  | 4      | Prefill–decode interference | Indirect                | Smoother TPOT under load           | Low                          | High             | Online serving                       |
| Prefill–decode disaggregation   | 4      | Phase interference          | Indirect                | Goodput under SLOs                 | Low                          | High             | Large fleets                         |
| PagedAttention                  | 5      | Fragmentation / waste       | Medium–high\*           | Enables larger batch               | Low                          | High             | vLLM-class                           |
| Prefix / radix caching          | 6      | Redundant prefill + pages   | High on shared prefixes | Lower TTFT on hits                 | **Privacy** if multi-tenant  | High             | Multi-user templates                 |
| KV quantization                 | 7      | Bytes per value             | Medium–high\*\*         | Decode bandwidth help              | Method-specific quality      | Medium–high      | FP8 common; 2–4bit research/prod mix |
| Window eviction                 | 8      | Bound cache size            | High                    | Enables long streams               | High quality risk            | Low              | Streaming                            |
| Attention sinks + window        | 8      | Bound cache size            | High                    | Long streams                       | Lower risk than naïve window | Medium           | StreamingLLM-style                   |
| Heavy-hitter / H₂O-style        | 8      | Bound cache size            | High                    | Long streams                       | Policy-dependent             | Medium           | Research → systems                   |
| Cache isolation                 | 9      | Side-channel surface        | Negative (less reuse)   | May raise TTFT                     | Privacy improves             | Medium           | Multi-tenant                         |

\* Paging savings vs **contiguous max-reservation** policies; not free memory from nowhere.  
\*\* Payload scaling; residual windows and scales reduce idealized ratios.

### Dimension definitions (avoid fake precision)

| Dimension        | Meaning here                                             |
| ---------------- | -------------------------------------------------------- |
| Memory saved     | Directional effect on unique KV bytes or usable capacity |
| Latency impact   | Typical TTFT/TPOT/goodput story—not a single number      |
| Accuracy risk    | Output quality degradation **or** privacy leakage risk   |
| Impl. complexity | Kernel + scheduler + config surface                      |
| Serving fit      | Where the technique commonly shows up                    |

---

## Module → sources (quick links)

| Lesson | Primary                  | Secondary                              |
| ------ | ------------------------ | -------------------------------------- |
| 1      | Pedagogy / AR generation | Product LLM explainers                 |
| 2      | S01                      | Illustrated attention (intuition only) |
| 3      | S01, S02, S03            | vLLM docs; S04 for attention IO        |
| 4      | S11–S14                  | S25                                    |
| 5      | S05                      | S06                                    |
| 6      | S15                      | S16, S17                               |
| 7      | S07, S08                 | S09, S10                               |
| 8      | S18, S19                 | S20                                    |
| 9      | S21                      | S22, S15                               |

---

## Changelog

| Date       | Change                                                      |
| ---------- | ----------------------------------------------------------- |
| 2026-07-12 | Initial paper index + qualitative technique matrix for #22. |
