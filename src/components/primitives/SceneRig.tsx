import type { ReactNode } from "react";
import { Grid, OrbitControls } from "@react-three/drei";
import { simColors } from "@/lib/simColors";

type SceneRigProps = {
  children: ReactNode;
  /** Slow autospin of content group is left to scenes; rig only provides stage. */
  controls?: boolean;
  gridY?: number;
};

export function SceneRig({ children, controls = true, gridY = -1.15 }: SceneRigProps) {
  return (
    <>
      <color attach="background" args={[simColors.bg]} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[6, 9, 4]} intensity={0.95} />
      <directionalLight position={[-4, 3, -2]} intensity={0.25} />
      {children}
      <Grid
        position={[0, gridY, 0]}
        args={[14, 14]}
        cellSize={0.5}
        cellThickness={0.55}
        cellColor={simColors.grid}
        sectionSize={2}
        sectionThickness={1}
        sectionColor={simColors.gridSection}
        fadeDistance={20}
        infiniteGrid
      />
      {controls ? (
        <OrbitControls
          makeDefault
          enablePan={false}
          minDistance={2.5}
          maxDistance={18}
          maxPolarAngle={Math.PI * 0.49}
        />
      ) : null}
    </>
  );
}
