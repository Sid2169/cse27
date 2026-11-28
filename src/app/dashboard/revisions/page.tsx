import Link from "@/components/navigation-link";
import { getDocument } from "@/modules/content/catalogue";
import { simulationLink } from "@/modules/assessment/chapter-simulation";
import { requireOwner } from "@/server/supabase";
import {
  simulationDb,
  simulationScope,
} from "@/server/assessment/simulation-service";
import {
  changeRevisionTask,
  saveChapterOverride,
  saveRevisionPreferences,
} from "./actions";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Chapter revisions",
  robots: { index: false, follow: false },
};

const groups = [
  "Overdue",
  "Due today",
  "Upcoming",
  "Unscheduled",
  "Canceled",
] as const;
type Group = (typeof groups)[number];

const settingChoices = {
  material: [
    "Material type",
    ["generic", "factual", "conceptual", "procedural"],
  ],
  difficulty: ["Difficulty", ["easy", "medium", "hard"]],
  priority: ["Priority", ["high", "unsure", "low"]],
} as const;

type ChapterOptions = Partial<
  Record<keyof typeof settingChoices | "target", string>
>;

export default async function Revisions({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { user } = await requireOwner();
  const { status } = await searchParams;
  const db = simulationDb();
  const [initial, subsequent, preferences, history] = await Promise.all([
    db
      ?.from("checkpoint_revision_tasks")
      .select("paper_code,chapter_path,revision,due_on")
      .eq("user_id", user.id),
    db
      ?.from("chapter_simulation_revision_tasks")
      .select(
        "paper_code,paper_variant,chapter_path,revision,due_on,schedule_state,schedule_source",
      )
      .eq("user_id", user.id),
    db
      ?.from("chapter_revision_preferences")
      .select(
        "timezone,material,difficulty,priority,prelims_target,mains_target,chapter_overrides",
      )
      .eq("user_id", user.id)
      .maybeSingle(),
    db
      ?.from("chapter_revision_task_history")
      .select(
        "id,chapter_path,paper_variant,previous_due,next_due,reason,changed_at",
      )
      .eq("user_id", user.id)
      .order("changed_at", { ascending: false })
      .limit(40),
  ]);
  const prefs = preferences?.data;
  const chapterOverrides = (prefs?.chapter_overrides ?? {}) as Record<
    string,
    ChapterOptions
  >;
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
          current?.schedule_state === "canceled"
            ? "Canceled"
            : current?.schedule_state === "unscheduled"
              ? "Unscheduled"
              : day < today
                ? "Overdue"
                : day === today
                  ? "Due today"
                  : "Upcoming";
        const overrides =
          chapterOverrides[task.paper_code + ":" + task.chapter_path];
        const target =
          overrides?.target ??
          (task.paper_code.startsWith("Prelims-")
            ? prefs?.prelims_target
            : prefs?.mains_target);
        return {
          ...task,
          overrides,
          target,
          variant,
          day,
          group,
          manual: current?.schedule_source === "manual",
        };
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
          {status === "task-saved"
            ? "Revision task updated."
            : status === "saved"
              ? "Revision preferences saved."
              : status === "override-saved"
                ? "Chapter settings saved."
                : status === "override-failed"
                  ? "Chapter settings could not be saved."
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
            {Object.entries(settingChoices).map(([name, [label, options]]) => (
              <label key={name}>
                {label}
                <select
                  name={name}
                  defaultValue={
                    prefs?.[name as keyof typeof settingChoices] ?? options[0]
                  }
                >
                  {options.map((option) => (
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
                    <div>
                      {getDocument(task.chapter_path)?.title ??
                        task.chapter_path}
                      {task.variant && " · Mathematics " + task.variant}
                      {["Overdue", "Due today", "Upcoming"].includes(group) && (
                        <p>
                          <Link
                            href={{
                              ...simulationLink(
                                task.paper_code,
                                task.chapter_path,
                              ),
                              query: {
                                paper: task.paper_code,
                                chapter: task.chapter_path,
                                scheduledDue: task.day,
                                scheduledVariant: task.variant,
                              },
                            }}
                          >
                            Start scheduled exam
                          </Link>
                          {" · "}
                          <time dateTime={task.day}>{task.day}</time>
                          {task.manual && " · Manual"}
                        </p>
                      )}
                      {task.manual &&
                        task.target &&
                        task.day >= task.target &&
                        group !== "Canceled" && (
                          <p>
                            Manual date is on or after the target of{" "}
                            <time dateTime={task.target}>{task.target}</time>.
                          </p>
                        )}
                      {group === "Unscheduled" && (
                        <p>No further revision fits before the target.</p>
                      )}
                    </div>
                    <div>
                      <details>
                        <summary>Chapter scheduling settings</summary>
                        <form
                          className="stack-form"
                          action={saveChapterOverride}
                        >
                          <input
                            type="hidden"
                            name="paper"
                            value={task.paper_code}
                          />
                          <input
                            type="hidden"
                            name="chapter"
                            value={task.chapter_path}
                          />
                          {Object.entries(settingChoices).map(
                            ([name, [label, options]]) => (
                              <label key={name}>
                                {label}
                                <select
                                  name={name}
                                  defaultValue={
                                    task.overrides?.[
                                      name as keyof typeof settingChoices
                                    ] ?? ""
                                  }
                                >
                                  <option value="">Use default</option>
                                  {options.map((option) => (
                                    <option key={option} value={option}>
                                      {option}
                                    </option>
                                  ))}
                                </select>
                              </label>
                            ),
                          )}
                          <label>
                            Chapter target date
                            <input
                              name="target"
                              type="date"
                              defaultValue={task.overrides?.target ?? ""}
                            />
                          </label>
                          {task.variant && (
                            <p>
                              These settings apply to this chapter for both
                              Mathematics papers.
                            </p>
                          )}
                          <button className="button">
                            Save chapter settings
                          </button>
                        </form>
                      </details>
                      <details>
                        <summary>Change date</summary>
                        <form
                          className="stack-form"
                          action={changeRevisionTask}
                        >
                          <input
                            type="hidden"
                            name="paper"
                            value={task.paper_code}
                          />
                          <input
                            type="hidden"
                            name="chapter"
                            value={task.chapter_path}
                          />
                          <input
                            type="hidden"
                            name="variant"
                            value={task.variant}
                          />
                          <label>
                            Due date
                            <input
                              type="date"
                              name="date"
                              defaultValue={task.day}
                              required
                            />
                          </label>
                          <button
                            type="submit"
                            className="button"
                            name="operation"
                            value="reschedule"
                          >
                            Save date
                          </button>
                          {group !== "Canceled" && (
                            <button
                              type="submit"
                              className="button"
                              name="operation"
                              value="cancel"
                              formNoValidate
                            >
                              Cancel schedule
                            </button>
                          )}
                        </form>
                      </details>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )
        );
      })}
      {!!history?.data?.length && (
        <details className="section">
          <summary>Recent schedule changes</summary>
          <ul className="study-list">
            {history.data.map((event) => (
              <li key={event.id}>
                <span>
                  {getDocument(event.chapter_path)?.title ?? event.chapter_path}
                  {event.paper_variant &&
                    " · Mathematics " + event.paper_variant}
                </span>
                <span>
                  {event.reason} · {event.previous_due ?? "Unscheduled"} →{" "}
                  {event.next_due ?? "Unscheduled"}
                </span>
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
