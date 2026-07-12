import { useMemo } from "react";
import { Text } from "@react-three/drei";
import { TokenBlock } from "./TokenBlock";
import { simColors } from "@/lib/simColors";

export type TokenStreamProps = {
  /** Number of tokens to show */
  count: number;
  /** 0..1 how far generation has progressed (highlights the “cursor”) */
  progress?: number;
  /** Spacing along +X */
  gap?: number;
  position?: [number, number, number];
  showLabels?: boolean;
  role?: "token" | "key" | "value";
};

/**
 * Horizontal bead stream for autoregressive generation (lesson 1).
 */
export function TokenStream({
  count,
  progress = 1,
  gap = 0.38,
  position = [0, 0, 0],
  showLabels = true,
  role = "token",
}: TokenStreamProps) {
  const cursor = Math.min(count - 1, Math.max(0, Math.floor(progress * count)));

  const tokens = useMemo(() => {
    return Array.from({ length: count }, (_, i) => i);
  }, [count]);

  const width = (count - 1) * gap;

  return (
    <group position={position}>
      {tokens.map((i) => {
        const x = i * gap - width / 2;
        const written = i <= cursor;
        return (
          <TokenBlock
            key={i}
            position={[x, 0, 0]}
            role={role}
            emphasis={i === cursor ? 1 : written ? 0.45 : 0.1}
            opacity={written ? 1 : 0.25}
            selected={i === cursor}
          />
        );
      })}
      {showLabels ? (
        <>
          <Text
            position={[-width / 2, 0.55, 0]}
            fontSize={0.18}
            color={simColors.muted}
            anchorX="left"
            anchorY="middle"
          >
            prompt
          </Text>
          <Text
            position={[width / 2, 0.55, 0]}
            fontSize={0.18}
            color={simColors.muted}
            anchorX="right"
            anchorY="middle"
          >
            growing →
          </Text>
          <Text
            position={[cursor * gap - width / 2, -0.55, 0]}
            fontSize={0.16}
            color={simColors.token}
            anchorX="center"
          >
            next
          </Text>
        </>
      ) : null}
    </group>
  );
}
