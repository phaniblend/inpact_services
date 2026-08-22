/**
 * Replaces the `export const NODES = [...]` array literal in a generated assist module's source
 * text with a new array, leaving every other byte of the file — imports, sideItems, the
 * createINPACTEngine(...) call, comments — untouched. This is what lets ID Studio's review
 * overlay edit lesson *content* (wording, hints, feedback) without needing a real JS parser/AST
 * round-trip: the file is read as text, this does a precise bracket-aware splice, and the result
 * goes through the exact same esbuild + vm validation generateModule.js already uses before
 * anything gets written to disk.
 *
 * Why not just JSON.stringify the whole file or re-run the AST through a formatter: every other
 * part of the file (imports, sideItems, the final createINPACTEngine call) isn't reliably
 * reconstructable from what a review UI has access to — only NODES is a guaranteed named export
 * consumers can read back (see the master prompt's own rule: "NODES MUST be a named export").
 * Splicing just that span is both simpler and safer than trying to regenerate the whole file.
 */

const NODES_DECL = "export const NODES = ";

/** Finds the exact [start, end) character span of the array literal that follows
 * `export const NODES = ` in `source`, walking bracket depth while correctly skipping over
 * string/template literals and comments so a `[`/`]`/`;` inside example code text never
 * miscounts. Returns null if the declaration or its closing bracket can't be found. */
function findNodesArraySpan(source) {
  const declIdx = source.indexOf(NODES_DECL);
  if (declIdx === -1) return null;
  const arrayStart = source.indexOf("[", declIdx + NODES_DECL.length);
  if (arrayStart === -1) return null;

  let depth = 0;
  let i = arrayStart;
  let inString = null; // one of `'`, `"`, "`", or null
  for (; i < source.length; i++) {
    const ch = source[i];
    if (inString) {
      if (ch === "\\") {
        i++; // skip the escaped character, whatever it is
      } else if (ch === inString) {
        inString = null;
      }
      continue;
    }
    if (ch === "'" || ch === '"' || ch === "`") {
      inString = ch;
      continue;
    }
    if (ch === "/" && source[i + 1] === "/") {
      const nl = source.indexOf("\n", i);
      i = nl === -1 ? source.length : nl;
      continue;
    }
    if (ch === "/" && source[i + 1] === "*") {
      const end = source.indexOf("*/", i + 2);
      i = end === -1 ? source.length : end + 1;
      continue;
    }
    if (ch === "[") depth++;
    else if (ch === "]") {
      depth--;
      if (depth === 0) return { start: arrayStart, end: i + 1 };
    }
  }
  return null; // never found a balanced close — malformed source, caller should treat as an error
}

/** Replaces NODES in `source` with `newNodes` (a plain JS array — must be JSON-serializable; any
 * function-valued field would be silently dropped by JSON.stringify, same caveat as any other
 * data round-trip through JSON). Throws if the NODES declaration can't be located, rather than
 * silently returning the original source unchanged. */
export function spliceNodesArray(source, newNodes) {
  const span = findNodesArraySpan(source);
  if (!span) {
    throw new Error('Could not locate a balanced "export const NODES = [...]" array in this file — refusing to guess.');
  }
  const replacement = JSON.stringify(newNodes, null, 2);
  return source.slice(0, span.start) + replacement + source.slice(span.end);
}
