import type { Document, Paper } from "../content/types";

export function checkpointScope(
  paper: Paper,
  chapterPath: string,
  documents: ReadonlyMap<string, Document>,
) {
  if (!paper.chapters.includes(chapterPath)) return null;
  const chapter = documents.get(chapterPath);
  if (!chapter?.ready) return null;

  const stem = chapterPath.replace(/\.md$/, "");
  const directory = chapterPath.slice(0, chapterPath.lastIndexOf("/") + 1);
  const requiredParts = new Set<string>();
  for (const match of chapter.markdown.matchAll(
    /\]\(([^)#]+-part-\d+\.md)(?:#[^)]*)?\)/g,
  )) {
    const path = directory + match[1];
    if (path.startsWith(stem + "-part-")) requiredParts.add(path);
  }
  for (const path of documents.keys()) {
    if (path.startsWith(stem + "-part-")) requiredParts.add(path);
  }

  const parts: Document[] = [];
  for (const path of [...requiredParts].sort((a, b) =>
    a.localeCompare(b, undefined, { numeric: true }),
  )) {
    const part = documents.get(path);
    if (!part?.ready) return null;
    parts.push(part);
  }
  return [chapter, ...parts];
}

export type CheckpointItem = {
  correctOption: number;
  optionCount: number;
  unscorable?: boolean;
};

export function evaluateCheckpoint(
  key: readonly CheckpointItem[],
  responses: readonly (readonly number[] | null)[],
  adequateCoverage: boolean,
) {
  if (key.length !== responses.length) return null;
  let correct = 0;
  let wrong = 0;
  let blank = 0;
  let excluded = 0;

  for (const [index, item] of key.entries()) {
    if (item.unscorable) {
      excluded++;
      continue;
    }
    const answer = responses[index];
    const validOption = (option: number) =>
      Number.isInteger(option) && option >= 0 && option < item.optionCount;
    if (
      !answer ||
      !Number.isSafeInteger(item.optionCount) ||
      item.optionCount < 2 ||
      !validOption(item.correctOption) ||
      !answer.every(validOption) ||
      new Set(answer).size !== answer.length
    )
      return null;

    if (answer.length === 0) blank++;
    else if (answer.length === 1 && answer[0] === item.correctOption) correct++;
    else wrong++;
  }

  const total = correct + wrong + blank;
  return {
    correct,
    wrong,
    blank,
    excluded,
    total,
    percentage: total ? (100 * correct) / total : null,
    qualified: adequateCoverage && total > 0 && 5 * correct >= 4 * total,
  };
}
