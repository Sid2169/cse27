import Link from "@/components/navigation-link";
import { getDocument } from "@/modules/content/catalogue";
import { documentUrl } from "@/modules/content/types";
import { requireOwner } from "@/server/supabase";
import {
  checkpointDb,
  currentCheckpoint,
} from "@/server/assessment/checkpoint-service";
import { startCheckpoint } from "./actions";
import { TestActionButton } from "./test-action-button";

export const metadata = {
  title: "Completion tests",
  robots: { index: false, follow: false },
};
export const maxDuration = 120;
export const dynamic = "force-dynamic";

const messages: Record<string, string> = {
  failed: "The completion test request could not be saved. Try again.",
  "not-ready":
    "All parts of the chapter must be ready before you can take its completion test.",
  unavailable: "Completion test generation is unavailable.",
};

export default async function Checkpoints({
  searchParams,
}: {
  searchParams: Promise<{ paper?: string; chapter?: string; status?: string }>;
}) {
  const { user } = await requireOwner();
  const { paper, chapter, status } = await searchParams;
  const db = checkpointDb();
  const current =
    typeof paper === "string" && typeof chapter === "string"
      ? currentCheckpoint(paper, chapter)
      : null;
  let query = db
    ?.from("chapter_checkpoints")
    .select(
      "id,chapter_path,sequence,revision,chapter_checkpoint_results(checkpoint_id)",
    )
    .eq("user_id", user.id);
  if (current && query)
    query = query.eq("paper_code", paper!).eq("chapter_path", chapter!);
  const [history, active] = await Promise.all([
    query?.order("created_at", { ascending: false }).limit(50),
    current && db
      ? db
          .from("checkpoint_generation_jobs")
          .select("id")
          .eq("user_id", user.id)
          .eq("paper_code", paper!)
          .eq("chapter_path", chapter!)
          .eq("revision", current.revision)
          .in("status", ["queued", "waiting"])
          .maybeSingle()
      : null,
  ]);
  const ready =
    current &&
    history?.data?.find((item) => {
      const result = item.chapter_checkpoint_results;
      return (
        item.revision === current.revision &&
        (Array.isArray(result) ? !result.length : !result)
      );
    });
  return (
    <div className="page">
      <h1 className="compact-title">
        {chapter ? "Completion test" : "Completion tests"}
      </h1>
      {status && messages[status] && <p role="status">{messages[status]}</p>}
      {!db && status !== "unavailable" && <p>{messages.unavailable}</p>}
      {chapter && !current && status !== "not-ready" && (
        <p>{messages["not-ready"]}</p>
      )}
      {current && db && (
        <section className="section">
          <h2>{current.scope[0].title}</h2>
          <p>Untimed. All questions carry one mark. Pass with at least 80%.</p>
          {ready ? (
            <Link
              className="button primary"
              href={"/dashboard/checkpoints/" + ready.id}
            >
              Open completion test
            </Link>
          ) : active?.data ? (
            <Link
              className="button primary"
              href={"/dashboard/checkpoints/jobs/" + active.data.id}
            >
              View preparation status
            </Link>
          ) : (
            <form action={startCheckpoint} className="stack-form">
              <input name="paper" type="hidden" value={paper} />
              <input name="chapter" type="hidden" value={chapter} />
              <TestActionButton
                label="Take completion test"
                pendingLabel="Requesting test…"
              />
            </form>
          )}
          <p>
            <Link href={documentUrl(current.scope[0].path)}>
              Back to chapter
            </Link>
          </p>
        </section>
      )}
      {(history?.error || active?.error) && (
        <p role="alert">Some completion test activity could not be loaded.</p>
      )}
      {!!history?.data?.length && (
        <section className="section">
          <h2>Recent completion tests</h2>
          <ul>
            {history.data.map((item) => (
              <li key={item.id}>
                <Link href={"/dashboard/checkpoints/" + item.id}>
                  {getDocument(item.chapter_path)?.title ?? item.chapter_path} ·
                  attempt {item.sequence}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
