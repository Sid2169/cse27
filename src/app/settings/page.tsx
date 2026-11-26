import { requireOwner } from "@/server/supabase";
import { saveReaderPreferences } from "./actions";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Reader settings",
  robots: { index: false, follow: false },
};

const messages: Record<string, string> = {
  saved: "Reader settings saved.",
  conflict:
    "Settings changed in another session. Review the latest values and try again.",
  invalid: "Choose a theme and a text size from 16 to 28.",
  failed: "Settings could not be saved.",
};

export default async function Settings({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { db } = await requireOwner();
  const { status } = await searchParams;
  const preferences =
    process.env.READER_PREFERENCES_ENABLED === "true"
      ? await db
          .from("reading_preferences")
          .select("theme,text_size,version")
          .maybeSingle()
      : null;
  return (
    <div className="page auth-page">
      <h1 className="compact-title">Reader settings</h1>
      {status && messages[status] && <p role="status">{messages[status]}</p>}
      {preferences?.error && <p role="alert">Settings could not be loaded.</p>}
      {!preferences && (
        <p>Synced settings are unavailable in this environment.</p>
      )}
      {preferences && !preferences.error && (
        <form action={saveReaderPreferences} className="stack-form">
          <input
            type="hidden"
            name="version"
            value={preferences.data?.version ?? 0}
          />
          <label>
            Theme
            <select
              name="theme"
              defaultValue={preferences.data?.theme ?? "system"}
            >
              <option value="system">Follow device</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </label>
          <label>
            Reader text size (px)
            <input
              type="number"
              name="textSize"
              min={16}
              max={28}
              required
              defaultValue={preferences.data?.text_size ?? 19}
            />
          </label>
          <button className="button primary">Save settings</button>
        </form>
      )}
    </div>
  );
}
