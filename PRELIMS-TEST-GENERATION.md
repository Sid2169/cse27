# Prelims Test Generation Instructions

Method for generating on-demand chapter-part practice tests for Prelims General Studies I and CSAT. Repository rules live in `AGENTS.md`; chapter content follows `CHAPTER-GENERATION.md`; feedback follows `PRELIMS-TEST-FEEDBACK.md`.

## Purpose

- Simulate exam conditions for one chapter part, not a full-length mock.
- Generate tests only on demand; there is no fixed number or schedule.
- Write tests in English only.
- Test only what the chapter part teaches. Do not introduce cross-chapter or external facts.
- Use PYQs to calibrate question style and difficulty, not to copy questions.
- Prefer stable concepts. Test dynamic content only when the chapter includes it, and mark it clearly.

## Test Unit, ID, and Location

- One test covers exactly one chapter part. If the chapter is unsplit, the part is the whole chapter.
- Multiple tests may be generated for the same part. Each gets a new unique ID.
- ID format: `GS1-<chapter-slug>-p<part>-t<nn>` or `CSAT-<chapter-slug>-p<part>-t<nn>`.
- Filename: `<test-id>.md`.
- Store tests under:
  - `Prelims-General-Studies-I/Prelims-General-Studies-I-TESTS/`
  - `Prelims-CSAT/Prelims-CSAT-TESTS/`
- `<chapter-slug>` is lowercase and hyphenated, derived from the chapter title and kept stable. Never reuse an ID.
- If one part cannot be assessed properly within 60 minutes, generate another test for the same part with the next `t<nn>`.
- Record the sections covered in the test metadata so multiple tests do not silently repeat or omit content.

## Duration and Question Count

- The model decides the duration from the part's scope, conceptual density, reading load, and calculation or diagram load. Keep it between 30 and 60 minutes.
- Use 30 minutes for narrow or foundational parts, 45 for medium parts, and 60 for broad or dense parts.
- As planning anchors, allow about 1.2 minutes per GS-I question and 1.5 minutes per CSAT question. Adjust for calculation-heavy or diagram-heavy questions.
- Do not pad the test. Do not produce full-length 100-question GS-I or 80-question CSAT papers.
- State duration, question count, and maximum marks in the test metadata.

## Question Blueprint

- Use four-option MCQs only, labelled `(a)` to `(d)`.
- Use the formats UPSC Prelims actually uses: direct questions, statement-based questions, matching, assertion-reason, sequence or pair-counting, and map, chart, or diagram-based questions where the chapter supports them.
- For CSAT, include comprehension, data interpretation, logical reasoning, and quantitative formats where the chapter requires them. An unseen comprehension passage is in scope only when the chapter teaches comprehension; questions must test the chapter's skill, not outside facts.
- Cover a deliberate spread from retrieval through concept application to higher-order understanding. Do not let one level dominate, and do not force a level the part cannot support.
- One option must be unambiguously correct and the distractors plausible. Avoid trick wording, ambiguous options, and questions answerable by elimination alone.
- Every question must stay within the chapter part's scope, and every explanation must tie back to it. For CSAT comprehension, the unseen passage is part of the question, not outside syllabus.
- Cite the relevant chapter section in the key.
- Do not copy PYQs. Reuse their style and demand level.
- For dynamic material, test stable understanding rather than expiring facts. If a dynamic fact must be tested, bracket it as `[DYNAMIC: ...]` and date it.

## Marking

- Prelims GS-I: 2 marks per question; one-third negative for a wrong answer.
- Prelims CSAT: 2.5 marks per question; one-third negative for a wrong answer.
- Unattempted questions carry zero.
- Report the marking rule in the test metadata. Scoring is handled by `PRELIMS-TEST-FEEDBACK.md`.

## Test File Structure

```markdown
# <test-id> — <chapter / part>

- **Test ID:** ...
- **Paper:** Prelims General Studies I / CSAT
- **Chapter:** link to the chapter file
- **Part:** ...
- **Coverage:** ...
- **Duration:** ... minutes
- **Questions:** ...
- **Maximum marks:** ...
- **Marking:** ... per correct; one-third negative
- **Generated:** YYYY-MM-DD
- **Status:** Unattempted

## Instructions

- Complete the test in one sitting within the stated time.
- Do not use notes, books, search, or the answer key.
- Mark exactly one checkbox per question with `[x]`.
- A blank question is unattempted.
- Do not open the answer key until the test is finished.

## Questions

1. Question text...
   - [ ] (a) ...
   - [ ] (b) ...
   - [ ] (c) ...
   - [ ] (d) ...

<details>
<summary>Answer key and explanations</summary>

| Q | Answer | Topic | Level | Format | Dynamic | Explanation |
|---|---|---|---|---|---|---|
| 1 | (b) | ... | Retrieval | Direct | No | ... |

</details>

## Feedback

_Not generated. Request feedback after attempting the test._
```

- Keep the answer key inside a single collapsible block.
- Include topic, demand level, format, and dynamic tags in the key; feedback depends on them.
- Do not place answers or explanations in the question section.
- Write questions, options, instructions, and explanations in English only.

## Before Finishing

- Every question stays within the tested part's scope; CSAT passage questions draw their evidence from the passage.
- The test contains only four-option MCQs with one correct answer.
- Duration, count, and marks are consistent and within the 30–60 minute limit.
- Every answer and explanation is correct and tied to a chapter section.
- Topic, level, and format tags are present for every question.
- Dynamic questions, if any, are flagged and dated.
- The test ID is unique and the file is in the correct paper's TESTS folder.
- No feedback is generated at test creation.

## Boundaries

- Do not generate a test before the relevant chapter part exists.
- Do not create full-length mocks or fixed test series; tests are on demand.
- Do not test material outside the chapter part.
- Do not reveal answers in the question section.
- Do not generate feedback here; feedback is a separate on-demand step.
- Do not commit; commits happen only when the operator asks.
