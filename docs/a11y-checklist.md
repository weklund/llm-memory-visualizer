# Accessibility checklist (Milestone 5 / #23)

**Review date:** 2026-07-12  
**Scope:** Keyboard, non-visual scene summaries, contrast, reduced motion, narrow layouts.

---

## Automated / CI-adjacent

| Check                         | How                                             | Result                        |
| ----------------------------- | ----------------------------------------------- | ----------------------------- |
| Typecheck / lint / unit tests | `npm run typecheck && npm run lint && npm test` | Required green before close   |
| Production build              | `npm run build`                                 | Required green                |
| Semantic HTML                 | Manual review of shell, forms, nav              | Landmarks + labelled sections |
| `lang` on document            | `index.html`                                    | `lang="en"`                   |

No axe/Playwright suite yet—document manual pass below. Future: optional e2e a11y job in MS6.

---

## Keyboard

| Criterion                         | Status | Implementation                                                    |
| --------------------------------- | ------ | ----------------------------------------------------------------- |
| Skip to main content              | PASS   | Skip link in `AppShell`                                           |
| All nav links focusable           | PASS   | Header + lesson prev/next + home cards                            |
| Controls operable without pointer | PASS   | Native `<input type="range">`, `<select>`, `<button>` with labels |
| Visible focus                     | PASS   | `:focus-visible` outline (`--color-focus`)                        |
| 3D orbit optional                 | PASS   | Scene usable without orbit; summary text always present           |

**Manual path:** Tab from browser chrome → skip link → Modules / References → lesson card → controls → content → next lesson.

---

## Non-visual / 3D alternatives

| Criterion                       | Status | Implementation                                                      |
| ------------------------------- | ------ | ------------------------------------------------------------------- |
| Scene has text summary          | PASS   | `sceneSummaries.ts` + `SceneViewport` region (`aria-live="polite"`) |
| Canvas has accessible name      | PASS   | `aria-label` on Canvas wrapper                                      |
| Metrics not color-only          | PASS   | Labels + numeric values; swatches `aria-hidden`                     |
| Status text for OOM / isolation | PASS   | Metric subtitles and control labels                                 |

---

## Motion

| Criterion                        | Status | Implementation                                                     |
| -------------------------------- | ------ | ------------------------------------------------------------------ |
| Respect `prefers-reduced-motion` | PASS   | `usePrefersReducedMotion`; autospin disabled; ribbon animation off |
| Orbit still available            | PASS   | User-driven orbit OK under reduced motion                          |

---

## Color and contrast

| Criterion              | Status     | Notes                                     |
| ---------------------- | ---------- | ----------------------------------------- |
| Dark theme body text   | PASS       | `#e8eef6` on `#0b0f14` (high contrast)    |
| Muted text             | ACCEPTABLE | `#9aabc0` on bg—prefer for secondary only |
| Focus ring             | PASS       | Gold `#f0c14a` visible on dark panels     |
| Meaning not color-only | PASS       | Design tokens + labels (design-system.md) |

---

## Layout

| Criterion     | Status | Notes                                                                     |
| ------------- | ------ | ------------------------------------------------------------------------- |
| Viewport meta | PASS   | `index.html`                                                              |
| Narrow width  | PASS   | Stacked lesson workspace CSS; header wraps                                |
| Touch targets | MOSTLY | Range sliders full width; nav links ≥ 44px height not enforced everywhere |

---

## Known residual gaps (acceptable for MS5)

1. WebGL canvas itself is not fully described to screen readers beyond the static/live summary (no per-frame SR dump).
2. No high-contrast theme toggle (dark-first only).
3. No automated axe CI yet (tracked as residual quality work).

---

## Changelog

| Date       | Change                                   |
| ---------- | ---------------------------------------- |
| 2026-07-12 | Initial a11y pass documentation for #23. |
