/**
 * Apply LOs from content/react-ts/LOs_inpact_revised.json to engine files.
 * Resolves inpact_ts101–ts119 to react-js inpact_p* paths (actual wiring in App).
 */
import { readFileSync, writeFileSync, existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const jsonPath = join(root, "content/react-ts/LOs_inpact_revised.json");
const enginesTs = join(root, "src/engines/react-ts");

/** Engine files where revised JSON lesson number/topic does not match the repo lesson (skip manual patch). */
const SKIP_FILES = new Set(["inpact_ts100_engine.jsx"]);

/**
 * Only `src/engines/react-ts/inpact_tsNN_engine.jsx` when that file exists.
 * Do not map `inpact_ts101+` → `react-js/inpact_p*` here: curriculum order and
 * numbering diverge (P101 is not “lesson 101” in the JSON’s ts101 sense).
 * For AI-backed lessons, patch `content/react-ts/*_lesson.json` → `config.objectives`.
 */
function resolveEnginePath(file) {
  if (!/^inpact_ts\d+_engine\.jsx$/.test(file)) return null;
  if (SKIP_FILES.has(file)) return null;
  const tsPath = join(enginesTs, file);
  return existsSync(tsPath) ? tsPath : null;
}

function replaceObjectivesItems(content, newItems) {
  const marker = '{ id: "objectives", type: "objectives", phase: "Objectives", items: ';
  const idx = content.indexOf(marker);
  if (idx === -1) {
    const alt = "{ id: 'objectives', type: 'objectives', phase: 'Objectives', items: ";
    const j2 = content.indexOf(alt);
    if (j2 === -1) throw new Error("objectives node not found");
    return replaceItemsAt(content, j2 + alt.length, newItems);
  }
  return replaceItemsAt(content, idx + marker.length, newItems);
}

function replaceItemsAt(content, startBracketIdx, newItems) {
  if (content[startBracketIdx] !== "[") throw new Error("expected [ after items:");
  let i = startBracketIdx;
  let depth = 0;
  for (; i < content.length; i++) {
    const c = content[i];
    if (c === '"') {
      i++;
      while (i < content.length) {
        if (content[i] === "\\") {
          i += 2;
          continue;
        }
        if (content[i] === '"') break;
        i++;
      }
      continue;
    }
    if (c === "'") {
      i++;
      while (i < content.length) {
        if (content[i] === "\\") {
          i += 2;
          continue;
        }
        if (content[i] === "'") break;
        i++;
      }
      continue;
    }
    if (c === "[") depth++;
    else if (c === "]") {
      depth--;
      if (depth === 0) {
        const serialized = JSON.stringify(newItems);
        return content.slice(0, startBracketIdx) + serialized + content.slice(i + 1);
      }
    }
  }
  throw new Error("unclosed items array");
}

const data = JSON.parse(readFileSync(jsonPath, "utf8"));
let ok = 0;
let skipped = [];

for (const entry of data.lessons) {
  const path = resolveEnginePath(entry.file);
  if (!path || !existsSync(path)) {
    skipped.push({ lesson: entry.lesson, file: entry.file, reason: "path missing" });
    continue;
  }
  let src = readFileSync(path, "utf8");
  try {
    src = replaceObjectivesItems(src, entry.objectives);
  } catch (e) {
    skipped.push({ lesson: entry.lesson, file: entry.file, reason: e.message });
    continue;
  }
  writeFileSync(path, src, "utf8");
  ok++;
}

console.log(`Updated ${ok} engine files.`);
if (skipped.length) {
  console.log(`Skipped ${skipped.length}:`);
  for (const s of skipped) console.log(`  lesson ${s.lesson} ${s.file}: ${s.reason}`);
  process.exitCode = 1;
}
