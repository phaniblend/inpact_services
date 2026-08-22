/**
 * If seed is an `export default function Name() { ... }` with an empty body
 * (whitespace / line comments only), inject snippet lines inside the braces.
 */
export function mergeSnippetIntoEmptyReactExportDefaultBody(seed, snippet) {
  if (typeof seed !== "string" || typeof snippet !== "string") return null;
  const trimmedSnippet = snippet.trim();
  if (!trimmedSnippet) return null;

  const idx = seed.indexOf("export default function");
  if (idx < 0) return null;
  const openBrace = seed.indexOf("{", idx);
  if (openBrace < 0) return null;

  let depth = 0;
  for (let j = openBrace; j < seed.length; j++) {
    const c = seed[j];
    if (c === "{") depth++;
    else if (c === "}") {
      depth--;
      if (depth === 0) {
        const body = seed.slice(openBrace + 1, j);
        const bodyStripped = body
          .replace(/\/\/[^\n]*/g, "")
          .replace(/\/\*[\s\S]*?\*\//g, "")
          .trim();
        if (bodyStripped.length > 0) return null;

        const lines = trimmedSnippet.split("\n");
        const indented = lines.map((ln) => (ln.trim() ? `  ${ln}` : "")).join("\n");
        return `${seed.slice(0, openBrace + 1)}\n${indented}\n${seed.slice(j)}`;
      }
    }
  }
  return null;
}
