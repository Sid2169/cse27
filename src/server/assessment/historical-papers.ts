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
import gs2025 from "../../../.generated/Prelims-General-Studies-I-2025-stems.json";
import csat2025 from "../../../.generated/Prelims-CSAT-2025-stems.json";

const gs2025Letters = [
  "BAABDCAAAACCBAB",
  "CBDBCBCDDCCACCC",
  "BCBAACDCBBCDCCB",
  "BCDDACCAACDDADB",
  "DADCACCABDBCBAC",
  "BAACDAABBAACDDA",
  "DDCDADAAAB",
].join("");
const csat2025Letters = [
  "CDDCCDCBDADADACCBCDC",
  "ADADCDBDBCDABBBBBBCB",
  "BACBDCCDDCBCDDCADBBC",
  "ACCCCBADDDBDDBDCCAAC",
].join("");

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
  if (year !== "2024" && year !== "2025") return null;
  const definition = getPaper(paper);
  if (!definition) return null;
  const gs = paper === "Prelims-General-Studies-I";
  if (!gs && paper !== "Prelims-CSAT") return null;
  const currentBooklet = officialBooklet(paper, Number(year));
  if (!currentBooklet) return null;
  const modern = year === "2025";
  const source: HistoricalSource = modern
    ? {
        year: 2025,
        series: "A",
        booklet: currentBooklet,
        answerKey:
          "https://forumias.com/blog/wp-content/uploads/2026/05/UPSC-2025-Answerkey-" +
          (gs ? "GS-I.pdf" : "CSAT-1.pdf"),
      }
    : gs
      ? gsHistoricalSource
      : csatHistoricalSource;
  const letters = modern
    ? gs
      ? gs2025Letters
      : csat2025Letters
    : gs
      ? gsLetters
      : csatLetters;
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
    stem:
      modern || gs
        ? historicalAnswerSheetStem(paper, year, index + 1)
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
        JSON.stringify(
          modern || gs ? [source, letters] : [source, letters, csatStems],
        ),
      )
      .digest("hex"),
  };
}

// Research transcriptions use different booklet orders. Use them only
// to check for previously seen content, never pair them with Series A keys.
export function historicalResearchStems(paper: string, year: number) {
  if (year === 2025) return paper === "Prelims-CSAT" ? csat2025 : gs2025;
  if (year === 2024 && paper === "Prelims-General-Studies-I") return gsStems;
  return null;
}

function historicalAnswerSheetStem(
  paper: string,
  year: string,
  number: number,
) {
  const label = paper === "Prelims-CSAT" ? "CSAT" : "GS-I";
  return year + " " + label + " Series A, question " + number;
}
