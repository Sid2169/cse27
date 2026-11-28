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
import gs2013 from "../../../.generated/Prelims-General-Studies-I-2013-stems.json";
import { csat2013ResearchStems } from "./csat-2013-research";
import gs2014 from "../../../.generated/Prelims-General-Studies-I-2014-stems.json";
import csat2014 from "../../../.generated/Prelims-CSAT-2014-stems.json";
import gs2015 from "../../../.generated/Prelims-General-Studies-I-2015-stems.json";
import csat2015 from "../../../.generated/Prelims-CSAT-2015-stems.json";
import gs2016 from "../../../.generated/Prelims-General-Studies-I-2016-stems.json";
import csat2016 from "../../../.generated/Prelims-CSAT-2016-stems.json";
import gs2017 from "../../../.generated/Prelims-General-Studies-I-2017-stems.json";
import csat2017 from "../../../.generated/Prelims-CSAT-2017-stems.json";
import gs2018 from "../../../.generated/Prelims-General-Studies-I-2018-stems.json";
import csat2018 from "../../../.generated/Prelims-CSAT-2018-stems.json";
import gs2019 from "../../../.generated/Prelims-General-Studies-I-2019-stems.json";
import csat2019 from "../../../.generated/Prelims-CSAT-2019-stems.json";
import gs2020 from "../../../.generated/Prelims-General-Studies-I-2020-stems.json";
import csat2020 from "../../../.generated/Prelims-CSAT-2020-stems.json";
import gs2021 from "../../../.generated/Prelims-General-Studies-I-2021-stems.json";
import csat2021 from "../../../.generated/Prelims-CSAT-2021-stems.json";
import gs2022 from "../../../.generated/Prelims-General-Studies-I-2022-stems.json";
import csat2022 from "../../../.generated/Prelims-CSAT-2022-stems.json";
import gs2023 from "../../../.generated/Prelims-General-Studies-I-2023-stems.json";
import csat2023 from "../../../.generated/Prelims-CSAT-2023-stems.json";
import gs2026 from "../../../.generated/Prelims-General-Studies-I-2026-stems.json";
import csat2026 from "../../../.generated/Prelims-CSAT-2026-stems.json";
import gs2025 from "../../../.generated/Prelims-General-Studies-I-2025-stems.json";
import csat2025 from "../../../.generated/Prelims-CSAT-2025-stems.json";

// Transcribed from the final official 2013 keys for Series A.
const gs2013Letters = [
  "ACBCDBACCBDCCDA",
  "CADDADCCDCDCBBD",
  "ADBCABACCBADDAB",
  "BDBADBBBCDBBBAA",
  "ACBCBACBBBCDADC",
  "DDAACCDBDBCCCCD",
  "CCADAADBDC",
].join("");
const csat2013Letters = [
  "CDAACBCBDAABDAB",
  "CBCCDABDBCDAADC",
  "BBCCBCCBBBCBDBC",
  "BDCABABACABDDAA",
  "BBCDDABCCDBABBA",
  "ACBAB",
].join("");

// Transcribed column by column from the final official 2014 Series A keys.
const gs2014Letters = [
  "BAADCAACCBBBCCC",
  "CCBCBBBADCBDBDC",
  "ACADDAADBBABCCB",
  "ACCDABCBDBCCCBB",
  "CACCBDCBDBCBDAB",
  "BDDCABBBACADCCD",
  "BACBDBADAC",
].join("");
const csat2014Letters = [
  "CCDBABDCCBBCBCC",
  "DBBDBBBCBAADBBA",
  "CCBBCDBDCBCBADB",
  "BDCCCDCCCCBCABD",
  "DDDBADCBAXXXXXX",
  "CCACB",
].join("");

// Transcribed from the final official 2015 keys for Series A.
const gs2015Letters = [
  "CABABDCBBACBABA",
  "BBACDDCCBCDBBCD",
  "CCBCBDADDBBDADC",
  "BCBACADBBBDBCAC",
  "DBCCBBDAADACDCA",
  "CBACBBDDCCCCABB",
  "DDDCAABACC",
].join("");
const csat2015Letters = [
  "ADBCCAADDAAACDB",
  "DCBABADABCDCBBC",
  "CDBAAACCCDBDCBB",
  "DBDCDXABCDDCCCB",
  "DDACCAACCABBBCD",
  "DDBBC",
].join("");

// Transcribed from the final official Series A keys from 2016 through 2018.
const gs2016Letters = [
  "BCCBCBDCCBADCDC",
  "CCDCBBDABDCBDAC",
  "BACCBACDBBDACAA",
  "CACABBCADACACDB",
  "ABDDBBBDBACDADB",
  "CBDDDABCCBBDCDD",
  "CBDCDDBBAB",
].join("");
const csat2016Letters = [
  "CADDACDDBDDBDCA",
  "CBBCCDBCADAADBB",
  "BDBBBCBCCDCDADB",
  "DBBBABDBABABABC",
  "DBAABBDBDCBAABA",
  "DADCC",
].join("");
const gs2017Letters = [
  "DCAAABBCABABCCD",
  "BDCCBCBABDDADCB",
  "CACCDDBBCADAAAD",
  "CAABDBABCDBCBCB",
  "BDDBBBBBAACBDCA",
  "DBCCBAAACDCBABD",
  "AACDBBCACD",
].join("");
const csat2017Letters = [
  "CADBBBACBCBDCBA",
  "BCCCCDCDADBDCCD",
  "DBBDABACCDACBAC",
  "DBABDCDBABBCACB",
  "CCACABBCABBBDBA",
  "BDCDB",
].join("");
const gs2018Letters = [
  "BDCBACADCACDADC",
  "ACDABBBABBDDAAA",
  "CAACBBBBABCDCBC",
  "BCCCDCCBADCCCCD",
  "ADBBABDDCDBDBCC",
  "DACABBBBDABDCBC",
  "BCBAABCADB",
].join("");
const csat2018Letters = [
  "BDAACDAABDCCBBC",
  "CCADCABDACADADB",
  "CCBBACBBBACCBAB",
  "ADACDABCBDACCBC",
  "DADDCAABDBCADCD",
  "ADDBA",
].join("");

// Transcribed from the final official 2019 Series A keys, column by column.
const gs2019Letters = [
  "DBCACDCADADADBD",
  "ACDCAAAABDDADCA",
  "DDCDDBBAACDDBBB",
  "CAAABCBCCBBCBCC",
  "BADBBCDAAAADABD",
  "CACCDDAADDDACBB",
  "BBACDABBAB",
].join("");
const csat2019Letters = [
  "DDBBBADCCCDBCDB",
  "BABBCDBAACCBBBD",
  "ADBBDBCBBBAACAD",
  "CCCABBBCDDCCBDD",
  "BDDBCBBDDADBDDC",
  "CDBDB",
].join("");

// Transcribed from the final official 2020 Series A keys, column by column.
const gs2020Letters = [
  "BBDDBDDDACBADADDDDDCBBACCAXAAA",
  "CBBDDCDBCDCDDDBACAADBXADBCBBBB",
  "CADBABACDCBACAADAADDAADAAAADCA",
  "CDBBCDABCC",
].join("");
const csat2020Letters = [
  "DACABCABCABBCBCCCABCBACABCDCDC",
  "DACBBDCACDDBCDCDDDDCDDBBCACBCA",
  "CCACCBDCCBABBDADDCAB",
].join("");

// Transcribed from the final official 2021 Series A keys, column by column.
const gs2021Letters = [
  "CBBABDAADDCABCBABDAC",
  "CBDABCCCADCAABDCDACB",
  "BBACACDBABBBDDBBACDD",
  "CBBBCCBCABACDBDDCBCX",
  "DBBDAAAAADBBBDDDDCBD",
].join("");
const csat2021Letters = [
  "BDCCCBBDDDDAACCBBBDB",
  "ADDDCACCCBCCCBDCACCB",
  "ACDABBBADCBCCABBDACB",
  "BDBBDBCDBACDBCBBBADD",
].join("");

// Transcribed from the final official 2022 Series A keys, column by column.
const gs2022Letters = [
  "BCBCADADACBBBBBBDDBA",
  "BDBCBACBBBDDDCBDDCBC",
  "ABDBCAAAACCBDBBCBDBB",
  "XDBBCDCDACCAADCAADDA",
  "DCCBDBCBBABBBAAADDDB",
].join("");
const csat2022Letters = [
  "ABCDAADDBCCDAABDCBDB",
  "DAACDBCDCACBADDXDDCD",
  "BDBDADCDCDABAACADDCA",
  "CACACDDCADCCDBBCDCAC",
].join("");

// Transcribed from the final official 2023 Series A keys.
const gs2023Letters = [
  "ABBADDCADDCCAACDBCBC",
  "DABABBCCBCAACXADBBBC",
  "ABBDDBBACDBCACBADDBC",
  "ACDDCDACAABCDBBCBDCA",
  "ABADCCCDADBBDCBBDDCC",
].join("");
const csat2023Letters = [
  "ADCDBBAADCCABADADACA",
  "BBBACBACBCDCBCBCDDCD",
  "AAACDCACABDAABBDCADB",
  "DDBCDCDDCBBBDDDADAAC",
].join("");

// Page one of the UPSC provisional Series A keys, column by column.
const gs2026Letters = [
  "DACBBADACCDACBBBADDB",
  "BBDDCCADCBABBBBBCBBC",
  "CBCBBCBBCBCABDBBACDA",
  "DDAXDABACABCDBCCBBCC",
  "CACAACACCDACBBACCDAA",
].join("");
const csat2026Letters = [
  "ADCDAAABDDDBDABDADBC",
  "BBBABBDBCBDADCBAABBC",
  "CCBDCCCDBDACDCDDDBCD",
  "CBABABBAAADBCCDCDABD",
].join("");

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
  series?: string;
  booklet: string;
  answerKey?: string;
  dropped?: number[];
  excludedSection?: string;
  penaltyExceptions?: number[];
  provisional?: boolean;
};

export function historicalScope(paper: string, year: string) {
  const definition = getPaper(paper);
  if (!definition) return null;
  const gs = paper === "Prelims-General-Studies-I";
  if (!gs && paper !== "Prelims-CSAT") return null;
  const currentBooklet = officialBooklet(paper, Number(year));
  if (!currentBooklet) return null;
  const modern = year !== "2024";
  const provisional = year === "2026";
  const newerEditions: Record<
    string,
    {
      gs: string;
      csat: string;
      gsDropped?: number[];
      csatDropped?: number[];
      csatAlternates?: { number: number; letter: string }[];
      csatExcludedSection?: string;
      csatPenaltyExceptions?: number[];
      answerKey: (gs: boolean) => string;
    }
  > = {
    "2013": {
      gs: gs2013Letters,
      csat: csat2013Letters,
      csatAlternates: [
        { number: 75, letter: "C" },
        { number: 76, letter: "C" },
        { number: 77, letter: "D" },
        { number: 78, letter: "C" },
        { number: 79, letter: "C" },
        { number: 80, letter: "C" },
      ],
      csatPenaltyExceptions: [75, 76, 77, 78, 79, 80],
      answerKey: () =>
        "https://iasexamportal.com/sites/default/files/Official-Answer-Key-UPSC-Civil-Services-Pre-Exam-2013.pdf",
    },
    "2014": {
      gs: gs2014Letters,
      csat: csat2014Letters,
      csatDropped: [70, 71, 72, 73, 74, 75],
      csatAlternates: [
        { number: 6, letter: "C" },
        { number: 42, letter: "D" },
      ],
      csatExcludedSection: "English-language comprehension",
      answerKey: (gs) =>
        "https://iasexamportal.com/sites/default/files/Official-Answer-Key-UPSC-Civil-Services-Pre-Exam-2014-" +
        (gs ? "GS-Paper-1.pdf" : "CSAT-Paper-2.pdf"),
    },
    "2015": {
      gs: gs2015Letters,
      csat: csat2015Letters,
      csatDropped: [51],
      answerKey: (gs) =>
        gs
          ? "https://cdn1.byjus.com/wp-content/uploads/2018/11/free-ias-prep/2015/12/15151210/UPSC-2015-CSP-Answer-Key-GS-Paper1.pdf"
          : "https://iasexamportal.com/sites/default/files/Official-Answer-Key-UPSC-Civil-Services-Pre-Exam-2015-CSAT-Paper-2.pdf",
    },
    "2016": {
      gs: gs2016Letters,
      csat: csat2016Letters,
      answerKey: (gs) =>
        "https://forumias.com/blog/wp-content/uploads/2021/01/AnsKeyCSP-16-GS_" +
        (gs ? "I" : "II") +
        ".pdf",
    },
    "2017": {
      gs: gs2017Letters,
      csat: csat2017Letters,
      answerKey: (gs) =>
        gs
          ? "https://forumias.com/blog/wp-content/uploads/2020/09/Anskey-CSP-17-GS-I.pdf"
          : "https://forumias.com/blog/wp-content/uploads/2021/01/AnsKeyCSP-17-GS_2.pdf",
    },
    "2018": {
      gs: gs2018Letters,
      csat: csat2018Letters,
      answerKey: (gs) =>
        "https://forumias.com/blog/wp-content/uploads/2021/01/AnsKeyCSP-18-GS_" +
        (gs ? "I" : "II") +
        "_2.pdf",
    },
    "2019": {
      gs: gs2019Letters,
      csat: csat2019Letters,
      answerKey: (gs) =>
        "https://paramias.com/answer-key/AnsKeyCSP-19-GS_" +
        (gs ? "I" : "II") +
        ".pdf",
    },
    "2020": {
      gs: gs2020Letters,
      csat: csat2020Letters,
      gsDropped: [27, 52],
      answerKey: (gs) =>
        gs
          ? "https://forumias.com/blog/wp-content/uploads/2021/11/UPSC-Prelims-2020-official-answer-key.pdf"
          : "https://forumias.com/blog/wp-content/uploads/2021/11/upsc-prelims-2020-answer-key-CSAT.pdf",
    },
    "2021": {
      gs: gs2021Letters,
      csat: csat2021Letters,
      gsDropped: [80],
      csatAlternates: [{ number: 39, letter: "D" }],
      answerKey: (gs) =>
        gs
          ? "https://forumias.com/blog/wp-content/uploads/2022/05/UPSC-IAS-2021-Prelims-answer-key-GS-Paper-1.pdf"
          : "https://www.clearias.com/up/Official-UPSC-Answer-Key-GS2-CSE-Prelims-2021.pdf",
    },
    "2022": {
      gs: gs2022Letters,
      csat: csat2022Letters,
      gsDropped: [61],
      csatDropped: [36],
      answerKey: (gs) =>
        "https://forumias.com/blog/wp-content/uploads/2023/07/UPSC-Civil-Services-Prelims-2022-GS-Paper-" +
        (gs ? "1" : "2") +
        "-Official-Answer-key.pdf",
    },
    "2023": {
      gs: gs2023Letters,
      csat: csat2023Letters,
      gsDropped: [34],
      answerKey: (gs) =>
        "https://forumias.com/blog/wp-content/uploads/2024/05/UPSC-CSE-2023-" +
        (gs ? "GS" : "CSAT") +
        "-Answer-Key.pdf",
    },
    "2025": {
      gs: gs2025Letters,
      csat: csat2025Letters,
      answerKey: (gs) =>
        "https://forumias.com/blog/wp-content/uploads/2026/05/UPSC-2025-Answerkey-" +
        (gs ? "GS-I.pdf" : "CSAT-1.pdf"),
    },
    "2026": {
      gs: gs2026Letters,
      csat: csat2026Letters,
      gsDropped: [64],
      answerKey: (gs) =>
        "https://forumias.com/blog/wp-content/uploads/2026/05/ProvAnsKey%E2%80%93GS-" +
        (gs ? "I" : "II") +
        "-CSP-Exam-2026-270526.pdf",
    },
  };
  const known = Object.hasOwn(newerEditions, year)
    ? newerEditions[year]
    : undefined;
  if (modern && !known) return null;
  const alternates = gs ? [] : (known?.csatAlternates ?? []);
  const excludedSection = gs ? undefined : known?.csatExcludedSection;
  const penaltyExceptions = gs ? undefined : known?.csatPenaltyExceptions;
  const knownDropped = gs ? known?.gsDropped : known?.csatDropped;
  const source: HistoricalSource = known
    ? {
        year: Number(year),
        series: "A",
        booklet: currentBooklet,
        ...(provisional ? { provisional: true } : {}),
        answerKey: known.answerKey(gs),
        ...(knownDropped ? { dropped: knownDropped } : {}),
        ...(excludedSection ? { excludedSection } : {}),
        ...(penaltyExceptions ? { penaltyExceptions } : {}),
      }
    : gs
      ? gsHistoricalSource
      : csatHistoricalSource;
  const letters = known
    ? gs
      ? known.gs
      : known.csat
    : gs
      ? gsLetters
      : csatLetters;
  const dropped = Array.from(letters).flatMap((letter, index) =>
    letter === "X" ? [index + 1] : [],
  );
  if (
    !(gs ? /^[A-DX]{100}$/ : /^[A-DX]{80}$/).test(letters) ||
    dropped.join() !== (source.dropped ?? []).join()
  )
    throw new Error(
      "Historical answer key does not match the verified booklet",
    );
  const guide: ObjectiveKey[] = Array.from(letters, (letter, index) => {
    const penaltyExempt = penaltyExceptions?.includes(index + 1);
    const alternate = alternates.find(({ number }) => number === index + 1);
    if (alternate)
      return {
        correctOption: "ABCD".indexOf(letter),
        ...(penaltyExempt ? { penaltyExempt } : {}),
        alternateCorrectOption: "ABCD".indexOf(alternate.letter),
        explanation: `The published ${source.series} key accepts either ${letter} or ${alternate.letter}.`,
      };
    return {
      correctOption: letter === "X" ? null : "ABCD".indexOf(letter),
      ...(penaltyExempt ? { penaltyExempt } : {}),
      explanation:
        letter === "X"
          ? provisional
            ? "The provisional UPSC key excludes this question."
            : excludedSection
              ? `UPSC excluded the ${excludedSection} section from scoring.`
              : "UPSC dropped this question from scoring."
          : (provisional ? "The provisional " : "The published ") +
            source.series +
            " key gives option " +
            letter +
            ".",
    };
  });
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
          modern || gs
            ? [source, letters, ...alternates]
            : [source, letters, csatStems],
        ),
      )
      .digest("hex"),
  };
}

// Research transcriptions use different booklet orders. Use them only
// to check for previously seen content, never pair them with Series A keys.
export function historicalResearchStems(paper: string, year: number) {
  if (year === 2013)
    return paper === "Prelims-CSAT" ? csat2013ResearchStems : gs2013;
  if (year === 2014) return paper === "Prelims-CSAT" ? csat2014 : gs2014;
  if (year === 2015) return paper === "Prelims-CSAT" ? csat2015 : gs2015;
  if (year === 2016) return paper === "Prelims-CSAT" ? csat2016 : gs2016;
  if (year === 2017) return paper === "Prelims-CSAT" ? csat2017 : gs2017;
  if (year === 2018) return paper === "Prelims-CSAT" ? csat2018 : gs2018;
  if (year === 2019) return paper === "Prelims-CSAT" ? csat2019 : gs2019;
  if (year === 2020) return paper === "Prelims-CSAT" ? csat2020 : gs2020;
  if (year === 2021) return paper === "Prelims-CSAT" ? csat2021 : gs2021;
  if (year === 2022) return paper === "Prelims-CSAT" ? csat2022 : gs2022;
  if (year === 2023) return paper === "Prelims-CSAT" ? csat2023 : gs2023;
  if (year === 2026) return paper === "Prelims-CSAT" ? csat2026 : gs2026;
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
