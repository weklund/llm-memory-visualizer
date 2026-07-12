import { useSimulationStore, type SimulationParams } from "@/state/simulationStore";
import styles from "./ControlPanel.module.css";

type SliderSpec = {
  key: keyof SimulationParams;
  label: string;
  min: number;
  max: number;
  step: number;
};

const sliders: SliderSpec[] = [
  { key: "sequenceLength", label: "Sequence length S", min: 128, max: 8192, step: 128 },
  { key: "batchSize", label: "Batch size B", min: 1, max: 32, step: 1 },
  { key: "layers", label: "Layers L", min: 1, max: 80, step: 1 },
  { key: "kvHeads", label: "KV heads H_kv", min: 1, max: 64, step: 1 },
  { key: "headDim", label: "Head dim d_h", min: 32, max: 256, step: 16 },
  {
    key: "bytesPerElement",
    label: "Bytes / element (bpe)",
    min: 0.25,
    max: 4,
    step: 0.25,
  },
  { key: "blockSize", label: "Block size P", min: 8, max: 64, step: 8 },
];

export function ControlPanel() {
  const params = useSimulationStore((s) => s.params);
  const setParam = useSimulationStore((s) => s.setParam);
  const reset = useSimulationStore((s) => s.reset);

  return (
    <section className={styles.panel} aria-labelledby="controls-heading">
      <div className={styles.heading}>
        <h2 id="controls-heading">Controls</h2>
        <button type="button" className={styles.reset} onClick={reset}>
          Reset
        </button>
      </div>
      {sliders.map((spec) => {
        const value = params[spec.key];
        return (
          <div className={styles.field} key={spec.key}>
            <label htmlFor={spec.key}>
              <span>{spec.label}</span>
              <strong>{formatParam(value)}</strong>
            </label>
            <input
              id={spec.key}
              type="range"
              min={spec.min}
              max={spec.max}
              step={spec.step}
              value={value}
              onChange={(e) => setParam(spec.key, Number(e.target.value))}
            />
          </div>
        );
      })}
      <p className={styles.hint}>
        Assumptions mirror <code>docs/glossary.md</code>. Sharing and quant metadata are
        off unless a module enables them.
      </p>
    </section>
  );
}

function formatParam(value: number): string {
  if (Number.isInteger(value)) return String(value);
  return value.toFixed(2).replace(/\.?0+$/, "");
}
