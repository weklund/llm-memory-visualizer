import { useMemo } from "react";
import { AttentionSurface, SceneRig, TokenStream } from "@/components/primitives";
import { buildDemoAttentionMatrix, downsampleAttention } from "@/lib/attentionDemo";
import { useSimulationStore } from "@/state/simulationStore";

/** Lesson 8 — sinks + heavy hitters + recency window story. */
export function ForgettingScene() {
  const progress = useSimulationStore((s) => s.params.generateProgress);

  const matrix = useMemo(
    () =>
      downsampleAttention(
        buildDemoAttentionMatrix({
          rows: 12,
          cols: 12,
          sinkCount: 2,
          heavyHitterCount: 3,
          causal: true,
        }),
        12,
      ),
    [],
  );

  return (
    <SceneRig>
      <TokenStream count={14} progress={progress} position={[0, 1.65, 0]} gap={0.28} />
      <AttentionSurface matrix={matrix} position={[0, -0.15, 0]} heightScale={1.2} />
    </SceneRig>
  );
}
