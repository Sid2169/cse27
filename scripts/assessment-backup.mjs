import { randomUUID } from "node:crypto";

const uuid = "[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}";
const objectPath = new RegExp("^" + uuid + "/" + uuid + "/" + uuid + "$", "i");
const media = ["application/pdf", "image/jpeg", "image/png"];

const tables = [
  ["simulations", "chapter_simulations", true],
  ["guides", "chapter_simulation_guides", false],
  ["results", "chapter_simulation_results", false],
  ["refreshers", "chapter_simulation_refreshers", false],
  ["batches", "cumulative_simulation_batches", false],
  ["revisionTasks", "chapter_simulation_revision_tasks", true],
  ["revisionPreferences", "chapter_revision_preferences", true],
  ["revisionHistory", "chapter_revision_task_history", true],
];

export function assessmentRestore(payload, ownerId) {
  if (!new RegExp("^" + uuid + "$", "i").test(ownerId))
    throw new Error("Invalid destination owner.");
  if (payload.simulations === undefined) return { sql: "", files: [] };
  for (const [key] of tables) {
    if (!Array.isArray(payload.simulations[key]))
      throw new Error("Invalid simulation records in backup.");
  }
  if (!payload.simulationFiles || typeof payload.simulationFiles !== "object")
    throw new Error("Missing answer files in backup.");

  const files = new Map();
  const attempts = payload.simulations.simulations.map((row) => {
    const attachments = Object.fromEntries(
      Object.entries(row.attachments).map(([key, file]) => {
        if (!objectPath.test(file.path) || file.path.split("/")[1] !== row.id)
          throw new Error("Invalid uploaded answer path.");
        const attachment = payload.simulationFiles[file.path];
        if (
          !attachment ||
          !media.includes(attachment.type) ||
          attachment.type !== file.type ||
          typeof attachment.content !== "string"
        )
          throw new Error("Invalid uploaded answer file.");
        const bytes = Buffer.from(attachment.content, "base64");
        if (
          !bytes.length ||
          bytes.length > 2097152 ||
          bytes.toString("base64") !== attachment.content
        )
          throw new Error("Corrupt uploaded answer file.");
        const path = ownerId + file.path.slice(file.path.indexOf("/"));
        files.set(path, { path, bytes, type: attachment.type });
        return [key, { ...file, path }];
      }),
    );
    const resumable = {
      ...row,
      attachments,
      lease_holder: null,
      lease_since: null,
      lease_until: null,
      job_token: randomUUID(),
    };
    if (row.status === "generating") resumable.status = "queued";
    if (["evaluating", "extracting"].includes(row.status))
      resumable.status = "submitted";
    if (
      row.status === "active" &&
      row.kind === "objective" &&
      row.lease_since
    ) {
      const elapsed = Math.max(
        0,
        Math.min(Date.parse(payload.exportedAt), Date.parse(row.lease_until)) -
          Date.parse(row.lease_since),
      );
      resumable.remaining_ms = Math.max(0, row.remaining_ms - elapsed);
      if (!resumable.remaining_ms) {
        resumable.status = "submitted";
        resumable.submitted_at = new Date(
          Date.parse(row.lease_since) + row.remaining_ms,
        ).toISOString();
        resumable.submitted_answers = row.answers;
      }
    }
    return resumable;
  });

  const sql = tables
    .map(([key, table, owns]) => {
      const rows = key === "simulations" ? attempts : payload.simulations[key];
      if (!rows.length) return "";
      const data = Buffer.from(
        JSON.stringify(
          owns ? rows.map((row) => ({ ...row, user_id: ownerId })) : rows,
        ),
      ).toString("base64");
      return `insert into public.${table} select * from jsonb_populate_recordset(null::public.${table},
      convert_from(decode('${data}','base64'),'UTF8')::jsonb);\n`;
    })
    .join("");
  return { sql, files: [...files.values()] };
}
