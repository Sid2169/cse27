export const officialPaperIndex =
  "https://www.upsc.gov.in/exam-documents/question-papers/";
export const officialPaperArchive =
  "https://www.upsc.gov.in/archived-exam-documents/question-papers/";

const verified2026: Record<string, string> = {
  "Prelims-General-Studies-I":
    "https://www.upsc.gov.in/uploads/2026/07/QP_CSP_2026_GENERAL_STUDIES_PAPER-I_25052026.pdf",
  "Prelims-CSAT":
    "https://upsc.gov.in/uploads/2026/07/QP_CSP_2026_GENERAL_STUDIES_PAPER-II_25052026.pdf",
};

export function officialBooklet(paper: string, year: number) {
  if (year === 2024 && paper === "Prelims-General-Studies-I")
    return "https://www.upsc.gov.in/uploads/2026/07/general-studies-paper-i-4-1.pdf";
  if (year === 2024 && paper === "Prelims-CSAT")
    return "https://www.upsc.gov.in/uploads/2026/07/general-studies-paper-ii-4-1.pdf";
  return year === 2026 ? (verified2026[paper] ?? null) : null;
}

export function transcriptionNotes(markdown: string) {
  const metadata = markdown.split(/\n## /, 1)[0];
  return metadata.split("\n").flatMap((line) => {
    const note =
      /^\s*(?:>\s*)?-?\s*\*\*(?:Questions extracted|Verification|Status|Coverage):?\*\*:?\s*(.+)$/.exec(
        line,
      );
    if (!note) return [];
    return [
      note[1]
        .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
        .replace(/\x60/g, "")
        .trim(),
    ];
  });
}
