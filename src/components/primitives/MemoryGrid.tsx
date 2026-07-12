import { useMemo } from "react";
import { Text } from "@react-three/drei";
import { TokenBlock } from "./TokenBlock";
import { simColors } from "@/lib/simColors";

export type MemoryGridProps = {
  /** Tokens along sequence axis (display count) */
  tokens: number;
  /** Layer stacks (display count) */
  layers: number;
  /** Batch rows along Z */
  batch?: number;
  gap?: number;
  position?: [number, number, number];
  /** 0..1 fill of capacity along X for growth animation */
  fill?: number;
  /** Show OOM tint when over budget */
  oom?: boolean;
  showAxes?: boolean;
};

/**
 * Bounded 3D grid of K/V-ish cells for cache growth (lesson 3+).
 * Alternating key/value roles along X for non-color-only distinction via checkerboard + labels.
 */
export function MemoryGrid({
  tokens,
  layers,
  batch = 1,
  gap = 0.32,
  position = [0, 0, 0],
  fill = 1,
  oom = false,
  showAxes = true,
}: MemoryGridProps) {
  const filledCols = Math.max(1, Math.round(tokens * Math.min(1, Math.max(0.05, fill))));

  const cells = useMemo(() => {
    const list: {
      key: string;
      pos: [number, number, number];
      role: "key" | "value";
      active: boolean;
    }[] = [];
    for (let l = 0; l < layers; l++) {
      for (let b = 0; b < batch; b++) {
        for (let t = 0; t < tokens; t++) {
          const active = t < filledCols;
          list.push({
            key: `${l}-${b}-${t}`,
            pos: [
              (t - (tokens - 1) / 2) * gap,
              l * gap * 0.9,
              (b - (batch - 1) / 2) * gap * 1.1,
            ],
            role: t % 2 === 0 ? "key" : "value",
            active,
          });
        }
      }
    }
    return list;
  }, [tokens, layers, batch, gap, filledCols]);

  return (
    <group position={position}>
      {cells.map((c) => (
        <TokenBlock
          key={c.key}
          position={c.pos}
          role={c.active ? c.role : "mixed"}
          emphasis={c.active ? (oom ? 0.9 : 0.4) : 0.05}
          opacity={c.active ? (oom ? 0.95 : 1) : 0.12}
          size={0.24}
        />
      ))}
      {oom ? (
        <Text
          position={[0, layers * gap * 0.9 + 0.5, 0]}
          fontSize={0.28}
          color={simColors.waste}
        >
          over budget
        </Text>
      ) : null}
      {showAxes ? (
        <>
          <Text
            position={[0, -0.55, ((batch - 1) / 2) * gap * 1.1 + 0.55]}
            fontSize={0.16}
            color={simColors.muted}
          >
            sequence →
          </Text>
          <Text
            position={[-(tokens / 2) * gap - 0.35, (layers * gap * 0.9) / 2, 0]}
            fontSize={0.16}
            color={simColors.muted}
            rotation={[0, 0, Math.PI / 2]}
          >
            layers
          </Text>
          <Text
            position={[-(tokens / 2) * gap, -0.35, 0]}
            fontSize={0.14}
            color={simColors.key}
            anchorX="left"
          >
            K
          </Text>
          <Text
            position={[-(tokens / 2) * gap + gap, -0.35, 0]}
            fontSize={0.14}
            color={simColors.value}
            anchorX="left"
          >
            V
          </Text>
        </>
      ) : null}
    </group>
  );
}
