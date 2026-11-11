# Mains Test Generation Instructions

Method for generating on-demand Mains General Studies tests for GS I–IV. Repository rules live in `AGENTS.md`; chapter content follows `CHAPTER-GENERATION.md`; evaluation follows `MAINS-ANSWER-EVALUATION.md`. This file does not cover the Essay paper or the compulsory language papers.

GS I–III follow the 20-question pattern: 10 × 10 marks + 10 × 15 marks. GS IV follows the official 12-numbered-question pattern: Section A has Q1–Q6 with 13 answerable sub-parts at 10 marks each, and Section B has Q7–Q12, six case studies at 20 marks each; 19 answer items and 250 marks in total. Source: [UPSC previous question papers](https://www.upsc.gov.in/examinations/previous-question-papers).

## Purpose

- Generate subjective Mains tests, not objective Prelims tests.
- Use three paper modes: chapter-specific, syllabus-covered-so-far, and full-syllabus.
- Generate only on demand; the learner chooses the mode.
- Use the syllabus, curriculum, and chapter parts for scope; use PYQs for style and weightage.
- Write question papers in English by default. Record the answer language; evaluate an answer in the language in which it is written.

## Paper Modes

| Mode | Scope | Duration | GS I–III paper | GS IV paper | Coverage rule |
|---|---|---|---|---|---|
| `CH` — Chapter-specific | One chapter, including all its parts | 2 hours | 12 questions, 150 marks; 6 × 10 + 6 × 15 | 12 answer items, 150 marks; 9 theory × 10 + 3 case studies × 20 | Every part represented; no material outside the chapter |
| `CUM` — Covered so far | Chapters and parts completed so far | 3 hours | 20 questions, 250 marks; 10 × 10 + 10 × 15 | 19 answer items, 250 marks; 13 theory × 10 + 6 case studies × 20, in 12 numbered questions | No untaught content; sample all completed phases |
| `FULL` — Full syllabus | Entire GS paper | 3 hours | 20 questions, 250 marks; 10 × 10 + 10 × 15 | 19 answer items, 250 marks; 13 theory × 10 + 6 case studies × 20, in 12 numbered questions | Full syllabus blueprint from PYQ weightage; rotate themes |

- `CH` fallback when the chapter cannot support the default without repetition: GS I–III use 10 questions and 125 marks (5 × 10 + 5 × 15); GS IV uses 10 answer items and 120 marks (8 theory × 10 + 2 case studies × 20). Do not pad.
- For `CUM` and `FULL`, all questions and sub-parts are compulsory, as in the actual GS papers.
- A `CH` paper simulates time pressure, not the full 3-hour examination. Do not call it a full mock.
- Do not silently change the mode. If the requested mode is not ready, say why and offer alternatives.

## Readiness Gates

- `CH`: the chapter and its parts must exist. If the chapter is too narrow for a valid paper, use the paper-specific fallback; if that is still not possible, refuse the test rather than repeat questions. A GS IV chapter must support at least two case studies for the fallback.
- `CUM`: the learner must supply the exact list of completed chapters or parts. Do not infer coverage from file existence. If the list cannot support the paper-specific default without repetition or untaught content, warn and suggest `CH`. Do not drop the GS IV case studies to make the paper fit.
- `FULL`: intended for use after full syllabus coverage. If generated earlier, label it **diagnostic**; do not treat its score as exam-equivalent.
- Never include untaught content in `CUM`. Never describe a `CH` or `CUM` paper as a full-syllabus mock.

## Paper Blueprint

Build the blueprint before writing questions.

### Chapter-specific

- Distribute questions across every part of the chapter.
- Cover the chapter's major concepts, mechanisms, debates, examples, and applications.
- GS I–III: include both 10-mark and 15-mark questions.
- GS IV: include both 10-mark theory items and 20-mark case studies.
- Do not import questions from other chapters merely to fill the paper.
- Relevant cross-links inside an answer are allowed, but the questions themselves stay within the chapter.

### Covered-so-far

- Include only completed chapters and parts.
- Sample every completed phase; do not over-test the most recent chapter.
- Preserve older material through retention questions and cross-chapter integration.
- Keep a coverage ledger in the test metadata: chapters or parts used, themes used, and question types.
- If the covered syllabus is too small for the paper-specific default without repetition, do not pad with untaught material; warn and suggest `CH`.

### Full-syllabus

- Cover the whole paper using the syllabus structure and PYQ weightage already recorded in the paper's PYQ files.
- GS I–III: use the 10-mark and 15-mark split and word limits.
- GS IV: use 12 numbered questions and 19 answer items, with 13 theory sub-parts at 10 marks and six case studies at 20 marks. Do not replace case studies with 15-mark essays.
- Rotate themes across successive full mocks; do not copy PYQs.
- Include syllabus-linked current developments only with a dated cutoff in the metadata.
- Do not let current affairs displace static syllabus coverage.

## Question Design

- Use the directive words UPSC uses: discuss, examine, critically examine, analyse, evaluate, compare, comment, elucidate, explain, justify, and similar.
- Make the directive and scope unambiguous. Avoid vague questions and double-barrelled questions unless the paper style supports them.
- One question or sub-part must be answerable within its mark and word limit.
- State marks and word limits for every question and sub-part.
- GS I–III: use 150 words for 10-mark questions and 250 words for 15-mark questions.
- GS IV: use 150 words for 10-mark theory sub-parts and 250 words for 20-mark case studies.
- GS IV theory must be numbered Q1–Q6 with 13 answerable sub-parts. GS IV case studies must be Q7–Q12, each a realistic administrative or ethical scenario with a clear decision demand; include sub-parts for stakeholders or issues, options, decision, and justification. Do not write a case study as a long essay prompt.
- Use relevant examples, data, reports, judgments, maps, or diagrams only where the question and chapter support them.
- Do not use MCQs, one-word answers, or objective formats.
- Do not reproduce PYQs verbatim. Reuse their demand level and style.
- Date dynamic facts and flag them in the metadata.

## Test IDs and Location

- Store tests under the relevant paper folder:
  - `Mains-General-Studies-I/Mains-General-Studies-I-TESTS/`
  - `Mains-General-Studies-II/Mains-General-Studies-II-TESTS/`
  - `Mains-General-Studies-III/Mains-General-Studies-III-TESTS/`
  - `Mains-General-Studies-IV/Mains-General-Studies-IV-TESTS/`
- Filename: `<test-id>.md`.
- ID formats:
  - `GS1-CH-<chapter-slug>-T01`
  - `GS1-CUM-T01`
  - `GS1-FULL-T01`
- Use `GS2`, `GS3`, or `GS4` for the other papers. Increment `T01`, `T02`, and so on. Never reuse an ID.

## Test File Structure

```markdown
# <test-id> — <paper> — <mode>

- **Test ID:** ...
- **Paper:** Mains General Studies I / II / III / IV
- **Mode:** Chapter-specific / Covered so far / Full syllabus
- **Pattern:** 20 questions, 10 × 10 + 10 × 15 / 12 numbered questions, 19 answer items, 13 × 10 + 6 × 20
- **Scope:** ...
- **Included chapters or parts:** ...
- **Blueprint:** ...
- **Duration:** ... minutes
- **Questions:** ... questions or answer items
- **Maximum marks:** ...
- **Marking:** No negative marking; marks as indicated per question
- **Word limits:** 150 / 250 words
- **Answer language:** English / Hindi
- **Generated:** YYYY-MM-DD
- **Status:** Unattempted

## Instructions

- Complete the paper in one sitting within the stated time.
- Do not use notes, books, search, or the evaluator guide.
- Answer every question and sub-part.
- Follow the word limit for each question or case study.
- Write the answers by hand or type them, as recorded in the attempt.
- Do not open the evaluator guide until the attempt is finished.

## Questions

### GS I–III layout

1. Question text. **(10 marks, 150 words)**
2. Question text. **(10 marks, 150 words)**
...
11. Question text. **(15 marks, 250 words)**
12. Question text. **(15 marks, 250 words)**

### GS IV layout

#### Section A — Theory

1. (a) Question text. **(10 marks, 150 words)**
1. (b) Question text. **(10 marks, 150 words)**
2. (a) Question text. **(10 marks, 150 words)**
2. (b) Question text. **(10 marks, 150 words)**
3. (a) Question text. **(10 marks, 150 words)**
3. (b) Question text. **(10 marks, 150 words)**
3. (c) Question text. **(10 marks, 150 words)**
4. (a) Question text. **(10 marks, 150 words)**
4. (b) Question text. **(10 marks, 150 words)**
5. (a) Question text. **(10 marks, 150 words)**
5. (b) Question text. **(10 marks, 150 words)**
6. (a) Question text. **(10 marks, 150 words)**
6. (b) Question text. **(10 marks, 150 words)**

#### Section B — Case Studies

7. Case study text. **(20 marks, 250 words)**
   (a) Sub-part.
   (b) Sub-part.
...
12. Case study text. **(20 marks, 250 words)**
    (a) Sub-part.
    (b) Sub-part.

## Evaluator guide

<details>
<summary>Evaluator guide — do not open before attempting</summary>

### Q1(a) — 10 marks, 150 words

- **Syllabus / curriculum:** ...
- **Chapter part:** ...
- **Directive:** ...
- **Expected dimensions:** ...
- **Core points:** ...
- **Value-add points:** ...
- **Acceptable alternatives:** ...
- **Traps and errors:** ...
- **Caps:** ...
- **Sources:** ...

### Q7 — 20 marks, 250 words

- **Syllabus / curriculum:** ...
- **Chapter part:** ...
- **Directive:** ...
- **Stakeholders:** ...
- **Ethical issues and conflicts:** ...
- **Options:** ...
- **Recommended action:** ...
- **Justification and principles:** ...
- **Implementation and safeguards:** ...
- **Acceptable alternatives:** ...
- **Traps and errors:** ...
- **Caps:** ...
- **Sources:** ...

</details>

## Evaluation

_Not generated. Submit the attempted answers for evaluation under `MAINS-ANSWER-EVALUATION.md`._
```

- The evaluator guide is not a model answer. It defines the expected answer space, core dimensions, and evidence standard.
- Write the guide before the learner answers. Never invent it after seeing the answer.
- Keep the guide hidden until the attempt is complete.
- For GS IV case studies, pre-write the stakeholders, ethical issues, options, recommended action, justification, and implementation standard. Do not require one predetermined option when another is defensible.
- Do not include a full model answer unless the learner separately asks for one after evaluation.

## Quality Check

- The requested mode is valid for the available content.
- `CH` covers every chapter part and uses only that chapter.
- `CUM` lists only completed chapters or parts and does not use untaught material.
- `FULL` covers the whole paper and uses a defensible blueprint.
- Duration, question count, marks, and word limits match the mode and paper.
- GS I–III use 20 questions, 10 × 10 + 10 × 15, with 150/250 word limits.
- GS IV uses 12 numbered questions, 19 answer items, 13 × 10 + 6 × 20, with 150/250 word limits and no 15-mark items.
- All questions and sub-parts are compulsory.
- Directives are clear and varied.
- No PYQ is copied verbatim.
- Every question or answer item has a pre-written evaluator guide.
- Every GS IV case study has a stakeholder, issues, options, decision, justification, and implementation guide.
- Dynamic facts are dated and flagged.
- The test ID is unique and the file is in the correct paper's TESTS folder.
- No evaluation or marks are generated at test creation.

## Boundaries

- Do not cover Essay or language papers here; they need separate methods.
- Do not generate objective questions or use Prelims negative marking.
- Do not import untaught content into a `CUM` paper.
- Do not call a `CH` or `CUM` paper a full mock.
- Do not use the GS I–III 10/15 split for GS IV, or the GS IV 10/20 split for GS I–III.
- Do not replace GS IV case studies with 15-mark essays or drop them to shorten the paper.
- Do not generate a rubric after the answer.
- Do not silently switch modes.
- Do not commit; commits happen only when the operator asks.
