import { useMemo } from "react";
import { Text } from "@react-three/drei";
import { PageTable, SceneRig } from "@/components/primitives";
import { budgetFor, detectDeviceClass } from "@/lib/geometryBudget";
import { simColors } from "@/lib/simColors";
import { buildContiguousLayout, buildPagedLayout } from "@/lib/paging";
import { useSimulationStore } from "@/state/simulationStore";
import { CachePage } from "@/components/primitives/CachePage";

/** Lesson 5 — naive contiguous slab vs paged pool with holes. */
export function PackingMemoryScene() {
  const params = useSimulationStore((s) => s.params);
  const pageCap = budgetFor(detectDeviceClass()).pages * params.blockSize;

  const displayS = useMemo(() => {
    return Math.min(
      pageCap,
      Math.max(
        params.blockSize,
        Math.round(params.sequenceLength / 64) * params.blockSize,
      ),
    );
  }, [params.sequenceLength, params.blockSize, pageCap]);

  const paged = useMemo(
    () => buildPagedLayout(displayS, params.blockSize, { holeEvery: 3 }),
    [displayS, params.blockSize],
  );

  const contiguous = useMemo(
    () => buildContiguousLayout(displayS, params.blockSize),
    [displayS, params.blockSize],
  );

  const slabWidth = Math.min(3.2, 0.55 * contiguous.logicalBlocks + 0.8);

  return (
    <SceneRig gridY={-1.85}>
      <group position={[0, 1.15, 0]}>
        <Text fontSize={0.16} color={simColors.muted} anchorX="center">
          left: one reserved slab · right: paged pool
        </Text>
      </group>

      <group position={[-2.3, 0.15, 0]}>
        <Text
          position={[0, 0.85, 0]}
          fontSize={0.14}
          color={simColors.waste}
          anchorX="center"
        >
          contiguous reservation
        </Text>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[slabWidth, 0.35, 0.7]} />
          <meshStandardMaterial
            color={simColors.hbm}
            transparent
            opacity={0.35}
            wireframe
          />
        </mesh>
        <mesh position={[0, 0, 0]}>
          <boxGeometry
            args={[
              slabWidth *
                (displayS / Math.max(1, contiguous.logicalBlocks * params.blockSize)),
              0.22,
              0.5,
            ]}
          />
          <meshStandardMaterial color={simColors.key} opacity={0.85} transparent />
        </mesh>
        <Text
          position={[0, -0.55, 0]}
          fontSize={0.11}
          color={simColors.muted}
          anchorX="center"
        >
          used + internal empty tail
        </Text>
      </group>

      <group position={[1.6, 0.1, 0]} scale={[0.85, 0.85, 0.85]}>
        <PageTable layout={paged} position={[0, 0, 0]} gap={0.95} />
      </group>

      {/* Tiny legend page */}
      <group position={[-2.3, -1.2, 0]}>
        <CachePage fill={0.7} label="page" width={0.7} />
      </group>
    </SceneRig>
  );
}
