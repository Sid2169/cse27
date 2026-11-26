import { notFound } from "next/navigation";
import Link from "next/link";
import { catalogue, getDocument, getPaper } from "@/modules/content/catalogue";
import { documentUrl } from "@/modules/content/types";
import { Markdown } from "@/components/markdown";
import { ReaderControls } from "@/components/reader-controls";
export function generateStaticParams() {
  return [
    ...catalogue.papers.map((p) => ({ slug: [p.id] })),
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
  return {
    title:
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
      <div className="page">
        <p className="eyebrow">{paper.stage.toUpperCase()} · CURRICULUM</p>
        <h1 className="compact-title">
          {paper.title.replace(paper.stage + " ", "")}
        </h1>
        <p className="lead">
          Follow the curriculum sequence. Chapters marked “Planned” contain an
          outline; teaching material is still pending.
        </p>
        <div className="button-row">
          <Link className="button primary" href={documentUrl(paper.curriculum)}>
            Read curriculum
          </Link>
          <Link className="button" href={documentUrl(paper.syllabus)}>
            Official syllabus
          </Link>
        </div>
        <div className="chapter-list">
          {paper.chapters.map((path) => {
            const d = getDocument(path)!;
            return (
              <Link key={path} href={documentUrl(path)}>
                <span className="chapter-number">{d.chapter}</span>
                <span>{d.title.replace(/^\d+[.\s—–-]*/, "")}</span>
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
    <div className="reader-page">
      <div className="breadcrumbs">
        <Link href={"/learn/" + paper.id}>{paper.title}</Link>
        <span>/</span>
        <span>{d.kind === "chapter" ? "Chapter " + d.chapter : d.kind}</span>
      </div>
      <div className="reader-top">
        <span className="eyebrow">
          {d.kind.toUpperCase()} {d.chapter ?? ""}
        </span>
        <ReaderControls />
      </div>
      {d.kind === "chapter" && !d.ready && (
        <p className="notice">
          Planned chapter. This outline is not authored teaching material.
        </p>
      )}
      <div className="reader-layout">
        <article
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
