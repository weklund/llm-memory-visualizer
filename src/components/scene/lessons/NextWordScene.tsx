import { useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import type { Group } from "three";
import { SceneRig, TokenStream } from "@/components/primitives";
import { usePrefersReducedMotion } from "@/lib/prefersReducedMotion";
import { displayTokens } from "@/lib/simulationMetrics";
import { simColors } from "@/lib/simColors";
import { useExplorationStore } from "@/state/explorationStore";
import { useSimulationStore } from "@/state/simulationStore";

type LoopPhase = "read" | "predict" | "append" | "repeat";

const PHASE_LABEL: Record<LoopPhase, string> = {
  read: "1 · read past",
  predict: "2 · choose next",
  append: "3 · append",
  repeat: "4 · loop again",
};

/**
 * Lesson 1 — looping autoregressive flow.
 * Auto-plays by default; free-explore mode scrubs via store progress.
 */
export function NextWordScene() {
  const params = useSimulationStore((s) => s.params);
  const mode = useExplorationStore((s) => s.mode);
  const free = mode === "free";
  const reduceMotion = usePrefersReducedMotion();

  const group = useRef<Group>(null);
  const loopT = useRef(0);
  const [progress, setProgress] = useState(0.15);
  const [phase, setPhase] = useState<LoopPhase>("read");
  const [pulse, setPulse] = useState(0);

  const count = useMemo(() => {
    if (free) {
      return displayTokens(Math.max(8, Math.round(params.sequenceLength / 32)), 18);
    }
    // Stable teaching stream: fixed prompt + growing reply
    return 14;
  }, [free, params.sequenceLength]);

  const promptCount = free ? Math.max(3, Math.min(6, Math.round(count * 0.35))) : 5;

  useFrame((_, dt) => {
    if (!reduceMotion && group.current) {
      group.current.rotation.y += dt * 0.03;
    }

    if (free) {
      // Manual scrub from foundation controls
      setProgress(params.generateProgress);
      setPhase(params.generateProgress > 0.92 ? "repeat" : "append");
      setPulse(0.4);
      return;
    }

    if (reduceMotion) {
      // Static mid-generation pose for reduced motion
      setProgress(0.55);
      setPhase("predict");
      setPulse(0);
      return;
    }

    // Full loop: ease through a generation, brief hold, reset
    loopT.current += dt;
    const cycle = 7.5; // seconds per full story
    const t = loopT.current % cycle;

    if (t < 0.6) {
      setPhase("read");
      setProgress(0.02);
      setPulse(0.2 + 0.3 * Math.sin(t * 8));
    } else if (t < 5.8) {
      // Growing reply
      const u = (t - 0.6) / 5.2;
      setProgress(Math.min(1, u));
      // Alternate micro-phases while growing
      const micro = (t * 2.2) % 1;
      if (micro < 0.33) setPhase("read");
      else if (micro < 0.66) setPhase("predict");
      else setPhase("append");
      setPulse(0.35 + 0.45 * Math.sin(t * 6));
    } else if (t < 6.6) {
      setPhase("repeat");
      setProgress(1);
      setPulse(0.15);
    } else {
      // Reset beat
      setPhase("read");
      setProgress(0.02);
      setPulse(0.1);
    }
  });

  return (
    <SceneRig>
      <group ref={group}>
        <Text
          position={[0, 1.85, 0]}
          fontSize={0.2}
          color={simColors.text}
          anchorX="center"
        >
          Autoregressive loop (schematic)
        </Text>
        <Text
          position={[0, 1.5, 0]}
          fontSize={0.14}
          color={simColors.muted}
          anchorX="center"
        >
          {free
            ? "Free explore · scrub with controls below"
            : "Looping · watch past grow"}
        </Text>

        <TokenStream
          count={count}
          progress={progress}
          promptCount={promptCount}
          phaseLabel={PHASE_LABEL[phase]}
          pulse={pulse}
          position={[0, 0.15, 0]}
        />

        {/* Phase chips as simple labeled markers */}
        <group position={[0, -1.55, 0]}>
          {(["read", "predict", "append", "repeat"] as LoopPhase[]).map((p, i) => {
            const active = p === phase;
            const x = (i - 1.5) * 1.35;
            return (
              <Text
                key={p}
                position={[x, 0, 0]}
                fontSize={0.13}
                color={active ? simColors.bandwidth : simColors.muted}
                anchorX="center"
              >
                {active ? `▸ ${PHASE_LABEL[p]}` : PHASE_LABEL[p]}
              </Text>
            );
          })}
        </group>
      </group>
    </SceneRig>
  );
}
