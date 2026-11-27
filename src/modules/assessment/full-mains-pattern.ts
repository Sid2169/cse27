const generalLabels = Array.from(
  { length: 20 },
  (_, i) => "Question " + (i + 1),
);
const ethicsLabels = [
  ...[2, 2, 3, 2, 2, 2].flatMap((count, index) =>
    "abc"
      .slice(0, count)
      .split("")
      .map((part) => "Section A · Question " + (index + 1) + "(" + part + ")"),
  ),
  ...Array.from({ length: 6 }, (_, i) => "Section B · Question " + (i + 7)),
];

export function mainsGsPattern(paper: string) {
  const ethics = paper === "Mains-General-Studies-IV";
  if (!ethics && !/^Mains-General-Studies-(I|II|III)$/.test(paper)) return null;
  const counts = ethics ? [5, 4, 4, 3, 3] : [5, 5, 5, 5];
  const labels = ethics ? ethicsLabels : generalLabels;
  let offset = 0;
  return counts.map((count, index) => {
    const batch = {
      labels: labels.slice(offset, offset + count),
      marks: ethics ? (index < 3 ? 10 : 20) : index < 2 ? 10 : 15,
      words: (ethics ? index < 3 : index < 2) ? 150 : 250,
      design: ethics
        ? index < 3
          ? "Write separate conceptual or applied ethics subparts."
          : "Write full self-contained administrative case studies with coherent subparts and a guide that divides credit across those subparts."
        : "Vary the directives and keep each question focused and independently answerable.",
    };
    offset += count;
    return batch;
  });
}
