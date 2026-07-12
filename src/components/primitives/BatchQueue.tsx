import { Text } from "@react-three/drei";
import { simColors } from "@/lib/simColors";
import { TokenBlock } from "./TokenBlock";

export type BatchQueueProps = {
  /** Number of concurrent requests in the batch */
  count: number;
  position?: [number, number, number];
  /** Which index is “active” this iteration */
  activeIndex?: number;
  label?: string;
};

/**
 * Iteration-level batch slots (lesson 4 continuous batching intuition).
 */
export function BatchQueue({
  count,
  position = [0, 0, 0],
  activeIndex = 0,
  label = "batch slots",
}: BatchQueueProps) {
  const gap = 0.4;
  const width = (count - 1) * gap;
  return (
    <group position={position}>
      <Text
        position={[0, 0.55, 0]}
        fontSize={0.14}
        color={simColors.muted}
        anchorX="center"
      >
        {label}
      </Text>
      {Array.from({ length: count }, (_, i) => (
        <group key={i} position={[i * gap - width / 2, 0, 0]}>
          <mesh position={[0, -0.2, 0]}>
            <boxGeometry args={[0.32, 0.06, 0.32]} />
            <meshStandardMaterial
              color={i === activeIndex ? simColors.hit : simColors.grid}
              wireframe={i !== activeIndex}
            />
          </mesh>
          <TokenBlock
            role="token"
            size={0.22}
            emphasis={i === activeIndex ? 0.9 : 0.3}
            selected={i === activeIndex}
          />
        </group>
      ))}
    </group>
  );
}
