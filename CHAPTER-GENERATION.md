# Chapter Generation Instructions

Method for writing `<chapter>.md`. Repository-wide rules live in `AGENTS.md`; this file adds chapter-specific requirements.

## Purpose

Chapters are the study material. The syllabus defines the boundary, the curriculum defines sequence and emphasis, PYQs calibrate depth, and authoritative sources supply facts. Use the syllabus and curriculum as compasses, not scripts: cover what they require, but explain it; do not drift into unrelated topics.

Chapters teach; practice lives in the year-wise PYQ files and on-demand chapter tests.

## Audience

Write for a complete beginner: no prior UPSC preparation, coaching, or assumed degree-level subject background. The target is a beginner bridge to exam-ready understanding, not an exhaustive textbook.

- Define technical terms and acronyms on first use.
- Start with concrete examples and prior knowledge, then move to abstract and applied ideas.
- Explain mechanisms and reasoning, not just conclusions.
- Do not use "as you already know" or skip intermediate steps.
- Distinguish established fact, interpretation, and live debate.
- For Hindi Paper A, write entirely in Hindi (Devanagari). Retain an English proper noun or official title only when necessary, and explain it in Hindi.

## Chapter Unit and Splitting

- Default to one file per curriculum chapter, named exactly as linked from the curriculum.
- Split a chapter only when it is too large for one sitting or contains distinct conceptual blocks. Split at subject seams, not at an arbitrary word count.
- Name parts `<chapter>-part-1.md`, `<chapter>-part-2.md`, and so on. Use `Part 1 — <title>` in the heading.
- Each part must state `Part x of y`, its prerequisites, and links to the other parts.
- Update the curriculum index immediately so every part is reachable and the chapter is not left half-linked.
- Do not create chapter files for topics absent from the curriculum.

## Global Skeleton

Use this structure unless the subject genuinely calls for a different order. Do not pad sections or repeat material across them.

1. **Metadata** — chapter title, paper, link to the curriculum entry, part number if split, prerequisites, and scope.
2. **Orientation** — why the chapter matters, where it sits in the paper, and what the learner should already know. Usually this is "nothing beyond earlier chapters."
3. **Learning outcomes** — a few concrete things the learner should be able to explain, compare, or apply.
4. **Foundations and key terms** — the minimum background and vocabulary needed. Merge this into the core if the chapter needs no separate bridge.
5. **Core content** — hierarchical sections covering the curriculum scope: concepts, mechanisms, processes, examples, comparisons, and where useful maps, timelines, tables, or diagrams.
6. **Update watch** — only when the chapter contains non-static material. Inline flags plus a short summary table.
7. **Sources** — inline links where claims are made, plus a short source list at the end.

Required: metadata, orientation, core content, and sources. Learning outcomes, a separate foundations section, and update watch are used when they add value.

## Static and Dynamic Content

Treat constitutional text, historical events, established concepts, mathematical principles, and stable geography as static.

Treat data, schemes, policies, judgments, appointments, reports, indices, rankings, current examples, technology developments, and species or programme status as non-static.

- Flag the exact passage inline: `[DYNAMIC: <item> — <why it may change or when to revisit>]`.
- Add an **Update watch** table at the end:

  | Item | Why it may change | Revisit trigger |
  |---|---|---|
  | ... | ... | ... |

- Date dynamic facts explicitly ("as of ...") and avoid false precision.
- Do not flag a stable concept merely because it has a date attached.
- If the chapter has no non-static content, omit the update-watch section rather than inventing one.

## Sources and Accuracy

- Link key claims inline and list the main sources at the end with title, publisher, URL, and access date.
- Prefer official and primary sources: UPSC, the Constitution, PIB, ministries, RBI, Census, NCERT, and standard references. Use secondary sources for orientation, not as a substitute for primary evidence.
- Never invent a citation, date, statistic, judgment, or scheme detail. If a claim cannot be supported, omit it or mark it as a commonly taught interpretation.
- Synthesize in your own words; do not copy long passages.
- Keep fact, interpretation, and normative argument visibly distinct.

## Subject-Specific Granularity

Do not key the structure to paper names. Identify the dominant subject or subjects in the chapter and apply the relevant lens. For mixed chapters, use the dominant lens for the main structure and add the others only where needed.

| Subject lens | What the structure should emphasise |
|---|---|
| History | Timeline, actors, causes and consequences, continuity and change, evidence and interpretations, maps where relevant. |
| Polity and governance | Constitutional text, institutions, procedures, federalism, rights, accountability; separate constitutional provision from statute, practice, and judgment. |
| Geography | Location, physical and human processes, spatial patterns, regional examples, maps and data. |
| Economy | Definitions, measurement, mechanisms, policy instruments, data, and diagrams; distinguish positive analysis from normative argument. |
| Environment and ecology | Ecological principles, governance, conventions, ecosystems and species, trade-offs, and data. |
| Science and technology | Principles, applications, risks, ethics, and current developments; keep the underlying science separate from the latest application. |
| Society and social justice | Concepts, indicators, groups, structures, movements, and schemes; avoid stereotypes and unsupported generalisations. |
| Ethics and human interface | Terms, thinkers, normative frameworks, dilemmas, and case reasoning; keep theory separate from contemporary examples. |
| Essay and writing | Idea generation, argument, structure, examples, and quotations; show how to think and organise rather than supplying a fixed template. |
| Language (Hindi) | Script, grammar, vocabulary, comprehension, precis, short essays, and translation; teach through examples and fully in Hindi. |
| Quantitative aptitude and reasoning | Concepts, worked reasoning, methods, traps, and diagrams; build from school arithmetic without assuming confidence. |

The lens decides what to emphasise and which supporting devices to use. It does not license material outside the syllabus or curriculum.

## Coverage and Emphasis

- Cover every item in the chapter's curriculum scope; do not leave syllabus terms unexplained.
- Use the populated `<paper-name>-PYQS/` files to judge depth, recurring themes, and useful examples. Do not turn the chapter into a question bank.
- Cross-link related chapters instead of duplicating their content.
- Label genuinely necessary background as a bridge; do not smuggle in unrelated topics.
- If the syllabus and curriculum conflict, the syllabus wins; flag the curriculum issue rather than silently changing scope.
- For numerical or technical content, show the reasoning and a worked example. For conceptual content, use examples, counterexamples, and comparisons.

## Before Finishing

- Every curriculum scope item is addressed.
- Jargon and acronyms are defined; prerequisites are stated.
- The explanation is beginner-accessible but not inaccurate.
- Non-static passages are flagged and summarised; dynamic facts are dated.
- Sources are linked and listed; no citation is invented.
- There is no unnecessary repetition.
- Chapter and curriculum links resolve.
- Hindi Paper A is fully in Hindi; other papers use English.

## Boundaries

- Do not add practice sets, MCQs, or answer-writing prompts; practice belongs to the PYQ files and on-demand tests.
- Do not impose chapter length or word targets.
- Do not invent facts or citations, and do not copy long copyrighted passages.
- Do not use paper-specific templates; use the subject of the chapter.
- Do not re-extract or re-verify the populated PYQs here.
- Do not commit; commits happen only when the operator asks.
