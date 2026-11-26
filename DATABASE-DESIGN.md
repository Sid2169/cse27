# Database Schema — Draft

Updated 27 November 2026. Proposed PostgreSQL model for [SPECIFICATION.md](SPECIFICATION.md); stack decisions are in [IMPLEMENTATION-PLAN.md](IMPLEMENTATION-PLAN.md). Not an applied migration. Use relational columns for identity, ownership, relationships, states, scores and dates; JSONB for variable assessment content and reading anchors. Files live in private object storage.

## Data Boundary

| Data | Origin and storage |
|---|---|
| Learning material | Git Markdown; shared catalogue tables contain derived metadata/references only |
| Notes, highlights, bookmarks, reading position and preferences | Created through the site; private PostgreSQL records, separate from Git learning material |
| Tests, attempts, feedback, progress and revision tasks | Created dynamically through site actions; retained in PostgreSQL |
| Ordinary answer submissions containing files | Uploaded through the site; private object storage with database references |
| Feedback to-do tests | Generated/evaluated transiently; only the existing to-do completion boolean persists |

Site actions never generate assessment or feedback Markdown files or write learner data to Git. Existing repository practice tests are historical artifacts, not the application's test store.

`chapter_revisions` tracks versions of Git learning material; `revision_tasks` tracks learner revision sessions created on the site. These are distinct concepts. Feedback to-do tests remain transient.

## Conventions

`id` means UUID primary key; `*_id` means foreign key unless noted. Event timestamps are UTC `timestamptz`; exam/due dates are `date` values interpreted in the learner's saved timezone. JSONB payloads have validated, versioned schemas. Authentication credentials belong to the chosen auth system, not this schema.

## Shared Learning-Material Index

| Table | Main columns |
|---|---|
| `papers` | `id`, `code UNIQUE`, `stage` (Prelims/Mains), `answer_format`, `syllabus_path` |
| `chapters` | `id`, `repo_path UNIQUE`, `title`, `current_revision_id` |
| `chapter_revisions` | `id`, `chapter_id`, `revision_number`, `git_commit`, `files_manifest JSONB`, `is_ready`, `created_at` |
| `paper_chapters` | `paper_id`, `chapter_id`, `curriculum_position`; composite primary key |

The content-sync process derives this index from Git, not from learner activity. Revision manifests reference the overview and all parts; they do not store tests or feedback. Substantive changes create a new qualification revision; cosmetic edits do not. Assessments reference the learning-material commit used as input, not a Git version of the generated test. The paper/chapter mapping supports Mathematics chapters shared by Papers I and II. Placeholder chapters remain indexed with `is_ready=false`.

## Learner and Revision Data

| Table | Main columns |
|---|---|
| `users` | `id`, `auth_subject UNIQUE`, `timezone`, `created_at` |
| `exam_targets` | `id`, `user_id`, `exam_cycle`, `stage`, `exam_date` (nullable) |
| `chapter_qualifications` | `user_id`, `paper_id`, `chapter_revision_id`, `checkpoint_evaluation_id`, `qualified_at`; unique user/paper/revision |
| `revision_preferences` | `user_id`, `paper_id`, `chapter_id`, `exam_target_id`, `target_date_override`, `material_type`, `difficulty`, `priority`; unique user/paper/chapter |
| `revision_tasks` | `id`, `user_id`, `paper_id`, `chapter_revision_id`, `scheduled_for`, `source` (automatic/manual), `status`, `previous_task_id`, `completed_attempt_id`, `policy_version`, `settings_snapshot JSONB`, `closed_at` |

Completion is derived from qualifications matching each chapter's current revision; do not maintain another completion boolean or stored paper percentage. Retain historical qualifications. Substantive changes remove current eligibility and cancel old pending tasks transactionally. Requalification follows [REVISION-SCHEDULING.md](REVISION-SCHEDULING.md).

## Private Reading Data

| Table | Main columns |
|---|---|
| `reading_preferences` | `user_id` primary/foreign key, `theme` (system/light/dark), `text_scale`, `version`, `updated_at` |
| `reading_positions` | `user_id`, `chapter_id`, `chapter_revision_id`, `source_commit`, `anchor JSONB`, `version`, `updated_at`; primary key user/chapter |
| `bookmarks` | `id`, `user_id`, `chapter_id`, `chapter_revision_id`, `source_commit`, `anchor JSONB`, `label` (nullable), `resolved_anchor JSONB` (nullable), `resolution_status`, `version`, `created_at`, `updated_at` |
| `annotations` | `id`, `user_id`, `chapter_id`, `chapter_revision_id`, `source_commit`, `kind` (highlight/note), `anchor JSONB` (nullable), `body` (nullable), `colour` (nullable), `resolved_anchor JSONB` (nullable), `resolution_status`, `version`, `created_at`, `updated_at` |

An annotation is a highlight with an optional attached note, or a standalone note attached to a chapter, heading or passage. Notes require nonempty text; highlights require a text-range anchor. Store note bodies as plain text, rendered safely. Records belong to the chapter, so shared Mathematics content shows the same annotations from either paper. Reading activity never establishes qualification or changes scheduling.

Use a versioned anchor contract: repository-relative part/file path, heading identifier, source-blob hash and, for ranges, selected text with prefix/suffix context and optional position hints. Reading positions use a heading/range rather than viewport-specific pixel offsets. Validate that the revision belongs to the chapter and the source commit/file belongs to its content history. Record the commit separately because cosmetic edits can move text without creating a qualification revision.

`anchor`, `chapter_revision_id` and `source_commit` identify the saved source. Automatic re-anchoring never overwrites them. `resolved_anchor` records an unambiguous match in newer content, including its commit/revision; `resolution_status` is current, relocated or unresolved. A chapter-level note needs no passage match. Missing/ambiguous passages remain visible as unresolved, with the original quote/note intact; do not silently attach them elsewhere or delete them on content updates. The owner may explicitly edit, relink or delete records. Position restoration likewise falls back visibly if its anchor cannot be resolved.

Enforce owner-only CRUD through RLS and server authorization, valid theme/scale values, anchor schema validation and kind-specific body/range constraints. Reader `version` is a positive server-incremented counter; updates/deletes require the expected version, including re-anchoring updates, to prevent stale writes overwriting newer changes. Retain/back up these records with other learner data; never use them for transient to-do-test content.

## Retained Assessments

These tables store checkpoints and real-paper simulations generated or prepared on demand through site actions. Their questions, keys and results are database records, independent of Git. Feedback to-do tests have no assessment rows.

| Table | Main columns |
|---|---|
| `assessments` | `id`, `user_id`, `paper_id`, `category` (checkpoint/simulation), `mode` (CH/CUM/FULL/PYQ/UPYQ; null for checkpoints), `status`, `source_year`, `preparation_year`, `current_affairs_cutoff`, `learning_source_commit` (nullable), `instructions JSONB`, `marking JSONB`, `max_attainable_marks`, `duration_seconds`, `created_at` |
| `assessment_scope` | `assessment_id`, `chapter_revision_id`; composite primary key |
| `questions` | `id`, `assessment_id`, `position`, `original_label`, `max_marks`, `body JSONB`, `provenance JSONB`, `first_presented_at` |
| `assessment_keys` | `assessment_id`, `version`, `keys_and_rubrics JSONB`, `created_at`; composite primary key; server-private |
| `attempts` | `id`, `user_id`, `assessment_id`, `attempt_number`, `status`, `selection JSONB`, `started_at`, `submitted_at`, `remaining_seconds`, `active_since`, `paused_at`; unique assessment/attempt number |
| `responses` | `attempt_id`, `question_id`, `answer JSONB`, `updated_at`; composite primary key |
| `uploads` | `id`, `user_id`, `attempt_id`, `object_key UNIQUE`, `media_type`, `size_bytes`, `status`, `created_at` |
| `evaluations` | `id`, `attempt_id`, `category`, `version`, `key_version`, `earned_marks`, `max_marks`, `correct_count`, `wrong_count`, `multiple_count`, `blank_count`, `awards JSONB`, `feedback JSONB`, `recommendations JSONB`, `finalized_at`; unique attempt/version |
| `feedback_todos` | `evaluation_id` primary/foreign key, `completed BOOLEAN NOT NULL DEFAULT false` |
| `assessment_jobs` | `id`, `user_id`, `assessment_id`, `attempt_id` (nullable), `operation`, `status`, `idempotency_key`, `error_code`, `created_at`, `finished_at` |

Question bodies hold passages, options, figures and sub-parts; they never contain keys/rubrics. Provenance records PYQ source mappings and mirrored/new replacements. Keys may gain explicit versions before feedback finalization; evaluations identify the version used. Checkpoint-result corrections append versions rather than overwrite history; each simulation attempt has exactly one finalized evaluation, enforced by a partial unique index. `uploads` holds ordinary answer submissions, not learning-material uploads. One file can serve multiple responses through validated file/page references in `answer`.

`max_attainable_marks` accounts for internal choice rather than summing every offered alternative. Numeric marks permit negative Prelims totals. Preserve objective counts and rational marking rules so penalties can be calculated exactly before display; percentages are derived. Unselected alternatives are distinct from blank required answers.

## Integrity and Access

- Foreign keys/composite keys must prevent cross-user, cross-assessment and cross-paper attachments, including responses, keys, uploads, qualification evidence and completed task attempts.
- Require positive denominators, valid score/count ranges, matching category/mode/year fields and unique question positions. A qualification must reference a passed checkpoint evaluation on the same user/paper/revision; evaluation category must match its assessment; a task completion must reference a chapter simulation on that same scope.
- Allow at most one pending revision task per user/paper/chapter. Rescheduling preserves the old row and links its replacement; overdue is derived from due date, not stored as a changing status.
- Finalize answers/results, checkpoint qualification or simulation feedback, its single to-do and eligible scheduling changes transactionally and idempotently. `feedback_todos` applies only to simulation evaluations. Do not create one for checkpoint results.
- Finalized simulation responses, evaluations and recommendations are immutable. Results, qualifications and task transitions are server-written. The to-do's completion boolean remains independently mutable through trusted pass verification only. Presented questions/source snapshots remain stable; explicit key revisions preserve originals.
- Published catalogue metadata is readable publicly. Learner records require owner-scoped access. Never expose keys/guides before submission, including through client-readable JSON or broad row queries. Private uploads use authorized, scoped access.
- Apply database privileges and row-level security for learner isolation. Trusted server transactions/triggers enforce cross-table and state-transition rules that simple CHECK constraints cannot express.

## Transient To-do Tests

Generate/evaluate against the frozen parent recommendations using temporary processing. Persist only `feedback_todos.completed`: no test, attempt, upload, key, result, job payload, fingerprint or test-content log. Passing sets the existing boolean to true; failed/abandoned processing leaves it false. No completion timestamp or retry count is needed.

## Initial Indexes

Index user-owned foreign keys; bookmarks/annotations by user/chapter and user/update time; `questions(assessment_id, position)`; `attempts(user_id, status)`; `assessments(user_id, paper_id, mode, created_at)`; qualification lookup by user/paper/revision; and pending tasks by user/due date. Use a partial unique index for one pending chapter task and a unique user/idempotency-key pair for ordinary jobs. Add JSONB indexes only for actual query needs.

Before migrations, finalize enum/JSON schemas, provider integration and ownership/state-transition enforcement. Validate cross-user attachment, private-reader CRUD, annotation anchoring after substantive/cosmetic edits, stale reader saves, hidden keys, immutable feedback, internal choice, negative scores, revision invalidation, concurrent finalization and transient-data exclusion.

References checked 26 November 2026: PostgreSQL [JSON types](https://www.postgresql.org/docs/current/datatype-json.html), [constraints](https://www.postgresql.org/docs/current/ddl-constraints.html) and [row security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html). This draft has not been applied or database-tested.
