# WebGL performance budgets (Milestone 6 / #25)

## Goals

- Keep MVP lessons interactive on a typical laptop (integrated GPU OK).
- Large `S` / batch knobs must **not** explode mesh counts — metrics use full math; scenes use display caps.
- Mobile: lower DPR, fewer instances, shorter scene viewport.

## Geometry budgets (`src/lib/geometryBudget.ts`)

| Device  | Max display tokens | Layers | Pages (×P tokens) | Attention dim | DPR max | AA  |
| ------- | ------------------ | ------ | ----------------- | ------------- | ------- | --- |
| Desktop | 24                 | 8      | 20                | 12            | 1.75    | on  |
| Mobile  | 14                 | 5      | 12                | 8             | 1.25    | off |

Detection: coarse pointer **or** viewport width &lt; 768 → mobile class.

## Techniques used

1. **Display caps** — `displayTokens` / `displayLayers` log-scale toward budget.
2. **Instanced KV grid** — `MemoryGrid` uses a single `InstancedMesh` for cells.
3. **Downsampled attention** — demo matrices capped by budget.
4. **GL flags** — `powerPreference: high-performance`, stencil off; mobile antialias off.
5. **Reduced motion** — autospin / ribbon animation gated by `prefers-reduced-motion`.

## Frame-rate target (manual)

| Scenario                          | Target                                                  |
| --------------------------------- | ------------------------------------------------------- |
| Lesson 1–4 default knobs, desktop | ~60 fps feel (no multi-second hitch on load)            |
| Max free-explore S=8192, B=32     | Metrics update immediately; scene stays at display caps |
| Phone-width layout                | Scene stacks above controls; canvas height reduced      |

## Known trade-offs

- Text labels (drei `Text`) still allocate per glyph — kept minimal.
- OrbitControls keep the frame loop active while interacting.
- Full production GPU profiles are out of scope for this teaching site.
