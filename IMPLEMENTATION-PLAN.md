# Implementation, Planning and Decisions

Updated 26 November 2026. This file owns proposed implementation order and unresolved decisions. Delivery status is recorded in [STATUS.md](STATUS.md). [SPECIFICATION.md](SPECIFICATION.md) owns product requirements; method files own execution instructions. Do not duplicate their rules here.

## Decisions Recorded

The agreed requirements are authoritative in the specification. Decision locations:

- [Test categories and modes](SPECIFICATION.md#test-modes), including original and updated PYQs.
- [Checkpoint qualification and progress](SPECIFICATION.md#checkpoints-and-progress).
- [Combined feedback to-do and transient test state](SPECIFICATION.md#recommendation-completion-and-follow-up-tests).
- [Chapter-only revision scheduling](SPECIFICATION.md#feedback-revision-and-scheduling); algorithm and defaults are in its method.
- [Assessment persistence](SPECIFICATION.md#persistence).

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

This is a proposed sequence, not completed work or a deployment authorization. Record delivery status in STATUS.md, product changes in the specification and procedural changes in their method files.
