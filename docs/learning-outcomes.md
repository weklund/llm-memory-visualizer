# Learner prerequisites and learning outcomes

Defines who this site is for, what we assume, and what each module must teach.  
Use this document to catch curriculum gaps **before** writing lessons or simulations.

**Last reviewed:** 2026-07-12  
**Status:** Milestone 0 — research foundation  
**Related issues:** #2

---

## Target learner profile

| Attribute | Definition |
|-----------|------------|
| **Primary audience** | Engineers, researchers, and advanced students who want a **systems + first-principles** mental model of LLM **inference memory**, not a product tutorial. |
| **Background** | Comfortable with Python-level ML code; has seen a Transformer block diagram; can reason about big-O and memory vs compute bottlenecks. |
| **Goals** | Explain *why* KV cache dominates long-context serving; map techniques (paging, quant, scheduling, prefix reuse, eviction, isolation) to concrete memory/latency effects; read papers and system docs with shared vocabulary. |
| **Non-goals** | Training from scratch; RLHF; full CUDA kernel authoring; vendor-specific ops runbooks; jailbreak/attack how-tos. |

### Personas (lightweight)

1. **Inference engineer** — ships or tunes vLLM/SGLang-class stacks; needs intuition for capacity planning and feature flags.  
2. **ML researcher** — designs architectures or algorithms that change KV footprint (GQA, MLA, eviction); needs accurate cost models.  
3. **Security / platform engineer** — multi-tenant serving; needs threat models for shared prefix caches.  
4. **Curious advanced learner** — strong CS + intro DL; willing to learn GPU memory hierarchy concepts along the way.

---

## Assumed prior knowledge

### Required (we will *not* re-teach from zero)

| Area | Assumed knowledge |
|------|-------------------|
| Transformers | Token embeddings, residual stream, multi-layer stack |
| Attention | Queries, keys, values; scaled dot-product; causal masking at a conceptual level |
| Autoregressive generation | Next-token prediction; left-to-right decoding |
| Basic numerics | FP16/BF16 exist; “lower bits → smaller memory” |
| Systems literacy | Processes share machines; caches can be shared or isolated; latency has percentiles |

### Soft prerequisites (brief refreshers OK in side panels)

| Area | What learners may be fuzzy on | How we handle it |
|------|------------------------------|------------------|
| Multi-head vs GQA/MQA | Why head counts differ for Q vs K/V | Short glossary + Module 1 diagram |
| GPU memory hierarchy | HBM vs on-chip SRAM; bandwidth-bound kernels | Module 1 + GPU pipeline primitive |
| Batching | Static vs continuous batching | Module 4 first-principles sequence |
| Quantization math | Scale, zero-point, per-channel | Module 3 + glossary formulas |
| OS paging analogy | Virtual vs physical pages | Module 2 builds the analogy carefully |

### Explicitly **out of scope** as prerequisites

- Deriving attention from information theory  
- Training-time optimizer / FSDP details  
- Full compiler stacks (Triton/XLA internals)  
- Legal/compliance frameworks beyond technical threat models  

---

## Global learning outcomes (whole site)

By completing the core path (Modules 1–3 minimum; 4–7 for full path), a learner should be able to:

1. **Compute** KV cache size from model hyperparameters and sequence/batch settings, including GQA.  
2. **Separate** *storage* pressure (bytes in HBM) from *bandwidth* pressure (bytes moved per decode step).  
3. **Explain** prefill vs decode phase characteristics (compute-bound vs memory-bound tendencies).  
4. **Map** each major technique class to which pressure it relieves (allocate smarter, compress, reuse, drop, isolate).  
5. **State assumptions** when quoting savings percentages from papers or benchmarks.  
6. **Reason about multi-tenant trade-offs** between cache sharing (efficiency) and leakage risk (security).

---

## Learning path

```text
[Prereq check]
      │
      ▼
 Module 1  KV growth & memory wall     ──►  shared primitives: MemoryGrid, TokenBlock
      │
      ▼
 Module 2  PagedAttention              ──►  pages, page tables
      │
      ▼
 Module 3  KV quantization             ──►  precision overlays
      │
      ├──────────────────────────────┐
      ▼                              ▼
 Module 4  Prefill/decode schedule   Module 5  Prefix / Radix
      │                              │
      ▼                              ▼
 Module 6  Eviction / sinks          Module 7  Shared-cache security
      │                              │
      └──────────►  synthesis / comparison matrix (issue #22)
```

**MVP path:** Modules 1–3 + citations (#13–#16).  
**Full path:** Modules 1–7.  
**Guided vs free exploration:** Mode switch is post-MVP (#24); outcomes below assume either path can hit the same objectives.

---

## Per-module learning outcomes

### Module 1 — KV cache growth and the memory wall

**Learner can:**

- State the role of the KV cache in avoiding recomputation during autoregressive decode.  
- Write and use the canonical KV memory formula (with named variables) for MHA and GQA.  
- Show how memory scales with batch size \(B\), sequence length \(S\), layers \(L\), and precision.  
- Distinguish weight memory (mostly fixed at load) from activation/KV memory (grows with context and concurrency).  
- Explain why long context + large batch collides with fixed HBM capacity (“memory wall” for serving).

**First-principles concepts to explain (do not hand-wave):**

- Why K and V are stored per layer (and per KV head).  
- Why decode repeatedly *reads* growing K/V (bandwidth).  
- What changes when \(H_{kv} < H_q\) (GQA/MQA).

**Prerequisites used:** MHA basics, FP16 size, batch/sequence as free variables.

**Assessment ideas:** Interactive calculator matching glossary formula; predict which knob doubles KV size.

---

### Module 2 — PagedAttention and fragmentation

**Learner can:**

- Describe external fragmentation and reservation waste when KV is one contiguous slab per sequence.  
- Explain logical blocks vs physical blocks and the block table (page table analogy).  
- Relate block size to internal fragmentation (last partial block).  
- Connect copy-on-write / shared blocks to prefix sharing at a high level (bridge to Module 5).

**First-principles concepts:**

- Virtualization of sequence positions → physical memory.  
- Why attention kernels must gather non-contiguous blocks.

**Prerequisites used:** Module 1 size model; OS paging analogy as *teaching tool* (not claiming GPU MMU identity).

**Assessment ideas:** Fragmentation before/after visualization; compute worst-case internal waste for given block size.

---

### Module 3 — KV cache quantization

**Learner can:**

- Apply bit-width scaling to the Module 1 formula (e.g. FP16 → FP8 → INT4/INT2 *payload*).  
- Explain scale/zero-point and why group size matters.  
- Contrast per-token vs per-channel grouping and why K vs V may differ (KIVI-style asymmetry).  
- List quality–compression trade-offs and residual full-precision windows as a common design pattern.  
- Separate **weight** quantization from **KV** quantization (orthogonal, often combined).

**First-principles concepts:**

- Outliers and dynamic range.  
- Dequant cost vs memory traffic savings in decode.

**Prerequisites used:** Module 1; soft intro to quant terms from glossary.

**Assessment ideas:** Same sequence in FP16 vs 2-bit payload; identify which axis was grouped.

---

### Module 4 — Prefill vs decode scheduling

**Learner can:**

- Characterize prefill (many tokens, often compute-heavy) vs decode (one token/step, often memory-bound on KV).  
- Explain iteration-level (continuous) batching vs static request-level batching.  
- Describe prefill–decode interference and why disaggregation or chunked prefills help.  
- Connect scheduling choices to TTFT and inter-token latency / TPOT.

**First-principles concepts:**

- Batch composition changing every iteration.  
- Hybrid batches (chunked prefill + decodes).

**Prerequisites used:** Modules 1–2; latency metric definitions from glossary.

**Assessment ideas:** Timeline scrubber: static vs continuous vs chunked-prefill schedules.

---

### Module 5 — Prefix caching and RadixAttention

**Learner can:**

- Identify workloads with shared prefixes (system prompts, multi-turn, few-shot templates).  
- Explain automatic prefix matching and reuse of KV for the shared trunk.  
- Describe a radix-tree (or equivalent) index over token sequences for insert/lookup/evict.  
- State when reuse saves **compute** (skip prefill of shared tokens) and **memory** (shared physical blocks).

**First-principles concepts:**

- Exact token-prefix identity requirement for safe KV reuse.  
- Retention of cache after a request finishes (policy).

**Prerequisites used:** Modules 1–2; optional bridge from Module 4 schedulers (LPM / cache-aware).

**Assessment ideas:** Two requests sharing a system prompt; measure unique vs shared blocks.

---

### Module 6 — Token eviction and attention sparsity

**Learner can:**

- Explain bounded-cache streaming: drop some past KV to free memory.  
- Contrast recency windows, attention-sink retention, and heavy-hitter (accumulated attention) policies.  
- State the quality risk: eviction is lossy relative to full context.  
- Relate “sparsity of attention mass” to why some tokens are kept.

**First-principles concepts:**

- Softmax competition and sink tokens.  
- Policy state (scores, windows) beyond raw K/V tensors.

**Prerequisites used:** Modules 1 and 3; attention score intuition.

**Assessment ideas:** Evict under three policies; compare kept sets for the same budget.

---

### Module 7 — Security risks in shared caches

**Learner can:**

- State the multi-tenant conflict: sharing KV/prefixes improves efficiency but creates shared state.  
- Describe **side-channel** observables (timing, scheduling priority) that can leak prefix presence—not that raw K/V is always returned to the client.  
- Outline a high-level threat model for prefix probing / prompt reconstruction research (PROMPTPEEK-class).  
- List mitigation directions: isolation domains, reduced sharing, rate limiting, noise, monitoring—without prescribing a single complete defense.

**First-principles concepts:**

- Cache hit ⇒ less work ⇒ observable latency/order differences.  
- Security is a first-class product of serving architecture, not an add-on slogan.

**Prerequisites used:** Module 5 strongly; Module 4 helpful.

**Assessment ideas:** Scenario cards: which deployments are in scope; which mitigations attack which assumption.

**Ethics note for content authors:** Teach defense-oriented understanding. Do not ship step-by-step exploit playbooks.

---

## Concepts requiring first-principles explanation

These should never appear as undefined jargon in the critical path:

| Concept | Introduced in | Why first-principles |
|---------|---------------|----------------------|
| KV cache purpose | M1 | Core object of the entire course |
| Bytes vs bandwidth | M1 | Avoid “memory” as a single fuzzy word |
| GQA/MQA head sharing | M1 | Changes the formula |
| Logical vs physical blocks | M2 | Paging analogy |
| Prefill vs decode | M4 (preview in M1) | Scheduling depends on it |
| Continuous batching | M4 | Industry default, poorly named |
| Prefix identity for reuse | M5 | Safety of sharing |
| Attention sink / heavy hitter | M6 | Eviction policies |
| Side channel vs direct disclosure | M7 | Correct threat model |

---

## Gap analysis checklist (pre-implementation)

Use before freezing Module N content:

- [ ] Every outcome has at least one interactive or worked example.  
- [ ] Every formula variable is in `docs/glossary.md`.  
- [ ] Every quantitative claim cites `docs/sources.md` and states assumptions.  
- [ ] Soft prerequisites have a hover/side-panel path, not a hard stop.  
- [ ] Module N does not require Module N+1 knowledge.  
- [ ] Security module does not require running attacks.  
- [ ] Comparison matrix (#22) can be filled from module outcomes.

---

## Changelog

| Date | Change |
|------|--------|
| 2026-07-12 | Initial prerequisites, global + per-module outcomes for Milestone 0 (#2). |
