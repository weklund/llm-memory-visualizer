import styles from "./MentalModelContrast.module.css";

/** V0 — static wrong model vs next-token model. */
export function MentalModelContrast() {
  return (
    <figure
      className={styles.figure}
      aria-label="Two mental models of how a reply is written"
    >
      <div className={styles.grid}>
        <div className={styles.card}>
          <p className={styles.label}>Common mental model</p>
          <div className={styles.wrong}>
            <span className={styles.cloud} aria-hidden="true">
              💭
            </span>
            <span className={styles.arrow} aria-hidden="true">
              →
            </span>
            <p className={styles.paragraph}>
              Soft rain falls on quiet streets— night breathes again.
            </p>
          </div>
          <p className={styles.caption}>
            “Think of the whole answer, then dump a paragraph.”
          </p>
        </div>
        <div className={`${styles.card} ${styles.cardRight}`}>
          <p className={styles.label}>What actually happens</p>
          <div className={styles.right}>
            <p className={styles.line}>
              Soft rain
              <span className={styles.cursor} aria-hidden="true" />
            </p>
          </div>
          <p className={styles.caption}>
            “What is a good next small piece?” — again and again.
          </p>
        </div>
      </div>
    </figure>
  );
}
