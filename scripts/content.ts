import {
  readFileSync,
  readdirSync,
  writeFileSync,
  mkdirSync,
  copyFileSync,
} from "node:fs";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { dirname, join } from "node:path";
import GithubSlugger from "github-slugger";
import { transcriptionNotes } from "../src/modules/content/past-papers";
import type {
  Catalogue,
  Document,
  Section,
  Phase,
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
function curriculumPhases(
  curriculum: Document,
  chapters: string[],
  documents: Document[],
): Phase[] {
  const folder = curriculum.path.split("/")[0];
  const allowed = new Set(chapters);
  const phases = new Map<string, Phase>();
  const descriptions = new Map<string, string>();
  let current: Phase | undefined;

  for (const line of curriculum.markdown.split("\n")) {
    const summary = line.match(
      /^\|\s*(?:(?:Phase|चरण) )?([A-Z0-9]+)\s+[—–-]\s+[^|]+\|[^|]*\|([^|]+)\|/,
    );
    if (summary) descriptions.set(summary[1].toLowerCase(), summary[2].trim());

    const heading = line.match(
      /^### (?:Phase|चरण) ([A-Z0-9]+)\s+[—–-]\s+(.+)$/,
    );
    if (heading) {
      const id = heading[1].toLowerCase();
      current = { id, title: heading[2], description: "", chapters: [] };
      if (phases.has(id)) current = undefined;
      else phases.set(id, current);
      continue;
    }
    if (/^#{1,3} /.test(line)) current = undefined;
    if (!current || !/^(?:#### |\|\s*\[|- \[)/.test(line)) continue;
    const link = line.match(/\]\((\d{3}-[^)#]+\.md)\)/);
    if (!link) continue;
    const path = folder + "/" + link[1];
    if (allowed.has(path) && !current.chapters.includes(path))
      current.chapters.push(path);
  }

  const result = [...phases.values()];
  if (
    result.some((phase) => !phase.chapters.length) ||
    result.flatMap((phase) => phase.chapters).join("\n") !== chapters.join("\n")
  ) {
    throw new Error(
      "Phase chapters do not match the curriculum index: " +
        curriculum.path +
        " (" +
        result.map((phase) => phase.chapters.length).join(", ") +
        ")",
    );
  }
  for (const phase of result) {
    const topics =
      phase.chapters.length <= 3
        ? phase.chapters
        : [
            phase.chapters[0],
            phase.chapters[Math.floor(phase.chapters.length / 2)],
            phase.chapters.at(-1)!,
          ];
    phase.description =
      descriptions.get(phase.id) ??
      topics
        .map((path) =>
          documents
            .find((doc) => doc.path === path)!
            .title.replace(/^\d+[.\s—–-]*/, ""),
        )
        .join(" · ");
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
      phases: curriculumPhases(curriculum, chapters, documents),
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
  const assets: string[] = [];
  for (const paper of c.papers) {
    const directory = join(paper.id, "assets");
    try {
      for (const entry of readdirSync(directory, {
        recursive: true,
        withFileTypes: true,
      })) {
        if (
          !entry.isFile() ||
          !/\.(?:svg|png|jpe?g|webp|avif|gif)$/i.test(entry.name)
        )
          continue;
        const source = join(entry.parentPath, entry.name);
        const destination = join("public", "chapter-assets", source);
        mkdirSync(dirname(destination), { recursive: true });
        copyFileSync(source, destination);
        assets.push(source);
      }
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    }
  }
  const pastPapers = c.papers.flatMap((paper) => {
    const directory = join(paper.id, paper.id + "-PYQS");
    return readdirSync(directory).flatMap((filename) => {
      const year = /^(\d{4})-/.exec(filename)?.[1];
      if (!year || filename !== year + "-" + paper.id + ".md") return [];
      return [
        {
          paper: paper.id,
          year: Number(year),
          notes: transcriptionNotes(
            readFileSync(join(directory, filename), "utf8"),
          ),
        },
      ];
    });
  });
  const csat2024 = readFileSync(
    "Prelims-CSAT/Prelims-CSAT-PYQS/2024-Prelims-CSAT.md",
    "utf8",
  );
  const csatStems = Object.fromEntries(
    [...csat2024.matchAll(/^(\d{1,2})\. ([^\n]+)$/gm)].map(
      ([, number, stem]) => [number, stem],
    ),
  );
  csatStems["24"] =
    "Fill four missing letters in the pattern A_BCD_BBCDABC_DABC_D.";
  writeFileSync(".generated/csat-2024-stems.json", JSON.stringify(csatStems));
  const gs2024 = readFileSync(
    "Prelims-General-Studies-I/Prelims-General-Studies-I-PYQS/2024-Prelims-General-Studies-I.md",
    "utf8",
  );
  const gsStems = [...gs2024.matchAll(/^\d{1,3}\. ([^\n]+)$/gm)].map(
    ([, stem]) => stem,
  );
  writeFileSync(".generated/gs1-2024-stems.json", JSON.stringify(gsStems));
  const objectiveHistoricalReferences = [
    ["Prelims-General-Studies-I", 2019, 100, {}],
    [
      "Prelims-CSAT",
      2019,
      80,
      {
        12: "Determine the weekday for a December 20 birthday given that two others fall on the fifth Monday in April and the fifth Thursday in November.",
      },
    ],
    // The 2020 GS-I research transcription has 102 entries. Keep them as
    // conservative novelty references only. Scoring uses the 100-item PDF.
    ["Prelims-General-Studies-I", 2020, 102, {}],
    ["Prelims-CSAT", 2020, 80, {}],
    ["Prelims-General-Studies-I", 2021, 100, {}],
    [
      "Prelims-CSAT",
      2021,
      80,
      {
        39: "Assess which of two comparisons about the weights of A, D and the other people are sufficient to identify the heaviest among A through E.",
      },
    ],
    ["Prelims-General-Studies-I", 2022, 100, {}],
    [
      "Prelims-CSAT",
      2022,
      80,
      {
        5: "Find a possible sum of the middle digits of a seven-digit identity number with distinct specified digits and divisibility rules on each prefix.",
        36: "Use the six named family members and the stated spousal and parental relationships to identify a necessary relationship.",
      },
    ],
    ["Prelims-General-Studies-I", 2023, 100, {}],
    [
      "Prelims-CSAT",
      2023,
      80,
      {
        69: "Compare the minimum number of 2 g, 5 g, 10 g, 25 g and 50 g silver coins needed to make 78 g with the number needed to measure it on a balance.",
        80: "Count letters that stay in their original positions after arranging the letters of INCOMPREHENSIBILITIES in reverse alphabetical order.",
      },
    ],
    [
      "Prelims-General-Studies-I",
      2025,
      100,
      {
        74: "Implications of the World Bank's warning about wet-bulb temperatures exceeding 35 °C and the loss of effective cooling by sweating.",
      },
    ],
    [
      "Prelims-CSAT",
      2025,
      80,
      {
        35: "Count integers below 50 expressible as the sum of three distinct divisors of the same integer.",
        36: "Find how many distinct sums three primes below 20 form when they are in arithmetic progression.",
      },
    ],
    [
      "Prelims-General-Studies-I",
      2026,
      100,
      {
        64: "Identify labour, migrant-worker, humanitarian and statelessness conventions India has not ratified.",
        78: "Identify which of four proposed outcomes did not follow the German Chancellor’s January 2026 visit to India.",
      },
    ],
    [
      "Prelims-CSAT",
      2026,
      80,
      {
        7: "Find a claim unsupported by the passage on Kalagram, which describes Indian paintings, regional Angans and themed zones.",
        26: "Decide which conclusions on population impact and the response to the two viruses follow from the passage comparing SARS-CoV-2 and HMPV.",
        28: "Infer which claims on study history, outcomes and seasonality follow from the passage contrasting HMPV with SARS-CoV-2.",
        32: "Identify unsupported assumptions about adoption of AI tools and real-time agronomic analysis from the agriculture passage.",
        57: "Find the sixth term of a sequence starting 4 and 7 where each later term sums the two preceding terms.",
        62: "Assess the writer’s descriptions of Hugh Grant falling asleep at Wimbledon and the literary use of a tennis metaphor.",
        64: "Assess claims about convergence theory, including its phases, chronology, and the position of technology leaders.",
        69: "Find the original speed for an 800 km train journey when effects reducing speed to half and a quarter occur after 200 and 600 km, and reversal delays arrival by four hours.",
      },
    ],
  ] as const;
  for (const [
    paper,
    year,
    expected,
    supplements,
  ] of objectiveHistoricalReferences) {
    const markdown = readFileSync(
      `${paper}/${paper}-PYQS/${year}-${paper}.md`,
      "utf8",
    );
    const stems = [...markdown.matchAll(/^(\d{1,3})\. ([^\n]+)$/gm)].map(
      ([, number, stem]) =>
        (supplements as Record<string, string>)[number] ?? stem,
    );
    if (
      stems.length !== expected ||
      stems.some((stem) => /^\[verify:/.test(stem))
    )
      throw new Error(
        "Missing historical novelty references for " + paper + " " + year,
      );
    writeFileSync(
      `.generated/${paper}-${year}-stems.json`,
      JSON.stringify(stems),
    );
  }
  writeFileSync(".generated/past-papers.json", JSON.stringify(pastPapers));
  writeFileSync(".generated/chapter-assets.json", JSON.stringify(assets));
  writeFileSync(".generated/content.json", JSON.stringify(c));
  console.log(
    `Indexed ${c.papers.length} paper folders, ${c.documents.length} documents, ${c.documents.filter((d) => d.ready).length} authored chapter/part files.`,
  );
}
