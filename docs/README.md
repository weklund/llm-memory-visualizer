# Research and learning architecture (Milestone 0)

This folder is the **content ground truth** for the LLM Memory Visualizer. Implementation work (app scaffold, 3D primitives, modules) should follow these docs rather than inventing formulas or paper claims ad hoc.

| Document                                       | Issue | Purpose                                                                 |
| ---------------------------------------------- | ----- | ----------------------------------------------------------------------- |
| [sources.md](./sources.md)                     | #1    | Source inventory, paper map, module coverage, claims needing validation |
| [learning-outcomes.md](./learning-outcomes.md) | #2    | First-principles path (9 lessons), entry bar, dependency order          |
| [glossary.md](./glossary.md)                   | #3    | Canonical variables, KV memory formulas, shared vocabulary              |

## Accuracy policy

1. Prefer primary papers and system docs listed in `sources.md`.
2. Every quantitative claim in a lesson must state assumptions and cite a source ID (e.g. `S05`).
3. Items tagged **[NEEDS-VALIDATION]** or listed in the validation section of `sources.md` must not be taught as universal laws.
4. Security content is defense-oriented (threat models, mitigations)—not exploit tutorials.
5. If simulation metrics disagree with `glossary.md`, fix the code or update the glossary in the same change set.

## Milestone 0 acceptance (checklist)

- [x] Source table exists in-repo with categories, confidence, module mapping, and links.
- [x] Each planned module maps to at least two supporting sources where possible.
- [x] Claims needing later validation are explicitly marked.
- [x] Target learner, prerequisites, and per-module learning outcomes are documented.
- [x] Glossary and canonical KV formulas with named variables, units, and simplifications are documented.

## App scaffold (Milestone 1)

| Document                               | Issue | Purpose                               |
| -------------------------------------- | ----- | ------------------------------------- |
| [conventions.md](./conventions.md)     | #4    | Stack, layout, scripts, content rules |
| [design-system.md](./design-system.md) | #6    | Tokens, metaphors, a11y color rules   |

## Simulation primitives (Milestone 2)

| Document                         | Issue  | Purpose                                            |
| -------------------------------- | ------ | -------------------------------------------------- |
| [primitives.md](./primitives.md) | #8–#12 | Pure metrics, 3D primitives, V2 lesson → scene map |

Runnable app: `npm install && npm run dev` (see root README).

## Accuracy & QA (Milestone 5)

| Document                                         | Issue | Purpose                                             |
| ------------------------------------------------ | ----- | --------------------------------------------------- |
| [accuracy-checklist.md](./accuracy-checklist.md) | #21   | Per-module formula/claim validation                 |
| [paper-index.md](./paper-index.md)               | #22   | Paper index + qualitative technique matrix          |
| [a11y-checklist.md](./a11y-checklist.md)         | #23   | Keyboard, scene summaries, reduced motion, contrast |

In-app: `/references` (paper index + comparison matrix).

## Next milestones

See GitHub milestone 6 (guided mode, performance, deploy).
