import { useEffect, useState } from "react";
import { DEMO_REPLY_TOKENS } from "@/lib/lesson1Demo";
import { usePrefersReducedMotion } from "@/lib/prefersReducedMotion";
import styles from "./MentalModelContrast.module.css";

const TOKENS = DEMO_REPLY_TOKENS;
const FULL_TEXT = TOKENS.join(" ").replace(" — ", "—");

/** Left card phase beat (ms) — think / dump / hold steps */
const WRONG_BEAT_MS = 1800;
/** Right card: time between tokens (ms) */
const TOKEN_STEP_MS = 1600;

type WrongPhase = "think" | "dump" | "hold";

/**
 * V0 — wrong model (whole paragraph at once) vs next-token loop (tokens land one by one).
 */
export function MentalModelContrast() {
  const reduceMotion = usePrefersReducedMotion();
  const [playing, setPlaying] = useState(!reduceMotion);
  const [count, setCount] = useState(reduceMotion ? TOKENS.length : 0);
  const [phase, setPhase] = useState<"writing" | "hold" | "reset">("writing");
  const [wrongPhase, setWrongPhase] = useState<WrongPhase>(
    reduceMotion ? "dump" : "think",
  );

  useEffect(() => {
    if (reduceMotion) {
      setCount(TOKENS.length);
      setWrongPhase("dump");
      setPlaying(false);
      return;
    }

    if (!playing) return;

    // Left: think → dump → hold → think…
    let t = 0;
    const wrongTimer = window.setInterval(() => {
      t += 1;
      const beat = t % 9;
      if (beat <= 4)
        setWrongPhase("think"); // ~9s thinking
      else if (beat === 5) setWrongPhase("dump");
      else setWrongPhase("hold"); // ~5.4s hold
    }, WRONG_BEAT_MS);

    // Right: one token per beat
    let i = count;
    const stepTimer = window.setInterval(() => {
      i += 1;
      if (i <= TOKENS.length) {
        setCount(i);
        setPhase("writing");
      } else if (i <= TOKENS.length + 3) {
        setPhase("hold");
      } else {
        i = 0;
        setCount(0);
        setPhase("reset");
      }
    }, TOKEN_STEP_MS);

    return () => {
      window.clearInterval(wrongTimer);
      window.clearInterval(stepTimer);
    };
    // Restart timers from current count when unpausing (intentional)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-run when play/reduceMotion flips
  }, [reduceMotion, playing]);

  const nextLabel =
    count === 0
      ? "next: Soft"
      : count < TOKENS.length
        ? `next: ${TOKENS[count]}`
        : "done · restarting…";

  const showDump = wrongPhase === "dump" || wrongPhase === "hold";
  const justDumped = wrongPhase === "dump";

  return (
    <figure
      className={styles.figure}
      aria-label="Two mental models of how a reply is written"
    >
      <div className={styles.toolbar}>
        <button
          type="button"
          className={styles.playBtn}
          onClick={() => setPlaying((p) => !p)}
          disabled={reduceMotion}
          aria-pressed={playing}
          aria-label={playing ? "Pause animation" : "Play animation"}
          title={
            reduceMotion ? "Animation off (reduced motion)" : playing ? "Pause" : "Play"
          }
        >
          {playing ? (
            <span className={styles.iconPause} aria-hidden="true">
              <i />
              <i />
            </span>
          ) : (
            <span className={styles.iconPlay} aria-hidden="true" />
          )}
          <span className={styles.playLabel}>{playing ? "Pause" : "Play"}</span>
        </button>
        <span className={styles.toolbarHint}>
          {reduceMotion
            ? "Static view · reduced motion"
            : playing
              ? "Looping both sides"
              : "Paused"}
        </span>
      </div>

      <div className={styles.grid}>
        <div className={styles.card}>
          <p className={styles.label}>Common mental model</p>
          <div className={styles.stage}>
            <div
              className={styles.wrongFlow}
              aria-live="polite"
              aria-label={
                wrongPhase === "think"
                  ? "Phase: thinking about the whole answer"
                  : "Phase: dump the whole answer at once"
              }
            >
              <span
                className={[
                  styles.phasePill,
                  wrongPhase === "think"
                    ? styles.phasePillActiveThink
                    : styles.phasePillIdle,
                ].join(" ")}
              >
                {wrongPhase === "think" ? "▸ think" : "think"}
              </span>
              <span
                className={[styles.arrow, showDump ? styles.arrowActive : ""]
                  .filter(Boolean)
                  .join(" ")}
                aria-hidden="true"
              >
                →
              </span>
              <span
                className={[
                  styles.phasePill,
                  showDump ? styles.phasePillActiveDump : styles.phasePillIdle,
                ].join(" ")}
              >
                {showDump ? "▸ dump all at once" : "dump all at once"}
              </span>
            </div>

            <div
              className={[
                styles.paragraphBlock,
                showDump ? styles.paragraphIn : styles.paragraphThink,
                justDumped ? styles.paragraphPop : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {showDump ? (
                FULL_TEXT
              ) : (
                <span className={styles.thinkPlaceholder}>
                  <span className={styles.thinkDots} aria-hidden="true">
                    <i />
                    <i />
                    <i />
                  </span>
                  forming the whole answer…
                </span>
              )}
            </div>
            <p className={styles.phaseStatus}>
              {wrongPhase === "think"
                ? "Step 1 — “think” (no tokens yet)"
                : "Step 2 — entire reply appears in one shot"}
            </p>
          </div>
          <p className={styles.caption}>
            Whole answer appears as one finished block—no intermediate pieces.
          </p>
        </div>

        <div className={`${styles.card} ${styles.cardRight}`}>
          <p className={styles.label}>What actually happens</p>
          <div className={styles.stage}>
            <div className={styles.runMeter} aria-live="polite">
              {count === 0 ? (
                <span>About to run the whole model for the first token…</span>
              ) : count < TOKENS.length || phase === "writing" ? (
                <span>
                  Ran the <strong>whole model</strong> (pass {count}
                  {TOKENS.length ? ` of ~${TOKENS.length}` : ""}) · got{" "}
                  <strong>{TOKENS[count - 1]}</strong> · will run the whole model again
                  for the next token
                </span>
              ) : (
                <span>
                  Reply complete after <strong>{TOKENS.length}</strong> full model runs
                </span>
              )}
            </div>
            <div
              className={styles.tokenRow}
              role="list"
              aria-label="Tokens appearing one by one after full model passes"
            >
              {TOKENS.map((tok, i) => {
                const visible = i < count;
                const isNewest = i === count - 1 && phase === "writing";
                const isNext = i === count && count < TOKENS.length;
                return (
                  <span
                    key={`${tok}-${i}`}
                    role="listitem"
                    className={[
                      styles.chip,
                      visible ? styles.chipOn : styles.chipOff,
                      isNewest ? styles.chipNewest : "",
                      isNext ? styles.chipNext : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    {visible ? tok : isNext ? "?" : "·"}
                  </span>
                );
              })}
            </div>
            <p className={styles.nextLine}>{nextLabel}</p>
          </div>
          <p className={styles.caption}>
            Not a light local guess: each step runs the <strong>whole model once</strong>{" "}
            for <strong>one</strong> token, appends it, then runs the whole model again.
          </p>
        </div>
      </div>
    </figure>
  );
}
