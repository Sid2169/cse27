import { ChapterToolbar } from "@/components/chapter-toolbar";
import {
  PaperProgress,
  OverallProgress,
  PhaseProgress,
} from "@/components/checkpoint-progress";
import { notFound } from "next/navigation";
import Link from "@/components/navigation-link";
import { catalogue, getDocument, getPaper } from "@/modules/content/catalogue";
import { documentUrl } from "@/modules/content/types";
import { Markdown } from "@/components/markdown";
import { ReaderAnnotations } from "@/components/reader-annotations";
import { ReaderControls } from "@/components/reader-controls";
export function generateStaticParams() {
  return [
    ...catalogue.papers.map((p) => ({ slug: [p.id] })),
    ...catalogue.papers.flatMap((paper) =>
      paper.phases.map((phase) => ({ slug: [paper.id, "phase", phase.id] })),
    ),
    ...catalogue.documents.map((d) => ({
      slug: d.path.replace(/\.md$/, "").split("/"),
    })),
  ];
}
export const dynamicParams = false;
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const phase =
    slug[1] === "phase"
      ? getPaper(slug[0])?.phases.find((entry) => entry.id === slug[2])
      : undefined;
  return {
    title:
      phase?.title ??
      getDocument(slug.join("/") + ".md")?.title ??
      getPaper(slug[0])?.title ??
      "Learning material",
  };
}
export default async function Learn({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const paper = getPaper(slug[0]);
  if (!paper) notFound();
  if (slug.length === 1) {
    return (
      <PaperProgress
        paper={paper.id}
        enabled={process.env.CHECKPOINTS_ENABLED === "true"}
      >
        <div className="page">
          <p className="eyebrow">{paper.stage.toUpperCase()} · CURRICULUM</p>
          <div className="paper-heading">
            <div>
              <h1 className="compact-title">
                {paper.title.replace(paper.stage + " ", "")}
              </h1>
              <p className="lead">Choose a phase to browse its chapters.</p>
            </div>
            <OverallProgress chapters={paper.chapters} />
          </div>
          <div className="button-row">
            <Link
              className="button primary"
              href={documentUrl(paper.curriculum)}
            >
              Read curriculum
            </Link>
            <Link className="button" href={documentUrl(paper.syllabus)}>
              Official syllabus
            </Link>
          </div>
          <p className="footnote">
            Completion counts chapters passed by checkpoint.
            {process.env.CHECKPOINTS_ENABLED !== "true" &&
              " Checkpoints are not available yet."}
          </p>
          <div className="phase-grid">
            {paper.phases.map((phase) => (
              <Link
                key={phase.id}
                className="phase-card"
                href={`/learn/${paper.id}/phase/${phase.id}`}
              >
                <p className="eyebrow">
                  {paper.id === "Mains-Indian-Language" ? "चरण" : "Phase"}{" "}
                  {phase.id.toUpperCase()}
                </p>
                <h2
                  lang={paper.id === "Mains-Indian-Language" ? "hi" : undefined}
                >
                  {phase.title}
                </h2>
                <p
                  className="phase-description"
                  lang={paper.id === "Mains-Indian-Language" ? "hi" : undefined}
                >
                  {phase.description}
                </p>
                <PhaseProgress chapters={phase.chapters} title={phase.title} />
              </Link>
            ))}
          </div>
        </div>
      </PaperProgress>
    );
  }
  if (slug.length === 3 && slug[1] === "phase") {
    const phase = paper.phases.find((entry) => entry.id === slug[2]);
    if (!phase) notFound();
    const hindi = paper.id === "Mains-Indian-Language";
    return (
      <div className="page">
        <div className="breadcrumbs">
          <Link href={`/learn/${paper.id}`}>{paper.title}</Link>
        </div>
        <p className="eyebrow">
          {hindi ? "चरण" : "Phase"} {phase.id.toUpperCase()}
        </p>
        <h1 className="compact-title" lang={hindi ? "hi" : undefined}>
          {phase.title}
        </h1>
        <p className="lead" lang={hindi ? "hi" : undefined}>
          {phase.description}
        </p>
        <div className="chapter-list">
          {phase.chapters.map((path) => {
            const d = getDocument(path)!;
            return (
              <Link key={path} href={documentUrl(path)}>
                <span className="chapter-number">{d.chapter}</span>
                <span lang={hindi ? "hi" : undefined}>
                  {d.title.replace(/^\d+[.\s—–-]*/, "")}
                </span>
                <span className={"pill " + (d.ready ? "ready" : "")}>
                  {d.ready ? "Read" : "Planned"}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    );
  }
  const d = getDocument(slug.join("/") + ".md");
  if (!d) notFound();
  const i = paper.chapters.indexOf(d.path);
  return (
    <div
      className={
        d.kind === "chapter" ? "reader-page chapter-page" : "reader-page"
      }
    >
      <div className="breadcrumbs">
        <Link href={"/learn/" + paper.id}>{paper.title}</Link>
        <span>/</span>
        <span>{d.kind === "chapter" ? "Chapter " + d.chapter : d.kind}</span>
      </div>
      {d.kind === "chapter" ? (
        <ChapterToolbar
          path={d.path}
          headings={d.sections.filter((section) => section.level <= 4)}
          canSave={process.env.READER_POSITIONS_ENABLED === "true"}
          hasNotes={process.env.READER_ANNOTATIONS_ENABLED === "true"}
        >
          {process.env.READER_ANNOTATIONS_ENABLED === "true" && (
            <ReaderAnnotations
              key={d.path}
              path={d.path}
              blob={d.revision}
              headings={d.sections.map(({ id, title }) => ({ id, title }))}
            />
          )}
        </ChapterToolbar>
      ) : (
        <div className="reader-top">
          <ReaderControls />
        </div>
      )}
      {d.kind === "chapter" && !d.ready && (
        <p className="notice">
          Planned chapter. This outline is not authored teaching material.
        </p>
      )}
      <div className="reader-layout">
        <article
          id="reader-content"
          className="prose"
          lang={paper.id === "Mains-Indian-Language" ? "hi" : "en"}
        >
          <Markdown source={d.markdown} path={d.path} />
        </article>
        <aside className="toc">
          <details open>
            <summary>On this page</summary>
            <nav aria-label="Table of contents">
              {d.sections
                .filter((s) => s.level === 2)
                .map((s) => (
                  <a key={s.id} href={"#" + s.id}>
                    {s.title}
                  </a>
                ))}
            </nav>
          </details>
        </aside>
      </div>
      {i >= 0 && d.ready && process.env.CHECKPOINTS_ENABLED === "true" && (
        <Link
          className="button primary"
          href={{
            pathname: "/dashboard/checkpoints",
            query: { paper: paper.id, chapter: d.path },
          }}
        >
          Chapter checkpoint
        </Link>
      )}
      {i >= 0 && (
        <nav className="chapter-pagination" aria-label="Chapter navigation">
          {i > 0 ? (
            <Link href={documentUrl(paper.chapters[i - 1])}>
              Previous chapter
            </Link>
          ) : (
            <span />
          )}
          {i < paper.chapters.length - 1 && (
            <Link href={documentUrl(paper.chapters[i + 1])}>Next chapter</Link>
          )}
        </nav>
      )}
      <footer className="footnote">
        Source revision {d.revision.slice(0, 10)} ·{" "}
        <a
          href={
            "https://github.com/Sid2169/cse27/blob/" +
            catalogue.commit +
            "/" +
            d.path
          }
        >
          View source
        </a>
      </footer>
    </div>
  );
}
