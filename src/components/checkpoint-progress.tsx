"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

const Qualified = createContext<ReadonlySet<string>>(new Set());

export function PaperProgress({
  paper,
  enabled,
  children,
}: {
  paper: string;
  enabled: boolean;
  children: ReactNode;
}) {
  const [results, setResults] = useState<{
    paper: string;
    paths: Set<string>;
  }>();
  useEffect(() => {
    if (!enabled) return;
    const controller = new AbortController();
    void fetch(
      "/api/reader/checkpoint-progress?" + new URLSearchParams({ paper }),
      {
        cache: "no-store",
        redirect: "manual",
        signal: controller.signal,
      },
    )
      .then(async (response) => {
        if (!response.ok) return;
        const paths: unknown = await response.json();
        if (
          Array.isArray(paths) &&
          paths.every((path) => typeof path === "string")
        )
          setResults({ paper, paths: new Set(paths) });
      })
      .catch(() => {});
    return () => controller.abort();
  }, [paper, enabled]);
  return (
    <Qualified.Provider
      value={results?.paper === paper ? results.paths : new Set()}
    >
      {children}
    </Qualified.Provider>
  );
}

function usePercentage(chapters: string[]) {
  const qualified = useContext(Qualified);
  return chapters.length
    ? Math.floor(
        (100 * chapters.filter((path) => qualified.has(path)).length) /
          chapters.length,
      )
    : 0;
}

export function OverallProgress({ chapters }: { chapters: string[] }) {
  const percent = usePercentage(chapters);
  return (
    <div className="paper-completion">
      <div
        className="progress-ring"
        role="progressbar"
        aria-label="Overall paper completion"
        aria-valuenow={percent}
      >
        <svg viewBox="0 0 100 100" aria-hidden="true">
          <circle
            cx="50"
            cy="50"
            r="46"
            pathLength="100"
            strokeDasharray={percent + " 100"}
          />
        </svg>
        <strong aria-hidden="true">{percent}%</strong>
      </div>
      <span>Overall completion</span>
    </div>
  );
}

export function PhaseProgress({
  chapters,
  title,
}: {
  chapters: string[];
  title: string;
}) {
  const percent = usePercentage(chapters);
  return (
    <div className="phase-progress">
      <div>
        <span>{chapters.length} chapters</span>
        <strong>{percent}%</strong>
      </div>
      <progress aria-label={title + " completion"} value={percent} max={100} />
    </div>
  );
}
