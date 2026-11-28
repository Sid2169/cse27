import { reviewMaterial } from "@/modules/assessment/refresher-review";
import { getDocument, getPaper } from "@/modules/content/catalogue";
import type { Document } from "@/modules/content/types";
import {
  validateSimulationAnswers,
  type SimulationResult,
  type ObjectiveKey,
  type MarkingGuide,
  type ObjectiveQuestion,
  type SimulationQuestion,
  type WrittenQuestion,
} from "@/modules/assessment/chapter-simulation";
import { checkpointId } from "@/server/assessment/checkpoint-service";
import { generateObjectiveQuestions } from "@/server/assessment/checkpoint-generation";
import {
  geminiGenerator,
  GenerationUnavailable,
} from "@/server/assessment/gemini";
import {
  openRefresher,
  refresherKey,
  sealRefresher,
} from "@/server/assessment/refresher-envelope";
import { simulationDb } from "@/server/assessment/simulation-service";
import {
  generateWrittenSimulation,
  markWrittenSimulation,
  UnresolvedWriting,
} from "@/server/assessment/simulation-generation";
import { requireOwner } from "@/server/supabase";

export const maxDuration = 120;

type Test =
  | { kind: "objective"; questions: ObjectiveQuestion[]; guide: ObjectiveKey[] }
  | {
      kind: "descriptive";
      questions: WrittenQuestion[];
      guide: MarkingGuide[];
    };

function respond(body: object, status = 200) {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "private, no-store" },
  });
}

function material(
  recommendations: SimulationResult["recommendations"],
  questions: SimulationQuestion[],
  feedback: SimulationResult["feedback"],
) {
  if (
    !Array.isArray(recommendations) ||
    !recommendations.length ||
    recommendations.length > 15
  )
    return null;
  const docs = new Map<string, Document>();
  for (const entry of recommendations) {
    const doc = getDocument(entry.sourcePath);
    if (entry.reviewIndex !== undefined && doc) {
      const index = entry.reviewIndex;
      const review = reviewMaterial(
        questions[index],
        feedback?.items?.[index],
        index,
      );
      if (!review) return null;
      const scoped = docs.get(doc.path) ?? {
        ...doc,
        markdown: "",
        sections: [],
      };
      scoped.sections.push({
        id: review.id,
        title: review.label,
        level: 2,
        text: review.text,
      });
      scoped.markdown += "\n" + review.label + "\n" + review.text;
      if (scoped.markdown.length > 65_000) return null;
      docs.set(doc.path, scoped);
      continue;
    }
    if (!doc?.ready) return null;
    const index = doc.sections.findIndex(
      (section) => section.id === entry.sourceHeading,
    );
    if (index < 0) return null;
    const section = doc.sections[index];
    const passages = [section.text];
    for (const child of doc.sections.slice(index + 1)) {
      if (child.level <= section.level) break;
      passages.push(child.title + "\n" + child.text);
    }
    if (!passages.join("").trim()) return null;
    const scoped = docs.get(doc.path) ?? { ...doc, markdown: "", sections: [] };
    if (!scoped.sections.some((item) => item.id === section.id)) {
      scoped.sections.push(section);
      scoped.markdown +=
        "\nSection " +
        section.id +
        " — " +
        section.title +
        "\n" +
        passages.join("\n");
    }
    docs.set(doc.path, scoped);
  }
  return [...docs.values()];
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const origin = process.env.APP_URL
    ? new URL(process.env.APP_URL).origin
    : null;
  if (!origin || request.headers.get("origin") !== origin)
    return respond({ error: "Invalid request." }, 403);
  const { user } = await requireOwner();
  const { id } = await params;
  const db = simulationDb();
  const key = refresherKey();
  if (!db || !key || !checkpointId.test(id))
    return respond({ error: "Refresher unavailable." }, 404);
  const raw = await request.text();
  if (raw.length > 900_000)
    return respond({ error: "Submission is too large." }, 413);
  let input;
  try {
    input = JSON.parse(raw);
  } catch {
    return respond({ error: "Invalid request." }, 400);
  }
  if (!input || !["prepare", "grade"].includes(input.action))
    return respond({ error: "Invalid request." }, 400);

  const simulation = await db
    .from("chapter_simulations")
    .select(
      "paper_code,paper_variant,generation_model,evaluation_model,kind,questions",
    )
    .eq("id", id)
    .eq("user_id", user.id)
    .eq("status", "complete")
    .maybeSingle();
  if (!simulation.data)
    return respond({ error: "Finalized simulation unavailable." }, 404);
  const [completion, result] = await Promise.all([
    db
      .from("chapter_simulation_refreshers")
      .select("completed")
      .eq("simulation_id", id)
      .maybeSingle(),
    db
      .from("chapter_simulation_results")
      .select("recommendations,feedback")
      .eq("simulation_id", id)
      .maybeSingle(),
  ]);
  if (!completion.data || !result.data)
    return respond({ error: "Refresher unavailable." }, 404);
  if (completion.data.completed) return respond({ completed: true });
  const binding = { owner: user.id, simulation: id };
  const row = simulation.data;
  try {
    if (input.action === "prepare") {
      const scope = material(
        result.data.recommendations,
        row.questions ?? [],
        result.data.feedback,
      );
      if (!scope)
        return respond(
          {
            error:
              "Some recommended sections are unavailable. A test covering the full checklist cannot be prepared.",
          },
          409,
        );
      const count = scope.reduce((sum, doc) => sum + doc.sections.length, 0);
      const generate = geminiGenerator(
        row.generation_model === "official-key"
          ? process.env.GEMINI_GENERATION_MODEL
          : row.generation_model,
      );
      let test: Test;
      if (row.kind === "objective") {
        const draft = await generateObjectiveQuestions(generate, scope, [], {
          draftCount: Math.min(15, Math.max(8, count + 3)),
          minimumCount: Math.max(5, count),
          purpose:
            "an English UPSC " +
            (row.paper_code === "Prelims-CSAT" ? "CSAT" : "GS-I") +
            " refresher",
          questionDesign:
            "Test only the recommended sections, with all passages and data necessary to answer.",
          everySection: true,
        });
        test = {
          kind: "objective",
          questions: draft.questions,
          guide: draft.key,
        };
      } else {
        const draft = await generateWrittenSimulation(
          generate,
          scope,
          row.paper_code,
          getPaper(row.paper_code)?.title ?? row.paper_code,
          row.paper_variant,
          Math.max(5, count),
        );
        test = { kind: "descriptive", ...draft };
      }
      return respond({
        token: sealRefresher(key, binding, test),
        kind: test.kind,
        questions: test.questions,
      });
    }

    const test =
      typeof input.token === "string"
        ? openRefresher<Test>(key, binding, input.token)
        : null;
    if (!test)
      return respond(
        { error: "This refresher expired or is invalid. Start a fresh test." },
        410,
      );
    const answers = validateSimulationAnswers(input.answers, test.questions);
    if (!answers)
      return respond({ error: "Check the submitted answers." }, 400);
    let earned: number;
    let possible: number;
    let passed: boolean;
    if (test.kind === "objective") {
      earned = test.guide.filter(
        (item, index) => item.correctOption === answers[index],
      ).length;
      possible = test.questions.length;
      passed = 5 * earned >= 4 * possible;
    } else {
      const items = await markWrittenSimulation(
        geminiGenerator(row.evaluation_model),
        test.questions,
        test.guide,
        answers,
        row.paper_code === "Mains-Indian-Language",
      );
      earned = items.reduce((sum, item) => sum + item.awarded, 0);
      possible = test.questions.reduce((sum, item) => sum + item.marks, 0);
      passed = 20 * earned >= 13 * possible;
    }
    if (passed) {
      const { error } = await db
        .from("chapter_simulation_refreshers")
        .update({ completed: true })
        .eq("simulation_id", id)
        .eq("completed", false);
      if (error)
        return respond(
          { error: "Completion could not be saved. Retry the submission." },
          503,
        );
    }
    return respond({ completed: passed, earned, possible });
  } catch (error) {
    if (error instanceof UnresolvedWriting)
      return respond(
        {
          error:
            "Clarify question " +
            (error.question + 1) +
            " and submit again. " +
            error.request,
        },
        422,
      );
    return respond(
      {
        error:
          error instanceof GenerationUnavailable && error.reason === "quota"
            ? "The model is temporarily over quota. Try again later."
            : "The refresher could not be processed. Try again.",
      },
      503,
    );
  }
}
