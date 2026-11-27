import assert from "node:assert/strict";
import { test } from "node:test";
import {
  openRefresher,
  refresherKey,
  sealRefresher,
} from "../src/server/assessment/refresher-envelope";

test("a transient test envelope is confidential and bound to its owner, result and expiry", () => {
  const key = refresherKey("ab".repeat(32))!;
  const binding = { owner: "learner", simulation: "attempt" };
  const now = 1_000;
  const example = { guide: "private guide", correct: 3 };
  const token = sealRefresher(key, binding, example, now);
  assert.equal(
    Buffer.from(token, "base64url").includes("private guide"),
    false,
  );
  assert.deepEqual(openRefresher(key, binding, token, now), example);
  assert.equal(
    openRefresher(key, { ...binding, owner: "other" }, token, now),
    null,
  );
  assert.equal(
    openRefresher(key, { ...binding, simulation: "other" }, token, now),
    null,
  );
  assert.equal(openRefresher(key, binding, token, now + 3600000), null);
  const corrupt = (token[0] === "a" ? "b" : "a") + token.slice(1);
  assert.equal(openRefresher(key, binding, corrupt, now), null);
});
