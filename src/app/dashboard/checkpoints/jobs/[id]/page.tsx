import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireOwner } from "@/server/supabase";
import {
  checkpointDb,
  checkpointId,
} from "@/server/assessment/checkpoint-service";
import { startCheckpoint } from "../../actions";
import { RefreshCheckpointJob } from "./refresh";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Checkpoint generation",
  robots: { index: false, follow: false },
};

export default async function CheckpointJob({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ dispatch?: string }>;
}) {
  const { user } = await requireOwner();
  const { id } = await params;
  const { dispatch } = await searchParams;
  const db = checkpointDb();
  if (!db || !checkpointId.test(id)) notFound();
  const { data: job, error } = await db
    .from("checkpoint_generation_jobs")
    .select("paper_code,chapter_path,status,checkpoint_id")
    .eq("user_id", user.id)
    .eq("id", id)
    .maybeSingle();
  if (error || !job) notFound();
  if (job.status === "ready")
    redirect("/dashboard/checkpoints/" + job.checkpoint_id);
  return (
    <div className="page">
      <h1 className="compact-title">Checkpoint generation</h1>
      {job.status === "failed" ? (
        <p role="status">A verified checkpoint could not be generated.</p>
      ) : dispatch === "retry" ? (
        <p role="status">
          The generation request could not be sent. Retry sending it below.
        </p>
      ) : job.status === "waiting" ? (
        <p role="status">
          The model quota is exhausted. Generation will retry automatically.
        </p>
      ) : (
        <p role="status">
          Your checkpoint is queued. You can leave this page and return later.
        </p>
      )}
      {job.status !== "failed" && dispatch !== "retry" && (
        <RefreshCheckpointJob />
      )}
      <form action={startCheckpoint} className="stack-form">
        <input type="hidden" name="paper" value={job.paper_code} />
        <input type="hidden" name="chapter" value={job.chapter_path} />
        <button className="button">
          {job.status === "failed" ? "Try again" : "Resend request"}
        </button>
      </form>
      <Link className="button" href="/dashboard/checkpoints">
        Checkpoint history
      </Link>
    </div>
  );
}
