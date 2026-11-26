"use server";

import { redirect } from "next/navigation";
import { requireOwner } from "@/server/supabase";
import { catalogue } from "@/modules/content/catalogue";
import { evaluateCheckpoint } from "@/modules/assessment/checkpoint";
import {
  checkpointDb,
  checkpointId,
  currentCheckpoint,
  type PublicQuestion,
} from "@/server/assessment/checkpoint-service";
import { generateCheckpoint } from "@/server/assessment/checkpoint-generation";
import {
  geminiGenerator,
  GenerationUnavailable,
} from "@/server/assessment/gemini";

const root = "/dashboard/checkpoints";
function startStatus(paper: string, chapter: string, status: string): never {
  redirect(root + "?" + new URLSearchParams({ paper, chapter, status }));
}

export async function startCheckpoint(form: FormData) {
  const { user } = await requireOwner();
  const paper = String(form.get("paper") ?? "");
  const chapter = String(form.get("chapter") ?? "");
  const current = currentCheckpoint(paper, chapter);
  const db = checkpointDb();
  const model = process.env.GEMINI_GENERATION_MODEL;
  if (!db || !model) startStatus(paper, chapter, "unavailable");
  if (!current) startStatus(paper, chapter, "not-ready");
  const { data, error, count } = await db
    .from("chapter_checkpoints")
    .select("questions", { count: "exact" })
    .eq("user_id", user.id)
    .eq("paper_code", paper)
    .eq("chapter_path", chapter);
  if (error || count !== data?.length) startStatus(paper, chapter, "failed");
  const history = data.flatMap((row) =>
    (row.questions as PublicQuestion[]).map((q) => q.stem),
  );
  let generated;
  try {
    generated = await generateCheckpoint(
      geminiGenerator(model),
      current.scope,
      paper === "Mains-Indian-Language" ? "Hindi" : "English",
      history,
    );
  } catch (error) {
    startStatus(
      paper,
      chapter,
      error instanceof GenerationUnavailable && error.reason === "quota"
        ? "quota"
        : "failed",
    );
  }
  const saved = await db.rpc("record_chapter_checkpoint", {
    p_user_id: user.id,
    p_paper_code: paper,
    p_chapter_path: chapter,
    p_revision: current.revision,
    p_source_commit: catalogue.commit,
    p_model: model,
    p_questions: generated.questions,
    p_answers: generated.key,
  });
  if (saved.error || typeof saved.data !== "string")
    startStatus(paper, chapter, "failed");
  redirect(root + "/" + saved.data);
}

export async function submitCheckpoint(form: FormData) {
  const { user } = await requireOwner();
  const id = String(form.get("id") ?? "");
  const db = checkpointDb();
  if (!db || !checkpointId.test(id)) redirect(root);
  const resultPath = root + "/" + id;
  const checkpoint = await db
    .from("chapter_checkpoints")
    .select("paper_code,chapter_path")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (checkpoint.error || !checkpoint.data) redirect(root);
  const key = await db
    .from("chapter_checkpoint_keys")
    .select("answers")
    .eq("checkpoint_id", id)
    .single();
  if (key.error || !Array.isArray(key.data?.answers))
    redirect(resultPath + "?status=failed");
  const responses = key.data.answers.map((_: unknown, index: number) =>
    form
      .getAll("q-" + index)
      .filter((value) => value !== "blank")
      .map((value) =>
        typeof value === "string" && /^[0-5]$/.test(value) ? Number(value) : -1,
      ),
  );
  const score = evaluateCheckpoint(key.data.answers, responses, true);
  if (!score) redirect(resultPath + "?status=invalid");
  const current = currentCheckpoint(
    checkpoint.data.paper_code,
    checkpoint.data.chapter_path,
  );
  const timezone = String(form.get("timezone") ?? "UTC").slice(0, 80);
  let date: string;
  try {
    date = new Intl.DateTimeFormat("sv-SE", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format();
  } catch {
    date = new Date().toISOString().slice(0, 10);
  }
  const tomorrow = new Date(Date.parse(date + "T00:00:00Z") + 86_400_000)
    .toISOString()
    .slice(0, 10);
  const { error } = await db.rpc("finalize_chapter_checkpoint", {
    p_user: user.id,
    p_id: id,
    p_current_revision: current?.revision ?? "",
    p_responses: responses,
    p_correct: score.correct,
    p_wrong: score.wrong,
    p_blank: score.blank,
    p_excluded: score.excluded,
    p_passed: score.qualified,
    p_initial_due: tomorrow,
  });
  redirect(error ? resultPath + "?status=failed" : resultPath);
}
