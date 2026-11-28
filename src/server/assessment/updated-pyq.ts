import "server-only";
import { createHash } from "node:crypto";
import { historicalScope, type HistoricalSource } from "./historical-papers";
import { preparationCutoff, replacementProfiles } from "./updated-pyq-data";

export type UpdatedSource = HistoricalSource & {
  targetYear: number;
  cutoff: string;
  replacements: {
    number: number;
    type: "mirror" | "new";
    original: string;
    rationale: string;
    sources: { title: string; date: string; url: string }[];
  }[];
};

export function updatedScope(paper: string, year: string, targetYear: string) {
  if (
    paper !== "Prelims-General-Studies-I" ||
    year !== "2024" ||
    targetYear !== "2026"
  )
    return null;
  const base = historicalScope(paper, year);
  if (!base) return null;
  const numbers = replacementProfiles.map((profile) => profile.number);
  if (
    numbers.length === 0 ||
    new Set(numbers).size !== numbers.length ||
    !numbers.every(
      (number) =>
        Number.isInteger(number) &&
        number >= 1 &&
        number <= base.questions.length &&
        !base.source.dropped?.includes(number),
    ) ||
    replacementProfiles.some(
      (profile) =>
        !profile.sources.length ||
        profile.sources.some(
          ({ date, url }) =>
            date > preparationCutoff || !url.startsWith("https://"),
        ),
    )
  )
    throw new Error(
      "The updated PYQ evidence does not match the original paper",
    );
  const source: UpdatedSource = {
    ...base.source,
    targetYear: 2026,
    cutoff: preparationCutoff,
    replacements: replacementProfiles.map(
      ({ number, type, original, rationale, sources }) => ({
        number,
        type,
        original,
        rationale,
        sources: sources.map(({ title, date, url }) => ({ title, date, url })),
      }),
    ),
  };
  return {
    ...base,
    source,
    revision: createHash("sha256")
      .update(JSON.stringify([base.revision, source, replacementProfiles]))
      .digest("hex"),
    profiles: replacementProfiles,
  };
}
