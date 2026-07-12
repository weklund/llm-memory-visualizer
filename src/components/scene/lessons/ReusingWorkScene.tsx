import { useMemo } from "react";
import { Text } from "@react-three/drei";
import { PageTable, SceneRig, TokenStream } from "@/components/primitives";
import { simColors } from "@/lib/simColors";
import { buildPagedLayout } from "@/lib/paging";
import { useSimulationStore } from "@/state/simulationStore";

/** Lesson 6 — shared prefix pages + two logical sequences. */
export function ReusingWorkScene() {
  const params = useSimulationStore((s) => s.params);
  const sharedBlocks = Math.max(
    1,
    Math.floor(params.sharedPrefixTokens / Math.max(1, params.blockSize)),
  );

  const layout = useMemo(() => {
    const displayS = Math.min(80, Math.max(48, params.blockSize * 5));
    return buildPagedLayout(displayS, params.blockSize, {
      holeEvery: 99,
      sharedPrefixBlocks: Math.min(3, sharedBlocks || 2),
    });
  }, [params.blockSize, sharedBlocks]);

  return (
    <SceneRig gridY={-1.7}>
      <Text position={[0, 2.0, 0]} fontSize={0.18} color={simColors.hit}>
        shared prefix trunk
      </Text>
      <TokenStream
        count={12}
        progress={0.7}
        position={[0, 1.55, 0]}
        gap={0.3}
        showLabels={false}
      />
      <PageTable layout={layout} position={[0, 0, 0]} gap={0.95} />
    </SceneRig>
  );
}
