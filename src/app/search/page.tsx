import Link from "next/link";
import { catalogue } from "@/modules/content/catalogue";
import { documentUrl } from "@/modules/content/types";
export const metadata = { title: "Search learning material" };
export default async function Search({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const q = (params.q ?? "").trim().slice(0, 120);
  const terms = q.toLocaleLowerCase().split(/\s+/).filter(Boolean);
  const results = terms.length
    ? catalogue.documents
        .filter((d) => d.ready || d.kind !== "chapter")
        .flatMap((d) =>
          d.sections
            .filter((s) =>
              terms.every((t) =>
                (s.title + " " + s.text).toLocaleLowerCase().includes(t),
              ),
            )
            .slice(0, 3)
            .map((s) => ({ d, s })),
        )
        .slice(0, 60)
    : [];
  return (
    <div className="page">
      <p className="eyebrow">LEARNING MATERIAL</p>
      <h1 className="compact-title">Find a concept</h1>
      <form className="search-form" action="/search">
        <label htmlFor="query">Search chapters, curricula and syllabi</label>
        <div>
          <input
            id="query"
            name="q"
            type="search"
            placeholder="Try fundamental rights or complex numbers"
            defaultValue={q}
            maxLength={120}
          />
          <button className="button primary" type="submit">
            Search
          </button>
        </div>
      </form>
      {q && (
        <p className="footnote">
          {results.length}
          {results.length === 60 ? "+" : ""} matching sections for “{q}”
        </p>
      )}
      <div className="search-results">
        {results.map(({ d, s }) => (
          <Link key={d.path + s.id} href={documentUrl(d.path) + "#" + s.id}>
            <span className="eyebrow">
              {d.path.split("/")[0].replace(/-/g, " ")}
            </span>
            <h2>{s.title}</h2>
            <p>{s.text.replace(/[*#`|]/g, "").slice(0, 230)}…</p>
            <small>{d.title}</small>
          </Link>
        ))}
      </div>
      {q && !results.length && (
        <p className="notice">
          No matching authored material. Try a shorter phrase.
        </p>
      )}
    </div>
  );
}
