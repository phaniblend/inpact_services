/**
 * Generate one MD file per category listing all lessons with their LOs.
 * Run: node scripts/generate-lo-docs.js
 * Output: docs/lo/React · JS.md, docs/lo/React · TS.md, etc.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ENGINES_ROOT = path.join(__dirname, "..", "src", "engines");

const CATEGORIES = [
  { folder: "react-js", name: "React · JS", glob: "inpact_p*_engine.jsx", sort: (a, b) => numFrom(a) - numFrom(b) },
  { folder: "react-ts", name: "React · TS", glob: "inpact_ts*_engine.jsx", sort: (a, b) => numFrom(a) - numFrom(b) },
  { folder: "typescript", name: "TypeScript", glob: "inpact_tsf*_engine.jsx", sort: (a, b) => numFrom(a) - numFrom(b) },
  { folder: "javascript", name: "JavaScript", glob: "inpact_jsf*_engine.jsx", sort: (a, b) => numFrom(a) - numFrom(b) },
  { folder: "node", name: "Node", glob: "inpact_nodef*_engine.jsx", sort: (a, b) => numFrom(a) - numFrom(b) },
  { folder: "express", name: "Express", glob: "inpact_expf*_engine.jsx", sort: (a, b) => numFrom(a) - numFrom(b) },
  { folder: "python", name: "Python", glob: "inpact_pyf*_engine.jsx", sort: (a, b) => numFrom(a) - numFrom(b) },
  { folder: "el", name: "Engineering Leadership", glob: "inpact_el*_engine.jsx", sort: (a, b) => numFrom(a) - numFrom(b) },
  { folder: "fe", name: "Front-End", glob: "inpact_fe*_engine.jsx", sort: (a, b) => numFrom(a) - numFrom(b) },
  { folder: "sd", name: "System Design", glob: "inpact_sd*_engine.jsx", sort: (a, b) => numFrom(a) - numFrom(b) },
  { folder: "pe", name: "Platform Engineering", glob: "inpact_pe*_engine.jsx", sort: (a, b) => numFrom(a) - numFrom(b) },
  { folder: "sec", name: "Security", glob: "inpact_sec*_engine.jsx", sort: (a, b) => numFrom(a) - numFrom(b) },
  { folder: "angular", name: "Angular", glob: "*.jsx", sort: (a, b) => a.localeCompare(b) },
  { folder: "vue", name: "Vue", glob: "*.jsx", sort: (a, b) => numFrom(a) - numFrom(b) },
  { folder: "css", name: "CSS", glob: "inpact_c*_engine.jsx", sort: (a, b) => numFrom(a) - numFrom(b) },
];

function numFrom(filename) {
  const m = filename.match(/(\d+)/);
  return m ? parseInt(m[1], 10) : 0;
}

function listFiles(dir, pattern) {
  if (!fs.existsSync(dir)) return [];
  const re = new RegExp("^" + pattern.replace(/\*/g, ".*") + "$");
  return fs.readdirSync(dir).filter((f) => re.test(f));
}

function extractTag(content) {
  const m = content.match(/type:\s*["']reveal["'][\s\S]*?content:\s*\{[\s\S]*?tag:\s*["']([^"']+)["']/);
  return m ? m[1].trim() : null;
}

function extractTitle(content) {
  const m = content.match(/type:\s*["']reveal["'][\s\S]*?content:\s*\{[\s\S]*?tag:[\s\S]*?title:\s*["']([^"']+)["']/);
  return m ? m[1].trim() : null;
}

function extractObjectives(content) {
  const objMatch = content.match(/type:\s*["']objectives["'][\s\S]*?items:\s*\[/);
  if (!objMatch) return null;
  const startIdx = content.indexOf("items: [", objMatch.index) + "items: [".length;
  let depth = 1;
  let i = startIdx;
  let inString = false;
  let escape = false;
  let quote = null;
  const items = [];
  let current = "";

  while (i < content.length && depth > 0) {
    const c = content[i];
    if (escape) {
      if (inString) current += c;
      escape = false;
      i++;
      continue;
    }
    if (c === "\\" && inString) {
      escape = true;
      i++;
      continue;
    }
    if (!inString) {
      if (c === "[" || c === "{") depth++;
      else if (c === "]" || c === "}") depth--;
      else if ((c === '"' || c === "`") && depth === 1) {
        inString = true;
        quote = c;
        current = "";
      }
      i++;
      continue;
    }
    if (c === quote && !escape) {
      inString = false;
      items.push(current.replace(/\\n/g, "\n").trim());
      current = "";
    } else {
      current += c;
    }
    i++;
  }
  return items.length ? items : null;
}

function extractFromEngine(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  const tag = extractTag(content);
  const title = extractTitle(content);
  const items = extractObjectives(content);
  const fallbackTitle = (content.match(/title:\s*["']([^"']+)["']\s*,?\s*shortName/) || [])[1];
  return {
    tag: tag || "PROBLEM",
    title: title || fallbackTitle || path.basename(filePath, path.extname(filePath)),
    items: items || [],
  };
}

function toMdSection(entry, index) {
  const lines = [];
  lines.push(`**{${entry.tag} :: ${entry.title}}**`);
  lines.push("");
  lines.push("LOs:");
  lines.push("");
  (entry.items || []).forEach((lo, i) => {
    lines.push(`${String(i + 1).padStart(2, "0")}`);
    lines.push(lo);
    lines.push("");
  });
  return lines.join("\n");
}

const outDir = path.join(__dirname, "..", "docs", "lo");
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

for (const cat of CATEGORIES) {
  const dir = path.join(ENGINES_ROOT, cat.folder);
  let files = listFiles(dir, cat.glob);
  if (cat.sort) files = files.sort(cat.sort);

  const entries = files.map((f) => {
    const entry = extractFromEngine(path.join(dir, f));
    return entry;
  });

  const mdLines = [`# ${cat.name}`, "", "Lessons and learning objectives.", ""];
  entries.forEach((entry) => {
    mdLines.push(toMdSection(entry));
    mdLines.push("---");
    mdLines.push("");
  });

  const outPath = path.join(outDir, `${cat.name}.md`);
  fs.writeFileSync(outPath, mdLines.join("\n").replace(/\n---\n\n$/m, "\n"), "utf8");
  console.log(`Wrote ${outPath} (${entries.length} lessons)`);
}

console.log("Done.");
