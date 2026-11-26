"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { highlightColors } from "@/modules/reader/highlight-colors";

export function AnnotationActions({
  id,
  version,
  body,
  color,
}: {
  id: string;
  version: number;
  body: string;
  color?: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <details>
      <summary>Edit or remove</summary>
      <form
        className="stack-form"
        onSubmit={async (event) => {
          event.preventDefault();
          const form = new FormData(event.currentTarget);
          const operation =
            (event.nativeEvent as SubmitEvent).submitter?.getAttribute(
              "value",
            ) ?? "edit";
          setBusy(true);
          setStatus("");
          try {
            const response = await fetch("/api/reader/annotations", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                operation,
                id,
                version,
                body: form.get("body"),
                color: form.get("color") ?? undefined,
              }),
            });
            if (response.redirected) router.push("/login");
            else if (response.ok) router.refresh();
            else if (response.status === 409) {
              setStatus(
                "This entry changed. Refresh the page before editing again.",
              );
            } else setStatus("The change could not be saved.");
          } catch {
            setStatus("The change could not be saved.");
          } finally {
            setBusy(false);
          }
        }}
      >
        {color && (
          <label>
            Color
            <select name="color" defaultValue={color}>
              {highlightColors.map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
        )}
        <label>
          Note
          <textarea name="body" defaultValue={body} maxLength={8000} rows={3} />
        </label>
        <div className="button-row">
          <button className="button" disabled={busy}>
            Save changes
          </button>
          <button className="button" value="delete" disabled={busy}>
            Remove
          </button>
        </div>
        {status && <p role="status">{status}</p>}
      </form>
    </details>
  );
}
