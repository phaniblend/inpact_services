/**
 * Deep dives are informational only — remove imperative **Mini task:** / **Task:** blocks
 * from `build` strings in content/react-ts/000_deep_dives.json.
 */
import { readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const root = dirname(fileURLToPath(import.meta.url));
const path = join(root, "../content/react-ts/000_deep_dives.json");

function cleanBuildField(s) {
  if (typeof s !== "string") return s;
  const learningMarker = "\n\n**Learning focus:**";
  const i = s.indexOf(learningMarker);
  if (i !== -1 && s.startsWith("**Mini task:**")) {
    return "**Learning focus:**" + s.slice(i + learningMarker.length);
  }
  if (s.startsWith("**Task:**")) {
    return s.replace(/^\*\*Task:\*\*[^\n]*\n\n?/, "").trimStart();
  }
  return s;
}

function walk(obj) {
  if (obj === null || typeof obj !== "object") return;
  if (Array.isArray(obj)) {
    for (const el of obj) walk(el);
    return;
  }
  for (const k of Object.keys(obj)) {
    const v = obj[k];
    if (k === "build" && typeof v === "string") {
      obj[k] = cleanBuildField(v);
    } else if (typeof v === "object") {
      walk(v);
    }
  }
}

const data = JSON.parse(readFileSync(path, "utf8"));
walk(data);
writeFileSync(path, JSON.stringify(data, null, 2) + "\n", "utf8");
console.log("Stripped tasks from deep dive build fields:", path);
