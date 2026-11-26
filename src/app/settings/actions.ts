"use server";
import { redirect } from "next/navigation";
import { requireOwner } from "@/server/supabase";

export async function saveReaderPreferences(form: FormData) {
  const { db, user } = await requireOwner();
  if (process.env.READER_PREFERENCES_ENABLED !== "true") redirect("/settings");
  const theme = String(form.get("theme") ?? "");
  const text_size = Number(form.get("textSize"));
  const version = Number(form.get("version"));
  if (
    !["system", "light", "dark"].includes(theme) ||
    !Number.isInteger(text_size) ||
    text_size < 16 ||
    text_size > 28 ||
    !Number.isSafeInteger(version) ||
    version < 0 ||
    version >= 2147483647
  ) {
    redirect("/settings?status=invalid");
  }
  const table = db.from("reading_preferences");
  const change =
    version === 0
      ? table.insert({ theme, text_size })
      : table
          .update({ theme, text_size })
          .eq("user_id", user.id)
          .eq("version", version);
  const { data, error } = await change.select("version");
  const status =
    error?.code === "23505" || (!error && !data?.length)
      ? "conflict"
      : error
        ? "failed"
        : "saved";
  redirect("/settings?status=" + status);
}
