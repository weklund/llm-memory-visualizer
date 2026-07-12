import { Link } from "react-router-dom";
import { modules } from "@/content/modules";
import styles from "./HomePage.module.css";

export function HomePage() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <h1>LLM memory, in 3D mental models</h1>
        <p>
          Interactive lessons on KV cache growth, paging, quantization, scheduling, prefix
          reuse, eviction, and shared-cache security — grounded in the formulas and papers
          in <code>docs/</code>.
        </p>
      </section>

      <ol className={styles.grid}>
        {modules.map((mod) => (
          <li key={mod.id}>
            <Link className={styles.card} to={`/modules/${mod.slug}`}>
              <span className={styles.num}>Module {mod.number}</span>
              <h2>{mod.title}</h2>
              <p>{mod.summary}</p>
              <span className={styles.status}>{mod.status}</span>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
