import { test } from "node:test";
import assert from "node:assert/strict";
import { buildCatalogue, isReady, sections } from "../scripts/content";
import { resolveLearningLink } from "../src/modules/content/links";
const c = buildCatalogue();
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
