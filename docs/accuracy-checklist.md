# Technical accuracy checklist (Milestone 5 / #21)

Per-module review of formulas, terminology, claims, visual simplifications, and citations.  
**Review date:** 2026-07-12  
**Reviewer:** implementation pass against `docs/sources.md` + `docs/glossary.md`  
**Status:** complete for curriculum v2 (lessons 1–9)

---

## Global gates

| Gate                                                     | Result   | Evidence                                                                                                 |
| -------------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------- |
| Canonical \(M_{KV}\) matches code                        | **PASS** | `src/lib/kvMemory.ts` = `2 · B · L · H_kv · S · d_h · bpe`; glossary §2.1; test “512 MiB” worked example |
| GQA uses \(H_{kv}\) not \(H_q\)                          | **PASS** | `kvHeads` param; test “GQA is smaller than MHA” (4× when 8 vs 32)                                        |
| Logical blocks = \(\lceil S/P \rceil\)                   | **PASS** | `logicalBlocksForSequence`; paging tests                                                                 |
| Internal waste ≤ \(P-1\) tokens                          | **PASS** | `internalFragmentationTokens`; lesson 5 formula                                                          |
| Quant scaling is **payload-only**                        | **PASS** | Metrics use `quantBytesPerElement`; lessons disclose metadata/residuals                                  |
| Prefill/decode bottlenecks framed as tendencies          | **PASS** | Glossary §3; lesson 4 copy                                                                               |
| Security is defense-oriented                             | **PASS** | Lesson 9: no exploit steps; mitigations + residual risk                                                  |
| Paper % waste / throughput multipliers not universalized | **PASS** | Lessons 3–5 cite validation list; no “60–80% always” claims in MDX                                       |
| Every ready lesson has Sources + Assumptions             | **PASS** | All modules 1–9 MDX                                                                                      |

Unit tests: `npm test` (`kvMemory`, `simulationMetrics`, `eviction`).

---

## Per-module checklist

### Module 1 — Next word, again and again

| Item                                  | Status | Notes                                        |
| ------------------------------------- | ------ | -------------------------------------------- |
| Outcomes match `learning-outcomes.md` | PASS   | Autoregressive loop only                     |
| No premature jargon as H1             | PASS   | “Also known as” for autoregressive           |
| Quantitative claims                   | N/A    | No hard numbers required                     |
| Visual simplifications disclosed      | PASS   | Progress = teaching dial, not real token IDs |
| Citations                             | PASS   | Pedagogy-level; optional ARLM backdrop       |

**Unsupported claims found:** none.

### Module 2 — Looking back at the past

| Item                                  | Status | Notes                                                |
| ------------------------------------- | ------ | ---------------------------------------------------- |
| Q/K/V as roles not full paper algebra | PASS   | Explicit skip of full SDP derivation                 |
| Causal mask intuition                 | PASS   | Demo matrix is causal                                |
| Attention surface is schematic        | PASS   | `attentionDemo.ts` synthetic weights, not live model |
| Sources                               | PASS   | S01 primary                                          |

**Unsupported claims found:** none. Heatmap is illustrative only (documented in primitives / lesson).

### Module 3 — Remembering work already done

| Item                             | Status | Notes                                     |
| -------------------------------- | ------ | ----------------------------------------- |
| Formula = glossary               | PASS   | Live metric panel prints expanded product |
| Worked example 512 MiB           | PASS   | Same params as glossary §2.2              |
| Weights vs KV framing            | PASS   | Rough weight estimate labeled             |
| “X% of GPU” avoided as universal | PASS   | Assumptions callout                       |
| Sources                          | PASS   | S01–S03 + glossary                        |

**Unsupported claims found:** none remaining after curriculum pass.

### Module 4 — Reading the prompt vs writing the reply

| Item                            | Status | Notes                           |
| ------------------------------- | ------ | ------------------------------- |
| Prefill / decode definitions    | PASS   | Align glossary                  |
| Intensity metrics labeled proxy | PASS   | FLOPs/byte toy; not HW counters |
| Continuous batching simplified  | PASS   | Assumptions + Orca cite         |
| Sources                         | PASS   | S11–S14                         |

**Unsupported claims found:** none (no fixed “24× throughput” claims).

### Module 5 — Packing memory neatly

| Item                         | Status | Notes                                         |
| ---------------------------- | ------ | --------------------------------------------- |
| Paging mental model          | PASS   | Block table, internal/external frag           |
| Waste figures contextualized | PASS   | Explicit “workload-specific / paper-reported” |
| Scene ≠ live allocator       | PASS   | `holeEvery` deterministic demo                |
| Sources                      | PASS   | S05, S06                                      |

**NEEDS-VALIDATION (S05 waste %):** remains **contextual** — not taught as universal law. Status: **resolved for teaching** (framed correctly).

### Module 6 — Reusing work others already did

| Item                              | Status | Notes             |
| --------------------------------- | ------ | ----------------- |
| Exact token match for safe reuse  | PASS   | Lesson + glossary |
| Radix vs hash family              | PASS   | S15 + S17         |
| Logical length vs physical unique | PASS   | Metrics + copy    |
| Sources                           | PASS   | S15–S17           |

**Unsupported claims found:** none.

### Module 7 — Using fewer bits per value

| Item                    | Status | Notes                                      |
| ----------------------- | ------ | ------------------------------------------ |
| Payload scaling only    | PASS   | Formula + assumptions                      |
| Method-specific quality | PASS   | Names KIVI / KVQuant / FP8 practice        |
| Residual / metadata     | PASS   | Disclosed as reducing “perfect ÷N” savings |
| Sources                 | PASS   | S07–S10                                    |

**NEEDS-VALIDATION (2/3-bit quality):** **resolved for teaching** — method-named, not universal.

### Module 8 — Forgetting on purpose

| Item                          | Status | Notes                              |
| ----------------------------- | ------ | ---------------------------------- |
| Policies as families          | PASS   | window / sinks / heavy / h2o-style |
| Streaming ≠ infinite memory   | PASS   | Explicit                           |
| Eviction demo is toy keep-set | PASS   | `eviction.ts` + metric subtitle    |
| Sources                       | PASS   | S18, S19 (+ S20 optional)          |

**NEEDS-VALIDATION (“infinite context”):** **resolved for teaching**.

### Module 9 — When sharing leaks

| Item                                | Status | Notes                     |
| ----------------------------------- | ------ | ------------------------- |
| Threat model, not playbook          | PASS   | No step-by-step exploit   |
| Lab success rates not universalized | PASS   | Assumptions               |
| Mitigations listed                  | PASS   | Isolation control + prose |
| Sources                             | PASS   | S21, S22, S15             |

**NEEDS-VALIDATION (security rates):** **resolved for teaching**.

---

## Claims inventory (from `sources.md` § Milestone 5)

| #   | Claim class                  | Teaching decision                        |
| --- | ---------------------------- | ---------------------------------------- |
| 1   | KV as fixed % of GPU         | Always parameterize; never fixed % in UI |
| 2   | 60–80% waste without paging  | Paper-reported / workload-specific only  |
| 3   | Exact throughput multipliers | Teach mechanism; cite setup if quoting   |
| 4   | 2/3-bit quality              | Name method + residual strategy          |
| 5   | Security success rates       | Residual risk; lab-specific              |
| 6   | Infinite context streaming   | Bounded cache + streaming generation     |

All six are **handled** in lesson Assumptions / body text as of this review.

---

## Known limitations (visible to learners)

1. Metrics ignore CUDA context, allocator overhead, and multi-GPU.
2. Prefill/decode FLOPs are **proxies** for comparative intensity only.
3. Paging holes are a deterministic teaching layout, not a production free-list.
4. Eviction keep-sets use synthetic importance indices, not real attention scores.
5. Quant metrics ignore scales, zero-points, and residual FP windows in the byte count.
6. 3D token/page counts are **display-capped** for performance (`displayTokens` / `displayLayers`).

---

## Changelog

| Date       | Change                                                                      |
| ---------- | --------------------------------------------------------------------------- |
| 2026-07-12 | Milestone 5 accuracy pass for lessons 1–9; closed validation gates for #21. |
