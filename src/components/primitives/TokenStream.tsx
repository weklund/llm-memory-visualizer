import { useMemo } from "react";
import { Text } from "@react-three/drei";
import { TokenBlock } from "./TokenBlock";
import { simColors } from "@/lib/simColors";

export type TokenStreamProps = {
  /** Number of tokens to show */
  count: number;
  /** 0..1 how far generation has progressed (highlights the “cursor”) */
  progress?: number;
  /** How many leading tokens count as fixed prompt (always “written”) */
  promptCount?: number;
  /** Spacing along +X */
  gap?: number;
  position?: [number, number, number];
  showLabels?: boolean;
  role?: "token" | "key" | "value";
  /** Optional phase label under the cursor (e.g. "append") */
  phaseLabel?: string;
  /** Pulse emphasis on the “next” decision */
  pulse?: number;
};

/**
 * Horizontal bead stream for autoregressive generation (lesson 1).
 * Prompt beads stay lit; generation beads fill left → right with the cursor.
 */
export function TokenStream({
  count,
  progress = 1,
  promptCount = 4,
  gap = 0.38,
  position = [0, 0, 0],
  showLabels = true,
  role = "token",
  phaseLabel,
  pulse = 0,
}: TokenStreamProps) {
  const prompt = Math.min(count - 1, Math.max(1, promptCount));
  const genSlots = Math.max(1, count - prompt);
  const genWritten = Math.min(genSlots, Math.floor(progress * genSlots + 1e-6));
  // Cursor on the token currently being decided (first unwritten gen, or last if done)
  const decisionIndex =
    progress >= 0.999 ? count - 1 : Math.min(count - 1, prompt + genWritten);

  const tokens = useMemo(() => Array.from({ length: count }, (_, i) => i), [count]);
  const width = (count - 1) * gap;
  const xAt = (i: number) => i * gap - width / 2;

  return (
    <group position={position}>
      {tokens.map((i) => {
        const x = xAt(i);
        const isPrompt = i < prompt;
        const written = isPrompt || i < prompt + genWritten;
        const isDecision = i === decisionIndex && !isPrompt;
        const emphasis = isDecision
          ? 0.75 + pulse * 0.25
          : written
            ? isPrompt
              ? 0.35
              : 0.5
            : 0.08;
        return (
          <TokenBlock
            key={i}
            position={[x, 0, 0]}
            role={isPrompt ? "key" : role}
            emphasis={emphasis}
            opacity={written || isDecision ? 1 : 0.2}
            selected={isDecision}
            size={isDecision ? 0.3 : 0.28}
          />
        );
      })}

      {/* Flow cue: arc from “past” into the decision token */}
      {count > 2 ? (
        <mesh
          position={[xAt(decisionIndex) - gap * 0.45, 0.35, 0]}
          rotation={[0, 0, -0.4]}
        >
          <boxGeometry args={[gap * 0.55, 0.04, 0.04]} />
          <meshStandardMaterial
            color={simColors.bandwidth}
            emissive="#0e7490"
            emissiveIntensity={0.35 + pulse * 0.5}
            transparent
            opacity={0.55 + pulse * 0.35}
          />
        </mesh>
      ) : null}

      {showLabels ? (
        <>
          <Text
            position={[xAt(Math.max(0, prompt - 1) / 2), 0.62, 0]}
            fontSize={0.16}
            color={simColors.key}
            anchorX="center"
            anchorY="middle"
          >
            prompt (fixed)
          </Text>
          <Text
            position={[(xAt(prompt) + xAt(count - 1)) / 2, 0.62, 0]}
            fontSize={0.16}
            color={simColors.token}
            anchorX="center"
            anchorY="middle"
          >
            reply (growing)
          </Text>
          <Text
            position={[xAt(decisionIndex), -0.58, 0]}
            fontSize={0.15}
            color={simColors.token}
            anchorX="center"
          >
            {phaseLabel ?? "next token"}
          </Text>
          <Text
            position={[0, -1.05, 0]}
            fontSize={0.14}
            color={simColors.muted}
            anchorX="center"
          >
            each step: read past → choose next → append → repeat
          </Text>
        </>
      ) : null}
    </group>
  );
}
