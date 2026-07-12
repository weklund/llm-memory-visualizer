import { Link } from "react-router-dom";
import { modules } from "@/content/modules";
import {
  papersByCategory,
  papersForModule,
  techniques,
  type Band,
} from "@/content/paperIndex";
import styles from "./ReferencesPage.module.css";

export function ReferencesPage() {
  const groups = papersByCategory();

  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <p className={styles.eyebrow}>Literature map</p>
        <h1>Papers, systems, and technique comparison</h1>
        <p>
          Navigate from a concept or lesson to primary sources. Comparison bands are
          qualitative—not interchangeable benchmark scores. Full research notes live in{" "}
          <code>docs/sources.md</code> and <code>docs/paper-index.md</code>.
        </p>
      </header>

      <section className={styles.section} aria-labelledby="by-lesson">
        <h2 id="by-lesson">By lesson</h2>
        <p className={styles.lede}>Jump into a module, or scan which papers back it.</p>
        <ol className={styles.lessonList}>
          {modules.map((mod) => {
            const related = papersForModule(mod.number);
            return (
              <li key={mod.id} className={styles.lessonCard}>
                <div className={styles.lessonHead}>
                  <Link to={`/modules/${mod.slug}`}>
                    Lesson {mod.number}: {mod.title}
                  </Link>
                  <span className={styles.aka}>{mod.alsoKnownAs}</span>
                </div>
                <ul className={styles.inlineSources}>
                  {related.length === 0 ? (
                    <li className={styles.muted}>Pedagogy / path framing</li>
                  ) : (
                    related.map((p) => (
                      <li key={p.id}>
                        <a href={p.href} target="_blank" rel="noreferrer">
                          {p.id}
                        </a>
                        <span className={styles.muted}> — {shortTitle(p.title)}</span>
                      </li>
                    ))
                  )}
                </ul>
              </li>
            );
          })}
        </ol>
      </section>

      <section className={styles.section} aria-labelledby="matrix-heading">
        <h2 id="matrix-heading">Technique comparison</h2>
        <p className={styles.lede}>
          Directional only. Memory “high” means a large effect under favorable load, not a
          fixed percentage. See footnotes under the table.
        </p>
        <div
          className={styles.tableWrap}
          role="region"
          aria-label="Technique comparison table"
        >
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col">Technique</th>
                <th scope="col">Lesson</th>
                <th scope="col">Pressure</th>
                <th scope="col">Memory</th>
                <th scope="col">Latency story</th>
                <th scope="col">Risk</th>
                <th scope="col">Complexity</th>
                <th scope="col">Serving fit</th>
              </tr>
            </thead>
            <tbody>
              {techniques.map((row) => (
                <tr key={row.technique}>
                  <th scope="row">{row.technique}</th>
                  <td>{row.lesson}</td>
                  <td>{row.pressure}</td>
                  <td>
                    <BandChip band={row.memorySaved} />
                  </td>
                  <td>{row.latency}</td>
                  <td>{row.risk}</td>
                  <td>
                    <BandChip band={row.complexity} />
                  </td>
                  <td>{row.servingFit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ul className={styles.footnotes}>
          <li>
            Paging savings are relative to contiguous max-reservation policies, not free
            memory from nowhere.
          </li>
          <li>
            Quantization memory figures are payload-oriented; residuals and scales reduce
            idealized ratios.
          </li>
          <li>
            Isolation trades reuse (and sometimes latency) for a smaller side-channel
            surface.
          </li>
        </ul>
      </section>

      <section className={styles.section} aria-labelledby="index-heading">
        <h2 id="index-heading">Paper index by category</h2>
        {groups.map(({ category, label, items }) => (
          <div key={category} className={styles.group}>
            <h3 className={styles.groupTitle}>{label}</h3>
            <ul className={styles.paperList}>
              {items.map((p) => (
                <li key={p.id}>
                  <a
                    href={p.href}
                    target="_blank"
                    rel="noreferrer"
                    className={styles.paperLink}
                  >
                    <span className={styles.paperId}>{p.id}</span>
                    <span className={styles.paperTitle}>{p.title}</span>
                  </a>
                  <span className={styles.meta}>
                    {p.year} · lessons {p.modules.join(", ")}
                    {p.note ? ` · ${p.note}` : ""}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>
    </div>
  );
}

function shortTitle(title: string): string {
  return title.length > 64 ? `${title.slice(0, 61)}…` : title;
}

function BandChip({ band }: { band: Band }) {
  return <span className={`${styles.band} ${styles[`band_${band}`]}`}>{band}</span>;
}
