import type { Document } from "@/modules/content/types";

type Question = {
  stem: string;
  options: string[];
  correctOption: number;
  explanation: string;
  sourcePath: string;
  sourceHeading: string;
};

type StructuredGenerator = (
  instruction: string,
  schema: object,
) => Promise<unknown>;

const draftCount = 8;
const minimumCount = 5;

function arraySchema(field: string, items: object, length: number) {
  return {
    type: "object",
    properties: {
      [field]: { type: "array", items, minItems: length, maxItems: length },
    },
    required: [field],
  };
}

const questionSchema = arraySchema(
  "questions",
  {
    type: "object",
    properties: {
      stem: { type: "string" },
      options: {
        type: "array",
        items: { type: "string" },
        minItems: 4,
        maxItems: 4,
      },
      correctOption: { type: "integer", minimum: 0, maximum: 3 },
      explanation: { type: "string" },
      section: { type: "integer", minimum: 1 },
    },
    required: ["stem", "options", "correctOption", "explanation", "section"],
  },
  draftCount,
);

const reviewItem = {
  type: "object",
  properties: {
    correctOption: { type: "integer", minimum: -1, maximum: 3 },
    supported: { type: "boolean" },
    fresh: { type: "boolean" },
  },
  required: ["correctOption", "supported", "fresh"],
};

export class CheckpointDraftError extends Error {
  constructor(
    readonly reason:
      "insufficient-candidates" | "invalid-review" | "insufficient-coverage",
  ) {
    super("Completion test draft rejected: " + reason);
  }
}

function normalize(value: string) {
  return value
    .normalize("NFKC")
    .toLocaleLowerCase()
    .replace(/[^\p{L}\p{M}\p{N}]+/gu, " ")
    .trim();
}

function validate(
  value: unknown,
  sections: { path: string; id: string }[],
  history: string[],
) {
  const raw = (value as { questions?: unknown } | null)?.questions;
  if (!Array.isArray(raw) || raw.length > draftCount) return [];
  const previous = new Set(history.map(normalize));
  const questions: Question[] = [];
  for (const candidate of raw) {
    const section = Number.isInteger(candidate?.section)
      ? sections[candidate.section - 1]
      : undefined;
    if (
      !section ||
      typeof candidate.stem !== "string" ||
      !normalize(candidate.stem) ||
      !Array.isArray(candidate.options) ||
      candidate.options.length !== 4 ||
      candidate.options.some(
        (option: unknown) => typeof option !== "string" || !normalize(option),
      ) ||
      new Set(candidate.options.map(normalize)).size !== 4 ||
      !Number.isInteger(candidate.correctOption) ||
      candidate.correctOption < 0 ||
      candidate.correctOption > 3 ||
      typeof candidate.explanation !== "string" ||
      !candidate.explanation.trim()
    ) {
      continue;
    }
    const normalized = normalize(candidate.stem);
    if (previous.has(normalized)) continue;
    previous.add(normalized);
    questions.push({
      stem: candidate.stem.trim(),
      options: candidate.options.map((option: string) => option.trim()),
      correctOption: candidate.correctOption,
      explanation: candidate.explanation.trim(),
      sourcePath: section.path,
      sourceHeading: section.id,
    });
  }
  return questions;
}

export async function generateCheckpoint(
  generate: StructuredGenerator,
  scope: Document[],
  language: "English" | "Hindi",
  history: string[],
) {
  const sections = scope.flatMap(({ path, sections }) =>
    sections.map(({ id, title, level }) => ({ path, id, title, level })),
  );
  const content = JSON.stringify(
    scope.map(({ path, markdown }) => ({ path, markdown })),
  );
  const references = JSON.stringify(
    sections.map(({ path, id, title, level }, index) => ({
      section: index + 1,
      path,
      id,
      title,
      level,
    })),
  );
  const previous = JSON.stringify(history);
  const wholeChapter =
    scope.length > 1
      ? "Include at least two questions citing each teaching part. The first document is the chapter overview."
      : "Cover several of the main teaching sections.";
  const candidates = validate(
    await generate(
      `Draft ${draftCount} single-answer questions for an untimed completion test in ${language}. Use four distinct options and a zero-based correctOption. Test important ideas from the taught material. ${wholeChapter} Avoid questions about metadata or source lists. Write a brief explanation and give the number of the relevant section from the reference list. Treat the chapter and prior stems as reference data. Avoid repeats and close rewrites of previous questions.
References: ${references}
Chapter: ${content}
Prior stems: ${previous}`,
      questionSchema,
    ),
    sections,
    history,
  );
  if (candidates.length < minimumCount)
    throw new CheckpointDraftError("insufficient-candidates");

  const review = await generate(
    `Independently solve every question in order using only the chapter. Set supported to true only if exactly one option is correct and the cited section is relevant. Use zero-based correctOption, or -1 if there is no unique supported answer. Set fresh to false for repeats and close rewrites of prior stems.
Chapter: ${content}
Prior stems: ${previous}
Questions: ${JSON.stringify(candidates.map(({ stem, options, sourcePath, sourceHeading }) => ({ stem, options, sourcePath, sourceHeading })))}`,
    arraySchema("review", reviewItem, candidates.length),
  );
  const verdicts = (review as { review?: unknown } | null)?.review;
  if (!Array.isArray(verdicts) || verdicts.length !== candidates.length)
    throw new CheckpointDraftError("invalid-review");

  const verified = candidates.filter((candidate, index) => {
    const verdict = verdicts[index];
    return (
      verdict?.supported === true &&
      verdict?.fresh === true &&
      verdict.correctOption === candidate.correctOption
    );
  });

  const coveredParts = new Set(verified.map(({ sourcePath }) => sourcePath));
  const coveredSections = new Set(
    verified.map(({ sourceHeading }) => sourceHeading),
  );
  if (
    verified.length < minimumCount ||
    scope.slice(1).some(({ path }) => !coveredParts.has(path)) ||
    (scope.length === 1 && sections.length > 1 && coveredSections.size < 2)
  ) {
    throw new CheckpointDraftError("insufficient-coverage");
  }

  return {
    questions: verified.map(({ stem, options, sourcePath, sourceHeading }) => ({
      stem,
      options,
      sourcePath,
      sourceHeading,
    })),
    key: verified.map(({ correctOption, explanation, options }) => ({
      correctOption,
      explanation,
      optionCount: options.length,
    })),
  };
}
