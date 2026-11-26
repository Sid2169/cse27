# UPSC CSE Preparation Platform — Specification

Updated: 26 November 2026. Product requirements. Procedures are defined in the linked methods; delivery status is in [STATUS.md](STATUS.md), and planning/decisions in [IMPLEMENTATION-PLAN.md](IMPLEMENTATION-PLAN.md).

## Objective and scope

A beginner-oriented web platform for **study → test → feedback → revision → reassessment**.

- Cover the Prelims and Mains papers listed in [README.md](README.md), including Hindi Paper A and Mathematics I–II. Other subjects may be added later; Interview preparation is excluded.
- Provide public study material, private learner progress, AI-generated assessments/evaluation and performance-based chapter revision.
- Support changing chapter counts and split chapters without assuming a fixed content structure.

## Access and navigation

- Anonymous visitors can read published material. Individual learner accounts provide private progress and assessments. Organisation, team and staff features are excluded.
- Only learning material uses Git Markdown as its authoritative data source. Navigation follows curriculum order through paper folders, chapters and parts; page headings form an on-page contents menu.
- Site actions create assessments, attempts, feedback, progress and revision tasks dynamically. Retained records live in application storage, never generated Git Markdown files; feedback to-do tests remain transient.
- Planning placeholders are visibly labelled and cannot support chapter tests or checkpoints.
- The dashboard shows each paper's completion percentage, scheduled chapter tests, latest cumulative result and latest full-scope/PYQ result.
- Learners can request tests by paper/mode from the dashboard or open chapter practice from its page.

## Test modes

Three categories: chapter-end checkpoints; real-paper simulations; and feedback to-do tests. All assessments are paper-specific and requested on demand. Real-paper simulation modes are:

| Mode | Required behaviour |
|---|---|
| Chapter | Cover one whole chapter, including all parts, using only its taught material. Question count, marks and duration suit its scope without padding. |
| Cumulative | Cover only checkpoint-qualified chapters, with question count, marks and duration scaled to completed coverage. |
| Full-scope unseen | Cover the full paper under its verified examination pattern. Exclude questions and close rewrites previously presented in retained simulation/checkpoint history; concepts may recur. Transient to-do tests are outside this history. |
| PYQ — unabridged | Reproduce the selected historical year/paper verbatim, including original numbering, diagrams, choices and instructions. |
| PYQ — updated | Offer an optional variant for a selected preparation year, retaining static questions and replacing current-affairs questions as defined below. |

Insufficient readiness or coverage must be explained without silently changing modes. Full-scope tests may precede complete teaching coverage and are then labelled diagnostic. Source caveats remain visible; incomplete/unverified transcriptions lead to the official paper rather than invented missing content.

### Updated PYQ variant

- The learner selects the source year/paper and preparation year. The original remains unchanged and available; the variant is labelled model-generated practice, not an official paper for the target year.
- Replacements are one for one. Static questions, numbering, question count, marks, choice rules and paper structure remain intact. This historical-pattern variant is distinct from full-scope unseen mode.
- A **mirror** tests the preparation year's corresponding specific subtopic, provision or aspect, preserving the knowledge relationships, reasoning demand, question structure, distractor logic where applicable, approximate difficulty and factual depth. Matching only the broad topic is insufficient.
- For example, a question on a particular Union Budget tax exemption's eligibility conditions mirrors the corresponding exemption and eligibility conditions in the preparation year's Budget—not that Budget's fiscal deficit or expenditure allocations.
- Where no meaningful counterpart exists, the replacement is a new current-affairs question reflecting the model's best approximation of UPSC's topic selection, specificity, reasoning, distractors and difficulty. It stays within the original's broader syllabus area where feasible, without forcing correspondence.
- Each replacement's source-question mapping, mirrored/new status, rationale and supporting sources are available in post-attempt feedback. Target year, current-affairs cutoff and source dates are recorded. Unavailable events/provisions are not invented; evidence limitations are disclosed. Replacement answers have independently prepared keys/guides, distinct from retained official answers.

## Checkpoints and progress

- Each chapter ends with a separate, short, untimed MCQ checkpoint, including chapters for descriptive papers.
- Questions carry equal marks. Wrong, multiple-selected and blank answers earn zero, without negative marking. Passing requires **at least 80%** of available marks.
- Retries use fresh questions, excluding repeats and close rewrites while maintaining meaningful chapter coverage.
- Only a valid checkpoint pass for the current chapter revision marks it complete. Substantive teaching-content changes invalidate earlier qualification and require a fresh checkpoint pass; cosmetic edits do not. Preserve earlier attempts. Parts do not count separately; completion does not establish descriptive-writing proficiency.
- Paper completion = **100 × checkpoint-qualified chapters ÷ all indexed chapters**, including placeholders. New chapters may lower the percentage; an empty index shows “not available.”

## Attempt experience

| Assessment | Required experience |
|---|---|
| Prelims simulations | On-screen MCQs, answer marking, autosave and a server-controlled timer. Submission is learner-triggered or automatic when active time expires. |
| Descriptive simulations | Question paper and suggested duration; learner-managed timing and submission of text, documents or images whenever ready. |
| Chapter checkpoints | On-screen MCQs and learner-controlled submission, without a timer. |
| Feedback to-do tests | On-demand generation/evaluation of the combined refresher material; only completion state persists. |

- Connection loss pauses timed sessions. Reconnection restores saved answers and remaining active time; expiry is server-enforced.
- Generation, document reading and evaluation expose pending, running, completed and failed states. Safe retries do not duplicate submissions or lose completed work; to-do-test processing remains transient.
- Keys/guides and declared scoring exist before presentation and remain unavailable during attempts.
- Unreadable answers, ambiguous mappings and unresolved scores are identified for clarification rather than guessed or presented as final.

## Assessment quality and feedback

- Scope and format follow the official syllabus and verified paper instructions. Generated questions reflect the selected paper's demands and language; changing facts have clear reference dates.
- Evaluation credits relevant, defensible answers and methods with task-appropriate partial credit. Practice rubrics are labelled as such and do not claim to be official UPSC marking schemes.
- Results explain awarded/lost credit and distinguish observed performance from uncertain causes. Relevant earlier retained attempts may inform supported patterns. Full model answers are provided only on request.
- Each simulation attempt receives finalized feedback and refresher recommendations once; both are then frozen. Each has one combined refresher to-do as defined below. Recommendations address demonstrated gaps or retention practice without inventing errors, including after a full-mark result. Checkpoint and to-do-test feedback create no further to-do tests.
- Performance graphs use **full-scope simulation results only**, separately for each paper.
- Question flagging and review workflows are excluded.

## Feedback, revision and scheduling

- Only chapter-specific revision tests are scheduled, separately by learner, paper and chapter. Cumulative, full-scope and both PYQ modes remain on demand without revision schedules.
- Due dates remain fixed while overdue. Subsequent intervals start from actual chapter-test completion. Scheduling changes neither chapter qualification nor paper completion.
- Scheduled test contents are generated only when requested. Checkpoints and feedback to-do tests retain their separate workflows.

## Recommendation completion and follow-up tests

- Each simulation's feedback contains one combined refresher checklist. Each material link opens its relevant website section; one checklist-level **Mark complete** action launches a test covering all recommended material together. Materials have no separate tests or completion states.
- The test contains **5–15 questions**, with paper-appropriate formats. Scoring and passing requirements are declared before the attempt.

| To-do test type | Passing requirement |
|---|---|
| Objective — Prelims GS I / CSAT | **At least 80% accuracy**: correct answers divided by all valid questions, including blanks. |
| Descriptive — Mains | **At least 65% of available marks**, with paper-appropriate partial credit. |

- Only the combined to-do's **completed/not completed** state persists alongside its frozen simulation feedback. It starts incomplete and becomes complete only after a valid pass. Failure, abandonment or unresolved grading leaves it incomplete; another test may be requested. Completion does not trigger regeneration or reset of the recommendations.
- No to-do-test questions, keys/guides, responses, uploads, scores, test feedback, attempt history or derived question-history data persist, whether passed or failed.
- The originating simulation, feedback and recommendations remain available. Completing its refresher changes neither chapter qualification, paper completion nor revision scheduling. To-do tests create no further to-dos.

## Persistence

Retain ordinary assessment records, chapter-revision qualifications, progress, frozen simulation feedback/recommendations, scheduled chapter tests and combined to-do completion states. Earlier ordinary records remain available. To-do-test data must not enter durable storage, assessment-content logs, backups or restored data. Backups must support recovery of retained records and uploads.

## Requirement References

Exam scope derives from [syllabus.md](syllabus.md) and the paper-specific syllabi linked from README. Checkpoint/to-do thresholds, scoring and retention are product requirements rather than official examination rules. Generation, evaluation, checkpoint and scheduling methods are indexed in [AGENTS.md](AGENTS.md).
