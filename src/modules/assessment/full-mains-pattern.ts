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

type WrittenBatchPattern = {
  labels: string[];
  marks: number;
  words: number;
  design: string;
  topic?: string;
};

function qualifyingPattern(hindi: boolean): WrittenBatchPattern[] {
  const section = (
    label: string,
    marks: number,
    topic: string,
    design: string,
  ) => ({ labels: [label], marks, words: 0, topic, design });
  return [
    {
      labels: ["1(a)", "1(b)", "1(c)", "1(d)"],
      marks: 100,
      words: 600,
      topic: "Short essay",
      design:
        "Provide four standalone alternative short essay topics at matriculation level. The learner chooses one.",
    },
    section(
      "2 · Comprehension",
      hindi ? 60 : 75,
      "Reading comprehension",
      "Write an original discursive passage and precisely five passage-grounded subquestions. Allocate " +
        (hindi ? 12 : 15) +
        " marks to each and use one guide criterion per subquestion.",
    ),
    section(
      "3 · Précis",
      hindi ? 60 : 75,
      "Précis writing",
      "Provide an original discursive passage of around 600–700 words followed by the instruction to summarize it in about one third of its length using the learner’s own words.",
    ),
    ...(hindi
      ? [
          section(
            "4 · हिंदी से अंग्रेज़ी",
            20,
            "Hindi to English translation",
            "Supply an original Hindi passage of approximately 200 words and request its translation into English. Provide the guide’s reference translation in English.",
          ),
          section(
            "5 · अंग्रेज़ी से हिंदी",
            20,
            "English to Hindi translation",
            "Supply an original English passage of approximately 200 words and request its translation into Hindi. Provide the guide’s reference translation in Hindi.",
          ),
          section(
            "6 · भाषा-प्रयोग",
            40,
            "Hindi usage and vocabulary",
            "Set four groups of five two-mark items each. Groups cover idioms in context, sentence correction, paired synonyms and distinguishing similar words. Allocate one 10-mark criterion per group and supply the answers and per-item allocation in each criterion.",
          ),
        ]
      : [
          section(
            "4 · Usage and vocabulary",
            25,
            "Grammar and contextual vocabulary",
            "Set 10 corrections, five contextual blanks, five verb forms and five antonyms, each worth one mark. Supply exact keys and one criterion per group with per-item scoring.",
          ),
          section(
            "5 · Usage and vocabulary",
            25,
            "Transformations and vocabulary in context",
            "Set 10 directed sentence transformations, five sentences demonstrating specified words, five confusable-word choices and five idioms in context, each worth one mark. Supply examples or keys and one criterion per group with per-item scoring.",
          ),
        ]),
  ];
}

export function mainsGsPattern(paper: string): WrittenBatchPattern[] | null {
  if (paper === "Mains-English" || paper === "Mains-Indian-Language")
    return qualifyingPattern(paper === "Mains-Indian-Language");
  if (paper === "Mains-Essay")
    return ["A", "B"].map((section) => ({
      labels: Array.from(
        { length: 4 },
        (_, index) => "Section " + section + " · Topic " + (index + 1),
      ),
      marks: 125,
      words: 1200,
      design:
        "Offer four distinct essay topics. These are alternatives. Write the topic itself without adding subparts. Provide a guide for each topic that accepts defensible interpretations and credits argument, organization and expression.",
    }));
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
