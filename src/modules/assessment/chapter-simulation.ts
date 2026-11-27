export type SimulationStatus =
  | "queued"
  | "generating"
  | "generation-failed"
  | "ready"
  | "active"
  | "submitted"
  | "extracting"
  | "review"
  | "evaluating"
  | "evaluation-failed"
  | "complete";

export type SectionReference = { sourcePath: string; sourceHeading: string };
export type ObjectiveQuestion = SectionReference & {
  stem: string;
  options: string[];
};
export type WrittenQuestion = SectionReference & {
  label?: string;
  stem: string;
  marks: number;
  wordLimit: number;
};
export type SimulationQuestion = ObjectiveQuestion | WrittenQuestion;
export type ObjectiveKey = { correctOption: number; explanation: string };
export type Criterion = { description: string; marks: number };
export type MarkingGuide = { criteria: Criterion[]; reference: string };
export type MarkedAnswer = {
  awarded: number;
  feedback: string;
  criteria?: number[];
};
export type AnswerFile = { path: string; type: string; name: string };
export type Extraction = { transcript: string; needsClarification: boolean };
export type SimulationAnswers = Record<string, number | string | null>;

export type CoverageChapter = { path: string; revision: string };
export type SimulationMode = "chapter" | "cumulative" | "full" | "pyq";

export type SimulationSummary = {
  mode: SimulationMode;
  id: string;
  paper_code: string;
  paper_variant: string;
  chapter_path: string;
  status: SimulationStatus;
  created_at: string;
};
export type SimulationResult = {
  score_units: number;
  max_units: number;
  feedback: {
    items: MarkedAnswer[];
    correct?: number;
    wrong?: number;
    blank?: number;
    penaltyUnits?: number;
  };
  recommendations: (SectionReference & { reason: string })[];
  next_due: string | null;
};

export const simulationRoot = "/dashboard/simulations";
export const retainedAnswerBucket = "chapter-simulation-answers";
export const answerFileLimit = 2 * 1024 * 1024;
export const answerLengthLimit = 20_000;

export function simulationLink(paper: string, chapter: string) {
  return { pathname: simulationRoot, query: { paper, chapter } };
}

export function mathematicsVariants(markdown: string): string[] {
  const line = markdown.match(/^\*\*Paper:\*\* (.+)$/m)?.[1] ?? "";
  if (/\b(Papers|both)\b/i.test(line)) return ["I", "II"];
  return /\bPaper (I|II)\b/.exec(line)?.slice(1) ?? [];
}

export function scoreObjective(
  paper: string,
  key: ObjectiveKey[],
  answers: SimulationAnswers,
) {
  const correctUnits = paper === "Prelims-CSAT" ? 15 : 12;
  const wrongUnits = correctUnits / 3;
  let correct = 0;
  let wrong = 0;
  let blank = 0;
  const items = key.map((item, index) => {
    const answer = answers[index];
    if (answer == null) {
      blank++;
      return { awarded: 0, feedback: "Unanswered. " + item.explanation };
    }
    if (answer === item.correctOption) {
      correct++;
      return { awarded: correctUnits / 6, feedback: item.explanation };
    }
    wrong++;
    return { awarded: -wrongUnits / 6, feedback: item.explanation };
  });
  return {
    score: correct * correctUnits - wrong * wrongUnits,
    feedback: {
      correct,
      wrong,
      blank,
      penaltyUnits: wrong * wrongUnits,
      items,
    },
  };
}

export function validateSimulationAnswers(
  input: unknown,
  questions: SimulationQuestion[],
) {
  if (!input || typeof input !== "object" || Array.isArray(input)) return null;
  const answers: SimulationAnswers = {};
  for (const [key, value] of Object.entries(input)) {
    if (!/^(0|[1-9]\d{0,3})$/.test(key)) return null;
    const question = questions[Number(key)];
    if (!question) return null;
    if ("options" in question) {
      if (
        value !== null &&
        (typeof value !== "number" ||
          !Number.isInteger(value) ||
          value < 0 ||
          value >= question.options.length)
      )
        return null;
    } else if (typeof value !== "string" || value.length > answerLengthLimit) {
      return null;
    }
    answers[key] = value as string | number | null;
  }
  return answers;
}

export function fileMime(bytes: Uint8Array) {
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff)
    return "image/jpeg";
  if (
    [137, 80, 78, 71, 13, 10, 26, 10].every(
      (byte, index) => bytes[index] === byte,
    )
  )
    return "image/png";
  if ([37, 80, 68, 70, 45].every((byte, index) => bytes[index] === byte))
    return "application/pdf";
  return null;
}

export function simulationStatusLabel(status: SimulationStatus) {
  switch (status) {
    case "queued":
      return "Queued for preparation";
    case "generating":
      return "Preparing the question paper";
    case "ready":
      return "Ready to start";
    case "active":
      return "In progress";
    case "submitted":
      return "Submitted, waiting for marking";
    case "extracting":
      return "Reading uploaded answers";
    case "review":
      return "Confirm extracted answers";
    case "evaluating":
      return "Marking in progress";
    case "complete":
      return "Result available";
    case "generation-failed":
      return "Preparation failed";
    case "evaluation-failed":
      return "Marking failed";
  }
}
