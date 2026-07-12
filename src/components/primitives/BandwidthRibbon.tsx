import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Mesh } from "three";
import { simColors } from "@/lib/simColors";

export type BandwidthRibbonProps = {
  /** Start and end in local space */
  from?: [number, number, number];
  to?: [number, number, number];
  /** Traffic 0..1 */
  intensity?: number;
  /** Animate flow */
  animated?: boolean;
};

/**
 * HBM ↔ compute traffic metaphor (lesson 4).
 */
export function BandwidthRibbon({
  from = [-0.2, 0.45, 0],
  to = [0.35, 0.45, 0],
  intensity = 0.6,
  animated = true,
}: BandwidthRibbonProps) {
  const ref = useRef<Mesh>(null);
  const mid: [number, number, number] = [
    (from[0] + to[0]) / 2,
    (from[1] + to[1]) / 2 + 0.15,
    (from[2] + to[2]) / 2,
  ];
  const length = Math.hypot(to[0] - from[0], to[1] - from[1], to[2] - from[2]);

  useFrame(({ clock }) => {
    if (!animated || !ref.current) return;
    const t = clock.getElapsedTime();
    ref.current.position.x = mid[0] + Math.sin(t * 3) * 0.08 * intensity;
    ref.current.scale.y = 0.7 + 0.4 * Math.sin(t * 4) * intensity;
  });

  return (
    <group>
      <mesh
        position={mid}
        rotation={[0, 0, Math.atan2(to[1] - from[1], to[0] - from[0])]}
      >
        <boxGeometry args={[length, 0.06 + intensity * 0.1, 0.12]} />
        <meshStandardMaterial
          color={simColors.bandwidth}
          emissive="#0e7490"
          emissiveIntensity={0.4 + intensity * 0.6}
          transparent
          opacity={0.75}
        />
      </mesh>
      <mesh ref={ref} position={mid}>
        <sphereGeometry args={[0.07, 12, 12]} />
        <meshStandardMaterial
          color={simColors.bandwidth}
          emissive="#22d3ee"
          emissiveIntensity={1}
        />
      </mesh>
    </group>
  );
}
