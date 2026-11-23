# Planned Features

Planning record for future Essay, Hindi Paper A and English Paper B assessments. **This is not an executable generation or evaluation method.** Existing assessment methods cover Prelims chapter-part and GS-I full-length tests, and Mains GS I–IV; these proposals do not extend them to other papers.

Shared assessment requirements already live in [AGENTS.md](AGENTS.md). Future methods should add only their paper-specific contracts, rather than reproduce those rules or inherit the GS scoring scheme.

## Recorded Exam Baselines

Use these as planning baselines for CSE 2027, not guarantees about an unissued paper. Exam-rule provenance is the official notification linked from the [root syllabus](syllabus.md); the [UPSC paper index](https://www.upsc.gov.in/examinations/previous-question-papers) was accessed 13 November 2026. Recheck the relevant official notification and latest paper before implementing a method.

| Paper | Baseline | Evidence |
|---|---|---|
| Essay | 250 marks, 3 hours, counts for merit. Recent papers offer eight topics in two sections of four; attempt one from each section, 125 marks and about 1,000–1,200 words per essay. | [UPSC previous question papers](https://www.upsc.gov.in/examinations/previous-question-papers) |
| Hindi Paper A | 300 marks, 3 hours, qualifying at 25% (75 marks); not counted for merit. Includes translation in both directions. | [Hindi syllabus](Mains-Indian-Language/Mains-Indian-Language-Syllabus.md); notification provenance above |
| English Paper B | 300 marks, 3 hours, qualifying at 25% (75 marks); not counted for merit. Its syllabus does not specify translation. | [English syllabus](Mains-English/Mains-English-Syllabus.md); notification provenance above |

Language-paper section marks require official-paper verification. Do not carry an unverified coaching split into an implemented method.

## Proposed Deliverables

The following filenames are proposals, not links to existing methods. Design a generation method and its pre-attempt scoring contract together, then the corresponding evaluation method.

| Paper | Proposed generation method | Proposed evaluation method | Proposed test contract |
|---|---|---|---|
| Essay | `MAINS-ESSAY-TEST-GENERATION.md` | `MAINS-ESSAY-ANSWER-EVALUATION.md` | `ESSAY-FULL-T01` under `Mains-Essay/Mains-Essay-TESTS/` |
| Hindi A | `MAINS-HINDI-PAPER-A-TEST-GENERATION.md` | `MAINS-HINDI-PAPER-A-ANSWER-EVALUATION.md` | `HINDI-A-FULL-T01` under `Mains-Indian-Language/Mains-Indian-Language-TESTS/` |
| English B | `MAINS-ENGLISH-PAPER-B-TEST-GENERATION.md` | `MAINS-ENGLISH-PAPER-B-ANSWER-EVALUATION.md` | `ENG-B-FULL-T01` under `Mains-English/Mains-English-TESTS/` |

A shared language method remains an option if it preserves each paper's skills and blueprint. No implementation order across the three papers is prescribed.

## Paper-Specific Design Considerations

### Essay

Prompts should invite interpretation, argument and illustration rather than read like expanded GS questions. Seek variety across the paper without imposing a fixed topic taxonomy. Each topic needs a concise pre-attempt guide allowing multiple defensible interpretations and approaches, with essay-appropriate criteria and declared mark allocations.

Assess relevance, depth of argument, coherence, expression and use of illustration according to that guide. Do not turn possible dimensions into an obligatory checklist or mechanically penalise small departures from the length expectation. Feedback should help the learner develop an argument; an outline can be useful but need not appear automatically.

### Hindi Paper A

Use the official skill coverage and matriculation-level demand, with Hindi instructional wording and appropriate bilingual passages for translation. Check comprehension against the text, precis for compression and fidelity, essay for relevance and language, and usage for correctness.

Validate translation references for meaning, register and grammatical accuracy; a single generated translation is not an exclusive authoritative key. Credit alternative faithful translations. Default feedback to Hindi, adapting to an explicit learner request.

### English Paper B

Build from its own official blueprint and matriculation-level demand. Assess comprehension, precis, usage/vocabulary and short essay as appropriate; add no translation component unless supported by a changed official paper. Default feedback to English.

For both language papers, establish section/item allocations and partial-credit standards before attempts, and report qualifying status separately from awarded marks. Diagnose language errors that actually occur instead of requiring a full error-taxonomy report.

## Dependencies and Open Decisions

- The [Essay curriculum](Mains-Essay/Mains-Essay-Curriculum.md) and [English Paper B curriculum](Mains-English/Mains-English-Curriculum.md) are available with 30 and 25 planning chapter placeholders respectively. Their teaching content and the Hindi curriculum and teaching content are pending. Sectional assessments will need substantive readiness; full-paper diagnostic proposals should explicitly state whether they may be based on a verified syllabus/PYQ blueprint before teaching is complete.
- Verify current paper layouts, especially language section marks and Hindi translation allocations. Record the official sources and access dates in the eventual methods.
- Decide whether to offer language sectional drills as well as full papers. If added, proposed IDs are `HINDI-A-SEC-<section>-T01` and `ENG-B-SEC-<section>-T01`.
- Decide whether historical-pattern practice is useful alongside the current pattern, and label it distinctly if offered.
- Decide separate versus shared language-method files before creating them.

Optional-subject assessments and Interview preparation are outside this plan. Full-length Prelims GS-I mocks are covered by [PRELIMS-TEST-GENERATION.md](PRELIMS-TEST-GENERATION.md); this planning record authorises no tests.
