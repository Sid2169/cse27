import { checkpointDb } from "@/server/assessment/checkpoint-service";
import {
  retainedAnswerBucket,
  type AnswerFile,
} from "@/modules/assessment/chapter-simulation";
import {
  simulationDb,
  simulationEnabled,
} from "@/server/assessment/simulation-service";
import { requireOwner } from "@/server/supabase";
import { encryptBookmarks } from "../../../../../../scripts/bookmark-backup.mjs";

export const runtime = "nodejs";
export const maxDuration = 120;

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
  const simulationsDb = simulationDb();
  const simulations = await simulationsDb?.rpc("export_simulation_records", {
    p_user: user.id,
  });
  if (simulationEnabled && (!simulations?.data || simulations.error)) {
    return new Response("The full simulation backup could not be generated.", {
      status: 503,
    });
  }
  const files: Record<string, { type: string; content: string }> = {};
  if (simulations?.data && simulationsDb) {
    const bucket = simulationsDb.storage.from(retainedAnswerBucket);
    const attempts = simulations.data.simulations as {
      id: string;
      attachments: Record<string, AnswerFile>;
    }[];
    for (const attempt of attempts) {
      const attachments = Object.values(attempt.attachments);
      for (let index = 0; index < attachments.length; index += 4) {
        const batch = await Promise.all(
          attachments.slice(index, index + 4).map(async (file) => {
            if (!file.path.startsWith(user.id + "/" + attempt.id + "/"))
              return null;
            const { data, error } = await bucket.download(file.path);
            if (error || !data) return null;
            return {
              path: file.path,
              type: file.type,
              content: Buffer.from(await data.arrayBuffer()).toString("base64"),
            };
          }),
        );
        for (const file of batch) {
          if (!file)
            return new Response(
              "An answer upload could not be backed up. Retry the export.",
              { status: 503 },
            );
          files[file.path] = { type: file.type, content: file.content };
        }
      }
    }
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
      simulations: simulations?.data ?? undefined,
      simulationFiles: simulations?.data ? files : undefined,
    },
    passphrase,
  );
  let offset = 0;
  const body = new ReadableStream<Uint8Array>({
    pull(controller) {
      if (offset >= backup.length) {
        controller.close();
        return;
      }
      const chunk = backup.subarray(offset, offset + 65536);
      offset += chunk.length;
      controller.enqueue(chunk);
    },
  });
  return new Response(body, {
    headers: {
      "Cache-Control": "private, no-store",
      "Content-Type": "application/octet-stream",
      "Content-Disposition": 'attachment; filename="cse27-bookmarks.enc"',
    },
  });
}
