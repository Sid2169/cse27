import { signIn, signUp, signInGoogle, requestRecovery } from "./actions";
import { configured } from "@/modules/auth/policy";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Owner sign in",
  robots: { index: false, follow: false },
};
const errors: Record<string, string> = {
  unconfigured: "Private access is not configured in this environment.",
  owner: "Private features are available only to the verified owner account.",
  credentials:
    "Sign-in failed. Check your credentials and email confirmation. If you normally use Google, use that sign-in method.",
  signup:
    "Account setup failed. Use the approved owner email and a password of 12–256 characters. For an existing account, sign in or recover your password.",
  google: "Google sign-in is unavailable. Check provider configuration.",
};
const messages: Record<string, string> = {
  confirmation:
    "Check your email to confirm the account. If you already have an account, sign in using its existing method.",
  recovery:
    "If the account is eligible, a recovery email has been requested. Email delivery must be configured.",
  updated: "Password updated. Sign in again.",
};
export default async function Login({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const p = await searchParams;
  const ready = configured();
  return (
    <div className="page auth-page">
      <p className="eyebrow">PRIVATE STUDY WORKSPACE</p>
      <h1 className="compact-title">Owner sign in</h1>
      <p className="lead">
        Reading is public. Your notes, study progress and assessments are
        private.
      </p>
      {!ready && (
        <p className="notice">
          Private access is not configured in this environment.
        </p>
      )}
      {p.error && (
        <p className="notice" role="alert">
          {errors[p.error] ?? "Authentication failed. Try signing in again."}
        </p>
      )}
      {p.message && (
        <p className="notice" role="status">
          {messages[p.message] ?? "Request received."}
        </p>
      )}
      <form action={signInGoogle}>
        <button className="button" disabled={!ready}>
          Continue with Google
        </button>
      </form>
      <form action={signIn} className="stack-form">
        <label>
          Email
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            maxLength={254}
          />
        </label>
        <label>
          Password
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            required
            maxLength={256}
          />
        </label>
        <button className="button primary" disabled={!ready}>
          Sign in
        </button>
      </form>
      <details className="auth-details">
        <summary>Set up owner account</summary>
        <p>
          Use the approved email. If it already uses another provider, sign in
          with that provider before changing credentials.
        </p>
        <form action={signUp} className="stack-form">
          <label>
            Account email
            <input name="email" type="email" autoComplete="email" required />
          </label>
          <label>
            New password (12–256 characters)
            <input
              name="password"
              type="password"
              minLength={12}
              maxLength={256}
              autoComplete="new-password"
              required
            />
          </label>
          <button className="button" disabled={!ready}>
            Create owner account
          </button>
        </form>
      </details>
      <details className="auth-details">
        <summary>Recover password</summary>
        <form action={requestRecovery} className="stack-form">
          <label>
            Recovery email
            <input name="email" type="email" required autoComplete="email" />
          </label>
          <button className="button" disabled={!ready}>
            Request recovery email
          </button>
        </form>
      </details>
    </div>
  );
}
