# Prelims Test Generation Instructions

Generate on-demand Prelims tests: chapter-part tests for GS-I or CSAT, and full-length GS-I mocks. Apply the shared assessment rules in [AGENTS.md](AGENTS.md); feedback uses [PRELIMS-TEST-FEEDBACK.md](PRELIMS-TEST-FEEDBACK.md).

## Chapter-Part Scope and Duration

One test covers one chapter part, or the whole chapter if unsplit. Choose a duration of **30–60 minutes** and a question count appropriate to the taught scope, reading load and calculation or diagram demands. These are chapter tests, not full-length mocks. If the content cannot sustain a worthwhile test within that duration, explain the readiness problem rather than pad it.

Record the sections assessed. For further tests on the same part, consult earlier coverage to avoid accidental repetition; a broad part can be sampled through multiple requested tests.

## Full-Length GS-I Scope and Design

Generate a full-length GS-I mock only on request. It is a standalone paper: one sitting, **2 hours**, **100 four-option MCQs**, **200 marks**; it does not include CSAT. Authored chapters are not a readiness gate because this mode follows the official paper, not a chapter sequence. Label it `diagnostic` when taken before full coverage; never present a cutoff prediction.

Before drafting, record a 100-question blueprint. Use the [official syllabus and pattern](Prelims-General-Studies-I/Prelims-General-Studies-I-Curriculum.md#paper-metadata) as the boundary, the [2013–2026 PYQs](Prelims-General-Studies-I/Prelims-General-Studies-I-PYQS/) for recurring formats and breadth, and the [curriculum evidence](Prelims-General-Studies-I/Prelims-General-Studies-I-Curriculum.md#evidence-used-to-set-emphasis) for registered StudyIQ/VisionIAS analyses and conventional references. Treat publisher subject counts as one-year evidence, not fixed weightage; do not add overlapping current-affairs and subject percentages. Represent all seven syllabus areas, interleave them across the paper, and vary the blueprint between mocks.

Set and date a current-affairs cutoff; default to the 12 months before generation and state that this is a practice convention. Tie current events to syllabus concepts. Write new items in PYQ style rather than copying questions. Use maps, tables, chronology and statement-based formats where the topic warrants; supply unfamiliar data needed for reasoning. Keep options plausible and comparable in length, with one defensible answer. Avoid time-sensitive facts without a stated reference date.

Number questions 1–100 continuously without subject headings. Put the pre-attempt key in a labelled `<details>` block as a table of question number, answer, topic/syllabus area and a one-line rationale; cite a dated source for time-sensitive items. Keep explanations out of the question section.

## Question Standard

- Write in English. Use four-option MCQs labelled `(a)`–`(d)`, with exactly one defensible correct option.
- Select formats and demand levels appropriate to the topic and UPSC style; no fixed mix of retrieval, application or formats is required.
- Make distractors plausible and wording clear. Sound elimination is legitimate; avoid unintended answer cues or implausible distractors that bypass the intended knowledge or skill.
- Novel scenarios, passages, maps and data may test taught knowledge or skills. Supply unfamiliar information required for reasoning; do not require untaught background facts. CSAT comprehension should be answerable from the supplied passage.
- For any time-sensitive question, state the relevant date or reference period so its answer remains interpretable.

## Marking

| Paper | Correct answer | Wrong or multiple responses | Blank |
|---|---:|---:|---:|
| GS-I | +2 | −2/3 | 0 |
| CSAT | +2.5 | −2.5/3 | 0 |

The GS-I row applies to chapter-part and full-length tests; the CSAT row applies only to chapter-part tests. The penalty is one-third of the question's marks. These follow the documented Prelims baseline; use the official notice linked from the [GS-I curriculum](Prelims-General-Studies-I/Prelims-General-Studies-I-Curriculum.md#paper-metadata) and recheck if UPSC changes the rule.

## IDs and File Contract

| Mode | ID format | Folder |
|---|---|---|
| GS-I chapter-part | `GS1-<chapter-slug>-p<part>-t<nn>` | `Prelims-General-Studies-I/Prelims-General-Studies-I-TESTS/` |
| GS-I full paper | `GS1-full-t<nn>` | `Prelims-General-Studies-I/Prelims-General-Studies-I-TESTS/` |
| CSAT chapter-part | `CSAT-<chapter-slug>-p<part>-t<nn>` | `Prelims-CSAT/Prelims-CSAT-TESTS/` |

Use a stable lowercase hyphenated chapter slug, `p1` for an unsplit chapter, and the next unused test number for that mode. The filename is `<test-id>.md`.

For chapter-part tests, include metadata for ID, paper, linked chapter/part, coverage, duration, question count, maximum marks, marking rule, generation date and attempt status. For full-length tests, include ID, paper, mode, blueprint, current-affairs cutoff, any `diagnostic` label, duration, question count, maximum marks, marking rule, generation date and attempt status. Then provide:

- `## Instructions`: one sitting, no aids or key consultation, exactly one `[x]` checkbox per question, blanks unattempted.
- `## Questions`: numbered questions with checkbox options, such as `- [ ] (a) ...`.
- A labelled `<details>` block containing the answer key and explanations. Each entry identifies the answer and topic, plus the relevant chapter section for chapter-part tests, and explains the reasoning. Demand/format tags are optional when useful for later diagnosis.
- `## Feedback`: initially note that feedback has not been requested.

## Completion Check

Independently solve each item and check ambiguity, distractors, scope and explanation accuracy. Check the duration/load, count and marks arithmetic, ID uniqueness and file location. Ensure answers are not exposed in the question section.

For a full-length mock, also verify 100 questions, 200 marks and 2 hours; continuous numbering; all seven syllabus areas in the blueprint; the dated current-affairs cutoff; source support for time-sensitive keys; and absence of verbatim PYQs.
