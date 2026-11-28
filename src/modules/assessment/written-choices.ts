export function writtenChoice(paper: string, mode: string) {
  if (mode !== "full" && mode !== "pyq") return null;
  if (paper === "Mains-Mathematics") return "mathematics" as const;
  if (paper === "Mains-Essay") return "essay" as const;
  if (paper === "Mains-English" || paper === "Mains-Indian-Language")
    return "language" as const;
  return null;
}

export type WrittenChoice = NonNullable<ReturnType<typeof writtenChoice>>;
export function compulsoryQuestion(rule: WrittenChoice, index: number) {
  if (rule === "mathematics") return index === 0 || index === 4;
  return rule === "language" && index >= 4;
}

export function choiceGroup(rule: WrittenChoice, index: number) {
  return rule === "essay" ? Math.floor(index / 4) : 0;
}

export function includesQuestion(
  rule: WrittenChoice,
  choices: number[],
  index: number,
) {
  return compulsoryQuestion(rule, index) || choices.includes(index);
}

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
  if (rule === "mathematics") {
    const a = choices.filter((index) => index < 4).length;
    const b = choices.length - a;
    if (
      choices.some((index) => compulsoryQuestion(rule, index)) ||
      choices.length > 3 ||
      (final && (choices.length !== 3 || a === 0 || b === 0))
    )
      return null;
  }
  if (rule === "essay") {
    const a = choices.filter((value) => value < 4).length;
    const b = choices.length - a;
    if (a > 1 || b > 1 || (final && (a !== 1 || b !== 1))) return null;
  }
  if (
    rule === "language" &&
    (choices.some((index) => index >= 4) ||
      choices.length > 1 ||
      (final && choices.length !== 1))
  )
    return null;
  return choices;
}
