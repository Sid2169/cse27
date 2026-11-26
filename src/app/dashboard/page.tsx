import Link from "next/link";
import { getDocument } from "@/modules/content/catalogue";
import { documentUrl } from "@/modules/content/types";
import {
  bookmarkLocation,
  type BookmarkAnchor,
} from "@/modules/reader/bookmarks";
import { requireOwner } from "@/server/supabase";
import { signOut } from "@/app/login/actions";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "My workspace",
  robots: { index: false, follow: false },
};
export default async function Dashboard() {
  const { db } = await requireOwner();
  const recent =
    process.env.READER_POSITIONS_ENABLED === "true"
      ? await db
          .from("reading_positions")
          .select("anchor")
          .order("updated_at", { ascending: false })
          .limit(1)
          .maybeSingle()
      : null;
  const anchor = recent?.data?.anchor as BookmarkAnchor | undefined;
  const document = anchor ? getDocument(anchor.path) : undefined;
  const location = anchor ? bookmarkLocation(anchor, document) : null;
  return (
    <div className="page">
      <p className="eyebrow">MY WORKSPACE</p>
      <h1 className="compact-title">Your study workspace</h1>
      <p className="lead">You are signed in as the verified owner.</p>
      <p className="notice">
        Private reading tools and assessments are being implemented. No study
        results have been recorded.
      </p>
      {recent?.error && (
        <p className="notice" role="alert">
          Reading position could not be loaded.
        </p>
      )}
      {anchor && (
        <section className="section">
          <h2>Continue reading</h2>
          {location && document ? (
            <Link className="button primary" href={location}>
              {document.title}
            </Link>
          ) : (
            <>
              <p className="notice">
                The saved section could not be resolved in the current material.
              </p>
              {document && (
                <Link className="button" href={documentUrl(document.path)}>
                  Open chapter from the start
                </Link>
              )}
            </>
          )}
        </section>
      )}
      <div className="button-row">
        <Link className="button primary" href="/learn">
          Browse learning material
        </Link>
        <Link className="button" href="/library">
          Bookmarks
        </Link>
        <form action={signOut}>
          <button className="button">Sign out</button>
        </form>
      </div>
    </div>
  );
}
