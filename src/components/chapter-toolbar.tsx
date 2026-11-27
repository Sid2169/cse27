"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  Bookmark,
  ClipboardCheck,
  ClipboardList,
  MoreHorizontal,
  NotebookPen,
} from "lucide-react";
import Link from "@/components/navigation-link";
import { ReaderControls } from "./reader-controls";
import { simulationLink } from "@/modules/assessment/chapter-simulation";
import { saveCurrentSection } from "@/app/library/actions";

export function ChapterToolbar({
  path,
  headings,
  canSave,
  hasNotes,
  completionTest,
  examSimulation,
  children,
}: {
  path: string;
  headings: { id: string; title: string }[];
  canSave: boolean;
  hasNotes: boolean;
  completionTest: { paper: string; chapter: string } | null;
  examSimulation: { paper: string; chapter: string } | null;
  children: ReactNode;
}) {
  const [menu, setMenu] = useState(false);
  const moreButton = useRef<HTMLButtonElement>(null);
  const morePanel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menu) return;
    function dismiss(event: PointerEvent) {
      if (!(event.target instanceof Node)) return;
      if (
        !morePanel.current?.contains(event.target) &&
        !moreButton.current?.contains(event.target)
      )
        setMenu(false);
    }
    document.addEventListener("pointerdown", dismiss);
    return () => document.removeEventListener("pointerdown", dismiss);
  }, [menu]);
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!status) return;
    const timer = setTimeout(() => setStatus(""), 3500);
    return () => clearTimeout(timer);
  }, [status]);

  async function save() {
    setMenu(false);
    setSaving(true);
    setStatus("");
    const bar = document.getElementById("chapter-toolbar");
    const boundary = window.matchMedia("(max-width: 800px)").matches
      ? 88
      : (bar?.getBoundingClientRect().bottom ?? 130) + 12;
    let heading = "";
    for (const section of headings) {
      const element = document.getElementById(section.id);
      if (element && element.getBoundingClientRect().top <= boundary)
        heading = section.id;
    }
    const form = new FormData();
    form.set("path", path);
    form.set("heading", heading);
    try {
      const result = await saveCurrentSection(form);
      setStatus(
        result === "position-saved"
          ? "Location saved"
          : result === "position-conflict"
            ? "Location changed on another device. Try again."
            : "Could not save location.",
      );
    } catch {
      setStatus("Could not save location.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      id="chapter-toolbar"
      className="chapter-toolbar"
      role="group"
      aria-label="Chapter controls"
      onKeyDown={(event) => {
        if (event.key === "Escape") setMenu(false);
      }}
    >
      {canSave ? (
        <button
          type="button"
          className="button"
          disabled={saving}
          onClick={() => void save()}
        >
          <Bookmark size={16} aria-hidden="true" />{" "}
          {saving ? (
            "Saving…"
          ) : (
            <>
              <span className="chapter-desktop-label">Save location</span>
              <span className="chapter-mobile-label">Save</span>
            </>
          )}
        </button>
      ) : (
        <Link
          className="button"
          href={{ pathname: "/library", query: { path } }}
        >
          <Bookmark size={16} aria-hidden="true" /> Bookmark
        </Link>
      )}
      {hasNotes && (
        <Link
          className="button"
          href={{ pathname: "/library/annotations", query: { chapter: path } }}
          onClick={() => setMenu(false)}
        >
          <NotebookPen size={16} aria-hidden="true" />
          <span className="chapter-desktop-label">Notes &amp; highlights</span>
          <span className="chapter-mobile-label">Notes</span>
        </Link>
      )}
      {completionTest && (
        <Link
          className="button"
          href={{ pathname: "/dashboard/checkpoints", query: completionTest }}
          onClick={() => setMenu(false)}
        >
          <ClipboardCheck size={16} aria-hidden="true" />
          <span>Completion test</span>
        </Link>
      )}
      {examSimulation && (
        <Link
          className="button"
          href={simulationLink(examSimulation.paper, examSimulation.chapter)}
          onClick={() => setMenu(false)}
        >
          <ClipboardList size={16} aria-hidden="true" />
          <span>Exam simulation</span>
        </Link>
      )}
      <div className="chapter-desktop-size">
        <ReaderControls showPrint={false} />
      </div>
      <button
        type="button"
        className="button"
        ref={moreButton}
        aria-expanded={menu}
        aria-controls="chapter-more-panel"
        onClick={() => setMenu(!menu)}
      >
        <MoreHorizontal size={16} aria-hidden="true" /> More
      </button>
      <div
        id="chapter-more-panel"
        className="chapter-toolbar-panel"
        ref={morePanel}
        hidden={!menu}
      >
        <div className="chapter-mobile-size">
          <ReaderControls showPrint={false} />
        </div>
        <button className="button" type="button" onClick={() => window.print()}>
          Print
        </button>
        {children}
        {canSave && (
          <Link
            className="button"
            href={{ pathname: "/library", query: { path } }}
          >
            Bookmarks
          </Link>
        )}
      </div>
      {status && (
        <p className="chapter-toolbar-status" role="status">
          {status}
        </p>
      )}
    </div>
  );
}
