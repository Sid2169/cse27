# AGENTS.md

Shared instructions for this UPSC CSE 2027 preparation repository. Paper scope/navigation are in [README.md](README.md); current repository status is in [STATUS.md](STATUS.md).

## Audience and Quality

Write for a complete beginner: no prior UPSC preparation, coaching, or assumed degree-level subject background. Explain necessary vocabulary and intermediate reasoning without sacrificing accuracy. Choose the structure and supporting examples that best teach or assess the subject; optional techniques are not mandatory output sections.

- Keep official syllabus text verbatim. Root [syllabus.md](syllabus.md) is the source for the common papers; use the official notification for additional paper-specific material.
- Support exam rules, PYQ references, numerical claims and other consequential factual claims with identifiable sources. Prefer official or primary evidence and authoritative subject references; record external sources and access dates. Distinguish evidence, interpretation and uncertainty.
- Use the populated year-wise PYQ files as the working corpus, respecting their caveats. Routine re-extraction and corpus auditing are separate tasks. Flag material discrepancies encountered during other work and investigate when needed for the task; do not silently alter the corpus or propagate a known error.
- Date current status, forecasts and changing rules, and identify useful recheck triggers. Give historical data its observation period; it need not be replaced simply because newer data exists. Use natural wording rather than mandatory flag syntax.
- Study material defaults to English. Hindi is the selected Compulsory Indian Language (Paper A), with Hindi in Devanagari as its instructional language; English passages, translations and comparisons are appropriate when teaching translation. Assessment language follows the relevant method or the learner's request.
- Only commit when explicitly asked. Keep credentials out of the repository.

## Repository Contract

Folders follow `Prelims-<paper>` or `Mains-<paper>`. Within each paper folder:

- `<paper-name>-Syllabus.md` contains the official syllabus.
- `<paper-name>-Curriculum.md` is the study plan and authoritative chapter-file index.
- `<paper-name>-PYQS/<year>-<paper-name>.md` holds the year-wise PYQ corpus, currently organised for 2013–2026. Missing years or extraction gaps must remain explicit. When a subject has two question papers, keep both in that one file under separate `## Paper I` and `## Paper II` sections.
- Chapter filenames match the curriculum. Split chapters use `<chapter>-part-N.md`, with each part linked from the index.
- Preserve established chapter names and filenames; splits may add linked part files without renaming existing files.
- Existing repository test files are historical practice artifacts. Website assessments, attempts and feedback are created dynamically in application storage; do not write them to Git. Method identifiers describe assessment records, not Markdown output paths.

Use relative Markdown links for repository files. Keep the curriculum index in sync with chapter additions or splits and README navigation in sync with structural changes. Update STATUS.md from evidence when content, methods, assessments or application progress changes; keep aggregate status out of README.md and IMPLEMENTATION-PLAN.md. Distinguish documented methods, implemented features and open decisions. Clearly distinguish planning placeholders from authored material.

Work from syllabus → curriculum → chapters. The curriculum sets planned coverage and a recommended learning sequence, not an inflexible teaching script. If a boundary or dependency is unsuitable, flag the issue and align any authorised revision with the index; the official syllabus takes precedence.

## Task Methods

Load the method relevant to the task. This file owns shared safeguards; SPECIFICATION.md owns product requirements. TEST-GENERATION-COMMON.md owns cross-paper generation procedures; paper generators own question design and patterns, evaluation methods own scoring/feedback, CHAPTER-CHECKPOINT.md owns qualification, and REVISION-SCHEDULING.md owns chapter-test dates. Link these owners rather than duplicating their rules.

| Task | Method |
|---|---|
| Curriculum | [CURRICULUM-GENERATION.md](CURRICULUM-GENERATION.md) |
| Chapter | [CHAPTER-GENERATION.md](CHAPTER-GENERATION.md) |
| Shared test generation procedures | [TEST-GENERATION-COMMON.md](TEST-GENERATION-COMMON.md) |
| Chapter checkpoint generation and evaluation — all papers | [CHAPTER-CHECKPOINT.md](CHAPTER-CHECKPOINT.md) |
| Chapter-test revision scheduling | [REVISION-SCHEDULING.md](REVISION-SCHEDULING.md) |
| Prelims tests — GS-I and CSAT | [PRELIMS-TEST-GENERATION.md](PRELIMS-TEST-GENERATION.md) |
| Prelims feedback | [PRELIMS-TEST-FEEDBACK.md](PRELIMS-TEST-FEEDBACK.md) |
| Mains tests — GS, Essay, Hindi, English, Mathematics | [MAINS-TEST-GENERATION.md](MAINS-TEST-GENERATION.md) |
| Mains evaluation — GS, Essay, Hindi, English, Mathematics | [MAINS-ANSWER-EVALUATION.md](MAINS-ANSWER-EVALUATION.md) |
| Repository status | [STATUS.md](STATUS.md) |
| Implementation, planning and decisions | [IMPLEMENTATION-PLAN.md](IMPLEMENTATION-PLAN.md) |

## Shared Assessment Rules

- Generate tests and feedback/evaluation only on request. Use the requested paper and mode; explain a readiness problem rather than silently switching modes.
- A chapter or part is ready for assessment only when substantive teaching content exists and can support the requested test. A placeholder file does not qualify.
- Use PYQs to calibrate style and demand, without reproducing them verbatim except in requested original/updated PYQ modes under [SPECIFICATION.md](SPECIFICATION.md). Respect the mode's knowledge boundary while testing transfer through new contexts; supply unfamiliar contextual information required for reasoning.
- Prepare answer keys or evaluator guides before the learner attempts the test. Keep them server-private and unavailable during the attempt; UI hiding alone is not access control.
- Preserve questions, learner answers, keys/guides and previous feedback, except for transient feedback to-do tests under [SPECIFICATION.md](SPECIFICATION.md#recommendation-completion-and-follow-up-tests). Resolve scoring defects before simulation feedback is finalized; finalized feedback and recommendations are immutable. Other necessary corrections remain explicit/versioned and preserve originals. Do not retrofit a rubric to favour or penalise an answer.
- Associate feedback with its test/attempt in application storage. Finalize each simulation attempt's feedback/recommendations once; repeat requests return that frozen record without regenerating it or creating another to-do. Retain earlier records. Feedback to-do tests are transient and persist only completion state under the specification.
- Base diagnosis on observable evidence. Do not invent strengths, weaknesses, guessing or time pressure. Full marks are possible; refresher recommendations may target retention without claiming an observed gap. Adapt feedback length and follow-up to the attempt; no fixed remediation count or retest schedule is required.
- For descriptive answers, support typed responses and readable scans or photographs. Do not guess unreadable text. Give targeted improvement advice; full model answers are provided only on request and must not become the sole acceptable answer.
- Assessment is practice, not official UPSC marking or a basis for predicting rank or percentile.

## Verification

There is no build or test suite. Check the work affected by the task:

- For syllabus edits, compare the text with its official source.
- For curriculum/chapter edits, check coverage, relevant prerequisites, source support, index entries and local links. For planned links, use clearly labelled placeholders where needed.
- For tests, check substantive readiness, scope, unique ID, key/guide correctness, and the relevant mode's duration, marks and question pattern.
- For feedback, check the attempt mapping, scoring arithmetic and evidence behind conclusions, and preserve earlier records.
- For instruction changes, check cross-file consistency and links; avoid making the same rule authoritative in several places.
