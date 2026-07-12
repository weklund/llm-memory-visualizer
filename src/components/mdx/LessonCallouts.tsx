import type { ReactNode } from "react";
import styles from "./LessonCallouts.module.css";

type CalloutProps = {
  children?: ReactNode;
};

export function Formula({ children }: CalloutProps) {
  return (
    <div className={styles.formula} role="figure" aria-label="Formula">
      <div className={styles.formulaLabel}>Formula</div>
      <pre className={styles.formulaBody}>{children}</pre>
    </div>
  );
}

export function Assumptions({ children }: CalloutProps) {
  return (
    <aside className={styles.assumptions} aria-label="Assumptions">
      <div className={styles.assumptionsLabel}>Assumptions & simplifications</div>
      <div className={styles.assumptionsBody}>{children}</div>
    </aside>
  );
}

export function Sources({ children }: CalloutProps) {
  return (
    <section className={styles.sources} aria-label="Sources and further reading">
      <h3 className={styles.sourcesTitle}>Sources & further reading</h3>
      <div className={styles.sourcesBody}>{children}</div>
    </section>
  );
}

export function TryThis({ children }: CalloutProps) {
  return (
    <div className={styles.tryThis}>
      <div className={styles.tryThisLabel}>Try this in the lab</div>
      <div>{children}</div>
    </div>
  );
}

export function Checkpoint({ children }: CalloutProps) {
  return (
    <div className={styles.checkpoint}>
      <div className={styles.checkpointLabel}>Check your understanding</div>
      <div>{children}</div>
    </div>
  );
}
