import Link from "next/link";
import { requireOwner } from "@/server/supabase";
import { signOut } from "@/app/login/actions";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "My workspace",
  robots: { index: false, follow: false },
};
export default async function Dashboard() {
  await requireOwner();
  return (
    <div className="page">
      <p className="eyebrow">MY WORKSPACE</p>
      <h1 className="compact-title">Your study workspace</h1>
      <p className="lead">You are signed in as the verified owner.</p>
      <p className="notice">
        Private reading tools and assessments are being implemented. No study
        results have been recorded.
      </p>
      <div className="button-row">
        <Link className="button primary" href="/">
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
