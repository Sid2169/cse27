import "server-only";
import { createHash } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { getDocument, getPaper } from "@/modules/content/catalogue";
import {
  mathematicsVariants,
  type AnswerFile,
  type CoverageChapter,
  type Extraction,
  type SimulationAnswers,
  type SimulationQuestion,
  type SimulationSummary,
} from "@/modules/assessment/chapter-simulation";
import { gsCurrentAffairs } from "@/modules/assessment/gs-current-affairs";
import { mainsGsPattern } from "@/modules/assessment/full-mains-pattern";
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

export function fullScope(paper: string) {
  const csat = paper === "Prelims-CSAT";
  const gs = paper === "Prelims-General-Studies-I";
  const pattern = mainsGsPattern(paper);
  const written = !!pattern;
  if (!csat && !gs && !written) return null;
  const definition = getPaper(paper);
  const syllabus = definition && getDocument(definition.syllabus);
  if (!syllabus) return null;
  const topics = syllabus.markdown
    .split("\n")
    .filter((line) => line.startsWith("- "))
    .map((line) => line.slice(2));
  if (written ? !topics.length : topics.length !== (csat ? 6 : 7)) return null;
  const sourceDetails = csat ? null : gsCurrentAffairs;
  return {
    syllabus,
    topics,
    csat,
    batches: pattern?.length ?? (csat ? 8 : 10),
    pattern,
    written,
    sourceDetails,
    variants: [""],
    revision: createHash("sha256")
      .update(
        csat
          ? "CSAT full 2026:" + syllabus.revision
          : JSON.stringify([
              gs ? "GS I full 2026" : paper + " full 2026",
              syllabus.revision,
              sourceDetails,
            ]),
      )
      .digest("hex"),
    kind: written ? ("descriptive" as const) : ("objective" as const),
  };
}

export async function cumulativeScope(
  db: NonNullable<ReturnType<typeof simulationDb>>,
  userId: string,
  paperCode: string,
  variant: string,
) {
  const paper = getPaper(paperCode);
  if (
    !paper ||
    (paperCode === "Mains-Mathematics"
      ? !["I", "II"].includes(variant)
      : variant !== "")
  )
    return null;
  const { data, count, error } = await db
    .from("chapter_checkpoint_qualifications")
    .select("chapter_path,revision", { count: "exact" })
    .eq("user_id", userId)
    .eq("paper_code", paperCode);
  if (error || count !== data?.length)
    throw new Error("Could not load qualified chapters");
  const qualified = new Map<string, Set<string>>();
  for (const row of data) {
    const revisions = qualified.get(row.chapter_path) ?? new Set<string>();
    revisions.add(row.revision);
    qualified.set(row.chapter_path, revisions);
  }
  const coverage = paper.chapters.flatMap((path): CoverageChapter[] => {
    if (!qualified.has(path)) return [];
    const current = simulationScope(paperCode, path);
    return current &&
      current.variants.includes(variant) &&
      qualified.get(path)?.has(current.revision)
      ? [{ path, revision: current.revision }]
      : [];
  });
  if (!coverage.length) return null;
  return {
    coverage,
    variants: [variant],
    revision: createHash("sha256")
      .update(JSON.stringify(coverage))
      .digest("hex"),
    kind:
      paper.stage === "Prelims"
        ? ("objective" as const)
        : ("descriptive" as const),
  };
}

export type SimulationView = SimulationSummary & {
  kind: "objective" | "descriptive";
  questions: SimulationQuestion[] | null;
  coverage: CoverageChapter[];
  source_details: typeof gsCurrentAffairs | null;
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
  "id,mode,coverage,source_details,paper_code,paper_variant,chapter_path,kind,status,questions,duration_seconds,remaining_ms,answers,attachments,extracted,clarification,max_units,unit_scale,version,created_at";
