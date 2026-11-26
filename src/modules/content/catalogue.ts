import "server-only";
import data from "../../../.generated/content.json";
import type { Catalogue } from "./types";
export const catalogue = data as Catalogue;
export function getDocument(path: string) {
  return catalogue.documents.find((d) => d.path === path);
}
export function getPaper(id: string) {
  return catalogue.papers.find((p) => p.id === id);
}
