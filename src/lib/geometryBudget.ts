/**
 * Geometry and WebGL budgets for responsive scenes (Milestone 6 / #25).
 */

export type DeviceClass = "mobile" | "desktop";

export function detectDeviceClass(): DeviceClass {
  if (typeof window === "undefined") return "desktop";
  const coarse =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(pointer: coarse)").matches;
  const narrow = window.innerWidth < 768;
  return coarse || narrow ? "mobile" : "desktop";
}

/** Max display tokens / layers / pages by device. */
export const geometryBudget = {
  desktop: {
    tokens: 24,
    layers: 8,
    pages: 20,
    attention: 12,
    dprMax: 1.75,
    antialias: true,
  },
  mobile: {
    tokens: 14,
    layers: 5,
    pages: 12,
    attention: 8,
    dprMax: 1.25,
    antialias: false,
  },
} as const;

export function budgetFor(device: DeviceClass = detectDeviceClass()) {
  return geometryBudget[device];
}

/**
 * Cap sequence display with log-ish growth (shared with simulationMetrics).
 * Pass an explicit cap from the active device budget.
 */
export function cappedDisplayCount(value: number, cap: number, floor = 1): number {
  if (value <= 0) return floor;
  if (value <= cap) return value;
  const t = Math.log2(1 + value) / Math.log2(1 + 8192);
  return Math.max(Math.min(cap, Math.round(cap * t)), Math.min(floor, cap));
}
