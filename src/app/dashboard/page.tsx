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

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Study dashboard",
  robots: { index: false, follow: false },
};

export default async function Dashboard() {
  const { db, user } = await requireOwner();
  const assessment = checkpointDb();
  const checkpoints = assessment?.from("chapter_checkpoints");
  const [recent, qualifications, tasks, jobs, attempts] = await Promise.all([
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
  ]);
  const anchor = recent?.data?.anchor as BookmarkAnchor | undefined;
  const chapter = anchor ? getDocument(anchor.path) : undefined;
  const resume = anchor ? bookmarkLocation(anchor, chapter) : null;
  const progressAvailable =
    !!qualifications &&
    !qualifications.error &&
    qualifications.count === qualifications.data?.length;
  const tasksAvailable =
    !!tasks && !tasks.error && tasks.count === tasks.data?.length;
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
  const scheduled = tasksAvailable ? tasks.data!.filter(isCurrent) : [];

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
          {process.env.READER_PREFERENCES_ENABLED === "true" && (
            <Link className="button" href="/settings">
              <Settings size={16} /> Settings
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
          {!tasksAvailable ? (
            <p>
              {assessment
                ? "The schedule could not be loaded."
                : "Scheduling will appear when checkpoints are available."}
            </p>
          ) : !scheduled.length ? (
            <p>Pass a chapter checkpoint to schedule its first revision.</p>
          ) : (
            <ul className="study-list">
              {scheduled.slice(0, 5).map((task) => (
                <li key={task.paper_code + task.chapter_path}>
                  <Link href={documentUrl(task.chapter_path)}>
                    {getDocument(task.chapter_path)?.title ?? task.chapter_path}
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
        <h2>Checkpoint activity</h2>
        {jobs?.error || attempts?.error ? (
          <p role="alert">Some checkpoint activity could not be loaded.</p>
        ) : null}
        {!jobs?.data?.length && !attempts?.data?.length && (
          <p>Generated checkpoints and scores will appear here.</p>
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
            Checkpoint history
          </Link>
        )}
      </section>

      <section aria-labelledby="study-paper-progress">
        <h2 id="study-paper-progress">Paper progress</h2>
        <p>Completion counts chapters passed on their current revision.</p>
        <div className="study-papers">
          {catalogue.papers.map((paper) => {
            const done = qualified.filter(
              (row) => row.paper_code === paper.id,
            ).length;
            const percent = Math.floor((100 * done) / paper.chapters.length);
            return (
              <Link
                className="study-card study-paper"
                href={"/learn/" + paper.id}
                key={paper.id}
              >
                <h3>{paper.title}</h3>
                {progressAvailable ? (
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
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
