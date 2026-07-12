import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { PlaceholderScene } from "@/components/scene/PlaceholderScene";
import styles from "./SceneViewport.module.css";

export function SceneViewport() {
  return (
    <div className={styles.viewport}>
      <span className={styles.label}>3D scene · drag to orbit</span>
      <Canvas
        camera={{ position: [4.5, 3.2, 5.5], fov: 42 }}
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: false }}
        aria-label="Interactive 3D simulation viewport"
      >
        <Suspense fallback={null}>
          <PlaceholderScene />
        </Suspense>
      </Canvas>
    </div>
  );
}
