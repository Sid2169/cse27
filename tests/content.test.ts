import { test } from "node:test";
import assert from "node:assert/strict";
import { buildCatalogue, isReady, sections } from "../scripts/content";
import { resolveLearningLink } from "../src/modules/content/links";
const c = buildCatalogue();
import { officialBooklet } from "../src/modules/content/past-papers";

test("every supported paper and Mathematics variant has a verified booklet for 2013–2026", () => {
  const papers = [
    "Prelims-General-Studies-I",
    "Prelims-CSAT",
    "Mains-Essay",
    "Mains-English",
    "Mains-Indian-Language",
    "Mains-General-Studies-I",
    "Mains-General-Studies-II",
    "Mains-General-Studies-III",
    "Mains-General-Studies-IV",
  ];
  for (let year = 2013; year <= 2026; year++) {
    const links = [
      ...papers.map((paper) => officialBooklet(paper, year)),
      ...["I", "II"].map((variant) =>
        officialBooklet("Mains-Mathematics", year, variant),
      ),
    ];
    assert.equal(new Set(links).size, 11);
    if (year >= 2016) {
      for (const url of links)
        assert.match(
          url ?? "",
          /^https:\/\/(?:www\.)?upsc\.gov\.in\/uploads\/.+\.pdf$/,
        );
    } else {
      for (const url of links.slice(0, 2))
        assert.match(
          url ?? "",
          /^https:\/\/(?:battleias\.com|iasexamportal\.com|cdn-images\.prepp\.in)\/.+\.pdf$/,
        );
      for (const url of links.slice(2))
        assert.match(
          url ?? "",
          /^https:\/\/web\.archive\.org\/web\/\d+id_\/http:\/\/www\.upsc\.gov\.in\/questionpaper\/.+\.pdf$/,
        );
    }
  }
  assert.equal(officialBooklet("Mains-Mathematics", 2024, ""), null);
  assert.equal(officialBooklet("Prelims-CSAT", 2012), null);
});

test("indexes every paper and preserves curriculum chapter order", () => {
  assert.equal(c.papers.length, 10);
  const gs = c.papers.find((p) => p.id === "Prelims-General-Studies-I")!;
  assert.equal(gs.chapters.length, 136);
  assert.match(gs.chapters[0], /001-/);
  assert.match(gs.chapters.at(-1)!, /136-/);
  assert.equal(
    c.papers.find((p) => p.id === "Mains-Mathematics")!.chapters.length,
    80,
  );
});
test("excludes historical tests, keys and method files", () => {
  assert.ok(
    c.documents.every(
      (d) =>
        !d.path.includes("PYQS") &&
        !d.path.includes("full-test") &&
        !d.path.includes("CHECKPOINT"),
    ),
  );
});
test("distinguishes planned outlines from authored chapters and parts", () => {
  assert.equal(
    c.documents.find((d) => /004-numbers/.test(d.path))?.ready,
    false,
  );
  assert.equal(
    c.documents.find((d) => /024-fundamental.*part-1/.test(d.path))?.ready,
    true,
  );
  assert.equal(
    isReady(
      "# X\n**Status: planned chapter — teaching content has not been generated.**",
    ),
    false,
  );
});
test("anchors handle duplicates, Hindi and fenced code", () => {
  assert.deepEqual(
    sections("# अध्याय\n## Section\n```\n## Hidden\n```\n## Section").map(
      (s) => s.id,
    ),
    ["अध्याय", "section", "section-1"],
  );
});
test("links stay within public learning allowlist", () => {
  const allowed = new Set(c.documents.map((d) => d.path));
  assert.equal(
    resolveLearningLink(
      "Prelims-General-Studies-I/x.md",
      "../../AGENTS.md",
      allowed,
    ),
    null,
  );
  assert.equal(
    resolveLearningLink(
      "Prelims-General-Studies-I/x.md",
      "004-numbers-units-tables-and-graphs.md#x",
      allowed,
    ),
    "/learn/Prelims-General-Studies-I/004-numbers-units-tables-and-graphs#x",
  );
  assert.equal(
    resolveLearningLink("x.md", "javascript:alert(1)", allowed),
    null,
  );
});

test("placeholder-only papers expose no authored chapters", () => {
  for (const p of c.papers.filter(
    (p) => !["Prelims-General-Studies-I", "Mains-Mathematics"].includes(p.id),
  ))
    assert.equal(
      p.chapters.filter(
        (path) => c.documents.find((d) => d.path === path)?.ready,
      ).length,
      0,
      p.id,
    );
});

test("references to a planned prerequisite do not hide an authored chapter", () => {
  assert.equal(
    c.documents.find((d) =>
      d.path.endsWith("022-political-foundations-and-constitution-making.md"),
    )?.ready,
    true,
  );
  assert.equal(
    c.documents.find((d) =>
      d.path.endsWith("023-constitutional-structure-citizenship-and-change.md"),
    )?.ready,
    true,
  );
});

test("each phase contains its ordered whole chapters without overlap", () => {
  for (const paper of c.papers) {
    assert.ok(
      paper.phases.every(
        (phase) => phase.title && phase.description && phase.chapters.length,
      ),
    );
    assert.deepEqual(
      paper.phases.flatMap((phase) => phase.chapters),
      paper.chapters,
    );
  }
  const gs = c.papers.find(
    (paper) => paper.id === "Prelims-General-Studies-I",
  )!;
  assert.equal(gs.phases[2].chapters.length, 22);
  assert.match(gs.phases[2].chapters[0], /\/022-/);
  const hindi = c.papers.find((paper) => paper.id === "Mains-Indian-Language")!;
  assert.match(hindi.phases[0].title, /आरम्भ/);
});
