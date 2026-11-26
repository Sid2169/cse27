import "server-only";
import { createHash } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { catalogue, getPaper } from "@/modules/content/catalogue";
import { checkpointScope } from "@/modules/assessment/checkpoint";

const documents = new Map(catalogue.documents.map((doc) => [doc.path, doc]));

export function currentCheckpoint(paperCode: string, chapterPath: string) {
  const paper = getPaper(paperCode);
  const scope = paper && checkpointScope(paper, chapterPath, documents);
  if (!scope) return null;
  const revision = createHash("sha256")
    .update(JSON.stringify(scope.map((doc) => [doc.path, doc.revision])))
    .digest("hex");
  return { scope, revision };
}

export function checkpointDb() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key || process.env.CHECKPOINTS_ENABLED !== "true") return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }),
    },
  });
}

export const checkpointId = /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i;
export type PublicQuestion = {
  stem: string;
  options: string[];
  sourcePath: string;
  sourceHeading: string;
};
