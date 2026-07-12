import { NavLink } from "react-router-dom";
import styles from "./SiteHeader.module.css";

export function SiteHeader() {
  return (
    <header className={styles.header}>
      <NavLink to="/" className={styles.brand ?? "brand"} end>
        <span className={styles.mark} aria-hidden="true" />
        <span>LLM Memory Visualizer</span>
      </NavLink>
      <nav className={styles.nav} aria-label="Primary">
        <NavLink to="/" className={navClass} end>
          Path
        </NavLink>
        <NavLink to="/references" className={navClass}>
          References
        </NavLink>
        <span className={styles.badge}>Lessons 1–9</span>
      </nav>
    </header>
  );
}

function navClass({ isActive }: { isActive: boolean }): string {
  const base = styles.navLink ?? "navLink";
  const active = styles.navLinkActive ?? "navLinkActive";
  return isActive ? `${base} ${active}` : base;
}
