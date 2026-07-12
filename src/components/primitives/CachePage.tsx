import { Text } from "@react-three/drei";
import { simColors } from "@/lib/simColors";

export type CachePageProps = {
  position?: [number, number, number];
  /** Occupancy 0..1 */
  fill?: number;
  shared?: boolean;
  free?: boolean;
  width?: number;
  height?: number;
  depth?: number;
  label?: string;
};

/**
 * Fixed-size physical page plate (PagedAttention block).
 * Shared pages use warmer color + dashed-feel via thinner top rim (label carries meaning).
 */
export function CachePage({
  position = [0, 0, 0],
  fill = 1,
  shared = false,
  free = false,
  width = 0.9,
  height = 0.12,
  depth = 0.55,
  label,
}: CachePageProps) {
  const color = free ? simColors.waste : shared ? simColors.pageShared : simColors.page;
  const opacity = free ? 0.2 : 0.35 + fill * 0.55;

  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial
          color={color}
          transparent
          opacity={opacity}
          metalness={0.2}
          roughness={0.5}
          wireframe={free}
        />
      </mesh>
      {!free ? (
        <mesh position={[0, height * 0.55, 0]}>
          <boxGeometry args={[width * fill * 0.92, height * 0.45, depth * 0.85]} />
          <meshStandardMaterial
            color={shared ? simColors.hit : simColors.key}
            emissive={shared ? "#14532d" : "#0c4a6e"}
            emissiveIntensity={0.35}
          />
        </mesh>
      ) : null}
      {label ? (
        <Text
          position={[0, height + 0.18, 0]}
          fontSize={0.12}
          color={simColors.muted}
          anchorX="center"
        >
          {label}
        </Text>
      ) : null}
    </group>
  );
}
