"use client";
import { useEffect, useState } from "react";
export function ReaderControls({ showPrint = true }: { showPrint?: boolean }) {
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
  function changeSize(next: number) {
    document.documentElement.style.setProperty("--reader-size", next + "px");
    window.dispatchEvent(new CustomEvent("reader-text-size", { detail: next }));
  }
  return (
    <div className="reader-controls" aria-label="Reader text size">
      <button
        aria-label="Decrease text size"
        disabled={size <= 16}
        onClick={() => changeSize(size - 1)}
      >
        A−
      </button>
      <span>{size}px</span>
      <button
        aria-label="Increase text size"
        disabled={size >= 28}
        onClick={() => changeSize(size + 1)}
      >
        A+
      </button>
      {showPrint && <button onClick={() => window.print()}>Print</button>}
    </div>
  );
}
