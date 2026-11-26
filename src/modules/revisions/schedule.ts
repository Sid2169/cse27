const dayMs = 86_400_000;

function dateNumber(date: string) {
  const value = Date.parse(date + "T00:00:00Z");
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
    !Number.isFinite(value) ||
    new Date(value).toISOString().slice(0, 10) !== date
  ) {
    throw new RangeError("Expected an ISO calendar date");
  }
  return value / dayMs;
}

function calendarDate(day: number) {
  return new Date(day * dayMs).toISOString().slice(0, 10);
}

const clamp = (min: number, max: number, value: number) =>
  Math.min(max, Math.max(min, value));

const materialMultiplier = {
  factual: 1,
  conceptual: 0.9,
  procedural: 0.85,
  generic: 1,
};
const difficultyMultiplier = { easy: 1.15, medium: 1, hard: 0.8 };
const priorityMultiplier = { high: 0.8, unsure: 1, low: 1.1 };

export function initialRevisionDate(completedOn: string, target?: string) {
  const completed = dateNumber(completedOn);
  const deadline = target ? dateNumber(target) : null;
  return calendarDate(
    deadline !== null && deadline > completed
      ? Math.min(completed + 1, deadline - 1)
      : completed + 1,
  );
}

export function nextRevisionDate(input: {
  completedOn: string;
  score: number | null;
  target?: string;
  material?: keyof typeof materialMultiplier;
  difficulty?: keyof typeof difficultyMultiplier;
  priority?: keyof typeof priorityMultiplier;
}) {
  if (input.score === null) return null;
  if (!Number.isFinite(input.score))
    throw new RangeError("Expected a finite score");
  const score = clamp(0, 100, input.score);
  const completed = dateNumber(input.completedOn);
  const deadline = input.target ? dateNumber(input.target) : null;
  const futureTarget =
    deadline !== null && deadline > completed ? deadline : null;
  if (futureTarget === completed + 1) return null;

  const base =
    score < 40 ? 1 : score < 60 ? 2 : score < 75 ? 4 : score < 90 ? 7 : 14;
  const horizon =
    futureTarget === null
      ? 1
      : clamp(0.75, 2, Math.sqrt((futureTarget - completed) / 30));
  const multiplier = clamp(
    0.5,
    2,
    materialMultiplier[input.material ?? "generic"] *
      difficultyMultiplier[input.difficulty ?? "medium"] *
      priorityMultiplier[input.priority ?? "unsure"] *
      horizon,
  );
  const interval = clamp(1, 60, Math.round(base * multiplier));
  return calendarDate(
    futureTarget === null
      ? completed + interval
      : Math.min(completed + interval, futureTarget - 1),
  );
}
