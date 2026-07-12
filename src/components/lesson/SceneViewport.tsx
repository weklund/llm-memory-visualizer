import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { LessonScene } from "@/components/scene/LessonScene";
import styles from "./SceneViewport.module.css";

type SceneViewportProps = {
  /** Module slug from the V2 path registry */
  slug: string;
};

export function SceneViewport({ slug }: SceneViewportProps) {
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
          <LessonScene slug={slug} />
        </Suspense>
      </Canvas>
    </div>
  );
}
