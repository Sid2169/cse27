# Prelims Test Generation Instructions

Generate an on-demand chapter-part test for Prelims GS-I or CSAT. Apply the shared assessment rules in [AGENTS.md](AGENTS.md); feedback uses [PRELIMS-TEST-FEEDBACK.md](PRELIMS-TEST-FEEDBACK.md).

## Scope and Duration

One test covers one chapter part, or the whole chapter if unsplit. Choose a duration of **30–60 minutes** and a question count appropriate to the taught scope, reading load and calculation or diagram demands. These are chapter tests, not full-length mocks. If the content cannot sustain a worthwhile test within that duration, explain the readiness problem rather than pad it.

Record the sections assessed. For further tests on the same part, consult earlier coverage to avoid accidental repetition; a broad part can be sampled through multiple requested tests.

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

The penalty is one-third of the question's marks. These follow the documented Prelims baseline; use the official notice linked from the [GS-I curriculum](Prelims-General-Studies-I/Prelims-General-Studies-I-Curriculum.md#paper-metadata) and recheck if UPSC changes the rule.

## IDs and File Contract

| Paper | ID format | Folder |
|---|---|---|
| GS-I | `GS1-<chapter-slug>-p<part>-t<nn>` | `Prelims-General-Studies-I/Prelims-General-Studies-I-TESTS/` |
| CSAT | `CSAT-<chapter-slug>-p<part>-t<nn>` | `Prelims-CSAT/Prelims-CSAT-TESTS/` |

Use a stable lowercase hyphenated chapter slug, `p1` for an unsplit chapter, and the next unused test number. The filename is `<test-id>.md`.

Include metadata for ID, paper, linked chapter/part, coverage, duration, question count, maximum marks, marking rule, generation date and attempt status. Then provide:

- `## Instructions`: one sitting, no aids or key consultation, exactly one `[x]` checkbox per question, blanks unattempted.
- `## Questions`: numbered questions with checkbox options, such as `- [ ] (a) ...`.
- A labelled `<details>` block containing the answer key and explanations. Each entry identifies the answer, topic and relevant chapter section, and explains the reasoning. Demand/format tags are optional when useful for later diagnosis.
- `## Feedback`: initially note that feedback has not been requested.

## Completion Check

Independently solve each item and check ambiguity, distractors, scope and explanation accuracy. Check the duration/load, count and marks arithmetic, ID uniqueness and file location. Ensure answers are not exposed in the question section.
