import {
  fullPaperPercent,
  PaperPerformance,
  percentage,
  type FullPaperResult,
} from "./paper-performance";
import Link from "@/components/navigation-link";
import {
  BookOpen,
  Bookmark,
  CalendarDays,
  ListChecks,
  Settings,
} from "lucide-react";
import { catalogue, getDocument } from "@/modules/content/catalogue";
import { documentUrl } from "@/modules/content/types";
import {
  bookmarkLocation,
  type BookmarkAnchor,
} from "@/modules/reader/bookmarks";
import {
  checkpointDb,
  currentCheckpoint,
} from "@/server/assessment/checkpoint-service";
import { requireOwner } from "@/server/supabase";
import { signOut } from "@/app/login/actions";
import {
  simulationDb,
  simulationEnabled,
  simulationScope,
} from "@/server/assessment/simulation-service";
import {
  simulationLink,
  simulationRoot,
} from "@/modules/assessment/chapter-simulation";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Study dashboard",
  robots: { index: false, follow: false },
};

export default async function Dashboard() {
  const { db, user } = await requireOwner();
  const assessment = checkpointDb();
  const checkpoints = assessment?.from("chapter_checkpoints");
  const historicalQuery = simulationDb()?.rpc(
    "latest_historical_paper_results",
    {
      p_user: user.id,
    },
  );
  const latestUpdatedQuery = simulationDb()?.rpc(
    "latest_updated_paper_results",
    { p_user: user.id },
  );
  const fullHistoryQuery = simulationDb()?.rpc("full_paper_performance", {
    p_user: user.id,
  });
  const latestCumulativeQuery = simulationDb()?.rpc(
    "latest_cumulative_results",
    { p_user: user.id },
  );
  const [recent, qualifications, tasks, jobs, attempts, examTasks] =
    await Promise.all([
      process.env.READER_POSITIONS_ENABLED === "true"
        ? db
            .from("reading_positions")
            .select("anchor")
            .order("updated_at", { ascending: false })
            .limit(1)
            .maybeSingle()
        : null,
      assessment
        ?.from("chapter_checkpoint_qualifications")
        .select("paper_code,chapter_path,revision", { count: "exact" })
        .eq("user_id", user.id),
      assessment
        ?.from("checkpoint_revision_tasks")
        .select("paper_code,chapter_path,revision,due_on", { count: "exact" })
        .eq("user_id", user.id)
        .order("due_on"),
      assessment
        ?.from("checkpoint_generation_jobs")
        .select("id,chapter_path,status")
        .eq("user_id", user.id)
        .in("status", ["queued", "waiting"])
        .order("created_at", { ascending: false })
        .limit(5),
      checkpoints
        ?.select(
          "id,chapter_path,chapter_checkpoint_results(correct,wrong,blank,qualified)",
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5),
      simulationDb()
        ?.from("chapter_simulation_revision_tasks")
        .select(
          "paper_code,paper_variant,chapter_path,revision,due_on,schedule_state",
          {
            count: "exact",
          },
        )
        .eq("user_id", user.id),
    ]);
  const anchor = recent?.data?.anchor as BookmarkAnchor | undefined;
  const chapter = anchor ? getDocument(anchor.path) : undefined;
  const resume = anchor ? bookmarkLocation(anchor, chapter) : null;
  const progressAvailable =
    !!qualifications &&
    !qualifications.error &&
    qualifications.count === qualifications.data?.length;
  const tasksAvailable =
    !!tasks &&
    !tasks.error &&
    tasks.count === tasks.data?.length &&
    (!examTasks ||
      (!examTasks.error && examTasks.count === examTasks.data?.length));
  const isCurrent = (row: {
    paper_code: string;
    chapter_path: string;
    revision: string;
  }) =>
    currentCheckpoint(row.paper_code, row.chapter_path)?.revision ===
    row.revision;
  const qualified = progressAvailable
    ? qualifications.data!.filter(isCurrent)
    : [];
  const scheduled = tasksAvailable
    ? tasks
        .data!.filter(isCurrent)
        .flatMap((task) => {
          const variants = simulationEnabled
            ? (simulationScope(task.paper_code, task.chapter_path)
                ?.variants ?? [""])
            : [""];
          return variants.map((variant) => {
            const currentDue = examTasks?.data?.find(
              (entry) =>
                entry.paper_code === task.paper_code &&
                entry.chapter_path === task.chapter_path &&
                entry.revision === task.revision &&
                entry.paper_variant === variant,
            );
            return {
              ...task,
              variant,
              due_on: currentDue?.due_on ?? task.due_on,
              scheduled: !currentDue || currentDue.schedule_state === "pending",
            };
          });
        })
        .filter((task) => task.scheduled)
        .sort((a, b) => a.due_on.localeCompare(b.due_on))
    : [];

  const fullResponse = await fullHistoryQuery;
  const fullHistory = (fullResponse?.data ?? []) as FullPaperResult[];
  const { data: latestUpdated } = (await latestUpdatedQuery) ?? {};
  const { data: latestHistorical } = (await historicalQuery) ?? {};
  const { data: latestCumulative } = (await latestCumulativeQuery) ?? {};
  return (
    <div className="page study-dashboard">
      <header className="study-heading">
        <div>
          <h1>Study dashboard</h1>
          <p>
            Resume a chapter, check your progress, and see what’s scheduled.
          </p>
        </div>
        <div className="study-actions">
          <Link className="button" href="/library">
            <Bookmark size={16} /> Bookmarks
          </Link>
          {process.env.READER_ANNOTATIONS_ENABLED === "true" && (
            <Link className="button" href="/library/annotations">
              Notes and highlights
            </Link>
          )}
          {process.env.READER_PREFERENCES_ENABLED === "true" && (
            <Link className="button" href="/settings">
              <Settings size={16} /> Settings
            </Link>
          )}
          {simulationEnabled && (
            <Link href={simulationRoot} className="button">
              Exam simulations
            </Link>
          )}
          <form action={signOut}>
            <button className="button">Sign out</button>
          </form>
        </div>
      </header>

      <div className="study-grid">
        <section className="study-card study-reading">
          <BookOpen size={22} aria-hidden="true" />
          <h2>Continue reading</h2>
          <h3>{chapter?.title ?? "Pick up a chapter"}</h3>
          <p>
            {recent?.error
              ? "Your reading position could not be loaded."
              : anchor && !resume
                ? "The saved section could not be located in this version."
                : resume
                  ? "Return to your last saved section."
                  : "Save a location in any chapter to return to it here."}
          </p>
          <Link
            className="button primary"
            href={resume ?? (chapter ? documentUrl(chapter.path) : "/learn")}
          >
            {resume
              ? "Resume reading"
              : chapter
                ? "Open chapter"
                : "Browse learning material"}
          </Link>
        </section>
        <section className="study-card">
          <CalendarDays size={22} aria-hidden="true" />
          <h2>Revision schedule</h2>
          {simulationEnabled && (
            <Link href="/dashboard/revisions">
              View revision schedule and preferences
            </Link>
          )}
          {!tasksAvailable ? (
            <p>
              {assessment
                ? "The schedule could not be loaded."
                : "Scheduling will appear when completion tests are available."}
            </p>
          ) : !scheduled.length ? (
            <p>
              Pass a completion test to schedule the chapter’s first revision.
            </p>
          ) : (
            <ul className="study-list">
              {scheduled.slice(0, 5).map((task) => (
                <li key={task.paper_code + task.chapter_path + task.variant}>
                  <Link
                    href={
                      simulationEnabled
                        ? {
                            ...simulationLink(
                              task.paper_code,
                              task.chapter_path,
                            ),
                            query: {
                              paper: task.paper_code,
                              chapter: task.chapter_path,
                              scheduledDue: task.due_on,
                              scheduledVariant: task.variant,
                            },
                          }
                        : documentUrl(task.chapter_path)
                    }
                  >
                    {getDocument(task.chapter_path)?.title ?? task.chapter_path}
                    {task.variant && " · Mathematics " + task.variant}
                  </Link>
                  <time dateTime={task.due_on}>{task.due_on}</time>
                </li>
              ))}
            </ul>
          )}
          {scheduled.length > 5 && (
            <p>{scheduled.length - 5} more scheduled.</p>
          )}
        </section>
      </div>

      <section className="study-card study-activity">
        <ListChecks size={22} aria-hidden="true" />
        <h2>Completion test activity</h2>
        {jobs?.error || attempts?.error ? (
          <p role="alert">Some completion test activity could not be loaded.</p>
        ) : null}
        {!jobs?.data?.length && !attempts?.data?.length && (
          <p>Completion tests and scores will appear here.</p>
        )}
        <ul className="study-list">
          {jobs?.data?.map((job) => (
            <li key={job.id}>
              <Link href={"/dashboard/checkpoints/jobs/" + job.id}>
                {getDocument(job.chapter_path)?.title ?? job.chapter_path}
              </Link>
              <span>
                {job.status === "waiting" ? "Waiting to retry" : "Queued"}
              </span>
            </li>
          ))}
          {attempts?.data?.map((attempt) => {
            const relation = attempt.chapter_checkpoint_results;
            const result = Array.isArray(relation) ? relation[0] : relation;
            return (
              <li key={attempt.id}>
                <Link href={"/dashboard/checkpoints/" + attempt.id}>
                  {getDocument(attempt.chapter_path)?.title ??
                    attempt.chapter_path}
                </Link>
                <span>
                  {result
                    ? `${result.correct}/${result.correct + result.wrong + result.blank} · ${result.qualified ? "Passed" : "Not passed"}`
                    : "Ready to attempt"}
                </span>
              </li>
            );
          })}
        </ul>
        {assessment && (
          <Link className="button" href="/dashboard/checkpoints">
            Completion test history
          </Link>
        )}
      </section>

      {fullResponse?.error && (
        <p role="alert">Full-paper results could not be loaded.</p>
      )}
      <div className="study-papers">
        {catalogue.papers.flatMap((paper) =>
          (paper.id === "Mains-Mathematics" ? ["I", "II"] : [""]).flatMap(
            (variant) => {
              const results = fullHistory.filter(
                (result) =>
                  result.paper_code === paper.id &&
                  result.paper_variant === variant,
              );
              return results.length ? (
                <PaperPerformance
                  key={paper.id + variant}
                  title={paper.title + (variant ? " Paper " + variant : "")}
                  results={results}
                />
              ) : (
                []
              );
            },
          ),
        )}
      </div>

      <section aria-labelledby="study-paper-progress">
        <h2 id="study-paper-progress">Paper progress</h2>
        <p>Completion counts chapters passed on their current revision.</p>
        <div className="study-papers">
          {catalogue.papers.map((paper) => {
            const done = qualified.filter(
              (row) => row.paper_code === paper.id,
            ).length;
            const percent = paper.chapters.length
              ? Math.floor((100 * done) / paper.chapters.length)
              : null;
            const latestFull = fullHistory.filter(
              (result, index) =>
                result.paper_code === paper.id &&
                fullHistory.findIndex(
                  (item) =>
                    item.paper_code === paper.id &&
                    item.paper_variant === result.paper_variant,
                ) === index,
            );
            return (
              <Link
                className="study-card study-paper"
                href={"/learn/" + paper.id}
                key={paper.id}
              >
                <h3>{paper.title}</h3>
                {progressAvailable && percent !== null ? (
                  <>
                    <div>
                      <span>
                        {done} of {paper.chapters.length} chapters
                      </span>
                      <strong>{percent}%</strong>
                    </div>
                    <progress
                      value={done}
                      max={paper.chapters.length}
                      aria-label={paper.title + " completion"}
                    />
                  </>
                ) : (
                  <p>Progress unavailable</p>
                )}
                {latestFull.map((result) => (
                  <small key={result.paper_variant}>
                    Latest full-scope {result.paper_variant} ·{" "}
                    {percentage(fullPaperPercent(result))}
                  </small>
                ))}
                {(
                  (latestHistorical ?? []) as {
                    paper_code: string;
                    paper_variant: string;
                    score_units: number;
                    max_units: number;
                  }[]
                )
                  .filter((result) => result.paper_code === paper.id)
                  .map((result) => (
                    <small key={result.paper_variant}>
                      Latest official PYQ {result.paper_variant} ·{" "}
                      {new Intl.NumberFormat("en-IN", {
                        maximumFractionDigits: 1,
                      }).format((100 * result.score_units) / result.max_units)}
                      %
                    </small>
                  ))}
                {(
                  (latestUpdated ?? []) as {
                    paper_code: string;
                    score_units: number;
                    max_units: number;
                  }[]
                )
                  .filter((result) => result.paper_code === paper.id)
                  .map((result) => (
                    <small key={result.paper_code}>
                      Latest updated PYQ ·{" "}
                      {percentage(
                        (100 * result.score_units) / result.max_units,
                      )}
                    </small>
                  ))}
                {(
                  (latestCumulative ?? []) as {
                    paper_code: string;
                    paper_variant: string;
                    score_units: number;
                    max_units: number;
                  }[]
                )
                  .filter((result) => result.paper_code === paper.id)
                  .map((result) => (
                    <small key={result.paper_variant}>
                      Latest cumulative {result.paper_variant} ·{" "}
                      {new Intl.NumberFormat("en-IN", {
                        maximumFractionDigits: 1,
                      }).format((100 * result.score_units) / result.max_units)}
                      %
                    </small>
                  ))}
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
