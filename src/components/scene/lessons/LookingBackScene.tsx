import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import { AttentionSurface, SceneRig, TokenStream } from "@/components/primitives";
import { buildDemoAttentionMatrix, downsampleAttention } from "@/lib/attentionDemo";
import { usePrefersReducedMotion } from "@/lib/prefersReducedMotion";
import { useSimulationStore } from "@/state/simulationStore";

/** Lesson 2 — attention surface with sinks + recency. */
export function LookingBackScene() {
  const progress = useSimulationStore((s) => s.params.generateProgress);
  const group = useRef<Group>(null);
  const reduceMotion = usePrefersReducedMotion();

  const matrix = useMemo(() => {
    const n = 10;
    return downsampleAttention(
      buildDemoAttentionMatrix({
        rows: n,
        cols: n,
        sinkCount: 2,
        heavyHitterCount: 2,
        causal: true,
      }),
      12,
    );
  }, []);

  useFrame((_, dt) => {
    if (reduceMotion || !group.current) return;
    group.current.rotation.y += dt * 0.04;
  });

  return (
    <SceneRig>
      <group ref={group}>
        <TokenStream
          count={10}
          progress={progress}
          position={[0, 1.5, 0]}
          showLabels={false}
          gap={0.32}
        />
        <AttentionSurface matrix={matrix} position={[0, -0.2, 0]} />
      </group>
    </SceneRig>
  );
}
