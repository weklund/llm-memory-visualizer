import { useMemo } from "react";
import { Text, Line } from "@react-three/drei";
import { PageTable, SceneRig, TokenStream } from "@/components/primitives";
import { simColors } from "@/lib/simColors";
import { buildPagedLayout } from "@/lib/paging";
import { useSimulationStore } from "@/state/simulationStore";

/** Lesson 6 — radix-style trunk + branches + shared pages. */
export function ReusingWorkScene() {
  const params = useSimulationStore((s) => s.params);
  const isolated = params.cacheIsolation;
  const sharedBlocks = isolated
    ? 0
    : Math.max(1, Math.floor(params.sharedPrefixTokens / Math.max(1, params.blockSize)));

  const layout = useMemo(() => {
    const displayS = Math.min(80, Math.max(48, params.blockSize * 5));
    return buildPagedLayout(displayS, params.blockSize, {
      holeEvery: 99,
      sharedPrefixBlocks: Math.min(3, sharedBlocks || (isolated ? 0 : 2)),
    });
  }, [params.blockSize, sharedBlocks, isolated]);

  return (
    <SceneRig gridY={-1.85}>
      <Text
        position={[0, 2.15, 0]}
        fontSize={0.17}
        color={simColors.hit}
        anchorX="center"
      >
        {isolated
          ? "isolated pools · no cross-tenant trunk"
          : "radix trunk → private branches"}
      </Text>

      {/* Schematic radix: root, trunk, two leaves */}
      <group position={[0, 1.35, 0]}>
        <mesh position={[0, 0.35, 0]}>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial
            color={simColors.sram}
            emissive="#4c1d95"
            emissiveIntensity={0.4}
          />
        </mesh>
        <Text position={[0, 0.6, 0]} fontSize={0.11} color={simColors.muted}>
          root
        </Text>
        <Line
          points={[
            [0, 0.25, 0],
            [0, -0.05, 0],
          ]}
          color={isolated ? simColors.miss : simColors.hit}
          lineWidth={2}
        />
        <Line
          points={[
            [0, -0.05, 0],
            [-1.2, -0.45, 0],
          ]}
          color={simColors.token}
          lineWidth={2}
        />
        <Line
          points={[
            [0, -0.05, 0],
            [1.2, -0.45, 0],
          ]}
          color={simColors.token}
          lineWidth={2}
        />
        <Text position={[-1.2, -0.65, 0]} fontSize={0.12} color={simColors.muted}>
          user A
        </Text>
        <Text position={[1.2, -0.65, 0]} fontSize={0.12} color={simColors.muted}>
          user B
        </Text>
        <TokenStream
          count={8}
          progress={0.85}
          position={[-1.2, -0.35, 0]}
          gap={0.22}
          showLabels={false}
        />
        <TokenStream
          count={8}
          progress={params.generateProgress}
          position={[1.2, -0.35, 0]}
          gap={0.22}
          showLabels={false}
        />
      </group>

      <group position={[0, -0.55, 0]} scale={[0.9, 0.9, 0.9]}>
        <PageTable layout={layout} position={[0, 0, 0]} gap={0.92} />
      </group>
    </SceneRig>
  );
}
