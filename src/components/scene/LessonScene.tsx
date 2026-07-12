import type { ComponentType } from "react";
import { NextWordScene } from "./lessons/NextWordScene";
import { LookingBackScene } from "./lessons/LookingBackScene";
import { RememberingWorkScene } from "./lessons/RememberingWorkScene";
import { PrefillDecodeScene } from "./lessons/PrefillDecodeScene";
import { PackingMemoryScene } from "./lessons/PackingMemoryScene";
import { ReusingWorkScene } from "./lessons/ReusingWorkScene";
import { FewerBitsScene } from "./lessons/FewerBitsScene";
import { ForgettingScene } from "./lessons/ForgettingScene";
import { SharingLeaksScene } from "./lessons/SharingLeaksScene";

const sceneBySlug: Record<string, ComponentType> = {
  "next-word-loop": NextWordScene,
  "looking-back": LookingBackScene,
  "remembering-work": RememberingWorkScene,
  "prompt-vs-generation": PrefillDecodeScene,
  "packing-memory": PackingMemoryScene,
  "reusing-work": ReusingWorkScene,
  "fewer-bits": FewerBitsScene,
  "forgetting-on-purpose": ForgettingScene,
  "when-sharing-leaks": SharingLeaksScene,
};

type LessonSceneProps = {
  slug: string;
};

/**
 * Maps V2 lesson slugs to composed primitive scenes.
 */
export function LessonScene({ slug }: LessonSceneProps) {
  const Scene = sceneBySlug[slug] ?? RememberingWorkScene;
  return <Scene />;
}
