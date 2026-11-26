import { readFileSync, readdirSync, writeFileSync, mkdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { join } from "node:path";
import GithubSlugger from "github-slugger";
import type {
  Catalogue,
  Document,
  Section,
} from "../src/modules/content/types";
export function isReady(markdown: string) {
  return !markdown
    .split("\n")
    .slice(0, 8)
    .some((line) =>
      /^(?:>\s*)?\*\*(?:Status:\s*)?(?:planned chapter|planning placeholder|योजना-स्थानधारक)/i.test(
        line,
      ),
    );
}

export function sections(markdown: string): Section[] {
  const slugger = new GithubSlugger();
  const result: Section[] = [];
  let fenced = false;
  for (const line of markdown.split("\n")) {
    if (/^\s*```|^\s*~~~/.test(line)) {
      fenced = !fenced;
      continue;
    }
    if (fenced) continue;
    const m = line.match(/^(#{1,6})\s+(.+?)\s*#*$/);
    if (m) {
      const title = m[2]
        .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
        .replace(/[*`]/g, "");
      result.push({
        id: slugger.slug(title),
        title,
        level: m[1].length,
        text: "",
      });
    } else if (result.length) result[result.length - 1].text += " " + line;
  }
  return result;
}
export function buildCatalogue(root = process.cwd()): Catalogue {
  const documents: Document[] = [];
  const papers: Catalogue["papers"] = [];
  const folders = readdirSync(root)
    .filter((x) => /^(Prelims|Mains)-/.test(x))
    .sort((a, b) =>
      a.startsWith("Prelims")
        ? -1
        : b.startsWith("Prelims")
          ? 1
          : a.localeCompare(b),
    );
  for (const folder of folders) {
    const files = readdirSync(join(root, folder)).filter((x) =>
      /^(\d{3}-.+|.+-(Curriculum|Syllabus))\.md$/.test(x),
    );
    for (const name of files) {
      const path = folder + "/" + name;
      const markdown = readFileSync(join(root, path), "utf8");
      const kind = name.endsWith("-Curriculum.md")
        ? "curriculum"
        : name.endsWith("-Syllabus.md")
          ? "syllabus"
          : "chapter";
      documents.push({
        path,
        title: markdown.match(/^#\s+(.+)$/m)?.[1] ?? name,
        markdown,
        ready: kind === "chapter" && isReady(markdown),
        kind,
        chapter: name.match(/^(\d{3})-/)?.[1] ?? null,
        revision: createHash("sha256").update(markdown).digest("hex"),
        sections: sections(markdown),
      });
    }
    const curriculum = documents.find(
      (d) => d.path.startsWith(folder + "/") && d.kind === "curriculum",
    );
    const syllabus = documents.find(
      (d) => d.path.startsWith(folder + "/") && d.kind === "syllabus",
    );
    if (!curriculum || !syllabus)
      throw new Error("Missing curriculum/syllabus: " + folder);
    const linked = [
      ...curriculum.markdown.matchAll(/\]\((\d{3}-[^)#]+\.md)(?:#[^)]*)?\)/g),
    ].map((m) => folder + "/" + m[1]);
    const chapters = [...new Set(linked)].filter(
      (p) => !/-part-\d+\.md$/.test(p),
    );
    for (const path of linked)
      if (!documents.some((d) => d.path === path))
        throw new Error("Broken curriculum chapter: " + path);
    if (
      new Set(chapters.map((p) => p.match(/\/(\d{3})-/)?.[1])).size !==
      chapters.length
    )
      throw new Error("Duplicate chapter identity: " + folder);
    papers.push({
      id: folder,
      title: folder
        .replace(/-/g, " ")
        .replace("Indian Language", "Hindi · Paper A")
        .replace("English", "English · Paper B"),
      stage: folder.startsWith("Prelims") ? "Prelims" : "Mains",
      curriculum: curriculum.path,
      syllabus: syllabus.path,
      chapters,
    });
  }
  let commit = "local";
  try {
    commit = execFileSync("git", ["rev-parse", "HEAD"], {
      cwd: root,
      encoding: "utf8",
    }).trim();
  } catch {
    const deploymentCommit = process.env.VERCEL_GIT_COMMIT_SHA;
    if (deploymentCommit && /^[a-f0-9]{40}$/.test(deploymentCommit))
      commit = deploymentCommit;
  }
  return { commit, papers, documents };
}
if (process.argv[1]?.endsWith("/scripts/content.ts")) {
  const c = buildCatalogue();
  mkdirSync(".generated", { recursive: true });
  writeFileSync(".generated/content.json", JSON.stringify(c));
  console.log(
    `Indexed ${c.papers.length} paper folders, ${c.documents.length} documents, ${c.documents.filter((d) => d.ready).length} authored chapter/part files.`,
  );
}
