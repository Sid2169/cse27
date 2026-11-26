import assert from "node:assert/strict";
import { test } from "node:test";
import {
  initialRevisionDate,
  nextRevisionDate,
} from "../src/modules/revisions/schedule";

test("revision intervals use exact score bands and preserve unresolved results", () => {
  const completedOn = "2026-12-01";
  for (const [score, day] of [
    [-40, 2],
    [39.99, 2],
    [40, 3],
    [60, 5],
    [75, 8],
    [90, 15],
    [100, 15],
  ]) {
    assert.equal(
      nextRevisionDate({ completedOn, score }),
      "2026-12-" + String(day).padStart(2, "0"),
    );
  }
  assert.equal(nextRevisionDate({ completedOn, score: null }), null);
});

test("target applies to initial and recurring dates with distinct rules", () => {
  assert.equal(initialRevisionDate("2026-12-31"), "2027-01-01");
  assert.equal(initialRevisionDate("2026-12-01", "2026-12-02"), "2026-12-01");
  assert.equal(initialRevisionDate("2026-12-01", "2026-11-30"), "2026-12-02");
  assert.equal(
    nextRevisionDate({
      completedOn: "2026-12-01",
      score: 100,
      target: "2026-12-02",
    }),
    null,
  );
  assert.equal(
    nextRevisionDate({
      completedOn: "2026-12-01",
      score: 100,
      target: "2026-12-03",
    }),
    "2026-12-02",
  );
  assert.equal(
    nextRevisionDate({
      completedOn: "2026-12-01",
      score: 82,
      target: "2027-03-01",
      material: "conceptual",
      difficulty: "medium",
      priority: "high",
    }),
    "2026-12-10",
  );
});
