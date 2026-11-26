import Link from "next/link";
import { notFound } from "next/navigation";
import { requireOwner } from "@/server/supabase";
import { documentUrl } from "@/modules/content/types";
import {
  checkpointDb,
  checkpointId,
  currentCheckpoint,
  type PublicQuestion,
} from "@/server/assessment/checkpoint-service";
import { submitCheckpoint } from "../actions";
import { CheckpointTimezone } from "./timezone";

export const metadata = {
  title: "Chapter checkpoint",
  robots: { index: false, follow: false },
};

export default async function Attempt({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ status?: string }>;
}) {
  const { user } = await requireOwner();
  const { id } = await params;
  const { status } = await searchParams;
  const db = checkpointDb();
  if (!db || !checkpointId.test(id)) notFound();
  const { data: checkpoint } = await db
    .from("chapter_checkpoints")
    .select("paper_code,chapter_path,sequence,revision,questions")
    .eq("user_id", user.id)
    .eq("id", id)
    .maybeSingle();
  if (!checkpoint) notFound();
  const { data: result, error } = await db
    .from("chapter_checkpoint_results")
    .select("*")
    .eq("checkpoint_id", id)
    .maybeSingle();
  const questions = checkpoint.questions as PublicQuestion[];
  const title =
    checkpoint.paper_code +
    "-CP-" +
    checkpoint.chapter_path.split("/").at(-1)?.replace(/\.md$/, "") +
    "-T" +
    String(checkpoint.sequence).padStart(2, "0");
  if (error)
    return (
      <div className="page">
        <p role="alert">Checkpoint result could not be loaded.</p>
      </div>
    );
  if (result) {
    const { data: key } = await db
      .from("chapter_checkpoint_keys")
      .select("answers")
      .eq("checkpoint_id", id)
      .maybeSingle();
    const current =
      currentCheckpoint(checkpoint.paper_code, checkpoint.chapter_path)
        ?.revision === checkpoint.revision;
    return (
      <div className="page">
        <h1 className="compact-title">Checkpoint feedback</h1>
        <p>
          {result.correct} / {result.correct + result.wrong + result.blank} ·{" "}
          {result.qualified ? "Passed" : "Not passed"}
        </p>
        <p>
          {result.correct} correct · {result.wrong} wrong · {result.blank} blank
        </p>
        {!current && (
          <p className="notice">
            This attempt belongs to an earlier chapter revision.
          </p>
        )}
        <ol>
          {questions.map((q, index) => {
            const answer = key?.answers?.[index];
            if (
              !answer ||
              result.responses?.[index]?.[0] === answer.correctOption
            )
              return null;
            return (
              <li key={index} className="section">
                <h2>{q.stem}</h2>
                <p>Correct answer: {q.options[answer.correctOption]}</p>
                <p>{answer.explanation}</p>
                <Link
                  href={
                    documentUrl(q.sourcePath) +
                    "#" +
                    encodeURIComponent(q.sourceHeading)
                  }
                >
                  Review this section
                </Link>
              </li>
            );
          })}
        </ol>
        <Link
          className="button"
          href={{
            pathname: "/dashboard/checkpoints",
            query: {
              paper: checkpoint.paper_code,
              chapter: checkpoint.chapter_path,
            },
          }}
        >
          Checkpoint history and retry
        </Link>
      </div>
    );
  }
  return (
    <div className="page">
      <h1 className="compact-title">Chapter checkpoint</h1>
      <p>{title}</p>
      <p>
        Untimed. Each correct answer earns one mark. A score of at least 80%
        passes.
      </p>
      {status && (
        <p role="alert">
          Submission could not be saved. Review your answers and try again.
        </p>
      )}
      <form action={submitCheckpoint} className="stack-form">
        <input type="hidden" name="id" value={id} />
        <CheckpointTimezone />
        {questions.map((q, index) => (
          <fieldset className="section" key={index}>
            <legend>
              {index + 1}. {q.stem}
            </legend>
            <label>
              <input
                name={"q-" + index}
                type="radio"
                value="blank"
                defaultChecked
              />{" "}
              Leave blank
            </label>
            {q.options.map((option, value) => (
              <label key={value}>
                <input name={"q-" + index} type="radio" value={value} />{" "}
                {option}
              </label>
            ))}
          </fieldset>
        ))}
        <button className="button primary">Submit checkpoint</button>
      </form>
    </div>
  );
}
