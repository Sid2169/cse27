import "server-only";
import { createHash } from "node:crypto";
import { officialBooklet } from "@/modules/content/past-papers";
import { getPaper } from "@/modules/content/catalogue";
import type {
  ObjectiveKey,
  ObjectiveQuestion,
} from "@/modules/assessment/chapter-simulation";
import csatStems from "../../../.generated/csat-2024-stems.json";
import gsStems from "../../../.generated/gs1-2024-stems.json";

const booklet = officialBooklet("Prelims-CSAT", 2024)!;
const answerKey =
  "https://forumias.com/blog/wp-content/uploads/2025/05/AnsKey-CivilServicesPExam-2024-GeneralStudies-II-210525.pdf";

// Transcribed from page 1 of the published UPSC key, Series A, in 20-item columns.
const csatLetters = [
  "BCCDBDCCDBAABCBADCBC",
  "DCDCABDBADDBCADBACDC",
  "CDAABBDADCBCCCCCDDCC",
  "ADCCCDADCDDDACDDADBB",
].join("");

const gsLetters = [
  "DADACBABABAADCD",
  "BDBCXCADAAADACA",
  "BDABDADCDCDCDDB",
  "CBCDAAXDBBAXBAC",
  "DACCBDACDADABDC",
  "DDCACCDCBCDBACD",
  "ADABCCDDBB",
].join("");
const gsAnswerKey =
  "https://forumias.com/blog/wp-content/uploads/2025/05/AnsKey-CivilServicesPExam-2024-GeneralStudies-I-210525.pdf";

const csatHistoricalSource = {
  year: 2024,
  series: "A",
  booklet,
  answerKey,
};

const gsHistoricalSource: HistoricalSource = {
  year: 2024,
  series: "A",
  booklet: officialBooklet("Prelims-General-Studies-I", 2024)!,
  answerKey: gsAnswerKey,
  dropped: [20, 52, 57],
};

export type HistoricalSource = {
  year: number;
  series: string;
  booklet: string;
  answerKey: string;
  dropped?: number[];
};

export function historicalScope(paper: string, year: string) {
  if (year !== "2024") return null;
  const definition = getPaper(paper);
  if (!definition) return null;
  const gs = paper === "Prelims-General-Studies-I";
  if (!gs && paper !== "Prelims-CSAT") return null;
  const source: HistoricalSource = gs
    ? gsHistoricalSource
    : csatHistoricalSource;
  const letters = gs ? gsLetters : csatLetters;
  const dropped = Array.from(letters).flatMap((letter, index) =>
    letter === "X" ? [index + 1] : [],
  );
  if (
    !(gs ? /^[A-DX]{100}$/ : /^[A-D]{80}$/).test(letters) ||
    dropped.join() !== (source.dropped ?? []).join()
  )
    throw new Error(
      "Historical answer key does not match the verified booklet",
    );
  const guide: ObjectiveKey[] = Array.from(letters, (letter) => ({
    correctOption: letter === "X" ? null : "ABCD".indexOf(letter),
    explanation:
      letter === "X"
        ? "UPSC dropped this question from scoring."
        : "The published " +
          source.series +
          " key gives option " +
          letter +
          ".",
  }));
  const questions: ObjectiveQuestion[] = guide.map((_, index) => ({
    stem: gs
      ? "2024 GS-I Series A, question " + (index + 1)
      : ((csatStems as Record<string, string>)[String(index + 1)] ??
        "2024 CSAT Series A, question " + (index + 1)),
    options: ["A", "B", "C", "D"],
    sourcePath: definition.syllabus,
    sourceHeading: "",
  }));
  return {
    source,
    questions,
    guide,
    variants: [""],
    kind: "objective" as const,
    maximum: (guide.length - dropped.length) * (gs ? 12 : 15),
    revision: createHash("sha256")
      .update(
        JSON.stringify(gs ? [source, letters] : [source, letters, csatStems]),
      )
      .digest("hex"),
  };
}

// The research transcription is in a different booklet order. Use its stems
// for unseen-item review only, without pairing them with Series A answers.
export const gsHistoricalStems: string[] = gsStems;
