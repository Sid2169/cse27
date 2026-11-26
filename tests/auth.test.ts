import { test } from "node:test";
import assert from "node:assert/strict";
import { isOwner, safeNext } from "../src/modules/auth/policy";
test("owner requires a verified email and configured allowlist", () => {
  assert.equal(
    isOwner({ email: "owner@example.com" }, "owner@example.com"),
    false,
  );
  assert.equal(
    isOwner(
      { email: "other@example.com", email_confirmed_at: "x" },
      "owner@example.com",
    ),
    false,
  );
  assert.equal(
    isOwner(
      { email: "OWNER@example.com", email_confirmed_at: "x" },
      "owner@example.com",
    ),
    true,
  );
  assert.equal(
    isOwner({ email: "owner@example.com", email_confirmed_at: "x" }, undefined),
    false,
  );
});
test("redirects reject external, protocol-relative and backslash URLs", () => {
  for (const value of [
    "https://evil.example",
    "//evil.example",
    "/\\evil.example",
    "/\r\nevil",
    "/\t/evil.example",
    "/%2f%2fevil.example",
  ])
    assert.equal(safeNext(value), "/dashboard");
  assert.equal(safeNext("/auth/recovery"), "/auth/recovery");
});
