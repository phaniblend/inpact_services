/**
 * One-off: realign inpact_ts07–ts25 with REACT_TS_CURRICULUM by permuting existing bodies.
 * Moves displaced useRef lessons from old ts24/ts25 → ts31/ts32.
 * Run from repo root: node scripts/permute-react-ts-lessons-7-32.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ENG = path.join(ROOT, "src/engines/react-ts");

function readCurriculum() {
  const text = fs.readFileSync(path.join(ROOT, "src/reactTsCurriculum.js"), "utf8");
  const entries = [];
  const re = /\{\s*title:\s*"([^"]+)",\s*prereqs:\s*\[([^\]]*)\]\s*\}/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    const nums =
      m[2].trim() === ""
        ? []
        : m[2]
            .split(",")
            .map((s) => parseInt(s.trim(), 10))
            .filter((n) => !Number.isNaN(n));
    entries.push({ title: m[1], prereqs: nums });
  }
  return entries;
}

const SHORT = {
  7: "TS — PROPS INTERFACE",
  8: "TS — OPTIONAL PROPS",
  9: "TS — CHILDREN PROP",
  10: "HOOKS — USE STATE",
  11: "HOOKS — OBJECT STATE",
  12: "HOOKS — ARRAY STATE",
  13: "PATTERNS — CONTROLLED INPUT",
  14: "PATTERNS — CONTROLLED SELECT",
  15: "JSX — CONDITIONAL",
  16: "JSX — LIST RENDERING",
  17: "EVENTS — CLICK",
  18: "EVENTS — INPUT FORM",
  19: "EVENTS — KEYBOARD FOCUS",
  20: "PATTERNS — COMPOSITION",
  21: "STYLING — CONDITIONAL CSS",
  22: "STYLING — INLINE STYLES",
  23: "STYLING — CSS MODULES",
  24: "HOOKS — EFFECT MOUNT",
  25: "HOOKS — EFFECT DEPS",
  31: "HOOKS — USE REF DOM",
  32: "HOOKS — USE REF MUTABLE",
};

function pad(n) {
  return String(n).padStart(2, "0");
}

function readEngine(n) {
  return fs.readFileSync(path.join(ENG, `inpact_ts${pad(n)}_engine.jsx`), "utf8").replace(/\r\n/g, "\n");
}

function buildPrereqsBlock(lessonNum, titles, prereqNums) {
  const items = prereqNums.map((n) => {
    const label = titles[n - 1] ?? `Lesson ${n}`;
    return `    {
      lesson: ${n},
      label: "${label.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}",
      reason: "Complete Lesson ${n} (${label.replace(/"/g, '\\"')}) first — it is a prerequisite on the React-TS track for this lesson.",
    },`;
  });
  return `{
  id: "prereqs",
  type: "prereqs",
  phase: "Prerequisites",
  items: [
${items.join("\n")}
  ],
},`;
}

function replacePrereqsNode(body, newBlock) {
  const needle = /id: "objectives",\s*type: "objectives"/;
  const m = body.match(needle);
  if (!m || m.index === undefined) throw new Error('NODES "objectives" anchor not found');
  let objOpen = m.index;
  while (objOpen > 0 && body[objOpen] !== "{") objOpen -= 1;
  const head = body.slice(0, objOpen);
  const prIdx = head.lastIndexOf('id: "prereqs"');
  if (prIdx === -1) throw new Error('id: "prereqs" not found before objectives');
  let prOpen = prIdx;
  while (prOpen > 0 && body[prOpen] !== "{") prOpen -= 1;
  return body.slice(0, prOpen) + newBlock + body.slice(objOpen);
}

function patchLesson(body, lessonNum, titles) {
  const title = titles[lessonNum - 1];
  const sn = SHORT[lessonNum];
  if (!title) throw new Error(`no title for lesson ${lessonNum}`);
  if (!sn) throw new Error(`no shortName for lesson ${lessonNum}`);

  const catMatch = body.match(/tag: "LESSON #\d+ \(([^)]+)\)"/);
  const category = catMatch ? catMatch[1] : "React TypeScript";

  let out = body;
  out = out.replace(/tag: "LESSON #\d+ \([^)]+\)"/, `tag: "LESSON #${lessonNum} (${category})"`);

  out = out.replace(
    /(id: "intro"[\s\S]*?content: \{[\s\S]*?title: ")([^"]+)(")/,
    `$1${title.replace(/\\/g, "\\\\")}$3`,
  );

  const cur = readCurriculum();
  out = replacePrereqsNode(out, buildPrereqsBlock(lessonNum, titles, cur[lessonNum - 1].prereqs));

  out = out.replace(
    /lessonNum: \d+,\s*\n\s*title: "[^"]*",\s*\n\s*shortName: "[^"]*"/,
    `lessonNum: ${lessonNum},\n  title: "${title.replace(/"/g, '\\"')}",\n  shortName: "${sn}"`,
  );

  return out;
}

const SRC_MAP = {
  7: 5,
  8: 6,
  9: 7,
  10: 8,
  11: 9,
  12: 10,
  13: 16,
  14: 17,
  15: 11,
  16: 12,
  17: 13,
  18: 14,
  19: 15,
  20: 18,
  21: 19,
  22: 20,
  23: 21,
  24: 22,
  25: 23,
};

const titles = readCurriculum().map((e) => e.title);

// Snapshot sources before overwrite
const snapshot = {};
for (const n of new Set(Object.values(SRC_MAP).concat([24, 25, 31, 32]))) {
  snapshot[n] = readEngine(n);
}

function writeLesson(dest, srcBody) {
  const patched = patchLesson(srcBody, dest, titles);
  fs.writeFileSync(path.join(ENG, `inpact_ts${pad(dest)}_engine.jsx`), patched, "utf8");
}

for (const [dest, src] of Object.entries(SRC_MAP)) {
  const d = Number(dest);
  const s = Number(src);
  writeLesson(d, snapshot[s]);
}

// Displaced useRef content → official slots L31 / L32
writeLesson(31, snapshot[24]);
writeLesson(32, snapshot[25]);

console.log("Permuted ts07–ts25; wrote ts31–ts32 from old ts24–ts25.");
