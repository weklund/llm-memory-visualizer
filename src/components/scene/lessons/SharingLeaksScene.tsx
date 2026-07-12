import { Text } from "@react-three/drei";
import { GpuNode, SceneRig, TokenStream } from "@/components/primitives";
import { simColors } from "@/lib/simColors";
import { useSimulationStore } from "@/state/simulationStore";

/** Lesson 9 — two tenants, shared prefix, timing side-channel metaphor. */
export function SharingLeaksScene() {
  const progress = useSimulationStore((s) => s.params.generateProgress);

  return (
    <SceneRig>
      <Text position={[0, 2.1, 0]} fontSize={0.17} color={simColors.miss}>
        shared prefix · observable latency gap
      </Text>
      <group position={[-1.8, 0.6, 0]}>
        <Text position={[0, 0.7, 0]} fontSize={0.14} color={simColors.muted}>
          tenant A
        </Text>
        <TokenStream count={8} progress={0.9} showLabels={false} gap={0.28} />
      </group>
      <group position={[1.8, 0.6, 0]}>
        <Text position={[0, 0.7, 0]} fontSize={0.14} color={simColors.muted}>
          tenant B (probe)
        </Text>
        <TokenStream count={8} progress={progress} showLabels={false} gap={0.28} />
      </group>
      <GpuNode
        position={[0, -0.7, 0]}
        computeLoad={0.4}
        memoryLoad={0.7}
        label="shared cache pool"
        phaseLabel="hit ⇒ faster TTFT"
      />
      <Text position={[0, -1.55, 0]} fontSize={0.13} color={simColors.page}>
        teaching threat model — not an exploit guide
      </Text>
    </SceneRig>
  );
}
