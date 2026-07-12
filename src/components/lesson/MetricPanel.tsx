import { estimateWeightBytes, formatBytes } from "@/lib/kvMemory";
import { modelPresets } from "@/lib/modelPresets";
import { selectMetrics, useSimulationStore } from "@/state/simulationStore";
import styles from "./MetricPanel.module.css";

export function MetricPanel() {
  const params = useSimulationStore((s) => s.params);
  const m = selectMetrics(params);
  const preset = modelPresets[params.presetId];
  const weightBytes = estimateWeightBytes(
    preset.params.approximateParams,
    params.bytesPerElement,
  );
  const kvVsWeights = weightBytes > 0 ? m.kvLogical.bytes / weightBytes : 0;

  return (
    <section className={styles.panel} aria-labelledby="metrics-heading">
      <h2 id="metrics-heading" className={styles.heading}>
        Metrics
      </h2>
      <ul className={styles.list}>
        <li className={styles.item}>
          <span className={styles.label}>
            <span
              className={styles.swatch}
              style={{ background: "var(--color-hbm)" }}
              aria-hidden="true"
            />
            KV cache (logical)
          </span>
          <span className={styles.value}>{formatBytes(m.kvLogical.bytes)}</span>
          <span className={styles.sub}>
            {m.kvLogical.mebibytes.toFixed(2)} MiB
            {m.isOom ? " · over HBM budget" : ""}
          </span>
        </li>
        <li className={styles.item}>
          <span className={styles.label}>
            <span
              className={styles.swatch}
              style={{ background: "var(--color-text-subtle)" }}
              aria-hidden="true"
            />
            Weights (rough) vs KV
          </span>
          <span className={styles.value}>{formatBytes(weightBytes)}</span>
          <span className={styles.sub}>
            KV is {(kvVsWeights * 100).toFixed(1)}% of weight estimate · {preset.label}
          </span>
        </li>
        <li className={styles.item}>
          <span className={styles.label}>
            <span
              className={styles.swatch}
              style={{ background: "var(--color-page)" }}
              aria-hidden="true"
            />
            Pages / waste
          </span>
          <span className={styles.value}>
            {m.logicalBlocks} blocks · {m.internalWasteTokens} tok waste
          </span>
          <span className={styles.sub}>
            P={params.blockSize} · holes {m.paging.freeHoles}
          </span>
        </li>
        <li className={styles.item}>
          <span className={styles.label}>
            <span
              className={styles.swatch}
              style={{ background: "var(--color-bandwidth)" }}
              aria-hidden="true"
            />
            Phase pressure
          </span>
          <span className={styles.value}>{params.phase}</span>
          <span className={styles.sub}>
            prefill intensity {m.prefillIntensityProxy.toExponential(2)} · decode{" "}
            {m.decodeIntensityProxy.toExponential(2)} (proxy FLOPs/byte)
          </span>
        </li>
        <li className={styles.item}>
          <span className={styles.label}>
            <span
              className={styles.swatch}
              style={{ background: "var(--color-value)" }}
              aria-hidden="true"
            />
            Compression / share
          </span>
          <span className={styles.value}>
            {m.compressionRatio.toFixed(2)}× · prefix {m.sharedPrefixTokens}
          </span>
          <span className={styles.sub}>
            quant payload {formatBytes(m.kvQuantizedBytes)} · unique{" "}
            {m.uniqueSequenceTokens} tok
          </span>
        </li>
      </ul>
      <p className={styles.formula}>
        M_KV = 2 · B · L · H_kv · S · d_h · bpe
        <br />= 2 · {params.batchSize} · {params.layers} · {params.kvHeads} ·{" "}
        {params.sequenceLength} · {params.headDim} · {params.bytesPerElement}
      </p>
    </section>
  );
}
