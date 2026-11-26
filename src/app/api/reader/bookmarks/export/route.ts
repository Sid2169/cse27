import { checkpointDb } from "@/server/assessment/checkpoint-service";
import { requireOwner } from "@/server/supabase";
import { encryptBookmarks } from "../../../../../../scripts/bookmark-backup.mjs";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const origin = process.env.APP_URL
    ? new URL(process.env.APP_URL).origin
    : null;
  if (!origin || request.headers.get("origin") !== origin) {
    return new Response("Invalid request origin.", { status: 403 });
  }
  const { db, user } = await requireOwner();
  if (process.env.READER_BOOKMARKS_ENABLED !== "true") {
    return new Response("Bookmark storage is unavailable.", { status: 503 });
  }
  const passphrase = (await request.formData()).get("passphrase");
  if (
    typeof passphrase !== "string" ||
    passphrase.length < 16 ||
    passphrase.length > 256
  ) {
    return new Response("Use a passphrase of 16–256 characters.", {
      status: 400,
    });
  }
  const { count, data, error } = await db
    .from("bookmarks")
    .select(
      "id,chapter_path,source_commit,anchor,label,version,created_at,updated_at",
      { count: "exact" },
    )
    .order("id");
  if (error || count !== data?.length) {
    return new Response("The complete backup could not be generated.", {
      status: 503,
    });
  }
  const positions =
    process.env.READER_POSITIONS_ENABLED === "true"
      ? await db
          .from("reading_positions")
          .select("chapter_path,source_commit,anchor,version,updated_at", {
            count: "exact",
          })
          .order("chapter_path")
      : null;
  if (
    positions &&
    (positions.error || positions.count !== positions.data?.length)
  ) {
    return new Response("The complete backup could not be generated.", {
      status: 503,
    });
  }
  const annotations =
    process.env.READER_ANNOTATIONS_ENABLED === "true"
      ? await db
          .from("annotations")
          .select(
            "id,chapter_path,source_commit,anchor,kind,body,version,created_at,updated_at",
            { count: "exact" },
          )
          .order("id")
      : null;
  if (
    annotations &&
    (annotations.error || annotations.count !== annotations.data?.length)
  ) {
    return new Response("The complete backup could not be generated.", {
      status: 503,
    });
  }
  const preferences =
    process.env.READER_PREFERENCES_ENABLED === "true"
      ? await db
          .from("reading_preferences")
          .select("theme,text_size,version,updated_at")
      : null;
  if (preferences?.error)
    return new Response("The complete backup could not be generated.", {
      status: 503,
    });
  const assessmentDb = checkpointDb();
  const checkpoints = await assessmentDb?.rpc("export_checkpoint_records", {
    p_user: user.id,
  });
  if (
    process.env.CHECKPOINTS_ENABLED === "true" &&
    (!checkpoints?.data || checkpoints.error)
  ) {
    return new Response("The complete backup could not be generated.", {
      status: 503,
    });
  }
  const backup = encryptBookmarks(
    {
      format: 1,
      exportedAt: new Date().toISOString(),
      bookmarks: data,
      positions: positions?.data ?? undefined,
      annotations: annotations?.data ?? undefined,
      preferences: preferences?.data ?? undefined,
      checkpoints: checkpoints?.data ?? undefined,
    },
    passphrase,
  );
  return new Response(new Uint8Array(backup), {
    headers: {
      "Cache-Control": "private, no-store",
      "Content-Type": "application/octet-stream",
      "Content-Disposition": 'attachment; filename="cse27-bookmarks.enc"',
    },
  });
}
