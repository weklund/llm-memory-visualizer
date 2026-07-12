# Lesson 1 redesign brief — one loop, one story

**Status:** implemented (essay workspace + V0–V3 embeddables)  
**Date:** 2026-07-12  
**Purpose:** Replace the current chopped lesson-1 experience with a single narrative spine, and map where animations / graphs / interactives should land.

**Vault sources (teaching goals + pedagogy):**

- [[resources/study-guides/inference-engineering-course/01-foundations|Inference Eng 1.1 Foundations]]
- [[resources/study-guides/inference-engineering-course/02-mental-models|Inference Eng 1.2 Mental Models]]
- [[resources/study-guides/inference-engineering-course/03-prefill-and-decode|Inference Eng 2.1 Prefill vs Decode]]
- [[resources/study-guides/inference-engineering-course/05-kv-cache|Inference Eng 2.3 KV Cache]]
- [[wiki/syntheses/kv-cache-mechanics-learning-path-2026-07|KV Cache learning path]]
- [[wiki/concepts/kv-cache-and-prefix-caching|KV Cache & Prefix Caching]]
- [[wiki/syntheses/3blue1brown-transformers-deep-learning-ch5-2024-04|3Blue1Brown Transformers (Ch. 5)]]
- [[wiki/syntheses/preporato-llm-inference-deep-dive-tensorrt-ncp-genl-2026-07|Preporato inference deep dive]]
- [[archive/inbox-processed/yt-ibm-speculative-decoding-isaac-ke-2025-06-04|IBM speculative decoding (baseline AR loop)]]
- [[archive/inbox-processed/yt-under-the-hood-kv-cache-demystified-2026-07-08|KV Cache Demystified]]
- [[resources/study-guides/ux-ui-design-course/31-animation-and-motion|UX: Animation and Motion]]
- [[resources/study-guides/ux-ui-design-course/02-mental-models|UX: Mental Models / Cognitive Load]]
- [[resources/study-guides/ux-ui-design-course/03-visual-hierarchy|UX: Visual Hierarchy]]
- [[wiki/syntheses/han-zhango-math-learning-method-2024|Han Zhango: active practice]]

**App sources:** `docs/learning-outcomes.md` Module 1; current MDX split + shell.

---

## 1. Diagnosis: why the current lesson feels broken

### What the vault says the _foundational_ idea is

Across the inference course and KV notes, autoregressive generation is not “interesting trivia.” It is the **load-bearing fact** that makes everything else exist:

1. **One forward pass → one token** (IBM baseline framing; Preporato decode phase).
2. **Append, then run again** with a longer past (3Blue1Brown generation loop).
3. **That loop is why decode is special** — later: memory-bandwidth-bound, not compute-bound ([[02-mental-models]], [[03-prefill-and-decode]]).
4. **That loop is why KV cache exists** — past K/V would otherwise be recomputed every step ([[05-kv-cache]], [[kv-cache-mechanics-learning-path]]).

So lesson 1’s only job is:

> Make “next token → append → repeat, and the past grows” feel inevitable—so later lessons can hang cost, attention, and cache on that spine.

### What we did instead (product)

| Pattern                                         | Effect on learner                                                             |
| ----------------------------------------------- | ----------------------------------------------------------------------------- |
| Split MDX (“before / after scene”)              | Story feels interrupted; two essays around a gadget                           |
| Numbered “Idea 1–4”                             | Competes with the loop as the structure                                       |
| Guided / Free / Explore footer                  | **Extraneous cognitive load** (UX glossary: limited working memory ~4 chunks) |
| 3D orbit + phase chips + scene summary + labels | Multiple simultaneous channels for one idea                                   |
| Jargon early (“autoregressive”)                 | Name before need (opposite of 3B1B “wax-on” order)                            |

**Vault-backed pedagogy flags:**

- **Animation purpose** ([[31-animation-and-motion]]): motion should orient, show state change, reduce load—or it’s decoration. A looping 3D bead stream with four phase labels risks decoration _plus_ split attention.
- **Active practice** ([[han-zhango]]): watching a loop is still mostly passive. The vault’s learning notes favor _doing_ the mechanism.
- **Cognitive load** ([[02-mental-models]]): mode switchers and dual controls burn slots that should hold “past grows.”

**Confidence:** high that lesson 1 over-structures UI; medium that 3D is the wrong primary medium for _this_ idea (vault’s best explainers for the loop are 2D timelines / step diagrams, not spatial scenes).

---

## 2. One-sentence goal (rewrite)

**Learner can:** Point at a chat reply and say, without jargon:  
_“The model didn’t write that all at once. It kept asking ‘what’s the next small piece?’ and every piece became part of the past for the next ask.”_

**Exit criteria (still Module 1 outcomes):**

- Generation = **loop**, not one-shot composition
- Longer prompt / longer reply / multi-turn ⇒ more **past text in play**
- “Chat memory” (text in context) ≠ “engine memory” (GPU cache)—one sentence only, as a **door** to lesson 2–3

**Non-goals for this page:** attention math, QKV, prefill/decode names, FLOPs, HBM, guided mode.

---

## 3. Proposed spine: one continuous story (no idea numbers)

Write the lesson as **one short essay with three beats**, not four “ideas.”  
UI order = story order. **One primary visual per beat.** Secondary UI (modes, free scrub) either gone or a single “Play with it” at the end.

### Beat A — The mistaken mental model (30–60s read)

**Prose:** You already know chat. The natural mistake is: _the model “thinks of the answer” then dumps a paragraph._

**Visual V0 (static, optional):** Simple cartoon contrast

- Left: one cloud → full paragraph
- Right: empty line + blinking cursor  
  No interaction yet. **Purpose:** open the gulf of evaluation ([[UX mental models]]): “my model of how this works might be wrong.”

---

### Beat B — The loop on a real sentence (core of the lesson)

**Prose (tight):** Pick **one** fixed demo prompt and reply—same tokens every time—so the learner can re-watch without re-learning the example.

Example (schematic):

```text
Prompt:  Write a haiku about rain.
Step 1:  Soft
Step 2:  Soft rain
Step 3:  Soft rain falls
...
```

Vault alignment: 3B1B’s five-step AR loop (seed → distribution → sample → append → repeat) and IBM’s “one run, one token; append; pass back.”

**Visual V1 — Timeline stepper (PRIMARY interactive)**  
_Not 3D._ A horizontal **token timeline**:

| Element               | Behavior                                 |
| --------------------- | ---------------------------------------- |
| Prompt tokens         | Fixed, muted bar on the left             |
| Generated tokens      | Appear one-by-one on “Step” or autoplay  |
| Cursor / “now” marker | On the empty next slot                   |
| Counter               | “Model run #3 · past length = 12 tokens” |

**Controls (minimal):**  
`Play / Pause` · `Step once` · `Reset`  
No free-explore dual mode. No guided panel.

**Animation (vault-aligned purpose):**

- **State change:** empty slot → filled token
- **Orient:** past vs next
- **Feedback:** each click = one model run

Optional micro-copy under the playhead (single line, changes with step):  
`read past (n tokens) → pick next → append → n becomes n+1`

**Do not** animate four separate “phase chips” at once; the step _is_ the phase.

---

### Beat C — Why “past in play” grows (bridge to the rest of the course)

**Prose:** Same loop, three everyday levers—prompt length, reply length, multi-turn. No formulas.

**Visual V2 — Growing-context meter (secondary interactive)**  
A simple **bar or area chart**, not a GPU:

- X: step number (or time)
- Y: tokens in context at that step
- Three overlay scenarios the learner can toggle:
  - short prompt + short reply
  - long prompt + short reply
  - short prompt + long reply / multi-turn

**What they should feel:** the next decision always “stands on a taller stack.”

Vault bridge (say once, lightly):

> Later we’ll see that each of those steps is expensive on a GPU—and that servers invent caches so they don’t redo work on the whole stack every time. That’s lessons 2–3. Today you only need the stack.

**Visual V3 — “Two memories” card (static, end)**  
Two columns, no animation:

| Product “memory”             | Engine “memory” (later)                                             |
| ---------------------------- | ------------------------------------------------------------------- |
| The text in the conversation | Structures the GPU stores so it doesn’t recompute looking-back work |
| You can scroll and read it   | You can’t see it in the chat UI                                     |

One sentence: _This course is mostly about the right-hand column—but only after the left-hand loop is obvious._

---

## 4. Where _not_ to put interactives

| Tempting feature                           | Why cut for lesson 1                                                 |
| ------------------------------------------ | -------------------------------------------------------------------- |
| Full free-explore sliders (S, batch, bpe…) | Belongs to memory lab (lesson 3+)                                    |
| Guided tour with N steps + dots            | Duplicates the timeline stepper                                      |
| Orbiting 3D beads as primary               | High extraneous load; weak for “append” semantics                    |
| Attention heatmap                          | Lesson 2                                                             |
| Prefill vs decode glow                     | Lesson 4                                                             |
| KV size formula                            | Lesson 3                                                             |
| Probability / temperature demo             | Fun but off-spine (3B1B covers it; we don’t need it for memory path) |

---

## 5. Recommended page layout (wireflow)

```text
┌─────────────────────────────────────────────┐
│ Lesson 1 · Next word, again and again       │
│ one-line promise                             │
└─────────────────────────────────────────────┘

[ Beat A — prose ]
[ V0 static contrast — optional, small ]

[ Beat B — prose: one demo sentence ]
[ V1 TIMELINE STEPPER  ← primary stage  ]
     [ Play ] [ Step ] [ Reset ]
     one-line status: run #k · past = n

[ Beat C — prose: past grows ]
[ V2 CONTEXT GROWTH chart  ← secondary  ]
     toggles: short / long prompt / multi-turn

[ V3 two-memories cards ]
[ 2–3 checkpoint questions ]
[ Next: Looking back at the past → ]

(no mode toggle, no explore footer, no scene summary essay)
```

**Single column. Reading width ~40–48rem.**  
Scene is not a “lab workspace”; it’s an **illustration embedded in the essay.**

---

## 6. Interaction → learning goal map

| Interactive | Idea driven home                                                      | Success check                                                 |
| ----------- | --------------------------------------------------------------------- | ------------------------------------------------------------- |
| V1 Step     | One model step = one token; append changes the input to the next step | Learner can predict what “past length” does on the next click |
| V1 Play     | Continuity of the loop without manual effort                          | After 10s autoplay, they can narrate the loop unprompted      |
| V2 toggles  | Prompt vs reply both grow “past in play”                              | They can rank which scenario has the tallest stack at step 20 |
| V3 static   | Split product vs engine memory                                        | They don’t call KV “the chat remembering you”                 |

**Active practice angle** ([[han-zhango]]):  
After V1, one **do** task: “Step until the reply has 5 tokens. What is past length now? Step once more—what is it?”

---

## 7. Animation / graph specs (implementation-ready)

### V1 Timeline stepper

- **Tech:** 2D DOM/SVG or Canvas—not R3F (keep Three.js budget for lessons where space/packing matter).
- **Tokens:** max ~24 display tokens; real demo sentence shorter.
- **Motion:** 200–300ms ease on token appear; respect `prefers-reduced-motion` (instant fill).
- **A11y:** live region: “Step 4 of 12. Past length 11. Next token: falls.”
- **Data:** pure array of strings + index; no Zustand memory lab params.

### V2 Context growth

- **Tech:** small SVG polyline or CSS bars.
- **Y-axis label:** “Tokens in context” (not “KV bytes”).
- **Interaction:** three radio scenarios; chart redraws; optional scrub of step.
- **Insight callout** under chart updates in plain language.

### V0 / V3

- Static HTML/CSS. No WebGL.

---

## 8. Suggested continuous prose outline (draft copy structure)

Use as the MDX spine (one file, no before/after split):

1. **Opening (Beat A)** — product experience; wrong model of “think then dump.”
2. **The loop (Beat B)** — next piece; append; demo sentence; **embed V1 here**.
3. **Name it once** — “engineers call this autoregressive generation” as a footnote-level rename, after the motion is clear (3B1B order: mechanism first).
4. **Growing past (Beat C)** — three levers; **embed V2 here**.
5. **Door to the course** — product vs engine memory; **V3**; “lesson 2 is how it looks back.”
6. **Checkpoint** — three questions max.
7. **Next lesson CTA.**

Assumptions / sources: one short collapsible at the bottom—not the emotional climax.

---

## 9. How this sets up later lessons (dependency honesty)

| Later lesson        | Hook planted in lesson 1                                                                                      |
| ------------------- | ------------------------------------------------------------------------------------------------------------- |
| 2 Looking back      | Each step “uses” the past somehow—we haven’t said how                                                         |
| 3 KV / memory wall  | Past is re-involved every step → work you’d hate to redo                                                      |
| 4 Prefill vs decode | All prompt tokens known at once vs one new token at a time ([[03-prefill-and-decode]] _why two phases exist_) |
| 5–9 systems         | Only meaningful after “past stack grows every step” is felt                                                   |

Vault note: [[01-foundations]]’s “one fact that explains everything” is _decode is memory-bandwidth-bound_. **Do not teach that in lesson 1**—but the loop is the prerequisite that makes that fact make sense.

---

## 10. Explicit critique of the current implementation (for the rewrite PR)

1. **Kill the before/after MDX split** for lesson 1—one continuous document.
2. **Kill Guided / Free as first-class UX** on narrative lessons (or bury after checkpoint).
3. **Replace NextWordScene 3D as primary** with V1 2D stepper; optional keep 3D as easter egg later.
4. **One status line**, not phase chip row + scene summary + MDX “watch below.”
5. **Measure success** by whether a cold reader can narrate the loop after V1, not by control coverage.

---

## 11. Confidence & gaps

| Claim                                            | Confidence      | Notes                                                                       |
| ------------------------------------------------ | --------------- | --------------------------------------------------------------------------- |
| AR loop is the correct lesson-1 spine            | **High**        | Repeated across inference course + 3B1B + KV explainers                     |
| Current UI is high extraneous load               | **High**        | UX course cognitive load + animation purpose tests                          |
| 2D timeline > 3D for this concept                | **Medium–high** | Vault’s best AR/KV intros are visual-timeline style; 3D unused for “append” |
| Exact demo sentence / token boundaries           | **Low**         | Need a real tokenizer-ish display or fixed fake tokens labeled as schematic |
| Vault has a dedicated “lesson 1 visualizer” note | **None found**  | No `llm-memory-visualizer` pages in vault; this brief is new synthesis      |

---

## 12. Recommended next implementation slice

1. New single MDX draft following §8.
2. Ship V1 (timeline stepper) as a React component in the MDX flow.
3. Ship V2 (context growth) under Beat C.
4. Remove narrative mode toggle / guided steps from lesson 1 shell path.
5. Only then decide if any R3F remains for lesson 1 (likely: no).

---

## Changelog

| Date       | Change                                                                                                                                                        |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-07-12 | Initial redesign brief from vault synthesis + product UX critique.                                                                                            |
| 2026-07-12 | Implemented: `workspace: essay`, single MDX, `GenerationTimeline`, `ContextGrowthChart`, `MentalModelContrast`, `TwoMemories`; no 3D/mode chrome on lesson 1. |
