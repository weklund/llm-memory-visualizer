import { useCallback, useEffect, useRef, useState } from "react";
import { DEMO_PROMPT, DEMO_REPLY_TOKENS } from "@/lib/lesson1Demo";
import { usePrefersReducedMotion } from "@/lib/prefersReducedMotion";
import styles from "./GenerationTimeline.module.css";

/** Schematic prompt size for “past length” (not a real tokenizer). */
const PROMPT_TOKEN_COUNT = 6;
const LAYER_COUNT = 5;
/** Time for the schematic layer sweep before the token lands */
const PASS_MS = 900;
/** Pause after a token lands before the next autoplay pass */
const GAP_MS = 500;

type PassPhase = "idle" | "running" | "done";

/**
 * V1 — step through autoregressive generation with an explicit “full model pass”
 * beat between tokens (builds on the high-level contrast card above).
 */
export function GenerationTimeline() {
  const total = DEMO_REPLY_TOKENS.length;
  const [step, setStep] = useState(0);
  const [phase, setPhase] = useState<PassPhase>("idle");
  const [playing, setPlaying] = useState(false);
  const reduceMotion = usePrefersReducedMotion();
  const passTimer = useRef<number | null>(null);
  const playTimer = useRef<number | null>(null);

  const pastLength = PROMPT_TOKEN_COUNT + step;
  const done = step >= total;
  const nextToken = done ? null : DEMO_REPLY_TOKENS[step];
  const replyTokens = DEMO_REPLY_TOKENS.slice(0, step);
  const replySoFar = replyTokens.join(" ");

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

  // Autoplay: after each pass settles, schedule the next
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

  const status =
    phase === "running" && nextToken
      ? `Pass ${step + 1} of ${total}: whole model is running on the context so far → will emit “${nextToken}”.`
      : done
        ? `Done. ${total} full model passes. Past length = ${pastLength} (prompt ${PROMPT_TOKEN_COUNT} + reply ${total}).`
        : step === 0
          ? `Past = prompt only (${PROMPT_TOKEN_COUNT} tokens). Next Step runs the whole model once for the first reply token.`
          : `Last pass produced “${DEMO_REPLY_TOKENS[step - 1]}”. Past length = ${pastLength}. Next Step = another full pass.`;

  return (
    <figure className={styles.figure} aria-label="Full model pass then next token">
      <figcaption className={styles.caption}>
        Same fixed demo as above—but each <strong>Step</strong> shows a schematic{" "}
        <strong>full model pass</strong>, then one new token is appended to the context.
      </figcaption>

      <div className={styles.contextBox} id="gen-timeline-context">
        <span className={styles.contextLabel}>Context the next pass sees</span>
        <p className={styles.contextText}>
          <span className={styles.promptText}>{DEMO_PROMPT}</span>
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
        <p className={styles.contextMeta}>
          Past length: <strong>{pastLength}</strong> tokens
          {done ? " (final)" : ` · pass ${Math.min(step + 1, total)} / ${total}`}
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
          <div className={styles.miniContext} title="Same past text as the box above">
            <span className={styles.miniPromptRow}>
              {Array.from({ length: PROMPT_TOKEN_COUNT }, (_, i) => (
                <span key={`mp-${i}`} className={styles.miniPromptChip} />
              ))}
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
          <span className={styles.netLabel}>whole model (schematic)</span>
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
          <span className={styles.netHint}>one forward pass</span>
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
                ? DEMO_REPLY_TOKENS[step - 1]
                : "—"}
          </span>
          <span className={styles.pipeOutNote}>1 token</span>
        </div>
      </div>

      <div className={styles.tokenStrip} role="list" aria-label="Reply tokens so far">
        {DEMO_REPLY_TOKENS.map((tok, i) => {
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
          Step (full pass)
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
        <strong>Try this:</strong> Reset, then Step five times. You should see five full
        passes and past length = {PROMPT_TOKEN_COUNT + 5}.
      </p>
    </figure>
  );
}
