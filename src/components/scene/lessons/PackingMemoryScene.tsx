import { useMemo } from "react";
import { PageTable, SceneRig } from "@/components/primitives";
import { buildPagedLayout } from "@/lib/paging";
import { useSimulationStore } from "@/state/simulationStore";

/** Lesson 5 — paged physical pool + block table. */
export function PackingMemoryScene() {
  const params = useSimulationStore((s) => s.params);

  const layout = useMemo(() => {
    // Keep page count readable in the viewport
    const displayS = Math.min(
      96,
      Math.max(
        params.blockSize,
        Math.round(params.sequenceLength / 64) * params.blockSize,
      ),
    );
    return buildPagedLayout(displayS, params.blockSize, { holeEvery: 3 });
  }, [params.sequenceLength, params.blockSize]);

  return (
    <SceneRig gridY={-1.6}>
      <PageTable layout={layout} position={[0, 0.2, 0]} gap={1.0} />
    </SceneRig>
  );
}
