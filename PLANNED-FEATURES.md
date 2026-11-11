# Planned Features

Planning record for features that are not implemented yet. Existing methods cover Prelims GS/CSAT and Mains GS I–IV only. Essay and compulsory language papers have syllabi and PYQs, but no test-generation or evaluation methods.

This file records scope, dependencies, and open decisions. It is not a test-generation method.

## Scope of This Plan

Planned paper-specific features:

- Essay question paper generation
- Essay answer evaluation
- Compulsory Indian Language Paper A (Hindi) question paper generation
- Compulsory Indian Language Paper A (Hindi) answer evaluation
- Compulsory English Paper B question paper generation
- Compulsory English Paper B answer evaluation

Not covered here:

- Optional subject papers
- Personality Test / Interview
- Full-length Prelims mocks
- Changes to existing Prelims or Mains GS methods

## Fixed Exam Facts

- **Essay:** Paper I, 250 marks, 3 hours, counts for merit. Recent papers offer eight topics in two sections of four; the candidate writes two essays, one from each section, at 125 marks each, in about 1,000–1,200 words each. Source: [UPSC previous question papers](https://www.upsc.gov.in/examinations/previous-question-papers).
- **Hindi Paper A:** 300 marks, 3 hours, qualifying only; 25% (75/300) required; marks do not count for merit. Official syllabus: comprehension, precis, usage and vocabulary, short essays, and translation from English to Hindi and vice versa. Source: [Mains-Indian-Language-Syllabus.md](Mains-Indian-Language/Mains-Indian-Language-Syllabus.md).
- **English Paper B:** 300 marks, 3 hours, qualifying only; 25% (75/300) required; marks do not count for merit. Official syllabus: comprehension, precis, usage and vocabulary, and short essays. The official syllabus does not add translation for English. Source: [Mains-English-Syllabus.md](Mains-English/Mains-English-Syllabus.md).
- Section-level marks for the language papers are not fixed in the official syllabus. Treat any section split as provisional until checked against the current official paper.

## Planned Deliverables

| Feature | Deliverable | Depends on | Order |
|---|---|---|---|
| Essay paper generation | `MAINS-ESSAY-TEST-GENERATION.md` | Essay curriculum/chapter content; verified 8-topic pattern | 1 |
| Essay evaluation | `MAINS-ESSAY-ANSWER-EVALUATION.md` | Essay generation method; essay rubric design | 2 |
| Hindi Paper A generation | `MAINS-HINDI-PAPER-A-TEST-GENERATION.md` | Hindi curriculum/chapter content; verified section blueprint | 3 |
| Hindi Paper A evaluation | `MAINS-HINDI-PAPER-A-ANSWER-EVALUATION.md` | Hindi generation method; language rubric design | 4 |
| English Paper B generation | `MAINS-ENGLISH-PAPER-B-TEST-GENERATION.md` | English curriculum/chapter content; verified section blueprint | 5 |
| English Paper B evaluation | `MAINS-ENGLISH-PAPER-B-ANSWER-EVALUATION.md` | English generation method; language rubric design | 6 |

If a single shared language method is preferred later, keep Hindi-specific translation and Devanagari requirements separate from the English method. Do not water down either paper into a generic “language paper” method.

## Essay Paper Generation

- Produce a full paper: eight topics, four in Section A and four in Section B; the learner chooses one from each section.
- Use 125 marks per essay, about 1,000–1,200 words, and 3 hours for the paper.
- Balance topic types: abstract/philosophical, social, economic, political, ethical/governance, and contemporary but not news-dependent.
- Avoid overlapping topics, repeated themes within the paper, and verbatim PYQ reuse.
- Do not turn topics into GS questions. The prompt should invite interpretation, argument, and illustration, not a policy list.
- Pre-write a hidden topic guide for each option: scope, possible interpretations, expected dimensions, value points, examples, traps, and caps.
- Do not write a model essay at test creation.
- Test ID: `ESSAY-FULL-T01`, incrementing the number. Store in `Mains-Essay/Mains-Essay-TESTS/`.
- Test file metadata: paper, mode, duration, topic count, essays to attempt, marks, word limit, answer language, generation date, and status.

## Essay Evaluation

- Design an essay-specific rubric; do not reuse the GS answer rubric or GS dimension weights.
- Evaluate both essays against the chosen topics, not against a single model essay.
- Planned dimensions to settle: relevance and focus; depth and argument; structure and coherence; expression and concision; examples and illustration; balance and conclusion.
- Report exact marks out of 125, a band, and a confidence level.
- Judge length discipline against the 1,000–1,200 word expectation without mechanically penalising small overruns.
- Quote evidence for every strength and weakness.
- Do not reduce the evaluation to a percentage or rank.
- Do not provide a full model essay by default; give an outline and missing value points.
- Append the evaluation under `## Evaluation` in the same test file.

## Hindi Paper A Generation

- Produce a full 300-mark, 3-hour Hindi paper in Devanagari.
- Cover the official skills: comprehension, precis, usage and vocabulary, short essay, and translation both ways.
- Use matriculation-level passages and questions; do not assume degree-level Hindi literature knowledge.
- Verify the section blueprint against the current official paper before generating. A provisional working split from recent paper analyses is essay 100, comprehension 60, precis 60, translation 40, and grammar/usage 40; do not treat it as official until verified.
- Pre-write answer keys for grammar and objective-style items; pre-write evaluator guides for comprehension, precis, essay, and translation.
- Keep translation passages genuinely bilingual: Hindi-to-English and English-to-Hindi.
- Do not use machine translation as the answer key.
- Test ID: `HINDI-A-FULL-T01`, or `HINDI-A-SEC-<section>-T01` for sectional drills if added.
- Store in `Mains-Indian-Language/Mains-Indian-Language-TESTS/`.

## Hindi Paper A Evaluation

- Score out of 300 using an exact section-wise rubric; report the 25% qualifying threshold separately from the score.
- Check comprehension against the passage, precis for compression and fidelity, essay for relevance and language, translation for meaning and register, and grammar for correctness.
- Use a Hindi error taxonomy: spelling, sandhi/samas, gender/number agreement, case, verb forms, sentence order, idiom, vocabulary, and translation shift.
- Give feedback in Hindi unless the learner asks for bilingual feedback.
- Do not claim merit marks; Paper A is qualifying only.
- Do not rank the learner or predict UPSC scores.
- Append the evaluation in the same test file.

## English Paper B Generation

- Produce a full 300-mark, 3-hour English paper.
- Cover the official skills: comprehension, precis, usage and vocabulary, and short essay. Do not add translation unless the current official paper requires it.
- Verify the section blueprint against the current official paper before generating. Section marks are provisional until verified.
- Pre-write answer keys for grammar and usage items; pre-write evaluator guides for comprehension, precis, and essay.
- Keep passages and prompts at matriculation or equivalent standard.
- Test ID: `ENG-B-FULL-T01`, or `ENG-B-SEC-<section>-T01` for sectional drills if added.
- Store in `Mains-English/Mains-English-TESTS/`.

## English Paper B Evaluation

- Score out of 300 using an exact section-wise rubric; report the 25% qualifying threshold separately from the score.
- Check comprehension for textual accuracy, precis for compression and fidelity, essay for relevance and structure, and usage for grammar and vocabulary.
- Use an English error taxonomy: tense, subject-verb agreement, articles, prepositions, modifiers, parallelism, word choice, spelling, punctuation, and sentence structure.
- Give feedback in English.
- Do not claim merit marks; Paper B is qualifying only.
- Do not rank the learner or predict UPSC scores.
- Append the evaluation in the same test file.

## Shared Design Rules

- Generate tests only on demand; the learner chooses the paper and mode.
- Do not generate a test before the relevant curriculum and chapter material exist. A full-paper mock may use the syllabus and PYQs only after the paper blueprint is verified.
- Use unique test IDs and the paper-specific test folder.
- Keep the evaluator guide hidden until the attempt is complete.
- Pre-write the guide before the answer; never invent a rubric after seeing a weak answer.
- Support typed answers and readable handwritten scans or photographs.
- Append evaluation in the same test file; never overwrite an earlier attempt.
- Do not provide model answers by default. Give outlines, value points, and error correction.
- Do not claim official UPSC marking, merit marks, rank, or percentile.
- Do not apply negative marking to these descriptive papers.
- Do not commit without an explicit request.

## Dependencies

- Essay, Hindi, and English curricula and chapters are still placeholders.
- Essay pattern is stable across recent papers but must be checked against the current official paper.
- Hindi Paper A section marks and translation weight need official-paper verification.
- English Paper B section marks need official-paper verification; do not assume a translation section.
- The repo’s existing GS method files must not be stretched to cover Essay or language papers.

## Open Decisions

- Should Essay evaluation offer a model essay when explicitly requested, or only outlines?
- Should language papers start with full 300-mark mocks only, or also sectional drills?
- Should Hindi feedback default to Hindi only, English only, or bilingual?
- Should tests use only the current pattern or also older patterns for practice?
- Should the language papers have separate generation/evaluation files, or one shared file with paper-specific sections?

## Status

Planning only. No Essay or language test-generation or evaluation methods exist yet. No tests have been generated.
