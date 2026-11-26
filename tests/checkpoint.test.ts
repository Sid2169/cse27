import { test } from "node:test";
import assert from "node:assert/strict";
import { buildCatalogue } from "../scripts/content";
import {
  checkpointScope,
  evaluateCheckpoint,
} from "../src/modules/assessment/checkpoint";

const catalogue = buildCatalogue();
const documents = new Map(
  catalogue.documents.map((document) => [document.path, document]),
);

test("scope blocks placeholders and requires all indexed parts", () => {
  const paper = catalogue.papers.find(
    (entry) => entry.id === "Mains-Mathematics",
  )!;
  const path = paper.chapters[2];
  const scope = checkpointScope(paper, path, documents);
  assert.equal(scope?.length, 4);
  const missing = new Map(documents);
  missing.delete(scope![1].path);
  assert.equal(checkpointScope(paper, path, missing), null);
  assert.equal(checkpointScope(paper, paper.chapters[3], documents), null);
  assert.equal(checkpointScope(paper, scope![1].path, documents), null);
});

test("80 percent uses exact counts and confirmed blanks and multiple selections", () => {
  const key = Array.from({ length: 5 }, () => ({
    correctOption: 0,
    optionCount: 4,
  }));
  assert.deepEqual(
    evaluateCheckpoint(key, [[0], [0], [0], [0], [0, 1]], true),
    {
      correct: 4,
      wrong: 1,
      blank: 0,
      excluded: 0,
      total: 5,
      percentage: 80,
      qualified: true,
    },
  );
  assert.equal(
    evaluateCheckpoint(key, [[0], [0], [0], [], [1]], true)?.qualified,
    false,
  );
  assert.equal(evaluateCheckpoint(key, [[0], [0], [0], [0], null], true), null);
});

test("remove unscorable items without awarding qualification for inadequate coverage", () => {
  const key = [
    { correctOption: 0, optionCount: 4 },
    { correctOption: 0, optionCount: 4, unscorable: true },
  ];
  assert.equal(evaluateCheckpoint(key, [[0], [1]], true)?.percentage, 100);
  assert.equal(evaluateCheckpoint(key, [[0], [1]], false)?.qualified, false);
  assert.equal(evaluateCheckpoint([], [], true)?.qualified, false);
});
