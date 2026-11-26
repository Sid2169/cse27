import { readFileSync } from "node:fs";
import { bookmarkRestoreSql, decryptBookmarks } from "./bookmark-backup.mjs";

try {
  const [file, ownerId] = process.argv.slice(2);
  if (!file || !ownerId)
    throw new Error(
      "Usage: node scripts/restore-bookmarks.mjs BACKUP_FILE OWNER_UUID",
    );
  const passphrase = readFileSync(0, "utf8").replace(/\r?\n$/, "");
  process.stdout.write(
    bookmarkRestoreSql(
      decryptBookmarks(readFileSync(file), passphrase),
      ownerId,
    ),
  );
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
