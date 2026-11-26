import { requireOwner } from "@/server/supabase";
import { updatePassword } from "@/app/login/actions";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Update password",
  robots: { index: false, follow: false },
};
export default async function Recovery({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  await requireOwner();
  const p = await searchParams;
  return (
    <div className="page auth-page">
      <h1 className="compact-title">Update password</h1>
      {p.error && (
        <p className="notice" role="alert">
          Password update failed. Use 12–256 characters and try again.
        </p>
      )}
      <form className="stack-form" action={updatePassword}>
        <label>
          New password
          <input
            name="password"
            type="password"
            minLength={12}
            maxLength={256}
            autoComplete="new-password"
            required
          />
        </label>
        <button className="button primary">Save password</button>
      </form>
    </div>
  );
}
