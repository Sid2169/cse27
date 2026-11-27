export function writtenChoice(paper: string, mode: string) {
  if (mode === "full" && paper === "Mains-Essay") return "essay" as const;
  return null;
}

export type WrittenChoice = NonNullable<ReturnType<typeof writtenChoice>>;
export const choiceField = "__choices";

export function readChoices(value: unknown) {
  return typeof value === "string" && /^(?:[0-7](?:,[0-7])*)?$/.test(value)
    ? value.split(",").filter(Boolean).map(Number)
    : [];
}

export function validateChoices(
  input: unknown,
  rule: WrittenChoice,
  final: boolean,
) {
  if (
    !Array.isArray(input) ||
    input.some(
      (value) => !Number.isSafeInteger(value) || value < 0 || value > 7,
    ) ||
    new Set(input).size !== input.length
  )
    return null;
  const choices = (input as number[]).toSorted((a, b) => a - b);
  if (rule === "essay") {
    const a = choices.filter((value) => value < 4).length;
    const b = choices.length - a;
    if (a > 1 || b > 1 || (final && (a !== 1 || b !== 1))) return null;
  }
  return choices;
}
