# AGENTS.md

Guidance for AI agents working in this repository.

## Repository Purpose

Complete preparation guide for UPSC CSE 2027. One folder per paper for all Prelims and Mains papers, excluding the optional subject. Content is study material authored chapter-by-chapter, with per-paper syllabi kept verbatim from official UPSC notifications.

## Structure

- `README.md` — entry point; tables map every paper to its folder, syllabus, and curriculum files. Keep tables in sync when adding files or folders.
- `syllabus.md` — root file with the complete official UPSC CSE syllabus, verbatim (source: CSE 2026 Examination Notice No. 05/2026-CSE, Appendix I Section III).
- `<paper-name>/` — one folder per paper:
  - `<paper-name>-Syllabus.md` — official UPSC syllabus for that paper, verbatim, copied from root `syllabus.md` (or the official notification for paper-specific detail). Do not paraphrase.
  - `<paper-name>-Curriculum.md` — comprehensive, phased curriculum divided into phases and chapters; also acts as the index linking to each chapter file.
  - `<chapter>.md` — one file per chapter named in the curriculum.

Folder names follow the pattern `Prelims-<paper>` and `Mains-<paper>` (e.g. `Prelims-General-Studies-I`, `Mains-General-Studies-II`).

## Workflow

When creating content for a paper, work in this order:

1. Populate `<paper-name>-Syllabus.md` verbatim from the corresponding section of root `syllabus.md`.
2. Write `<paper-name>-Curriculum.md`: divide the syllabus into phases and chapters. The curriculum is the source of truth for chapter list, file names, and order.
3. Create chapter files one at a time as `<chapter>.md` inside the paper folder, matching the exact file name linked from the curriculum.
4. Update the curriculum index links as chapters are added so every chapter file is reachable from the curriculum.

## Rules

- Syllabus text is verbatim only — never reword, summarize, or "improve" official UPSC wording.
- Chapter files must correspond 1:1 to entries in the paper's curriculum.
- Use Markdown links with relative paths.
- Do not commit secrets; no credentials belong in this repo.
- Only commit when explicitly asked.

## Verification

No build or test suite. After edits:

- Check that all Markdown links in `README.md` and curriculum files resolve to existing files.
- Confirm syllabus wording matches root `syllabus.md` (or the official notification).
