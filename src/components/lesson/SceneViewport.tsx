import { Suspense, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { LessonScene } from "@/components/scene/LessonScene";
import { getSceneSummary } from "@/content/sceneSummaries";
import { budgetFor, detectDeviceClass } from "@/lib/geometryBudget";
import styles from "./SceneViewport.module.css";

type SceneViewportProps = {
  /** Module slug from the V2 path registry */
  slug: string;
};

export function SceneViewport({ slug }: SceneViewportProps) {
  const summary = getSceneSummary(slug);
  const glConfig = useMemo(() => {
    const device = detectDeviceClass();
    const budget = budgetFor(device);
    return {
      dpr: [1, budget.dprMax] as [number, number],
      antialias: budget.antialias,
      powerPreference: "high-performance" as const,
      alpha: false,
    };
  }, []);

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
          dpr={glConfig.dpr}
          gl={{
            antialias: glConfig.antialias,
            alpha: glConfig.alpha,
            powerPreference: glConfig.powerPreference,
            stencil: false,
            depth: true,
          }}
          role="img"
          aria-label={`Interactive 3D simulation: ${summary}`}
          // Avoid continuous RAF when nothing moves much; OrbitControls still demand frames
          frameloop="always"
          performance={{ min: 0.5 }}
        >
          <Suspense fallback={null}>
            <LessonScene slug={slug} />
          </Suspense>
        </Canvas>
      </div>
    </div>
  );
}
