import { officialBookletPaths } from "./official-booklets";

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

export function officialBooklet(paper: string, year: number, variant = "") {
  if (year === 2023 && paper === "Prelims-General-Studies-I")
    return "https://www.upsc.gov.in/uploads/2026/07/general-studies-paper-i-6-1.pdf";
  if (year === 2023 && paper === "Prelims-CSAT")
    return "https://www.upsc.gov.in/uploads/2026/07/general-studies-paper-ii-6-1.pdf";
  if (year === 2024 && paper === "Mains-Indian-Language")
    return "https://upsc.gov.in/uploads/2026/07/hindi-compulsory-1-1.pdf";
  if (year === 2024 && paper === "Mains-English")
    return "https://upsc.gov.in/uploads/2026/07/english-compulsory-1-1.pdf";
  if (year === 2026 && paper === "Mains-Indian-Language")
    return "https://www.upsc.gov.in/uploads/2026/09/QP-CSM-26-010926-Compulsory-HINDI.pdf";
  if (year === 2026 && paper === "Mains-English")
    return "https://www.upsc.gov.in/uploads/2026/09/QP-CSM-26-010926-Compulsory-ENGLISH.pdf";
  if (year === 2026) {
    const suffix = /^(Mains-General-Studies)-(I|II|III|IV)$/.exec(paper)?.[2];
    const file = suffix
      ? "GENERAL-STUDIES-PAPER-" + suffix
      : paper === "Mains-Essay"
        ? "ESSAY"
        : paper === "Mains-Mathematics" && ["I", "II"].includes(variant)
          ? "Optional-MATHEMATICS-PAPER_" + variant
          : null;
    if (file)
      return (
        "https://upsc.gov.in/uploads/2026/09/QP-CSM-26-010926-" +
        file +
        "-1.pdf"
      );
  }
  if (year === 2025 && paper === "Prelims-General-Studies-I")
    return "https://www.upsc.gov.in/uploads/2026/07/QP-CSP-25-GENERAL-STUDIES-PAPER-I-26052025.pdf";
  if (year === 2025 && paper === "Prelims-CSAT")
    return "https://www.upsc.gov.in/uploads/2026/07/QP-CSP-25-GENERAL-STUDIES-PAPER-II-26052025-1.pdf";
  if (year === 2024 && paper === "Prelims-General-Studies-I")
    return "https://www.upsc.gov.in/uploads/2026/07/general-studies-paper-i-4-1.pdf";
  if (year === 2024 && paper === "Prelims-CSAT")
    return "https://www.upsc.gov.in/uploads/2026/07/general-studies-paper-ii-4-1.pdf";
  if (year === 2026 && verified2026[paper]) return verified2026[paper];
  const key = paper === "Mains-Mathematics" ? paper + "-" + variant : paper;
  const path = officialBookletPaths[year]?.[key];
  return path ? "https://www.upsc.gov.in" + path : null;
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
