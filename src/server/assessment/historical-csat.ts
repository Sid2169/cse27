import "server-only";
import { createHash } from "node:crypto";
import { officialBooklet } from "@/modules/content/past-papers";
import { getPaper } from "@/modules/content/catalogue";
import type {
  ObjectiveKey,
  ObjectiveQuestion,
} from "@/modules/assessment/chapter-simulation";
import stems from "../../../.generated/csat-2024-stems.json";

const booklet = officialBooklet("Prelims-CSAT", 2024)!;
const answerKey =
  "https://forumias.com/blog/wp-content/uploads/2025/05/AnsKey-CivilServicesPExam-2024-GeneralStudies-II-210525.pdf";

// Transcribed from page 1 of the published UPSC key, Series A, in 20-item columns.
const letters = [
  "BCCDBDCCDBAABCBADCBC",
  "DCDCABDBADDBCADBACDC",
  "CDAABBDADCBCCCCCDDCC",
  "ADCCCDADCDDDACDDADBB",
].join("");

export const csatHistoricalSource = {
  year: 2024,
  series: "A",
  booklet,
  answerKey,
};

export function historicalScope(paper: string, year: string) {
  const definition = getPaper(paper);
  if (
    paper !== "Prelims-CSAT" ||
    year !== "2024" ||
    !definition ||
    !/^[A-D]{80}$/.test(letters)
  )
    return null;
  const guide: ObjectiveKey[] = Array.from(letters, (letter) => ({
    correctOption: "ABCD".indexOf(letter),
    explanation: "The published Series A key gives option " + letter + ".",
  }));
  const questions: ObjectiveQuestion[] = guide.map((_, index) => ({
    // The reader renders only answer-sheet numbers. Indexed stems support comparison with later generated exams.
    stem:
      (stems as Record<string, string>)[String(index + 1)] ??
      "2024 CSAT Series A, question " + (index + 1),
    options: ["A", "B", "C", "D"],
    sourcePath: definition.syllabus,
    sourceHeading: "",
  }));
  return {
    questions,
    guide,
    variants: [""],
    kind: "objective" as const,
    revision: createHash("sha256")
      .update(JSON.stringify([csatHistoricalSource, letters, stems]))
      .digest("hex"),
  };
}
