import { documentUrl, type Document } from "@/modules/content/types";

export type BookmarkAnchor = {
  version: 1;
  path: string;
  heading: string;
  blob: string;
};

export function bookmarkLocation(anchor: BookmarkAnchor, document?: Document) {
  if (!document) return null;
  const url = documentUrl(document.path);
  if (!anchor.heading) return url;
  if (document.revision !== anchor.blob) return null;
  return document.sections.some((section) => section.id === anchor.heading)
    ? url + "#" + encodeURIComponent(anchor.heading)
    : null;
}
