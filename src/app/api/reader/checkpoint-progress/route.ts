import { requireOwner } from "@/server/supabase";
import { getPaper } from "@/modules/content/catalogue";
import {
  checkpointDb,
  currentCheckpoint,
} from "@/server/assessment/checkpoint-service";

export async function GET(request: Request) {
  const { user } = await requireOwner();
  const paper = getPaper(new URL(request.url).searchParams.get("paper") ?? "");
  const db = checkpointDb();
  if (!paper || !db) return new Response(null, { status: 404 });
  const { data, error, count } = await db
    .from("chapter_checkpoint_qualifications")
    .select("chapter_path,revision", { count: "exact" })
    .eq("user_id", user.id)
    .eq("paper_code", paper.id);
  if (error || count !== data?.length)
    return new Response(null, { status: 503 });
  const qualified = [
    ...new Set(
      data
        .filter(
          (row) =>
            currentCheckpoint(paper.id, row.chapter_path)?.revision ===
            row.revision,
        )
        .map((row) => row.chapter_path),
    ),
  ];
  return Response.json(qualified, {
    headers: { "Cache-Control": "private, no-store" },
  });
}
