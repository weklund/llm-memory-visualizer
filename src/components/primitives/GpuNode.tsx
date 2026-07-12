import { Text } from "@react-three/drei";
import { simColors } from "@/lib/simColors";

export type GpuNodeProps = {
  position?: [number, number, number];
  /** Compute load 0..1 */
  computeLoad?: number;
  /** Memory traffic 0..1 */
  memoryLoad?: number;
  label?: string;
  /** Phase tag for non-color distinction */
  phaseLabel?: string;
};

/**
 * Compact GPU chassis: compute brick + HBM tray (lesson 4+).
 */
export function GpuNode({
  position = [0, 0, 0],
  computeLoad = 0.5,
  memoryLoad = 0.5,
  label = "GPU",
  phaseLabel,
}: GpuNodeProps) {
  return (
    <group position={position}>
      {/* Chassis */}
      <mesh position={[0, 0.15, 0]}>
        <boxGeometry args={[1.6, 0.35, 1.0]} />
        <meshStandardMaterial color="#1c2532" metalness={0.4} roughness={0.45} />
      </mesh>
      {/* Compute */}
      <mesh position={[-0.35, 0.45, 0]} scale={[1, 0.5 + computeLoad, 1]}>
        <boxGeometry args={[0.55, 0.35, 0.7]} />
        <meshStandardMaterial
          color={simColors.compute}
          emissive="#881337"
          emissiveIntensity={0.3 + computeLoad * 0.7}
        />
      </mesh>
      {/* HBM tray */}
      <mesh position={[0.4, 0.38, 0]} scale={[1, 0.4 + memoryLoad * 0.8, 1]}>
        <boxGeometry args={[0.7, 0.28, 0.75]} />
        <meshStandardMaterial
          color={simColors.hbm}
          emissive="#334155"
          emissiveIntensity={0.2 + memoryLoad * 0.5}
        />
      </mesh>
      <Text
        position={[0, 0.95, 0]}
        fontSize={0.16}
        color={simColors.text}
        anchorX="center"
      >
        {label}
      </Text>
      <Text position={[-0.35, 0.72, 0.45]} fontSize={0.1} color={simColors.compute}>
        compute
      </Text>
      <Text position={[0.4, 0.72, 0.45]} fontSize={0.1} color={simColors.muted}>
        HBM
      </Text>
      {phaseLabel ? (
        <Text position={[0, -0.15, 0.55]} fontSize={0.14} color={simColors.bandwidth}>
          {phaseLabel}
        </Text>
      ) : null}
    </group>
  );
}
