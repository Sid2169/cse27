import { posix } from "node:path";
import { documentUrl } from "./types";
export function resolveLearningLink(
  current: string,
  href: string,
  allowed: ReadonlySet<string>,
) {
  if (
    href.startsWith("#") ||
    /^https?:\/\//i.test(href) ||
    /^mailto:/i.test(href)
  )
    return href;
  const [raw, hash] = href.split("#");
  let decoded: string;
  try {
    decoded = decodeURIComponent(raw);
  } catch {
    return null;
  }
  const path = posix.normalize(posix.join(posix.dirname(current), decoded));
  return allowed.has(path)
    ? documentUrl(path) + (hash ? "#" + hash : "")
    : null;
}
