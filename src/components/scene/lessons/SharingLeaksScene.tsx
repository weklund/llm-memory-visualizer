import { Text } from "@react-three/drei";
import { GpuNode, SceneRig, TokenStream } from "@/components/primitives";
import { simColors } from "@/lib/simColors";
import { useSimulationStore } from "@/state/simulationStore";

/** Lesson 9 — shared vs isolated pools; threat-model framing only. */
export function SharingLeaksScene() {
  const params = useSimulationStore((s) => s.params);
  const isolated = params.cacheIsolation;

  return (
    <SceneRig>
      <Text
        position={[0, 2.15, 0]}
        fontSize={0.16}
        color={isolated ? simColors.hit : simColors.miss}
      >
        {isolated
          ? "isolated caches · reduced cross-tenant signals"
          : "shared prefix pool · timing side-channel risk"}
      </Text>
      <group position={[-1.9, 0.55, 0]}>
        <Text position={[0, 0.75, 0]} fontSize={0.14} color={simColors.muted}>
          tenant A
        </Text>
        <TokenStream count={8} progress={0.9} showLabels={false} gap={0.28} />
        {isolated ? (
          <GpuNode
            position={[0, -1.15, 0]}
            computeLoad={0.35}
            memoryLoad={0.55}
            label="A pool"
            phaseLabel="private"
          />
        ) : null}
      </group>
      <group position={[1.9, 0.55, 0]}>
        <Text position={[0, 0.75, 0]} fontSize={0.14} color={simColors.muted}>
          tenant B (probe)
        </Text>
        <TokenStream
          count={8}
          progress={params.generateProgress}
          showLabels={false}
          gap={0.28}
        />
        {isolated ? (
          <GpuNode
            position={[0, -1.15, 0]}
            computeLoad={0.35}
            memoryLoad={0.45}
            label="B pool"
            phaseLabel="private"
          />
        ) : null}
      </group>
      {!isolated ? (
        <GpuNode
          position={[0, -0.75, 0]}
          computeLoad={0.4}
          memoryLoad={0.75}
          label="shared cache pool"
          phaseLabel="hit ⇒ faster TTFT (concept)"
        />
      ) : null}
      <Text
        position={[0, -1.7, 0]}
        fontSize={0.12}
        color={simColors.page}
        anchorX="center"
      >
        teaching threat model — not an exploit guide · not production timings
      </Text>
    </SceneRig>
  );
}
