import Link from "@/components/navigation-link";
import { simulationRoot } from "@/modules/assessment/chapter-simulation";

export type FullPaperResult = {
  id: string;
  paper_code: string;
  paper_variant: string;
  score_units: number;
  max_units: number;
  finalized_at: string;
};

export function fullPaperPercent(result: FullPaperResult) {
  return (100 * result.score_units) / result.max_units;
}

export function percentage(value: number) {
  return (
    new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 }).format(value) +
    "%"
  );
}

export function PaperPerformance({
  title,
  results,
}: {
  title: string;
  results: FullPaperResult[];
}) {
  const ordered = results.toReversed();
  const minimum = results[0].paper_code.startsWith("Prelims-") ? -100 / 3 : 0;
  const plot = ordered.map((result, index) => ({
    x: ordered.length === 1 ? 325 : 50 + (550 * index) / (ordered.length - 1),
    y: 148 - (120 * (fullPaperPercent(result) - minimum)) / (100 - minimum),
    result,
  }));
  return (
    <section className="section study-card">
      <h2>Full-scope {title} results</h2>
      <svg
        className="full-paper-chart"
        viewBox="0 0 630 168"
        aria-hidden="true"
      >
        {[100, 50, 0, ...(minimum < 0 ? [-100 / 3] : [])].map((value) => {
          const y = 148 - (120 * (value - minimum)) / (100 - minimum);
          return (
            <g key={value}>
              <line x1="48" y1={y} x2="600" y2={y} />
              <text x="40" y={y + 4} textAnchor="end">
                {Math.round(value)}%
              </text>
            </g>
          );
        })}
        <polyline points={plot.map(({ x, y }) => x + "," + y).join(" ")} />
        {plot.map(({ x, y, result }) => (
          <circle key={result.id} cx={x} cy={y} r="5" />
        ))}
      </svg>
      <ol className="study-list" aria-label="Scores in attempt order">
        {ordered.map((result) => (
          <li key={result.id}>
            <Link href={simulationRoot + "/" + result.id}>
              <time dateTime={result.finalized_at}>
                {result.finalized_at.slice(0, 10)}
              </time>
            </Link>
            <span>{percentage(fullPaperPercent(result))}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
