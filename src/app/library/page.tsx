import Link from "next/link";
import { requireOwner } from "@/server/supabase";
import { getDocument } from "@/modules/content/catalogue";
import {
  bookmarkLocation,
  type BookmarkAnchor,
} from "@/modules/reader/bookmarks";
import { changeBookmark, saveBookmark } from "./actions";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Bookmarks",
  robots: { index: false, follow: false },
};

const messages: Record<string, string> = {
  saved: "Changes saved.",
  invalid: "The chapter, heading, or label is invalid.",
  failed: "The change could not be saved. Try again.",
  conflict:
    "This bookmark changed in another session. Review the latest version and try again.",
};

export default async function Library({
  searchParams,
}: {
  searchParams: Promise<{ path?: string; heading?: string; status?: string }>;
}) {
  const { db } = await requireOwner();
  const { path, heading, status } = await searchParams;
  const enabled = process.env.READER_BOOKMARKS_ENABLED === "true";
  const selected = path ? getDocument(path) : undefined;
  const { data, error } = enabled
    ? await db
        .from("bookmarks")
        .select("id,anchor,label,version")
        .order("updated_at", { ascending: false })
    : { data: null, error: null };

  return (
    <div className="page auth-page">
      <h1 className="compact-title">Bookmarks</h1>
      {!enabled && (
        <p className="notice">Bookmark storage is awaiting activation.</p>
      )}
      {status && messages[status] && (
        <p className="notice" role="status">
          {messages[status]}
        </p>
      )}
      {error && (
        <p className="notice" role="alert">
          Bookmarks could not be loaded.
        </p>
      )}
      {enabled && selected?.kind === "chapter" && (
        <form action={saveBookmark} className="stack-form">
          <h2>{selected.title}</h2>
          <input name="path" type="hidden" value={selected.path} />
          <label>
            Location
            <select
              name="heading"
              defaultValue={
                selected.sections.some((s) => s.id === heading) ? heading : ""
              }
            >
              <option value="">Start of chapter or part</option>
              {selected.sections
                .filter((s) => s.level > 1)
                .map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title}
                  </option>
                ))}
            </select>
          </label>
          <label>
            Label (optional)
            <input name="label" maxLength={160} />
          </label>
          <button className="button primary">Save bookmark</button>
        </form>
      )}
      {enabled && (
        <details className="auth-details">
          <summary>Download encrypted backup</summary>
          <form
            method="post"
            action="/api/reader/bookmarks/export"
            className="stack-form"
          >
            <label>
              Backup passphrase
              <input
                name="passphrase"
                type="password"
                minLength={16}
                maxLength={256}
                required
                autoComplete="new-password"
              />
            </label>
            <button className="button">Download bookmarks</button>
          </form>
        </details>
      )}
      {data?.length === 0 && <p>No saved bookmarks.</p>}
      {data?.map((row) => {
        const anchor = row.anchor as BookmarkAnchor;
        const document = getDocument(anchor.path);
        const href = bookmarkLocation(anchor, document);
        return (
          <section key={row.id} className="section">
            <h2>
              {href ? (
                <Link href={href}>{document?.title}</Link>
              ) : (
                (document?.title ?? anchor.path)
              )}
            </h2>
            {!href && (
              <p>
                Saved location could not be resolved in the current material.
              </p>
            )}
            <form action={changeBookmark} className="stack-form">
              <input name="id" type="hidden" value={row.id} />
              <input name="version" type="hidden" value={row.version} />
              <label>
                Label
                <input name="label" defaultValue={row.label} maxLength={160} />
              </label>
              <div className="button-row">
                <button className="button" name="operation" value="rename">
                  Save label
                </button>
                <button className="button" name="operation" value="delete">
                  Delete
                </button>
              </div>
            </form>
          </section>
        );
      })}
    </div>
  );
}
