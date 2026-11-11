# Curriculum Generation Instructions

Method for generating `<paper-name>-Curriculum.md`. Repository-wide rules (verbatim syllabus, relative links, chapter correspondence, commit policy) live in `AGENTS.md`; this file adds curriculum-specific requirements.

## Audience

The repository is written for a complete beginner to UPSC: no prior UPSC preparation, no coaching, and no assumed degree-level background in any paper's subjects. A curriculum must be usable by a motivated learner starting from zero.

Apply these assumptions throughout:

- Explain the exam before the subject: paper sequence, format, marks, duration, negative marking, qualifying versus ranking papers, and how the paper fits the selection process.
- Do not assume the learner has read NCERTs or standard reference books, follows the newspaper, or has a current-affairs habit. Build these habits explicitly.
- Introduce jargon, acronyms, theories, and institutions on first use; plan to define them in the chapter.
- Start with concrete examples and first principles, then move to abstract, applied, and evaluative work.
- State prerequisites for each chapter. The default is "none beyond earlier chapters in this curriculum."
- Include a baseline self-check or diagnostic where useful, so the learner can see the starting point.
- Teach exam skills explicitly: reading the syllabus, note-making, newspaper reading, MCQ practice, answer writing, map and timeline use, and revision.
- Do not assume prior formal study of a language paper's pattern. For Hindi Paper A, build from comprehension and grammar to precis, short essays, and translation.

## Objective

For each paper, generate a beginner-usable curriculum from four inputs:

1. A researched understanding of the exam pattern
2. The official syllabus, verbatim
3. The year-wise PYQ files in `<paper-name>-PYQS/<year>-<paper-name>.md` (2013–2026)
4. The learner baseline: no prior UPSC or subject experience

The curriculum is a study plan and the index for chapter files, not study material. It should tell a beginner what to learn, in what order, why it matters, and what they should be able to do at the end of each chapter.

## Research the pattern first

Do not generate from the syllabus alone. Research the web to build an accurate, current picture of the paper:

- Format: question count, marks, duration, negative marking, qualifying thresholds.
- PYQ distribution: themes that repeat. Read the paper's year-wise files in `<paper-name>-PYQS/` as the working corpus. Record actual years and use them as evidence; never rely only on a secondary summary.
- Weightage: which syllabus areas carry more questions, cross-checked across at least two independent sources.
- Standard sources: what each book, website, or report is for, whether it is essential or optional, and how a beginner should use it.
- The current-affairs boundary: what to follow, how often, and how it connects to the paper.
- The beginner's entry point: what must be explained before the first substantive topic.

Prefer UPSC official papers and primary sources. Record sources and access dates. Never guess a PYQ year or invent weightage; every pattern claim must rest on a recorded source. An inaccurate pattern assessment invalidates the curriculum.

## Generate from pattern, syllabus, and PYQs

- Cover the entire paper syllabus; exclude the optional subject.
- Let the researched pattern decide depth and emphasis; use the year-wise PYQ files to anchor which themes matter. Mine them for recurring themes, question formats, and weightage, and cite actual years in chapter rationales.
- Sequence beginner-first: orientation and foundations before advanced, applied, or evaluative topics. A typical progression is orientation → foundations → core syllabus → applied/PYQ work → revision, but adapt it to the paper.
- Add a bridge chapter or prerequisite note wherever a topic assumes school-level background the learner may not have.
- For each chapter, state what it covers, why it matters for the exam (grounded in the pattern or PYQ evidence), prerequisites, and the learning outcome. Keep entries concise; the chapter file supplies the teaching.
- Flag key terms, institutions, and acronyms that the chapter must define.
- Point each phase or chapter to the relevant PYQ files and years for practice. If the PYQ set has gaps or placeholders, state that explicitly.
- Make the curriculum serve as the index: each chapter entry links to its intended file (or, if pre-planned, its part files) with relative Markdown links and the exact planned file names.
- Keep official syllabus wording verbatim wherever it is quoted.
- Write for a first-time reader: plain language, no "as you already know," no skipped steps.

## Paper-specific notes

- **Prelims General Studies I:** build conceptual foundations first, including map, timeline, and data-reading basics; introduce MCQ practice and elimination early. Research the current negative-marking rule rather than assuming it.
- **Prelims CSAT:** the syllabus fixes the qualifying threshold at 33%. Start with comprehension, basic arithmetic, logic, and data interpretation; do not assume confidence with school mathematics.
- **Mains General Studies:** teach answer structure and syllabus-linked writing from the first phase, not after content is "finished." Build interlinkages between papers gradually.
- **Mains Essay:** start with reading, idea generation, and paragraph structure; then practise full essays. Reflect the pattern: 2013 had one essay with multiple topics, while 2014 onward had two essays.
- **Mains General Studies IV:** define ethics terminology and the case-study method before abstract theory; use short ethical dilemmas to build reasoning.
- **Language papers:** Paper A is Hindi and Paper B is English; they are separate compulsory qualifying papers. The Hindi curriculum must be Hindi-specific, in Devanagari, covering comprehension, precis, usage and vocabulary, short essays, and translation from English to Hindi and vice versa. Use official Hindi PYQs. Do not assume prior formal study of the paper's pattern, even if the learner is fluent in Hindi.

## Structure

Every curriculum should open with:

- Paper metadata: stage, paper name, format, marks, duration, qualifying or ranking status, selected language where relevant, and sources.
- A short "Before you begin" orientation explaining the paper and how to use the curriculum.
- A phase map showing the intended progression and sequence, not rigid deadlines.
- The phased chapter list with the fields described above, including links to relevant PYQ files or years.
- An index linking every chapter file or part.

Aim for a consistent structure across papers so the repository is easy to navigate. Consistency is a goal, not a straitjacket. Papers differ in nature (objective Prelims, descriptive Mains GS, qualifying language papers, Essay), and their curricula should reflect that. Do not force identical sections, chapter counts, or ordering where the paper does not support it.

## Boundaries

- No chapter length or word targets are prescribed; size chapters to the paper and topic.
- Do not write chapter content; that is a separate stage.
- Treat the populated PYQ files as the curriculum's evidence base; PYQ extraction and quality checks are separate tasks, not part of curriculum generation.
- Do not write for an audience that already knows the subject, and do not skip foundations.
- Do not introduce a resource without saying what it is for and whether it is essential or optional.
- Do not present coaching-specific shortcuts as syllabus requirements.
- Do not commit; commits happen only when the operator asks.
