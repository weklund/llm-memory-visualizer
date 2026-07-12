import { BandwidthRibbon, BatchQueue, GpuNode, SceneRig } from "@/components/primitives";
import { selectMetrics, useSimulationStore } from "@/state/simulationStore";

/** Lesson 4 — prefill vs decode bottlenecks on a GPU node. */
export function PrefillDecodeScene() {
  const params = useSimulationStore((s) => s.params);
  const metrics = selectMetrics(params);
  const phase = params.phase;

  const computeLoad = phase === "prefill" ? 0.95 : phase === "mixed" ? 0.7 : 0.35;
  const memoryLoad = phase === "decode" ? 0.95 : phase === "mixed" ? 0.75 : 0.4;

  return (
    <SceneRig>
      <GpuNode
        position={[0, 0, 0]}
        computeLoad={computeLoad}
        memoryLoad={memoryLoad}
        label="serving GPU"
        phaseLabel={
          phase === "prefill"
            ? "prefill · compute-heavy"
            : phase === "decode"
              ? "decode · memory-heavy"
              : "mixed batch"
        }
      />
      <group position={[0, 0.2, 0]}>
        <BandwidthRibbon intensity={memoryLoad} />
      </group>
      <BatchQueue
        count={Math.min(8, Math.max(2, params.batchSize))}
        position={[0, -1.1, 0.2]}
        activeIndex={Math.floor(params.generateProgress * Math.min(8, params.batchSize))}
        label={
          metrics.phase === "decode"
            ? "iteration batch (decode slots)"
            : "batch under construction"
        }
      />
    </SceneRig>
  );
}
