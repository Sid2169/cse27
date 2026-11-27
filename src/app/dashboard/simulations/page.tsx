import { randomUUID } from "node:crypto";
import Link from "@/components/navigation-link";
import { catalogue, getDocument, getPaper } from "@/modules/content/catalogue";
import { documentUrl } from "@/modules/content/types";
import {
  simulationRoot,
  simulationStatusLabel,
  type SimulationSummary,
} from "@/modules/assessment/chapter-simulation";
import { requireOwner } from "@/server/supabase";
import {
  cumulativeScope,
  simulationDb,
  simulationScope,
} from "@/server/assessment/simulation-service";
import { TestActionButton } from "../checkpoints/test-action-button";
import { requestSimulation } from "./actions";

export const metadata = {
  title: "Chapter exam simulations",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

const errors: Record<string, string> = {
  scope:
    "All parts of the chapter need authored material before you can request an exam simulation.",
  changed: "The chapter changed. Request a test for its current revision.",
  unavailable: "Exam simulation generation is unavailable.",
  request: "The request could not be saved. Try again.",
  qualification:
    "Pass a completion test for a current chapter of this paper before requesting a cumulative exam.",
};

export default async function Simulations({
  searchParams,
}: {
  searchParams: Promise<{ paper?: string; chapter?: string; error?: string }>;
}) {
  const { user } = await requireOwner();
  const { paper, chapter, error } = await searchParams;
  const db = simulationDb();
  const scope =
    typeof paper === "string" && typeof chapter === "string"
      ? simulationScope(paper, chapter)
      : null;
  const selected =
    !chapter && typeof paper === "string" ? getPaper(paper) : null;
  const variants = selected?.id === "Mains-Mathematics" ? ["I", "II"] : [""];
  const cumulative =
    selected && db
      ? await Promise.all(
          variants.map(async (variant) => ({
            variant,
            scope: await cumulativeScope(
              db,
              user.id,
              selected.id,
              variant,
            ).catch(() => undefined),
          })),
        )
      : [];
  let history = db
    ?.from("chapter_simulations")
    .select("id,mode,paper_code,paper_variant,chapter_path,status,created_at")
    .eq("user_id", user.id);
  if (scope && history)
    history = history.eq("paper_code", paper!).eq("chapter_path", chapter!);
  if (selected && history) history = history.eq("paper_code", selected.id);
  const [recent, open] = await Promise.all([
    history?.order("created_at", { ascending: false }).limit(40),
    scope && db
      ? db
          .from("chapter_simulations")
          .select("id,paper_variant,status")
          .eq("user_id", user.id)
          .eq("paper_code", paper!)
          .eq("chapter_path", chapter!)
          .eq("revision", scope.revision)
          .not("status", "in", "(complete,generation-failed)")
      : null,
  ]);
  return (
    <div className="page simulation-page">
      <div className="breadcrumbs">
        <Link href="/dashboard">Dashboard</Link>
        {scope && <Link href={documentUrl(scope.scope[0].path)}>Chapter</Link>}
      </div>
      <h1 className="compact-title">
        {scope ? "Chapter exam simulation" : "Exam simulations"}
      </h1>
      {error && errors[error] && (
        <p className="notice" role="alert">
          {errors[error]}
        </p>
      )}
      {chapter && !scope && error !== "scope" && <p>{errors.scope}</p>}
      {!db && <p>Exam simulations are unavailable.</p>}
      {!chapter && db && (
        <section className="section study-card">
          <h2>Cumulative exam</h2>
          <p>
            Practice only the chapters whose current completion tests you’ve
            passed.
          </p>
          <form action={simulationRoot} className="simulation-actions">
            <label htmlFor="simulation-paper">Paper</label>
            <select
              id="simulation-paper"
              name="paper"
              defaultValue={selected?.id}
              required
            >
              <option value="">Select a paper</option>
              {catalogue.papers.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.stage} · {p.title}
                </option>
              ))}
            </select>
            <button className="button" type="submit">
              Show coverage
            </button>
          </form>
          {selected &&
            cumulative.map(({ variant, scope: eligible }) => (
              <div key={variant}>
                {variant && <h3>Mathematics {variant}</h3>}
                {eligible ? (
                  <form action={requestSimulation}>
                    <input type="hidden" name="mode" value="cumulative" />
                    <input type="hidden" name="paper" value={selected.id} />
                    <input type="hidden" name="variant" value={variant} />
                    <input type="hidden" name="request" value={randomUUID()} />
                    <p>
                      {eligible.coverage.length} qualified{" "}
                      {eligible.coverage.length === 1 ? "chapter" : "chapters"}
                    </p>
                    <TestActionButton
                      label="Prepare cumulative exam"
                      pendingLabel="Requesting exam…"
                    />
                  </form>
                ) : (
                  <p>
                    {eligible === null
                      ? "No chapters qualify yet."
                      : "Could not load qualified chapters."}
                  </p>
                )}
              </div>
            ))}
        </section>
      )}
      {scope && db && (
        <section className="section study-card">
          <h2>{scope.scope[0].title}</h2>
          {scope.kind === "objective" ? (
            <p>
              Timed Prelims practice with autosave and a one-third penalty for
              incorrect answers.
            </p>
          ) : (
            <p>
              Written Mains practice with a suggested duration. Type your
              answers or attach a PDF or photo for each question.
            </p>
          )}
          <div className="simulation-actions">
            {scope.variants.map((variant) => {
              const pending = open?.data?.find(
                (item) => item.paper_variant === variant,
              );
              const suffix = variant ? " · Mathematics " + variant : "";
              return pending ? (
                <Link
                  key={variant}
                  className="button primary"
                  href={simulationRoot + "/" + pending.id}
                >
                  {pending.status === "ready" ? "Open exam" : "Resume exam"}
                  {suffix}
                </Link>
              ) : (
                <form key={variant} action={requestSimulation}>
                  <input type="hidden" name="paper" value={paper} />
                  <input type="hidden" name="chapter" value={chapter} />
                  <input type="hidden" name="variant" value={variant} />
                  <input type="hidden" name="request" value={randomUUID()} />
                  <TestActionButton
                    label={"Prepare exam" + suffix}
                    pendingLabel="Requesting exam…"
                  />
                </form>
              );
            })}
          </div>
        </section>
      )}
      {(recent?.error || open?.error) && (
        <p role="alert">Some exam history could not be loaded.</p>
      )}
      <section className="section">
        <h2>Exam history</h2>
        {!recent?.data?.length && (
          <p>
            {scope
              ? "No exams recorded for this chapter."
              : "Open a ready chapter and choose Exam simulation to prepare a test."}
          </p>
        )}
        <ul className="study-list">
          {(recent?.data as SimulationSummary[] | null)?.map((item) => (
            <li key={item.id}>
              <Link href={simulationRoot + "/" + item.id}>
                {item.mode === "cumulative"
                  ? (getPaper(item.paper_code)?.title ?? item.paper_code) +
                    " · Cumulative"
                  : (getDocument(item.chapter_path)?.title ??
                    item.chapter_path)}
                {item.paper_variant && " · Mathematics " + item.paper_variant}
              </Link>
              <span>
                {simulationStatusLabel(item.status)} ·{" "}
                {item.created_at.slice(0, 10)}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
