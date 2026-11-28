import type { MarkedAnswer, SimulationQuestion } from "./chapter-simulation";

export function reviewMaterial(
  question: SimulationQuestion | undefined,
  feedback: MarkedAnswer | undefined,
  index: number,
) {
  if (!question || !feedback || feedback.excluded || !question.stem.trim())
    return null;
  if ("options" in question && question.options.join("") === "ABCD")
    return null;
  const label =
    ("label" in question && question.label) || "Question " + (index + 1);
  const notes =
    "options" in question
      ? question.options
          .map((option, i) => "ABCD"[i] + ". " + option)
          .join("\n")
      : "";
  return {
    id: "review-question-" + (index + 1),
    label,
    text: [question.stem, notes, feedback.feedback]
      .filter(Boolean)
      .join("\n\n"),
  };
}
