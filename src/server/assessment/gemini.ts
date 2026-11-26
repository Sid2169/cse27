import "server-only";

export class GenerationUnavailable extends Error {
  constructor(
    readonly reason:
      "configuration" | "quota" | "upstream" | "invalid-response",
  ) {
    super("Assessment generation is unavailable: " + reason);
  }
}

export function geminiGenerator(model: string | undefined) {
  const key = process.env.GEMINI_API_KEY;
  if (!key || !model || !/^gemini-[a-z0-9.-]+$/.test(model)) {
    throw new GenerationUnavailable("configuration");
  }

  return async function generate(
    prompt: string,
    schema: object,
  ): Promise<unknown> {
    let response: Response;
    try {
      response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
        {
          method: "POST",
          signal: AbortSignal.timeout(45_000),
          cache: "no-store",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": key!,
          },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: {
              responseMimeType: "application/json",
              responseJsonSchema: schema,
            },
          }),
        },
      );
    } catch {
      throw new GenerationUnavailable("upstream");
    }
    if (response.status === 429) throw new GenerationUnavailable("quota");
    if (!response.ok) throw new GenerationUnavailable("upstream");

    try {
      const data = await response.json();
      const candidate = data.candidates?.[0];
      if (candidate?.finishReason !== "STOP")
        throw new Error("Incomplete candidate");
      const parts: unknown = candidate.content?.parts;
      if (!Array.isArray(parts)) throw new Error("Missing candidate");
      return JSON.parse(
        parts
          .filter((part) => part.thought !== true)
          .map((part) => part.text ?? "")
          .join(""),
      );
    } catch {
      throw new GenerationUnavailable("invalid-response");
    }
  };
}
