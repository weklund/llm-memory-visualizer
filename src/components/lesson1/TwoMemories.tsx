import styles from "./TwoMemories.module.css";

/** V3 — product context vs engine memory (door to later lessons). */
export function TwoMemories() {
  return (
    <figure className={styles.figure} aria-label="Two meanings of memory">
      <div className={styles.grid}>
        <div className={styles.card}>
          <h3 className={styles.title}>Product “memory”</h3>
          <p>
            The <strong>text</strong> of the conversation still in the context window—what
            you can scroll and read.
          </p>
          <p className={styles.note}>This lesson only needed this side.</p>
        </div>
        <div className={`${styles.card} ${styles.cardEngine}`}>
          <h3 className={styles.title}>Engine “memory”</h3>
          <p>
            Structures a serving system stores on the GPU so it does not{" "}
            <strong>recompute</strong> looking-back work every step.
          </p>
          <p className={styles.note}>
            Later lessons—starting with how the model looks back.
          </p>
        </div>
      </div>
      <figcaption className={styles.caption}>
        This course is mostly about the right-hand column—but only after the left-hand{" "}
        <em>loop</em> is obvious.
      </figcaption>
    </figure>
  );
}
