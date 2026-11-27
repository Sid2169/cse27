import { createClient } from "@supabase/supabase-js";
import { assessmentRestore } from "./assessment-backup.mjs";
import { readFileSync } from "node:fs";
import { bookmarkRestoreSql, decryptBookmarks } from "./bookmark-backup.mjs";

try {
  const [file, ownerId] = process.argv.slice(2);
  if (!file || !ownerId)
    throw new Error(
      "Usage: node scripts/restore-bookmarks.mjs BACKUP_FILE OWNER_UUID",
    );
  const passphrase = readFileSync(0, "utf8").replace(/\r?\n$/, "");
  const payload = decryptBookmarks(readFileSync(file), passphrase);
  const assessment = assessmentRestore(payload, ownerId);
  const sql = bookmarkRestoreSql(payload, ownerId, assessment);
  if (assessment.files.length) {
    const url = process.env.RECOVERY_SUPABASE_URL;
    const secret = process.env.RECOVERY_SUPABASE_SECRET_KEY;
    if (!url || !secret)
      throw new Error(
        "Configure the recovery project's Storage credentials before restoring answer files.",
      );
    const client = createClient(url, secret, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const bucket = client.storage.from("chapter-simulation-answers");
    for (const upload of assessment.files) {
      const result = await bucket.upload(upload.path, upload.bytes, {
        contentType: upload.type,
        upsert: false,
      });
      if (!result.error) continue;
      // Permit an exact retry after an interrupted recovery, never overwrite.
      const existing = await bucket.download(upload.path);
      if (
        existing.error ||
        !Buffer.from(await existing.data.arrayBuffer()).equals(upload.bytes)
      )
        throw new Error("An answer file could not be restored safely.");
    }
  }
  process.stdout.write(sql);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
