# Simulation primitives (Milestone 2)

Reusable pure-math + 3D building blocks aligned to the **V2 first-principles path**.

## Pure TypeScript (no Three.js)

| Module                         | Role                                                                          |
| ------------------------------ | ----------------------------------------------------------------------------- |
| `src/lib/kvMemory.ts`          | Canonical KV size formula                                                     |
| `src/lib/simulationMetrics.ts` | Derived metrics: OOM, compression, phase intensity proxies, paging aggregates |
| `src/lib/modelPresets.ts`      | Illustrative model shapes for knobs                                           |
| `src/lib/paging.ts`            | Contiguous vs paged layouts, block tables, shared pages                       |
| `src/lib/attentionDemo.ts`     | Deterministic demo attention (sinks, heavy hitters, downsample)               |
| `src/lib/simColors.ts`         | Hex palette matching `docs/design-system.md`                                  |
| `src/state/simulationStore.ts` | Zustand knobs shared by controls, metrics, and scenes                         |

Unit tests: `kvMemory.test.ts`, `simulationMetrics.test.ts`.

## 3D primitives (`src/components/primitives/`)

| Primitive          | Visual metaphor                     | Path lessons  |
| ------------------ | ----------------------------------- | ------------- |
| `TokenBlock`       | Unit cube (token / K / V)           | 1–9           |
| `TokenStream`      | Growing sequence beads              | 1, 2, 6, 8, 9 |
| `MemoryGrid`       | Layers × sequence cache lattice     | 3, 7          |
| `CachePage`        | Fixed-size physical page plate      | 5, 6          |
| `PageTable`        | Physical pool + L→P map             | 5, 6          |
| `AttentionSurface` | Height-field attention weights      | 2, 8          |
| `GpuNode`          | Compute brick + HBM tray            | 4, 9          |
| `BandwidthRibbon`  | Memory traffic flow                 | 4             |
| `BatchQueue`       | Iteration-level batch slots         | 4             |
| `SceneRig`         | Lights, ground grid, orbit controls | all           |

## Lesson → scene map

| Slug                    | Scene composition                         |
| ----------------------- | ----------------------------------------- |
| `next-word-loop`        | TokenStream                               |
| `looking-back`          | TokenStream + AttentionSurface            |
| `remembering-work`      | MemoryGrid (+ OOM)                        |
| `prompt-vs-generation`  | GpuNode + BandwidthRibbon + BatchQueue    |
| `packing-memory`        | PageTable (holes = external frag)         |
| `reusing-work`          | TokenStream + shared PageTable            |
| `fewer-bits`            | Dual MemoryGrid (FP16 vs quant scale)     |
| `forgetting-on-purpose` | TokenStream + AttentionSurface (sinks/HH) |
| `when-sharing-leaks`    | Dual tenants + shared GpuNode             |

Registry: `src/components/scene/LessonScene.tsx`.

## Performance rules

- Cap display tokens/layers via `displayTokens` / `displayLayers` (not 1:1 with S=8k).
- Downsample attention matrices (`downsampleAttention`).
- Prefer small meshes; revisit instancing if grids grow further.

## Metric conventions

All panels should use `deriveSimulationMetrics` / `selectMetrics` so compression, waste, and phase proxies mean the same thing in every lesson.

## Lesson content status

All V2 path lessons **1–9** are ready (Milestones 3–4) with MDX callouts:
`Formula`, `Assumptions`, `Sources`, `TryThis`, `Checkpoint` via `src/components/mdx/`.

Eviction keep-sets: `src/lib/eviction.ts` (unit tested).
