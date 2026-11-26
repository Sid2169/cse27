"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Bookmark, List, MoreHorizontal, NotebookPen } from "lucide-react";
import Link from "@/components/navigation-link";
import { ReaderControls } from "./reader-controls";
import { saveCurrentSection } from "@/app/library/actions";

export function ChapterToolbar({
  path,
  headings,
  canSave,
  hasNotes,
  children,
}: {
  path: string;
  headings: { id: string; title: string }[];
  canSave: boolean;
  hasNotes: boolean;
  children: ReactNode;
}) {
  const [menu, setMenu] = useState<"contents" | "more" | null>(null);
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!status) return;
    const timer = setTimeout(() => setStatus(""), 3500);
    return () => clearTimeout(timer);
  }, [status]);

  async function save() {
    setMenu(null);
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
        if (event.key === "Escape") setMenu(null);
      }}
    >
      <button
        type="button"
        className="button"
        aria-expanded={menu === "contents"}
        aria-controls="chapter-contents-panel"
        onClick={() => setMenu(menu === "contents" ? null : "contents")}
      >
        <List size={16} aria-hidden="true" /> Contents
      </button>
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
          onClick={() => setMenu(null)}
        >
          <NotebookPen size={16} aria-hidden="true" />
          <span className="chapter-desktop-label">Notes &amp; highlights</span>
          <span className="chapter-mobile-label">Notes</span>
        </Link>
      )}
      <div className="chapter-desktop-size">
        <ReaderControls showPrint={false} />
      </div>
      <button
        type="button"
        className="button"
        aria-expanded={menu === "more"}
        aria-controls="chapter-more-panel"
        onClick={() => setMenu(menu === "more" ? null : "more")}
      >
        <MoreHorizontal size={16} aria-hidden="true" /> More
      </button>
      <nav
        id="chapter-contents-panel"
        className="chapter-toolbar-panel"
        aria-label="Chapter contents"
        hidden={menu !== "contents"}
      >
        {headings
          .filter((section) => section.id)
          .map((section) => (
            <a
              key={section.id}
              href={"#" + encodeURIComponent(section.id)}
              onClick={() => setMenu(null)}
            >
              {section.title}
            </a>
          ))}
      </nav>
      <div
        id="chapter-more-panel"
        className="chapter-toolbar-panel"
        hidden={menu !== "more"}
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
