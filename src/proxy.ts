import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { configured, isOwner } from "@/modules/auth/policy";
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  response.headers.set("Cache-Control", "private, no-store, max-age=0");
  if (!configured()) return response;
  const db = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookieOptions: {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
      },
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(values) {
          values.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          values.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
          response.headers.set("Cache-Control", "private, no-store, max-age=0");
        },
      },
    },
  );
  const {
    data: { user },
  } = await db.auth.getUser();
  const isProtected = /^\/(dashboard|library|settings|api\/reader)(\/|$)/.test(
    request.nextUrl.pathname,
  );
  if (isProtected && !isOwner(user, process.env.OWNER_EMAIL)) {
    const target = new URL("/login", request.url);
    const denied = NextResponse.redirect(target);
    for (const c of response.cookies.getAll()) denied.cookies.set(c);
    denied.headers.set("Cache-Control", "private, no-store");
    return denied;
  }
  return response;
}
export const config = {
  matcher: [
    "/login",
    "/auth/:path*",
    "/dashboard/:path*",
    "/library/:path*",
    "/settings/:path*",
    "/api/reader/:path*",
  ],
};
