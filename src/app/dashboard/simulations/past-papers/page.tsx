import Link from "@/components/navigation-link";
import { catalogue, getPaper } from "@/modules/content/catalogue";
import {
  officialBooklet,
  officialPaperArchive,
  officialPaperIndex,
} from "@/modules/content/past-papers";
import pastPapers from "../../../../../.generated/past-papers.json";
import { requireOwner } from "@/server/supabase";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Official past papers",
  robots: { index: false, follow: false },
};

export default async function PastPapers({
  searchParams,
}: {
  searchParams: Promise<{ paper?: string; year?: string; variant?: string }>;
}) {
  await requireOwner();
  const { paper, year, variant } = await searchParams;
  const selected = typeof paper === "string" ? getPaper(paper) : null;
  const selectedYear =
    typeof year === "string" && /^\d{4}$/.test(year) ? Number(year) : 0;
  const years = [...new Set(pastPapers.map((item) => item.year))].sort(
    (a, b) => b - a,
  );
  const record =
    selected &&
    pastPapers.find(
      (item) => item.paper === selected.id && item.year === selectedYear,
    );
  const math = selected?.id === "Mains-Mathematics";
  const variantValue = variant === "II" ? "II" : "I";
  const booklet =
    selected && selectedYear
      ? officialBooklet(selected.id, selectedYear)
      : null;
  return (
    <div className="page simulation-page">
      <div className="breadcrumbs">
        <Link href="/dashboard/simulations">Exam simulations</Link>
      </div>
      <h1 className="compact-title">Official past papers</h1>
      <p>
        Choose a year and paper. Open UPSC’s original booklet to keep the
        instructions, question numbering and diagrams intact.
      </p>
      <form action="/dashboard/simulations/past-papers" className="stack-form">
        <label>
          Paper
          <select name="paper" defaultValue={selected?.id ?? ""} required>
            <option value="">Select a paper</option>
            {catalogue.papers.map((p) => (
              <option key={p.id} value={p.id}>
                {p.stage} · {p.title}
              </option>
            ))}
          </select>
        </label>
        <label>
          Year
          <select name="year" defaultValue={record ? selectedYear : years[0]}>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </label>
        <label>
          Mathematics paper, if selected
          <select name="variant" defaultValue={variantValue}>
            <option value="I">Paper I</option>
            <option value="II">Paper II</option>
          </select>
        </label>
        <button className="button primary">Find original booklet</button>
      </form>
      {selected && selectedYear > 0 && (
        <section className="study-card section">
          <h2>
            {selectedYear} · {selected.stage} · {selected.title}
            {math && " " + variantValue}
          </h2>
          {!!record && !!record.notes.length && (
            <ul>
              {record.notes.map((note, index) => (
                <li key={index}>{note}</li>
              ))}
            </ul>
          )}
          {!booklet && (
            <p>
              Find this year under Civil Services (
              {selected.stage === "Prelims" ? "Preliminary" : "Main"})
              Examination in the UPSC listings.
            </p>
          )}
          <div className="simulation-actions">
            {booklet && (
              <a className="button primary" href={booklet}>
                Open official PDF
              </a>
            )}
            <a className="button" href={officialPaperIndex}>
              UPSC question papers
            </a>
            <a className="button" href={officialPaperArchive}>
              UPSC archives
            </a>
          </div>
          <p>
            Attempt and grade this booklet separately. In-app historical scoring
            requires a verified booklet and matching answer key.
          </p>
        </section>
      )}
    </div>
  );
}
