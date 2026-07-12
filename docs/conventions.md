# Project conventions

Engineering conventions for the LLM Memory Visualizer app scaffold (Milestone 1).

## Stack

| Layer            | Choice                                            | Why                                                |
| ---------------- | ------------------------------------------------- | -------------------------------------------------- |
| Bundler          | **Vite 6**                                        | Fast SPA dev for a visualization-first site        |
| UI               | **React 19** + **TypeScript** (strict)            | Component model + typed math/state                 |
| Routing          | **React Router 7**                                | Simple client routes: `/`, `/modules/:slug`        |
| 3D               | **Three.js** via **React Three Fiber** + **Drei** | Lesson scenes as React trees                       |
| Lessons          | **MDX** (`@mdx-js/rollup`)                        | Content decoupled from scene code                  |
| Simulation state | **Zustand**                                       | Lightweight shared knobs/metrics without Redux     |
| Tests            | **Vitest** (node env)                             | Pure math without WebGL                            |
| Lint / format    | **ESLint 9** flat config + **Prettier**           | Guardrails before viz code grows                   |
| CI               | **GitHub Actions**                                | install → format → lint → typecheck → test → build |

**Not chosen for MVP:** Next.js. Revisit if we need SSR/SEO-heavy marketing pages; lessons are interactive client apps.

## Repository layout

```text
docs/                 Research ground truth + design/conventions
src/
  components/
    layout/           App chrome
    lesson/           Reusable lesson shell (scene, controls, metrics, MDX)
    scene/            R3F scenes (placeholder until Milestone 2 primitives)
  content/
    modules.ts        Module registry (path order = nav order)
    lessons/*.mdx     Lesson bodies
  lib/                Pure functions (KV math) — unit tested
  pages/              Route-level pages
  state/              Zustand stores
  styles/             Design tokens + global CSS
```

## Path alias

`@/*` → `src/*` (Vite + TypeScript + Vitest).

## Scripts

| Command                | Purpose                                          |
| ---------------------- | ------------------------------------------------ |
| `npm run dev`          | Local dev server (default http://localhost:5173) |
| `npm run build`        | Typecheck + production build to `dist/`          |
| `npm run preview`      | Serve production build                           |
| `npm run lint`         | ESLint                                           |
| `npm run format`       | Prettier write                                   |
| `npm run format:check` | Prettier check (CI)                              |
| `npm test`             | Vitest once                                      |
| `npm run typecheck`    | `tsc --noEmit`                                   |

## Content vs simulation

- **MDX** owns prose, assumptions, citations.
- **Scene components** own WebGL.
- **`src/lib`** owns formulas; must match `docs/glossary.md`.
- **Zustand** owns interactive knobs shared by controls, metrics, and scene.

Do not embed long lesson text inside scene files.

## Module registration

1. Add MDX under `src/content/lessons/`.
2. Register in `src/content/modules.ts` (slug, title, summary, `loadContent`).
3. Align outcomes with `docs/learning-outcomes.md`.

## TypeScript

- `strict` + `noUncheckedIndexedAccess` + `exactOptionalPropertyTypes`.
- Prefer pure functions for anything that appears in metric panels.

## Commits / PRs

- One issue ≈ one PR when practical.
- Simulation math changes require tests.
- Visual token changes should update `docs/design-system.md`.
