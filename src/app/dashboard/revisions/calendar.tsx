import Link from "@/components/navigation-link";
import { getDocument, getPaper } from "@/modules/content/catalogue";
import { simulationLink } from "@/modules/assessment/chapter-simulation";

type CalendarTask = {
  day: string;
  chapter_path: string;
  paper_code: string;
  variant: string;
};

const shortDate = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "long",
  timeZone: "UTC",
});
const longMonth = new Intl.DateTimeFormat("en-IN", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});
const weekdays = [
  ["Mon", "Monday"],
  ["Tue", "Tuesday"],
  ["Wed", "Wednesday"],
  ["Thu", "Thursday"],
  ["Fri", "Friday"],
  ["Sat", "Saturday"],
  ["Sun", "Sunday"],
];

function revisionUrl(month: string, day?: string) {
  return (
    "/dashboard/revisions?" +
    new URLSearchParams(day ? { month, day } : { month }) +
    "#revision-calendar"
  );
}

export function RevisionCalendar({
  today,
  requestedMonth,
  requestedDay,
  scheduled,
}: {
  today: string;
  requestedMonth?: string;
  requestedDay?: string;
  scheduled: CalendarTask[];
}) {
  const month =
    typeof requestedMonth === "string" &&
    /^[2-9]\d{3}-(0[1-9]|1[0-2])$/.test(requestedMonth)
      ? requestedMonth
      : today.slice(0, 7);
  const first = new Date(month + "-01T00:00:00Z");
  const year = first.getUTCFullYear();
  const monthIndex = first.getUTCMonth();
  const offset = (first.getUTCDay() + 6) % 7;
  const count = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
  const previous = new Date(Date.UTC(year, monthIndex - 1, 1))
    .toISOString()
    .slice(0, 7);
  const next = new Date(Date.UTC(year, monthIndex + 1, 1))
    .toISOString()
    .slice(0, 7);
  const monthTasks = new Map<string, CalendarTask[]>();
  for (const task of scheduled) {
    if (!task.day.startsWith(month + "-")) continue;
    const sameDay = monthTasks.get(task.day) ?? [];
    sameDay.push(task);
    monthTasks.set(task.day, sameDay);
  }
  const dates = Array.from(
    { length: count },
    (_, i) => month + "-" + String(i + 1).padStart(2, "0"),
  );
  const focused =
    dates.find((day) => day === requestedDay) ??
    (month === today.slice(0, 7)
      ? today
      : (dates.find((day) => monthTasks.has(day)) ?? dates[0]));
  const weeks = Array.from(
    { length: Math.ceil((count + offset) / 7) },
    (_, week) =>
      Array.from(
        { length: 7 },
        (_, weekday) => dates[week * 7 + weekday - offset],
      ),
  );
  const focusedTasks = monthTasks.get(focused) ?? [];
  return (
    <section
      className="section study-card revision-calendar"
      id="revision-calendar"
    >
      <h2>Revision calendar</h2>
      <nav className="simulation-actions" aria-label="Calendar month">
        <Link className="button" href={revisionUrl(previous)}>
          Previous
        </Link>
        {month !== today.slice(0, 7) && (
          <Link className="button" href={revisionUrl(today.slice(0, 7), today)}>
            Today
          </Link>
        )}
        <Link className="button" href={revisionUrl(next)}>
          Next
        </Link>
      </nav>
      <table>
        <caption>{longMonth.format(first)}</caption>
        <thead>
          <tr>
            {weekdays.map(([short, long]) => (
              <th key={short} scope="col" aria-label={long}>
                {short}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week, index) => (
            <tr key={index}>
              {week.map((day, i) => {
                const tasks = day ? (monthTasks.get(day)?.length ?? 0) : 0;
                return (
                  <td key={i}>
                    {day && (
                      <Link
                        href={revisionUrl(month, day)}
                        aria-current={day === focused ? "date" : undefined}
                        aria-label={
                          shortDate.format(new Date(day + "T00:00:00Z")) +
                          ", " +
                          tasks +
                          (tasks === 1 ? " revision" : " revisions") +
                          (day === today ? ", today" : "")
                        }
                      >
                        <span>{Number(day.slice(-2))}</span>
                        {tasks > 0 && <small aria-hidden="true">{tasks}</small>}
                      </Link>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <h3>{shortDate.format(new Date(focused + "T00:00:00Z"))}</h3>
      {focusedTasks.length ? (
        <ul className="study-list">
          {focusedTasks.map((task) => (
            <li key={task.paper_code + task.chapter_path + task.variant}>
              <Link
                href={{
                  ...simulationLink(task.paper_code, task.chapter_path),
                  query: {
                    paper: task.paper_code,
                    chapter: task.chapter_path,
                    scheduledDue: task.day,
                    scheduledVariant: task.variant,
                  },
                }}
              >
                {getDocument(task.chapter_path)?.title ?? task.chapter_path}
              </Link>
              <span>
                {getPaper(task.paper_code)?.title ?? task.paper_code}
                {task.variant && " " + task.variant}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p>No revisions scheduled.</p>
      )}
    </section>
  );
}
