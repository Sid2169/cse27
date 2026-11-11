# AGENTS.md

Guidance for AI agents working in this repository.

## Repository Purpose

Complete preparation guide for UPSC CSE 2027. One folder per paper for all Prelims and Mains papers, excluding the optional subject. Content is study material authored chapter-by-chapter, with per-paper syllabi kept verbatim from official UPSC notifications. The audience is a complete beginner: no prior UPSC preparation, coaching, or assumed degree-level background in the subjects.

## Structure

- `README.md` — entry point; tables map every paper to its folder, syllabus, curriculum, and PYQ files; practice-test conventions are listed separately. Keep tables in sync when adding files or folders.
- `syllabus.md` — root file with the complete official UPSC CSE syllabus, verbatim (source: CSE 2026 Examination Notice No. 05/2026-CSE, Appendix I Section III).
- `CURRICULUM-GENERATION.md` — curriculum-specific method: beginner-first, research the exam pattern first, then generate from pattern, syllabus, and PYQs. Hindi is the selected Compulsory Indian Language (Paper A).
- `CHAPTER-GENERATION.md` — chapter-specific method: subject-led structure, beginner bridge, static/dynamic flags, sources, and rules for splitting large chapters.
- `PRELIMS-TEST-GENERATION.md` — on-demand chapter-part test method for Prelims: unique IDs, four-option MCQs, duration, marking, and file structure.
- `PRELIMS-TEST-FEEDBACK.md` — on-demand Prelims test feedback method: scoring, diagnosis, remediation, retest schedule, and recording feedback in the test file.
- `MAINS-TEST-GENERATION.md` — on-demand Mains GS I–IV test method: chapter-specific, covered-so-far, and full-syllabus modes; paper patterns, question design, evaluator guides, and test file structure.
- `MAINS-ANSWER-EVALUATION.md` — on-demand Mains GS I–IV evaluation method: rubric, bands, confidence, caps, case-study checks, feedback, and retest plan.
- `<paper-name>/` — one folder per paper:
  - `<paper-name>-Syllabus.md` — official UPSC syllabus for that paper, verbatim, copied from root `syllabus.md` (or the official notification for paper-specific detail). Do not paraphrase.
  - `<paper-name>-Curriculum.md` — comprehensive, phased curriculum divided into phases and chapters; also acts as the index linking to each chapter file or part.
  - `<paper-name>-PYQS/<year>-<paper-name>.md` — year-wise PYQ notes, one file per exam year (2013–2026).
  - `<chapter>.md` — chapter content named in the curriculum; if the chapter is split, `<chapter>-part-N.md` with every part linked from the curriculum.
  - `Prelims-<paper>-TESTS/<test-id>.md` — on-demand chapter-part tests for Prelims, with feedback appended in the same file.
  - `Mains-<paper>-TESTS/<test-id>.md` — on-demand Mains GS I–IV tests, with evaluation appended in the same file.

Folder names follow the pattern `Prelims-<paper>` and `Mains-<paper>` (e.g. `Prelims-General-Studies-I`, `Mains-General-Studies-II`).

## Workflow

When creating content for a paper, work in this order:

1. Populate `<paper-name>-Syllabus.md` verbatim from the corresponding section of root `syllabus.md`.
2. Write `<paper-name>-Curriculum.md`: first research the exam pattern (format, PYQ distribution, weightage), then divide the syllabus into beginner-first phases and chapters using the pattern, syllabus, and the populated `<paper-name>-PYQS/` files. Open with exam orientation and foundations, then core syllabus, applied/PYQ work, and revision. Use the year-wise PYQ findings already in `<paper-name>-PYQS/`; do not re-extract or re-verify them during curriculum generation. Follow `CURRICULUM-GENERATION.md`. The curriculum is the source of truth for chapter list, file names, and order.
3. Create chapter files one at a time as `<chapter>.md` inside the paper folder, matching the exact file name linked from the curriculum. Follow `CHAPTER-GENERATION.md`. If a chapter is split, create numbered part files at conceptual seams.
4. Update the curriculum index links as chapters are added so every chapter file or part is reachable from the curriculum.
5. For Prelims, generate chapter-part practice tests only on demand, following `PRELIMS-TEST-GENERATION.md`. Add feedback only on request, following `PRELIMS-TEST-FEEDBACK.md`, and record it in the same test file.
6. For Mains GS I–IV, generate tests only on demand, following `MAINS-TEST-GENERATION.md`. Evaluate attempted answers only on request, following `MAINS-ANSWER-EVALUATION.md`, and record the evaluation in the same test file.

## Rules

- Syllabus text is verbatim only — never reword, summarize, or "improve" official UPSC wording.
- Curricula and chapters assume zero prior UPSC or subject knowledge: define jargon, state prerequisites, and add bridge material where school-level background would otherwise be assumed.
- The selected Compulsory Indian Language is Hindi (Paper A); Compulsory English is Paper B.
- Chapter files must correspond to entries in the paper's curriculum; split parts must be labelled and linked from the curriculum.
- Follow `CHAPTER-GENERATION.md` for beginner bridging, subject-specific structure, dynamic-content flags, sources, and chapter splitting.
- Prelims practice tests cover one chapter part, use four-option MCQs, and stay within 30–60 minutes; follow `PRELIMS-TEST-GENERATION.md`. Do not turn them into full-length mocks.
- Prelims test feedback is generated only on demand and appended to the test file; follow `PRELIMS-TEST-FEEDBACK.md`.
- Mains GS I–IV tests use the three modes in `MAINS-TEST-GENERATION.md`: chapter-specific (2 hours), covered-so-far (3 hours), and full-syllabus (3 hours). Do not cover Essay or language papers there.
- Mains evaluation is generated only on demand and appended to the test file; follow `MAINS-ANSWER-EVALUATION.md`.
- Exam-pattern claims must be sourced; do not guess PYQ years or weightage.
- Use Markdown links with relative paths.
- Do not commit secrets; no credentials belong in this repo.
- Only commit when explicitly asked.

## Verification

No build or test suite. After edits:

- Check that all Markdown links in `README.md` and curriculum files resolve to existing files.
- Confirm syllabus wording matches root `syllabus.md` (or the official notification).
- Confirm each curriculum covers the full paper syllabus and that its pattern claims are sourced.
- Confirm every curriculum chapter or part is linked and its file exists.
- Confirm PYQ folders and files follow the `<year>-<paper-name>.md` pattern.
- Confirm Prelims test IDs are unique, each test covers one chapter part, and feedback is recorded in the test file.
- Confirm Mains test IDs are unique, each test uses the requested mode and paper pattern, and evaluation is recorded in the test file.
