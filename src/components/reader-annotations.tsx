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
  const [pendingEdit, setPendingEdit] = useState<{
    id: string;
    row?: Annotation;
  } | null>(null);
  const writeInFlight = useRef(false);
  const [rows, setRows] = useState<Annotation[] | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [selection, setSelection] = useState<{
    anchor: TextAnchor;
    x: number;
    y: number;
  } | null>(null);
  const [inline, setInline] = useState<{
    row?: Annotation;
    anchor: TextAnchor | Partial<TextAnchor>;
    x: number;
    y: number;
  } | null>(null);
  const [inlineColor, setInlineColor] = useState<HighlightColor>("yellow");
  const editorRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!inline) return;
    editorRef.current
      ?.querySelector("textarea")
      ?.focus({ preventScroll: true });
    function escape(event: KeyboardEvent) {
      if (event.key === "Escape") setInline(null);
    }
    document.addEventListener("keydown", escape);
    return () => document.removeEventListener("keydown", escape);
  }, [inline]);

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
    const editable = new Map<string, Range>();
    const ranges = new Map<HighlightColor, Range[]>(
      highlightColors.map((entry) => [entry, []]),
    );
    const visibleRows = (rows ?? []).flatMap((row) =>
      pendingEdit?.id === row.id
        ? pendingEdit.row
          ? [pendingEdit.row]
          : []
        : [row],
    );
    if (pendingHighlight) visibleRows.unshift(pendingHighlight);
    for (const row of visibleRows) {
      const a = row.anchor;
      if (a.path !== path) continue;
      if (
        row.kind === "highlight" &&
        a.quote &&
        a.prefix !== undefined &&
        a.suffix !== undefined
      ) {
        const offset = resolveTextAnchor(root.textContent ?? "", {
          quote: a.quote,
          prefix: a.prefix,
          suffix: a.suffix,
        });
        const range =
          offset === null ? null : rangeAt(root, offset, a.quote.length);
        if (range) {
          if (row.version > 0) editable.set(row.id, range);
          ranges
            .get(isHighlightColor(a.color) ? a.color : "yellow")!
            .push(range);
        }
      }
    }
    function openHighlight(event: MouseEvent) {
      if (
        !window.getSelection()?.isCollapsed ||
        (event.target instanceof Element && event.target.closest("a,button"))
      )
        return;
      for (const [id, range] of editable) {
        if (
          !Array.from(range.getClientRects()).some(
            (rect) =>
              event.clientX >= rect.left &&
              event.clientX <= rect.right &&
              event.clientY >= rect.top &&
              event.clientY <= rect.bottom,
          )
        )
          continue;
        const row = rows?.find((item) => item.id === id);
        if (row) {
          setMessage("");
          setInlineColor(
            isHighlightColor(row.anchor.color) ? row.anchor.color : "yellow",
          );
          setInline({
            row,
            anchor: row.anchor,
            x: event.clientX,
            y: event.clientY,
          });
        }
        break;
      }
    }
    root.addEventListener("click", openHighlight);
    if (typeof Highlight !== "undefined" && CSS.highlights)
      for (const [entry, matches] of ranges)
        CSS.highlights.set("cse27-" + entry, new Highlight(...matches));
    return () => {
      root.removeEventListener("click", openHighlight);
      if (typeof Highlight !== "undefined" && CSS.highlights)
        for (const entry of highlightColors)
          CSS.highlights.delete("cse27-" + entry);
    };
  }, [path, rows, pendingHighlight, pendingEdit]);

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
    closeEditor = false,
  ) {
    if (writeInFlight.current) return;
    writeInFlight.current = true;
    if (closeEditor) {
      setInline(null);
      const existing = rows?.find((row) => row.id === input.id);
      if (existing && input.operation === "delete")
        setPendingEdit({ id: existing.id });
      if (
        existing &&
        input.operation === "edit" &&
        typeof input.body === "string"
      ) {
        setPendingEdit({
          id: existing.id,
          row: {
            ...existing,
            version: 0,
            body: input.body.trim(),
            anchor: {
              ...existing.anchor,
              color: isHighlightColor(input.color)
                ? input.color
                : existing.anchor.color,
            },
          },
        });
      }
    }
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
        setMessage("Could not save the annotation. Try again.");
        return;
      }
      const saved: Annotation = await response.json();
      readGeneration.current++;
      setRows((previous) => {
        const entries = previous ?? [];
        if (input.operation === "delete")
          return entries.filter((row) => row.id !== input.id);
        if (input.operation === "edit")
          return entries.map((row) => (row.id === saved.id ? saved : row));
        return [saved, ...entries.filter((row) => row.id !== saved.id)];
      });
      if (input.operation === "save") {
        if (!rows) void loadRows().catch(() => {});
      }
      if (!closeEditor) setMessage("Changes saved.");
    } catch {
      setMessage("Could not save changes.");
    } finally {
      setPendingHighlight(null);
      setPendingEdit(null);
      writeInFlight.current = false;
      setBusy(false);
    }
  }

  return (
    <>
      <button
        className="button"
        type="button"
        onClick={(event) => {
          const bounds = event.currentTarget.getBoundingClientRect();
          setMessage("");
          setInline({
            anchor: {},
            x: bounds.left + bounds.width / 2,
            y: bounds.bottom,
          });
        }}
      >
        Add chapter note
      </button>
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
                setMessage("");
                setInlineColor("yellow");
                setInline({ ...selection });
                window.getSelection()?.removeAllRanges();
                setSelection(null);
              }}
            >
              Add note
            </button>
          </div>,
          document.body,
        )}
      {inline &&
        createPortal(
          <div
            className="inline-annotation-editor"
            ref={editorRef}
            role="dialog"
            aria-label={
              inline.row ? "Edit highlight" : "Add note to selected text"
            }
            style={{
              left:
                "clamp(min(11rem, 50vw), " +
                inline.x +
                "px, max(calc(100vw - 11rem), 50vw))",
              top: Math.max(
                76,
                Math.min(inline.y + 12, window.innerHeight - 370),
              ),
            }}
          >
            <form
              className="stack-form"
              key={inline.row?.id ?? "new"}
              onSubmit={(event) => {
                event.preventDefault();
                const form = new FormData(event.currentTarget);
                const body = String(form.get("body") ?? "");
                const operation =
                  (event.nativeEvent as SubmitEvent).submitter?.getAttribute(
                    "value",
                  ) ?? "edit";
                const latest =
                  inline.row &&
                  rows?.find((item) => item.id === inline.row?.id);
                if (inline.row && latest?.version !== inline.row.version) {
                  setMessage(
                    "This highlight changed. Close the editor and open it again.",
                  );
                  return;
                }
                void mutate(
                  inline.row
                    ? {
                        operation,
                        id: inline.row.id,
                        version: inline.row.version,
                        body,
                        color: inlineColor,
                      }
                    : {
                        operation: "save",
                        path,
                        blob,
                        heading: String(form.get("heading") ?? ""),
                        range: inline.anchor.quote ? inline.anchor : null,
                        body,
                        color: inline.anchor.quote ? inlineColor : undefined,
                      },
                  inline.row || !inline.anchor.quote
                    ? undefined
                    : (inline.anchor as TextAnchor),
                  true,
                );
              }}
            >
              <strong>{inline.row ? "Edit highlight" : "Add note"}</strong>
              {inline.anchor.quote && (
                <blockquote>{inline.anchor.quote}</blockquote>
              )}
              {inline.anchor.quote && (
                <div
                  className="button-row"
                  role="group"
                  aria-label="Highlight color"
                >
                  {highlightColors.map((entry) => (
                    <button
                      type="button"
                      key={entry}
                      className="highlight-swatch"
                      data-color={entry}
                      aria-label={entry}
                      aria-pressed={inlineColor === entry}
                      onClick={() => setInlineColor(entry)}
                    />
                  ))}
                </div>
              )}
              {!inline.anchor.quote && (
                <label>
                  Location
                  <select name="heading">
                    <option value="">Chapter or part</option>
                    {headings.map((heading) => (
                      <option key={heading.id} value={heading.id}>
                        {heading.title}
                      </option>
                    ))}
                  </select>
                </label>
              )}
              <label>
                Note
                <textarea
                  name="body"
                  defaultValue={inline.row?.body ?? ""}
                  maxLength={8000}
                  rows={3}
                  required={!inline.row}
                />
              </label>
              {message && <p role="status">{message}</p>}
              <div className="button-row">
                <button className="button primary" disabled={busy}>
                  {busy ? "Saving…" : "Save"}
                </button>
                <button
                  className="button"
                  type="button"
                  disabled={busy}
                  onClick={() => setInline(null)}
                >
                  Cancel
                </button>
                {inline.row && (
                  <button className="button" value="delete" disabled={busy}>
                    Remove
                  </button>
                )}
              </div>
            </form>
          </div>,
          document.body,
        )}
      {message &&
        !inline &&
        createPortal(
          <p className="annotation-status" role="status">
            {message}
            <button
              type="button"
              aria-label="Dismiss message"
              onClick={() => setMessage("")}
            >
              ×
            </button>
          </p>,
          document.body,
        )}
    </>
  );
}
