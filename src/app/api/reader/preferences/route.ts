import { requireOwner } from "@/server/supabase";

export async function GET() {
  const { db } = await requireOwner();
  if (process.env.READER_PREFERENCES_ENABLED !== "true")
    return new Response(null, { status: 404 });
  const { data, error } = await db
    .from("reading_preferences")
    .select("theme,text_size")
    .maybeSingle();
  return Response.json(data, {
    status: error ? 503 : 200,
    headers: { "Cache-Control": "private, no-store" },
  });
}
