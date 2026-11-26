import Link from "next/link";
import { BookOpen, Layers, Search } from "lucide-react";
import { catalogue, getDocument } from "@/modules/content/catalogue";
import { documentUrl } from "@/modules/content/types";
export default function Home() {
  const chapters = catalogue.documents.filter(
    (d) => d.kind === "chapter" && !/-part-\d+\.md$/.test(d.path),
  );
  const ready = chapters.filter((d) => d.ready);
  return (
    <div className="page">
      <p className="eyebrow">YOUR STUDY LIBRARY</p>
      <h1>
        A little more clarity.
        <br />
        <span>One chapter at a time.</span>
      </h1>
      <p className="lead">
        Your curricula, chapters and source material for CSE 2027, in one
        focused place.
      </p>
      <div className="stats">
        <div>
          <BookOpen />
          <strong>{ready.length}</strong>
          <span>Authored chapters</span>
        </div>
        <div>
          <Layers />
          <strong>{chapters.length}</strong>
          <span>Curriculum chapters</span>
        </div>
        <Link href="/search">
          <Search />
          <strong>Find a concept</strong>
          <span>Search authored learning material</span>
        </Link>
      </div>
      <section className="section">
        <div className="section-heading">
          <h2>Start reading</h2>
          <span>Available now</span>
        </div>
        <div className="reading-grid">
          {ready
            .filter((d) => d.path.includes("Prelims-General-Studies-I"))
            .slice(0, 3)
            .map((d) => (
              <Link
                className="reading-card"
                key={d.path}
                href={documentUrl(d.path)}
              >
                <span className="eyebrow">PRELIMS · GENERAL STUDIES I</span>
                <BookOpen size={23} />
                <h3>{d.title.replace(/^\d+[.\s]*/, "")}</h3>
                <span className="card-link">Read chapter</span>
              </Link>
            ))}
        </div>
      </section>
      {(["Prelims", "Mains"] as const).map((stage) => (
        <section className="section" key={stage}>
          <div className="section-heading">
            <h2>{stage}</h2>
            <span>Curricula & chapters</span>
          </div>
          <div className="paper-grid">
            {catalogue.papers
              .filter((p) => p.stage === stage)
              .map((p) => {
                const count = p.chapters.filter(
                  (path) => getDocument(path)?.ready,
                ).length;
                return (
                  <Link
                    className="paper-card"
                    key={p.id}
                    href={"/learn/" + p.id}
                  >
                    <div>
                      <h3>{p.title.replace(stage + " ", "")}</h3>
                      <p>
                        {count} authored · {p.chapters.length} curriculum
                        chapters
                      </p>
                    </div>
                    <span className="pill">
                      {count ? "Read" : "Curriculum"}
                    </span>
                  </Link>
                );
              })}
          </div>
        </section>
      ))}
      <p className="footnote">
        Authored material is available to read. Planned chapters are labelled
        throughout. Assessments and private study tools will appear as they
        become available.
      </p>
    </div>
  );
}
