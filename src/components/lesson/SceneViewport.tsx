import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { LessonScene } from "@/components/scene/LessonScene";
import { getSceneSummary } from "@/content/sceneSummaries";
import styles from "./SceneViewport.module.css";

type SceneViewportProps = {
  /** Module slug from the V2 path registry */
  slug: string;
};

export function SceneViewport({ slug }: SceneViewportProps) {
  const summary = getSceneSummary(slug);

  return (
    <div className={styles.viewport}>
      <p className={styles.summary} aria-live="polite">
        <span className={styles.summaryLabel}>Scene summary</span>
        {summary}
      </p>
      <div className={styles.canvasWrap}>
        <span className={styles.label}>3D scene · drag to orbit</span>
        <Canvas
          camera={{ position: [4.5, 3.2, 5.5], fov: 42 }}
          dpr={[1, 1.75]}
          gl={{ antialias: true, alpha: false }}
          role="img"
          aria-label={`Interactive 3D simulation: ${summary}`}
        >
          <Suspense fallback={null}>
            <LessonScene slug={slug} />
          </Suspense>
        </Canvas>
      </div>
    </div>
  );
}
