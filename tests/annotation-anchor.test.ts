import { test } from "node:test";
import assert from "node:assert/strict";
import { resolveTextAnchor } from "../src/modules/reader/annotation-anchor";

test("a highlight follows a uniquely matching quote and surrounding text", () => {
  const anchor = { quote: "same phrase", prefix: "B ", suffix: "." };
  assert.equal(resolveTextAnchor("A same phrase. B same phrase.", anchor), 17);
  assert.equal(
    resolveTextAnchor("B same phrase. B same phrase.", anchor),
    null,
  );
  assert.equal(resolveTextAnchor("B same phrase?", anchor), null);
});
