# LLM Memory Visualizer

Interactive learning material for LLM memory optimization, built around 3D simulations and first-principles mental models.

The project teaches how KV cache memory behaves during inference and how modern systems reduce memory pressure through paging, prefix caching, scheduling, token eviction, quantization, and related security analysis.

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

| Script              | Description                    |
| ------------------- | ------------------------------ |
| `npm run dev`       | Vite dev server                |
| `npm run build`     | Typecheck + production build   |
| `npm run preview`   | Preview `dist/`                |
| `npm test`          | Unit tests (KV math, no WebGL) |
| `npm run lint`      | ESLint                         |
| `npm run format`    | Prettier                       |
| `npm run typecheck` | `tsc --noEmit`                 |

CI runs format check, lint, typecheck, test, and build on pushes/PRs to `main` (see `.github/workflows/ci.yml`).

## Stack

- **Vite** + **React** + **TypeScript**
- **React Three Fiber** + **Drei** + **Three.js**
- **MDX** lessons
- **Zustand** simulation state
- **Vitest** + **ESLint** + **Prettier**

Conventions: [`docs/conventions.md`](./docs/conventions.md)  
Design system: [`docs/design-system.md`](./docs/design-system.md)

## Planned learning modules

1. KV cache growth and the memory wall
2. PagedAttention and memory fragmentation
3. KV cache quantization
4. Prefill vs. decode scheduling
5. Prefix caching and RadixAttention
6. Token eviction and attention sparsity
7. Security risks in shared caching systems

Routes: `/` (module index), `/modules/:slug` (lesson shell).

## Research foundation (Milestone 0)

| Document                                                 | Description                          |
| -------------------------------------------------------- | ------------------------------------ |
| [docs/sources.md](./docs/sources.md)                     | Source inventory and paper map       |
| [docs/learning-outcomes.md](./docs/learning-outcomes.md) | Prerequisites and outcomes           |
| [docs/glossary.md](./docs/glossary.md)                   | Canonical vocabulary and KV formulas |

Simulation math in `src/lib/kvMemory.ts` must stay aligned with the glossary.

## Project tracking

GitHub issues and milestones: research → **scaffold** → primitives → MVP modules → advanced modules → QA → launch.
