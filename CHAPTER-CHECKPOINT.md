# Chapter Checkpoint Generation and Evaluation

Generate and evaluate short, untimed MCQ checkpoints for chapters in every paper, including descriptive papers. Apply [AGENTS.md](AGENTS.md); completion and recommendation workflows follow [SPECIFICATION.md](SPECIFICATION.md). Checkpoints assess chapter understanding, not descriptive-writing proficiency or full-paper readiness.

## Generate

- Read the curriculum entry and whole chapter, including all parts. Require substantive teaching content for the indexed scope; placeholders or unfinished required parts are not ready. Explain insufficient readiness rather than testing a narrower scope silently.
- Choose a short question set that samples the chapter's important ideas and skills without padding. Use the taught material as the knowledge boundary; supply unfamiliar context needed for application. Do not apply full-paper patterns or the separate recommendation follow-up's question-count range.
- Write clear single-answer MCQs with plausible distractors. Use recall, interpretation, reasoning or application as appropriate; avoid answer cues and obscure details that displace meaningful coverage. Use Hindi in Devanagari for Hindi A, with English where needed for translation; otherwise default to English.
- For each retry, generate fresh questions, excluding repeats and close rewrites of that learner's previous checkpoint questions. Concepts may recur. If fresh, meaningful coverage cannot be sustained, explain the limitation rather than reusing questions or importing untaught material.
- Before presenting the checkpoint, independently solve each question and prepare its correct option, brief explanation and relevant chapter-section link. Verify ambiguity, factual support and calculations. Keys stay unavailable during application attempts; repository versions use a labelled collapsible block warning against opening it before submission.

All questions carry **one mark**. Correct answers earn one; wrong, multiple-selected and blank answers earn zero. There is no negative marking. State the **80%** pass threshold before the attempt. Submission is learner-controlled, without a timer.

## Evaluate

Use the checkpoint's saved questions, pre-attempt key and submitted responses. Accept on-screen selections, marked checkboxes or clearly mapped answers. Clarify ambiguous mapping or unreadable submissions; do not guess responses or treat missing evidence as confirmed blanks.

Evaluate against the recorded chapter revision; an old-revision attempt cannot qualify a newer revision. Report correct, wrong and blank counts, counting confirmed multiple selections as wrong. For `N` valid questions and `C` correct answers, score is `C/N`, percentage is `100 × C/N`, and passing requires `5 × C ≥ 4 × N`. Do not round a below-threshold score into a pass. An empty or unresolved checkpoint cannot establish completion.

Handle defective questions or keys through the shared correction rules. Exclude an unscorable item from both numerator and denominator, explain the adjustment and retain earlier results. If the remaining set no longer supports meaningful chapter coverage, defer completion and offer a fresh checkpoint; do not pass the learner on an inadequate remainder.

Keep feedback concise: give the score and pass status, explain errors and link useful revision sections. Do not invent weaknesses or remedial work. Checkpoints do not create feedback to-do tests; passing such a test cannot substitute for a checkpoint pass.

## Completion and Retries

A first valid pass for the current revision notifies [REVISION-SCHEDULING.md](REVISION-SCHEDULING.md) to create its initial chapter-test task; this method does not calculate dates. Only a valid checkpoint pass marks the whole indexed chapter complete; parts never count separately. A failure leaves an unqualified chapter incomplete and allows a fresh retry. Repeated passes count that chapter only once. Calculate paper completion from checkpoint-qualified chapters over all indexed chapters, including placeholders, as specified; an empty index is unavailable.

Preserve checkpoint questions, keys, responses, scores and feedback, including failed attempts and corrections. The non-persistence rule for feedback to-do tests does not apply to checkpoints. On substantive teaching-content changes, invalidate current qualification, remove the chapter from cumulative eligibility and recompute completion. Preserve historical passes and feedback. Require a pass on the new revision; cosmetic edits leave qualification intact. Notify the scheduler to suspend old-revision tasks until requalification.

## Recording and Verification

Record the paper folder, canonical chapter revision (including all parts) and section links, checkpoint ID, generation date, question count, marking rule, status and pre-attempt key. Use `<paper-folder-name>-CP-<chapter-slug>-T01`, incrementing for each freshly generated checkpoint. Repository files go in `<paper-folder>/<paper-folder-name>-CHECKPOINTS/<checkpoint-id>.md`; use `## Questions`, a labelled key block and the paper-appropriate `## Feedback` or `## Evaluation` section with dated attempts. The application presents the separate checkpoint at the chapter's end.

Before generation is complete, check readiness, whole-chapter coverage, fresh-question history, key correctness, links and ID uniqueness. Before evaluation is final, check response mapping, counts, denominator, exact threshold and chapter-completion updates. These scoring and progress rules are product decisions, not UPSC marking rules.
