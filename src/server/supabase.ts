import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { configured, isOwner } from "@/modules/auth/policy";
import { redirect } from "next/navigation";
export async function supabase() {
  if (!configured()) throw new Error("Authentication is not configured");
  const jar = await cookies();
  return createServerClient(
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
        getAll: () => jar.getAll(),
        setAll(values) {
          try {
            for (const { name, value, options } of values)
              jar.set(name, value, options);
          } catch {
            /* Server Components cannot set cookies; proxy refreshes them. */
          }
        },
      },
    },
  );
}
export async function requireOwner() {
  if (!configured()) redirect("/login?error=unconfigured");
  const db = await supabase();
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!isOwner(user, process.env.OWNER_EMAIL)) redirect("/login?error=owner");
  return { db, user: user! };
}
