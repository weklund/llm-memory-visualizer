import {
  formatBytes,
  internalFragmentationTokens,
  logicalBlocksForSequence,
} from "@/lib/kvMemory";
import { selectKvMetrics, useSimulationStore } from "@/state/simulationStore";
import styles from "./MetricPanel.module.css";

export function MetricPanel() {
  const params = useSimulationStore((s) => s.params);
  const kv = selectKvMetrics(params);
  const blocks = logicalBlocksForSequence(params.sequenceLength, params.blockSize);
  const frag = internalFragmentationTokens(params.sequenceLength, params.blockSize);

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
          <span className={styles.value}>{formatBytes(kv.bytes)}</span>
          <span className={styles.sub}>
            {kv.mebibytes.toFixed(2)} MiB · {kv.elements.toLocaleString()} elements
          </span>
        </li>
        <li className={styles.item}>
          <span className={styles.label}>
            <span
              className={styles.swatch}
              style={{ background: "var(--color-page)" }}
              aria-hidden="true"
            />
            Logical blocks
          </span>
          <span className={styles.value}>{blocks}</span>
          <span className={styles.sub}>P = {params.blockSize} tokens · ceil(S / P)</span>
        </li>
        <li className={styles.item}>
          <span className={styles.label}>
            <span
              className={styles.swatch}
              style={{ background: "var(--color-fragment-waste)" }}
              aria-hidden="true"
            />
            Internal waste (tokens)
          </span>
          <span className={styles.value}>{frag}</span>
          <span className={styles.sub}>Unused slots in last block</span>
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
