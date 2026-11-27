import "server-only";
import { createClient } from "@supabase/supabase-js";
import { getPaper } from "@/modules/content/catalogue";
import {
  mathematicsVariants,
  type AnswerFile,
  type Extraction,
  type SimulationAnswers,
  type SimulationQuestion,
  type SimulationSummary,
} from "@/modules/assessment/chapter-simulation";
import { currentCheckpoint } from "./checkpoint-service";

export const simulationEnabled =
  process.env.CHAPTER_SIMULATIONS_ENABLED === "true";

export function simulationDb() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secret = process.env.SUPABASE_SECRET_KEY;
  if (!simulationEnabled || !url || !secret) return null;
  return createClient(url, secret, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }),
    },
  });
}

export function simulationScope(paper: string, path: string) {
  const current = currentCheckpoint(paper, path);
  const definition = getPaper(paper);
  if (!current || !definition) return null;
  const variants =
    paper === "Mains-Mathematics"
      ? mathematicsVariants(current.scope[0].markdown)
      : [""];
  if (!variants.length) return null;
  return {
    ...current,
    kind:
      definition.stage === "Prelims"
        ? ("objective" as const)
        : ("descriptive" as const),
    variants,
    paperTitle: definition.title,
  };
}

export type SimulationView = SimulationSummary & {
  kind: "objective" | "descriptive";
  questions: SimulationQuestion[] | null;
  duration_seconds: number | null;
  remaining_ms: number | null;
  answers: SimulationAnswers;
  attachments: Record<string, AnswerFile>;
  extracted: Record<string, Extraction>;
  clarification: { question: number; request: string } | null;
  max_units: number | null;
  unit_scale: 1 | 6;
  version: number;
};

export const simulationViewFields =
  "id,paper_code,paper_variant,chapter_path,kind,status,questions,duration_seconds,remaining_ms,answers,attachments,extracted,clarification,max_units,unit_scale,version,created_at";
