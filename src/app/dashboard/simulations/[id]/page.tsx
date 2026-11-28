import { reviewMaterial } from "@/modules/assessment/refresher-review";
import { writtenChoice } from "@/modules/assessment/written-choices";
import { notFound } from "next/navigation";
import Link from "@/components/navigation-link";
import { Markdown } from "@/components/markdown";
import { getDocument, getPaper } from "@/modules/content/catalogue";
import { documentUrl } from "@/modules/content/types";
import {
  simulationLink,
  simulationStatusLabel,
  type SimulationResult,
} from "@/modules/assessment/chapter-simulation";
import type { UpdatedSource } from "@/server/assessment/updated-pyq";
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
import { Refresher } from "./refresher";
import { refresherKey } from "@/server/assessment/refresher-envelope";
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
  searchParams: Promise<{ error?: string; solutions?: string }>;
}) {
  const [{ id }, { error: requestError, solutions }, { user }] =
    await Promise.all([params, searchParams, requireOwner()]);
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
  const historical =
    (simulation.mode === "pyq" || simulation.mode === "updated-pyq") &&
    simulation.source_details &&
    "booklet" in simulation.source_details
      ? simulation.source_details
      : null;
  const updated =
    simulation.mode === "updated-pyq" &&
    historical &&
    "replacements" in historical
      ? (historical as UpdatedSource)
      : null;
  const replacements = new Map(
    updated?.replacements.map((entry) => [entry.number, entry]),
  );
  const evidence =
    simulation.source_details && "sources" in simulation.source_details
      ? simulation.source_details
      : null;
  const full = simulation.mode === "full";
  const cumulative = simulation.mode === "cumulative";
  const choice = writtenChoice(simulation.paper_code, simulation.mode);
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
  const refresher =
    result && refresherKey()
      ? await db
          .from("chapter_simulation_refreshers")
          .select("completed")
          .eq("simulation_id", id)
          .maybeSingle()
      : null;
  const showSolutions = !!result && !objective && solutions === "1";
  const guide = showSolutions
    ? await db
        .from("chapter_simulation_guides")
        .select("guide")
        .eq("simulation_id", id)
        .maybeSingle()
    : null;
  const references = Array.isArray(guide?.data?.guide) ? guide.data.guide : [];
  return (
    <div className="page simulation-page">
      <div className="breadcrumbs">
        {!cumulative && !full && !historical && (
          <Link href={documentUrl(chapter)}>Chapter</Link>
        )}
        <Link href={simulationLink(paper, chapter)}>Exam history</Link>
      </div>
      <h1 className="compact-title">
        {result
          ? "Exam feedback"
          : updated
            ? updated.targetYear + " updated PYQ practice"
            : historical
              ? historical.year + " official past-paper exam"
              : full
                ? "Full-scope exam"
                : cumulative
                  ? "Cumulative exam simulation"
                  : "Chapter exam simulation"}
      </h1>
      <p className="lead">
        {cumulative || full || historical
          ? (getPaper(paper)?.title ?? paper)
          : (getDocument(chapter)?.title ?? chapter)}
        {simulation.paper_variant &&
          " · Mathematics " + simulation.paper_variant}
      </p>
      {full && (
        <p className="notice">
          Diagnostic practice generated from the full paper syllabus. The
          question pattern follows the 2026 baseline.
        </p>
      )}
      {historical && (
        <div className="section study-card">
          <h2>
            Original booklet
            {historical.series && " · Series " + historical.series}
          </h2>
          <a
            className="button"
            href={historical.booklet}
            target="_blank"
            rel="noreferrer"
          >
            Open UPSC’s original PDF
          </a>
          {updated ? (
            <p>
              Model-generated practice for {updated.targetYear} based on the{" "}
              {updated.year} original. Use the original booklet for all numbers
              except{" "}
              {updated.replacements.map(({ number }) => number).join(", ")}.
              Answer the updated questions shown under those numbers on this
              page. Evidence cutoff{" "}
              <time dateTime={updated.cutoff}>{updated.cutoff}</time>.
              Replacements reflect the documented evidence available through
              that date.
            </p>
          ) : objective ? (
            <p>
              Use the original booklet to read the questions. Enter A–D on the
              answer sheet after starting the timer.
            </p>
          ) : (
            <p>
              Read the instructions and questions in the original booklet.
              Submit your responses under its numbered questions for practice
              marking.
            </p>
          )}
          {historical.provisional && (
            <p className="notice">
              This attempt uses UPSC’s provisional key. A later final key may
              differ.
            </p>
          )}
          {!!historical.dropped?.length && (
            <p>
              {historical.excludedSection
                ? `UPSC excluded the ${historical.excludedSection} section (questions ${historical.dropped.at(0)}–${historical.dropped.at(-1)}).`
                : `The published key excludes ${historical.dropped.length} ${historical.dropped.length === 1 ? "question" : "questions"}.`}{" "}
              The practice score is reported against the remaining marks.
            </p>
          )}
          {result && historical.answerKey && (
            <a href={historical.answerKey}>
              {updated
                ? "View the UPSC key for the original booklet"
                : historical.provisional
                  ? "View the provisional UPSC answer key (PDF mirror)"
                  : "View the published UPSC answer key (PDF mirror)"}
            </a>
          )}
        </div>
      )}
      {evidence && (
        <p>
          Current-affairs source cutoff{" "}
          <time dateTime={evidence.cutoff}>{evidence.cutoff}</time>
        </p>
      )}
      {result && evidence && (
        <details className="section">
          <summary>Current-affairs sources</summary>
          <ul>
            {evidence.sources.map((source) => (
              <li key={source.url}>
                <a href={source.url}>{source.title}</a> ·{" "}
                <time dateTime={source.date}>{source.date}</time>
              </li>
            ))}
          </ul>
        </details>
      )}
      {cumulative && (
        <details className="section">
          <summary>
            Coverage · {simulation.coverage.length} qualified chapters
          </summary>
          <ul>
            {simulation.coverage.map(({ path }) => (
              <li key={path}>
                <Link href={documentUrl(path)}>
                  {getDocument(path)?.title ?? path}
                </Link>
              </li>
            ))}
          </ul>
        </details>
      )}
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
              ? Math.floor(simulation.duration_seconds / 60) +
                ":" +
                String(simulation.duration_seconds % 60).padStart(2, "0") +
                " time limit"
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
          ) : choice ? (
            <p>
              {choice === "essay"
                ? "Write two essays of about 1,000–1,200 words each. Choose one topic from each section."
                : choice === "mathematics"
                  ? "Answer Questions 1 and 5 and choose three more with at least one from each section. Label each subpart in your answer."
                  : "Write one essay of about 600 words and answer all remaining questions. Each translation specifies its required answer language."}
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
            choice={choice ?? undefined}
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
                : questions.map((q, index) => ({
                    stem: (
                      <div
                        className="prose simulation-stem"
                        lang={hindi ? "hi" : "en"}
                      >
                        {(!historical || replacements.has(index + 1)) && (
                          <Markdown path={q.sourcePath} source={q.stem} />
                        )}
                      </div>
                    ),
                    ...("options" in q
                      ? { options: q.options }
                      : {
                          marks: q.marks,
                          wordLimit: q.wordLimit,
                          label: q.label,
                        }),
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
            {choice === "language" && (
              <p>
                {result.score_units >= 75
                  ? "Qualifying benchmark met"
                  : "Below the qualifying benchmark"}{" "}
                · 75 of 300 marks
              </p>
            )}
            {objective && (
              <>
                <p>
                  {result.feedback.correct} correct · {result.feedback.wrong}{" "}
                  incorrect · {result.feedback.blank} blank
                  {result.feedback.dropped
                    ? " · " + result.feedback.dropped + " dropped"
                    : ""}
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
            <h2 id="question-feedback">Question feedback</h2>
            {!objective && !showSolutions && (
              <Link
                className="button"
                prefetch={false}
                href="?solutions=1#question-feedback"
              >
                Show model answers
              </Link>
            )}
            {showSolutions &&
              (guide?.error || references.length !== questions.length) && (
                <p role="alert">Some model answers could not be loaded.</p>
              )}
            <ol className="simulation-feedback">
              {questions.map((q, index) => {
                const item = result.feedback.items[index];
                const answer = simulation.answers[index];
                const file = simulation.attachments[index];
                const replacement = replacements.get(index + 1);
                const review = result.recommendations.some(
                  (entry) => entry.reviewIndex === index,
                )
                  ? reviewMaterial(q, item, index)
                  : null;
                return (
                  <li id={review?.id} key={index} className="study-card">
                    <h3>
                      {("label" in q && q.label) || "Question " + (index + 1)} ·{" "}
                      {item.excluded
                        ? objective
                          ? "Dropped"
                          : "Not selected"
                        : marks(item.awarded, 1)}
                      {!objective &&
                        !item.excluded &&
                        " / " + (q as { marks: number }).marks}
                    </h3>
                    <div
                      className="prose simulation-stem"
                      lang={hindi ? "hi" : "en"}
                    >
                      {(!historical || replacements.has(index + 1)) && (
                        <Markdown path={q.sourcePath} source={q.stem} />
                      )}
                    </div>
                    {!!review && "options" in q && (
                      <ol type="A">
                        {q.options.map((option, optionIndex) => (
                          <li key={optionIndex}>{option}</li>
                        ))}
                      </ol>
                    )}
                    {!!review && historical && !objective && (
                      <a
                        href={historical.booklet}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Read this question in the original booklet
                      </a>
                    )}
                    {replacement && (
                      <details>
                        <summary>
                          {replacement.type === "mirror" ? "Mirrored" : "New"}{" "}
                          question and sources
                        </summary>
                        <p>
                          Original question {replacement.number} covered{" "}
                          {replacement.original}.
                        </p>
                        <p>{replacement.rationale}</p>
                        <ul>
                          {replacement.sources.map((source) => (
                            <li key={source.url}>
                              <a href={source.url}>{source.title}</a> ·{" "}
                              <time dateTime={source.date}>{source.date}</time>
                            </li>
                          ))}
                        </ul>
                      </details>
                    )}
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
                    {showSolutions &&
                      typeof references[index]?.reference === "string" && (
                        <details>
                          <summary>Model answer</summary>
                          <div
                            className="prose simulation-stem"
                            lang={hindi ? "hi" : "en"}
                          >
                            <Markdown
                              path={q.sourcePath}
                              source={references[index].reference}
                            />
                          </div>
                        </details>
                      )}
                    <Link
                      href={
                        documentUrl(q.sourcePath) +
                        "#" +
                        encodeURIComponent(q.sourceHeading)
                      }
                    >
                      {full
                        ? "Review paper syllabus"
                        : "Review chapter section"}
                    </Link>
                  </li>
                );
              })}
            </ol>
          </section>
          <section className="study-card section">
            <h2 id="refresher-checklist">Refresher checklist</h2>
            {(full || historical) && (
              <p>
                Review the recommended question feedback or linked study
                sections before starting the combined test.
              </p>
            )}
            <ul>
              {result.recommendations.map((entry) => (
                <li
                  key={
                    entry.reviewIndex ??
                    entry.sourcePath + "#" + entry.sourceHeading
                  }
                >
                  {entry.reviewIndex !== undefined ? (
                    <a href={"#review-question-" + (entry.reviewIndex + 1)}>
                      {entry.reason}
                    </a>
                  ) : (
                    <Link
                      href={
                        documentUrl(entry.sourcePath) +
                        (entry.sourceHeading
                          ? "#" + encodeURIComponent(entry.sourceHeading)
                          : "")
                      }
                    >
                      {entry.reason}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
            {refresher?.data && (
              <Refresher
                id={id}
                objective={objective}
                completed={refresher.data.completed}
              />
            )}
          </section>
        </>
      )}
    </div>
  );
}
