# Implementation, Planning and Decisions

Updated 26 November 2026. This file owns delivery status, proposed implementation order and unresolved decisions. [SPECIFICATION.md](SPECIFICATION.md) owns product requirements; method files own execution instructions. Do not duplicate their rules here.

## Current Status

| Area | Status / reference |
|---|---|
| Application requirements | Recorded in [SPECIFICATION.md](SPECIFICATION.md) |
| Shared test generation | Authored: [TEST-GENERATION-COMMON.md](TEST-GENERATION-COMMON.md) |
| Prelims generation / feedback | Authored for GS-I and CSAT: [generation](PRELIMS-TEST-GENERATION.md), [feedback](PRELIMS-TEST-FEEDBACK.md) |
| Mains generation / evaluation | Authored for GS I–IV, Essay, Hindi A, English B and Mathematics I–II: [generation](MAINS-TEST-GENERATION.md), [evaluation](MAINS-ANSWER-EVALUATION.md) |
| Chapter checkpoints | Authored: [CHAPTER-CHECKPOINT.md](CHAPTER-CHECKPOINT.md) |
| Chapter-test scheduling | Authored: [REVISION-SCHEDULING.md](REVISION-SCHEDULING.md), adapted from spaced-rep's documented policy |
| Study content | Partly authored; see [README.md](README.md) and paper curricula. Many chapters remain placeholders; language PYQ files still need extraction. |
| Web application | Not implemented in this repository. Method documents and practice artifacts are not application features. |

Method availability does not establish teaching readiness or verify a future paper's pattern. Check the selected paper's instructions and source caveats when preparing an assessment.

Source notes dated 19 November 2026 reported scanned-paper retrieval gaps. Those verification limits remain; this reorganisation is not a fresh fact-check.

## Decisions Recorded

The agreed requirements are authoritative in the specification. Decision locations:

- [Test categories and modes](SPECIFICATION.md#test-modes), including original and updated PYQs.
- [Checkpoint qualification and progress](SPECIFICATION.md#checkpoints-and-progress).
- [Combined feedback to-do and transient test state](SPECIFICATION.md#recommendation-completion-and-follow-up-tests).
- [Chapter-only revision scheduling](SPECIFICATION.md#feedback-revision-and-scheduling); algorithm and defaults are in its method.
- [Assessment persistence](SPECIFICATION.md#persistence).

No outstanding method requirement has been identified in the current specification. Reassess this when requirements change; do not report implementation work as a missing method or an undecided requirement.

## Open Decisions

| Decision | What remains |
|---|---|
| Organisation model | Whether organisation/team entities and access boundaries are needed |
| Staff permissions | Who can publish content, inspect records or administer assessments |
| Flag handling | Who reviews flags and authorizes corrections, and how affected learners are notified |
| Application architecture | Runtime/services, database and storage layout, background processing and deployment |
| Data operations | Backup/restoration approach, retention enforcement and transient processing without persisting to-do-test data |

Database and storage design were deferred until functional requirements were settled; no design has been selected. Technical choices must implement the agreed requirements, not redefine them.

## Proposed Implementation Order

1. Resolve access/flag-handling decisions; design records, storage boundaries and service responsibilities.
2. Build content navigation, authentication and private learner progress.
3. Build ordinary assessment generation, attempts and evaluation, preserving the three test categories.
4. Add combined feedback to-dos, transient tests, chapter-only scheduling and the dashboard.
5. Verify authorization, scoring, timers/reconnection, corrections, non-persistence and backup restoration before release.

This is a proposed sequence, not completed work or a deployment authorization. Update status from actual implementation evidence; keep product changes in the specification and procedural changes in their method files.
