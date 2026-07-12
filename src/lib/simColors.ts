/**
 * Simulation color palette — mirrors docs/design-system.md / tokens.css.
 * Use these in Three.js materials (CSS vars are not available on the GPU side).
 */
export const simColors = {
  bg: "#0b0f14",
  token: "#c4b5fd",
  key: "#38bdf8",
  value: "#34d399",
  page: "#fbbf24",
  pageShared: "#f59e0b",
  hbm: "#64748b",
  sram: "#a78bfa",
  compute: "#fb7185",
  bandwidth: "#22d3ee",
  waste: "#f87171",
  hit: "#4ade80",
  miss: "#f472b6",
  grid: "#2a3544",
  gridSection: "#3d4d63",
  text: "#e8eef6",
  muted: "#9aabc0",
} as const;

export type RoleColor =
  "token" | "key" | "value" | "page" | "pageShared" | "waste" | "hit" | "miss";

export function roleColor(role: RoleColor): string {
  switch (role) {
    case "token":
      return simColors.token;
    case "key":
      return simColors.key;
    case "value":
      return simColors.value;
    case "page":
      return simColors.page;
    case "pageShared":
      return simColors.pageShared;
    case "waste":
      return simColors.waste;
    case "hit":
      return simColors.hit;
    case "miss":
      return simColors.miss;
  }
}
