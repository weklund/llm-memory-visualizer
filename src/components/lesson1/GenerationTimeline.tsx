import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  TIMELINE_SCENARIOS,
  maxPastLength,
  pastLengthAt,
  priorTokens,
  type TimelineScenarioId,
} from "@/lib/lesson1Demo";
import { usePrefersReducedMotion } from "@/lib/prefersReducedMotion";
import styles from "./GenerationTimeline.module.css";

const LAYER_COUNT = 5;
const PASS_MS = 900;
const GAP_MS = 500;
/** Cap prompt dots in mini-context so long prompts stay readable */
const MINI_PROMPT_CAP = 16;
const MINI_PRIOR_CAP = 12;

type PassPhase = "idle" | "running";

/**
 * Step through autoregressive generation with scenario bases (long prompt /
 * growing reply / multi-turn) and an explicit full-model-run beat per token.
 */
export function GenerationTimeline() {
  const [scenarioId, setScenarioId] = useState<TimelineScenarioId>("growing-reply");
  const scenario = useMemo(
    () => TIMELINE_SCENARIOS.find((s) => s.id === scenarioId) ?? TIMELINE_SCENARIOS[1]!,
    [scenarioId],
  );

  const replyPath = scenario.replyTokens;
  const total = replyPath.length;
  const prior = priorTokens(scenario);
  const promptN = scenario.promptTokens;

  const [step, setStep] = useState(0);
  const [phase, setPhase] = useState<PassPhase>("idle");
  const [playing, setPlaying] = useState(false);
  const reduceMotion = usePrefersReducedMotion();
  const passTimer = useRef<number | null>(null);
  const playTimer = useRef<number | null>(null);

  const pastLength = pastLengthAt(scenario, step);
  const maxPast = maxPastLength(scenario);
  const done = step >= total;
  const nextToken = done ? null : replyPath[step];
  const replyTokens = replyPath.slice(0, step);
  const replySoFar = replyTokens.join(" ");

  const priorPct = maxPast > 0 ? (prior / maxPast) * 100 : 0;
  const promptPct = maxPast > 0 ? (promptN / maxPast) * 100 : 0;
  const replyPct = maxPast > 0 ? (step / maxPast) * 100 : 0;

  const miniPromptDots = Math.min(promptN, MINI_PROMPT_CAP);
  const miniPriorDots = Math.min(prior, MINI_PRIOR_CAP);

  const clearPassTimer = () => {
    if (passTimer.current != null) {
      window.clearTimeout(passTimer.current);
      passTimer.current = null;
    }
  };

  const clearPlayTimer = () => {
    if (playTimer.current != null) {
      window.clearTimeout(playTimer.current);
      playTimer.current = null;
    }
  };

  const clearAll = () => {
    clearPassTimer();
    clearPlayTimer();
  };

  const selectScenario = (id: TimelineScenarioId) => {
    clearAll();
    setPlaying(false);
    setPhase("idle");
    setStep(0);
    setScenarioId(id);
  };

  const runOnePass = useCallback(() => {
    if (step >= total || phase === "running") return;

    if (reduceMotion) {
      setStep((s) => Math.min(total, s + 1));
      setPhase("idle");
      return;
    }

    setPhase("running");
    clearPassTimer();
    passTimer.current = window.setTimeout(() => {
      setStep((s) => Math.min(total, s + 1));
      setPhase("idle");
      passTimer.current = null;
    }, PASS_MS);
  }, [step, total, phase, reduceMotion]);

  const reset = () => {
    clearAll();
    setPlaying(false);
    setPhase("idle");
    setStep(0);
  };

  useEffect(() => {
    if (!playing || reduceMotion) return;
    if (step >= total) {
      setPlaying(false);
      return;
    }
    if (phase === "running") return;

    clearPlayTimer();
    playTimer.current = window.setTimeout(
      () => {
        runOnePass();
      },
      step === 0 && phase === "idle" ? 200 : GAP_MS,
    );

    return clearPlayTimer;
  }, [playing, phase, step, total, reduceMotion, runOnePass]);

  useEffect(() => () => clearAll(), []);

  const breakdown =
    prior > 0
      ? `prior ${prior} + prompt ${promptN} + reply ${step}`
      : `prompt ${promptN} + reply ${step}`;

  const status =
    phase === "running" && nextToken
      ? `Pass ${step + 1} of ${total}: full model run on past (${pastLength} tok) → “${nextToken}”.`
      : done
        ? `Done. ${total} full model runs. Final past length = ${pastLength} (${breakdown}).`
        : step === 0
          ? `Past already has ${pastLength} tokens before any new reply (${breakdown}). Next Step = one full model run for the first reply token.`
          : `Last pass produced “${replyPath[step - 1]}”. Past length = ${pastLength}. Next Step = another full run.`;

  return (
    <figure className={styles.figure} aria-label="Full model pass then next token">
      <figcaption className={styles.caption}>
        Same loop every time: <strong>full model run → one token → past grows</strong>.
        Switch scenarios to see what makes the past tall.
      </figcaption>

      <div
        className={styles.scenarios}
        role="radiogroup"
        aria-label="What makes past grow"
      >
        {TIMELINE_SCENARIOS.map((s) => (
          <label
            key={s.id}
            className={s.id === scenarioId ? styles.scenarioActive : styles.scenario}
          >
            <input
              type="radio"
              name="timeline-scenario"
              value={s.id}
              checked={s.id === scenarioId}
              onChange={() => selectScenario(s.id)}
            />
            {s.label}
          </label>
        ))}
      </div>
      <p className={styles.scenarioBlurb}>{scenario.blurb}</p>

      <div
        className={styles.meters}
        aria-label={`Past length ${pastLength} of up to ${maxPast} tokens. Model passes completed ${step} of ${total}.`}
      >
        <div className={styles.meterStat}>
          <span className={styles.meterLabel}>Past length</span>
          <span className={styles.meterValue}>
            {pastLength}
            <span className={styles.meterUnit}> tok</span>
          </span>
          <span className={styles.meterSub}>{breakdown}</span>
        </div>
        <div className={styles.meterStat}>
          <span className={styles.meterLabel}>Full model runs</span>
          <span className={styles.meterValue}>
            {step}
            <span className={styles.meterUnit}> / {total}</span>
          </span>
          <span className={styles.meterSub}>
            {done ? "complete" : phase === "running" ? "running…" : "completed so far"}
          </span>
        </div>
        <div className={styles.meterBarBlock}>
          <div className={styles.meterBarHeader}>
            <span className={styles.meterLabel}>Token stack</span>
            <span className={styles.meterBarScale}>
              {pastLength} / {maxPast}
            </span>
          </div>
          <div className={styles.meterBarTrack} role="presentation">
            {prior > 0 ? (
              <span
                className={styles.meterBarPrior}
                style={{ width: `${priorPct}%` }}
                title={`Earlier turns: ${prior} tokens`}
              />
            ) : null}
            <span
              className={styles.meterBarPrompt}
              style={{ width: `${promptPct}%` }}
              title={`Prompt: ${promptN} tokens`}
            />
            <span
              className={styles.meterBarReply}
              style={{ width: `${replyPct}%` }}
              title={`Reply so far: ${step} tokens`}
            />
          </div>
          <div className={styles.meterLegend}>
            {prior > 0 ? <span className={styles.legendPrior}>earlier turns</span> : null}
            <span className={styles.legendPrompt}>prompt</span>
            <span className={styles.legendReply}>reply</span>
          </div>
        </div>
      </div>

      <div className={styles.contextBox}>
        <span className={styles.contextLabel}>Context the next pass sees</span>
        {scenario.priorTurns.length > 0 ? (
          <div className={styles.turnBands}>
            {scenario.priorTurns.map((t, i) => (
              <div key={i} className={styles.turnBand}>
                <span className={styles.turnRole}>{t.role}</span>
                <span className={styles.turnText}>{t.text}</span>
                <span className={styles.turnTok}>{t.tokens} tok</span>
              </div>
            ))}
          </div>
        ) : null}
        <p className={styles.contextText}>
          <span className={styles.promptText}>{scenario.promptDisplay}</span>
          {replySoFar ? (
            <>
              {" "}
              <span className={styles.replyText}>{replySoFar}</span>
            </>
          ) : null}
          {phase === "running" ? (
            <span className={styles.cursorPulse} aria-hidden="true" />
          ) : !done ? (
            <span className={styles.cursor} aria-hidden="true" />
          ) : null}
        </p>
      </div>

      <p className={styles.feedNote} aria-hidden="true">
        ↓
      </p>

      <div
        className={[
          styles.pipeline,
          phase === "running" ? styles.pipelineActive : "",
        ].join(" ")}
        aria-hidden="true"
      >
        <div
          className={[styles.pipeIn, phase === "running" ? styles.pipeInActive : ""]
            .filter(Boolean)
            .join(" ")}
        >
          <span className={styles.pipeTag}>in · mini context</span>
          <div className={styles.miniContext} title="Same past as the box above">
            {prior > 0 ? (
              <span className={styles.miniPriorRow}>
                {Array.from({ length: miniPriorDots }, (_, i) => (
                  <span key={`pr-${i}`} className={styles.miniPriorChip} />
                ))}
                {prior > MINI_PRIOR_CAP ? (
                  <span className={styles.miniMore}>+{prior - MINI_PRIOR_CAP}</span>
                ) : null}
              </span>
            ) : null}
            <span className={styles.miniPromptRow}>
              {Array.from({ length: miniPromptDots }, (_, i) => (
                <span key={`mp-${i}`} className={styles.miniPromptChip} />
              ))}
              {promptN > MINI_PROMPT_CAP ? (
                <span className={styles.miniMore}>+{promptN - MINI_PROMPT_CAP}</span>
              ) : null}
            </span>
            {replyTokens.length > 0 ? (
              <span className={styles.miniReplyRow}>
                {replyTokens.map((tok, i) => (
                  <span key={`mr-${i}`} className={styles.miniReplyChip}>
                    {tok.length > 4 ? `${tok.slice(0, 3)}…` : tok}
                  </span>
                ))}
              </span>
            ) : (
              <span className={styles.miniEmptyReply}>reply not started</span>
            )}
          </div>
          <span className={styles.pipeInCount}>{pastLength} tok</span>
        </div>
        <span className={styles.pipeArrow}>→</span>
        <div className={styles.net}>
          <span className={styles.netLabel}>full model run</span>
          <div className={styles.layers}>
            {Array.from({ length: LAYER_COUNT }, (_, i) => (
              <span
                key={i}
                className={styles.layer}
                style={{
                  animationDelay: phase === "running" ? `${i * 0.12}s` : undefined,
                }}
              />
            ))}
          </div>
          <span className={styles.netHint}>every part fires · once · for one token</span>
        </div>
        <span className={styles.pipeArrow}>→</span>
        <div
          className={[
            styles.pipeOut,
            phase === "running" ? styles.pipeOutLive : "",
            step > 0 && phase === "idle" ? styles.pipeOutSettled : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <span className={styles.pipeTag}>out</span>
          <span className={styles.pipeOutToken}>
            {phase === "running" && nextToken
              ? nextToken
              : step > 0
                ? replyPath[step - 1]
                : "—"}
          </span>
          <span className={styles.pipeOutNote}>1 token</span>
        </div>
      </div>

      <div className={styles.tokenStrip} role="list" aria-label="Reply tokens so far">
        {replyPath.map((tok, i) => {
          const written = i < step;
          const pending = i === step && phase === "running";
          return (
            <span
              key={`${tok}-${i}`}
              role="listitem"
              className={[
                styles.chip,
                written ? styles.chipOn : styles.chipOff,
                pending ? styles.chipPending : "",
                i === step - 1 && phase === "idle" ? styles.chipLatest : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {written ? tok : pending ? "…" : "·"}
            </span>
          );
        })}
      </div>

      <p className={styles.status} aria-live="polite">
        {status}
      </p>

      <div className={styles.controls}>
        <button
          type="button"
          className={styles.btnPrimary}
          onClick={runOnePass}
          disabled={done || phase === "running"}
        >
          Step
        </button>
        <button
          type="button"
          className={styles.btn}
          onClick={() => setPlaying((p) => !p)}
          disabled={(done && !playing) || phase === "running"}
        >
          {playing ? "Pause" : "Play"}
        </button>
        <button type="button" className={styles.btn} onClick={reset}>
          Reset
        </button>
      </div>

      <p className={styles.practice}>
        <strong>Try this:</strong> Switch to <em>Longer prompt</em>—past length starts
        high before any reply. Then <em>Multi-turn</em>—earlier turns sit under the
        current prompt. In every case, Step still adds one token after one full model run.
      </p>
    </figure>
  );
}
