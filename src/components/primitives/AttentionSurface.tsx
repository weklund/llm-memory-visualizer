import { useMemo } from "react";
import { Text } from "@react-three/drei";
import type { AttentionMatrix } from "@/lib/attentionDemo";
import { simColors } from "@/lib/simColors";

export type AttentionSurfaceProps = {
  matrix: AttentionMatrix;
  position?: [number, number, number];
  cellSize?: number;
  heightScale?: number;
  /** Highlight sink columns with posts */
  showMarkers?: boolean;
};

/**
 * Downsampled attention as a height field (lesson 2, 8).
 * Intensity + height encode weight (not color alone).
 */
export function AttentionSurface({
  matrix,
  position = [0, 0, 0],
  cellSize = 0.22,
  heightScale = 1.4,
  showMarkers = true,
}: AttentionSurfaceProps) {
  const { rows, cols, weights, sinkIndices, heavyHitterIndices } = matrix;

  const cells = useMemo(() => {
    const list: {
      key: string;
      pos: [number, number, number];
      h: number;
      w: number;
    }[] = [];
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const w = weights[i * cols + j] ?? 0;
        const h = 0.04 + w * heightScale;
        list.push({
          key: `${i}-${j}`,
          pos: [(j - (cols - 1) / 2) * cellSize, h / 2, (i - (rows - 1) / 2) * cellSize],
          h,
          w,
        });
      }
    }
    return list;
  }, [rows, cols, weights, cellSize, heightScale]);

  return (
    <group position={position}>
      {cells.map((c) => {
        const isSinkCol = sinkIndices.includes(
          Math.round(c.pos[0] / cellSize + (cols - 1) / 2),
        );
        // Color by weight band + slightly different hue for sinks via marker only
        const color =
          c.w > 0.2 ? simColors.compute : c.w > 0.08 ? simColors.token : simColors.hbm;
        return (
          <mesh key={c.key} position={c.pos}>
            <boxGeometry args={[cellSize * 0.88, c.h, cellSize * 0.88]} />
            <meshStandardMaterial
              color={color}
              emissive={isSinkCol ? "#4c1d95" : "#1e1b4b"}
              emissiveIntensity={0.2 + c.w}
              metalness={0.1}
              roughness={0.55}
            />
          </mesh>
        );
      })}
      {showMarkers
        ? sinkIndices.map((j) => (
            <mesh
              key={`sink-${j}`}
              position={[(j - (cols - 1) / 2) * cellSize, heightScale + 0.15, 0]}
            >
              <sphereGeometry args={[0.08, 12, 12]} />
              <meshStandardMaterial
                color={simColors.sram}
                emissive="#4c1d95"
                emissiveIntensity={0.5}
              />
            </mesh>
          ))
        : null}
      {showMarkers
        ? heavyHitterIndices.map((j) => (
            <mesh
              key={`hh-${j}`}
              position={[(j - (cols - 1) / 2) * cellSize, heightScale + 0.15, 0.35]}
            >
              <boxGeometry args={[0.1, 0.1, 0.1]} />
              <meshStandardMaterial color={simColors.page} />
            </mesh>
          ))
        : null}
      <Text
        position={[0, -0.55, ((rows - 1) / 2) * cellSize + 0.4]}
        fontSize={0.14}
        color={simColors.muted}
      >
        keys →
      </Text>
      <Text
        position={[-(cols / 2) * cellSize - 0.35, 0.2, 0]}
        fontSize={0.14}
        color={simColors.muted}
        rotation={[0, 0, Math.PI / 2]}
      >
        queries
      </Text>
      <Text position={[0, heightScale + 0.45, 0]} fontSize={0.14} color={simColors.sram}>
        ● sinks · ■ heavy hitters
      </Text>
    </group>
  );
}
