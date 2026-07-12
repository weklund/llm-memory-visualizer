import { Suspense, useEffect, useMemo, useState, type ComponentType } from "react";
import { Link } from "react-router-dom";
import type { ModuleDefinition } from "@/content/modules";
import { getAdjacentModules, stageLabels } from "@/content/modules";
import { mdxComponents } from "@/components/mdx/mdxComponents";
import { ControlPanel } from "./ControlPanel";
import { FoundationControls } from "./FoundationControls";
import { MetricPanel } from "./MetricPanel";
import { SceneViewport } from "./SceneViewport";
import styles from "./LessonShell.module.css";

type LessonShellProps = {
  module: ModuleDefinition;
};

type MdxContentProps = {
  components?: typeof mdxComponents;
};

export function LessonShell({ module }: LessonShellProps) {
  const { prev, next } = getAdjacentModules(module.slug);
  const [Content, setContent] = useState<ComponentType<MdxContentProps> | null>(null);
  const showLab = module.workspace === "memory-lab";
  const showFoundation = module.workspace === "narrative";

  const load = useMemo(() => module.loadContent, [module.loadContent]);

  useEffect(() => {
    let cancelled = false;
    setContent(null);
    void load().then((mod) => {
      if (!cancelled) setContent(() => mod.default as ComponentType<MdxContentProps>);
    });
    return () => {
      cancelled = true;
    };
  }, [load]);

  return (
    <article className={styles.shell}>
      <header className={styles.header}>
        <p className={styles.kicker}>
          Lesson {module.number}
          <span className={styles.kickerSep}>·</span>
          {stageLabels[module.stage]}
          {module.status !== "ready" ? (
            <>
              <span className={styles.kickerSep}>·</span>
              {module.status}
            </>
          ) : null}
        </p>
        <h1 className={styles.title}>{module.title}</h1>
        <p className={styles.aka}>
          <span className={styles.akaLabel}>Also known as</span> {module.alsoKnownAs}
        </p>
        <p className={styles.summary}>{module.summary}</p>
        <p className={styles.buildsOn}>
          <span className={styles.buildsLabel}>Builds on</span> {module.buildsOn}
        </p>
      </header>

      <div
        className={showLab ? styles.workspace : styles.workspaceNarrative}
        data-workspace={module.workspace}
      >
        <div className={styles.scene}>
          <SceneViewport slug={module.slug} />
        </div>
        {showLab ? (
          <>
            <div className={styles.controls}>
              <ControlPanel />
            </div>
            <div className={styles.metrics}>
              <MetricPanel />
            </div>
          </>
        ) : showFoundation ? (
          <div className={styles.controls}>
            <FoundationControls />
          </div>
        ) : (
          <aside className={styles.pathAside} aria-label="Path note">
            <h2 className={styles.pathAsideTitle}>On this path</h2>
            <p>Continue in order for the intended dependency chain.</p>
          </aside>
        )}
        <div className={styles.content}>
          {Content ? (
            <Suspense fallback={<p>Loading lesson…</p>}>
              <Content components={mdxComponents} />
            </Suspense>
          ) : (
            <p>Loading lesson…</p>
          )}
        </div>
      </div>

      <nav className={styles.nav} aria-label="Lesson navigation">
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
