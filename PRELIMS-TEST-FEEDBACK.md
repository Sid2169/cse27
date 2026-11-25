# Prelims Test Feedback

Evaluate GS-I/CSAT attempts against their pre-attempt key, saved for simulations and transient for FU. [PRELIMS-TEST-GENERATION.md](PRELIMS-TEST-GENERATION.md) owns patterns/marking; [AGENTS.md](AGENTS.md) owns evidence and correction safeguards. Route checkpoints to [CHAPTER-CHECKPOINT.md](CHAPTER-CHECKPOINT.md).

## Validate and Score

Accept on-screen selections, marked checkboxes or clearly mapped answers. A confirmed blank is unattempted; multiple selections count as wrong. Clarify missing/unreadable submissions or ambiguous mapping rather than guessing or shrinking the denominator.

Apply the test's declared rule. With uniform item mark `m` and the standard one-third penalty:

- `C`, `W`, `M`, `B` = correct, wrong single, multiple and blank counts; `N = C + W + M + B`.
- Raw marks = `m × C`; penalty = `m × (W + M) / 3`; net = raw − penalty; maximum = `m × N`.
- Net percentage = `100 × net / maximum`; attempted accuracy = `100 × C / (C + W + M)`.

Keep penalties exact until display; zero-denominator percentages are unavailable. Historical exceptions use the source paper's rule, not an assumed modern formula. For FU, determine completion from correct answers divided by all valid questions, including blanks, under [the specification](SPECIFICATION.md#recommendation-completion-and-follow-up-tests); attempted accuracy and net percentage cannot substitute.

Resolve defective keys/items before finalizing simulation feedback. Preserve the original and record any correction; exclude unscorable items from scoring and diagnosis, explaining the adjusted maximum. Do not rewrite finalized feedback or regenerate its recommendations. Defer FU completion if unresolved defects, too few valid questions or inadequate coverage prevent meeting the specification.

## Feedback

Report counts, penalty and net score with auditable arithmetic. Explain material errors and consult relevant earlier attempts for supported patterns. Distinguish observed performance from possible causes: blanks do not prove ignorance, and negative marks do not establish guessing. Breakdowns and timing analysis require sufficient evidence.

For each real-paper simulation feedback record, combine all evidence-supported refresher recommendations into one to-do, with section links and one test-gated completion action. Identify missing teaching material rather than presenting placeholders as lessons. Recommend relevant retention practice even with full marks, without inventing study gaps. FU feedback is transient and creates no further to-dos. Explain errors without reproducing the whole key or inventing remedial work. For UPYQ, make replacement provenance available with feedback.

Only finalized chapter-test results feed [REVISION-SCHEDULING.md](REVISION-SCHEDULING.md); this method does not set intervals. For FU, persist only the combined to-do completion state; discard all test/evaluation data after transient use, passed or failed. Preserve the originating simulation and its feedback.

## Record and Check

For simulations, append `### Feedback — YYYY-MM-DD — Attempt N` under `## Feedback`, in English by default. Include score, useful findings and recommendations. Check mapping, counts, arithmetic, corrections, section links and retention for the mode before finalizing.
