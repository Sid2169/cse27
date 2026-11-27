import "server-only";
import { NonRetriableError, RetryAfterError } from "inngest";
import { catalogue } from "@/modules/content/catalogue";
import {
  checkpointDb,
  checkpointId,
  currentCheckpoint,
  type PublicQuestion,
} from "./checkpoint-service";
import {
  CheckpointDraftError,
  generateCheckpoint,
} from "./checkpoint-generation";
import { geminiGenerator, GenerationUnavailable } from "./gemini";

import { inngest } from "./inngest";

export { inngest };
export const checkpointRequested = "cse27/checkpoint.requested";

export const checkpointWorker = inngest.createFunction(
  {
    id: "generate-checkpoint",
    triggers: { event: checkpointRequested },
    retries: 5,
    idempotency: "event.data.jobId",
    onFailure: async ({ event, step }) => {
      await step.run("close-failed-job", async () => {
        const id = event.data.event.data.jobId;
        const db = checkpointDb();
        if (!db || typeof id !== "string" || !checkpointId.test(id)) return;
        const { error } = await db
          .from("checkpoint_generation_jobs")
          .update({ status: "failed" })
          .eq("id", id)
          .in("status", ["queued", "waiting"]);
        if (error) throw new Error("Unable to close failed checkpoint job");
      });
    },
  },
  async ({ event, step }) => {
    const id = event.data.jobId;
    if (typeof id !== "string" || !checkpointId.test(id))
      throw new NonRetriableError("Invalid checkpoint job");
    return step.run("generate-validate-and-store", async () => {
      const db = checkpointDb();
      if (!db) throw new NonRetriableError("Checkpoint database unavailable");
      const { data: job, error } = await db
        .from("checkpoint_generation_jobs")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) {
        console.error("Completion test job lookup failed", {
          id,
          code: error.code,
        });
        throw new Error("Checkpoint job lookup failed");
      }
      if (!job || job.status === "failed")
        throw new NonRetriableError("Checkpoint job is closed");
      if (job.status === "ready") return { id: job.checkpoint_id };
      const current = currentCheckpoint(job.paper_code, job.chapter_path);
      if (!current || current.revision !== job.revision) {
        console.error("Completion test chapter revision changed", { id });
        throw new NonRetriableError("Chapter changed");
      }
      const history = await db
        .from("chapter_checkpoints")
        .select("questions", { count: "exact" })
        .eq("user_id", job.user_id)
        .eq("paper_code", job.paper_code)
        .eq("chapter_path", job.chapter_path);
      if (history.error || history.count !== history.data?.length) {
        console.error("Completion test history lookup failed", {
          id,
          code: history.error?.code,
        });
        throw new Error("Checkpoint history unavailable");
      }
      const stems = history.data.flatMap((row) =>
        (row.questions as PublicQuestion[]).map((question) => question.stem),
      );
      let generated;
      try {
        generated = await generateCheckpoint(
          geminiGenerator(job.model),
          current.scope,
          job.paper_code === "Mains-Indian-Language" ? "Hindi" : "English",
          stems,
        );
      } catch (error) {
        if (
          error instanceof GenerationUnavailable ||
          error instanceof CheckpointDraftError
        ) {
          console.warn("Completion test generation failed", {
            id,
            reason: error.reason,
            status:
              error instanceof GenerationUnavailable ? error.status : undefined,
          });
        }
        if (
          error instanceof GenerationUnavailable &&
          error.reason === "quota"
        ) {
          const waiting = await db
            .from("checkpoint_generation_jobs")
            .update({ status: "waiting" })
            .eq("id", id)
            .in("status", ["queued", "waiting"]);
          if (waiting.error) throw new Error("Unable to record quota delay");
          throw new RetryAfterError("Gemini quota exhausted", "30m");
        }
        if (
          error instanceof GenerationUnavailable &&
          error.reason === "configuration"
        )
          throw new NonRetriableError("Gemini configuration unavailable");
        throw error;
      }
      const saved = await db.rpc("complete_checkpoint_generation", {
        p_job: id,
        p_commit: catalogue.commit,
        p_questions: generated.questions,
        p_answers: generated.key,
      });
      if (saved.error || typeof saved.data !== "string") {
        console.error("Completion test could not be saved", {
          id,
          code: saved.error?.code,
        });
        throw new Error("Unable to store checkpoint");
      }
      return { id: saved.data };
    });
  },
);
