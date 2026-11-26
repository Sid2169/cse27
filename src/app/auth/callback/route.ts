import { NextResponse, type NextRequest } from "next/server";
import { supabase } from "@/server/supabase";
import { configured, isOwner, safeNext } from "@/modules/auth/policy";
export async function GET(request: NextRequest) {
  const origin = process.env.APP_URL
    ? new URL(process.env.APP_URL).origin
    : request.nextUrl.origin;
  const fail = () => {
    const r = NextResponse.redirect(
      new URL("/login?error=credentials", origin),
    );
    r.headers.set("Cache-Control", "private, no-store");
    return r;
  };
  if (!configured()) return fail();
  const code = request.nextUrl.searchParams.get("code");
  if (!code) return fail();
  const db = await supabase();
  const { data, error } = await db.auth.exchangeCodeForSession(code);
  if (error || !isOwner(data.user, process.env.OWNER_EMAIL)) {
    await db.auth.signOut();
    return fail();
  }
  const r = NextResponse.redirect(
    new URL(safeNext(request.nextUrl.searchParams.get("next")), origin),
  );
  r.headers.set("Cache-Control", "private, no-store");
  return r;
}
