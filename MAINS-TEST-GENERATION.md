# Mains Test Generation Instructions

Generate on-demand descriptive tests for **Mains GS I–IV**. Apply the shared assessment rules in [AGENTS.md](AGENTS.md). Evaluation uses [MAINS-ANSWER-EVALUATION.md](MAINS-ANSWER-EVALUATION.md); Essay, language and optional papers require separate assessment methods.

## Modes and Patterns

This table is authoritative for these practice modes. The full-paper baseline comes from [UPSC previous question papers](https://www.upsc.gov.in/examinations/previous-question-papers), accessed 13 November 2026; check a new official paper if its pattern changes. Chapter-test sizes are repository practice choices, not official patterns.

| Mode | Scope | Duration | GS I–III | GS IV |
|---|---|---|---|---|
| `CH` | One chapter, all parts | **2 hours** | Default: 12 questions, 150 marks, 6 × 10 + 6 × 15. Fallback: 10 questions, 125 marks, 5 × 10 + 5 × 15. | Default: 12 answer items, 150 marks, 9 theory × 10 + 3 cases × 20. Fallback: 10 answer items, 120 marks, 8 theory × 10 + 2 cases × 20. |
| `CUM` | Learner-confirmed completed chapters/parts | **3 hours** | 20 questions, 250 marks, 10 × 10 + 10 × 15 | 12 numbered questions, 19 answer items, 250 marks: 13 theory × 10 + 6 cases × 20 |
| `FULL` | Entire GS paper | **3 hours** | Same full-paper pattern as `CUM` | Same full-paper pattern as `CUM` |

All questions and sub-parts are compulsory. GS I–III word limits are 150 for 10 marks and 250 for 15 marks. GS IV uses 150 words for a 10-mark theory item and 250 for a 20-mark case study. There is no negative marking.

### Readiness and Coverage

- **CH:** represent every part and the chapter's major learning demands. Use the fallback only if the default would require padding or repetition. If even the fallback is unsupported, explain the readiness problem; do not shorten the chosen duration or import untaught material.
- **CUM:** obtain an exact completed-content list; file existence is not completion. Sample across that coverage, including earlier material and useful integration. If it cannot sustain the specified pattern, explain why and suggest a chapter test without silently changing modes.
- **FULL:** build a balanced blueprint from the whole syllabus and defensible PYQ evidence, rather than fixed predicted weightage. If taken before full coverage, label it diagnostic. Date any current-affairs cutoff.

Record a concise coverage blueprint. Consult previous tests to vary themes and contexts where useful. No single paper needs a question for every syllabus microtopic, but the blueprint must represent the mode's scope.

## Question Design

Use clear directives, realistic demands and marks/word limits on every answer item. Ask questions that can be answered well within those limits. Select factual, explanatory, analytical or evaluative demands according to the topic instead of forcing every question into one style.

For GS IV, use substantive ethical or administrative scenarios. Their sub-parts should test the relevant dilemmas and reasoning, not require an identical stakeholders–options–decision–safeguards template in every case. Ask for a decision and justification when those are the intended skills; allow defensible alternative responses.

For **CUM/FULL GS IV only**, use Section A Q1–Q6 containing 13 theory sub-parts, and Section B Q7–Q12 containing the six cases. Chapter tests use numbering suited to their own counts. This full-paper layout does not override the CH pattern.

## Pre-attempt Evaluator Guide

For each answer item, provide:

- The demand and essential answer dimensions, with sufficient factual/source support to evaluate them.
- **Question-specific criteria and mark allocations**, totalling the item's marks, with a short description of what earns credit or partial credit. Select criteria for this question; there are no fixed global dimension weights.
- Acceptable approaches or alternatives and any consequential errors to watch for.

For a case study, allocate marks to its requested sub-parts so they sum to the case total; any criteria within them must fit those allocations. Avoid overlapping criteria or awarding the same merit twice. External examples, formal introductions/conclusions, lists of options or particular headings earn marks only when relevant to the actual demand. Do not impose generic score caps or one predetermined ethical choice.

The guide defines an answer space, not an exhaustive checklist or a model answer. Keep it as short as reliable evaluation permits. It must contain the allocations before the learner attempts the paper; scoring follows the evaluation method.

## IDs and File Contract

Use `GS1`, `GS2`, `GS3` or `GS4` for the paper prefix:

- `GS1-CH-<chapter-slug>-T01`
- `GS1-CUM-T01`
- `GS1-FULL-T01`

Increment to the next unused number. Store `<test-id>.md` in the corresponding `Mains-General-Studies-<I|II|III|IV>/Mains-General-Studies-<I|II|III|IV>-TESTS/` folder.

Include ID, paper, mode, linked chapters/parts, blueprint, duration, answer-item count, maximum marks, word limits, answer language, generation date and status. Write questions in English by default; record a different requested language.

Use `## Instructions`, `## Questions`, `## Evaluator guide` and `## Evaluation`. Instructions specify one sitting without aids or guide consultation and answering all items within their word limits. Put the guide inside its labelled collapsible block. The evaluation section initially records that no evaluation has been requested. The rest of the layout can suit the paper.

## Completion Check

Check readiness, scope, question clarity and diversity, and correctness of guide content. Verify the requested mode against the table, including item counts, marks, numbering, duration and word limits. Check every question's allocation sum, non-overlapping criteria, ID uniqueness and file location.
