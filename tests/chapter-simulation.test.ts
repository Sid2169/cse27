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

test("Mathematics requires three valid choices across both sections", () => {
  const pattern = mainsGsPattern("Mains-Mathematics")!;
  assert.equal(pattern.length, 8);
  for (const question of pattern) {
    assert.equal(
      question.criteriaMarks?.reduce((sum, marks) => sum + marks, 0),
      50,
    );
  }
  assert.deepEqual(validateChoices([1, 3, 6], "mathematics", true), [1, 3, 6]);
  assert.equal(validateChoices([1, 2, 3], "mathematics", true), null);
  assert.equal(validateChoices([0, 1, 6], "mathematics", true), null);
  assert.equal(validateChoices([1, 5], "mathematics", true), null);
  assert.deepEqual(validateChoices([1, 2], "mathematics", false), [1, 2]);
  assert.equal(includesQuestion("mathematics", [1, 3, 6], 4), true);
  assert.equal(includesQuestion("mathematics", [1, 3, 6], 7), false);
});

import { generateReplacements } from "../src/server/assessment/updated-pyq-generation";
import {
  replacementProfiles,
  preparationCutoff,
} from "../src/server/assessment/updated-pyq-data";

test("updated PYQ generation keeps slot numbers and requires independently matching keys", async () => {
  const profile = replacementProfiles.find(({ number }) => number === 82)!;
  const base = {
    stem: "Original",
    options: ["A", "B", "C", "D"],
    sourcePath: "syllabus.md",
    sourceHeading: "",
  };
  const draft = {
    number: profile.number,
    stem: "Exercise location?\nअभ्यास का स्थान?",
    options: ["A जगह", "B जगह", "C जगह", "D जगह"],
    correctOption: 2,
    explanation: "The source validates this answer.",
  };
  const generator = (option: number, suppliedNumber = draft.number) => {
    let reviewed = false;
    return async () => {
      if (reviewed)
        return {
          items: [
            { number: draft.number, correctOption: option, supported: true },
          ],
        };
      reviewed = true;
      return { items: [{ ...draft, number: suppliedNumber }] };
    };
  };
  const [replaced] = await generateReplacements(generator(2), [profile], base);
  assert.equal(replaced.number, profile.number);
  assert.equal(replaced.question.sourcePath, base.sourcePath);
  assert.equal("correctOption" in replaced.question, false);
  assert.equal(replaced.key.correctOption, 2);
  await assert.rejects(
    generateReplacements(generator(1), [profile], base),
    /independent/,
  );
  await assert.rejects(
    generateReplacements(generator(2, 1), [profile], base),
    /invalid replacement/,
  );
  const numbers = replacementProfiles.map(({ number }) => number);
  assert.equal(new Set(numbers).size, numbers.length);
  assert.ok(numbers.every((n) => ![20, 52, 57].includes(n)));
  assert.ok(
    replacementProfiles.every(
      ({ sources }) =>
        sources.length &&
        sources.every(({ date }) => date <= preparationCutoff),
    ),
  );
});

import { replacementProfiles2025 } from "../src/server/assessment/updated-pyq-2025";
import { prepareHistoricalWriting } from "../src/server/assessment/historical-written-generation";

test("each preparation-year pack keeps the documented replacement slots and its evidence cutoff", () => {
  assert.deepEqual(
    replacementProfiles2025.map(({ number }) => number),
    replacementProfiles.map(({ number }) => number),
  );
  assert.ok(
    replacementProfiles2025.every(
      ({ sources, rationale }) =>
        rationale.length &&
        sources.length &&
        sources.every(({ date }) => date <= "2025-12-31"),
    ),
  );
  const source = (items: typeof replacementProfiles) =>
    items.find(({ number }) => number === 82)!.sources[0];
  assert.equal(source(replacementProfiles2025).date, "2025-11-10");
  assert.equal(source(replacementProfiles).date, "2026-11-13");
});

test("a historical guide rejects missing or mismapped booklet questions", async () => {
  const slot = {
    label: "Question 3",
    stem: "",
    marks: 10,
    wordLimit: 150,
    sourcePath: "syllabus.md",
    sourceHeading: "scope",
  };
  const fixture = { mimeType: "application/pdf", data: "fixture" };
  const draft = {
    label: slot.label,
    readable: true,
    summary: "Explain the original issue.",
    reference: "A worked answer.",
    criteria: [
      { description: "Method", marks: 6 },
      { description: "Application", marks: 4 },
    ],
  };
  const generator = (label: string, readable: boolean, valid: boolean) => {
    let reviewed = false;
    return async (
      _prompt: string,
      _schema: object,
      files: (typeof fixture)[],
    ) => {
      assert.deepEqual(files, [fixture]);
      if (reviewed) return { items: [{ label: slot.label, valid }] };
      reviewed = true;
      return { items: [{ ...draft, label, readable }] };
    };
  };
  const exam = await prepareHistoricalWriting(
    generator(slot.label, true, true),
    fixture,
    [slot],
    "English",
  );
  assert.equal(exam.questions[0].label, slot.label);
  assert.deepEqual(exam.guide[0].criteria, draft.criteria);
  await assert.rejects(
    prepareHistoricalWriting(
      generator("Question 2", true, true),
      fixture,
      [slot],
      "English",
    ),
    /original question/,
  );
  await assert.rejects(
    prepareHistoricalWriting(
      generator(slot.label, false, true),
      fixture,
      [slot],
      "English",
    ),
    /original question/,
  );
  await assert.rejects(
    prepareHistoricalWriting(
      generator(slot.label, true, false),
      fixture,
      [slot],
      "English",
    ),
    /independent verification/,
  );
});

import { reviewMaterial } from "../src/modules/assessment/refresher-review";

test("feedback review uses the displayed practice item and skips dropped or letter-only items", () => {
  const question = {
    stem: "Explain the label",
    options: ["One", "Two", "Three", "Four"],
    sourcePath: "syllabus.md",
    sourceHeading: "",
  };
  const feedback = { awarded: 0, feedback: "Review what the label measures." };
  assert.equal(reviewMaterial(question, feedback, 8)?.id, "review-question-9");
  assert.match(reviewMaterial(question, feedback, 8)!.text, /B\. Two/);
  assert.equal(
    reviewMaterial(question, { ...feedback, excluded: true }, 8),
    null,
  );
  assert.equal(
    reviewMaterial({ ...question, options: ["A", "B", "C", "D"] }, feedback, 8),
    null,
  );
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

test("official dropped questions carry no penalty and stay outside attempt totals", () => {
  const result = scoreObjective(
    "Prelims-General-Studies-I",
    [key[0], { correctOption: null, explanation: "Dropped" }, key[2]],
    { "0": 0, "1": 1 },
  );
  assert.equal(result.score, 12);
  assert.equal(result.feedback.correct, 1);
  assert.equal(result.feedback.wrong, 0);
  assert.equal(result.feedback.blank, 1);
  assert.equal(result.feedback.dropped, 1);
  assert.equal(result.feedback.items[1].excluded, true);
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

test("a published objective key can accept either of two single answers", () => {
  const key = [
    {
      correctOption: 2,
      alternateCorrectOption: 3,
      explanation: "The published key accepts C or D.",
    },
  ];
  for (const answer of [2, 3]) {
    const result = scoreObjective("Prelims-CSAT", key, { 0: answer });
    assert.equal(result.score, 15);
    assert.equal(result.feedback.correct, 1);
  }
  assert.equal(scoreObjective("Prelims-CSAT", key, { 0: 1 }).score, -5);
  assert.equal(scoreObjective("Prelims-CSAT", key, {}).feedback.blank, 1);
});
