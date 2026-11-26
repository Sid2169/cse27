"use server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { supabase, requireOwner } from "@/server/supabase";
import { configured, isOwner } from "@/modules/auth/policy";
function loginError(code: string): never {
  redirect("/login?error=" + code);
}
async function appOrigin() {
  const raw = process.env.APP_URL;
  if (raw) return new URL(raw).origin;
  const h = await headers();
  if (process.env.NODE_ENV === "production")
    throw new Error("APP_URL is required");
  return "http://" + (h.get("host") ?? "localhost:3000");
}
export async function signIn(form: FormData) {
  if (!configured()) loginError("unconfigured");
  const email = String(form.get("email") ?? "").trim();
  const password = String(form.get("password") ?? "");
  if (
    email.toLowerCase() !== process.env.OWNER_EMAIL?.toLowerCase() ||
    password.length > 256
  )
    loginError("credentials");
  const db = await supabase();
  const { data, error } = await db.auth.signInWithPassword({ email, password });
  if (error || !isOwner(data.user, process.env.OWNER_EMAIL)) {
    await db.auth.signOut();
    loginError("credentials");
  }
  redirect("/dashboard");
}
export async function signUp(form: FormData) {
  if (!configured()) loginError("unconfigured");
  const email = String(form.get("email") ?? "").trim();
  const password = String(form.get("password") ?? "");
  if (
    email.toLowerCase() !== process.env.OWNER_EMAIL?.toLowerCase() ||
    password.length < 12 ||
    password.length > 256
  )
    loginError("signup");
  const db = await supabase();
  const { error } = await db.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: (await appOrigin()) + "/auth/callback" },
  });
  if (error) loginError("signup");
  redirect("/login?message=confirmation");
}
export async function signInGoogle() {
  if (!configured()) loginError("unconfigured");
  const db = await supabase();
  const { data, error } = await db.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: (await appOrigin()) + "/auth/callback",
      queryParams: { prompt: "select_account" },
    },
  });
  if (error || !data.url) loginError("google");
  redirect(data.url);
}
export async function requestRecovery(form: FormData) {
  if (!configured()) loginError("unconfigured");
  const email = String(form.get("email") ?? "").trim();
  if (email.toLowerCase() === process.env.OWNER_EMAIL?.toLowerCase()) {
    const db = await supabase();
    await db.auth.resetPasswordForEmail(email, {
      redirectTo: (await appOrigin()) + "/auth/callback?next=/auth/recovery",
    });
  }
  redirect("/login?message=recovery");
}
export async function updatePassword(form: FormData) {
  const { db } = await requireOwner();
  const password = String(form.get("password") ?? "");
  if (password.length < 12 || password.length > 256)
    redirect("/auth/recovery?error=password");
  const { error } = await db.auth.updateUser({ password });
  if (error) redirect("/auth/recovery?error=failed");
  await db.auth.signOut();
  redirect("/login?message=updated");
}
export async function signOut() {
  const db = await supabase();
  await db.auth.signOut();
  redirect("/login");
}
