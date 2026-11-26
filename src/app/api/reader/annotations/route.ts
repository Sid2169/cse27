import { isHighlightColor } from "@/modules/reader/highlight-colors";
import { catalogue, getDocument } from "@/modules/content/catalogue";
import { requireOwner } from "@/server/supabase";

const noStore = { "Cache-Control": "private, no-store" };
function result(data: unknown, status = 200) {
  return Response.json(data, { status, headers: noStore });
}

function chapterPath(path: string) {
  return path.replace(/-part-\d+\.md$/, ".md");
}

export async function GET(request: Request) {
  const { db } = await requireOwner();
  if (process.env.READER_ANNOTATIONS_ENABLED !== "true")
    return result(null, 404);
  const document = getDocument(
    new URL(request.url).searchParams.get("path") ?? "",
  );
  if (document?.kind !== "chapter") return result(null, 400);
  const { data, error, count } = await db
    .from("annotations")
    .select("id,kind,anchor,body,version", { count: "exact" })
    .eq("chapter_path", chapterPath(document.path))
    .order("updated_at", { ascending: false });
  return error || count !== data?.length ? result(null, 503) : result(data);
}

export async function POST(request: Request) {
  const origin = process.env.APP_URL && new URL(process.env.APP_URL).origin;
  if (!origin || request.headers.get("origin") !== origin)
    return result(null, 403);
  const { db } = await requireOwner();
  if (process.env.READER_ANNOTATIONS_ENABLED !== "true")
    return result(null, 404);
  const input = await request.json().catch(() => null);
  if (!input || typeof input.body !== "string" || input.body.length > 8000)
    return result(null, 400);
  const body = input.body.trim();
  const table = db.from("annotations");
  if (input.operation === "edit" || input.operation === "delete") {
    if (
      typeof input.id !== "string" ||
      !/^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(input.id) ||
      !Number.isSafeInteger(input.version) ||
      input.version < 1 ||
      input.version >= 2147483647
    )
      return result(null, 400);
    const change =
      input.operation === "delete" ? table.delete() : table.update({ body });
    const { data, error } = await change
      .eq("id", input.id)
      .eq("version", input.version)
      .select("id");
    if (error) return result(null, error.code === "23514" ? 400 : 503);
    return result(null, data?.length ? 200 : 409);
  }
  if (
    input.operation !== "save" ||
    typeof input.path !== "string" ||
    typeof input.heading !== "string"
  )
    return result(null, 400);
  const document = getDocument(input.path);
  if (
    document?.kind !== "chapter" ||
    document.revision !== input.blob ||
    (input.heading &&
      !document.sections.some((section) => section.id === input.heading))
  )
    return result(null, 409);
  const anchor = {
    version: 1,
    path: document.path,
    heading: input.heading,
    blob: document.revision,
  };
  const range = input.range;
  if (
    range != null &&
    (typeof range.quote !== "string" ||
      !range.quote.trim() ||
      range.quote.length > 2000 ||
      typeof range.prefix !== "string" ||
      range.prefix.length > 160 ||
      typeof range.suffix !== "string" ||
      range.suffix.length > 160)
  )
    return result(null, 400);
  if (input.color !== undefined && (!range || !isHighlightColor(input.color)))
    return result(null, 400);
  if (!range && !body) return result(null, 400);
  const { error } = await table.insert({
    chapter_path: chapterPath(document.path),
    source_commit: catalogue.commit,
    anchor: range
      ? {
          ...anchor,
          quote: range.quote,
          prefix: range.prefix,
          suffix: range.suffix,
          color: input.color ?? "yellow",
        }
      : anchor,
    kind: range ? "highlight" : "note",
    body,
  });
  return result(null, error ? 503 : 201);
}
