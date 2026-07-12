import { useSimulationStore } from "@/state/simulationStore";
import styles from "./ControlPanel.module.css";

/** Lightweight knobs for lessons 1–2 (no full memory lab). */
export function FoundationControls() {
  const progress = useSimulationStore((s) => s.params.generateProgress);
  const sequenceLength = useSimulationStore((s) => s.params.sequenceLength);
  const setParam = useSimulationStore((s) => s.setParam);

  return (
    <section className={styles.panel} aria-labelledby="foundation-controls">
      <div className={styles.heading}>
        <h2 id="foundation-controls">Explore</h2>
      </div>
      <div className={styles.field}>
        <label htmlFor="generateProgress">
          <span>Generation progress</span>
          <strong>{Math.round(progress * 100)}%</strong>
        </label>
        <input
          id="generateProgress"
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={progress}
          onChange={(e) => setParam("generateProgress", Number(e.target.value))}
        />
      </div>
      <div className={styles.field}>
        <label htmlFor="sequenceLength-foundation">
          <span>How long is the past? (S)</span>
          <strong>{sequenceLength}</strong>
        </label>
        <input
          id="sequenceLength-foundation"
          type="range"
          min={64}
          max={2048}
          step={64}
          value={Math.min(2048, sequenceLength)}
          onChange={(e) => setParam("sequenceLength", Number(e.target.value))}
        />
      </div>
      <p className={styles.hint}>
        These knobs only change the story in the scene. Full size formulas unlock in
        lesson 3.
      </p>
    </section>
  );
}
