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
  const owner = isOwner(user, process.env.OWNER_EMAIL);
  const destination =
    isProtected && !owner
      ? "/login"
      : request.nextUrl.pathname === "/" && owner
        ? "/dashboard"
        : null;
  if (destination) {
    const redirect = NextResponse.redirect(new URL(destination, request.url));
    for (const cookie of response.cookies.getAll())
      redirect.cookies.set(cookie);
    redirect.headers.set("Cache-Control", "private, no-store");
    return redirect;
  }
  return response;
}
export const config = {
  matcher: [
    "/",
    "/login",
    "/auth/:path*",
    "/dashboard/:path*",
    "/library/:path*",
    "/settings/:path*",
    "/api/reader/:path*",
  ],
};
