import { ContextGrowthChart } from "@/components/lesson1/ContextGrowthChart";
import { DecodeStage } from "@/components/lesson1/DecodeStage";
import { GenerationTimeline } from "@/components/lesson1/GenerationTimeline";
import { MentalModelContrast } from "@/components/lesson1/MentalModelContrast";
import { TwoMemories } from "@/components/lesson1/TwoMemories";
import { Assumptions, Checkpoint, Formula, Sources, TryThis } from "./LessonCallouts";

/** Components available inside lesson MDX files. */
export const mdxComponents = {
  Formula,
  Assumptions,
  Sources,
  TryThis,
  Checkpoint,
  MentalModelContrast,
  GenerationTimeline,
  ContextGrowthChart,
  DecodeStage,
  TwoMemories,
};
