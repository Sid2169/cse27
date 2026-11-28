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

// Verified copies of original UPSC booklets from before the current archive.
const prelimsMirrors: Record<number, Record<string, string>> = {
  2013: {
    "Prelims-General-Studies-I":
      "https://iasexamportal.com/sites/default/files/Download-UPSC-Pre-2013-General-Studies-Paper-I-Booklet-Series-A.pdf",
    "Prelims-CSAT":
      "https://cdn-images.prepp.in/public/image/UPSC_Prelims_CSAT_Paper_II_2013_3677c8f5adecf90821e89d2b6e229ec6.pdf",
  },
  2014: {
    "Prelims-General-Studies-I":
      "https://battleias.com/wp-content/uploads/official-papers/upsc-prelims/upsc-prelims-2014-gs1.pdf",
    "Prelims-CSAT":
      "https://battleias.com/wp-content/uploads/official-papers/upsc-prelims/upsc-prelims-2014-csat.pdf",
  },
  2015: {
    "Prelims-General-Studies-I":
      "https://battleias.com/wp-content/uploads/official-papers/upsc-prelims/upsc-prelims-2015-gs1.pdf",
    "Prelims-CSAT":
      "https://battleias.com/wp-content/uploads/official-papers/upsc-prelims/upsc-prelims-2015-csat.pdf",
  },
};

// Internet Archive captures of UPSC's original Mains PDFs.
const archivedMainsBooklets: Record<number, Record<string, string>> = {
  2013: {
    "Mains-General-Studies-I":
      "https://web.archive.org/web/20131228065811id_/http://www.upsc.gov.in/questionpaper/2013/CSM%202013/GS%20I.pdf",
    "Mains-General-Studies-II":
      "https://web.archive.org/web/20131228065823id_/http://www.upsc.gov.in/questionpaper/2013/CSM%202013/GS%20II.pdf",
    "Mains-General-Studies-III":
      "https://web.archive.org/web/20131228065831id_/http://www.upsc.gov.in/questionpaper/2013/CSM%202013/GS%20III.pdf",
    "Mains-General-Studies-IV":
      "https://web.archive.org/web/20131228072050id_/http://www.upsc.gov.in/questionpaper/2013/CSM%202013/GS%20IV.pdf",
    "Mains-Essay":
      "https://web.archive.org/web/20131228142511id_/http://www.upsc.gov.in/questionpaper/2013/CSM%202013/Essay.pdf",
    "Mains-Mathematics-I":
      "https://web.archive.org/web/20131228142532id_/http://www.upsc.gov.in/questionpaper/2013/CSM%202013/Mathematics%20I.pdf",
    "Mains-Mathematics-II":
      "https://web.archive.org/web/20131228142542id_/http://www.upsc.gov.in/questionpaper/2013/CSM%202013/Mathematics%20II.pdf",
    "Mains-English":
      "https://web.archive.org/web/20131228080154id_/http://www.upsc.gov.in/questionpaper/2013/CSM%202013/English%20(C).pdf",
    "Mains-Indian-Language":
      "https://web.archive.org/web/20131228142521id_/http://www.upsc.gov.in/questionpaper/2013/CSM%202013/Hindi%20(%20C%20).pdf",
  },
  2014: {
    "Mains-General-Studies-I":
      "https://web.archive.org/web/20150121205657id_/http://www.upsc.gov.in/questionpaper/2014/CSM-2014/GENERAL%20STUDIES-I.pdf",
    "Mains-General-Studies-II":
      "https://web.archive.org/web/20150121205703id_/http://www.upsc.gov.in/questionpaper/2014/CSM-2014/GENERAL%20STUDIES-II.pdf",
    "Mains-General-Studies-III":
      "https://web.archive.org/web/20150121205707id_/http://www.upsc.gov.in/questionpaper/2014/CSM-2014/GENERAL%20STUDIES-III.pdf",
    "Mains-General-Studies-IV":
      "https://web.archive.org/web/20150121205713id_/http://www.upsc.gov.in/questionpaper/2014/CSM-2014/GENERAL%20STUDIES-IV.pdf",
    "Mains-Essay":
      "https://web.archive.org/web/20150122002652id_/http://www.upsc.gov.in/questionpaper/2014/CSM-2014/EASSY.pdf",
    "Mains-Mathematics-I":
      "https://web.archive.org/web/20150122211534id_/http://www.upsc.gov.in/questionpaper/2014/CSM-2014/MATHEMATICS-I.pdf",
    "Mains-Mathematics-II":
      "https://web.archive.org/web/20150218104640id_/http://www.upsc.gov.in/questionpaper/2014/CSM-2014/MATHEMATICS-II.pdf",
    "Mains-English":
      "https://web.archive.org/web/20150122002657id_/http://www.upsc.gov.in/questionpaper/2014/CSM-2014/ENGLISH(COMPULSORY).pdf",
    "Mains-Indian-Language":
      "https://web.archive.org/web/20150213070405id_/http://www.upsc.gov.in/questionpaper/2014/CSM-2014/HINDI(COMPULSORY).pdf",
  },
  2015: {
    "Mains-General-Studies-I":
      "https://web.archive.org/web/20160327104343id_/http://www.upsc.gov.in/questionpaper/2015/CS_MAIN_2015/GS-I/GS1.pdf",
    "Mains-General-Studies-II":
      "https://web.archive.org/web/20160327104349id_/http://www.upsc.gov.in/questionpaper/2015/CS_MAIN_2015/GS-II/GS11.pdf",
    "Mains-General-Studies-III":
      "https://web.archive.org/web/20160327104357id_/http://www.upsc.gov.in/questionpaper/2015/CS_MAIN_2015/GS-III/GS111.pdf",
    "Mains-General-Studies-IV":
      "https://web.archive.org/web/20160221213011id_/http://www.upsc.gov.in/questionpaper/2015/CS_MAIN_2015/GS-IV/GS-IV.pdf",
    "Mains-Essay":
      "https://web.archive.org/web/20160327104338id_/http://www.upsc.gov.in/questionpaper/2015/CS_MAIN_2015/ESSAY_COMPl/ESSAY_COMP.pdf",
    "Mains-Mathematics-I":
      "https://web.archive.org/web/20160327162441id_/http://www.upsc.gov.in/questionpaper/2015/CS_MAIN_2015/MATHEMATICS%20-I/MATHEMATICS_I.pdf",
    "Mains-Mathematics-II":
      "https://web.archive.org/web/20160222005159id_/http://www.upsc.gov.in/questionpaper/2015/CS_MAIN_2015/MATHEMATICS%20-II/MATHEMATICS_II.pdf",
    "Mains-English":
      "https://web.archive.org/web/20160327104333id_/http://www.upsc.gov.in/questionpaper/2015/CS_MAIN_2015/ENG_COMPl/ENG_COMP.pdf",
    "Mains-Indian-Language":
      "https://web.archive.org/web/20160222005152id_/http://www.upsc.gov.in/questionpaper/2015/CS_MAIN_2015/HINDI_COMPl/HINDI_COM.pdf",
  },
};

export function officialBooklet(paper: string, year: number, variant = "") {
  const key = paper === "Mains-Mathematics" ? paper + "-" + variant : paper;
  const mirror = prelimsMirrors[year]?.[paper];
  if (mirror) return mirror;
  const archived = archivedMainsBooklets[year]?.[key];
  if (archived) return archived;
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
