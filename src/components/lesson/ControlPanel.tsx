import { modelPresets, type ModelPresetId } from "@/lib/modelPresets";
import type { EvictionPolicy } from "@/lib/eviction";
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
  {
    key: "quantBytesPerElement",
    label: "Quant payload bpe",
    min: 0.25,
    max: 4,
    step: 0.25,
  },
  { key: "blockSize", label: "Block size P", min: 8, max: 64, step: 8 },
  {
    key: "sharedPrefixTokens",
    label: "Shared prefix tokens",
    min: 0,
    max: 2048,
    step: 16,
  },
  {
    key: "evictionBudget",
    label: "Eviction budget (tokens kept)",
    min: 4,
    max: 32,
    step: 1,
  },
  {
    key: "generateProgress",
    label: "Generation progress",
    min: 0,
    max: 1,
    step: 0.01,
  },
];

export function ControlPanel() {
  const params = useSimulationStore((s) => s.params);
  const setParam = useSimulationStore((s) => s.setParam);
  const applyPreset = useSimulationStore((s) => s.applyPreset);
  const reset = useSimulationStore((s) => s.reset);

  return (
    <section className={styles.panel} aria-labelledby="controls-heading">
      <div className={styles.heading}>
        <h2 id="controls-heading">Controls</h2>
        <button type="button" className={styles.reset} onClick={reset}>
          Reset
        </button>
      </div>

      <div className={styles.field}>
        <label htmlFor="preset">
          <span>Model preset</span>
          <strong>{modelPresets[params.presetId].label}</strong>
        </label>
        <select
          id="preset"
          value={params.presetId}
          onChange={(e) => applyPreset(e.target.value as ModelPresetId)}
          className={styles.select}
        >
          {(Object.keys(modelPresets) as ModelPresetId[]).map((id) => (
            <option key={id} value={id}>
              {modelPresets[id].label}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.field}>
        <label htmlFor="phase">
          <span>Phase</span>
          <strong>{params.phase}</strong>
        </label>
        <select
          id="phase"
          value={params.phase}
          onChange={(e) => setParam("phase", e.target.value as SimulationParams["phase"])}
          className={styles.select}
        >
          <option value="prefill">prefill</option>
          <option value="decode">decode</option>
          <option value="mixed">mixed (chunked hybrid)</option>
        </select>
      </div>

      <div className={styles.field}>
        <label htmlFor="evictionPolicy">
          <span>Eviction policy</span>
          <strong>{params.evictionPolicy}</strong>
        </label>
        <select
          id="evictionPolicy"
          value={params.evictionPolicy}
          onChange={(e) => setParam("evictionPolicy", e.target.value as EvictionPolicy)}
          className={styles.select}
        >
          <option value="none">none (keep all)</option>
          <option value="window">window (recent only)</option>
          <option value="sinks">sinks + window</option>
          <option value="heavy">heavy hitters + window</option>
          <option value="h2o">h2o-style mix</option>
        </select>
      </div>

      <div className={styles.field}>
        <label htmlFor="cacheIsolation">
          <span>Cache isolation</span>
          <strong>{params.cacheIsolation ? "on (per tenant)" : "off (shared)"}</strong>
        </label>
        <select
          id="cacheIsolation"
          value={params.cacheIsolation ? "on" : "off"}
          onChange={(e) => setParam("cacheIsolation", e.target.value === "on")}
          className={styles.select}
        >
          <option value="off">shared pool (efficient, riskier)</option>
          <option value="on">isolated (safer, less reuse)</option>
        </select>
      </div>

      {sliders.map((spec) => {
        const value = params[spec.key];
        if (typeof value !== "number") return null;
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
        Metrics follow <code>docs/glossary.md</code>. Sharing / quant / eviction are
        teaching models, not production counters.
      </p>
    </section>
  );
}

function formatParam(value: number): string {
  if (Number.isInteger(value)) return String(value);
  return value.toFixed(2).replace(/\.?0+$/, "");
}
