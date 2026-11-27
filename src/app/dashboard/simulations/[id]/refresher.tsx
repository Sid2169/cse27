"use client";

import { useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import type {
  SimulationAnswers,
  SimulationQuestion,
} from "@/modules/assessment/chapter-simulation";

type Paper = { token: string; questions: SimulationQuestion[] };

export function Refresher({
  id,
  objective,
  completed,
}: {
  id: string;
  objective: boolean;
  completed: boolean;
}) {
  const [done, setDone] = useState(completed);
  const [paper, setPaper] = useState<Paper | null>(null);
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const inFlight = useRef(false);

  async function send(
    action: "prepare" | "grade",
    answers?: SimulationAnswers,
  ) {
    if (inFlight.current) return;
    inFlight.current = true;
    setPending(true);
    setMessage("");
    try {
      const response = await fetch("/api/simulations/" + id + "/refresher", {
        method: "POST",
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, token: paper?.token, answers }),
      });
      if (response.redirected) {
        setMessage("Sign in again to continue.");
        return;
      }
      const data = await response.json();
      if (!response.ok) {
        setMessage(data.error ?? "Try again.");
        if (response.status === 410) setPaper(null);
      } else if (data.completed) {
        setDone(true);
        setPaper(null);
      } else if (action === "prepare") {
        setPaper({ token: data.token, questions: data.questions });
      } else {
        setMessage(
          "Score " +
            data.earned +
            " / " +
            data.possible +
            ". The checklist is still incomplete.",
        );
        setPaper(null);
      }
    } catch {
      setMessage("The connection was interrupted. Try again.");
    } finally {
      inFlight.current = false;
      setPending(false);
    }
  }

  if (done)
    return (
      <p role="status">
        <strong>Refresher completed</strong>
      </p>
    );
  return (
    <div>
      <p>
        {objective
          ? "Pass with 80% accuracy, including unanswered questions."
          : "Pass with 65% of available marks."}{" "}
        A refresh or navigation away ends the test.
      </p>
      {!objective && (
        <p>
          Written answers are processed by Gemini. Leave out personal or
          sensitive information.
        </p>
      )}
      {!paper ? (
        <button
          type="button"
          className="button primary"
          disabled={pending}
          onClick={() => void send("prepare")}
        >
          {pending ? "Preparing refresher…" : "Mark complete"}
        </button>
      ) : (
        <form
          className="completion-test-form"
          autoComplete="off"
          onSubmit={(event) => {
            event.preventDefault();
            const data = new FormData(event.currentTarget);
            const answers: SimulationAnswers = {};
            paper.questions.forEach((question, index) => {
              const value = data.get(String(index));
              if (typeof value === "string")
                answers[index] = "options" in question ? Number(value) : value;
            });
            void send("grade", answers);
          }}
        >
          {paper.questions.map((question, index) => (
            <div className="completion-question-card" key={index}>
              <fieldset disabled={pending}>
                <legend className="completion-question-title">
                  <span className="completion-question-number">
                    Question {index + 1}
                  </span>
                  {"options" in question
                    ? question.stem
                    : question.marks + " marks"}
                </legend>
                {"options" in question ? (
                  <div className="completion-options">
                    {question.options.map((option, choice) => (
                      <label className="completion-option" key={choice}>
                        <input
                          type="radio"
                          name={String(index)}
                          value={choice}
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <>
                    <div className="prose simulation-stem">
                      <ReactMarkdown
                        remarkPlugins={[remarkMath]}
                        rehypePlugins={[rehypeKatex]}
                        skipHtml
                        components={{ img: () => null }}
                      >
                        {question.stem}
                      </ReactMarkdown>
                    </div>
                    {question.wordLimit > 0 && (
                      <p>Suggested limit {question.wordLimit} words</p>
                    )}
                    <label className="simulation-answer">
                      Your answer
                      <textarea
                        name={String(index)}
                        rows={5}
                        maxLength={20000}
                      />
                    </label>
                  </>
                )}
              </fieldset>
            </div>
          ))}
          <div className="simulation-actions">
            <button type="submit" className="button primary" disabled={pending}>
              {pending ? "Marking refresher…" : "Submit refresher"}
            </button>
            <button
              type="button"
              className="button"
              disabled={pending}
              onClick={() => setPaper(null)}
            >
              End refresher
            </button>
          </div>
        </form>
      )}
      <p role="status">{message}</p>
    </div>
  );
}
