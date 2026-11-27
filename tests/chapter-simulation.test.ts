import assert from "node:assert/strict";
import { test } from "node:test";
import { buildCatalogue } from "../scripts/content";
import {
  fileMime,
  mathematicsVariants,
  scoreObjective,
  validateSimulationAnswers,
  type ObjectiveQuestion,
  type WrittenQuestion,
} from "../src/modules/assessment/chapter-simulation";
import { checkpointScope } from "../src/modules/assessment/checkpoint";
import {
  generateWrittenSimulation,
  markWrittenSimulation,
} from "../src/server/assessment/simulation-generation";

import { mainsGsPattern } from "../src/modules/assessment/full-mains-pattern";
import {
  includesQuestion,
  validateChoices,
} from "../src/modules/assessment/written-choices";

test("qualifying papers count just one essay plus compulsory questions", () => {
  for (const paper of ["Mains-English", "Mains-Indian-Language"]) {
    const pattern = mainsGsPattern(paper)!;
    assert.equal(pattern[0].labels.length, 4);
    assert.equal(
      pattern.reduce((sum, section) => sum + section.marks, 0),
      300,
    );
  }
  assert.deepEqual(validateChoices([], "language", false), []);
  assert.equal(validateChoices([], "language", true), null);
  assert.equal(validateChoices([0, 2], "language", true), null);
  assert.equal(validateChoices([5], "language", true), null);
  assert.equal(includesQuestion("language", [2], 2), true);
  assert.equal(includesQuestion("language", [2], 1), false);
  assert.equal(includesQuestion("language", [2], 4), true);
  assert.deepEqual(validateChoices([1, 7], "essay", true), [1, 7]);
  assert.equal(validateChoices([4, 5], "essay", true), null);
});

const key = Array.from({ length: 3 }, () => ({
  correctOption: 0,
  explanation: "Explanation.",
}));

test("Prelims marks and one-third penalties are exact in sixths", () => {
  const answers = { "0": 0, "1": 3, "2": null };
  const gs = scoreObjective("Prelims-General-Studies-I", key, answers);
  const csat = scoreObjective("Prelims-CSAT", key, answers);
  assert.equal(gs.score, 8);
  assert.equal(csat.score, 10);
  assert.equal(gs.feedback.penaltyUnits, 4);
  assert.equal(csat.feedback.penaltyUnits, 5);
  assert.equal(gs.feedback.correct, 1);
  assert.equal(gs.feedback.wrong, 1);
  assert.equal(gs.feedback.blank, 1);
  assert.equal(scoreObjective("Prelims-CSAT", key, { "0": 3 }).score, -5);
});

test("submissions validate options and written answers against the prepared paper", () => {
  const question = {
    stem: "Prompt",
    sourcePath: "chapter.md",
    sourceHeading: "topic",
  };
  const objective: ObjectiveQuestion = {
    ...question,
    options: ["A", "B", "C", "D"],
  };
  const written: WrittenQuestion = { ...question, marks: 10, wordLimit: 150 };
  assert.deepEqual(validateSimulationAnswers({ "0": 3 }, [objective]), {
    "0": 3,
  });
  assert.deepEqual(validateSimulationAnswers({ "0": null }, [objective]), {
    "0": null,
  });
  assert.equal(validateSimulationAnswers({ "0": 4 }, [objective]), null);
  assert.equal(validateSimulationAnswers({ "0": [0, 1] }, [objective]), null);
  assert.equal(
    validateSimulationAnswers({ "1": "No question" }, [written]),
    null,
  );
  assert.equal(validateSimulationAnswers({ "0": 0 }, [written]), null);
  assert.equal(
    validateSimulationAnswers({ "0": "A".repeat(20001) }, [written]),
    null,
  );
  assert.deepEqual(validateSimulationAnswers({ "0": "Answer" }, [written]), {
    "0": "Answer",
  });
  assert.equal(
    fileMime(new Uint8Array([37, 80, 68, 70, 45])),
    "application/pdf",
  );
  assert.equal(fileMime(new TextEncoder().encode("<svg>")), null);
});

test("written simulation links every part and rejects out-of-guide awards", async () => {
  const catalogue = buildCatalogue();
  const paper = catalogue.papers.find(
    (entry) => entry.id === "Mains-Mathematics",
  )!;
  const documents = new Map(
    catalogue.documents.map((document) => [document.path, document]),
  );
  const scope = checkpointScope(paper, paper.chapters[2], documents)!;
  assert.deepEqual(mathematicsVariants(scope[0].markdown), ["I", "II"]);
  assert.deepEqual(mathematicsVariants("**Paper:** Mathematics Paper II"), [
    "II",
  ]);
  assert.equal(scope.length, 4);
  let sectionNumber = scope[0].sections.length + 1;
  const questions = scope.slice(1).map((doc, index) => {
    const candidate = {
      stem: "Prompt " + index,
      marks: 10,
      wordLimit: 0,
      section: sectionNumber,
      reference: "Private reference",
      criteria: [
        { description: "Method", marks: 6 },
        { description: "Conclusion", marks: 4 },
      ],
    };
    sectionNumber += doc.sections.length;
    return candidate;
  });
  let calls = 0;
  const prepared = await generateWrittenSimulation(
    async () => (calls++ === 0 ? { questions } : { valid: true }),
    scope,
    paper.id,
    paper.title,
    "II",
  );
  assert.deepEqual(
    prepared.questions.map(({ sourcePath }) => sourcePath),
    scope.slice(1).map(({ path }) => path),
  );
  assert.equal("reference" in prepared.questions[0], false);
  assert.equal(prepared.guide[0].reference, "Private reference");

  const mark = (allocation: number, resolved: boolean = true) =>
    markWrittenSimulation(
      async () => ({
        items: [
          {
            index: 0,
            resolved,
            criteria: [allocation, 2],
            feedback: "Method credited.",
          },
        ],
      }),
      prepared.questions,
      prepared.guide,
      { "0": "A defensible setup" },
      false,
    );
  const grade = await mark(5);
  assert.equal(grade[0].awarded, 7);
  assert.equal(grade[1].awarded, 0);
  await assert.rejects(mark(7), /Invalid criterion award/);
  await assert.rejects(mark(5, false), /clarification/);
});
