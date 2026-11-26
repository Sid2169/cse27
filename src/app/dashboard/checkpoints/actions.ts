"use server";

import { redirect } from "next/navigation";
import { requireOwner } from "@/server/supabase";
import { initialRevisionDate } from "@/modules/revisions/schedule";
import { evaluateCheckpoint } from "@/modules/assessment/checkpoint";
import {
  checkpointDb,
  checkpointId,
  currentCheckpoint,
} from "@/server/assessment/checkpoint-service";
import {
  inngest,
  checkpointRequested,
} from "@/server/assessment/checkpoint-worker";

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
  if (
    !process.env.GEMINI_API_KEY ||
    !process.env.INNGEST_EVENT_KEY ||
    !process.env.INNGEST_SIGNING_KEY
  )
    startStatus(paper, chapter, "unavailable");
  const jobs = db.from("checkpoint_generation_jobs");
  const queued = await jobs
    .insert({
      user_id: user.id,
      paper_code: paper,
      chapter_path: chapter,
      revision: current.revision,
      model,
    })
    .select("id")
    .single();
  let id = queued.data?.id;
  if (queued.error?.code === "23505") {
    const existing = await db
      .from("checkpoint_generation_jobs")
      .select("id")
      .eq("user_id", user.id)
      .eq("paper_code", paper)
      .eq("chapter_path", chapter)
      .in("status", ["queued", "waiting"])
      .maybeSingle();
    id = existing.data?.id;
  }
  if (!id) startStatus(paper, chapter, "failed");
  try {
    await inngest.send({ name: checkpointRequested, id, data: { jobId: id } });
  } catch {
    redirect(root + "/jobs/" + id + "?dispatch=retry");
  }
  redirect(root + "/jobs/" + id);
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
  const tomorrow = initialRevisionDate(date);
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
