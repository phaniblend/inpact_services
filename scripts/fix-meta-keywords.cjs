/**
 * Removes meta-words from answer_keywords arrays across all engines.
 *
 * The evaluate() function checks if each keyword appears literally inside
 * the learner's code (lowercased, whitespace-stripped). Words like "optional",
 * "arrow", "overload", and "generic" are concept descriptions — they never
 * appear in real JavaScript/TypeScript code — so including them as keywords
 * always fails, capping the score at partial.
 *
 * Safe-to-remove words (never valid code syntax):
 *   "optional", "arrow", "overload", "generic"
 *
 * Words intentionally kept (ARE valid code syntax):
 *   "default", "rest", "interface", "class", "async", "namespace",
 *   "module", "abstract", "declare", "type", "const", etc.
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "../src/engines");
const META_WORDS = new Set(["optional", "arrow", "overload", "generic"]);

let totalFiles = 0;
let changedFiles = 0;
let totalRemoved = 0;

function processDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      processDir(fullPath);
    } else if (entry.name.endsWith(".jsx") || entry.name.endsWith(".js")) {
      processFile(fullPath);
    }
  }
}

function processFile(filePath) {
  totalFiles++;
  let content = fs.readFileSync(filePath, "utf8");
  const original = content;

  // Match answer_keywords arrays and strip meta-words from them.
  // Use a quoted-string-aware pattern so keywords like "T[]" (which contain ])
  // don't prematurely end the regex match.
  content = content.replace(
    /answer_keywords:\s*\[("(?:[^"\\]|\\.)*"(?:\s*,\s*"(?:[^"\\]|\\.)*")*)\]/g,
    (fullMatch, inner) => {
      // Split into individual quoted strings
      const items = inner.match(/"[^"]*"|'[^']*'/g);
      if (!items) return fullMatch;

      const filtered = items.filter((item) => {
        // Strip surrounding quotes and check against meta-words
        const word = item.slice(1, -1).toLowerCase().trim();
        return !META_WORDS.has(word);
      });

      if (filtered.length === items.length) return fullMatch; // nothing changed

      const removed = items.length - filtered.length;
      totalRemoved += removed;

      // Rebuild the array — keep at least 1 keyword so evaluation still works
      if (filtered.length === 0) {
        console.warn(`  ⚠️  All keywords removed in ${path.basename(filePath)} — keeping original`);
        return fullMatch;
      }

      return `answer_keywords: [${filtered.join(", ")}]`;
    }
  );

  if (content !== original) {
    fs.writeFileSync(filePath, content, "utf8");
    changedFiles++;
    console.log(`✅ ${path.relative(ROOT, filePath)}`);
  }
}

processDir(ROOT);

console.log(`\nDone: ${changedFiles}/${totalFiles} files updated, ${totalRemoved} meta-keywords removed`);
