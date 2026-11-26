export type TextAnchor = {
  quote: string;
  prefix: string;
  suffix: string;
};

export function resolveTextAnchor(
  text: string,
  anchor: TextAnchor,
): number | null {
  if (!anchor.quote) return null;
  let match = -1;
  let start = text.indexOf(anchor.quote);
  while (start !== -1) {
    const before = text.slice(Math.max(0, start - anchor.prefix.length), start);
    const after = text.slice(
      start + anchor.quote.length,
      start + anchor.quote.length + anchor.suffix.length,
    );
    if (before === anchor.prefix && after === anchor.suffix) {
      if (match !== -1) return null;
      match = start;
    }
    start = text.indexOf(anchor.quote, start + 1);
  }
  return match === -1 ? null : match;
}
