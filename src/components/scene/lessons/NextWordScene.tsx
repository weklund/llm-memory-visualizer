import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import { SceneRig, TokenStream } from "@/components/primitives";
import { displayTokens } from "@/lib/simulationMetrics";
import { useSimulationStore } from "@/state/simulationStore";

/** Lesson 1 — autoregressive token stream grows over time. */
export function NextWordScene() {
  const params = useSimulationStore((s) => s.params);
  const group = useRef<Group>(null);
  const count = displayTokens(Math.max(8, Math.round(params.sequenceLength / 32)), 20);
  const progress = params.generateProgress;

  useFrame((_, dt) => {
    if (group.current) group.current.rotation.y += dt * 0.05;
  });

  return (
    <SceneRig>
      <group ref={group}>
        <TokenStream count={count} progress={progress} position={[0, 0.2, 0]} />
      </group>
    </SceneRig>
  );
}
