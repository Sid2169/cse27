export function isOwner(
  user: { email?: string; email_confirmed_at?: string } | null,
  ownerEmail: string | undefined,
) {
  return !!(
    user?.email_confirmed_at &&
    ownerEmail &&
    user.email?.toLowerCase() === ownerEmail.toLowerCase()
  );
}
export function safeNext(value: string | null) {
  return value && ["/dashboard", "/auth/recovery", "/library", "/settings"].includes(value)
    ? value
    : "/dashboard";
}
export function configured() {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY &&
    process.env.OWNER_EMAIL
  );
}
