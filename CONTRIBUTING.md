# Contributing

Thanks for interest in the LLM Memory Visualizer. This is primarily an educational site with a fixed research foundation under `docs/`.

## Local development

```bash
npm install
npm run dev
```

Before opening a PR:

```bash
npm run format
npm run lint
npm run typecheck
npm test
npm run build
```

## What to change carefully

| Area             | Rule                                                                                      |
| ---------------- | ----------------------------------------------------------------------------------------- |
| KV formulas      | Must match `docs/glossary.md`; add/adjust unit tests                                      |
| Paper claims     | Cite source IDs from `docs/sources.md`; no universal % without context                    |
| Security lessons | Defense-oriented only — no exploit recipes                                                |
| New lessons      | Register in `src/content/modules.ts` and add guided steps in `src/content/guidedSteps.ts` |
| Geometry         | Respect budgets in `src/lib/geometryBudget.ts`                                            |

## PR hygiene

- Prefer small, focused changes (one issue when practical).
- Do not commit `node_modules/` or secrets.
- If you change simulation metrics, update tests in the same PR.

## License

By contributing, you agree that your contributions are licensed under the MIT License (see `LICENSE`).
