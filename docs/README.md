# Research and learning architecture (Milestone 0)

This folder is the **content ground truth** for the LLM Memory Visualizer. Implementation work (app scaffold, 3D primitives, modules) should follow these docs rather than inventing formulas or paper claims ad hoc.

| Document | Issue | Purpose |
|----------|-------|---------|
| [sources.md](./sources.md) | #1 | Source inventory, paper map, module coverage, claims needing validation |
| [learning-outcomes.md](./learning-outcomes.md) | #2 | Learner profile, prerequisites, per-module outcomes, path gaps |
| [glossary.md](./glossary.md) | #3 | Canonical variables, KV memory formulas, shared vocabulary |

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

## Next milestones

See GitHub milestones 1–6 (app scaffold → primitives → MVP modules → advanced modules → QA → launch).
