# 001 — Orientation and diagnostic route

**Revision — 23 November 2026:** Corrected the post-bridge route to include Phase B before Phase C.

**Paper:** Mathematics optional, Papers I and II (UPSC Mains VI and VII)
**Curriculum entry:** [Phase A, chapter 001](Mains-Mathematics-Curriculum.md#authoritative-chapter-index)
**Scope:** read the syllabus and the paper rules; learn the symbols used throughout the course; start a skill record; choose your first bridge chapter.
**Prerequisites:** none.

**Learning outcome.** By the end of this chapter you should be able to (a) locate every syllabus heading in the official text, (b) read the notation that appears in the questions, (c) state the examination rules that affect how you practise, and (d) fill in a skill record that tells you where to start.

---

## 1. What this course is for

Mathematics is one of the optional subjects in the UPSC Civil Services Mains examination. It is not a single subject but two conventional written papers, each of 250 marks and three hours, which together contribute 500 marks to merit. Because it is an honours-level optional, the questions assume that you can construct arguments, not only carry out procedures.

The official source for all of this is UPSC Notice 05/2026-CSE, Appendix I. The key points, as recorded in the [curriculum](Mains-Mathematics-Curriculum.md#examination-orientation-and-evidence), are:

- Scientific non-programmable calculators are permitted; programmable calculators are not.
- The established pattern is eight questions per paper in two sections, of which you answer five. Questions 1 and 5 are compulsory, and the other three must include at least one from each section.
- The rule is taken from the 2025 front cover. **Reconfirm the 2027 front-cover instructions when they are issued**, because the historical pattern is not a guarantee.

Source: [UPSC Notice 05/2026-CSE, Appendix I](https://www.upsc.gov.in/sites/default/files/Notif-CSP-2026-Engl-060226Rev.pdf), printed pages 27, 29, 31 and 33 (syllabus pages 124–126). Accessed 15 November 2026. The paper pattern is also described in the [2025 Paper I question paper](https://www.upsc.gov.in/sites/default/files/MATHEMATICS-PAPER%20I-QP-CSM-25-010925.pdf) front cover; the rule is recorded as a historical reference, not as a 2027 rule.

Two things follow from the rules, and you should keep them in mind from the start:

- **Breadth matters.** Compulsory questions sample several areas, and optional questions can combine topics. Leaving a syllabus heading untouched is risky even if you plan to skip some main questions.
- **Each subpart carries marks.** Practise writing complete reasoning, calculations and conclusions. Marks are attached to subparts, so a correct final answer with no justification does not earn the same credit as a justified one.

---

## 2. Reading the syllabus

The syllabus is the scope checklist, not a teaching text. Read it as a list of *claims about what you must be able to do*. Its two papers are:

**Paper I** has six headings: (1) Linear Algebra, (2) Calculus, (3) Analytic Geometry, (4) Ordinary Differential Equations, (5) Dynamics and Statics, (6) Vector Analysis.

**Paper II** has seven headings: (1) Algebra, (2) Real Analysis, (3) Complex Analysis, (4) Linear Programming, (5) Partial Differential Equations, (6) Numerical Analysis and Computer Programming, (7) Mechanics and Fluid Dynamics.

Read each heading and ask three questions:

1. What *objects* does it talk about? (vector spaces, sequences, surfaces, forces, flows…)
2. What *operations* does it expect you to perform? (compute an inverse, test convergence, reduce a quadric…)
3. What *justification* does it expect? (prove a statement, state a theorem's hypotheses, check a boundary case…)

A useful habit: for each heading, write one sentence describing the type of question you think it produces, then check it against the PYQ corpus. Do not treat a heading as learned because you recognise its name.

The verbatim syllabus is in [Mains-Mathematics-Syllabus.md](Mains-Mathematics-Syllabus.md). Keep it open while you work; the curriculum maps each heading to chapters.

---

## 3. A notation guide for the course

Questions use compact symbols. A beginner who does not know them loses time before the mathematics starts. The table below lists the symbols you will meet in the first phases. Each is introduced properly in the chapter where it becomes necessary.

| Symbol | Read as | Meaning and a quick example |
|---|---|---|
| ℝ, ℂ | the reals, the complexes | ℝⁿ is the set of n-tuples of real numbers, e.g. ℝ⁴ contains (0, 1, −1, 3) |
| ∈, ⊆ | belongs to, is contained in | 2 ∈ ℝ; ℚ ⊆ ℝ |
| ∀, ∃ | for all, there exists | ∀x ∈ ℝ, x² ≥ 0; ∃x ∈ ℝ with x² = 2 |
| ⇒, ⇔ | implies, if and only if | x = 2 ⇒ x² = 4, but x² = 4 does not imply x = 2 (x = −2 also works), so the arrow goes one way only |
| f′, f″ | first, second derivative | if f(x) = x³ then f′(x) = 3x² |
| ∂f/∂x | partial derivative | differentiate with respect to x, holding other variables fixed |
| ∫ₐᵇ, ∬, ∭ | definite, double, triple integral | ∫₀¹ x dx = 1/2 |
| ∇, div, curl | gradient, divergence, curl | the vector-analysis operators you meet in Paper I, Heading 6 |
| T: V → W | a map from V to W | a function whose inputs and outputs are vectors or structures |
| ker T, Im T | kernel, image | the set of inputs sent to zero; the set of all outputs |
| det A, rank A | determinant, rank | numbers attached to a matrix A |
| ≡ (mod n) | congruent modulo n | 17 ≡ 2 (mod 5) because 15 is divisible by 5 |

**Tip.** When a question introduces a symbol you do not recognise, do not guess its meaning. Look up its definition in the chapter that uses it, and write the definition into your notes. Most errors in optional mathematics begin with a definition you almost remember.

---

## 4. How to read a theorem and a PYQ

Almost every result in the course has three parts: a **hypothesis** (what must be true before the theorem applies), a **conclusion** (what the theorem then guarantees), and a **proof** (why). When you encounter a theorem, write these three parts separately.

**Worked example of reading a question.** The 2025 Paper I, Question 1(d) asks: given that f(x + y) = f(x)f(y) for all real x and y, f(x) ≠ 0, and f′(0) = 2, show that f′(x) = 2f(x), and hence find f(x). The corpus records this from the [2025 Paper I PYQs](Mains-Mathematics-PYQS/2025-Mains-Mathematics.md#paper-i), transcribed from [NextGenPSC](https://www.nextgenpsc.com/mains/pyq/optional/mathematics/2025), accessed 13 November 2026.

Read it this way:

- **Hypotheses:** a functional equation holds for all real inputs; f never vanishes; a derivative at 0 is known.
- **Conclusion requested in two steps:** first a differential equation for f, then the function itself.
- **Missing knowledge:** you need to know why f′(x) can be expressed in terms of f′(0), and what solution a first-order linear equation has. These are the subjects of later chapters (006 for differentiation, 043–045 for first-order equations). You do not need to solve it now.

The lesson for this chapter is the *reading* step. Identify the hypotheses, the conclusion, and the topics you will need. Do not try to solve questions at this stage; the point is to see the structure.

Another 2025 Paper I question, Question 1(a), asks whether a given set of three vectors in ℝ⁴ can be extended to a basis. Its wording is a request for justification, not a numerical answer. The relevant concepts are linear independence and basis, which appear in [chapter 009](009-vector-spaces-bases-and-dimension.md). You will meet it when you have the tools.

---

## 5. Build your skill record

The curriculum requires a record that is based on evidence, not on how confident you feel. A skill record has one row per foundation area and records what you can actually do, with the date and the work that supports the judgement.

Use three outcomes, at the **skill level**, not one overall percentage:

- **Demonstrated.** You can do the task below without help, and you explained your reasoning in writing. You may skip the exposition and keep a later retrieval check.
- **Rusty.** You once could do this, but you cannot do it reliably now. Read the relevant recap and practise.
- **Unfamiliar.** You cannot yet do it, or you cannot explain why it works. Take the full bridge.

A template you can copy into your own notebook:

| Date | Foundation area | Task you attempted | Written evidence (file or page) | Outcome | Next step |
|---|---|---|---|---|---|
| | e.g. Algebra and functions | Solve an inequality with an absolute value and state the solution set | | demonstrated / rusty / unfamiliar | |

Keep the **evidence** column honest. A solved problem with corrections is more useful than a clean answer that you copied. Record your abandoned approaches too; they show where your reasoning went wrong.

Two rules keep the record useful:

1. **Distinguish kinds of error.** An arithmetic slip and a missing theorem hypothesis need different repairs. Write which one it was.
2. **Reopen only the affected prerequisite.** If later work exposes a gap, return to the specific earlier chapter, not to the whole course.

---

## 6. The foundation routing table

The curriculum sets out six foundation areas and the evidence that would let you skip the bridge for each. The table below restates it, with the chapter you would study if the evidence is incomplete.

| Foundation area | Evidence needed to shorten the bridge | Route if evidence is incomplete |
|---|---|---|
| Algebra and functions | Manipulate expressions while keeping domain restrictions; solve equations and inequalities; distinguish a function from its formula | Study the relevant parts of [002](002-algebra-inequalities-and-functions.md) |
| Trigonometry and complex arithmetic | Work in radians; handle inverse-function branches; use identities and complex polar form with justification | Repair [003](003-trigonometry-and-complex-numbers.md) before transforms, geometry or complex analysis |
| Geometry and vectors | Translate a geometric condition into coordinates; use dot and cross products with correct direction | Repair [004](004-coordinates-conics-and-vector-algebra.md) before [024](024-lines-and-planes-in-space.md) or mechanics |
| Logic and proof | Read quantifiers; negate a statement; prove a simple implication; distinguish a counterexample from a proof | Complete the needed parts of [005](005-sets-mappings-and-mathematical-proof.md); numerical fluency alone does not waive this |
| Elementary calculus | Explain the meaning of derivative and integral; execute chain rule, substitution and integration by parts | Repair [006](006-elementary-calculus-refresher.md); later formal analysis is still required |
| Physical modelling | Define variables and units; draw forces; distinguish a constraint from an applied force; state idealisations | Repair [007](007-physical-quantities-and-modelling.md) before dynamics; a Physics degree alone does not waive it |

Note the phrase "does not waive". Prior study is useful evidence, but it is not proof of current mastery. Test yourself on the stated task, not on the memory of having studied the topic.

---

## 7. Choosing your first bridge

Work through these steps in order.

1. **Attempt one task from each foundation area** in the table above, under no time pressure, and write the work out in full.
2. **Score each area** as demonstrated, rusty or unfamiliar, using the evidence rule in section 5.
3. **Start with the earliest area that is not demonstrated.** The bridges are ordered so that later ones depend on earlier ones. Fixing an early gap is cheaper than working around it.
4. **Keep one new main topic and one small review stream.** The curriculum warns against opening several unfamiliar subjects at once.

Because the bridges are a dependency chain, the first unfamiliar area you find is usually the right starting point. Do not skip it because it looks easy; the failure mode is an area that feels familiar but does not survive a hypothesis check.

After the bridges, the recommended index proceeds to **Phase B, linear algebra (008–013)**, followed by **Phase C, real analysis and calculus (014–023)**. Follow the curriculum's prerequisites when adapting that order. The recommended order within each topic is: definitions, then the theorem with its hypotheses, then the proof or justified derivation, then a worked method, then independent problems, then later retrieval.

---

## 8. A realistic daily plan

The curriculum suggests this allocation for a four-hour day. It is a plan for using your time, not a forecast of how long the syllabus will take.

| Time | Work | Evidence to keep |
|---|---|---|
| 90 minutes | New definitions, theorem hypotheses and proofs; reconstruct key reasoning without looking | A short proof outline with the difficult step marked |
| 45 minutes | Study one worked method, close the solution, reconstruct it and check its conditions | A complete reconstruction with your corrections visible |
| 75 minutes | Independent problems; introduce topic PYQs once the prerequisites are covered | Dated solutions, including abandoned approaches |
| 30 minutes | Retrieve earlier results, revisit errors and decide the next small task | Updated theorem and method notes, and an error log |

Advance to the next topic when you can explain the central definitions, reconstruct the main argument, choose and carry out a method on an unfamiliar but in-scope problem, and check the result. If you can only repeat a worked solution, stay on the current topic.

---

## 9. Sources

- UPSC Civil Services Examination Notice 05/2026-CSE, Appendix I, Optional Subject Papers VI and VII — Mathematics: [PDF](https://www.upsc.gov.in/sites/default/files/Notif-CSP-2026-Engl-060226Rev.pdf). Accessed 15 November 2026.
- UPSC, 2025 Mathematics Paper I question paper front cover: [PDF](https://www.upsc.gov.in/sites/default/files/MATHEMATICS-PAPER%20I-QP-CSM-25-010925.pdf). Accessed 15 November 2026. Used as a historical reference only.
- NextGenPSC, UPSC Mains 2025 Mathematics optional transcription, used for the PYQ text in this repository: [link](https://www.nextgenpsc.com/mains/pyq/optional/mathematics/2025). Accessed 13 November 2026. Compare with the official paper before relying on exact wording.
- Official syllabus text: [Mains-Mathematics-Syllabus.md](Mains-Mathematics-Syllabus.md), copied verbatim from Notice 05/2026-CSE.

**Recheck triggers.** The paper rules, calculator policy and selection instructions should be rechecked when the CSE 2027 notification is published and again before any full-paper attempt.

---

## 10. Completion check

Before moving on, confirm that you can do each of these without looking at this chapter:

- Name the six headings of Paper I and the seven headings of Paper II.
- State how many questions you answer per paper, which two are compulsory, and what the calculator rule is, and say which source each comes from.
- Read the 2025 Q1(d) example and identify its hypotheses, conclusion and the topics it requires.
- Explain the difference between demonstrated, rusty and unfamiliar, and give one example of evidence that supports each.
- Name your first bridge chapter and the evidence that led you to choose it.

Once you have a completed skill record, the next step is the foundation routing in section 6. Chapters 002 to 007 are the bridges, and the curriculum's [phase exit](Mains-Mathematics-Curriculum.md#authoritative-chapter-index) describes what a completed route should let you do.
