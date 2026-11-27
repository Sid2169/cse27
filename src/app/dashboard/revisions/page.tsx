import Link from "@/components/navigation-link";
import { getDocument } from "@/modules/content/catalogue";
import { simulationLink } from "@/modules/assessment/chapter-simulation";
import { requireOwner } from "@/server/supabase";
import {
  simulationDb,
  simulationScope,
} from "@/server/assessment/simulation-service";
import { saveRevisionPreferences } from "./actions";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Chapter revisions",
  robots: { index: false, follow: false },
};

const groups = ["Overdue", "Due today", "Upcoming", "Unscheduled"] as const;
type Group = (typeof groups)[number];

export default async function Revisions({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { user } = await requireOwner();
  const { status } = await searchParams;
  const db = simulationDb();
  const [initial, subsequent, preferences] = await Promise.all([
    db
      ?.from("checkpoint_revision_tasks")
      .select("paper_code,chapter_path,revision,due_on")
      .eq("user_id", user.id),
    db
      ?.from("chapter_simulation_revision_tasks")
      .select(
        "paper_code,paper_variant,chapter_path,revision,due_on,schedule_state",
      )
      .eq("user_id", user.id),
    db
      ?.from("chapter_revision_preferences")
      .select(
        "timezone,material,difficulty,priority,prelims_target,mains_target",
      )
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);
  const prefs = preferences?.data;
  const today = new Intl.DateTimeFormat("sv-SE", {
    timeZone: prefs?.timezone ?? "Asia/Kolkata",
  }).format();
  const tasks = (initial?.data ?? [])
    .flatMap((task) => {
      const scope = simulationScope(task.paper_code, task.chapter_path);
      if (!scope || scope.revision !== task.revision) return [];
      return scope.variants.map((variant) => {
        const current = subsequent?.data?.find(
          (row) =>
            row.paper_code === task.paper_code &&
            row.chapter_path === task.chapter_path &&
            row.revision === task.revision &&
            row.paper_variant === variant,
        );
        const day: string = current?.due_on ?? task.due_on;
        const group: Group =
          current?.schedule_state === "unscheduled"
            ? "Unscheduled"
            : day < today
              ? "Overdue"
              : day === today
                ? "Due today"
                : "Upcoming";
        return { ...task, variant, day, group };
      });
    })
    .sort((a, b) => a.day.localeCompare(b.day));
  return (
    <div className="page simulation-page">
      <div className="breadcrumbs">
        <Link href="/dashboard">Dashboard</Link>
      </div>
      <h1 className="compact-title">Chapter revisions</h1>
      {status && (
        <p role="status">
          {status === "saved"
            ? "Revision preferences saved."
            : "Preferences could not be saved. Check the timezone and dates."}
        </p>
      )}
      {!db && <p>Revision scheduling is unavailable.</p>}
      {(initial?.error || subsequent?.error || preferences?.error) && (
        <p role="alert">Some revision data could not be loaded.</p>
      )}
      {db && !preferences?.error && (
        <details className="study-card section">
          <summary>Revision preferences</summary>
          <form className="stack-form" action={saveRevisionPreferences}>
            <label>
              Timezone (IANA name)
              <input
                name="timezone"
                defaultValue={prefs?.timezone ?? "Asia/Kolkata"}
                maxLength={80}
                required
              />
            </label>
            {[
              [
                "material",
                "Material type",
                prefs?.material ?? "generic",
                ["generic", "factual", "conceptual", "procedural"],
              ],
              [
                "difficulty",
                "Difficulty",
                prefs?.difficulty ?? "medium",
                ["easy", "medium", "hard"],
              ],
              [
                "priority",
                "Priority",
                prefs?.priority ?? "unsure",
                ["high", "unsure", "low"],
              ],
            ].map(([name, label, value, options]) => (
              <label key={String(name)}>
                {label}
                <select name={String(name)} defaultValue={String(value)}>
                  {(options as string[]).map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
            ))}
            <label>
              Prelims target date
              <input
                name="prelims"
                type="date"
                defaultValue={prefs?.prelims_target ?? ""}
              />
            </label>
            <label>
              Mains target date
              <input
                name="mains"
                type="date"
                defaultValue={prefs?.mains_target ?? ""}
              />
            </label>
            <button className="button primary">
              Save revision preferences
            </button>
          </form>
        </details>
      )}
      {db && tasks.length === 0 && (
        <p>Pass a chapter completion test to schedule its first revision.</p>
      )}
      {groups.map((group) => {
        const items = tasks.filter((task) => task.group === group);
        return (
          items.length > 0 && (
            <section className="section" key={group}>
              <h2>{group}</h2>
              <ul className="study-list">
                {items.map((task) => (
                  <li key={task.paper_code + task.chapter_path + task.variant}>
                    <Link
                      href={simulationLink(task.paper_code, task.chapter_path)}
                    >
                      {getDocument(task.chapter_path)?.title ??
                        task.chapter_path}
                      {task.variant && " · Mathematics " + task.variant}
                    </Link>
                    {group === "Unscheduled" ? (
                      <span>No further revision fits before the target</span>
                    ) : (
                      <time dateTime={task.day}>{task.day}</time>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )
        );
      })}
    </div>
  );
}
