import { Link } from "react-router-dom";
import { modules, modulesByStage } from "@/content/modules";
import styles from "./HomePage.module.css";

export function HomePage() {
  const first = modules[0];
  const stages = modulesByStage();

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <p className={styles.eyebrow}>A first-principles path</p>
        <h1>How LLM inference memory works—from “next word” to GPU caches</h1>
        <p>
          Start with only a high-level idea of what an LLM is. You do <strong>not</strong>{" "}
          need to already know transformers, attention math, or terms like KV cache. Each
          lesson introduces one idea that the next lesson needs.
        </p>
        {first ? (
          <p className={styles.ctaRow}>
            <Link className={styles.cta} to={`/modules/${first.slug}`}>
              Start with lesson 1<span aria-hidden="true"> →</span>
            </Link>
            <span className={styles.ctaHint}>{first.title}</span>
          </p>
        ) : null}
      </section>

      <section className={styles.pathIntro} aria-labelledby="path-heading">
        <h2 id="path-heading">How the path is ordered</h2>
        <ol className={styles.pathSteps}>
          <li>
            <strong>Foundations</strong> — how text is generated, then how the model looks
            at past tokens
          </li>
          <li>
            <strong>Core memory</strong> — what engines store (the KV cache), how large it
            gets, and prompt vs generation phases
          </li>
          <li>
            <strong>Systems tricks</strong> — packing, reusing, compressing, and dropping
            that memory
          </li>
          <li>
            <strong>Consequences</strong> — what shared caches mean for privacy
          </li>
        </ol>
        <p className={styles.pathNote}>
          Cards show a plain-language title first. Technical names (PagedAttention,
          quantization, …) appear as “also known as” once the idea has a place in the
          story.
        </p>
      </section>

      {stages.map(({ stage, label, items }) => (
        <section key={stage} className={styles.stage} aria-labelledby={`stage-${stage}`}>
          <div className={styles.stageHeader}>
            <h2 id={`stage-${stage}`}>{label}</h2>
            <span className={styles.stageCount}>
              {items.length} lesson{items.length === 1 ? "" : "s"}
            </span>
          </div>
          <ol className={styles.grid}>
            {items.map((mod) => (
              <li key={mod.id}>
                <Link className={styles.card} to={`/modules/${mod.slug}`}>
                  <div className={styles.cardTop}>
                    <span className={styles.num}>Lesson {mod.number}</span>
                    {mod.number === 1 ? (
                      <span className={styles.startBadge}>Start here</span>
                    ) : null}
                  </div>
                  <h3 className={styles.cardTitle}>{mod.title}</h3>
                  <p className={styles.aka}>
                    <span className={styles.akaLabel}>Also known as</span>{" "}
                    {mod.alsoKnownAs}
                  </p>
                  <p className={styles.summary}>{mod.summary}</p>
                  <p className={styles.buildsOn}>
                    <span className={styles.buildsLabel}>Builds on</span> {mod.buildsOn}
                  </p>
                  <span className={styles.status}>{mod.status}</span>
                </Link>
              </li>
            ))}
          </ol>
        </section>
      ))}
    </div>
  );
}
