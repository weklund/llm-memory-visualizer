import { Text } from "@react-three/drei";
import { MemoryGrid, SceneRig } from "@/components/primitives";
import { simColors } from "@/lib/simColors";
import { displayLayers, displayTokens } from "@/lib/simulationMetrics";
import { selectMetrics, useSimulationStore } from "@/state/simulationStore";

/** Lesson 7 — full precision vs quantized payload footprint. */
export function FewerBitsScene() {
  const params = useSimulationStore((s) => s.params);
  const metrics = selectMetrics(params);
  const tokens = displayTokens(params.sequenceLength, 12);
  const layers = displayLayers(params.layers, 4);

  return (
    <SceneRig>
      <group position={[-1.6, -0.2, 0]}>
        <Text position={[0, 1.5, 0]} fontSize={0.16} color={simColors.key}>
          FP16 payload
        </Text>
        <MemoryGrid
          tokens={tokens}
          layers={layers}
          batch={1}
          fill={1}
          showAxes={false}
          gap={0.28}
        />
      </group>
      <group position={[1.6, -0.2, 0]} scale={[1, 1, 1]}>
        <Text position={[0, 1.5, 0]} fontSize={0.16} color={simColors.page}>
          lower-bit payload (~{metrics.compressionRatio.toFixed(1)}×)
        </Text>
        <group scale={[1, Math.max(0.25, 1 / metrics.compressionRatio), 1]}>
          <MemoryGrid
            tokens={tokens}
            layers={layers}
            batch={1}
            fill={1}
            showAxes={false}
            gap={0.28}
          />
        </group>
      </group>
    </SceneRig>
  );
}
