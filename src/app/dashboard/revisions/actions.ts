"use server";
import { redirect } from "next/navigation";
import { requireOwner } from "@/server/supabase";
import {
  simulationDb,
  simulationScope,
} from "@/server/assessment/simulation-service";

export async function saveRevisionPreferences(form: FormData) {
  const { user } = await requireOwner();
  const db = simulationDb();
  const base = "/dashboard/revisions";
  if (!db) redirect(base + "?status=failed");
  const timezone = String(form.get("timezone") ?? "").trim();
  const material = String(form.get("material") ?? "");
  const difficulty = String(form.get("difficulty") ?? "");
  const priority = String(form.get("priority") ?? "");
  const prelims = String(form.get("prelims") ?? "");
  const mains = String(form.get("mains") ?? "");
  if (
    !timezone ||
    timezone.length > 80 ||
    !["generic", "factual", "conceptual", "procedural"].includes(material) ||
    !["easy", "medium", "hard"].includes(difficulty) ||
    !["high", "unsure", "low"].includes(priority) ||
    [prelims, mains].some(
      (value) => value && !/^\d{4}-\d{2}-\d{2}$/.test(value),
    )
  ) {
    redirect(base + "?status=invalid");
  }
  const { error } = await db.rpc("save_chapter_revision_preferences", {
    p_user: user.id,
    p_timezone: timezone,
    p_material: material,
    p_difficulty: difficulty,
    p_priority: priority,
    p_prelims: prelims || null,
    p_mains: mains || null,
  });
  redirect(base + (error ? "?status=failed" : "?status=saved"));
}

export async function changeRevisionTask(form: FormData) {
  const { user } = await requireOwner();
  const db = simulationDb();
  const base = "/dashboard/revisions";
  const paper = String(form.get("paper") ?? "");
  const chapter = String(form.get("chapter") ?? "");
  const variant = String(form.get("variant") ?? "");
  const due = String(form.get("date") ?? "");
  const cancel = form.get("operation") === "cancel";
  const scope = simulationScope(paper, chapter);
  if (
    !db ||
    !scope?.variants.includes(variant) ||
    (!cancel && !/^\d{4}-\d{2}-\d{2}$/.test(due))
  )
    redirect(base + "?status=invalid");
  const { data, error } = await db.rpc("change_chapter_revision_task", {
    p_user: user.id,
    p_paper: paper,
    p_variant: variant,
    p_chapter: chapter,
    p_revision: scope.revision,
    p_due: cancel ? null : due,
  });
  redirect(base + (error || !data ? "?status=failed" : "?status=task-saved"));
}
