import { useEffect, useState } from "react";
import { DEMO_REPLY_TOKENS } from "@/lib/lesson1Demo";
import { usePrefersReducedMotion } from "@/lib/prefersReducedMotion";
import styles from "./MentalModelContrast.module.css";

const TOKENS = DEMO_REPLY_TOKENS;
const FULL_TEXT = TOKENS.join(" ").replace(" — ", "—");

type WrongPhase = "think" | "dump" | "hold";

/**
 * V0 — wrong model (whole paragraph at once) vs next-token loop (tokens land one by one).
 */
export function MentalModelContrast() {
  const reduceMotion = usePrefersReducedMotion();
  const [count, setCount] = useState(reduceMotion ? TOKENS.length : 0);
  const [phase, setPhase] = useState<"writing" | "hold" | "reset">("writing");
  const [wrongPhase, setWrongPhase] = useState<WrongPhase>(
    reduceMotion ? "dump" : "think",
  );

  useEffect(() => {
    if (reduceMotion) {
      setCount(TOKENS.length);
      setWrongPhase("dump");
      return;
    }

    // Left: think (empty) → dump all → hold → clear → think…
    // ~1.1s per beat: longer think, brief dump flash, longer hold to read
    let t = 0;
    setWrongPhase("think");
    const wrongTimer = window.setInterval(() => {
      t += 1;
      const beat = t % 8;
      if (beat <= 3) setWrongPhase("think"); // ~4.4s thinking
      else if (beat === 4) setWrongPhase("dump"); // pop-in
      else setWrongPhase("hold"); // ~3.3s hold full reply
    }, 1100);

    // Right: one token per beat (~1s each so chips are readable)
    let i = 0;
    setCount(0);
    setPhase("writing");
    const stepTimer = window.setInterval(() => {
      i += 1;
      if (i <= TOKENS.length) {
        setCount(i);
        setPhase("writing");
      } else if (i <= TOKENS.length + 2) {
        setPhase("hold"); // hold finished reply longer before reset
      } else {
        i = 0;
        setCount(0);
        setPhase("reset");
      }
    }, 1000);

    return () => {
      window.clearInterval(wrongTimer);
      window.clearInterval(stepTimer);
    };
  }, [reduceMotion]);

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
                <span>waiting for first model run…</span>
              ) : count <= TOKENS.length ? (
                <span>
                  model run <strong>#{count}</strong>
                  {count < TOKENS.length ? (
                    <>
                      {" "}
                      · appended <strong>{TOKENS[count - 1]}</strong>
                    </>
                  ) : (
                    <> · reply complete</>
                  )}
                </span>
              ) : null}
            </div>
            <div
              className={styles.tokenRow}
              role="list"
              aria-label="Tokens appearing one by one"
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
            One model run → one small piece → append → run again. The past grows with each
            piece.
          </p>
        </div>
      </div>
    </figure>
  );
}
