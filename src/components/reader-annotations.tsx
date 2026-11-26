"use client";

import { useEffect, useState } from "react";
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
  anchor: BookmarkAnchor & Partial<TextAnchor>;
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
  const [rows, setRows] = useState<Annotation[] | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [quote, setQuote] = useState<TextAnchor | null>(null);
  const [body, setBody] = useState("");
  const [heading, setHeading] = useState("");
  const [resolved, setResolved] = useState<string[]>([]);

  async function loadRows() {
    const response = await fetch(
      "/api/reader/annotations?" + new URLSearchParams({ path }),
      { cache: "no-store" },
    );
    if (response.redirected) {
      router.push("/login");
      return;
    }
    if (!response.ok) throw new Error("Could not load annotations.");
    setRows(await response.json());
  }

  useEffect(() => {
    const root = document.getElementById("reader-content");
    if (!root || !rows) return;
    const matched: string[] = [];
    const ranges: Range[] = [];
    for (const row of rows) {
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
          ranges.push(range);
        }
      }
    }
    const frame = requestAnimationFrame(() => setResolved(matched));
    if (typeof Highlight !== "undefined" && CSS.highlights)
      CSS.highlights.set("cse27-annotations", new Highlight(...ranges));
    return () => {
      cancelAnimationFrame(frame);
      if (typeof Highlight !== "undefined" && CSS.highlights)
        CSS.highlights.delete("cse27-annotations");
    };
  }, [path, blob, headings, rows]);

  function captureSelection() {
    const root = document.getElementById("reader-content");
    const selection = window.getSelection();
    if (!root || !selection?.rangeCount || selection.isCollapsed) return;
    const selected = selection.getRangeAt(0);
    if (
      !root.contains(selected.startContainer) ||
      !root.contains(selected.endContainer)
    )
      return;
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
      setMessage("Select up to 2,000 characters in the chapter.");
      return;
    }
    setQuote({
      quote: excerpt,
      prefix: text.slice(Math.max(0, offset - 80), offset),
      suffix: text.slice(offset + excerpt.length, offset + excerpt.length + 80),
    });
    setMessage("");
  }

  async function mutate(input: Record<string, unknown>) {
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
        setBody("");
        setQuote(null);
      }
      await loadRows();
      setMessage("Changes saved.");
    } catch {
      setMessage("Could not save changes.");
    } finally {
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
        <button
          className="button"
          onPointerDown={(event) => event.preventDefault()}
          onClick={captureSelection}
        >
          Use selected text
        </button>
      </div>
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
              body,
            });
          }}
        >
          <h2>{quote ? "Save highlight" : "Add a note"}</h2>
          {quote ? (
            <blockquote>{quote.quote}</blockquote>
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
              value={body}
              onChange={(event) => setBody(event.target.value)}
              maxLength={8000}
              required={!quote}
              rows={3}
            />
          </label>
          <div className="button-row">
            <button className="button primary" disabled={busy}>
              {quote ? "Save highlight" : "Save note"}
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
