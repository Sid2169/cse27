"use server";

import { redirect } from "next/navigation";
import { catalogue, getDocument } from "@/modules/content/catalogue";
import { requireOwner } from "@/server/supabase";
import type { BookmarkAnchor } from "@/modules/reader/bookmarks";

async function authorizedClient() {
  const { db } = await requireOwner();
  if (process.env.READER_BOOKMARKS_ENABLED !== "true") {
    redirect("/library?status=disabled");
  }
  return db;
}

export async function saveBookmark(form: FormData) {
  const db = await authorizedClient();
  const path = String(form.get("path") ?? "");
  const heading = String(form.get("heading") ?? "");
  const label = String(form.get("label") ?? "").trim();
  const document = getDocument(path);
  if (
    document?.kind !== "chapter" ||
    label.length > 160 ||
    (heading && !document.sections.some((section) => section.id === heading))
  )
    redirect("/library?status=invalid");

  const anchor: BookmarkAnchor = {
    version: 1,
    path,
    heading,
    blob: document.revision,
  };
  const { error } = await db.from("bookmarks").insert({
    chapter_path: path.replace(/-part-\d+\.md$/, ".md"),
    source_commit: catalogue.commit,
    anchor,
    label,
  });
  redirect(error ? "/library?status=failed" : "/library?status=saved");
}

export async function changeBookmark(form: FormData) {
  const db = await authorizedClient();
  const id = String(form.get("id") ?? "");
  const version = Number(form.get("version"));
  const label = String(form.get("label") ?? "").trim();
  const operation = form.get("operation");
  if (
    !/^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(id) ||
    !Number.isSafeInteger(version) ||
    version < 1 ||
    version > 2147483647 ||
    label.length > 160 ||
    (operation !== "delete" && operation !== "rename")
  )
    redirect("/library?status=invalid");
  const table = db.from("bookmarks");
  const mutation =
    operation === "delete" ? table.delete() : table.update({ label });
  const { data, error } = await mutation
    .eq("id", id)
    .eq("version", version)
    .select("id");
  if (error) redirect("/library?status=failed");
  if (!data?.length) redirect("/library?status=conflict");
  redirect("/library?status=saved");
}
