# Revision Scheduling

Use this method to schedule chapter-specific revision tests only, not generate them. Test contents are generated only when requested under [SPECIFICATION.md](SPECIFICATION.md). The policy adapts §9 of [spaced-rep's specification](https://github.com/Sid2169/spaced-rep/blob/21747b3a810d6bae9b312b2a5c73d10adc984fdc/revision-system-agent-spec.md#9-next-revision-scheduling-algorithm-v1), inspected 26 November 2026. That source revision specifies the algorithm but does not yet contain its scheduling implementation.

The intervals and multipliers are configurable product heuristics, not a validated forgetting curve or an optimal retention formula. Keep one authoritative configuration and deterministic scheduling function.

Learning-practice reference: [IES, Organizing Instruction and Study to Improve Student Learning](https://ies.ed.gov/ncee/WWC/PracticeGuide/1/Published), September 2007, recorded as checked 19 November 2026. It supports retrieval practice and spaced review, not this policy's numerical parameters.

## Scope and Inputs

Maintain one separate schedule per learner, paper and whole indexed chapter. Only finalized chapter-test results update its recurring schedule. Cumulative, full-scope, original/updated PYQ, checkpoint and recommendation follow-up tests are not scheduled by this method; their results do not adjust chapter-test intervals. The first checkpoint pass only triggers the initial chapter-test task described below.

Use the latest finalized score for that schedule, its actual completion date in the learner's saved timezone, material type, difficulty, priority and effective target date. The target is a learner-selected override, otherwise the applicable Prelims/Mains exam date if known, otherwise unset. Do not invent examination dates. Defaults are generic material, unspecified difficulty and unsure priority; keep settings explicit and editable.

- Descriptive scheduling score = `100 × awarded marks / maximum attainable marks`, respecting required choices and partial credit.
- Prelims scheduling score = the finalized net percentage, clamped to `[0, 100]` for scheduling only. Preserve the original result, including negative marks, unchanged.
- Untested or unresolved performance is `null`, not an assumed score. Pending, abandoned or failed evaluation jobs do not update schedules.

Do not import spaced-rep's question-weight scoring into examination marking. Do not use lifetime revision counts, cumulative score averages or a personalized forgetting curve. Earlier attempts remain available for feedback under their normal retention rules.

## Next Date After a Finalized Test

Choose the base interval from the unrounded scheduling percentage:

| Score | Days |
|---|---:|
| Below 40% | 1 |
| 40% to below 60% | 2 |
| 60% to below 75% | 4 |
| 75% to below 90% | 7 |
| 90%–100% | 14 |

Apply these multipliers:

| Setting | Multipliers |
|---|---|
| Material | factual 1.00; conceptual 0.90; procedural 0.85; generic 1.00 |
| Difficulty | easy 1.15; medium/unspecified 1.00; hard 0.80 |
| Priority | high 0.80; unsure 1.00; low 1.10 |

Let `D` be the actual finalized local date. For a target after `D`, let `daysToTarget = target − D` in calendar days:

```text
H = clamp(0.75, 2.00, sqrt(max(daysToTarget, 1) / 30))
M = clamp(0.50, 2.00, material × difficulty × priority × H)
intervalDays = clamp(1, 60, round(baseDays × M))
candidateDate = D + intervalDays
```

Here `clamp(lower, upper, value)` limits a value to that range; positive half-days round upward. With no target, or a target on/before `D`, use `H = 1` and no target cap.

For a target after `D`, set `latestAllowedDate = target − 1 day`. If that date is on/before `D`, create no next automatic task and report that no further pre-target assessment fits. Otherwise use `min(candidateDate, latestAllowedDate)`. A post-test schedule never falls on the completion date or the target date. After an expired target, subsequent finalized attempts use neutral-horizon scheduling until the learner changes the target.

For example, 82% on conceptual material, medium difficulty, high priority and a target 90 days after completion gives `H ≈ 1.732`, `M ≈ 1.247` and a 9-day interval before any target cap.

## First Tasks and Completion

- A chapter's first checkpoint pass makes its first chapter-revision test due the next local day, capped at the day before a future target. If the target is tomorrow, the initial task may be due today. Do not schedule an initial task against a target today; expired or unset targets use the neutral next-day rule. Do not create a duplicate when a chapter already has a revision schedule.
- Unlike spaced-rep's initial-task rule, no prepared question set is required: cse27 schedules the chapter test first and generates contents only when requested.
- Finalizing a scheduled chapter test completes its task and creates at most one next pending task using the algorithm. An additional on-demand chapter test for the same paper and chapter updates automatic pending scheduling from its actual completion date; preserve a manually chosen due date. Make finalization and task creation idempotent.
- Chapter checkpoints establish qualification, not recurring revision performance. Feedback to-do tests use their separate transient workflow; never use their scores for scheduling or reopen completed to-dos through this scheduler.

## Overdue, Rescheduling and Corrections

Use local calendar dates for due/overdue comparisons and day addition; store event timestamps separately in UTC. Due today is not overdue. Preserve an overdue task's original date rather than moving it each morning. Its next interval starts from actual completion, not the missed due date.

Rescheduling closes the old task as rescheduled and creates a linked replacement. Recompute automatic pending tasks when their target/settings or latest finalized grade is corrected, retaining the previous date and reason; do not silently move manual tasks. If recomputation yields a past date, leave it visibly overdue. Flag manual tasks on/after a revised target for learner review. Cancelling a schedule closes its pending task without erasing ordinary assessment history.

Record the paper, chapter, due date, automatic/manual source, status, latest eligible assessment, settings and policy version used. Display overdue, due-today, upcoming and unscheduled states separately. Scheduling does not change chapter completion; chapter-test results remain excluded from full-scope performance graphs.

## Verification

Check that only chapter tests affect recurring scheduling, then exact score-band boundaries, negative/unknown scores, rounding and clamps, the worked example, local-date arithmetic, targets tomorrow/today/expired/unset, overdue completion, corrections, manual-date preservation and duplicate-finalization protection. Apply the source policy without silently adding history-dependent interval growth. No application implementation or live schedules are created by this method document.
