import "server-only";
import { createHash } from "node:crypto";
import { historicalScope, type HistoricalSource } from "./historical-papers";
import { gs2025For2026Profiles } from "./updated-pyq-2025-edition";
import { replacementProfiles2025 } from "./updated-pyq-2025";
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

type PreparationPack = {
  cutoff: string;
  profiles: typeof replacementProfiles;
};

const preparationPacks: Record<string, Record<string, PreparationPack>> = {
  "2024": {
    "2026": { cutoff: preparationCutoff, profiles: replacementProfiles },
    "2025": { cutoff: "2025-12-31", profiles: replacementProfiles2025 },
  },
  "2025": {
    "2026": { cutoff: preparationCutoff, profiles: gs2025For2026Profiles },
  },
};

export function updatedTargets(paper: string, year: string) {
  return paper === "Prelims-General-Studies-I" &&
    Object.hasOwn(preparationPacks, year)
    ? Object.keys(preparationPacks[year]).sort((a, b) => Number(b) - Number(a))
    : [];
}

export function updatedScope(paper: string, year: string, targetYear: string) {
  if (!updatedTargets(paper, year).includes(targetYear)) return null;
  const pack = preparationPacks[year][targetYear];
  const { profiles, cutoff } = pack;
  const base = historicalScope(paper, year);
  if (!base) return null;
  const numbers = profiles.map((profile) => profile.number);
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
    profiles.some(
      (profile) =>
        !profile.sources.length ||
        profile.sources.some(
          ({ date, url }) => date > cutoff || !url.startsWith("https://"),
        ),
    )
  )
    throw new Error(
      "The updated PYQ evidence does not match the original paper",
    );
  const source: UpdatedSource = {
    ...base.source,
    targetYear: Number(targetYear),
    cutoff,
    replacements: profiles.map(
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
      .update(JSON.stringify([base.revision, source, profiles]))
      .digest("hex"),
    profiles,
  };
}
