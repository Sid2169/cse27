"use server";
import { redirect } from "next/navigation";
import { requireOwner } from "@/server/supabase";
import { simulationDb } from "@/server/assessment/simulation-service";

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
