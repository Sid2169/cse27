import { test } from "node:test";
import assert from "node:assert/strict";
import { buildCatalogue } from "../scripts/content";
import { generateCheckpoint } from "../src/server/assessment/checkpoint-generation";
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

test("generation keeps a verified set when individual drafts fail", async () => {
  const paper = catalogue.papers.find(
    (entry) => entry.id === "Prelims-General-Studies-I",
  )!;
  const scope = checkpointScope(paper, paper.chapters[21], documents)!;
  const questions = Array.from({ length: 8 }, (_, index) => ({
    stem: "Question " + index,
    options: ["A", "B", "C", "D"],
    correctOption: index % 4,
    explanation: "Explanation " + index,
    section: index === 7 ? 10000 : index + 1,
  }));
  let call = 0;
  const generated = await generateCheckpoint(
    async (prompt) => {
      if (call++ === 0) return { questions };
      assert.doesNotMatch(prompt, /Explanation \d/);
      return {
        review: questions.slice(1, 7).map(({ correctOption }, index) => ({
          correctOption,
          supported: index !== 2,
          fresh: true,
        })),
      };
    },
    scope,
    "English",
    ["QUESTION 0!"],
  );
  assert.equal(generated.questions.length, 5);
  assert.deepEqual(
    generated.questions.map(({ stem }) => stem),
    ["Question 1", "Question 2", "Question 4", "Question 5", "Question 6"],
  );
  assert.equal(generated.questions[0].sourceHeading, scope[0].sections[1].id);
  assert.equal("correctOption" in generated.questions[0], false);
  assert.equal(generated.key[2].explanation, "Explanation 4");
  const responses = generated.key.map(({ correctOption }) => [correctOption]);
  assert.equal(
    evaluateCheckpoint(generated.key, responses, true)?.qualified,
    true,
  );
});

test("generation rejects a set that misses a required chapter part", async () => {
  const paper = catalogue.papers.find(
    (entry) => entry.id === "Prelims-General-Studies-I",
  )!;
  const scope = checkpointScope(paper, paper.chapters[22], documents)!;
  assert.equal(scope.length, 4);
  let call = 0;
  await assert.rejects(
    generateCheckpoint(
      async () =>
        call++ === 0
          ? {
              questions: Array.from({ length: 8 }, (_, index) => ({
                stem: "Question " + index,
                options: ["A", "B", "C", "D"],
                correctOption: 0,
                explanation: "Explanation",
                section: 1,
              })),
            }
          : {
              review: Array.from({ length: 8 }, () => ({
                correctOption: 0,
                supported: true,
                fresh: true,
              })),
            },
      scope,
      "English",
      [],
    ),
    { reason: "insufficient-coverage" },
  );
});
