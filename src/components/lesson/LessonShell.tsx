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
  const [ContentAfter, setContentAfter] = useState<ComponentType<MdxContentProps> | null>(
    null,
  );
  const showLab = module.workspace === "memory-lab";
  const showFoundation = module.workspace === "narrative";
  const guidedSteps = getGuidedSteps(module.slug);
  const hasGuided = guidedSteps.length > 0;
  const mode = useExplorationStore((s) => s.mode);
  const narrativeFirst = showFoundation;

  const load = useMemo(() => module.loadContent, [module.loadContent]);
  const loadAfter = useMemo(() => module.loadContentAfter, [module.loadContentAfter]);

  useEffect(() => {
    let cancelled = false;
    setContent(null);
    setContentAfter(null);
    void load().then((mod) => {
      if (!cancelled) setContent(() => mod.default as ComponentType<MdxContentProps>);
    });
    if (loadAfter) {
      void loadAfter().then((mod) => {
        if (!cancelled)
          setContentAfter(() => mod.default as ComponentType<MdxContentProps>);
      });
    }
    return () => {
      cancelled = true;
    };
  }, [load, loadAfter]);

  const renderMdx = (C: ComponentType<MdxContentProps> | null, loadingLabel: string) =>
    C ? (
      <Suspense fallback={<p>{loadingLabel}</p>}>
        <C components={mdxComponents} />
      </Suspense>
    ) : (
      <p>{loadingLabel}</p>
    );

  const exploreFooter =
    hasGuided || showLab || showFoundation ? (
      <details className={styles.exploreDetails}>
        <summary className={styles.exploreSummary}>
          Explore the scene
          <span className={styles.exploreHint}>
            optional · free knobs if you want them
          </span>
        </summary>
        <div className={styles.exploreBody}>
          {hasGuided ? <ModeToggle hasGuidedSteps={hasGuided} /> : null}
          {showLab ? (
            <>
              <GuidedPanel slug={module.slug} />
              <ControlPanel />
            </>
          ) : null}
          {showFoundation ? (
            mode === "free" ? (
              <FoundationControls />
            ) : (
              <p className={styles.guidedOnlyNote}>
                The scene loops automatically while you read. Switch to{" "}
                <strong>Free explore</strong> if you want to scrub generation progress or
                change how long the past looks.
              </p>
            )
          ) : null}
        </div>
      </details>
    ) : null;

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

      {narrativeFirst ? (
        <div
          className={styles.workspaceNarrative}
          data-workspace="narrative"
          data-mode={mode}
        >
          <div className={styles.content}>{renderMdx(Content, "Loading lesson…")}</div>
          <div className={styles.scene}>
            <SceneViewport slug={module.slug} />
          </div>
          {ContentAfter || loadAfter ? (
            <div className={`${styles.content} ${styles.contentAfter}`}>
              {renderMdx(ContentAfter, "Loading…")}
            </div>
          ) : null}
          <div className={styles.controls}>{exploreFooter}</div>
        </div>
      ) : (
        <div
          className={showLab ? styles.workspace : styles.workspaceNarrative}
          data-workspace={module.workspace}
          data-mode={mode}
        >
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
          ) : (
            <aside className={styles.pathAside} aria-label="Path note">
              <h2 className={styles.pathAsideTitle}>On this path</h2>
              <p>Continue in order for the intended dependency chain.</p>
            </aside>
          )}
          <div className={styles.content}>{renderMdx(Content, "Loading lesson…")}</div>
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
