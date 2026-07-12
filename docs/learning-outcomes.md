# Learner prerequisites and learning outcomes

Defines who this site is for, what we assume, and what each module must teach.  
Use this document to catch curriculum gaps **before** writing lessons or simulations.

**Last reviewed:** 2026-07-12  
**Status:** Curriculum v2 — first-principles path  
**Related issues:** #2 (original), home-page / path reframing

---

## Design principle

**Teach the dependency graph, not the paper title list.**

Someone who only knows “an LLM predicts the next word” should be able to start at Module 1 and **earn** terms like KV cache, prefill, and PagedAttention. Paper names and system jargon appear **after** the idea they name—not as the module’s front door.

Each module answers: _what can you understand now that you could not before?_  
Each module states: _what it builds on_ from earlier lessons.

---

## Target learner profile

| Attribute                 | Definition                                                                                                                                                             |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Primary audience**      | Curious engineers, students, and practitioners who want a **first-principles → systems** path into LLM **inference memory**.                                           |
| **Entry bar**             | High-level idea of what an LLM is (chat / next-token generation). Basic comfort with “bytes take space” and “faster vs slower.” Optional: light programming literacy.  |
| **Not required at start** | Transformer block diagrams, attention math, GPU architecture, serving frameworks (vLLM, etc.).                                                                         |
| **Goals**                 | Build an internal model of _why_ generation needs memory, _what_ is stored, _how big_ it gets, and _how systems_ pack, reuse, compress, drop, and isolate that memory. |
| **Non-goals**             | Training from scratch; RLHF; full CUDA kernels; vendor ops runbooks; exploit tutorials.                                                                                |

### Personas (lightweight)

1. **Curious developer** — uses ChatGPT-class tools; wants to know what “context” and “memory” mean under the hood.
2. **Engineer moving into inference** — solid CS; sparse ML theory; will later touch vLLM/SGLang.
3. **ML practitioner** — knows training better than serving; needs the decode-time memory story.
4. **Platform / security engineer** — joins mid-path for sharing and isolation; still benefits from Modules 1–3.

---

## Assumed prior knowledge

### Required at Module 1 (true entry)

| Area                | Assumed knowledge                                                              |
| ------------------- | ------------------------------------------------------------------------------ |
| LLM (product level) | Models generate text by predicting plausible next pieces of text from a prompt |
| Conversation        | Longer chats / documents mean “more context” for the model                     |
| Scale intuition     | Computers have limited fast memory; more data can mean more cost or latency    |
| Numeracy            | Multiplication, “grows with length,” orders of magnitude (KB / MB / GB)        |

### Explicitly **not** required at start

- Multi-head attention, Q/K/V, softmax
- Residual streams, layer norms, positional encodings (beyond “order matters”)
- Prefill/decode, KV cache, HBM, FLOPs
- Paging, quantization, continuous batching

These are **taught in path**, not gatekept.

### Soft skills that help (never blocking)

| Area                 | How we handle gaps                                                       |
| -------------------- | ------------------------------------------------------------------------ |
| Big-O intuition      | Spoken in plain language (“doubling length roughly doubles this memory”) |
| Floating-point sizes | Introduced when precision first matters (Module 3+)                      |
| Multi-tenant servers | Introduced only when sharing appears (Module 6+)                         |

---

## Global learning outcomes (whole path)

By finishing the path, a learner should be able to:

1. **Describe** autoregressive generation as a loop (context → next token → append → repeat).
2. **Explain** attention as “choosing what to look at in the past,” including the roles of query, key, and value **without** deriving the full paper math.
3. **Motivate** the KV cache as “don’t recompute past keys/values every step.”
4. **Compute** KV cache size from simple hyperparameters (including “fewer KV heads save memory”).
5. **Separate** _storage_ (bytes sitting in GPU memory) from _bandwidth_ (bytes moved each step).
6. **Contrast** prompt processing vs token-by-token generation and why they bottleneck differently.
7. **Map** each technique class to a pressure it relieves: pack better, reuse, compress, drop, isolate.
8. **State assumptions** when quoting savings from papers or blogs.
9. **Reason** about multi-tenant trade-offs between shared prefixes (speed/cost) and leakage risk.

---

## Learning path (ordered)

Ideas only appear **after** their dependencies.

```text
  You know: "LLMs write text from a prompt"
                    │
                    ▼
     ┌──────────────────────────────────┐
     │ 1  Next word, again and again    │  autoregressive loop, tokens, context
     └──────────────────────────────────┘
                    │
                    ▼
     ┌──────────────────────────────────┐
     │ 2  Looking back at the past      │  attention roles Q / K / V (intuition)
     └──────────────────────────────────┘
                    │
                    ▼
     ┌──────────────────────────────────┐
     │ 3  Remembering work already done │  KV cache, size formula, memory wall
     └──────────────────────────────────┘
                    │
                    ▼
     ┌──────────────────────────────────┐
     │ 4  Reading the prompt vs writing │  prefill vs decode, compute vs bandwidth
     └──────────────────────────────────┘
                    │
          ┌─────────┴─────────┐
          ▼                   ▼
 ┌─────────────────┐  ┌─────────────────┐
 │ 5  Packing       │  │ 6  Reusing       │  pages / fragmentation   shared prefixes
 │    memory neatly │  │    work others   │  (needs size model)     (needs cache + phases)
 └─────────────────┘  │    already did   │
          │           └─────────────────┘
          │                   │
          ▼                   ▼
 ┌─────────────────┐  ┌─────────────────┐
 │ 7  Using fewer   │  │ 8  Forgetting    │  quantization           eviction / sinks
 │    bits per value│  │    on purpose    │
 └─────────────────┘  └─────────────────┘
                    │
                    ▼
     ┌──────────────────────────────────┐
     │ 9  When sharing leaks            │  multi-tenant side channels (needs Module 6)
     └──────────────────────────────────┘
                    │
                    ▼
            comparison / synthesis
```

| Stage              | Modules | Question the learner can answer                                  |
| ------------------ | ------- | ---------------------------------------------------------------- |
| **Foundations**    | 1–2     | How does generation work, and what does “looking back” mean?     |
| **Core memory**    | 3–4     | What is stored, how large is it, when does the model pay for it? |
| **Systems tricks** | 5–8     | How do engines pack, reuse, compress, and drop that memory?      |
| **Consequences**   | 9       | What goes wrong when memory is shared across distrusting users?  |

**Suggested MVP content build order (implementation):**  
Foundations + core memory first (1→4), then 5, then 6, then 7–8, then 9.  
**MVP learner path to a solid “aha”:** Modules 1–4.  
**Full path:** 1–9.

**Guided vs free exploration:** Lesson shell mode switch (#24). Default is **Guided** (step tours in `guidedSteps.ts`); **Free explore** exposes full sliders. Choice persists in `localStorage`.

---

## Per-module learning outcomes

### Module 1 — Next word, again and again

**Plain title:** Next word, again and again  
**Also known as:** Autoregressive generation, decoding loop  
**Builds on:** Entry assumptions only  
**Introduces:** Token, prompt, context, generate-one-then-append loop, why length grows over a conversation

**Learner can:**

- Describe generation as a loop, not a single “understand then reply” step.
- Explain why longer prompts / longer replies mean more past text is in play.
- Distinguish _user-visible context_ (the text) from “the model must process that text somehow” (setup for Module 2).

**Does not require:** Attention, transformers, GPUs.

---

### Module 2 — Looking back at the past

**Plain title:** Looking back at the past  
**Also known as:** Attention, Q/K/V intuition  
**Builds on:** Module 1  
**Introduces:** “For each new token, decide how much past tokens matter”; query / key / value as roles; many layers = repeated looking; causal “can’t look at the future”

**Learner can:**

- Explain attention as weighted looking-back, in plain language.
- Assign roles: query ≈ “what am I looking for?”, key ≈ “what do I contain?”, value ≈ “what do I contribute if selected?”.
- See why past tokens create work that might be reusable (setup for Module 3).

**Does not require:** Full scaled-dot-product derivation, multi-head algebra (heads can be a light epilogue: “several perspectives in parallel”).

---

### Module 3 — Remembering work already done

**Plain title:** Remembering work already done  
**Also known as:** KV cache, memory wall  
**Builds on:** Modules 1–2  
**Introduces:** Storing past keys & values; the size formula; batching many conversations; precision (bytes per number); GQA as “share keys/values across heads to save memory”; GPU memory as a finite shelf (HBM intuition)

**Learner can:**

- Motivate the cache: without it, every new token redoes past K/V work.
- Use \(M_{KV} = 2 \cdot B \cdot L \cdot H_{kv} \cdot S \cdot d_h \cdot bpe\) with named variables.
- Predict which knob doubles memory.
- Separate weight memory (mostly fixed) from growing cache memory.

**Assessment ideas:** Interactive calculator; “what if sequence doubles?”

---

### Module 4 — Reading the prompt vs writing the reply

**Plain title:** Reading the prompt vs writing the reply  
**Also known as:** Prefill vs decode; continuous batching (light)  
**Builds on:** Module 3  
**Introduces:** Prompt phase fills the cache; generation phase appends one (or a few) tokens per step; compute-heavy vs memory-traffic-heavy tendencies; why mixing many users needs careful scheduling

**Learner can:**

- Name the two phases and what each does to the KV cache.
- Connect “time to first token” vs “time between tokens” to those phases.
- Explain why a long new prompt can stall ongoing generation (interference intuition).

**Depth control:** Full continuous-batching / chunked-prefill detail can deepen here or in an advanced callout; core is phase contrast.

---

### Module 5 — Packing memory neatly

**Plain title:** Packing memory neatly  
**Also known as:** PagedAttention, fragmentation  
**Builds on:** Modules 3–4  
**Introduces:** Waste from huge contiguous reservations; pages/blocks; page table; internal vs external fragmentation

**Learner can:**

- Explain why naïve one-big-slab-per-chat wastes memory.
- Map logical token ranges to physical pages.
- Relate block size to leftover empty slots.

---

### Module 6 — Reusing work others already did

**Plain title:** Reusing work others already did  
**Also known as:** Prefix caching, RadixAttention  
**Builds on:** Modules 3–5 (cache exists; pages make sharing natural)  
**Introduces:** Shared system prompts / templates; exact prefix match; radix tree intuition; saving compute and physical memory

**Learner can:**

- Identify workloads with repeated leading text.
- Explain safe reuse: same tokens, same model behavior assumptions.
- Separate “logical per-user length” from “unique physical blocks.”

---

### Module 7 — Using fewer bits per value

**Plain title:** Using fewer bits per value  
**Also known as:** KV cache quantization  
**Builds on:** Module 3 (size formula); optional Module 4 (decode bandwidth)  
**Introduces:** Bit-width vs accuracy; scale / groups; why keys and values may quantize differently

**Learner can:**

- Scale the size formula by payload bytes.
- State that metadata and residual full-precision windows reduce “perfect ÷4” savings.
- Separate weight quantization from KV quantization.

---

### Module 8 — Forgetting on purpose

**Plain title:** Forgetting on purpose  
**Also known as:** Token eviction, attention sinks, heavy hitters  
**Builds on:** Modules 2–3 (attention mass, cache size)  
**Introduces:** Bounded memory for very long streams; keep recent; keep early “sinks”; keep high-importance tokens; quality trade-off

**Learner can:**

- Contrast window / sink / heavy-hitter policies.
- State that eviction is lossy vs full history.
- Explain “streaming forever” ≠ “remember everything perfectly.”

---

### Module 9 — When sharing leaks

**Plain title:** When sharing leaks  
**Also known as:** Shared-cache side channels, multi-tenant prompt leakage  
**Builds on:** Module 6 (sharing); Module 4 helpful (latency observables)  
**Introduces:** Timing / scheduling as signals; threat model; isolation and reduced sharing as mitigations

**Learner can:**

- State the efficiency vs privacy tension.
- Describe side channels at a high level (not exploit steps).
- List mitigation directions (isolate tenants, limit sharing, detect abuse).

**Ethics:** Defense-oriented only.

---

## First-principles concepts (when they appear)

| Concept                    | Module | Why not earlier                      |
| -------------------------- | ------ | ------------------------------------ |
| Token / generate loop      | 1      | Entry                                |
| Attention as looking back  | 2      | Needs “past tokens”                  |
| Q/K/V roles                | 2      | Needs attention story                |
| KV cache                   | 3      | Needs K/V roles                      |
| Size formula / memory wall | 3      | Needs cache                          |
| Prefill vs decode          | 4      | Needs cache lifecycle                |
| Pages / fragmentation      | 5      | Needs size + allocation pain         |
| Prefix reuse               | 6      | Needs cache + identity of tokens     |
| Quantization               | 7      | Needs “bytes per value”              |
| Eviction                   | 8      | Needs attention mass + size pressure |
| Side channels              | 9      | Needs sharing                        |

---

## Gap analysis checklist (pre-implementation)

- [ ] Module N titles work for someone who does not know the jargon yet.
- [ ] Technical names appear as “also known as,” not only as the H1.
- [ ] No outcome in Module N requires Module N+1.
- [ ] Home page presents a **path**, not a glossary of paper titles.
- [ ] Every formula variable is in `docs/glossary.md`.
- [ ] Quantitative claims cite `docs/sources.md` and list assumptions.
- [ ] Security content has no operational exploit playbook.

---

## Changelog

| Date       | Change                                                                                                          |
| ---------- | --------------------------------------------------------------------------------------------------------------- |
| 2026-07-12 | Initial Milestone 0 outcomes (jargon-first 7-module path).                                                      |
| 2026-07-12 | **v2:** First-principles path (9 modules); lowered entry bar; plain-language titles; explicit dependency order. |
