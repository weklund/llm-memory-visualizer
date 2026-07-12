/**
 * Fixed schematic demo for lesson 1 (not a real tokenizer / model).
 */

/** Default short prompt (also used by the contrast card). */
export const DEMO_PROMPT = "Write a haiku about rain.";

/**
 * Haiku-style reply — used by the contrast card and the “longer reply” scenario
 * (matches the short “Write a haiku about rain.” prompt).
 */
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

/** Reply for the long system/doc “summarize as a haiku…” prompt (shorter answer). */
export const DEMO_REPLY_LONG_PROMPT = [
  "Night",
  "rain",
  "on",
  "empty",
  "streets",
  "—",
  "mood",
  "softens",
] as const;

/** Reply for multi-turn packing follow-up (“rain shell?”). */
export const DEMO_REPLY_MULTI_TURN = [
  "Yes",
  "—",
  "forecast",
  "looks",
  "wet",
  ",",
  "so",
  "pack",
  "the",
  "shell",
] as const;

/** Prior chat turns for multi-turn scenario (token counts are schematic). */
export const DEMO_PRIOR_TURNS = [
  {
    role: "You",
    text: "I’m packing for a weekend hike.",
    tokens: 8,
  },
  {
    role: "Model",
    text: "Check the forecast and pack layers.",
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
    promptDisplay:
      "System: be concise. Attached notes (weather, mood, city sounds). Task: summarize in one short image—a haiku about rain on quiet streets at night.",
    priorTurns: [],
    replyTokens: DEMO_REPLY_LONG_PROMPT,
  },
  {
    id: "growing-reply",
    label: "Longer reply",
    blurb: "Short ask; each new reply token joins the past for the next full run.",
    promptTokens: 6,
    promptDisplay: "Write a haiku about rain.",
    priorTurns: [],
    replyTokens: DEMO_REPLY_TOKENS,
  },
  {
    id: "multi-turn",
    label: "Multi-turn chat",
    blurb: "Earlier turns stay in context while the new reply grows.",
    promptTokens: 9,
    promptDisplay: "Should I also pack a rain shell?",
    priorTurns: DEMO_PRIOR_TURNS,
    replyTokens: DEMO_REPLY_MULTI_TURN,
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

/** Past-length series for a timeline scenario (step 0 = before any reply token). */
export function seriesForTimelineScenario(
  scenario: TimelineScenario,
): { step: number; tokens: number }[] {
  const n = scenario.replyTokens.length;
  const points: { step: number; tokens: number }[] = [];
  for (let i = 0; i <= n; i++) {
    points.push({ step: i, tokens: pastLengthAt(scenario, i) });
  }
  return points;
}
