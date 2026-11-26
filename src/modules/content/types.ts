export type Section = {
  id: string;
  title: string;
  level: number;
  text: string;
};
export type Document = {
  path: string;
  title: string;
  markdown: string;
  ready: boolean;
  kind: "chapter" | "curriculum" | "syllabus";
  chapter: string | null;
  revision: string;
  sections: Section[];
};
export type Phase = {
  id: string;
  title: string;
  description: string;
  chapters: string[];
};
export type Paper = {
  id: string;
  title: string;
  stage: "Prelims" | "Mains";
  curriculum: string;
  syllabus: string;
  phases: Phase[];
  chapters: string[];
};
export type Catalogue = {
  commit: string;
  papers: Paper[];
  documents: Document[];
};
export function documentUrl(path: string) {
  return "/learn/" + path.replace(/\.md$/, "");
}
