import "server-only";
import { createHash } from "node:crypto";
import { getDocument, getPaper } from "@/modules/content/catalogue";
import { officialBooklet } from "@/modules/content/past-papers";
import { mainsGsPattern } from "@/modules/assessment/full-mains-pattern";
import type { WrittenQuestion } from "@/modules/assessment/chapter-simulation";
import type { HistoricalSource } from "./historical-papers";

const writtenEditions: Record<string, { year: string; digest: string }> = {
  "Mains-General-Studies-I": {
    year: "2026",
    digest: "49418ba3d1a93de14f2e4d21be2c77aafdd9f194b32238e05d5242d9747a2601",
  },
  "Mains-General-Studies-II": {
    year: "2026",
    digest: "471efa8ae48dde452d5cea7a31241c0260c13e2cf2ec396734b97631c2599a36",
  },
  "Mains-General-Studies-III": {
    year: "2026",
    digest: "051df5f7c1d7927ff5808f463957391ed2b4bded43bb4b24e6fa67724ebcfa7e",
  },
  "Mains-General-Studies-IV": {
    year: "2026",
    digest: "df8cdb5399ac2ddf9424553f7c231de1068cefa68ff2decbaf30ad61001db3a6",
  },
  "Mains-Essay": {
    year: "2026",
    digest: "a8eee6ee4af529ebc58778e96fbd148e6b63f5740e08e82e194376a185f27811",
  },
  "Mains-Mathematics-I": {
    year: "2026",
    digest: "b8b9c83368d8e77bd64d1581a34e3ab3ca26f03f6eacae30ad9f2ea6a9d04160",
  },
  "Mains-Mathematics-II": {
    year: "2026",
    digest: "fa4cb25029d79c8e6a6e9e01be6d253cf61b65dde6a0f7e5903f2ab838126e13",
  },
  "Mains-Indian-Language": {
    year: "2024",
    digest: "177407a7553b1c9b3bdf31429e0ceada846d73a8eb1640936e28625ed354d5eb",
  },
  "Mains-English": {
    year: "2024",
    digest: "e2d7fd7a58ba1fc5f7748b487cec586eaf10bd94a6a41715bf202fdaebfc0130",
  },
};

export function historicalWrittenScope(
  paper: string,
  year: string,
  variant: string,
) {
  if (
    paper === "Mains-Mathematics"
      ? !["I", "II"].includes(variant)
      : variant !== ""
  )
    return null;
  const edition = writtenEditions[variant ? paper + "-" + variant : paper];
  if (!edition || edition.year !== year) return null;
  const definition = getPaper(paper);
  const syllabus = definition && getDocument(definition.syllabus);
  const booklet = officialBooklet(paper, Number(year), variant);
  const pattern = mainsGsPattern(paper);
  if (!syllabus || !booklet || !pattern) return null;
  const qualifying =
    paper === "Mains-English" || paper === "Mains-Indian-Language";
  const source: HistoricalSource = { year: Number(year), booklet };
  const heading =
    (variant
      ? syllabus.sections.find(({ title }) => title === "PAPER " + variant)
      : syllabus.sections.find(({ level }) => level === 2)
    )?.id ?? "";
  const questions: WrittenQuestion[] = pattern.flatMap(
    ({ labels, marks, words }) =>
      labels.map((label) => ({
        label,
        stem: "",
        marks,
        wordLimit: words,
        sourcePath: syllabus.path,
        sourceHeading: heading,
      })),
  );
  return {
    questions,
    source,
    digest: edition.digest,
    maximum: qualifying ? 300 : 250,
    variants: [variant],
    kind: "descriptive" as const,
    revision: createHash("sha256")
      .update(JSON.stringify([source, edition.digest, questions]))
      .digest("hex"),
  };
}

export async function readVerifiedBooklet(url: string, digest: string) {
  const response = await fetch(url, {
    redirect: "error",
    signal: AbortSignal.timeout(18_000),
  });
  if (
    !response.ok ||
    !response.headers.get("content-type")?.includes("application/pdf") ||
    !response.body
  )
    throw new Error("The official booklet could not be fetched");
  const reader = response.body.getReader();
  const pieces: Uint8Array[] = [];
  let length = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > 8 * 1024 * 1024)
        throw new Error("The official booklet exceeds the preparation limit");
      pieces.push(value);
    }
  } finally {
    await reader.cancel();
  }
  const pdf = Buffer.concat(pieces, length);
  if (
    pdf.subarray(0, 5).toString() !== "%PDF-" ||
    createHash("sha256").update(pdf).digest("hex") !== digest
  )
    throw new Error("The official booklet differs from the verified edition");
  return { mimeType: "application/pdf", data: pdf.toString("base64") };
}
