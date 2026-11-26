# Mains Test Generation Instructions

Generate on-demand descriptive tests for **GS I–IV, Essay, Hindi Paper A, English Paper B and Mathematics Papers I–II**. Apply [AGENTS.md](AGENTS.md), the relevant paper's syllabus/curriculum and [MAINS-ANSWER-EVALUATION.md](MAINS-ANSWER-EVALUATION.md). Application modes and retention follow [SPECIFICATION.md](SPECIFICATION.md); MCQ chapter checkpoints are separate.

## Scope and Modes

Use [TEST-GENERATION-COMMON.md](TEST-GENERATION-COMMON.md) for mode selection, readiness, unseen checks, PYQ preparation and recommendation follow-ups. Record a concise blueprint and any current-affairs cutoff. Calibrate demand against relevant PYQs and their caveats; a diagnostic label does not justify simplifying FULL tests. Descriptive durations are suggested; submission and timing follow the specification.

## Paper Patterns and Question Design

Full-paper baselines are three hours, 250 marks for GS, Essay and each Mathematics paper; 300 marks for each qualifying language paper. Use the selected paper's verified instructions for sections, internal choice, compulsory questions, item marks and word limits. CH/CUM/FU are scaled practice, not miniature papers forced into a full-paper structure. Do not apply Prelims negative marking.

| Paper | Design requirements |
|---|---|
| GS I–III | Full papers: 20 compulsory questions, 10 × 10 marks and 10 × 15 marks, with 150/250-word limits respectively. Use clear directives and varied factual, explanatory, analytical and evaluative demands as appropriate. |
| GS IV | Full papers: Section A Q1–Q6 with 13 theory sub-parts × 10 marks; Section B Q7–Q12 with six cases × 20 marks. Verify current item-specific word limits. Cases should test substantive ethical or administrative reasoning, without requiring one repeated decision template. |
| Essay | Use varied topics supporting interpretation and sustained argument; follow verified full-paper topic choices and length guidance. CH/CUM may assess taught skills through interpretation, planning, paragraphs, revision or complete essays as appropriate. Do not turn prompts into expanded GS questions or impose a fixed topic taxonomy. |
| Hindi A | Use matriculation-level comprehension, précis, usage/vocabulary, short composition and translation in both directions. Write instructions in Hindi in Devanagari, with English where translation requires it. Follow Hindi's own verified section allocations. |
| English B | Use matriculation-level comprehension, précis, usage/vocabulary and short composition under its own verified blueprint. Do not import Hindi's translation component. Questions and responses are in English. |
| Mathematics I–II | Identify the selected paper and respect its syllabus boundary, including where chapters serve both papers. Use concepts, proofs, derivations, calculations and applications as appropriate. Follow that paper's verified compulsory-question and selection rules; do not make every offered question compulsory. Check hypotheses, domains, data, notation and solvability, and independently work reference solutions. |

Supply all necessary passages, figures and data. For generated questions, state item marks and relevant length or response instructions. Use English by default outside Hindi A, recording any requested answer language. Preserve original wording and language instructions in PYQ mode.

## Pre-attempt Evaluator Guide

Prepare a guide for every offered question, including alternatives, before the attempt. Include the demand, supported reference content, question-specific criteria and allocations totalling its marks, and what earns partial credit. These are practice rubrics, not official UPSC marking schemes.

Keep the guide concise but sufficient for reliable evaluation:

- **GS:** identify relevant dimensions and defensible approaches. Allocate case-study marks to requested sub-parts without overlapping credit.
- **Essay:** allow defensible interpretations; allocate marks to relevant qualities such as argument, coherence, illustration and expression, without mandatory quotations, headings or a fixed outline.
- **Languages:** provide passage-grounded answers, précis essentials, acceptable usage variants and translation references where applicable. Judge fidelity, compression and language by the actual task; a sample translation or précis is not the only acceptable answer.
- **Mathematics:** provide checked solutions and allocations for valid setup, method, reasoning and results as appropriate. Allow alternative methods and justified follow-through after local errors; do not invent a universal marks-per-step rule.

Keep keys/guides server-private and unavailable during attempts. Never construct a scoring rubric after seeing the learner's answer.

## IDs and Recording

| Paper | Prefix | Paper folder |
|---|---|---|
| GS I–IV | `GS1`–`GS4` | `Mains-General-Studies-<I|II|III|IV>/` |
| Essay | `ESSAY` | `Mains-Essay/` |
| Hindi A | `HINDI-A` | `Mains-Indian-Language/` |
| English B | `ENG-B` | `Mains-English/` |
| Mathematics I / II | `MATH1` / `MATH2` | `Mains-Mathematics/` |

Use `<prefix>-CH-<chapter-slug>-T01` for chapter tests and `<prefix>-<mode>-T01` otherwise, incrementing to the next unused number. Record historical/target years for PYQ variants. FU uses its originating simulation feedback only during transient processing; it has no permanent test ID or file. Existing test IDs remain valid.

Store site assessments in application storage, not repository files. Include ID, paper, mode, chapter revisions where applicable, coverage links, blueprint, suggested duration, offered/required answer counts, maximum attainable marks, choice rules, applicable length guidance, answer language, sources/access dates, generation date and status.

Present instructions/questions and keep evaluator guides server-private until submission. Explain permitted choices and unaided practice without guide consultation; do not require answers to unselected alternatives. Track evaluation status on the site. These recording rules apply to real-paper simulations; FU questions, guides and evaluation are never saved. This generator does not calculate completion, evaluate learner responses or set revision dates.

## Sources and Verification

Rule baseline: [UPSC CSE 2026 notification, Appendix I](https://upsc.gov.in/uploads/2026/05/Civil-Services-Preliminary-Examination-2026-Notice-E.pdf), checked 26 November 2026. The [official paper listing](https://upsc.gov.in/exam-documents/question-papers/) and each paper's curriculum provide pattern references and retrieval caveats. [Official Mathematics I, 2026](https://upsc.gov.in/uploads/2026/09/QP-CSM-26-010926-Optional-MATHEMATICS-PAPER_I-1.pdf), checked 26 November 2026, confirms eight offered questions, five required, Q1/Q5 compulsory and at least one optional selection from each section. Verify Mathematics II's own instructions before generation.

Recheck when a new notification or paper changes the baseline. Before FULL or historical-pattern generation, record the actual pattern source/year; if it cannot be verified, explain the limitation rather than invent section allocations. Language corpus placeholders are not usable PYQs.

Check scope/readiness, factual support, independent solutions, ambiguity, guide allocations, choice rules, attainable totals, workload, numbering, unseen-question exclusions where applicable, ID uniqueness and local links. Do not generate a test merely to verify these instructions.
