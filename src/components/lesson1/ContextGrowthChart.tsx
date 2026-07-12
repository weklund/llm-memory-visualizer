import { useMemo, useState } from "react";
import {
  TIMELINE_SCENARIOS,
  maxPastLength,
  pastLengthAt,
  priorTokens,
  seriesForTimelineScenario,
  type TimelineScenarioId,
} from "@/lib/lesson1Demo";
import styles from "./ContextGrowthChart.module.css";

const W = 400;
const H = 200;
const PAD = { t: 16, r: 16, b: 36, l: 40 };

const STROKE: Record<TimelineScenarioId, string> = {
  "long-prompt": "var(--color-key)",
  "growing-reply": "var(--color-token)",
  "multi-turn": "var(--color-page)",
};

/**
 * Compare how past length grows under the same three scenarios as the timeline.
 * All curves share one axes so start height and slope read clearly.
 */
export function ContextGrowthChart() {
  const [focus, setFocus] = useState<TimelineScenarioId>("growing-reply");
  const active = TIMELINE_SCENARIOS.find((s) => s.id === focus) ?? TIMELINE_SCENARIOS[1]!;

  const seriesById = useMemo(() => {
    const map = new Map<TimelineScenarioId, { step: number; tokens: number }[]>();
    for (const s of TIMELINE_SCENARIOS) {
      map.set(s.id, seriesForTimelineScenario(s));
    }
    return map;
  }, []);

  const maxX = Math.max(...TIMELINE_SCENARIOS.map((s) => s.replyTokens.length), 1);
  const maxY = Math.max(...TIMELINE_SCENARIOS.map((s) => maxPastLength(s)), 1);

  const innerW = W - PAD.l - PAD.r;
  const innerH = H - PAD.t - PAD.b;
  const x = (step: number) => PAD.l + (step / maxX) * innerW;
  const y = (tokens: number) => PAD.t + innerH - (tokens / maxY) * innerH;

  const pathFor = (series: { step: number; tokens: number }[]) =>
    series
      .map(
        (p, i) =>
          `${i === 0 ? "M" : "L"} ${x(p.step).toFixed(1)} ${y(p.tokens).toFixed(1)}`,
      )
      .join(" ");

  const startH = pastLengthAt(active, 0);
  const endH = maxPastLength(active);
  const prior = priorTokens(active);
  const replyLen = active.replyTokens.length;

  const startBits =
    prior > 0
      ? `earlier turns ${prior} + prompt ${active.promptTokens}`
      : `prompt ${active.promptTokens}`;

  return (
    <figure className={styles.figure} aria-label="How past length grows by scenario">
      <figcaption className={styles.caption}>
        Same three situations as the timeline. <strong>Height at step 0</strong> is what
        is already in past before any new reply token; the line rises as the reply grows.
      </figcaption>

      <div className={styles.toggles} role="radiogroup" aria-label="Highlight scenario">
        {TIMELINE_SCENARIOS.map((s) => (
          <label
            key={s.id}
            className={s.id === focus ? styles.toggleActive : styles.toggle}
            style={
              s.id === focus
                ? {
                    borderColor: STROKE[s.id],
                    boxShadow: `inset 0 -2px 0 ${STROKE[s.id]}`,
                  }
                : undefined
            }
          >
            <input
              type="radio"
              name="growth-focus"
              value={s.id}
              checked={s.id === focus}
              onChange={() => setFocus(s.id)}
            />
            <span
              className={styles.swatch}
              style={{ background: STROKE[s.id] }}
              aria-hidden="true"
            />
            {s.label}
          </label>
        ))}
      </div>

      <div className={styles.callouts}>
        <div className={styles.callout}>
          <span className={styles.calloutLabel}>At start (step 0)</span>
          <span className={styles.calloutValue}>{startH} tok</span>
          <span className={styles.calloutSub}>{startBits}</span>
        </div>
        <div className={styles.callout}>
          <span className={styles.calloutLabel}>After full reply</span>
          <span className={styles.calloutValue}>{endH} tok</span>
          <span className={styles.calloutSub}>
            +{replyLen} reply tokens · {replyLen} full model runs
          </span>
        </div>
      </div>

      <svg
        className={styles.svg}
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`Past length vs reply step for ${active.label}. Starts at ${startH}, ends at ${endH}.`}
      >
        {/* grid */}
        {[0.25, 0.5, 0.75, 1].map((t) => (
          <line
            key={t}
            x1={PAD.l}
            y1={y(maxY * t)}
            x2={PAD.l + innerW}
            y2={y(maxY * t)}
            stroke="var(--color-border)"
            strokeWidth={1}
            strokeOpacity={0.6}
          />
        ))}

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

        <text x={4} y={PAD.t + 10} className={styles.axisLabel}>
          past length
        </text>
        <text
          x={PAD.l + innerW / 2}
          y={H - 8}
          textAnchor="middle"
          className={styles.axisLabel}
        >
          reply tokens produced →
        </text>
        <text x={PAD.l - 6} y={y(maxY) + 4} textAnchor="end" className={styles.axisLabel}>
          {maxY}
        </text>
        <text x={PAD.l - 6} y={y(0) + 4} textAnchor="end" className={styles.axisLabel}>
          0
        </text>

        {/* All curves: dim others, emphasize focus */}
        {TIMELINE_SCENARIOS.map((s) => {
          const series = seriesById.get(s.id)!;
          const isFocus = s.id === focus;
          return (
            <g key={s.id}>
              <path
                d={pathFor(series)}
                fill="none"
                stroke={STROKE[s.id]}
                strokeWidth={isFocus ? 3 : 1.5}
                strokeOpacity={isFocus ? 1 : 0.28}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              {/* start marker */}
              <circle
                cx={x(0)}
                cy={y(series[0]!.tokens)}
                r={isFocus ? 4.5 : 3}
                fill={STROKE[s.id]}
                opacity={isFocus ? 1 : 0.35}
              />
              {/* end marker */}
              <circle
                cx={x(series.at(-1)!.step)}
                cy={y(series.at(-1)!.tokens)}
                r={isFocus ? 5 : 3}
                fill={STROKE[s.id]}
                opacity={isFocus ? 1 : 0.35}
              />
            </g>
          );
        })}

        {/* Active start baseline */}
        <line
          x1={PAD.l}
          y1={y(startH)}
          x2={PAD.l + innerW}
          y2={y(startH)}
          stroke={STROKE[focus]}
          strokeOpacity={0.35}
          strokeDasharray="5 4"
        />
        <text
          x={PAD.l + innerW - 4}
          y={y(startH) - 6}
          textAnchor="end"
          className={styles.guideLabel}
          fill={STROKE[focus]}
        >
          start {startH}
        </text>
      </svg>

      <p className={styles.insight}>
        <strong>{active.label}.</strong> {active.blurb} The curve starts at{" "}
        <strong>{startH}</strong> (already in past) and ends at <strong>{endH}</strong>{" "}
        after {replyLen} reply tokens—each step is one full model run standing on a taller
        stack.
      </p>
    </figure>
  );
}
