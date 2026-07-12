import { useCallback, useEffect, useRef, useState } from "react";
import { DEMO_PROMPT, DEMO_REPLY_TOKENS } from "@/lib/lesson1Demo";
import { usePrefersReducedMotion } from "@/lib/prefersReducedMotion";
import styles from "./GenerationTimeline.module.css";

const PROMPT_TOKEN_COUNT = 6; // schematic “prompt length” for the past counter

/**
 * V1 — primary interactive: step through one fixed autoregressive demo.
 */
export function GenerationTimeline() {
  const total = DEMO_REPLY_TOKENS.length;
  const [step, setStep] = useState(0); // tokens generated so far
  const [playing, setPlaying] = useState(false);
  const reduceMotion = usePrefersReducedMotion();
  const timer = useRef<number | null>(null);

  const pastLength = PROMPT_TOKEN_COUNT + step;
  const done = step >= total;
  const nextToken = done ? null : DEMO_REPLY_TOKENS[step];

  const clearTimer = () => {
    if (timer.current != null) {
      window.clearInterval(timer.current);
      timer.current = null;
    }
  };

  const stepOnce = useCallback(() => {
    setStep((s) => Math.min(total, s + 1));
  }, [total]);

  const reset = () => {
    clearTimer();
    setPlaying(false);
    setStep(0);
  };

  useEffect(() => {
    if (!playing) {
      clearTimer();
      return;
    }
    if (reduceMotion) {
      setStep(total);
      setPlaying(false);
      return;
    }
    timer.current = window.setInterval(() => {
      setStep((s) => {
        if (s >= total) {
          setPlaying(false);
          return s;
        }
        return s + 1;
      });
    }, 700);
    return clearTimer;
  }, [playing, reduceMotion, total]);

  useEffect(() => {
    if (done) setPlaying(false);
  }, [done]);

  const status = done
    ? `Done. Model ran ${total} times. Past length is ${pastLength} tokens (prompt + full reply).`
    : step === 0
      ? `Ready. Past is only the prompt (${PROMPT_TOKEN_COUNT} schematic tokens). Next: run the model once.`
      : `Model run #${step}. Past length = ${pastLength}. Next token: “${nextToken}”.`;

  return (
    <figure className={styles.figure} aria-label="Autoregressive generation timeline">
      <figcaption className={styles.caption}>
        Fixed demo — same tokens every time. One <strong>Step</strong> = one model run =
        one new piece of text.
      </figcaption>

      <p className={styles.prompt}>
        <span className={styles.promptLabel}>Prompt</span>
        {DEMO_PROMPT}
      </p>

      <div className={styles.timeline} role="list" aria-label="Token timeline">
        <span className={styles.groupLabel} role="presentation">
          prompt
        </span>
        {Array.from({ length: PROMPT_TOKEN_COUNT }, (_, i) => (
          <span
            key={`p-${i}`}
            className={`${styles.token} ${styles.tokenPrompt}`}
            role="listitem"
          >
            ·
          </span>
        ))}
        <span className={styles.divider} aria-hidden="true" />
        <span className={styles.groupLabel} role="presentation">
          reply
        </span>
        {DEMO_REPLY_TOKENS.map((tok, i) => {
          const written = i < step;
          const isNext = i === step && !done;
          return (
            <span
              key={`r-${i}`}
              role="listitem"
              className={[
                styles.token,
                written ? styles.tokenWritten : styles.tokenEmpty,
                isNext ? styles.tokenNext : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {written ? tok : isNext ? "?" : "·"}
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
          onClick={stepOnce}
          disabled={done}
        >
          Step once
        </button>
        <button
          type="button"
          className={styles.btn}
          onClick={() => setPlaying((p) => !p)}
          disabled={done && !playing}
        >
          {playing ? "Pause" : "Play"}
        </button>
        <button type="button" className={styles.btn} onClick={reset}>
          Reset
        </button>
      </div>

      <p className={styles.practice}>
        <strong>Try this:</strong> Reset, then Step until the reply has 5 tokens. What is
        past length? Step once more—what is it now?
      </p>
    </figure>
  );
}
