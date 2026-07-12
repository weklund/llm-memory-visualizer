import { useMemo, useRef, type ReactNode } from "react";
import { useFrame } from "@react-three/fiber";
import { Grid, OrbitControls } from "@react-three/drei";
import type { Group } from "three";
import { useSimulationStore } from "@/state/simulationStore";

/**
 * Temporary 3D stand-in until Milestone 2 primitives (MemoryGrid, TokenBlock, …).
 * Encodes sequence / batch / KV-head scale as a block field so controls feel connected.
 */
export function PlaceholderScene() {
  const params = useSimulationStore((s) => s.params);
  const group = useRef<Group>(null);

  const { cols, rows, layers } = useMemo(() => {
    const cols = Math.min(24, Math.max(4, Math.round(params.sequenceLength / 256)));
    const rows = Math.min(12, Math.max(1, params.batchSize));
    const layers = Math.min(8, Math.max(1, Math.round(params.layers / 8)));
    return { cols, rows, layers };
  }, [params.sequenceLength, params.batchSize, params.layers]);

  useFrame((_, delta) => {
    if (group.current) {
      group.current.rotation.y += delta * 0.08;
    }
  });

  const cells: ReactNode[] = [];
  const gap = 0.35;
  for (let layer = 0; layer < layers; layer++) {
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = (col - (cols - 1) / 2) * gap;
        const y = layer * gap * 0.85;
        const z = (row - (rows - 1) / 2) * gap;
        const isKey = (col + row + layer) % 2 === 0;
        cells.push(
          <mesh key={`${layer}-${row}-${col}`} position={[x, y, z]}>
            <boxGeometry args={[0.22, 0.22, 0.22]} />
            <meshStandardMaterial
              color={isKey ? "#38bdf8" : "#34d399"}
              emissive={isKey ? "#0c4a6e" : "#064e3b"}
              emissiveIntensity={0.35}
              metalness={0.2}
              roughness={0.45}
            />
          </mesh>,
        );
      }
    }
  }

  const intensity = Math.min(1.2, 0.35 + params.bytesPerElement * 0.2);

  return (
    <>
      <color attach="background" args={["#0b0f14"]} />
      <ambientLight intensity={0.45} />
      <directionalLight position={[6, 8, 4]} intensity={intensity} />
      <group ref={group} position={[0, -0.6, 0]}>
        {cells}
      </group>
      <Grid
        position={[0, -1.1, 0]}
        args={[12, 12]}
        cellSize={0.5}
        cellThickness={0.6}
        cellColor="#2a3544"
        sectionSize={2}
        sectionThickness={1}
        sectionColor="#3d4d63"
        fadeDistance={18}
        infiniteGrid
      />
      <OrbitControls
        makeDefault
        enablePan={false}
        minDistance={3}
        maxDistance={16}
        maxPolarAngle={Math.PI * 0.49}
      />
    </>
  );
}
