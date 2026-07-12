# Glossary and canonical memory formulas

Shared vocabulary and formulas for all lessons and simulations.  
If a lesson needs a new symbol, **add it here first** so modules stay consistent.

**Last reviewed:** 2026-07-12  
**Status:** Canonical formulas (validated Milestone 5 / #21)  
**Related issues:** #3, #16, #21

---

## 1. Canonical variables

| Symbol                | Name                         | Unit / type      | Notes                                                                |
| --------------------- | ---------------------------- | ---------------- | -------------------------------------------------------------------- |
| \(B\)                 | Batch size                   | sequences        | Concurrent sequences in a batch / step                               |
| \(S\)                 | Sequence length              | tokens           | Cached tokens per sequence (prompt + generated so far), unless noted |
| \(S_{\text{prompt}}\) | Prompt length                | tokens           | Prefill input length                                                 |
| \(S_{\text{gen}}\)    | Generated length             | tokens           | Decode steps completed                                               |
| \(L\)                 | Number of transformer layers | count            | Often `num_hidden_layers`                                            |
| \(H_q\)               | Query heads                  | count            | `num_attention_heads`                                                |
| \(H_{kv}\)            | Key/Value heads              | count            | `num_key_value_heads`; equals \(H_q\) for MHA                        |
| \(d_h\)               | Head dimension               | elements         | Often `head_dim`; sometimes \(d_k\)                                  |
| \(d_{\text{model}}\)  | Model hidden size            | elements         | Often \(H_q \cdot d_h\) for MHA                                      |
| \(bpe\)               | Bytes per element            | bytes            | 2 for FP16/BF16; 1 for FP8; 0.5 for INT4 payload, etc.               |
| \(P\)                 | Page / block size            | tokens per block | PagedAttention block size (commonly 16 in examples)                  |
| \(N_{\text{blocks}}\) | Physical blocks              | count            | In the global block pool                                             |
| \(g\)                 | Quantization group size      | elements         | Along the grouped axis                                               |
| \(r\)                 | Residual length              | tokens           | Recent tokens kept at higher precision (e.g. KIVI-style)             |

**Simplification (global):** Unless stated, formulas count **KV cache activations only**, not weights, optimizer state, or temporary attention workspace.

---

## 2. Core KV cache memory formula

### 2.1 Elements and bytes (per sequence group)

For **one** sequence of length \(S\), full layers, standard decoder-only cache:

\[
N_{\text{elem}}
= 2 \cdot L \cdot H_{kv} \cdot S \cdot d_h
\]

- Factor **2**: keys **and** values.
- \(H_{kv}\): use query heads only when the model is pure MHA (\(H_{kv} = H_q\)).

**Bytes:**

\[
M_{\text{KV}}
= N_{\text{elem}} \cdot bpe
= 2 \cdot L \cdot H_{kv} \cdot S \cdot d_h \cdot bpe
\]

**With batch \(B\) concurrent sequences** (no cross-sequence sharing):

\[
M_{\text{KV}}(B)
= 2 \cdot B \cdot L \cdot H_{kv} \cdot S \cdot d_h \cdot bpe
\]

### 2.2 Worked example (verify arithmetic in lessons)

Llama-style **illustrative** config (not a specific checkpoint claim):

| Param      | Value    |
| ---------- | -------- |
| \(L\)      | 32       |
| \(H_q\)    | 32       |
| \(H_{kv}\) | 8 (GQA)  |
| \(d_h\)    | 128      |
| \(S\)      | 4096     |
| \(B\)      | 1        |
| \(bpe\)    | 2 (FP16) |

\[
M_{\text{KV}}
= 2 \cdot 1 \cdot 32 \cdot 8 \cdot 4096 \cdot 128 \cdot 2
= 536{,}870{,}912 \text{ bytes}
\approx 512\,\text{MiB}
\]

**Check:** \(2 \times 32 \times 8 \times 4096 \times 128 \times 2 = 2 \times 32 \times 8 \times 2^{12} \times 2^7 \times 2 = 2^{29} = 512\,\text{MiB}\).

If this were **MHA** with \(H_{kv}=32\), memory would be **4×** larger (same other params).

### 2.3 GQA / MQA

| Attention type | \(H_{kv}\)                                                        | Cache vs MHA (same \(H_q, d_h\)) |
| -------------- | ----------------------------------------------------------------- | -------------------------------- |
| MHA            | \(H_q\)                                                           | baseline                         |
| GQA            | \(H_q / G\) for \(G\) groups (equivalently `num_key_value_heads`) | \(H_{kv}/H_q\) of MHA            |
| MQA            | 1                                                                 | \(1/H_q\) of MHA                 |

**Simplification:** Real models may use different \(d_h\) packing or fused layouts; we ignore padding/alignment unless a module is about kernels.

### 2.4 Precision scaling

If only the **payload** bit-width changes and scales/metadata are ignored:

\[
M_{\text{KV}}(bpe') \approx M_{\text{KV}}(bpe) \cdot \frac{bpe'}{bpe}
\]

| Format       | Typical \(bpe\) | Relative to FP16 |
| ------------ | --------------- | ---------------- |
| FP32         | 4               | 2×               |
| FP16 / BF16  | 2               | 1×               |
| FP8          | 1               | 0.5×             |
| INT4 payload | 0.5             | 0.25×            |
| INT2 payload | 0.25            | 0.125×           |

**Simplification:** Real INT2/INT4 schemes store **scales, zero-points, residual FP16 windows, and sparse outliers**. Teach payload scaling as a lower bound on savings, then add metadata overhead in Module 3.

### 2.5 What this formula is **not**

- Not the size of the **full attention matrix** \(S \times S\) (FlashAttention avoids materializing it).
- Not **weight** memory (\(M_{\text{weights}} \approx \#params \cdot bpe_{\text{w}}\)).
- Not peak training memory.
- Not automatic for **shared** prefix blocks (those reduce _unique_ physical bytes; logical \(S\) per request is unchanged).

---

## 3. Prefill vs decode

| Term           | Definition                                                       | Typical bottleneck tendency                                   |
| -------------- | ---------------------------------------------------------------- | ------------------------------------------------------------- |
| **Prefill**    | Process all prompt tokens; populate KV for \(S_{\text{prompt}}\) | Often **compute-bound** (large matmuls); builds initial cache |
| **Decode**     | Generate tokens one (or few) at a time; append K/V each step     | Often **memory-bandwidth-bound** (reload weights + read KV)   |
| **TTFT**       | Time to first token                                              | Dominated by prefill (+ queue)                                |
| **TPOT / ITL** | Time per output token / inter-token latency                      | Decode step time                                              |
| **Goodput**    | Throughput under latency SLOs (DistServe-style framing)          | Not raw tokens/s alone                                        |

**Simplification:** “Compute-bound prefill / memory-bound decode” is a **common tendency**, not a theorem. Short prompts, heavy quant, or odd batch shapes can flip the bottleneck. Simulations should expose FLOPs and bytes moved as separate meters.

### Continuous / iteration-level batching

| Term                                      | Definition                                                                                          |
| ----------------------------------------- | --------------------------------------------------------------------------------------------------- |
| **Static (request-level) batching**       | Batch fixed until all sequences finish; early finishers idle slots                                  |
| **Continuous / iteration-level batching** | Scheduler reforms batch **each model iteration**; completed sequences free slots immediately (Orca) |
| **Chunked prefill**                       | Split a long prefill into token chunks across iterations (Sarathi)                                  |
| **Hybrid batch**                          | Same iteration mixes decode tokens and a prefill chunk                                              |
| **Prefill–decode disaggregation**         | Separate hardware pools for prefill vs decode (DistServe)                                           |

---

## 4. Memory hierarchy and performance vocabulary

| Term                            | Definition                                                                                      | Teaching use                            |
| ------------------------------- | ----------------------------------------------------------------------------------------------- | --------------------------------------- |
| **HBM**                         | High-bandwidth GPU device memory (large, slower than on-chip)                                   | Where KV cache and weights live at rest |
| **SRAM**                        | On-chip memory (SMs / tensor memory; small, fast)                                               | FlashAttention tiles; working set       |
| **Bandwidth**                   | Bytes/s movable between HBM and compute                                                         | Decode often limited by this            |
| **FLOPs**                       | Floating-point operations                                                                       | Prefill attention/MLP volume            |
| **Arithmetic intensity**        | FLOPs per byte moved                                                                            | Low intensity ⇒ bandwidth-bound         |
| **Memory wall (serving sense)** | Context × concurrency growth exhausts HBM or starves bandwidth before “enough” FLOPs are usable | Module 1 framing                        |

**Simplification:** We do not model multi-GPU NVLink topologies in MVP formulas.

---

## 5. Paging and PagedAttention

| Term                        | Definition                                                                             |
| --------------------------- | -------------------------------------------------------------------------------------- |
| **Logical block**           | Contiguous span of \(P\) **token positions** in a sequence’s KV                        |
| **Physical block**          | Concrete memory slot holding one logical block’s K/V (per layer layout as implemented) |
| **Block table**             | Map: (sequence, logical block index) → physical block id (like a page table)           |
| **Block / page size \(P\)** | Tokens per block (example default in literature: 16)                                   |
| **External fragmentation**  | Free memory exists but not as one usable contiguous reservation for a new sequence     |
| **Internal fragmentation**  | Waste inside the last partially filled block (\(< P\) tokens)                          |
| **Copy-on-write sharing**   | Multiple sequences point at the same physical block until a divergent write            |

**Blocks needed for length \(S\):**

\[
N_{\text{logical}}(S) = \left\lceil \frac{S}{P} \right\rceil
\]

**Worst-case internal waste (tokens):** up to \(P - 1\) per sequence (last block).

**Simplification:** Real engines store K and V with specific strides and may separate K/V pools; lessons may show a single “page” glyph for both unless teaching kernel layout.

---

## 6. Prefix caching and RadixAttention

| Term                       | Definition                                                                                 |
| -------------------------- | ------------------------------------------------------------------------------------------ |
| **Prefix**                 | Leading token sequence of a prompt                                                         |
| **Prefix match**           | Longest exact token identity shared with a cached entry                                    |
| **Prefix caching**         | Retain and reuse KV for matched prefixes across requests                                   |
| **RadixAttention**         | SGLang approach: index retained KV in a **radix tree** over tokens for lookup/insert/evict |
| **Shared trunk**           | Physical KV blocks reused by multiple requests with a common prefix                        |
| **Cache-aware scheduling** | Prefer batches/requests that hit existing prefixes (e.g. longest-prefix policies)          |

**Simplification:** Safe reuse requires **exact** token identity (and consistent model/adapter/position handling as implemented). We do not teach approximate semantic cache as equivalent to KV prefix cache.

---

## 7. Eviction and sparsity

| Term                  | Definition                                                                              |
| --------------------- | --------------------------------------------------------------------------------------- |
| **KV eviction**       | Drop selected tokens’ K/V to bound memory                                               |
| **Sliding window**    | Keep only the last \(W\) tokens                                                         |
| **Attention sink**    | Initial tokens that attract large attention mass; StreamingLLM keeps them with a window |
| **Heavy hitter (H₂)** | Tokens with large **accumulated** attention scores; H₂O keeps them plus recent tokens   |
| **Cache budget**      | Max tokens (or bytes) retained per sequence/layer/head                                  |

**Simplification:** Eviction is **lossy** vs full context. “Infinite length” streaming means **unbounded generation with bounded cache**, not perfect recall of all history.

---

## 8. Quantization terms

| Term                                  | Definition                                                                    |
| ------------------------------------- | ----------------------------------------------------------------------------- |
| **Scale**                             | Multiplier mapping integer bins ↔ real range                                  |
| **Zero-point**                        | Offset for asymmetric quant                                                   |
| **Per-tensor**                        | One scale for entire tensor                                                   |
| **Per-token**                         | Scales along sequence/token axis                                              |
| **Per-channel**                       | Scales along channel / head-dim axis                                          |
| **Group-wise**                        | Scales per groups of \(g\) elements                                           |
| **Outlier**                           | Values with large magnitude that stretch ranges                               |
| **Asymmetric KV quant (KIVI-style)**  | Quantize **K per-channel**, **V per-token** (common teaching summary of KIVI) |
| **Residual / mixed precision window** | Keep newest \(r\) tokens in higher precision                                  |

**Linear quant sketch (unsigned illustration):**

\[
x_{q} = \operatorname{clamp}\left(\left\lfloor \frac{x}{s} \right\rfloor + z,\ 0,\ 2^{n}-1\right),
\quad
\hat{x} = s \cdot (x_q - z)
\]

**Simplification:** Lessons may use symmetric quant (\(z=0\)) when teaching; note real kernels vary (FP8 formats, non-uniform codes, etc.).

---

## 9. Security and multi-tenancy

| Term                        | Definition                                                                                        |
| --------------------------- | ------------------------------------------------------------------------------------------------- |
| **Multi-tenant serving**    | Mutually distrusting users share a model endpoint / GPU cache pool                                |
| **Shared KV / prefix pool** | Cross-request reuse of cache blocks                                                               |
| **Side channel**            | Indirect leakage via timing, ordering, or resource contention—not necessarily reading raw tensors |
| **Cache hit oracle**        | Ability to infer whether a prefix was already cached from observables (e.g. faster TTFT)          |
| **PROMPTPEEK-class attack** | Research attacks that reconstruct prompts by probing shared-cache behavior (NDSS 2025 Wu et al.)  |
| **Isolation**               | Restrict sharing to a trust domain (user, org, API key)                                           |

**Simplification:** Module 7 teaches **threat models and mitigations**, not operational exploit recipes.

---

## 10. Metric model for simulations (shared state)

Simulations should expose a consistent metric object (see issue #8) derived from these formulas:

| Metric                   | Suggested definition                                          |
| ------------------------ | ------------------------------------------------------------- |
| `kvBytesLogical`         | \(M_{\text{KV}}(B)\) ignoring physical sharing                |
| `kvBytesPhysical`        | Unique physical blocks × bytes per block                      |
| `fragmentationInternal`  | Unused slots in tail blocks                                   |
| `fragmentationExternal`  | Unusable holes (story-driven in Module 2)                     |
| `bandwidthPerDecodeStep` | Bytes read for weights + KV (simplified models OK if labeled) |
| `prefixHitTokens`        | Tokens served from cache reuse                                |
| `cacheBudgetTokens`      | Eviction budget                                               |
| `precisionBpe`           | Active \(bpe\)                                                |

Every on-screen number must list **assumptions**: \(L, H_{kv}, d_h, S, B, bpe, P\).

---

## 11. Terms index (A–Z quick list)

Attention sink · Arithmetic intensity · Block table · Continuous batching · Decode · External fragmentation · FlashAttention · GQA · Goodput · HBM · Heavy hitter · Internal fragmentation · KV cache · MHA · MQA · PagedAttention · Prefill · Prefix caching · PROMPTPEEK · Quantization group · RadixAttention · Residual length · SRAM · TTFT · TPOT

---

## 12. Changelog

| Date       | Change                                                                                                   |
| ---------- | -------------------------------------------------------------------------------------------------------- |
| 2026-07-12 | Initial glossary + canonical KV formula, paging, quant, scheduling, security terms for Milestone 0 (#3). |
