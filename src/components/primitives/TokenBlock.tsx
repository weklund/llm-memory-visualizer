import { simColors } from "@/lib/simColors";

export type TokenBlockRole = "token" | "key" | "value" | "mixed";

export type TokenBlockProps = {
  position?: [number, number, number];
  role?: TokenBlockRole;
  /** 0..1 highlight intensity */
  emphasis?: number;
  size?: number;
  /** Non-color cue: slight scale when selected */
  selected?: boolean;
  opacity?: number;
};

const roleMap: Record<TokenBlockRole, { color: string; emissive: string }> = {
  token: { color: simColors.token, emissive: "#2e1065" },
  key: { color: simColors.key, emissive: "#0c4a6e" },
  value: { color: simColors.value, emissive: "#064e3b" },
  mixed: { color: "#94a3b8", emissive: "#1e293b" },
};

/**
 * Single sequence unit / KV cell. Prefer labels in parent for K vs V (a11y).
 */
export function TokenBlock({
  position = [0, 0, 0],
  role = "token",
  emphasis = 0.35,
  size = 0.28,
  selected = false,
  opacity = 1,
}: TokenBlockProps) {
  const { color, emissive } = roleMap[role];
  const s = selected ? size * 1.15 : size;
  return (
    <mesh position={position} scale={[s, s, s]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial
        color={color}
        emissive={emissive}
        emissiveIntensity={0.25 + emphasis * 0.55}
        metalness={0.15}
        roughness={0.42}
        transparent={opacity < 1}
        opacity={opacity}
      />
    </mesh>
  );
}
