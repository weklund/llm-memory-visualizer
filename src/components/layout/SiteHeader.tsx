import { Link } from "react-router-dom";
import styles from "./SiteHeader.module.css";

export function SiteHeader() {
  return (
    <header className={styles.header}>
      <Link to="/" className={styles.brand}>
        <span className={styles.mark} aria-hidden="true" />
        <span>LLM Memory Visualizer</span>
      </Link>
      <nav className={styles.nav} aria-label="Primary">
        <Link to="/">Modules</Link>
        <span className={styles.badge}>Milestone 1 scaffold</span>
      </nav>
    </header>
  );
}
