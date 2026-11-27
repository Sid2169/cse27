import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

type Binding = { owner: string; simulation: string };
const ttl = 60 * 60 * 1000;
const limit = 400_000;

export function refresherKey(value = process.env.REFRESHER_ENVELOPE_KEY) {
  return value && /^[a-f0-9]{64}$/i.test(value)
    ? Buffer.from(value, "hex")
    : null;
}

function context(binding: Binding) {
  return Buffer.from(JSON.stringify([1, binding.owner, binding.simulation]));
}

export function sealRefresher<T>(
  key: Buffer,
  binding: Binding,
  data: T,
  now = Date.now(),
) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  cipher.setAAD(context(binding));
  const content = Buffer.from(JSON.stringify({ expires: now + ttl, data }));
  if (content.length > limit) throw new Error("Refresher is too large");
  const encrypted = Buffer.concat([cipher.update(content), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), encrypted]).toString(
    "base64url",
  );
}

export function openRefresher<T>(
  key: Buffer,
  binding: Binding,
  token: string,
  now = Date.now(),
): T | null {
  if (
    token.length > Math.ceil(((limit + 28) * 4) / 3) ||
    !/^[\w-]+$/.test(token)
  )
    return null;
  try {
    const bytes = Buffer.from(token, "base64url");
    if (bytes.length < 29 || bytes.toString("base64url") !== token) return null;
    const decipher = createDecipheriv(
      "aes-256-gcm",
      key,
      bytes.subarray(0, 12),
    );
    decipher.setAAD(context(binding));
    decipher.setAuthTag(bytes.subarray(12, 28));
    const { expires, data } = JSON.parse(
      Buffer.concat([
        decipher.update(bytes.subarray(28)),
        decipher.final(),
      ]).toString("utf8"),
    );
    return expires > now ? data : null;
  } catch {
    return null;
  }
}
