import { create } from "zustand";
import { getGuidedSteps } from "@/content/guidedSteps";

export type ExplorationMode = "guided" | "free";

const STORAGE_KEY = "llm-mem-viz:exploration";

type Persisted = {
  mode: ExplorationMode;
  /** Per-lesson guided step index */
  stepBySlug: Record<string, number>;
};

function loadPersisted(): Persisted {
  if (typeof window === "undefined") {
    return { mode: "guided", stepBySlug: {} };
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { mode: "guided", stepBySlug: {} };
    const parsed = JSON.parse(raw) as Partial<Persisted>;
    return {
      mode: parsed.mode === "free" ? "free" : "guided",
      stepBySlug: parsed.stepBySlug ?? {},
    };
  } catch {
    return { mode: "guided", stepBySlug: {} };
  }
}

function persist(state: Pick<ExplorationState, "mode" | "stepBySlug">): void {
  if (typeof window === "undefined") return;
  try {
    const payload: Persisted = { mode: state.mode, stepBySlug: state.stepBySlug };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    /* ignore quota / private mode */
  }
}

export type ExplorationState = {
  mode: ExplorationMode;
  stepBySlug: Record<string, number>;
  setMode: (mode: ExplorationMode) => void;
  setStep: (slug: string, index: number) => void;
  nextStep: (slug: string) => void;
  prevStep: (slug: string) => void;
  stepIndex: (slug: string) => number;
};

const initial = loadPersisted();

export const useExplorationStore = create<ExplorationState>((set, get) => ({
  mode: initial.mode,
  stepBySlug: initial.stepBySlug,
  setMode: (mode) => {
    set({ mode });
    persist(get());
  },
  setStep: (slug, index) => {
    const steps = getGuidedSteps(slug);
    const max = Math.max(0, steps.length - 1);
    const clamped = Math.min(max, Math.max(0, index));
    set((s) => ({
      stepBySlug: { ...s.stepBySlug, [slug]: clamped },
    }));
    persist(get());
  },
  nextStep: (slug) => {
    const steps = getGuidedSteps(slug);
    if (steps.length === 0) return;
    const cur = get().stepIndex(slug);
    get().setStep(slug, Math.min(steps.length - 1, cur + 1));
  },
  prevStep: (slug) => {
    const cur = get().stepIndex(slug);
    get().setStep(slug, Math.max(0, cur - 1));
  },
  stepIndex: (slug) => {
    const steps = getGuidedSteps(slug);
    if (steps.length === 0) return 0;
    const raw = get().stepBySlug[slug] ?? 0;
    return Math.min(steps.length - 1, Math.max(0, raw));
  },
}));
