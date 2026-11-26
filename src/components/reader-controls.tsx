"use client";
import { useEffect, useState } from "react";
export function ReaderControls() {
  const [size, setSize] = useState(19);
  useEffect(() => {
    const sync = (event: Event) =>
      setSize((event as CustomEvent<number>).detail);
    const stored = parseInt(
      document.documentElement.style.getPropertyValue("--reader-size"),
      10,
    );
    const frame = requestAnimationFrame(() => {
      if (stored >= 16 && stored <= 28) setSize(stored);
    });
    window.addEventListener("reader-text-size", sync);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("reader-text-size", sync);
    };
  }, []);
  return (
    <div className="reader-controls" aria-label="Reader text size">
      <button
        aria-label="Decrease text size"
        disabled={size <= 16}
        onClick={() => {
          setSize(size - 1);
          document.documentElement.style.setProperty(
            "--reader-size",
            `${size - 1}px`,
          );
        }}
      >
        A−
      </button>
      <span>{size}px</span>
      <button
        aria-label="Increase text size"
        disabled={size >= 28}
        onClick={() => {
          setSize(size + 1);
          document.documentElement.style.setProperty(
            "--reader-size",
            `${size + 1}px`,
          );
        }}
      >
        A+
      </button>
      <button onClick={() => window.print()}>Print</button>
    </div>
  );
}
