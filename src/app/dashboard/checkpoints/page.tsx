import Link from "next/link";
import { requireOwner } from "@/server/supabase";
import {
  checkpointDb,
  currentCheckpoint,
} from "@/server/assessment/checkpoint-service";
import { startCheckpoint } from "./actions";

export const metadata = {
  title: "Chapter checkpoints",
  robots: { index: false, follow: false },
};
export const maxDuration = 120;
export const dynamic = "force-dynamic";

const messages: Record<string, string> = {
  quota: "Generation quota is exhausted. Try again later.",
  failed: "A verified checkpoint could not be prepared. Try again later.",
  "not-ready": "The whole chapter is not ready for a checkpoint.",
  unavailable: "Checkpoint generation is unavailable in this environment.",
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
    .select("id,paper_code,chapter_path,sequence,created_at")
    .eq("user_id", user.id);
  if (current && query)
    query = query.eq("paper_code", paper!).eq("chapter_path", chapter!);
  const history = await query
    ?.order("created_at", { ascending: false })
    .limit(50);
  return (
    <div className="page">
      <h1 className="compact-title">Chapter checkpoints</h1>
      {status && messages[status] && <p role="status">{messages[status]}</p>}
      {!db && <p>Checkpoints are unavailable in this environment.</p>}
      {chapter && !current && (
        <p>The whole chapter is not ready for a checkpoint.</p>
      )}
      {current && db && (
        <form action={startCheckpoint} className="stack-form">
          <h2>{current.scope[0].title}</h2>
          <p>Untimed. All questions carry one mark. Pass with at least 80%.</p>
          <input name="paper" type="hidden" value={paper} />
          <input name="chapter" type="hidden" value={chapter} />
          <button className="button primary">Generate fresh checkpoint</button>
        </form>
      )}
      {history?.error && (
        <p role="alert">Checkpoint history could not be loaded.</p>
      )}
      {!!history?.data?.length && (
        <section className="section">
          <h2>Recent checkpoints</h2>
          <ul>
            {history.data.map((item) => (
              <li key={item.id}>
                <Link href={"/dashboard/checkpoints/" + item.id}>
                  {item.chapter_path
                    .split("/")
                    .at(-1)
                    ?.replace(/\.md$/, "")
                    .replaceAll("-", " ")}{" "}
                  · attempt {item.sequence}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
