# UPSC CSE Preparation Platform — Specification

Updated: 19 November 2026. These are application requirements; content and assessment implementation remain incomplete.

## Objective and scope

A web platform for **study → test → feedback → revision → reassessment**, designed for a complete beginner.

- Cover Prelims and Mains papers listed in [README.md](README.md), including Hindi Paper A and Mathematics Papers I and II. Other subjects may be added later; Interview preparation is excluded.
- Provide public study material, private learner progress, AI-generated tests and evaluation, and performance-based revision recommendations.
- Do not assume a fixed chapter structure or count while content is being authored.

## Access and navigation

- Anonymous visitors can read published material. Progress tracking and assessments require login; learners can access only their own private records.
- Git Markdown remains authoritative. Follow curriculum order, with folders, chapters and parts as navigation levels. Page headings form an on-page contents menu.
- Established chapter names and filenames remain frozen. Label planning placeholders; they cannot support chapter tests or checkpoints.
- The dashboard shows each paper's completion percentage, scheduled tests, latest cumulative result and latest full-scope/PYQ result.
- Request tests by paper and mode from the dashboard, or open chapter practice directly from its page.

## Test modes

All assessments are paper-specific and requested on demand.

| Mode | Coverage and behaviour |
|---|---|
| Chapter | One whole chapter, including all parts; test only its taught material. |
| Cumulative | Only chapters whose checkpoints the learner has passed. Scale question count, marks and suggested duration to completed coverage. |
| Full-scope unseen | Full-paper scope and verified examination pattern. Exclude questions previously presented to that learner and close rewrites; concepts and skills may recur. |
| PYQ | Learner-selected historical year and paper, reproduced verbatim with original numbering, diagrams, choices and instructions. |

- Choose a worthwhile chapter-test size without padding. Explain insufficient readiness or coverage rather than silently changing mode.
- Full-scope tests may use the verified syllabus and PYQs before teaching content is complete; label early attempts diagnostic.
- Preserve PYQ source caveats. For incomplete or unverified transcriptions, provide the official paper rather than invent missing text.
- Prepare and validate keys or evaluator guides before presenting questions; keep them unavailable during the attempt.

## Checkpoints and progress

- Each chapter ends with a separate, short, **untimed MCQ checkpoint**, including chapters for descriptive papers.
- Questions carry equal marks: wrong and blank answers earn zero, with no negative marking. Pass at **80% or above** of available marks.
- Allow retries, generating fresh questions through AI each time. Exclude repeats and close rewrites while retaining meaningful chapter coverage.
- Mark a chapter complete only after a checkpoint pass. Completion does not establish descriptive-writing proficiency.
- Paper completion = **100 × checkpoint-qualified chapters ÷ all indexed chapters**, including placeholders. Parts do not count separately. Adding chapters may lower the percentage; an empty index shows “not available.”

## Attempt experience

| Assessment | Experience |
|---|---|
| Prelims GS I and CSAT | On-screen MCQs, answer marking, autosave and a server-controlled timer. Submit on learner command or automatically when active time expires. |
| Descriptive papers | Provide the question paper and suggested duration. Learners manage timing and may submit text, documents or images for evaluation whenever ready. |
| Chapter checkpoints | On-screen MCQs and learner-controlled submission, without a timer. |

- Connection loss pauses timed sessions and timers. Reconnection restores saved answers and remaining time. Server-enforced expiry uses the remaining active-time allowance.
- Process generation, document reading and evaluation asynchronously with pending, running, completed and failed states. Allow safe retries without duplicate submissions or loss of completed work.
- Do not guess unreadable answers or ambiguous question mappings. Request clarification and identify unresolved scores.

## Generation and evaluation heuristics

Use the official syllabus and verified paper instructions for scope and format; calibrate demand using local PYQs with their caveats. Date changing facts and recheck patterns when new official papers or rules appear.

These are practice heuristics, not official UPSC marking schemes. Use question-specific criteria and allocations; avoid universal scoring weights, compulsory answer templates and automatic score caps.

| Paper or purpose | Generation | Evaluation |
|---|---|---|
| Checkpoints | Sample important taught ideas across the chapter. Use clear single-answer MCQs, plausible distractors and fresh applications. | Apply checkpoint scoring; explain errors and link relevant sections. |
| Prelims GS I | Balance syllabus breadth, conceptual reasoning, factual depth and reading load against PYQs. | Apply the declared marking rule; report correct, wrong and blank counts, penalties and net score. |
| Prelims CSAT | Cover comprehension, reasoning, numeracy and data interpretation appropriate to scope. Supply required passages/data and independently verify solutions. | Apply the declared marking rule; explain reasoning and distinguish observed errors from uncertain causes. |
| Mains GS I–IV | Use paper-appropriate directives and case studies. Adapt existing methods to whole-chapter coverage and scaled cumulative tests. | Credit relevant, defensible reasoning against the question's criteria, including approaches absent from the guide. |
| Essay | Offer varied prompts supporting interpretation and sustained argument. Chapter/cumulative practice targets taught writing skills. | Judge relevance, development, coherence, illustration and expression. Accept defensible interpretations without requiring quotations or a fixed structure. |
| Hindi Paper A | Cover comprehension, précis, usage, short composition and translation in both directions as scope permits. Use Hindi instructional wording. | Assess meaning, fidelity, compression, grammar and expression as appropriate. Accept faithful translation alternatives; default feedback to Hindi. |
| English Paper B | Cover comprehension, précis, usage/vocabulary and short composition under its own paper pattern. | Assess comprehension, faithful summarisation and clear, accurate expression; award task-appropriate partial credit. |
| Mathematics I and II | Keep paper boundaries explicit. Test concepts, proofs, derivations, calculations and applications as appropriate; verify assumptions, solvability and reference solutions. | Credit valid methods and intermediate reasoning. Distinguish conceptual errors from arithmetic slips; allow justified follow-through credit without repeatedly penalising one error. |
| Historical PYQs | Preserve the original paper. | Prefer available official objective keys. Label independently prepared keys and descriptive guides as practice interpretations, prepared before the attempt. |

Existing references: [Prelims generation](PRELIMS-TEST-GENERATION.md), [Prelims feedback](PRELIMS-TEST-FEEDBACK.md), [Mains GS generation](MAINS-TEST-GENERATION.md) and [Mains GS evaluation](MAINS-ANSWER-EVALUATION.md). Their chapter-part/fixed cumulative patterns need explicit reconciliation with these application requirements. Essay, language and Mathematics methods still require implementation; [PLANNED-FEATURES.md](PLANNED-FEATURES.md) is planning material.

## Feedback, revision and scheduling

- Evaluate the current attempt and consult relevant earlier attempts for supported patterns. Identify strengths, gaps and uncertainty from observable evidence; do not invent guessing, time pressure or causes.
- Recommend sections for chapter-test revision and chapters for cumulative-test revision. Keep advice proportional to evidence; provide full model answers only on request.
- Performance graphs use **full-scope tests only**, separately for each paper. Exclude cumulative, checkpoint and PYQ results.
- Schedule the next test by type, paper and due time; generate contents only when requested. Consider performance, elapsed time and past chapter-test count where relevant. Retention modelling and scheduling intervals remain open.
- Learners can flag problematic questions. Preserve original questions, keys, responses and evaluations; record corrections explicitly and apply the corrected basis consistently to affected attempts.

## Persistence and open decisions

Save progress, tests, keys/guides, attempts, submitted files, results, feedback, flags and scheduled tests. Retain earlier evaluations when correcting them. Back up application records and uploads, and verify restoration.

Defer database design and storage layout until functional requirements are settled. Organisation model, staff capabilities/permissions and flag-handling workflow also remain undecided.

## Sources

External sources checked on **19 November 2026**:

- [UPSC 2026 notification and syllabus](https://www.upsc.gov.in/sites/default/files/Notif-CSP-2026-Engl-060226Rev.pdf) and [official question papers](https://www.upsc.gov.in/examinations/previous-question-papers): scope, formats and Essay/language expectations. Some scanned papers could not be retrieved reliably; unverified section allocations remain unspecified.
- [Cambridge Mathematics marking principles](https://www.cambridgeinternational.org/Images/569851-june-2024-mark-scheme-paper-21.pdf): informs adapted method-credit and follow-through heuristics; it is not a UPSC marking scheme.
- [IES: Organizing Instruction and Study to Improve Student Learning](https://ies.ed.gov/ncee/WWC/PracticeGuide/1/Published), September 2007: supports retrieval practice and spaced review, without establishing an individual retention formula for this application.

The 80% checkpoint threshold and scoring are product decisions. Shared content and assessment safeguards are in [AGENTS.md](AGENTS.md).
