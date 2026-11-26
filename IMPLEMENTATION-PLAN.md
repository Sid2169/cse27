# Implementation Plan and Decisions

Updated 27 November 2026. Records accepted UI/UX and architecture choices, implementation sequence, dependencies and acceptance checks. [STATUS.md](STATUS.md) owns delivery status; [SPECIFICATION.md](SPECIFICATION.md) owns product requirements; [DATABASE-DESIGN.md](DATABASE-DESIGN.md) owns the logical schema. Assessment and scheduling methods remain authoritative for their procedures. This plan does not authorize deployment or imply implementation is complete.

## 1. Accepted Decisions

### UI and learning experience

| Area | Decision |
|---|---|
| Devices and appearance | Desktop first, fully usable on mobile; minimal reading interface, restrained colour and generous spacing. Light/dark themes follow system preference initially, with a saved override. |
| Navigation | Desktop sidebar; compact mobile menu. Exam stage → paper → curriculum → chapter, preserving curriculum order and chapter parts. |
| Home | Today's revisions, continue reading, unfinished tests and pending feedback to-dos. Include the specification's paper completion and latest-result summaries without making charts the main entry point. |
| Reader | Distraction-free text, collapsible contents, adjustable text size, search, heading links and restored reading position. Private bookmarks, highlights and notes are included. |
| Objective tests | One question at a time with a question navigator, saved-answer status and paper-appropriate controls. |
| Descriptive answers | Typed answers and document/image uploads organised by question. Review extracted text and question mapping before evaluation. |
| Processing | Retained assessment generation runs in the background with visible stages; leaving the page does not discard completed work. |
| Feedback | Score and main findings first; expandable question details and a prominent combined refresher to-do. |
| Revisions | Due list with direct chapter-test launch, plus a separate calendar. |

### Architecture and operations

| Area | Decision |
|---|---|
| Application | One Next.js application, React and TypeScript; modules separate content, assessments, evaluation and scheduling. No separate backend deployment initially. |
| Styling | Tailwind CSS and accessible shadcn/ui components; shared typography, spacing, theme and interaction tokens. |
| Data | Supabase PostgreSQL, Auth and private Storage. Relational ownership/state with validated JSONB for variable assessment content. |
| Access | Public learning material; only the owner's account can use private application features initially. Preserve per-user isolation for future expansion. |
| Login | Google and email/password, with account recovery and explicit handling of an existing account using another provider. |
| AI | Gemini only, behind a provider adapter; separately configured generation and descriptive-evaluation models. Model identifiers remain configuration, selected from verified free options. |
| Background work | Inngest for retained generation, extraction and evaluation. Quota-exhausted retained requests wait and retry with visible status. |
| Database access | Application mutations are server-controlled. Narrow browser reads only where justified. RLS, explicit privileges and server-side ownership enforcement. |
| Environments | Local development/test database and hosted production; no separate hosted staging database initially. |
| Releases | Usable stages: reading/auth → checkpoints → simulations/evaluation → revisions/analytics. |
| Cost | Free services only; no billing activation, paid fallback, automatic upgrade or paid model substitution. Stop or wait when free capacity is exhausted. |

## 2. Document and Code Boundaries

- [Reading requirements](SPECIFICATION.md#reading-tools) own bookmarks, highlights, notes and preferences; [private reading data](DATABASE-DESIGN.md#private-reading-data) owns their schema. Keep delivery evidence in STATUS.md and implementation details here.
- Use existing method files as versioned inputs to assessment services. Record their commit/version for retained generation/evaluation; avoid another independent set of rules in prompts.
- Keep study Markdown, curricula, syllabi and PYQs in their established folders. Site actions never write learner data, generated tests or feedback into Git.
- Add application code under `src/` at the repository root; preserve existing content paths. Maintain one package lockfile and one migration chain in `supabase/migrations/`.

| Proposed location | Responsibility |
|---|---|
| `src/app/` | Routes, layouts, server entry points and HTTP handlers |
| `src/components/` | Shared accessible UI and design tokens |
| `src/modules/content/` | Git catalogue, Markdown rendering, search, sections and revision manifests |
| `src/modules/reader/` | Reading position, bookmarks, highlights and notes |
| `src/modules/assessments/` | Scope, generation contracts, attempts, answer selection and timing |
| `src/modules/evaluation/` | Scoring, extraction review, feedback finalization and recommendation links |
| `src/modules/todos/` | Transient combined refresher tests and trusted completion verification |
| `src/modules/revisions/` | Pure scheduling policy, task transitions and calendar queries |
| `src/modules/dashboard/` | Composed progress queries and full-scope-only charts |
| `src/server/` | Auth, database/storage adapters, Gemini adapter and Inngest handlers |
| `scripts/`, `tests/` | Content indexing, maintenance, backup/restore and verification |

UI components call application services; domain calculations do not depend on React, database clients or model SDKs. Provider adapters implement narrow interfaces. Shared code must not merge checkpoint, simulation and transient to-do lifecycles.

## 3. Resolve Feasibility Before Dependent Features

| Issue | Required resolution |
|---|---|
| Transient to-do tests versus Gemini free service | Verify provider-wide retention, not merely application logging. Google's unpaid-service terms permit processing inputs/outputs for product improvement and human review. Application deletion cannot establish zero provider retention. Block this feature until a free compliant processing route is demonstrated or the learner explicitly clarifies the retention boundary. Never silently relax the requirement. |
| Stateless transient processing | Prototype authenticated encryption of a short-lived test envelope held only in browser memory. Bind it to learner, frozen evaluation and expiry. Keep keys/rubrics unreadable to the browser; server verification alone may change completion. Prove cross-instance operation and bounded payloads without a durable session store. This is proposed, not an established capability. |
| Offline timer | Prototype server timestamps, ordered heartbeats, connection-loss detection and reconnect reconciliation. A server cannot detect physical disconnection instantaneously; measure and document the detection bound. Never trust client-supplied remaining time. |
| Private authentication | Enforce an owner allowlist on sign-up/sign-in and every private route/job. Google OAuth requires client credentials and redirects. Verify email/password confirmation and recovery for the owner; Supabase's default mail service is restricted and unsuitable for general production delivery. |
| Backups within zero budget | Export encrypted retained database data and private objects to an owner-controlled off-site location. Demonstrate restore locally. Choose a free destination before relying on scheduled copies; a copy only in the same project is insufficient. |
| Free model suitability | Verify available models, structured output, image/PDF handling, output limits, quotas and grounding for this account. Benchmark generation and descriptive evaluation separately. A key does not establish every capability. |

Resolve each feature's dependencies before enabling it; independent reading/auth work can proceed. Partial releases must identify unavailable features rather than simulate success.

## 4. Content, Reader and Routes

### Content pipeline

1. Parse curriculum links into a manifest of papers, whole chapters, parts, heading anchors, readiness and source commits. Handle Mathematics chapters mapped to both papers without duplicating physical content.
2. Render Markdown with sanitised HTML, KaTeX, tables, local images and supported diagrams. Do not execute arbitrary repository MDX/scripts. Preserve Hindi in Devanagari and accessible mathematical notation.
3. Build learning-material search, excluding answer keys, private records and historical practice artifacts from learning results. Results open the matching section.
4. Build the manifest before deploying. Synchronise derived catalogue metadata idempotently; reject broken required links and conflicting chapter identities before publication.
5. Distinguish qualification revisions from ordinary commits. Use an explicit reviewed change manifest for substantive versus cosmetic edits; default uncertain teaching changes to substantive rather than letting a model silently preserve qualification.
6. Cancel affected pending revision tasks when a substantive revision becomes current; historical assessments retain source references. Jobs recheck revision eligibility before presentation/finalization.

### Private reading data

Implement the [private reading schema](DATABASE-DESIGN.md#private-reading-data): owner-scoped preferences, positions, bookmarks and annotations. Use its versioned source anchors and conservative re-anchoring rules. Keep reader services separate from qualification and assessment persistence.

Keep theme/text-size preferences separate from assessment records. Reading progress may be saved; transient to-do answers must never use this persistence machinery.

### Route map

| Route family | Purpose |
|---|---|
| `/`, `/learn/...` | Public entry, paper/curriculum navigation and chapter/part reader |
| `/search` | Public learning-material search |
| `/login`, `/auth/...` | Sign-in, callback, password recovery and sessions |
| `/dashboard` | Today's work, paper summaries and resumable activity |
| `/library` | Private bookmarks, highlights and notes |
| `/tests/new`, `/tests/[id]` | Mode selection, generation status and retained attempt |
| `/results/[attemptId]` | Frozen feedback, question details and combined refresher materials |
| `/results/[attemptId]/refresher` | Transient combined test; no permanent test identifier |
| `/revisions`, `/revisions/calendar` | Due list, scheduling controls and calendar |
| `/settings` | Timezone, targets, appearance and revision preferences |

Use stable chapter/heading references behind readable URLs. Private pages, responses and API results must not enter shared caches, public search indexes or static builds.

## 5. Database, Auth and Storage

- Convert the logical draft into reviewed SQL migrations, versioned Zod contracts and typed queries. Use Drizzle for typed server queries where appropriate; SQL migrations are the sole deployed schema history.
- Add reader tables, source/method/model provenance, job dispatch bookkeeping and timer leases as required. Keep progress derived from current qualifications and to-do completion as its single boolean.
- Enable RLS and explicit grants. Prefer user-scoped database access or narrowly permitted transactional functions for ordinary operations; privileged workers validate stored ownership and expected state. Privileged connections do not inherit end-user RLS protection automatically.
- Keep keys/guides in a server-private schema or equivalently denied tables. Return explicit public question DTOs; never send broad rows and remove keys in the browser.
- Enforce cross-user/paper/attempt relationships, immutable finalized simulation results, one combined to-do per simulation evaluation and one pending chapter task. Use constraints plus transactions/triggers for cross-table rules.
- Validate sessions server-side, protect mutations against cross-site requests and restrict redirects. Match the approved owner using trusted verified identity, never client-editable metadata.
- Use private Storage for retained answer files. Authorize uploads and downloads; upload large files directly with scoped permissions instead of forwarding them through a function body. Validate MIME signatures, size, page limits and question/page references. Remove abandoned objects through a documented cleanup job.
- Exclude names, emails and unrelated personal information from model prompts. Recheck provider terms for answer content; private application storage does not imply private third-party processing.

## 6. Retained Assessment Pipeline

### Generation and AI boundary

1. Authenticate, validate paper/mode/readiness, and snapshot relevant chapter revisions, historical paper, source cutoff and method version.
2. Create an idempotent request and dispatch record transactionally. A recoverable dispatcher publishes the Inngest event; event payloads carry record identifiers rather than papers or uploads.
3. Generate a blueprint, bounded question batches and pre-attempt keys/guides. Validate schema, totals, internal choice, language, figures/passages, sources and coverage before marking ready.
4. Independently validate answers, calculations and rubric allocations. Exact checks belong in code; model review alone cannot establish factual correctness. Store useful provenance, not hidden reasoning traces.
5. For unseen mode and checkpoint retries, compare applicable retained history. Use normalised exact checks plus semantic candidate review; add embeddings only if measured need justifies them. Concepts may recur; close rewrites may not.
6. Expose pending/running/completed/failed states and useful stages. Bound retries, respect provider retry guidance and schedule later work after quota exhaustion. Permanent failures remain actionable rather than retrying indefinitely.

The Gemini adapter accepts validated inputs and returns validated outputs. Configure generation and evaluation models separately, record versions, cap context/output/concurrency, and reject unsupported capability combinations. Load relevant material rather than the whole repository. No paid fallback.

Current-affairs generation needs dated authoritative evidence. Prefer a verified free grounding/fetch route; preserve URLs, publication/access dates and cutoff. Treat fetched text as untrusted data. If evidence is unavailable, explain the limitation rather than inventing facts or substituting static questions silently.

### PYQ handling

Unabridged preparation uses verified sources without model paraphrasing. Preserve numbering, instructions, figures and choices; route inadequate transcriptions to the official paper. Keep corpus repair separate from app implementation.

Updated PYQs are separate variants with one-to-one source mappings. Validate unchanged static questions mechanically and precise mirroring/new-question fallbacks against the shared method. Store replacement provenance and separate keys for post-attempt disclosure. Never replace the original corpus.

### Attempts and submission

- Create a stable retained attempt before answering; show questions only after keys/guides and validation exist. Track presentation separately from generation for unseen-history checks.
- Autosave ordinary responses with ordering/version checks. Use one active timer lease per attempt; another tab cannot advance or reset it. Restore acknowledged answers and authoritative remaining time on reconnect.
- Prototype short heartbeat intervals, pause at the last acknowledged active boundary on lease loss, and reconcile expiry transactionally. Delayed expiry handlers recheck lease/current state before submission. Browser clocks and offline indications are display aids only.
- Keep descriptive timing learner-managed. Autosave typed work and map uploads to questions/pages. Review extraction and correct transcription/mapping before scoring, preserving the original submitted answer and extraction history.
- Submission freezes the answer snapshot idempotently. Resolve unreadable work, invalid choices and scoring defects before final feedback; unresolved evaluation is not a final zero.

### Evaluation and finalization

Use deterministic objective marking and exact arithmetic; use pre-attempt descriptive guides with auditable item awards. Reconcile choices and attainable marks, including negative objective totals. Extraction/model confidence does not alter marks.

Finalization atomically records the result, frozen simulation feedback/recommendations, its single combined to-do and eligible scheduling changes. Duplicate callbacks return the existing result. Checkpoint corrections remain versioned under their method; finalized simulation feedback is not regenerated. Requested full model answers are separate and cannot rewrite frozen feedback.

Recommendation links resolve to relevant website sections. Identify unavailable material honestly; do not present placeholders as lessons. Treat missing material as a content dependency for a useful combined refresher test.

## 7. Transient Feedback To-do Tests

Implement separately after section 3's retention gate passes. These tests must bypass retained assessment tables, Inngest, provider file storage, browser storage, service-worker caches, content-bearing analytics, request-body logs and backups.

Proposed flow:

1. Authorize the parent frozen recommendations and confirm the combined to-do is incomplete.
2. Generate one paper-appropriate test covering all recommendations; prepare its key/guide before presentation. Keep browser data in memory and round-trip evaluator state encrypted/authenticated, short-lived and bound to owner and parent evaluation.
3. Evaluate server-side. Client-provided pass/score is never sufficient. Validate coverage, count and the specification's exact threshold.
4. On valid pass, update only the existing completion boolean through an authorized idempotent operation. Otherwise leave it unchanged. Discard working data after response, failure, abandonment or expiry; temporary feedback may remain visible only in active-page memory.

A restart must not disclose secrets or cause false completion. Refresh/expiry may require a fresh test; do not promise retained resume. Quota failure may show a transient retry state while the page is open, but cannot persist a request for later replay. No per-material completion, retry history, completion timestamp or recursive to-do.

## 8. Scheduling, Dashboard and Analytics

- Implement [REVISION-SCHEDULING.md](REVISION-SCHEDULING.md) as a pure, versioned function. Keep marking separate; do not introduce history-based interval growth.
- Current-revision checkpoint qualification creates the initial task. Only eligible finalized chapter simulations update recurring scheduling. Preserve manual/overdue dates, target changes and rescheduling history under the method.
- Store UTC event times and learner-local calendar dates for due dates. Default initial timezone from the browser and allow correction; do not use the hosting server's timezone.
- Query due/overdue/upcoming states directly; do not generate papers in advance or create daily jobs merely to change overdue labels.
- Compose the dashboard from retained records, qualifications, reading position and incomplete combined to-dos. Separate work status from performance.
- Chart only full-scope simulation results, separately by paper. Other modes remain in history/latest-result summaries without entering graphs.

## 9. Delivery Stages and Exit Checks

| Stage | Deliverables | Exit evidence |
|---|---|---|
| 0 — Contracts and feasibility | Validate reader contracts against spec/schema; define state transitions; prototype retention, timer, model and auth constraints. | Each dependency has a tested route or explicit blocker. Unresolved constraints are not described as implemented. |
| 1 — Reading and auth | Shell, themes, navigation, content rendering/search, owner-only Google/email login, reader persistence and dashboard shell. | Anonymous reading works; owner resumes reading/manages annotations on desktop/mobile; others cannot access private features. |
| 2 — Checkpoints | Whole-chapter readiness, fresh MCQs, hidden keys, retained history, qualification and revision invalidation. | Ready chapters work end to end; placeholders blocked; exact thresholds and duplicate/revision cases pass. |
| 3 — Objective simulations | Chapter/cumulative/full GS-I and CSAT, jobs, timer/reconnect, original/updated PYQs, scoring and frozen feedback. | Patterns/coverage validate; autosave/expiry/retries preserve work; provenance and corpus limitations are explicit. |
| 4 — Descriptive simulations | GS I–IV, Essay, Hindi A, English B, Mathematics I–II; typed/uploaded answers, extraction review and evaluation. | Samples for every paper family reconcile choices, allocations, mappings and feedback before freezing. |
| 5 — Combined refresher tests | One transient test per simulation's combined recommendations and trusted completion. | Retention gate resolved; pass/fail/abandon/retry paths leave no durable test data; completion cannot be forged. |
| 6 — Revision and analytics | Chapter-task workflow, settings, due list/calendar, complete dashboard and full-scope charts. | Scheduling/timezone/concurrency cases match the method; unrelated modes never affect schedules/graphs. |
| 7 — Production verification | Migration rehearsal, configuration, deployment, Inngest sync and recovery exercise. | Deployed owner flows work; recovery demonstrated; limitations documented. |

Deliver initial-task creation with checkpoints; stage 6 adds the full recurring workflow/UI. Bring deployment, auth verification and backup/restore checks forward before any earlier release that stores real learner data; stage 7 repeats the relevant checks for the complete system. Useful stages may be released privately without claiming later stages exist. Set dates only after provider behaviour and task costs are measured.

## 10. Verification Strategy

Use Vitest for domain logic, local PostgreSQL integration tests for constraints/RLS/transactions, and Playwright for critical browser flows. CI runs type checks, lint, unit/integration checks, content-link validation and a production build. Most tests use deterministic provider fixtures; bounded real-model checks establish integration and quality without consuming quotas on every commit.

| Boundary | Required checks |
|---|---|
| Auth/isolation | Anonymous/other-user denial, forged ownership, private object URLs, account linking, recovery and session expiry; public reader remains available. |
| Assessment integrity | Hidden keys in HTML/RSC/API/cache responses; malformed model output; duplicate jobs; internal choice; exact penalties/negative scores. |
| Progress/content | Parts, placeholders, shared Mathematics mappings, fresh checkpoint retries, substantive/cosmetic updates, old attempts unable to qualify new revisions. |
| Timer/submission | Offline/reconnect, stale saves, multiple tabs, clock changes, expiry races and workflow restarts. |
| Evaluation | Alternative valid methods, partial credit, unreadable pages, reviewed extraction, invalid choices, immutable feedback and one combined to-do. |
| Transience | Instrument database, storage, jobs, logs, browser persistence and backups; inspect pass/fail/timeout/abandon and forged/replayed envelopes. Provider retention needs independent evidence. |
| Scheduling | Exact boundaries, rounding/clamps, targets, local dates, manual tasks, overdue completion, invalidation and concurrent finalization. |
| Reader data | Owner-only CRUD, cross-session save conflicts, shared-chapter annotations, explicit deletion and anchor recovery after cosmetic/substantive edits. |
| UX | Keyboard/focus/error states, screen-reader labels, contrast, mobile layouts, Hindi/math rendering and refresher anchors. |
| Recovery | Restore retained records/private files locally; verify ownership, keys, frozen feedback and schedules without replaying completed jobs. |

## 11. Deployment, Configuration and Recovery

Use this Git repository for application/content source and Vercel Hobby for personal deployment. Lock supported dependencies after checking current documentation. Preview/local environments must not write to production or register production jobs; mock unavailable services instead of testing against private production data.

| Configuration | Treatment |
|---|---|
| Supabase URL/publishable key | Public client configuration protected by RLS and grants |
| Database/migration credentials and Supabase privileged key | Server/CI only; separate migration access from ordinary queries |
| Gemini key and generation/evaluation model settings | Server only; verify both configurations independently |
| Inngest event/signing keys | Correct production environment; validate signatures and sync deployed serve endpoint |
| Google OAuth credentials | Auth configuration with exact callback/redirect URLs |
| Owner identity, app URL and transient-envelope secret | Server configuration; verify owner identity |
| Backup encryption/destination credentials | Restricted maintenance context; never Git, public logs or client bundles |

GitHub Actions secrets do not automatically become Vercel runtime variables. Enter runtime secrets securely once the project exists; secret values cannot be read back through GitHub. User-operated setup may still be needed for OAuth, runtime secrets and an off-site backup destination. Existing service connections do not establish these.

Apply reviewed migrations before enabling dependent features, through one controlled runner. Prefer backward-compatible changes; a code rollback does not undo database migrations. Run catalogue and Inngest sync after relevant deployments, with smoke checks before enabling AI actions.

Back up retained PostgreSQL records, required auth identity/restore metadata and private objects together, with encryption and a manifest. Include compatible schema/method versions and a credential-reset procedure. Begin with owner-triggered exports; schedule them only after selecting a free destination and retention policy. Never put unencrypted learner backups in this public repository or public CI artifacts. Verify restore before treating backups as protection.

Use content-free operational logs: request/job IDs, stage, duration and error category. Track quota headroom without logging prompts/submissions. Retained jobs pause/resume after quota recovery; reading and saved results should stay usable. Feature switches expose unavailable models, grounding or transient processing rather than silently weakening requirements.

## 12. External Constraints and Recheck Triggers

Official sources checked 26 November 2026; recheck before implementation and when plans, models, SDKs or terms change:

- [Gemini API terms](https://ai.google.dev/gemini-api/terms): unpaid-service input/output use creates the transient-provider-retention issue above.
- [Gemini pricing/capabilities](https://ai.google.dev/gemini-api/docs/pricing): verify free model/grounding availability for the account.
- [Gemini Files API](https://ai.google.dev/gemini-api/docs/files): uploaded files are stored, unsuitable for strict transient tests; ordinary processing needs provider-file cleanup.
- [Vercel function limits](https://vercel.com/docs/functions/limitations): request-size/duration limits require direct retained uploads and bounded workflow steps; streaming does not remove execution limits.
- [Inngest app sync](https://www.inngest.com/docs/platform-and-operations/apps-and-syncs): deployment and registration/sync are separate integration steps.
- [Supabase Google login](https://supabase.com/docs/guides/auth/social-login/auth-google) and [SMTP restrictions](https://supabase.com/docs/guides/auth/auth-smtp): both selected login methods need configuration and verification.
- [Supabase backups](https://supabase.com/docs/guides/platform/backups): Free projects need their own export/recovery approach; database backups exclude stored file objects.

Refine technical choices from prototype evidence. Changes to accepted UX, cost or retention requirements require an explicit recorded decision. Put actual implementation/verification results in STATUS.md.
