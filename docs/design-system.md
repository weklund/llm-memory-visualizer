# Design system and visual language

Visual rules for UI chrome and simulation semantics. Implemented primarily as CSS variables in `src/styles/tokens.css`.

**Theme strategy:** **Dark-first** (`color-scheme: dark`). A light theme is not required for MVP; if added later, keep the same **semantic role tokens** and only remap surface/text.

## Typography

| Role                      | Font          | Notes                         |
| ------------------------- | ------------- | ----------------------------- |
| UI / body                 | IBM Plex Sans | System-ui fallback            |
| Metrics, formulas, labels | IBM Plex Mono | Readouts, code, kicker labels |

Scale: `--text-xs` … `--text-3xl` with tight headings and relaxed body.

## Spacing and layout

- 4px base scale: `--space-1` … `--space-12`
- Content max width: `--content-max` (90rem); essay prose measure: `--prose-max` (48rem)
- Sticky header: `--header-height`
- Lesson workspace: responsive CSS grid — scene primary; controls + metrics stack on narrow viewports; three-column on wide screens

## Semantic simulation colors

These roles must stay consistent across modules:

| Role                  | Token                    | Hex (default) | Metaphor                     |
| --------------------- | ------------------------ | ------------- | ---------------------------- |
| Token (sequence item) | `--color-token`          | `#c4b5fd`     | Discrete sequence units      |
| Key cache             | `--color-key`            | `#38bdf8`     | K tensors / “lookup”         |
| Value cache           | `--color-value`          | `#34d399`     | V tensors / “payload”        |
| Cache page / block    | `--color-page`           | `#fbbf24`     | PagedAttention physical page |
| Shared page           | `--color-page-shared`    | `#f59e0b`     | Prefix-shared block          |
| HBM                   | `--color-hbm`            | `#64748b`     | Device memory pool           |
| SRAM                  | `--color-sram`           | `#a78bfa`     | On-chip working set          |
| Compute               | `--color-compute`        | `#fb7185`     | FLOPs / SM work              |
| Bandwidth             | `--color-bandwidth`      | `#22d3ee`     | Bytes moved                  |
| Fragmentation waste   | `--color-fragment-waste` | `#f87171`     | Unused reservation           |
| Cache hit             | `--color-hit`            | `#4ade80`     | Reuse success                |
| Cache miss            | `--color-miss`           | `#f472b6`     | Recompute / allocate         |

UI chrome uses `--color-accent` / surfaces separately so simulation hues stay meaningful.

## Shape and pattern (not color alone)

Important states **must not rely on color alone** (a11y + Module QA):

| State                  | Non-color cue                                                   |
| ---------------------- | --------------------------------------------------------------- |
| Key vs value           | Label `K` / `V` and/or checkerboard alternation in placeholders |
| Shared vs private page | Dashed outline or link glyph + “shared” label                   |
| Hit vs miss            | Icon or text badge in metrics; optional pulse animation         |
| Waste / free           | Hatch pattern or dim opacity + “waste” caption                  |
| Selected               | Focus ring `--color-focus` + scale, not only hue shift          |

## 3D metaphors (for Milestone 2+)

| Concept             | Preferred visual                                        |
| ------------------- | ------------------------------------------------------- |
| Memory block / cell | Unit cube or rounded box in a grid                      |
| Token               | Bead / thin slab along a sequence axis                  |
| Page (P tokens)     | Larger plate grouping P token cells                     |
| Page table          | Thin index strip mapping logical → physical             |
| Attention matrix    | Heightfield or heatmap plane (not full S² memory claim) |
| GPU node            | Compact chassis with HBM tray + compute brick           |
| Bandwidth           | Animated ribbons or particle flow HBM ↔ compute         |

## Motion

- Prefer slow ambient motion (`~0.08 rad/s`) so it does not compete with reading.
- Interaction feedback: `--duration-fast` / `--duration-normal` with `--ease-out`.
- Respect reduced motion (#23): scene autospin and bandwidth ribbon animation disable when `prefers-reduced-motion: reduce` (`usePrefersReducedMotion`).

## Components

| Component                 | Responsibility                                  |
| ------------------------- | ----------------------------------------------- |
| `LessonShell`             | Title, scene, controls, metrics, MDX, prev/next |
| `ControlPanel`            | Knobs → Zustand                                 |
| `MetricPanel`             | Formula readouts from pure lib                  |
| `SceneViewport`           | R3F canvas host                                 |
| `SiteHeader` / `AppShell` | Global chrome                                   |

Shared components must consume **tokens**, not hard-coded one-off hex values (placeholder scene may use key/value hex matching tokens until a material helper exists).

## Checklist for new modules

- [ ] Uses semantic tokens for K/V/pages/HBM
- [ ] Metrics list assumptions (from glossary)
- [ ] Color-coded states also labeled
- [ ] Layout readable at ~360px width
- [ ] No pure white full-screen glare (dark theme)
