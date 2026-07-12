import { useExplorationStore } from "@/state/explorationStore";
import styles from "./ModeToggle.module.css";

type ModeToggleProps = {
  /** Whether this lesson has guided steps */
  hasGuidedSteps: boolean;
};

export function ModeToggle({ hasGuidedSteps }: ModeToggleProps) {
  const mode = useExplorationStore((s) => s.mode);
  const setMode = useExplorationStore((s) => s.setMode);

  return (
    <div className={styles.wrap} role="group" aria-label="Exploration mode">
      <span className={styles.label}>Mode</span>
      <div className={styles.seg}>
        <ModeButton
          active={mode === "guided"}
          disabled={!hasGuidedSteps}
          onClick={() => setMode("guided")}
          title={
            hasGuidedSteps
              ? "Step through a fixed teaching sequence"
              : "No guided steps for this lesson"
          }
        >
          Guided
        </ModeButton>
        <ModeButton
          active={mode === "free"}
          onClick={() => setMode("free")}
          title="Full controls; stress-test parameters"
        >
          Free explore
        </ModeButton>
      </div>
      <p className={styles.hint}>
        {mode === "guided"
          ? "One concept per step · knobs follow the tour"
          : "Full sliders · unusual combos are labeled"}
        <span className={styles.persist}> · saved in this browser</span>
      </p>
    </div>
  );
}

function ModeButton({
  active,
  disabled,
  onClick,
  title,
  children,
}: {
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
  title: string;
  children: string;
}) {
  return (
    <button
      type="button"
      className={active ? `${styles.btn} ${styles.btnActive}` : styles.btn}
      aria-pressed={active}
      disabled={disabled}
      title={title}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
