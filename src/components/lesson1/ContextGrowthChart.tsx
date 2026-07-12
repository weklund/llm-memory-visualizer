import { useMemo, useState } from "react";
import {
  CONTEXT_SCENARIOS,
  type ContextScenarioId,
  seriesForScenario,
} from "@/lib/lesson1Demo";
import styles from "./ContextGrowthChart.module.css";

const W = 360;
const H = 160;
const PAD = { t: 12, r: 12, b: 28, l: 36 };

/**
 * V2 — context length grows with each generation step under three scenarios.
 */
export function ContextGrowthChart() {
  const [id, setId] = useState<ContextScenarioId>("short");
  const scenario = CONTEXT_SCENARIOS.find((s) => s.id === id) ?? CONTEXT_SCENARIOS[0]!;
  const series = useMemo(() => seriesForScenario(scenario), [scenario]);

  const maxY = Math.max(...series.map((p) => p.tokens), 1);
  const maxX = Math.max(...series.map((p) => p.step), 1);

  const innerW = W - PAD.l - PAD.r;
  const innerH = H - PAD.t - PAD.b;

  const x = (step: number) => PAD.l + (step / maxX) * innerW;
  const y = (tokens: number) => PAD.t + innerH - (tokens / maxY) * innerH;

  const path = series
    .map(
      (p, i) =>
        `${i === 0 ? "M" : "L"} ${x(p.step).toFixed(1)} ${y(p.tokens).toFixed(1)}`,
    )
    .join(" ");

  const end = series.at(-1)!;

  return (
    <figure
      className={styles.figure}
      aria-label="Context growth under different scenarios"
    >
      <figcaption className={styles.caption}>
        How tall is the stack the next token decision stands on?
      </figcaption>

      <div className={styles.toggles} role="radiogroup" aria-label="Scenario">
        {CONTEXT_SCENARIOS.map((s) => (
          <label key={s.id} className={s.id === id ? styles.toggleActive : styles.toggle}>
            <input
              type="radio"
              name="context-scenario"
              value={s.id}
              checked={s.id === id}
              onChange={() => setId(s.id)}
            />
            {s.label}
          </label>
        ))}
      </div>

      <svg
        className={styles.svg}
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`Line chart: tokens in context over ${scenario.replySteps} reply steps. Final height ${end.tokens} tokens.`}
      >
        {/* axes */}
        <line
          x1={PAD.l}
          y1={PAD.t}
          x2={PAD.l}
          y2={PAD.t + innerH}
          stroke="var(--color-border-strong)"
          strokeWidth={1}
        />
        <line
          x1={PAD.l}
          y1={PAD.t + innerH}
          x2={PAD.l + innerW}
          y2={PAD.t + innerH}
          stroke="var(--color-border-strong)"
          strokeWidth={1}
        />
        <text x={4} y={PAD.t + 8} className={styles.axisLabel}>
          tokens
        </text>
        <text
          x={PAD.l + innerW / 2}
          y={H - 6}
          textAnchor="middle"
          className={styles.axisLabel}
        >
          reply step →
        </text>
        <text x={PAD.l - 6} y={y(maxY) + 4} textAnchor="end" className={styles.axisLabel}>
          {maxY}
        </text>
        <text x={PAD.l - 6} y={y(0) + 4} textAnchor="end" className={styles.axisLabel}>
          0
        </text>

        {/* base line guide */}
        <line
          x1={PAD.l}
          y1={y(scenario.baseTokens)}
          x2={PAD.l + innerW}
          y2={y(scenario.baseTokens)}
          stroke="var(--color-key)"
          strokeOpacity={0.35}
          strokeDasharray="4 3"
        />

        <path d={path} fill="none" stroke="var(--color-token)" strokeWidth={2.5} />
        <circle
          cx={x(end.step)}
          cy={y(end.tokens)}
          r={4}
          fill="var(--color-accent-strong)"
        />
      </svg>

      <p className={styles.insight}>
        <strong>{scenario.label}.</strong> {scenario.description} At the last step,
        context is <strong>{end.tokens}</strong> tokens (base {scenario.baseTokens} +{" "}
        {scenario.replySteps} generated).
      </p>
    </figure>
  );
}
