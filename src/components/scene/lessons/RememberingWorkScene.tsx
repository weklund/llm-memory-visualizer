import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import { MemoryGrid, SceneRig } from "@/components/primitives";
import { usePrefersReducedMotion } from "@/lib/prefersReducedMotion";
import { displayLayers, displayTokens } from "@/lib/simulationMetrics";
import { selectMetrics, useSimulationStore } from "@/state/simulationStore";

/** Lesson 3 — KV memory grid growth + OOM. */
export function RememberingWorkScene() {
  const params = useSimulationStore((s) => s.params);
  const metrics = selectMetrics(params);
  const group = useRef<Group>(null);
  const reduceMotion = usePrefersReducedMotion();

  const tokens = displayTokens(params.sequenceLength, 18);
  const layers = displayLayers(params.layers, 6);
  const batch = Math.min(4, Math.max(1, params.batchSize));
  const fill = Math.min(1, 0.15 + params.sequenceLength / 8192);

  useFrame((_, dt) => {
    if (reduceMotion || !group.current) return;
    group.current.rotation.y += dt * 0.06;
  });

  return (
    <SceneRig>
      <group ref={group} position={[0, -0.4, 0]}>
        <MemoryGrid
          tokens={tokens}
          layers={layers}
          batch={batch}
          fill={fill}
          oom={metrics.isOom}
        />
      </group>
    </SceneRig>
  );
}
