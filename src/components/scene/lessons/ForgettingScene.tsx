import { useMemo } from "react";
import { Text } from "@react-three/drei";
import { AttentionSurface, SceneRig, TokenBlock } from "@/components/primitives";
import { buildDemoAttentionMatrix, downsampleAttention } from "@/lib/attentionDemo";
import { planTokenKeep } from "@/lib/eviction";
import { simColors } from "@/lib/simColors";
import { useSimulationStore } from "@/state/simulationStore";

/** Lesson 8 — kept vs evicted tokens under policy + budget. */
export function ForgettingScene() {
  const params = useSimulationStore((s) => s.params);
  const displayS = 16;

  const plan = useMemo(
    () =>
      planTokenKeep({
        sequenceLength: displayS,
        budgetTokens: Math.min(displayS, params.evictionBudget),
        policy: params.evictionPolicy,
        sinkCount: 2,
        heavyCount: 3,
      }),
    [params.evictionBudget, params.evictionPolicy],
  );

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

  const gap = 0.32;
  const width = (displayS - 1) * gap;
  const keptSet = useMemo(() => new Set(plan.kept), [plan.kept]);

  return (
    <SceneRig>
      <Text
        position={[0, 2.05, 0]}
        fontSize={0.15}
        color={simColors.muted}
        anchorX="center"
      >
        policy: {params.evictionPolicy} · kept {plan.kept.length}/{displayS} · dim =
        evicted
      </Text>
      <group position={[0, 1.45, 0]}>
        {Array.from({ length: displayS }, (_, i) => {
          const kept = keptSet.has(i);
          return (
            <TokenBlock
              key={i}
              position={[i * gap - width / 2, 0, 0]}
              role={kept ? "token" : "mixed"}
              emphasis={kept ? 0.85 : 0.05}
              opacity={kept ? 1 : 0.18}
              size={0.26}
              selected={kept && i === displayS - 1}
            />
          );
        })}
      </group>
      <AttentionSurface matrix={matrix} position={[0, -0.35, 0]} heightScale={1.05} />
    </SceneRig>
  );
}
