import { useEffect, useMemo, useState } from "react";
import { DEMO_REPLY_TOKENS } from "@/lib/lesson1Demo";
import { usePrefersReducedMotion } from "@/lib/prefersReducedMotion";
import styles from "./MentalModelContrast.module.css";

const TOKENS = DEMO_REPLY_TOKENS;
const FULL_TEXT = TOKENS.join(" ").replace(" — ", "—");
const N = TOKENS.length;
/** Hold finished state before looping */
const HOLD_FRAMES = 3;
/** Shared timeline length (both cards driven from the same frame) */
const CYCLE = N + HOLD_FRAMES;
/** Base ms between frames at 1× */
const BASE_STEP_MS = 1600;

type Speed = 1 | 2;
type WrongPhase = "think" | "dump" | "hold";
type WritePhase = "idle" | "writing" | "hold";

type FrameState = {
  count: number;
  writePhase: WritePhase;
  wrongPhase: WrongPhase;
  justDumped: boolean;
};

/** Map one shared frame index → both cards (kept in lockstep). */
function stateFromFrame(frame: number): FrameState {
  const f = ((frame % CYCLE) + CYCLE) % CYCLE;

  // Right: empty on frame 0 start of cycle after wrap handled outside;
  // frames 0..N-1 write tokens 1..N; then hold.
  let count: number;
  let writePhase: WritePhase;
  if (f < N) {
    count = f + 1;
    writePhase = "writing";
  } else {
    count = N;
    writePhase = "hold";
  }

  // Left: think while the first half of tokens land, then dump once, then hold
  // so both sides share the same clock and finish the cycle together.
  const dumpAt = Math.max(2, Math.floor(N / 2));
  let wrongPhase: WrongPhase;
  let justDumped = false;
  if (f < dumpAt) {
    wrongPhase = "think";
  } else if (f === dumpAt) {
    wrongPhase = "dump";
    justDumped = true;
  } else {
    wrongPhase = "hold";
  }

  return { count, writePhase, wrongPhase, justDumped };
}

/**
 * V0 — wrong model (whole paragraph at once) vs next-token loop (tokens land one by one).
 * Both sides share one frame clock; play/pause + 1×/2× speed.
 */
export function MentalModelContrast() {
  const reduceMotion = usePrefersReducedMotion();
  const [playing, setPlaying] = useState(!reduceMotion);
  const [speed, setSpeed] = useState<Speed>(1);
  const [frame, setFrame] = useState(reduceMotion ? N - 1 : 0);

  const derived = useMemo(
    () => (reduceMotion ? stateFromFrame(N - 1) : stateFromFrame(frame)),
    [frame, reduceMotion],
  );

  useEffect(() => {
    if (reduceMotion) {
      setFrame(N - 1);
      setPlaying(false);
      return;
    }
    if (!playing) return;

    const ms = Math.round(BASE_STEP_MS / speed);
    const id = window.setInterval(() => {
      setFrame((f) => (f + 1) % CYCLE);
    }, ms);
    return () => window.clearInterval(id);
  }, [reduceMotion, playing, speed]);

  const { count, writePhase, wrongPhase, justDumped } = derived;
  const showDump = wrongPhase === "dump" || wrongPhase === "hold";

  const nextLabel =
    count === 0
      ? "next: Soft"
      : count < N
        ? `next: ${TOKENS[count]}`
        : writePhase === "hold"
          ? "hold · then loop"
          : "done · restarting…";

  return (
    <figure
      className={styles.figure}
      aria-label="Two mental models of how a reply is written"
    >
      <div className={styles.toolbar}>
        <button
          type="button"
          className={styles.iconBtn}
          onClick={() => setPlaying((p) => !p)}
          disabled={reduceMotion}
          aria-pressed={playing}
          aria-label={playing ? "Pause" : "Play"}
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
        </button>
        <button
          type="button"
          className={styles.speedBtn}
          onClick={() => setSpeed((s) => (s === 1 ? 2 : 1))}
          disabled={reduceMotion}
          aria-label={speed === 1 ? "Switch to 2x speed" : "Switch to 1x speed"}
          title="Toggle playback speed"
        >
          {speed}×
        </button>
        <span className={styles.toolbarHint}>
          {reduceMotion
            ? "Static · reduced motion"
            : playing
              ? `Synced loop · ${speed}×`
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
              ) : writePhase === "writing" || count < N ? (
                <span>
                  Ran the <strong>whole model</strong> (pass {count} of {N}) · got{" "}
                  <strong>{TOKENS[count - 1]}</strong>
                  {count < N ? " · next pass for the following token" : ""}
                </span>
              ) : (
                <span>
                  Reply complete after <strong>{N}</strong> full model runs
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
                const isNewest = i === count - 1 && writePhase === "writing";
                const isNext = i === count && count < N;
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
