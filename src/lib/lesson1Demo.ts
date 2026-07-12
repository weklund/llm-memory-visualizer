/**
 * Fixed schematic demo for lesson 1 (not a real tokenizer / model).
 */

export const DEMO_PROMPT = "Write a haiku about rain.";

/** Schematic “tokens” for the demo reply (fixed path for re-watching). */
export const DEMO_REPLY_TOKENS = [
  "Soft",
  "rain",
  "falls",
  "on",
  "quiet",
  "streets",
  "—",
  "night",
  "breathes",
  "again",
] as const;

export type ContextScenarioId = "short" | "long-prompt" | "long-reply";

export type ContextScenario = {
  id: ContextScenarioId;
  label: string;
  description: string;
  /** Tokens already present before generation (prompt + prior turns) */
  baseTokens: number;
  /** How many reply tokens to plot */
  replySteps: number;
};

export const CONTEXT_SCENARIOS: ContextScenario[] = [
  {
    id: "short",
    label: "Short prompt · short reply",
    description: "A brief ask and a brief answer. The past stays modest.",
    baseTokens: 8,
    replySteps: 12,
  },
  {
    id: "long-prompt",
    label: "Long prompt · short reply",
    description:
      "A long document or system text is already in play before the first output token.",
    baseTokens: 48,
    replySteps: 12,
  },
  {
    id: "long-reply",
    label: "Short prompt · long reply",
    description:
      "The ask is short, but the answer keeps growing—each step stands on a taller stack.",
    baseTokens: 8,
    replySteps: 40,
  },
];

/** Context length after generating `replyIndex` tokens (0 = only base). */
export function contextLengthAtStep(
  scenario: ContextScenario,
  replyIndex: number,
): number {
  const r = Math.max(0, Math.min(replyIndex, scenario.replySteps));
  return scenario.baseTokens + r;
}

export function seriesForScenario(
  scenario: ContextScenario,
): { step: number; tokens: number }[] {
  const points: { step: number; tokens: number }[] = [];
  for (let i = 0; i <= scenario.replySteps; i++) {
    points.push({ step: i, tokens: contextLengthAtStep(scenario, i) });
  }
  return points;
}
