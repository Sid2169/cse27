"use server";

import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { catalogue } from "@/modules/content/catalogue";
import { simulationRoot } from "@/modules/assessment/chapter-simulation";
import { requireOwner } from "@/server/supabase";
import { checkpointId } from "@/server/assessment/checkpoint-service";
import { dispatchSimulation } from "@/server/assessment/simulation-events";
import {
  cumulativeScope,
  fullScope,
  simulationDb,
  simulationScope,
} from "@/server/assessment/simulation-service";

export async function requestSimulation(form: FormData) {
  const { user } = await requireOwner();
  const paper = String(form.get("paper") ?? "");
  const requested = form.get("mode");
  const mode =
    requested === "cumulative" || requested === "full" ? requested : "chapter";
  const chapter = mode !== "chapter" ? "" : String(form.get("chapter") ?? "");
  const variant = String(form.get("variant") ?? "");
  const request = String(form.get("request") ?? "");
  const index = simulationRoot + "?" + new URLSearchParams({ paper, chapter });
  const db = simulationDb();
  const scope =
    mode === "cumulative"
      ? db
        ? await cumulativeScope(db, user.id, paper, variant).catch(
            () => undefined,
          )
        : undefined
      : mode === "full"
        ? fullScope(paper)
        : simulationScope(paper, chapter);
  if (mode === "cumulative" && scope === undefined)
    redirect(index + "&error=unavailable");
  const generation = process.env.GEMINI_GENERATION_MODEL;
  const evaluation = process.env.GEMINI_EVALUATION_MODEL || generation;
  if (!scope?.variants.includes(variant) || !checkpointId.test(request))
    redirect(
      index + (mode === "cumulative" ? "&error=qualification" : "&error=scope"),
    );
  if (
    !db ||
    !generation ||
    !evaluation ||
    !process.env.GEMINI_API_KEY ||
    !process.env.INNGEST_EVENT_KEY ||
    !process.env.INNGEST_SIGNING_KEY
  )
    redirect(index + "&error=unavailable");

  const due = mode === "chapter" ? String(form.get("scheduledDue") ?? "") : "";
  if (due) {
    const task = await db
      .from("chapter_simulation_revision_tasks")
      .select("due_on,schedule_state")
      .eq("user_id", user.id)
      .eq("paper_code", paper)
      .eq("paper_variant", variant)
      .eq("chapter_path", chapter)
      .eq("revision", scope.revision)
      .maybeSingle();
    if (task.error) redirect(index + "&error=request");
    if (
      task.data &&
      (task.data.schedule_state !== "pending" || task.data.due_on !== due)
    )
      redirect(index + "&error=task-changed");
    if (!task.data) {
      const initial = await db
        .from("checkpoint_revision_tasks")
        .select("due_on")
        .eq("user_id", user.id)
        .eq("paper_code", paper)
        .eq("chapter_path", chapter)
        .eq("revision", scope.revision)
        .maybeSingle();
      if (initial.error || initial.data?.due_on !== due)
        redirect(index + "&error=task-changed");
    }
  }
  const simulations = db.from("chapter_simulations");
  const row = {
    mode,
    scheduled_due: due || null,
    coverage: scope && "coverage" in scope ? scope.coverage : [],
    user_id: user.id,
    request_id: request,
    paper_code: paper,
    paper_variant: variant,
    chapter_path: chapter,
    revision: scope.revision,
    source_commit: catalogue.commit,
    kind: scope.kind,
    unit_scale: scope.kind === "objective" ? 6 : 1,
    generation_model: generation,
    evaluation_model: evaluation,
  };
  const { data, error } = await simulations
    .insert(row)
    .select("id,status,job_token")
    .single();
  let simulation = data;
  if (error?.code === "23505") {
    const repeated = await simulations
      .select("id,status,job_token")
      .eq("user_id", user.id)
      .eq("request_id", request)
      .maybeSingle();
    simulation = repeated.data;
    if (!simulation) {
      const open = await simulations
        .select("id,status,job_token")
        .eq("user_id", user.id)
        .eq("paper_code", paper)
        .eq("paper_variant", variant)
        .eq("chapter_path", chapter)
        .eq("revision", scope.revision)
        .not("status", "in", "(complete,generation-failed)")
        .maybeSingle();
      simulation = open.data;
    }
  }
  if (!simulation) redirect(index + "&error=request");
  if (simulation.status === "queued")
    await dispatchSimulation("prepare", {
      id: simulation.id,
      token: simulation.job_token,
    });
  redirect(simulationRoot + "/" + simulation.id);
}

export async function retrySimulation(form: FormData) {
  const { user } = await requireOwner();
  const id = String(form.get("id") ?? "");
  const db = simulationDb();
  if (!db || !checkpointId.test(id)) redirect(simulationRoot);
  const url = simulationRoot + "/" + id;
  const simulations = db.from("chapter_simulations");
  const { data: existing } = await simulations
    .select(
      "status,job_token,paper_code,paper_variant,chapter_path,revision,mode,coverage",
    )
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!existing) redirect(simulationRoot);
  const preparation =
    existing.status === "queued" || existing.status === "generation-failed";
  const retrying =
    existing.status === "generation-failed" ||
    existing.status === "evaluation-failed";
  if (!preparation && !retrying && existing.status !== "submitted")
    redirect(url);
  if (
    preparation &&
    (existing.mode === "full"
      ? fullScope(existing.paper_code)?.revision !== existing.revision
      : existing.mode === "cumulative"
        ? existing.coverage.some(
            (entry: { path: string; revision: string }) =>
              simulationScope(existing.paper_code, entry.path)?.revision !==
              entry.revision,
          )
        : simulationScope(existing.paper_code, existing.chapter_path)
            ?.revision !== existing.revision)
  )
    redirect(
      simulationRoot +
        "?" +
        new URLSearchParams({
          paper: existing.paper_code,
          chapter: existing.chapter_path,
          error: "changed",
        }),
    );
  let token = existing.job_token;
  if (retrying) {
    token = randomUUID();
    const updated = await simulations
      .update({
        status: preparation ? "queued" : "submitted",
        job_token: token,
      })
      .eq("id", id)
      .eq("user_id", user.id)
      .eq("job_token", existing.job_token)
      .eq("status", existing.status)
      .select("id")
      .maybeSingle();
    if (updated.error?.code === "23505") {
      redirect(
        simulationRoot +
          "?" +
          new URLSearchParams({
            paper: existing.paper_code,
            chapter: existing.chapter_path,
          }),
      );
    }
    if (updated.error) redirect(url + "?error=retry");
    if (!updated.data) redirect(url);
  }
  const sent = await dispatchSimulation(preparation ? "prepare" : "mark", {
    id,
    token,
  });
  redirect(sent ? url : url + "?error=retry");
}
