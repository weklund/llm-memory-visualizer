/**
 * Pure model for the Decode Stage spike — ribbon of context bricks + one
 * full pass per reply step. Schematic (not a real model).
 */

import {
  priorTokens,
  type TimelineScenario,
} from "@/lib/lesson1Demo";

export type CacheMode = "naive" | "kv";

export type BrickRole = "prior" | "prompt" | "reply";

export type DecodeBrick = {
  id: string;
  role: BrickRole;
  /** Short label for the brick (token text or “×n” chunk) */
  label: string;
  /** How many schematic tokens this brick represents */
  tokenCount: number;
  /** Index in the displayed brick array */
  index: number;
};

/** Max non-reply bricks so long prompts stay legible in 3D. */
const MAX_BASE_BRICKS = 14;

/**
 * Build a schematic brick ribbon for a scenario at a given reply step
 * (number of reply tokens already appended).
 */
export function bricksAt(scenario: TimelineScenario, replyStep: number): DecodeBrick[] {
  const prior = priorTokens(scenario);
  const promptN = scenario.promptTokens;
  const r = Math.max(0, Math.min(replyStep, scenario.replyTokens.length));
  const replyLabels = scenario.replyTokens.slice(0, r);

  const base: DecodeBrick[] = [];
  let index = 0;

  if (prior > 0) {
    const priorBricks = chunkCounts(prior, Math.max(2, Math.floor(MAX_BASE_BRICKS / 3)));
    for (let i = 0; i < priorBricks.length; i++) {
      const c = priorBricks[i]!;
      base.push({
        id: `prior-${i}`,
        role: "prior",
        label: c === 1 ? "·" : `×${c}`,
        tokenCount: c,
        index: index++,
      });
    }
  }

  const promptSlots = Math.max(2, MAX_BASE_BRICKS - base.length);
  const promptBricks = chunkCounts(promptN, promptSlots);
  for (let i = 0; i < promptBricks.length; i++) {
    const c = promptBricks[i]!;
    base.push({
      id: `prompt-${i}`,
      role: "prompt",
      label: c === 1 ? "p" : `×${c}`,
      tokenCount: c,
      index: index++,
    });
  }

  for (let i = 0; i < replyLabels.length; i++) {
    base.push({
      id: `reply-${i}`,
      role: "reply",
      label: replyLabels[i]!,
      tokenCount: 1,
      index: index++,
    });
  }

  return base;
}

/** Split `total` tokens into at most `maxBricks` positive chunk sizes. */
export function chunkCounts(total: number, maxBricks: number): number[] {
  if (total <= 0) return [];
  const n = Math.min(total, Math.max(1, maxBricks));
  const base = Math.floor(total / n);
  const rem = total % n;
  const out: number[] = [];
  for (let i = 0; i < n; i++) {
    out.push(base + (i < rem ? 1 : 0));
  }
  return out.filter((c) => c > 0);
}

export function totalTokenCount(bricks: readonly DecodeBrick[]): number {
  return bricks.reduce((s, b) => s + b.tokenCount, 0);
}

/**
 * Schematic work units for one full pass that produces the next reply token
 * (before append). Used for the side meter, not real FLOPs.
 *
 * - naive: touch every past token (recompute)
 * - kv: write only the newest position’s K/V; “read” the rest cheaply
 *   (report recompute units = 1 new position, read units = past length)
 */
export function workForPass(
  pastLength: number,
  mode: CacheMode,
): { recompute: number; cacheRead: number; label: string } {
  const past = Math.max(0, pastLength);
  if (mode === "naive") {
    return {
      recompute: past,
      cacheRead: 0,
      label: `Recompute K/V for all ${past} past tokens`,
    };
  }
  return {
    recompute: past > 0 ? 1 : 0,
    cacheRead: Math.max(0, past - 1),
    label:
      past <= 1
        ? "Write K/V for the only position"
        : `Write K/V for 1 new position · read cache for ${past - 1}`,
  };
}

/** Emphasis 0..1 for brick i during a sweep (progress 0..1). */
export function brickEmphasis(
  brickIndex: number,
  brickCount: number,
  sweepProgress: number,
  mode: CacheMode,
  phase: "idle" | "sweeping" | "emitting",
): number {
  if (brickCount <= 0) return 0.25;
  const last = brickCount - 1;
  if (phase === "idle") {
    return mode === "kv" ? 0.28 : 0.32;
  }
  if (phase === "emitting") {
    return brickIndex === last ? 0.95 : mode === "kv" ? 0.35 : 0.4;
  }
  // sweeping
  const head = sweepProgress * brickCount;
  const lit = brickIndex + 1 <= head + 0.15;
  if (mode === "naive") {
    return lit ? 0.95 : 0.22;
  }
  // kv: full glow only near the frontier (new write); dim pulse on read path
  if (brickIndex === last) {
    return lit ? 1 : 0.45;
  }
  return lit ? 0.42 : 0.2;
}
