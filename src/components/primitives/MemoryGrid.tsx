import { useLayoutEffect, useMemo, useRef } from "react";
import { Text } from "@react-three/drei";
import * as THREE from "three";
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

const _obj = new THREE.Object3D();
const _color = new THREE.Color();

/**
 * Bounded 3D grid of K/V-ish cells for cache growth (lesson 3+).
 * Uses one InstancedMesh for draw-call efficiency (#25).
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
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const filledCols = Math.max(1, Math.round(tokens * Math.min(1, Math.max(0.05, fill))));
  const count = Math.max(1, tokens * layers * batch);

  const layout = useMemo(() => {
    const list: {
      pos: [number, number, number];
      role: "key" | "value";
      active: boolean;
    }[] = [];
    for (let l = 0; l < layers; l++) {
      for (let b = 0; b < batch; b++) {
        for (let t = 0; t < tokens; t++) {
          list.push({
            pos: [
              (t - (tokens - 1) / 2) * gap,
              l * gap * 0.9,
              (b - (batch - 1) / 2) * gap * 1.1,
            ],
            role: t % 2 === 0 ? "key" : "value",
            active: t < filledCols,
          });
        }
      }
    }
    return list;
  }, [tokens, layers, batch, gap, filledCols]);

  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const size = 0.24;
    layout.forEach((c, i) => {
      _obj.position.set(c.pos[0], c.pos[1], c.pos[2]);
      _obj.scale.setScalar(size);
      _obj.updateMatrix();
      mesh.setMatrixAt(i, _obj.matrix);
      if (c.active) {
        _color.set(c.role === "key" ? simColors.key : simColors.value);
        if (oom) _color.lerp(new THREE.Color(simColors.waste), 0.35);
      } else {
        _color.set("#334155");
      }
      mesh.setColorAt(i, _color);
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    mesh.count = layout.length;
  }, [layout, oom]);

  return (
    <group position={position}>
      <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          toneMapped
          metalness={0.15}
          roughness={0.42}
          transparent
          opacity={oom ? 0.92 : 1}
        />
      </instancedMesh>
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
