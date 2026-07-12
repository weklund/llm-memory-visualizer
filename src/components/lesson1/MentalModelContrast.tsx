import { useEffect, useState } from "react";
import { DEMO_REPLY_TOKENS } from "@/lib/lesson1Demo";
import { usePrefersReducedMotion } from "@/lib/prefersReducedMotion";
import styles from "./MentalModelContrast.module.css";

const TOKENS = DEMO_REPLY_TOKENS;
const FULL_TEXT = TOKENS.join(" ").replace(" — ", "—");

/**
 * V0 — wrong model (whole paragraph at once) vs next-token loop (tokens land one by one).
 */
export function MentalModelContrast() {
  const reduceMotion = usePrefersReducedMotion();
  const [count, setCount] = useState(reduceMotion ? TOKENS.length : 0);
  const [phase, setPhase] = useState<"writing" | "hold" | "reset">("writing");
  /** Left card: whole dump flash */
  const [dumped, setDumped] = useState(reduceMotion);

  useEffect(() => {
    if (reduceMotion) {
      setCount(TOKENS.length);
      setDumped(true);
      return;
    }

    // Left: re-dump the whole paragraph on a slower cycle (all-at-once)
    let dumpOn = true;
    setDumped(true);
    const dumpTimer = window.setInterval(() => {
      dumpOn = !dumpOn;
      setDumped(dumpOn);
    }, 3200);

    // Right: one token per beat
    let i = 0;
    setCount(0);
    setPhase("writing");
    const stepTimer = window.setInterval(() => {
      i += 1;
      if (i <= TOKENS.length) {
        setCount(i);
        setPhase("writing");
      } else if (i === TOKENS.length + 1) {
        setPhase("hold");
      } else {
        i = 0;
        setCount(0);
        setPhase("reset");
      }
    }, 550);

    return () => {
      window.clearInterval(dumpTimer);
      window.clearInterval(stepTimer);
    };
  }, [reduceMotion]);

  const nextLabel =
    count === 0
      ? "next: Soft"
      : count < TOKENS.length
        ? `next: ${TOKENS[count]}`
        : "done · restarting…";

  return (
    <figure
      className={styles.figure}
      aria-label="Two mental models of how a reply is written"
    >
      <div className={styles.grid}>
        <div className={styles.card}>
          <p className={styles.label}>Common mental model</p>
          <div className={styles.stage}>
            <div className={styles.wrongFlow} aria-hidden="true">
              <span className={styles.think}>think</span>
              <span className={styles.arrow}>→</span>
              <span className={styles.dumpTag}>dump all at once</span>
            </div>
            <div
              className={`${styles.paragraphBlock} ${dumped ? styles.paragraphIn : styles.paragraphOut}`}
            >
              {FULL_TEXT}
            </div>
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
