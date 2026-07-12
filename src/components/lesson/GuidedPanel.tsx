import { useEffect } from "react";
import { getGuidedSteps, guidedBaseParams } from "@/content/guidedSteps";
import { useExplorationStore } from "@/state/explorationStore";
import { useSimulationStore, type SimulationParams } from "@/state/simulationStore";
import styles from "./GuidedPanel.module.css";

type GuidedPanelProps = {
  slug: string;
};

export function GuidedPanel({ slug }: GuidedPanelProps) {
  const steps = getGuidedSteps(slug);
  const mode = useExplorationStore((s) => s.mode);
  const stepIndex = useExplorationStore((s) => s.stepIndex(slug));
  const nextStep = useExplorationStore((s) => s.nextStep);
  const prevStep = useExplorationStore((s) => s.prevStep);
  const setStep = useExplorationStore((s) => s.setStep);
  const setParam = useSimulationStore((s) => s.setParam);

  const step = steps[stepIndex];

  useEffect(() => {
    if (mode !== "guided" || !step) return;
    const overlay: Partial<SimulationParams> = {
      ...guidedBaseParams,
      ...step.params,
    };
    for (const key of Object.keys(overlay) as (keyof SimulationParams)[]) {
      const value = overlay[key];
      if (value !== undefined) {
        setParam(key, value);
      }
    }
  }, [mode, stepIndex, slug, step, setParam]);

  if (mode !== "guided" || steps.length === 0 || !step) return null;

  return (
    <section className={styles.panel} aria-labelledby="guided-heading">
      <div className={styles.top}>
        <h2 id="guided-heading" className={styles.heading}>
          Guided tour
        </h2>
        <span className={styles.counter}>
          Step {stepIndex + 1} / {steps.length}
        </span>
      </div>
      <p className={styles.stepTitle}>{step.title}</p>
      <p className={styles.focus}>{step.focus}</p>
      <div className={styles.actions}>
        <button
          type="button"
          className={styles.btn}
          onClick={() => prevStep(slug)}
          disabled={stepIndex <= 0}
        >
          Previous step
        </button>
        <button
          type="button"
          className={`${styles.btn} ${styles.btnPrimary}`}
          onClick={() => nextStep(slug)}
          disabled={stepIndex >= steps.length - 1}
        >
          Next step
        </button>
      </div>
      <ol className={styles.dots} aria-label="Tour steps">
        {steps.map((s, i) => (
          <li key={s.id}>
            <button
              type="button"
              className={
                i === stepIndex ? `${styles.dot} ${styles.dotActive}` : styles.dot
              }
              aria-label={`${s.title}${i === stepIndex ? " (current)" : ""}`}
              aria-current={i === stepIndex ? "step" : undefined}
              onClick={() => setStep(slug, i)}
            />
          </li>
        ))}
      </ol>
    </section>
  );
}
