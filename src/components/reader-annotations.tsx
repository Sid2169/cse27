"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  highlightColors,
  isHighlightColor,
  type HighlightColor,
} from "@/modules/reader/highlight-colors";
import { useRouter } from "next/navigation";
import {
  resolveTextAnchor,
  type TextAnchor,
} from "@/modules/reader/annotation-anchor";
import { documentUrl } from "@/modules/content/types";
import type { BookmarkAnchor } from "@/modules/reader/bookmarks";

type Annotation = {
  id: string;
  kind: "note" | "highlight";
  anchor: BookmarkAnchor & Partial<TextAnchor> & { color?: HighlightColor };
  body: string;
  version: number;
};

function rangeAt(root: HTMLElement, start: number, size: number) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const range = document.createRange();
  let offset = 0;
  let started = false;
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const sizeOfNode = node.textContent?.length ?? 0;
    if (!started && start < offset + sizeOfNode) {
      range.setStart(node, start - offset);
      started = true;
    }
    if (started && start + size <= offset + sizeOfNode) {
      range.setEnd(node, start + size - offset);
      return range;
    }
    offset += sizeOfNode;
  }
  return null;
}

export function ReaderAnnotations({
  path,
  blob,
  headings,
}: {
  path: string;
  blob: string;
  headings: { id: string; title: string }[];
}) {
  const router = useRouter();
  const readGeneration = useRef(0);
  const [pendingHighlight, setPendingHighlight] = useState<Annotation | null>(
    null,
  );
  const [rows, setRows] = useState<Annotation[] | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [quote, setQuote] = useState<TextAnchor | null>(null);
  const [selection, setSelection] = useState<{
    anchor: TextAnchor;
    x: number;
    y: number;
  } | null>(null);
  const [color, setColor] = useState<HighlightColor>("yellow");
  const [body, setBody] = useState("");
  const [heading, setHeading] = useState("");
  const [resolved, setResolved] = useState<string[]>([]);

  const loadRows = useCallback(
    async (interactive = true, signal?: AbortSignal) => {
      const generation = readGeneration.current;
      const response = await fetch(
        "/api/reader/annotations?" + new URLSearchParams({ path }),
        { cache: "no-store", signal },
      );
      if (response.redirected) {
        if (interactive) router.push("/login");
        return;
      }
      if (!response.ok) throw new Error("Could not load annotations.");
      const savedRows = await response.json();
      if (!signal?.aborted && generation === readGeneration.current)
        setRows(savedRows);
    },
    [path, router],
  );

  useEffect(() => {
    const controller = new AbortController();
    const frame = requestAnimationFrame(() => {
      void loadRows(false, controller.signal).catch(() => {});
    });
    return () => {
      cancelAnimationFrame(frame);
      controller.abort();
    };
  }, [loadRows]);

  useEffect(() => {
    const root = document.getElementById("reader-content");
    if (!root) return;
    const matched: string[] = [];
    const ranges = new Map<HighlightColor, Range[]>(
      highlightColors.map((entry) => [entry, []]),
    );
    const visibleRows = pendingHighlight
      ? [pendingHighlight, ...(rows ?? [])]
      : (rows ?? []);
    for (const row of visibleRows) {
      const a = row.anchor;
      if (a.path !== path) continue;
      if (row.kind === "note") {
        if (
          !a.heading ||
          (a.blob === blob && headings.some((h) => h.id === a.heading))
        )
          matched.push(row.id);
      } else if (a.quote && a.prefix !== undefined && a.suffix !== undefined) {
        const offset = resolveTextAnchor(root.textContent ?? "", {
          quote: a.quote,
          prefix: a.prefix,
          suffix: a.suffix,
        });
        const range =
          offset === null ? null : rangeAt(root, offset, a.quote.length);
        if (range) {
          matched.push(row.id);
          ranges
            .get(isHighlightColor(a.color) ? a.color : "yellow")!
            .push(range);
        }
      }
    }
    const frame = requestAnimationFrame(() => setResolved(matched));
    if (typeof Highlight !== "undefined" && CSS.highlights)
      for (const [entry, matches] of ranges)
        CSS.highlights.set("cse27-" + entry, new Highlight(...matches));
    return () => {
      cancelAnimationFrame(frame);
      if (typeof Highlight !== "undefined" && CSS.highlights)
        for (const entry of highlightColors)
          CSS.highlights.delete("cse27-" + entry);
    };
  }, [path, blob, headings, rows, pendingHighlight]);

  useEffect(() => {
    function captureSelection() {
      const root = document.getElementById("reader-content");
      const selection = window.getSelection();
      if (!root || !selection?.rangeCount || selection.isCollapsed) {
        setSelection(null);
        return;
      }
      const selected = selection.getRangeAt(0);
      if (
        !root.contains(selected.startContainer) ||
        !root.contains(selected.endContainer)
      ) {
        setSelection(null);
        return;
      }
      const before = document.createRange();
      before.selectNodeContents(root);
      before.setEnd(selected.startContainer, selected.startOffset);
      const offset = before.toString().length;
      const text = root.textContent ?? "";
      const excerpt = selected.toString();
      if (
        !excerpt.trim() ||
        excerpt.length > 2000 ||
        text.slice(offset, offset + excerpt.length) !== excerpt
      ) {
        setSelection(null);
        return;
      }
      const rect = selected.getBoundingClientRect();
      setSelection({
        anchor: {
          quote: excerpt,
          prefix: text.slice(Math.max(0, offset - 80), offset),
          suffix: text.slice(
            offset + excerpt.length,
            offset + excerpt.length + 80,
          ),
        },
        x: rect.left + rect.width / 2,
        y: rect.top,
      });
    }
    function dismiss(event: KeyboardEvent) {
      if (event.key === "Escape") setSelection(null);
    }
    document.addEventListener("selectionchange", captureSelection);
    document.addEventListener("keydown", dismiss);
    window.addEventListener("resize", captureSelection);
    window.addEventListener("scroll", captureSelection, true);
    return () => {
      document.removeEventListener("selectionchange", captureSelection);
      document.removeEventListener("keydown", dismiss);
      window.removeEventListener("resize", captureSelection);
      window.removeEventListener("scroll", captureSelection, true);
    };
  }, [path]);

  async function mutate(
    input: Record<string, unknown>,
    optimisticRange?: TextAnchor,
  ) {
    if (optimisticRange && isHighlightColor(input.color)) {
      setPendingHighlight({
        id: "pending-highlight",
        kind: "highlight",
        anchor: {
          version: 1,
          path,
          heading: "",
          blob,
          ...optimisticRange,
          color: input.color,
        },
        body: "",
        version: 0,
      });
    }
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/reader/annotations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (response.redirected) {
        router.push("/login");
        return;
      }
      if (response.status === 409) {
        await loadRows();
        setMessage(
          "The annotation or chapter changed. Review the latest version before trying again.",
        );
        return;
      }
      if (!response.ok) {
        setMessage("Could not save. A standalone note needs text.");
        return;
      }
      if (input.operation === "save") {
        const saved: Annotation = await response.json();
        readGeneration.current++;
        setRows((previous) => [
          saved,
          ...(previous ?? []).filter((row) => row.id !== saved.id),
        ]);
        setBody("");
        setQuote(null);
      }
      if (input.operation !== "save" || !rows) await loadRows();
      setMessage("Changes saved.");
    } catch {
      setMessage("Could not save changes.");
    } finally {
      setPendingHighlight(null);
      setBusy(false);
    }
  }

  return (
    <section
      className="section"
      id="annotations"
      aria-label="Private annotations"
    >
      <div className="button-row">
        <button
          className="button"
          onClick={() =>
            void loadRows().catch(() =>
              setMessage("Could not load annotations."),
            )
          }
        >
          Open notes and highlights
        </button>
      </div>
      {selection &&
        createPortal(
          <div
            className="selection-annotations"
            role="group"
            aria-label="Annotate selected text"
            style={{
              left: Math.max(
                145,
                Math.min(window.innerWidth - 145, selection.x),
              ),
              top: Math.max(72, selection.y - 56),
            }}
            onPointerDown={(event) => event.preventDefault()}
          >
            {highlightColors.map((entry) => (
              <button
                key={entry}
                type="button"
                className="highlight-swatch"
                data-color={entry}
                aria-label={"Highlight " + entry}
                disabled={busy}
                onClick={() => {
                  void mutate(
                    {
                      operation: "save",
                      path,
                      blob,
                      heading: "",
                      range: selection.anchor,
                      body: "",
                      color: entry,
                    },
                    selection.anchor,
                  );
                  window.getSelection()?.removeAllRanges();
                  setSelection(null);
                }}
              />
            ))}
            <button
              type="button"
              className="button"
              onClick={() => {
                setQuote(selection.anchor);
                setColor("yellow");
                setBody("");
                window.getSelection()?.removeAllRanges();
                setSelection(null);
                requestAnimationFrame(() =>
                  document.getElementById("selected-text-note")?.focus(),
                );
              }}
            >
              Add note
            </button>
          </div>,
          document.body,
        )}
      {message && <p role="status">{message}</p>}
      {(rows || quote) && (
        <form
          className="stack-form"
          onSubmit={(event) => {
            event.preventDefault();
            void mutate({
              operation: "save",
              path,
              blob,
              heading: quote ? "" : heading,
              range: quote,
              color: quote ? color : undefined,
              body,
            });
          }}
        >
          <h2>{quote ? "Note on selected text" : "Add a note"}</h2>
          {quote ? (
            <>
              <blockquote>{quote.quote}</blockquote>
              <div
                className="button-row"
                role="group"
                aria-label="Highlight color"
              >
                {highlightColors.map((entry) => (
                  <button
                    key={entry}
                    type="button"
                    className="highlight-swatch"
                    data-color={entry}
                    aria-label={entry}
                    aria-pressed={color === entry}
                    onClick={() => setColor(entry)}
                  />
                ))}
              </div>
            </>
          ) : (
            <label>
              Location
              <select
                value={heading}
                onChange={(event) => setHeading(event.target.value)}
              >
                <option value="">Chapter or part</option>
                {headings.map((entry) => (
                  <option key={entry.id} value={entry.id}>
                    {entry.title}
                  </option>
                ))}
              </select>
            </label>
          )}
          <label>
            Note
            <textarea
              id={quote ? "selected-text-note" : undefined}
              value={body}
              onChange={(event) => setBody(event.target.value)}
              maxLength={8000}
              required
              rows={3}
            />
          </label>
          <div className="button-row">
            <button className="button primary" disabled={busy}>
              Save note
            </button>
            {quote && (
              <button
                type="button"
                className="button"
                onClick={() => setQuote(null)}
              >
                Clear selection
              </button>
            )}
          </div>
        </form>
      )}
      {rows?.map((row) => (
        <form
          className="stack-form"
          key={row.id + ":" + row.version}
          onSubmit={(event) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            const action = (event.nativeEvent as SubmitEvent)
              .submitter as HTMLButtonElement | null;
            void mutate({
              operation: action?.value ?? "edit",
              id: row.id,
              body: form.get("body"),
              version: row.version,
            });
          }}
        >
          {row.anchor.path !== path ? (
            <a href={documentUrl(row.anchor.path)}>
              Open the part where this was saved
            </a>
          ) : (
            !resolved.includes(row.id) && (
              <p className="notice">
                Saved location is unresolved in this version.
              </p>
            )
          )}
          {row.anchor.quote && <blockquote>{row.anchor.quote}</blockquote>}
          <label>
            {row.kind === "note" ? "Note" : "Highlight note"}
            <textarea
              name="body"
              defaultValue={row.body}
              maxLength={8000}
              rows={3}
            />
          </label>
          <div className="button-row">
            <button className="button" value="edit" disabled={busy}>
              Save changes
            </button>
            <button className="button" value="delete" disabled={busy}>
              Delete
            </button>
          </div>
        </form>
      ))}
    </section>
  );
}
