# Prelims Test Feedback Instructions

Method for generating feedback on demand for a completed Prelims chapter test. Read the test file and the learner's marked answers, then append the feedback directly to that test file. Repository rules live in `AGENTS.md`; tests follow `PRELIMS-TEST-GENERATION.md`.

## Purpose

- Diagnose performance, not merely report a percentage.
- Write feedback in English.
- Identify what the learner knows, what is weak, why errors happened, and what to do next.
- Produce a short remediation plan and a spaced retest schedule.
- Record the feedback in the test file so the attempt and its diagnosis stay together.

Generate feedback only when asked. Do not add it automatically when a test is created.

## Inputs

- The test file, including the question section, collapsible answer key, and the learner's `[x]` marks.
- Timing data if the learner reports it; otherwise state that time analysis was not measured.
- The chapter or part linked from the test, for naming exact sections in the remediation plan.
- If the learner supplies answers in chat instead of marking the file, use them only when the attempt is clearly identified. Do not edit their marks unless asked.

## Validate the Attempt

- Treat a question with exactly one `[x]` as attempted.
- Treat a question with no `[x]` as unattempted, not wrong.
- Treat multiple `[x]` marks in one question as invalid. Exclude that question from scoring, list its number, and do not silently pick an option.
- If no questions are marked, do not invent an attempt. Ask the learner to mark the test or provide answers first.
- Do not change questions, options, the answer key, or the learner's marks.

## Score

Use the marking stated in the test, matching UPSC Prelims:

- GS-I: 2 marks per correct answer; one-third negative for each wrong answer.
- CSAT: 2.5 marks per correct answer; one-third negative for each wrong answer.
- Unattempted questions score zero.

Report:

- Questions, attempted, correct, wrong, blank, and invalid.
- Raw score: marks for correct answers before negative marking.
- Net score: raw score minus negative marking.
- Maximum marks and net percentage.
- Attempted accuracy: correct divided by attempted.
- Overall accuracy: correct divided by total questions.
- Negative marks lost.

If invalid questions are excluded, report them separately and base the maximum marks and percentage on the valid questions. State that adjustment explicitly. Do not round away meaningful differences. Show the formula or working so the score is auditable.

## Diagnose

Map every question to its topic, demand level, format, and static or dynamic tag from the key.

### Error types

Classify each wrong answer using the strongest available evidence:

- **Knowledge gap** — the chapter fact or term was not known or recalled.
- **Conceptual confusion** — the idea, definition, mechanism, or distinction was misunderstood.
- **Question-reading error** — the question or an option was misread.
- **Option or trap error** — a plausible distractor was chosen despite knowing the concept.
- **Guess** — only when the learner says they guessed; do not assume.
- **Time pressure** — only when timing data supports it.
- **Unclassified** — evidence is insufficient.

Do not overclaim introspection. Use "likely" or "unclassified" when the marked answer alone cannot establish the cause.

### Strengths and weaknesses

- Identify strengths from repeated accuracy in a topic, demand level, or format. Do not call one correct answer a strength.
- Identify weaknesses from repeated errors, blanks, or a clear conceptual gap. Do not call one wrong answer a weakness; label single-item signals as tentative.
- Distinguish "not attempted" from "incorrect". A blank may reflect time, strategy, or lack of knowledge.
- Report static and dynamic performance separately if the test contains dynamic questions.
- Note excessive negative marking or unselective attempts as an attempt-strategy issue, not a knowledge issue.
- If the test is short, state that topic-level conclusions are tentative.

### Integrity

If a question or the answer key appears defective, say so, exclude it from diagnosis, and do not blame the learner. Do not silently rewrite the key. Ask before changing test content.

## Feedback Structure

Append this under the test's `## Feedback` section:

```markdown
### Feedback — YYYY-MM-DD — Attempt N

#### Score summary

| Metric | Value |
|---|---|
| Questions | ... |
| Attempted / correct / wrong / blank | ... |
| Raw score | ... |
| Negative marks | ... |
| Net score / maximum | ... / ... |
| Net percentage | ... |
| Attempted accuracy | ... |

#### Topic mastery

| Topic | Questions | Correct | Wrong | Blank | Attempted accuracy | Signal |
|---|---|---|---|---|---|---|
| ... | ... | ... | ... | ... | ... | Strength / Weak / Tentative |

#### Strengths

- Specific, evidence-backed strength.

#### Weaknesses

- Specific, evidence-backed weakness, with the relevant topic or demand level.

#### Error analysis

| Q | Your answer | Correct answer | Error type | Evidence |
|---|---|---|---|---|
| ... | ... | ... | ... | ... |

#### Attempt and time strategy

- What the attempt pattern shows. If timing was not reported, say so and do not claim time pressure.

#### Remediation plan

1. Highest-impact action, tied to a named chapter section.
2. Next action.
3. A retrieval or application task.
4. Optional maintenance action.

#### Retest schedule

- In 2–3 days: fresh test on the same part, focused on weak sections.
- In 7 days: another fresh test on the same part with new questions; test an earlier part separately if its retrieval is relevant.
- In 21 days: spaced retrieval of weak parts, with each test kept within its own part.
```

- Keep the feedback specific and concise. Avoid generic advice such as "study more".
- Name chapter sections for revision rather than telling the learner to reread everything.
- Prioritise the few weaknesses that explain the most lost marks.
- Include strengths even in a low-scoring attempt, and weaknesses even in a high-scoring attempt.
- Do not reduce the feedback to a percentage or a rank.

## Recording Rules

- Append feedback under `## Feedback`; if the section is missing, add it at the end of the test file.
- Do not replace the test or the key.
- If feedback already exists, append a new `### Feedback — ... — Attempt N` block. Never overwrite an earlier attempt.
- Label a revised diagnosis as a revision and keep the original.
- Do not create a separate feedback file unless the operator explicitly asks.
- Do not commit; commits happen only when the operator asks.
