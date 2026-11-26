import { posix } from "node:path";
import assets from "../../.generated/chapter-assets.json";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeSlug from "rehype-slug";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import { catalogue } from "@/modules/content/catalogue";
import { resolveLearningLink } from "@/modules/content/links";
const allowed = new Set(catalogue.documents.map((d) => d.path));
export function Markdown({ source, path }: { source: string; path: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[
        rehypeRaw,
        [rehypeSanitize, { ...defaultSchema, clobberPrefix: "" }],
        rehypeSlug,
        rehypeKatex,
      ]}
      components={{
        a: ({ href, children }) => {
          const target = resolveLearningLink(path, href ?? "", allowed);
          return target ? (
            <a
              href={target}
              rel={/^https?:/.test(target) ? "noreferrer" : undefined}
            >
              {children}
            </a>
          ) : (
            <span title="Reference is available in the source repository">
              {children}
            </span>
          );
        },
        img: ({ alt, src }) => {
          let asset: string | undefined;
          if (typeof src === "string") {
            try {
              const resolved = posix.join(
                posix.dirname(path),
                decodeURIComponent(src),
              );
              if (assets.includes(resolved))
                asset =
                  "/chapter-assets/" +
                  resolved.split("/").map(encodeURIComponent).join("/");
            } catch {
              // Malformed image references keep the text alternative.
            }
          }
          return asset ? (
            // Chapter diagrams have varying dimensions and are shipped as static assets.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className="chapter-image"
              src={asset}
              alt={alt ?? ""}
              loading="lazy"
              decoding="async"
            />
          ) : (
            <span className="notice">
              Figure: {alt || "See the linked source for this figure."}
            </span>
          );
        },
      }}
    >
      {source}
    </ReactMarkdown>
  );
}
