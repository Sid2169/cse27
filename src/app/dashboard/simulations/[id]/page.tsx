import { notFound } from "next/navigation";
import Link from "@/components/navigation-link";
import { Markdown } from "@/components/markdown";
import { getDocument } from "@/modules/content/catalogue";
import { documentUrl } from "@/modules/content/types";
import {
  simulationLink,
  simulationStatusLabel,
  type SimulationResult,
} from "@/modules/assessment/chapter-simulation";
import { requireOwner } from "@/server/supabase";
import { checkpointId } from "@/server/assessment/checkpoint-service";
import {
  simulationDb,
  simulationViewFields,
  type SimulationView,
} from "@/server/assessment/simulation-service";
import { TestActionButton } from "../../checkpoints/test-action-button";
import { RefreshCheckpointJob } from "../../checkpoints/jobs/[id]/refresh";
import { Attempt } from "./attempt";
import { retrySimulation } from "../actions";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Chapter exam simulation",
  robots: { index: false, follow: false },
};

function marks(units: number, scale: number) {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(
    units / scale,
  );
}

export default async function ChapterSimulation({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const [{ id }, { error: requestError }, { user }] = await Promise.all([
    params,
    searchParams,
    requireOwner(),
  ]);
  const db = simulationDb();
  if (!db || !checkpointId.test(id)) notFound();
  const loaded = await db
    .from("chapter_simulations")
    .select(simulationViewFields)
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!loaded.data) notFound();
  const simulation = loaded.data as SimulationView;
  const {
    status,
    chapter_path: chapter,
    paper_code: paper,
    unit_scale: scale,
  } = simulation;
  const objective = simulation.kind === "objective";
  const hindi = paper === "Mains-Indian-Language";
  const questions = simulation.questions ?? [];
  const canAnswer =
    status === "ready" || status === "active" || status === "review";
  const waiting = [
    "queued",
    "generating",
    "submitted",
    "extracting",
    "evaluating",
  ].includes(status);
  const canRetry = [
    "queued",
    "submitted",
    "generation-failed",
    "evaluation-failed",
  ].includes(status);
  const resultQuery =
    status === "complete"
      ? await db
          .from("chapter_simulation_results")
          .select("score_units,max_units,feedback,recommendations,next_due")
          .eq("simulation_id", id)
          .maybeSingle()
      : null;
  const result = resultQuery?.data as SimulationResult | null | undefined;
  return (
    <div className="page simulation-page">
      <div className="breadcrumbs">
        <Link href={documentUrl(chapter)}>Chapter</Link>
        <Link href={simulationLink(paper, chapter)}>Exam history</Link>
      </div>
      <h1 className="compact-title">
        {result ? "Exam feedback" : "Chapter exam simulation"}
      </h1>
      <p className="lead">
        {getDocument(chapter)?.title ?? chapter}
        {simulation.paper_variant &&
          " · Mathematics " + simulation.paper_variant}
      </p>
      {requestError === "retry" && (
        <p className="notice" role="alert">
          The request could not be sent. Retry below.
        </p>
      )}
      {!canAnswer && !result && (
        <section className="study-card section">
          <h2 role="status">{simulationStatusLabel(status)}</h2>
          {waiting && (
            <>
              <p>
                Progress updates here automatically. You can leave and return
                from exam history.
              </p>
              <RefreshCheckpointJob />
            </>
          )}
          {status === "generation-failed" && (
            <p>
              A verified question paper could not be prepared. Retry to request
              a new draft.
            </p>
          )}
          {status === "evaluation-failed" && (
            <p>
              Your submission is saved. Retry marking when the service is
              available.
            </p>
          )}
          {status === "complete" && (
            <p role="alert">The saved result could not be loaded.</p>
          )}
          {canRetry && (
            <form action={retrySimulation}>
              <input type="hidden" name="id" value={id} />
              <TestActionButton
                label={waiting ? "Resend request" : "Try again"}
                pendingLabel="Sending request…"
              />
            </form>
          )}
        </section>
      )}
      {canAnswer && (
        <>
          <p>
            {questions.length} questions ·{" "}
            {marks(simulation.max_units ?? 0, scale)} marks ·{" "}
            {objective && simulation.duration_seconds
              ? new Date(simulation.duration_seconds * 1000)
                  .toISOString()
                  .slice(14, 19) + " time limit"
              : Math.ceil((simulation.duration_seconds ?? 0) / 60) +
                " minutes suggested"}
          </p>
          {objective ? (
            <p>
              Each correct answer earns {paper === "Prelims-CSAT" ? "2.5" : "2"}{" "}
              marks. An incorrect answer loses one-third of its marks. Blanks
              earn zero. The timer pauses after loss of connection and submits
              saved answers at expiry.
            </p>
          ) : (
            <p>
              Answer all questions. You manage the time. Marks are awarded
              against a practice rubric for this exam.
            </p>
          )}
          <Attempt
            key={status}
            id={id}
            initialStatus={status}
            initialVersion={simulation.version}
            initialAnswers={simulation.answers}
            remainingMs={simulation.remaining_ms}
            objective={objective}
            clarification={simulation.clarification}
            extracted={simulation.extracted}
            files={Object.fromEntries(
              Object.entries(simulation.attachments).map(([index, file]) => [
                index,
                file.name,
              ]),
            )}
            questions={
              status === "ready"
                ? []
                : questions.map((q) => ({
                    stem: (
                      <div
                        className="prose simulation-stem"
                        lang={hindi ? "hi" : "en"}
                      >
                        <Markdown path={q.sourcePath} source={q.stem} />
                      </div>
                    ),
                    ...("options" in q
                      ? { options: q.options }
                      : { marks: q.marks, wordLimit: q.wordLimit }),
                  }))
            }
          />
        </>
      )}
      {result && (
        <>
          <section className="study-card section">
            <h2>
              {marks(result.score_units, scale)} /{" "}
              {marks(result.max_units, scale)} marks
            </h2>
            <p>{marks((100 * result.score_units) / result.max_units, 1)}%</p>
            {objective && (
              <>
                <p>
                  {result.feedback.correct} correct · {result.feedback.wrong}{" "}
                  incorrect · {result.feedback.blank} blank
                </p>
                <p>
                  Deduction for incorrect answers{" "}
                  {marks(result.feedback.penaltyUnits ?? 0, scale)} marks
                </p>
                {(result.feedback.correct ?? 0) + (result.feedback.wrong ?? 0) >
                  0 && (
                  <p>
                    Attempted accuracy{" "}
                    {marks(
                      (100 * result.feedback.correct!) /
                        (result.feedback.correct! + result.feedback.wrong!),
                      1,
                    )}
                    %
                  </p>
                )}
              </>
            )}
            {result.next_due && (
              <p>
                Next chapter revision{" "}
                <time dateTime={result.next_due}>{result.next_due}</time>
              </p>
            )}
          </section>
          <section className="section">
            <h2>Question feedback</h2>
            <ol className="simulation-feedback">
              {questions.map((q, index) => {
                const item = result.feedback.items[index];
                const answer = simulation.answers[index];
                const file = simulation.attachments[index];
                return (
                  <li key={index} className="study-card">
                    <h3>
                      Question {index + 1} · {marks(item.awarded, 1)}
                      {!objective && " / " + (q as { marks: number }).marks}
                    </h3>
                    <div
                      className="prose simulation-stem"
                      lang={hindi ? "hi" : "en"}
                    >
                      <Markdown path={q.sourcePath} source={q.stem} />
                    </div>
                    {"options" in q && (
                      <p>
                        Your answer{" "}
                        {typeof answer === "number" ? q.options[answer] : "—"}
                      </p>
                    )}
                    {!objective &&
                      typeof answer === "string" &&
                      answer.trim() && (
                        <details>
                          <summary>Your submitted answer</summary>
                          <p className="simulation-submitted">{answer}</p>
                        </details>
                      )}
                    {file && (
                      <p>
                        <a href={"/api/simulations/" + id + "?file=" + index}>
                          Download original answer
                        </a>
                      </p>
                    )}
                    <div
                      className="prose simulation-stem"
                      lang={hindi ? "hi" : "en"}
                    >
                      <Markdown path={q.sourcePath} source={item.feedback} />
                    </div>
                    <Link
                      href={
                        documentUrl(q.sourcePath) +
                        "#" +
                        encodeURIComponent(q.sourceHeading)
                      }
                    >
                      Review chapter section
                    </Link>
                  </li>
                );
              })}
            </ol>
          </section>
          <section className="study-card section">
            <h2>Refresher checklist</h2>
            <ul>
              {result.recommendations.map((entry) => (
                <li key={entry.sourcePath + "#" + entry.sourceHeading}>
                  <Link
                    href={
                      documentUrl(entry.sourcePath) +
                      "#" +
                      encodeURIComponent(entry.sourceHeading)
                    }
                  >
                    {entry.reason}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </div>
  );
}
