export const highlightColors = ["yellow", "green", "blue", "pink"] as const;
export type HighlightColor = (typeof highlightColors)[number];

export function isHighlightColor(value: unknown): value is HighlightColor {
  return highlightColors.some((color) => color === value);
}
