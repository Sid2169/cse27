# AGENTS.md

Guidance for AI agents working in this repository.

## Repository Purpose

Complete preparation guide for UPSC CSE 2027. One folder per paper for all Prelims and Mains papers, excluding the optional subject. Content is study material authored chapter-by-chapter, with per-paper syllabi kept verbatim from official UPSC notifications. The audience is a complete beginner: no prior UPSC preparation, coaching, or assumed degree-level background in the subjects.

## Structure

- `README.md` — entry point; tables map every paper to its folder, syllabus, curriculum, and PYQ files. Keep tables in sync when adding files or folders.
- `syllabus.md` — root file with the complete official UPSC CSE syllabus, verbatim (source: CSE 2026 Examination Notice No. 05/2026-CSE, Appendix I Section III).
- `CURRICULUM-GENERATION.md` — curriculum-specific method: beginner-first, research the exam pattern first, then generate from pattern, syllabus, and PYQs. Hindi is the selected Compulsory Indian Language (Paper A).
- `CHAPTER-GENERATION.md` — chapter-specific method: subject-led structure, beginner bridge, static/dynamic flags, sources, and rules for splitting large chapters.
- `<paper-name>/` — one folder per paper:
  - `<paper-name>-Syllabus.md` — official UPSC syllabus for that paper, verbatim, copied from root `syllabus.md` (or the official notification for paper-specific detail). Do not paraphrase.
  - `<paper-name>-Curriculum.md` — comprehensive, phased curriculum divided into phases and chapters; also acts as the index linking to each chapter file or part.
  - `<paper-name>-PYQS/<year>-<paper-name>.md` — year-wise PYQ notes, one file per exam year (2013–2026).
  - `<chapter>.md` — chapter content named in the curriculum; if the chapter is split, `<chapter>-part-N.md` with every part linked from the curriculum.

Folder names follow the pattern `Prelims-<paper>` and `Mains-<paper>` (e.g. `Prelims-General-Studies-I`, `Mains-General-Studies-II`).

## Workflow

When creating content for a paper, work in this order:

1. Populate `<paper-name>-Syllabus.md` verbatim from the corresponding section of root `syllabus.md`.
2. Write `<paper-name>-Curriculum.md`: first research the exam pattern (format, PYQ distribution, weightage), then divide the syllabus into beginner-first phases and chapters using the pattern, syllabus, and the populated `<paper-name>-PYQS/` files. Open with exam orientation and foundations, then core syllabus, applied/PYQ work, and revision. Use the year-wise PYQ findings already in `<paper-name>-PYQS/`; do not re-extract or re-verify them during curriculum generation. Follow `CURRICULUM-GENERATION.md`. The curriculum is the source of truth for chapter list, file names, and order.
3. Create chapter files one at a time as `<chapter>.md` inside the paper folder, matching the exact file name linked from the curriculum. Follow `CHAPTER-GENERATION.md`. If a chapter is split, create numbered part files at conceptual seams.
4. Update the curriculum index links as chapters are added so every chapter file or part is reachable from the curriculum.

## Rules

- Syllabus text is verbatim only — never reword, summarize, or "improve" official UPSC wording.
- Curricula and chapters assume zero prior UPSC or subject knowledge: define jargon, state prerequisites, and add bridge material where school-level background would otherwise be assumed.
- The selected Compulsory Indian Language is Hindi (Paper A); Compulsory English is Paper B.
- Chapter files must correspond to entries in the paper's curriculum; split parts must be labelled and linked from the curriculum.
- Follow `CHAPTER-GENERATION.md` for beginner bridging, subject-specific structure, dynamic-content flags, sources, and chapter splitting.
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
