import { AnnotationActions } from "./annotation-actions";
import Link from "@/components/navigation-link";
import { getDocument } from "@/modules/content/catalogue";
import { documentUrl } from "@/modules/content/types";
import {
  bookmarkLocation,
  type BookmarkAnchor,
} from "@/modules/reader/bookmarks";
import { isHighlightColor } from "@/modules/reader/highlight-colors";
import { requireOwner } from "@/server/supabase";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Notes and highlights",
  robots: { index: false, follow: false },
};
const pageSize = 30;

export default async function AnnotationLibrary({
  searchParams,
}: {
  searchParams: Promise<{ chapter?: string; page?: string }>;
}) {
  const { db } = await requireOwner();
  const params = await searchParams;
  const chapter =
    typeof params.chapter === "string"
      ? getDocument(params.chapter)
      : undefined;
  const chapterPath =
    chapter?.kind === "chapter"
      ? chapter.path.replace(/-part-\d+\.md$/, ".md")
      : undefined;
  const requested = Number(params.page ?? 1);
  const page =
    Number.isInteger(requested) && requested >= 1 && requested <= 100000
      ? requested
      : 1;
  const start = (page - 1) * pageSize;
  let query = db
    .from("annotations")
    .select("id,kind,anchor,body,version", { count: "exact" });
  if (chapterPath) query = query.eq("chapter_path", chapterPath);
  const result =
    process.env.READER_ANNOTATIONS_ENABLED === "true"
      ? await query
          .order("updated_at", { ascending: false })
          .order("id")
          .range(start, start + pageSize - 1)
      : null;
  function pageLink(next: number) {
    return {
      pathname: "/library/annotations",
      query: { chapter: chapterPath, page: next },
    };
  }
  return (
    <div className="page">
      <h1 className="compact-title">Notes and highlights</h1>
      {chapterPath && (
        <p>
          {getDocument(chapterPath)?.title} ·{" "}
          <Link href="/library/annotations">View all chapters</Link>
        </p>
      )}
      {!result ? (
        <p>Annotations are unavailable in this environment.</p>
      ) : result.error ? (
        <p role="alert">Notes and highlights could not be loaded.</p>
      ) : !result.data.length ? (
        <p>
          {page === 1
            ? "No notes or highlights yet."
            : "No entries on this page."}
        </p>
      ) : (
        <ul className="annotation-library">
          {result.data.map((row) => {
            const anchor = row.anchor as BookmarkAnchor & {
              quote?: string;
              color?: string;
            };
            const document = getDocument(anchor.path);
            const link = document
              ? (bookmarkLocation(anchor, document) ??
                documentUrl(document.path))
              : null;
            return (
              <li className="study-card" key={row.id}>
                <div className="annotation-card-heading">
                  {row.kind === "highlight" && (
                    <span
                      className="highlight-swatch"
                      data-color={
                        isHighlightColor(anchor.color) ? anchor.color : "yellow"
                      }
                      aria-hidden="true"
                    />
                  )}
                  <strong>
                    {row.kind === "highlight" ? "Highlight" : "Note"}
                  </strong>
                  {link ? (
                    <Link href={link}>{document?.title}</Link>
                  ) : (
                    <span>Original chapter unavailable</span>
                  )}
                </div>
                {anchor.quote && <blockquote>{anchor.quote}</blockquote>}
                {row.body && <p>{row.body}</p>}
                <AnnotationActions
                  key={row.version}
                  id={row.id}
                  version={row.version}
                  body={row.body}
                  color={
                    row.kind === "highlight"
                      ? isHighlightColor(anchor.color)
                        ? anchor.color
                        : "yellow"
                      : undefined
                  }
                />
              </li>
            );
          })}
        </ul>
      )}
      {result && !result.error && (
        <nav className="button-row" aria-label="Annotation pages">
          {page > 1 && (
            <Link className="button" href={pageLink(page - 1)}>
              Previous page
            </Link>
          )}
          {(result.count ?? 0) > start + pageSize && (
            <Link className="button" href={pageLink(page + 1)}>
              Next page
            </Link>
          )}
        </nav>
      )}
    </div>
  );
}
