# Prelims Test Generation

Generate GS-I or CSAT tests on request. Use [shared generation procedures](TEST-GENERATION-COMMON.md) for CH, CUM, FULL, PYQ, UPYQ and FU; [AGENTS.md](AGENTS.md) for safeguards; [PRELIMS-TEST-FEEDBACK.md](PRELIMS-TEST-FEEDBACK.md) for evaluation. MCQ chapter checkpoints have their own method.

## Pattern and Marking

CH/CUM sizes and durations scale to taught coverage. FULL follows the selected paper's verified pattern; the preparation baselines are:

| Paper | Questions | Marks | Duration | Correct | Wrong/multiple | Blank |
|---|---:|---:|---|---:|---:|---:|
| GS-I | 100 | 200 | 2 hours | +2 | −2/3 | 0 |
| CSAT | 80 | 200 | 2 hours | +2.5 | −5/6 | 0 |

Use these per-item marks for generated CH/CUM/FULL tests. For historical papers, preserve that year's instructions and marking, including any exceptions. FU completion uses accuracy over all questions under the specification, not the net-score percentage or attempted accuracy; declare its scoring before presentation.

Pattern sources and limitations are recorded in the [GS-I curriculum](Prelims-General-Studies-I/Prelims-General-Studies-I-Curriculum.md#paper-metadata) and [CSAT curriculum](Prelims-CSAT/Prelims-CSAT-Curriculum.md#1-understand-the-paper-and-begin). They reference the 2026 notification and local PYQs. Recheck the official notification/booklet if the pattern changes; do not describe an editorial update as fresh source verification.

## Question Design

Write in English by default, using four options `(a)`–`(d)` and one defensible answer. Preserve source wording and instructions in historical modes. Use plausible distractors, clear wording and varied demands suited to the topic; avoid unintended cues and fixed format quotas.

- **GS-I:** calibrate syllabus breadth, factual depth, reasoning and reading load against PYQs with their caveats. FULL blueprints cover all seven syllabus areas without fixed predicted weightage. Interleave subjects and vary contexts between tests. Date current-affairs cutoffs and sources; the default 12-month window before generation is a practice convention, adjustable on request.
- **CSAT:** balance comprehension, reasoning, numeracy and data interpretation against the syllabus/PYQs without fixed topic quotas. Supply complete passages, shared directions, diagrams and data. Comprehension must be answerable from its passage; independently verify calculations, assumptions and all plausible cases.

Full papers should approximate UPSC demand, including a realistic difficulty spread. A diagnostic label is not a reason to simplify them. Difficulty calibration is editorial, not score equating or a cutoff prediction.

## Key and Recording

Before presentation, independently solve every item and prepare its correct option, explanation and topic; add relevant section links for chapter/cumulative/follow-up tests and sources for consequential facts. Keep explanations out of the question section. Key visibility follows AGENTS.md and the application's access requirements.

Use `GS1` or `CSAT` prefixes: `<prefix>-CH-<chapter-slug>-T01` for chapters and `<prefix>-<mode>-T01` otherwise, incrementing to the next unused ID. Keep existing IDs and historical attempts unchanged. Store new repository tests in the paper's `<paper-name>-TESTS/` folder, retaining `Prelims-General-Studies-I/full-test/` for GS-I FULL tests.

Record paper, mode, chapter revisions where applicable, coverage/blueprint, question count, duration, maximum marks, marking, generation/source dates, any cutoff/diagnostic label and status. Include source/target years for PYQ variants. Use `## Instructions`, `## Questions`, a labelled collapsible key and `## Feedback`; number questions continuously and use checkbox options. Application attempts use the specification's timed-session/autosave rules; repository files cannot enforce a timer. These recording rules apply to real-paper simulations. FU uses the parent simulation feedback during transient processing; create no permanent test ID, file or attempt record.

Check scope, freshness where required, question/key validity, sources, count/marks arithmetic, workload, ID uniqueness and links. Use the paper-specific FULL count rather than assuming every paper has 100 questions.
