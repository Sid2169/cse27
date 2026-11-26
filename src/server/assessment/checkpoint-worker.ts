import "server-only";
import { Inngest, NonRetriableError, RetryAfterError } from "inngest";
import { catalogue } from "@/modules/content/catalogue";
import {
  checkpointDb,
  checkpointId,
  currentCheckpoint,
  type PublicQuestion,
} from "./checkpoint-service";
import { generateCheckpoint } from "./checkpoint-generation";
import { geminiGenerator, GenerationUnavailable } from "./gemini";

export const inngest = new Inngest({ id: "cse27" });
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
      if (error) throw new Error("Checkpoint job lookup failed");
      if (!job || job.status === "failed")
        throw new NonRetriableError("Checkpoint job is closed");
      if (job.status === "ready") return { id: job.checkpoint_id };
      const current = currentCheckpoint(job.paper_code, job.chapter_path);
      if (!current || current.revision !== job.revision)
        throw new NonRetriableError("Chapter changed");
      const history = await db
        .from("chapter_checkpoints")
        .select("questions", { count: "exact" })
        .eq("user_id", job.user_id)
        .eq("paper_code", job.paper_code)
        .eq("chapter_path", job.chapter_path);
      if (history.error || history.count !== history.data?.length)
        throw new Error("Checkpoint history unavailable");
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
      if (saved.error || typeof saved.data !== "string")
        throw new Error("Unable to store checkpoint");
      return { id: saved.data };
    });
  },
);
