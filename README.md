# LLM Memory Visualizer

Interactive learning material for LLM inference memory, built around 3D simulations and first-principles mental models.

**You do not need to already know transformers or attention.** The path starts from “an LLM writes the next word” and earns each technical idea before naming the paper or system that uses it.

**Live site:** [https://weklund.github.io/llm-memory-visualizer/](https://weklund.github.io/llm-memory-visualizer/)  
(Deployed from `main` via GitHub Pages.)

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
Deploy runs on push to `main` (see `.github/workflows/deploy.yml`).

## Learning path (order matters)

| #   | Plain-language lesson                   | Also known as                    |
| --- | --------------------------------------- | -------------------------------- |
| 1   | Next word, again and again              | Autoregressive generation        |
| 2   | Looking back at the past                | Attention · Q/K/V                |
| 3   | Remembering work already done           | KV cache · memory wall           |
| 4   | Reading the prompt vs writing the reply | Prefill vs decode                |
| 5   | Packing memory neatly                   | PagedAttention                   |
| 6   | Reusing work others already did         | Prefix caching · RadixAttention  |
| 7   | Using fewer bits per value              | KV quantization                  |
| 8   | Forgetting on purpose                   | Eviction · sinks · heavy hitters |
| 9   | When sharing leaks                      | Shared-cache side channels       |

Routes: `/` (path map), `/modules/:slug` (lesson shell), `/references` (paper index + technique matrix).

**Modes:** each lesson supports **Guided** (step tour) and **Free explore** (full sliders). Choice is saved in the browser.

Curriculum: [`docs/learning-outcomes.md`](./docs/learning-outcomes.md).  
Accuracy QA: [`docs/accuracy-checklist.md`](./docs/accuracy-checklist.md).  
Performance: [`docs/performance.md`](./docs/performance.md).

## Stack

- **Vite** + **React** + **TypeScript**
- **React Three Fiber** + **Drei** + **Three.js**
- **MDX** lessons
- **Zustand** simulation + exploration state
- **Vitest** + **ESLint** + **Prettier**

Conventions: [`docs/conventions.md`](./docs/conventions.md)  
Design system: [`docs/design-system.md`](./docs/design-system.md)  
Contributing: [`CONTRIBUTING.md`](./CONTRIBUTING.md)  
License: [MIT](./LICENSE)

## Research foundation

| Document                                                   | Description                              |
| ---------------------------------------------------------- | ---------------------------------------- |
| [docs/sources.md](./docs/sources.md)                       | Source inventory and paper map           |
| [docs/paper-index.md](./docs/paper-index.md)               | Learner paper index + technique matrix   |
| [docs/learning-outcomes.md](./docs/learning-outcomes.md)   | Prerequisites, path, per-lesson outcomes |
| [docs/glossary.md](./docs/glossary.md)                     | Canonical vocabulary and KV formulas     |
| [docs/accuracy-checklist.md](./docs/accuracy-checklist.md) | Milestone 5 technical validation         |
| [docs/a11y-checklist.md](./docs/a11y-checklist.md)         | Accessibility pass notes                 |

Simulation math in `src/lib/kvMemory.ts` must stay aligned with the glossary (used from lesson 3’s memory lab onward).
