import {
  choiceField,
  readChoices,
  validateChoices,
  writtenChoice,
  includesQuestion,
} from "@/modules/assessment/written-choices";
import { randomUUID } from "node:crypto";
import {
  answerFileLimit,
  fileMime,
  retainedAnswerBucket,
  validateSimulationAnswers,
  type AnswerFile,
  type SimulationAnswers,
  type SimulationStatus,
} from "@/modules/assessment/chapter-simulation";
import { requireOwner } from "@/server/supabase";
import { checkpointId } from "@/server/assessment/checkpoint-service";
import { dispatchSimulation } from "@/server/assessment/simulation-events";
import {
  simulationDb,
  type SimulationView,
} from "@/server/assessment/simulation-service";

type Context = { params: Promise<{ id: string }> };
type Body = {
  action?: string;
  tab?: string;
  version?: number;
  answers?: SimulationAnswers;
  choices?: unknown;
  timezone?: string;
  question?: string;
};

function json(value: object, status = 200) {
  return Response.json(value, {
    status,
    headers: { "Cache-Control": "private, no-store" },
  });
}

export async function POST(request: Request, { params }: Context) {
  const origin = process.env.APP_URL
    ? new URL(process.env.APP_URL).origin
    : null;
  if (!origin || request.headers.get("origin") !== origin)
    return json({ error: "invalid-origin" }, 403);
  const { id } = await params;
  const { user } = await requireOwner();
  const db = simulationDb();
  if (!db || !checkpointId.test(id)) return json({ error: "not-found" }, 404);
  let input: Body;
  let file: FormDataEntryValue | null = null;
  try {
    if (
      request.headers.get("content-type")?.startsWith("multipart/form-data")
    ) {
      if (
        Number(request.headers.get("content-length")) >
        answerFileLimit + 65536
      )
        return json({ error: "file-size" }, 413);
      const data = await request.formData();
      input = JSON.parse(String(data.get("input") ?? "null"));
      file = data.get("file");
    } else {
      if (Number(request.headers.get("content-length")) > 500_000)
        return json({ error: "invalid-input" }, 413);
      input = await request.json();
    }
  } catch {
    return json({ error: "invalid-input" }, 400);
  }
  if (
    !input ||
    typeof input.tab !== "string" ||
    !checkpointId.test(input.tab) ||
    typeof input.action !== "string" ||
    ![
      "start",
      "pulse",
      "save",
      "submit",
      "attach",
      "detach",
      "confirm",
    ].includes(input.action) ||
    !Number.isSafeInteger(input.version) ||
    input.version! < 0
  )
    return json({ error: "invalid-input" }, 400);

  let answers: SimulationAnswers = {};
  let attachment: AnswerFile | undefined;
  const bucket = db.storage.from(retainedAnswerBucket);
  if (!["pulse", "start"].includes(input.action)) {
    const { data, error } = await db
      .from("chapter_simulations")
      .select(
        "paper_code,mode,kind,status,questions,answers,attachments,clarification,source_details,version",
      )
      .eq("user_id", user.id)
      .eq("id", id)
      .maybeSingle();
    if (error) return json({ error: "unavailable" }, 503);
    if (!data) return json({ error: "not-found" }, 404);
    const simulation = data as Pick<
      SimulationView,
      | "paper_code"
      | "mode"
      | "answers"
      | "kind"
      | "status"
      | "questions"
      | "attachments"
      | "clarification"
      | "source_details"
      | "version"
    >;
    if (["save", "submit", "confirm"].includes(input.action)) {
      const checked = validateSimulationAnswers(
        input.answers,
        simulation.questions ?? [],
      );
      if (!checked) return json({ error: "invalid-answer" }, 400);
      answers = checked;
      const source = simulation.source_details;
      const rule = writtenChoice(
        simulation.paper_code,
        simulation.mode,
        source && "year" in source ? source.year : undefined,
      );
      const choices = rule
        ? validateChoices(
            input.action === "confirm"
              ? readChoices(simulation.answers[choiceField])
              : input.choices,
            rule,
            input.action !== "save",
          )
        : null;
      if (rule && !choices) return json({ error: "invalid-choices" }, 400);
      const chosen = (index: number) =>
        !rule || !choices || includesQuestion(rule, choices, index);
      if (choices && input.action !== "save")
        answers = Object.fromEntries(
          Object.entries(answers).filter(([index]) => chosen(Number(index))),
        );
      if (choices) answers[choiceField] = choices.join(",");
      if (input.action === "confirm") {
        const mustClarify = [
          ...Object.keys(simulation.attachments).filter((index) =>
            chosen(Number(index)),
          ),
          ...(simulation.clarification
            ? [String(simulation.clarification.question)]
            : []),
        ];
        if (
          mustClarify.some(
            (key) => typeof answers[key] !== "string" || !answers[key].trim(),
          )
        )
          return json({ error: "clarification-needed" }, 400);
      }
    } else {
      if (simulation.kind !== "descriptive" || simulation.status !== "active")
        return json({ error: "closed" }, 409);
      if (simulation.version !== input.version)
        return json({ error: "conflict" }, 409);
      if (
        typeof input.question !== "string" ||
        !/^(0|[1-9]\d{0,3})$/.test(input.question) ||
        !simulation.questions?.[Number(input.question)]
      )
        return json({ error: "invalid-input" }, 400);
      if (input.action === "attach") {
        if (
          !(file instanceof File) ||
          file.size <= 0 ||
          file.size > answerFileLimit
        )
          return json({ error: "file-size" }, 400);
        const bytes = new Uint8Array(await file.arrayBuffer());
        const type = fileMime(bytes);
        if (!type) return json({ error: "file-type" }, 400);
        attachment = {
          path: `${user.id}/${id}/${randomUUID()}`,
          type,
          name: file.name.slice(0, 120),
        };
        const upload = await bucket.upload(attachment.path, bytes, {
          contentType: type,
          upsert: false,
        });
        if (upload.error) return json({ error: "upload-failed" }, 503);
      }
    }
  }

  const updated = await db.rpc("update_chapter_simulation", {
    p_user: user.id,
    p_id: id,
    p_tab: input.tab,
    p_action: input.action,
    p_version: input.version,
    p_answers: answers,
    p_question: input.question ?? null,
    p_attachment: attachment ?? null,
    p_timezone:
      typeof input.timezone === "string" ? input.timezone.slice(0, 80) : null,
  });
  if (updated.error) {
    // The transaction may have committed before a network failure; preserve
    // the object until its reference can be checked.
    return json({ error: "unavailable" }, 503);
  }
  if (!updated.data) return json({ error: "not-found" }, 404);
  const { jobToken, previousFile, ...state } = updated.data as {
    jobToken: string;
    previousFile?: string;
    status: SimulationStatus;
    version: number;
    error: string | null;
  };
  const fileChanged =
    state.status === "active" &&
    state.version === input.version! + 1 &&
    !state.error;
  if (attachment && !fileChanged) await bucket.remove([attachment.path]);
  if (previousFile && fileChanged) await bucket.remove([previousFile]);
  if (state.status === "submitted")
    await dispatchSimulation("mark", { id, token: jobToken });
  return json({
    ...state,
    ...(fileChanged && attachment ? { fileName: attachment.name } : {}),
  });
}

export async function GET(request: Request, { params }: Context) {
  const { id } = await params;
  const question = new URL(request.url).searchParams.get("file");
  const { user } = await requireOwner();
  const db = simulationDb();
  if (
    !db ||
    !checkpointId.test(id) ||
    !question ||
    !/^(0|[1-9]\d{0,3})$/.test(question)
  )
    return json({ error: "not-found" }, 404);
  const { data } = await db
    .from("chapter_simulations")
    .select("attachments")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();
  const file = data?.attachments?.[question] as AnswerFile | undefined;
  if (!file || !file.path.startsWith(`${user.id}/${id}/`))
    return json({ error: "not-found" }, 404);
  const downloaded = await db.storage
    .from(retainedAnswerBucket)
    .download(file.path);
  if (downloaded.error || !downloaded.data)
    return json({ error: "not-found" }, 404);
  return new Response(downloaded.data, {
    headers: {
      "Cache-Control": "private, no-store",
      "Content-Type": file.type,
      "Content-Disposition": `attachment; filename="answer.${file.type === "application/pdf" ? "pdf" : file.type === "image/png" ? "png" : "jpg"}"`,
      "X-Content-Type-Options": "nosniff",
    },
  });
}
