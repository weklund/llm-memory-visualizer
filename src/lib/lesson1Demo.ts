/**
 * Fixed schematic demo for lesson 1 (not a real tokenizer / model).
 */

export const DEMO_PROMPT = "Write a haiku about rain.";

/** Longer prompt string for the “long prompt” timeline scenario (still schematic). */
export const DEMO_LONG_PROMPT =
  "System: be concise. User doc: notes on weather and mood. Task: Write a haiku about rain.";

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

/** Prior chat turns for multi-turn scenario (token counts are schematic). */
export const DEMO_PRIOR_TURNS = [
  {
    role: "You",
    text: "What makes rain sound peaceful?",
    tokens: 8,
  },
  {
    role: "Model",
    text: "Soft rhythm, cool air, and distance.",
    tokens: 10,
  },
] as const;

export type TimelineScenarioId = "long-prompt" | "growing-reply" | "multi-turn";

export type TimelineScenario = {
  id: TimelineScenarioId;
  /** Short radio label */
  label: string;
  /** One line under the switcher */
  blurb: string;
  /** Schematic prompt token count (current user message / system+doc) */
  promptTokens: number;
  /** Shown in the context box for the current prompt */
  promptDisplay: string;
  /** Frozen earlier turns (multi-turn only) */
  priorTurns: readonly { role: string; text: string; tokens: number }[];
  /** Reply path stepped by the timeline */
  replyTokens: readonly string[];
};

export const TIMELINE_SCENARIOS: TimelineScenario[] = [
  {
    id: "long-prompt",
    label: "Longer prompt",
    blurb: "Many tokens already in past before the first reply token.",
    promptTokens: 28,
    promptDisplay: DEMO_LONG_PROMPT,
    priorTurns: [],
    replyTokens: DEMO_REPLY_TOKENS,
  },
  {
    id: "growing-reply",
    label: "Longer reply",
    blurb: "Short ask; each new reply token joins the past for the next full run.",
    promptTokens: 6,
    promptDisplay: DEMO_PROMPT,
    priorTurns: [],
    replyTokens: DEMO_REPLY_TOKENS,
  },
  {
    id: "multi-turn",
    label: "Multi-turn chat",
    blurb: "Earlier turns stay in context while the new reply grows.",
    promptTokens: 6,
    promptDisplay: "Write a haiku about rain.",
    priorTurns: DEMO_PRIOR_TURNS,
    replyTokens: DEMO_REPLY_TOKENS,
  },
];

export function priorTokens(scenario: TimelineScenario): number {
  return scenario.priorTurns.reduce((sum, t) => sum + t.tokens, 0);
}

export function pastLengthAt(scenario: TimelineScenario, replyStep: number): number {
  const r = Math.max(0, Math.min(replyStep, scenario.replyTokens.length));
  return priorTokens(scenario) + scenario.promptTokens + r;
}

export function maxPastLength(scenario: TimelineScenario): number {
  return pastLengthAt(scenario, scenario.replyTokens.length);
}

// —— Summary chart (below the timeline in the lesson) ——

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
