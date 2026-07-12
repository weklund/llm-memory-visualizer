import { Suspense, useEffect, useMemo, useState, type ComponentType } from "react";
import { Link } from "react-router-dom";
import type { ModuleDefinition } from "@/content/modules";
import { getAdjacentModules, stageLabels } from "@/content/modules";
import { getGuidedSteps } from "@/content/guidedSteps";
import { mdxComponents } from "@/components/mdx/mdxComponents";
import { ControlPanel } from "./ControlPanel";
import { FoundationControls } from "./FoundationControls";
import { GuidedPanel } from "./GuidedPanel";
import { MetricPanel } from "./MetricPanel";
import { ModeToggle } from "./ModeToggle";
import { SceneViewport } from "./SceneViewport";
import { useExplorationStore } from "@/state/explorationStore";
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
  const showNarrative = module.workspace === "narrative";
  const showEssay = module.workspace === "essay";
  const guidedSteps = getGuidedSteps(module.slug);
  const hasGuided = guidedSteps.length > 0;
  const mode = useExplorationStore((s) => s.mode);

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

  const lessonBody = Content ? (
    <Suspense fallback={<p>Loading lesson…</p>}>
      <Content components={mdxComponents} />
    </Suspense>
  ) : (
    <p>Loading lesson…</p>
  );

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

      {showEssay ? (
        <div className={styles.workspaceEssay} data-workspace="essay">
          <div className={styles.content}>{lessonBody}</div>
        </div>
      ) : showNarrative ? (
        <div
          className={styles.workspaceNarrative}
          data-workspace="narrative"
          data-mode={mode}
        >
          <div className={styles.content}>{lessonBody}</div>
          <div className={styles.scene}>
            <SceneViewport slug={module.slug} />
          </div>
          <div className={styles.controls}>
            <details className={styles.exploreDetails}>
              <summary className={styles.exploreSummary}>
                Explore the scene
                <span className={styles.exploreHint}>optional</span>
              </summary>
              <div className={styles.exploreBody}>
                {hasGuided ? <ModeToggle hasGuidedSteps={hasGuided} /> : null}
                {mode === "free" ? (
                  <FoundationControls />
                ) : (
                  <p className={styles.guidedOnlyNote}>
                    Switch to <strong>Free explore</strong> for manual knobs, or use
                    guided steps if available.
                  </p>
                )}
                {hasGuided ? <GuidedPanel slug={module.slug} /> : null}
              </div>
            </details>
          </div>
        </div>
      ) : (
        <div className={styles.workspace} data-workspace="memory-lab" data-mode={mode}>
          <div className={styles.scene}>
            <SceneViewport slug={module.slug} />
          </div>
          {showLab ? (
            <>
              <div className={styles.controls}>
                <div className={styles.labModeRow}>
                  {hasGuided ? <ModeToggle hasGuidedSteps={hasGuided} /> : null}
                </div>
                <GuidedPanel slug={module.slug} />
                <ControlPanel />
              </div>
              <div className={styles.metrics}>
                <MetricPanel />
              </div>
            </>
          ) : null}
          <div className={styles.content}>{lessonBody}</div>
        </div>
      )}

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
