import { Suspense, useEffect, useMemo, useState, type ComponentType } from "react";
import { Link } from "react-router-dom";
import type { ModuleDefinition } from "@/content/modules";
import { getAdjacentModules } from "@/content/modules";
import { ControlPanel } from "./ControlPanel";
import { MetricPanel } from "./MetricPanel";
import { SceneViewport } from "./SceneViewport";
import styles from "./LessonShell.module.css";

type LessonShellProps = {
  module: ModuleDefinition;
};

export function LessonShell({ module }: LessonShellProps) {
  const { prev, next } = getAdjacentModules(module.slug);
  const [Content, setContent] = useState<ComponentType | null>(null);

  const load = useMemo(() => module.loadContent, [module.loadContent]);

  useEffect(() => {
    let cancelled = false;
    setContent(null);
    void load().then((mod) => {
      if (!cancelled) setContent(() => mod.default);
    });
    return () => {
      cancelled = true;
    };
  }, [load]);

  return (
    <article className={styles.shell}>
      <header className={styles.header}>
        <p className={styles.kicker}>
          Module {module.number}
          {module.status !== "ready" ? ` · ${module.status}` : ""}
        </p>
        <h1 className={styles.title}>{module.title}</h1>
        <p className={styles.summary}>{module.summary}</p>
      </header>

      <div className={styles.workspace}>
        <div className={styles.scene}>
          <SceneViewport />
        </div>
        <div className={styles.controls}>
          <ControlPanel />
        </div>
        <div className={styles.metrics}>
          <MetricPanel />
        </div>
        <div className={styles.content}>
          {Content ? (
            <Suspense fallback={<p>Loading lesson…</p>}>
              <Content />
            </Suspense>
          ) : (
            <p>Loading lesson…</p>
          )}
        </div>
      </div>

      <nav className={styles.nav} aria-label="Module navigation">
        {prev ? (
          <Link className={styles.navLink} to={`/modules/${prev.slug}`}>
            <span>Previous</span>
            <strong>
              {prev.number}. {prev.title}
            </strong>
          </Link>
        ) : (
          <span className={styles.navPlaceholder} aria-hidden="true" />
        )}
        {next ? (
          <Link
            className={`${styles.navLink} ${styles.navLinkNext}`}
            to={`/modules/${next.slug}`}
          >
            <span>Next</span>
            <strong>
              {next.number}. {next.title}
            </strong>
          </Link>
        ) : null}
      </nav>
    </article>
  );
}
