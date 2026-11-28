"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import {
  answerLengthLimit,
  type Extraction,
  type SimulationAnswers,
  type SimulationStatus,
} from "@/modules/assessment/chapter-simulation";

import {
  choiceField,
  readChoices,
  choiceGroup,
  compulsoryQuestion,
  includesQuestion,
  type WrittenChoice,
} from "@/modules/assessment/written-choices";

type Question = {
  label?: string;
  stem: ReactNode;
  options?: string[];
  marks?: number;
  wordLimit?: number;
};
type State = {
  status: SimulationStatus;
  version: number;
  answers: SimulationAnswers;
  remainingMs: number | null;
  leaseMs: number;
  held: boolean;
  error?: string;
  fileName?: string;
};
type Action =
  "start" | "pulse" | "save" | "submit" | "attach" | "detach" | "confirm";

const messages: Record<string, string> = {
  "invalid-choices":
    "Complete the required question selections before submitting.",
  conflict:
    "The saved answers changed in another tab. Reload saved answers before continuing.",
  "other-tab":
    "Another tab currently holds the timer. Return to that tab or wait for its connection to expire.",
  "file-size": "Choose a file smaller than 2 MB.",
  "file-type": "Choose a PDF, JPEG or PNG.",
  "upload-failed": "The upload failed. Try again.",
  "clarification-needed":
    "Confirm readable text for each uploaded or flagged answer before submitting.",
  closed: "This attempt is no longer accepting changes.",
  unavailable:
    "The server could not save the change. Your edits remain on this page.",
};

function formatTime(ms: number) {
  const seconds = Math.ceil(ms / 1000);
  return Math.floor(seconds / 60) + ":" + String(seconds % 60).padStart(2, "0");
}

export function Attempt({
  id,
  initialStatus,
  initialVersion,
  initialAnswers,
  remainingMs,
  objective,
  choice,
  questions,
  files,
  extracted,
  clarification,
}: {
  id: string;
  initialStatus: "ready" | "active" | "review";
  initialVersion: number;
  initialAnswers: SimulationAnswers;
  remainingMs: number | null;
  objective: boolean;
  choice?: WrittenChoice;
  questions: Question[];
  files: Record<string, string>;
  extracted: Record<string, Extraction>;
  clarification: { question: number; request: string } | null;
}) {
  const router = useRouter();
  const editingReview = initialStatus === "review";
  const [answers, setAnswers] = useState(() => {
    if (!editingReview || clarification) return initialAnswers;
    return {
      ...initialAnswers,
      ...Object.fromEntries(
        Object.entries(extracted).map(([key, value]) => [
          key,
          [initialAnswers[key], value.transcript].filter(Boolean).join("\n\n"),
        ]),
      ),
    };
  });
  const entries = useRef(answers);
  const [fileNames, setFileNames] = useState(files);
  const version = useRef(initialVersion);
  const tab = useRef<string | null>(null);
  const sending = useRef<Promise<void> | null>(null);
  const dirty = useRef(false);
  const outOfDate = useRef(false);
  const closed = useRef(false);
  const sync = useRef({ at: 0, remaining: remainingMs ?? 0, lease: 0 });
  const [pending, setPending] = useState<Action | null>(null);
  const [status, setStatus] = useState("");
  const [conflict, setConflict] = useState(false);
  const [held, setHeld] = useState(false);
  const [paused, setPaused] = useState(false);
  const [time, setTime] = useState(remainingMs ?? 0);

  const send = useCallback(
    async (action: Action, question?: string, file?: File) => {
      while (sending.current) {
        if (action === "pulse" || action === "save") return;
        await sending.current;
      }
      if (closed.current || (outOfDate.current && action !== "pulse")) return;
      let finish: () => void = () => {};
      sending.current = new Promise<void>((resolve) => {
        finish = resolve;
      });
      const snapshot = entries.current;
      const body = {
        action,
        question,
        version: version.current,
        tab: (tab.current ??= crypto.randomUUID()),
        timezone:
          action === "start"
            ? Intl.DateTimeFormat().resolvedOptions().timeZone
            : undefined,
        answers: ["save", "submit", "confirm"].includes(action)
          ? Object.fromEntries(
              Object.entries(snapshot).filter(([key]) => key !== choiceField),
            )
          : undefined,
        choices: choice ? readChoices(snapshot[choiceField]) : undefined,
      };
      let payload: BodyInit = JSON.stringify(body);
      if (file) {
        const form = new FormData();
        form.set("input", String(payload));
        form.set("file", file);
        payload = form;
      }
      if (action !== "pulse") setPending(action);
      try {
        const result = await fetch("/api/simulations/" + id, {
          method: "POST",
          headers: file ? undefined : { "Content-Type": "application/json" },
          body: payload,
          signal: AbortSignal.timeout(20_000),
        });
        if (result.redirected) {
          router.replace("/login");
          return;
        }
        const state = (await result.json()) as State;
        if (
          state.error === "conflict" ||
          (action === "pulse" &&
            state.status &&
            state.version !== version.current &&
            dirty.current)
        ) {
          outOfDate.current = true;
          setConflict(true);
        }
        if (state.error) {
          setStatus(
            messages[state.error] ??
              "The change could not be saved. Try again.",
          );
          if (action === "save") dirty.current = true;
        }
        if (!result.ok || !state.status) return;
        if (state.remainingMs !== null) {
          sync.current = {
            at: performance.now(),
            lease: state.leaseMs,
            remaining: state.remainingMs,
          };
          setTime(state.remainingMs);
        }
        setHeld(state.held);
        if (state.status !== initialStatus) {
          closed.current = true;
          router.refresh();
          return;
        }
        if (state.error || outOfDate.current) return;
        version.current = state.version;
        if (action === "save" && entries.current === snapshot) {
          dirty.current = false;
          setStatus("Answers saved.");
        }
        if (action === "pulse" && !dirty.current && !editingReview) {
          entries.current = state.answers;
          setAnswers(state.answers);
          setStatus("");
        }
        if (action === "attach" && question && state.fileName) {
          setFileNames((current) => ({
            ...current,
            [question]: state.fileName!,
          }));
          setStatus("File saved.");
        }
        if (action === "detach" && question) {
          setFileNames((current) =>
            Object.fromEntries(
              Object.entries(current).filter(([key]) => key !== question),
            ),
          );
          setStatus("File removed.");
        }
      } catch {
        setStatus(
          "Connection lost. Saved answers will be available when you reconnect.",
        );
      } finally {
        sending.current = null;
        finish();
        if (!closed.current) setPending(null);
      }
    },
    [id, initialStatus, editingReview, router, choice],
  );

  useEffect(() => {
    if (initialStatus !== "active") return;
    const tick = window.setInterval(
      () => {
        if (dirty.current && !outOfDate.current) void send("save");
        else if (objective) void send("pulse");
      },
      objective ? 4000 : 1600,
    );
    const reconnect = () => void send(objective ? "pulse" : "save");
    const initial = objective ? window.setTimeout(reconnect, 0) : undefined;
    window.addEventListener("online", reconnect);
    return () => {
      window.clearTimeout(initial);
      window.clearInterval(tick);
      window.removeEventListener("online", reconnect);
    };
  }, [initialStatus, objective, send]);

  useEffect(() => {
    if (!objective || initialStatus !== "active") return;
    const tick = window.setInterval(() => {
      const snapshot = sync.current;
      const elapsed = performance.now() - snapshot.at;
      const next = Math.max(
        0,
        snapshot.remaining - Math.min(snapshot.lease, elapsed),
      );
      setTime((previous) =>
        Math.ceil(previous / 1000) === Math.ceil(next / 1000) ? previous : next,
      );
      setPaused(snapshot.lease > 0 && elapsed >= snapshot.lease && next > 0);
    }, 200);
    return () => window.clearInterval(tick);
  }, [initialStatus, objective]);

  function change(index: number, value: string | number | null) {
    const next = { ...entries.current, [index]: value };
    entries.current = next;
    dirty.current = true;
    setAnswers(next);
    if (objective) void send("save");
  }

  if (initialStatus === "ready") {
    return (
      <div className="simulation-actions">
        <button
          type="button"
          className="button primary"
          disabled={!!pending}
          onClick={() => void send("start")}
        >
          {pending ? "Opening exam…" : "Start exam"}
        </button>
        <p role="status">{status}</p>
      </div>
    );
  }

  const selected = choice ? readChoices(answers[choiceField]) : null;
  const chosen = (index: number) =>
    !choice || !selected || includesQuestion(choice, selected, index);
  function choose(index: number) {
    if (!choice) return;
    const current = readChoices(entries.current[choiceField]);
    const next =
      choice === "mathematics"
        ? current.includes(index)
          ? current.filter((item) => item !== index)
          : [...current, index]
        : [
            ...current.filter(
              (item) =>
                choiceGroup(choice, item) !== choiceGroup(choice, index),
            ),
            index,
          ];
    const nextAnswers = { ...entries.current, [choiceField]: next.join(",") };
    entries.current = nextAnswers;
    dirty.current = true;
    setAnswers(nextAnswers);
  }

  const frozen = !!pending && pending !== "save";
  const disabled = held || conflict || frozen;
  const answered = Object.entries(answers)
    .filter(([key]) => key !== choiceField && chosen(Number(key)))
    .map(([, value]) => value)
    .filter(
      (value) =>
        typeof value === "number" ||
        (typeof value === "string" && value.trim()),
    ).length;
  return (
    <form
      className="stack-form simulation-attempt"
      onSubmit={(event) => {
        event.preventDefault();
        void send(editingReview ? "confirm" : "submit");
      }}
    >
      {objective && (
        <div
          className="simulation-timer"
          role="timer"
          aria-label="Time remaining"
        >
          <strong>{formatTime(time)}</strong>
          <span>
            {held
              ? "Timer held in another tab"
              : paused
                ? "Timer paused"
                : "Time remaining"}
          </span>
        </div>
      )}
      {editingReview && (
        <div className="notice">
          <p>
            Check the text against the original files, correct unclear passages,
            and confirm the answers to be marked.
          </p>
          {clarification && (
            <p role="alert">
              Question {clarification.question + 1}. {clarification.request}
            </p>
          )}
        </div>
      )}
      {choice && (
        <p>
          {choice === "essay"
            ? "Choose one topic from Section A and one from Section B."
            : choice === "single-essay"
              ? "Choose one essay topic."
              : choice === "mathematics"
                ? "Answer Questions 1 and 5. Choose three other questions, including at least one from each section."
                : "Choose one essay topic. Answer the remaining questions."}
        </p>
      )}
      {questions.map((question, index) => (
        <fieldset
          className="study-card simulation-question"
          key={index}
          disabled={disabled}
        >
          <legend>
            {question.label ?? "Question " + (index + 1)}
            {question.marks ? ` · ${question.marks} marks` : ""}
          </legend>
          {question.stem}
          {choice &&
            selected &&
            !compulsoryQuestion(choice, index) &&
            !editingReview && (
              <label>
                <input
                  type={choice === "mathematics" ? "checkbox" : "radio"}
                  disabled={
                    choice === "mathematics" &&
                    selected.length === 3 &&
                    !selected.includes(index)
                  }
                  name={"question-choice-" + choiceGroup(choice, index)}
                  checked={selected.includes(index)}
                  onChange={() => choose(index)}
                />{" "}
                {choice === "mathematics"
                  ? "Choose this question"
                  : "Choose this topic"}
              </label>
            )}
          {question.options ? (
            <div className="simulation-options">
              {question.options.map((option, value) => (
                <label key={value}>
                  <input
                    type="radio"
                    name={"q" + index}
                    checked={answers[index] === value}
                    onChange={() => change(index, value)}
                  />
                  <span>{option}</span>
                </label>
              ))}
              <button
                type="button"
                className="button"
                disabled={answers[index] == null}
                onClick={() => change(index, null)}
              >
                Clear answer
              </button>
            </div>
          ) : (
            chosen(index) && (
              <>
                {question.wordLimit ? (
                  <p className="footnote">
                    Suggested limit {question.wordLimit} words
                  </p>
                ) : null}
                {extracted[index]?.needsClarification && (
                  <p role="alert">
                    Check the unclear passages against the original answer.
                  </p>
                )}
                <label className="simulation-answer">
                  <span>
                    {editingReview ? "Answer to mark" : "Your answer"}
                  </span>
                  <textarea
                    value={String(answers[index] ?? "")}
                    rows={7}
                    maxLength={answerLengthLimit}
                    onChange={(event) =>
                      change(index, event.currentTarget.value)
                    }
                  />
                </label>
                <div className="simulation-actions">
                  {fileNames[index] && (
                    <>
                      <a href={"/api/simulations/" + id + "?file=" + index}>
                        Download {fileNames[index]}
                      </a>
                      {!editingReview && (
                        <button
                          type="button"
                          className="button"
                          onClick={() => void send("detach", String(index))}
                        >
                          Remove file
                        </button>
                      )}
                    </>
                  )}
                  {!editingReview && (
                    <label className="simulation-answer">
                      <span>
                        {fileNames[index]
                          ? "Replace answer file"
                          : "Attach PDF or photo"}{" "}
                        (up to 2 MB)
                      </span>
                      <input
                        type="file"
                        accept="application/pdf,image/jpeg,image/png"
                        onChange={(event) => {
                          const file = event.currentTarget.files?.[0];
                          if (file) void send("attach", String(index), file);
                          event.currentTarget.value = "";
                        }}
                      />
                    </label>
                  )}
                </div>
              </>
            )
          )}
        </fieldset>
      ))}
      <div className="simulation-actions">
        <button
          type="submit"
          className="button primary"
          disabled={disabled || !!pending}
        >
          {pending === "submit" || pending === "confirm"
            ? "Submitting…"
            : editingReview
              ? "Confirm and send for marking"
              : "Submit exam"}
        </button>
        <span>
          {answered} of{" "}
          {choice === "essay"
            ? 2
            : choice === "single-essay"
              ? 1
              : choice === "language"
                ? questions.length - 3
                : choice === "mathematics"
                  ? 5
                  : questions.length}{" "}
          answered
        </span>
        {conflict && (
          <button
            type="button"
            className="button"
            onClick={() => location.reload()}
          >
            Reload saved answers
          </button>
        )}
      </div>
      <p role="status">
        {pending === "save"
          ? "Saving answers…"
          : pending === "attach"
            ? "Uploading…"
            : status}
      </p>
    </form>
  );
}
