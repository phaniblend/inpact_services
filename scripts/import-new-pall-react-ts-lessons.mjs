/**
 * Imports lesson_NNN_*.js from new-Pall into src/engines/react-ts/inpact_tsNN_engine.jsx
 *
 * Usage:
 *   node scripts/import-new-pall-react-ts-lessons.mjs
 *   NEW_PALL_DIR=E:/path/to/new-Pall node scripts/import-new-pall-react-ts-lessons.mjs --dry-run
 *
 * Requires: Node 18+. Does not eval remote code; only reads local lesson files.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.join(__dirname, "..");
const DEFAULT_NEW_PALL = path.join(path.dirname(REPO_ROOT), "new-Pall");
const NEW_PALL_DIR = process.env.NEW_PALL_DIR
  ? path.resolve(process.env.NEW_PALL_DIR)
  : DEFAULT_NEW_PALL;
const ENGINES_DIR = path.join(REPO_ROOT, "src/engines/react-ts");

const DRY = process.argv.includes("--dry-run");

/** Load lesson config by stripping the import and turning export default into return. */
function loadLessonConfig(absPath) {
  let raw = fs.readFileSync(absPath, "utf8");
  // Normalize line endings
  raw = raw.replace(/\r\n/g, "\n");
  raw = raw.replace(
    /^import\s+createINPACTEngine\s+from\s+['"][^'"]+['"];\s*/m,
    ""
  );
  if (!/export\s+default\s+createINPACTEngine\s*\(/m.test(raw)) {
    throw new Error(`No export default createINPACTEngine( in ${absPath}`);
  }
  raw = raw.replace(
    /export\s+default\s+createINPACTEngine\s*\(/,
    "return createINPACTEngine("
  );
  const factory = new Function("createINPACTEngine", raw);
  return factory((cfg) => cfg);
}

function normalizeStepId(rawId, index1) {
  if (typeof rawId !== "string") return `step${index1}`;
  const m = rawId.match(/^step-?(\d+)$/i);
  if (m) return `step${Number(m[1])}`;
  if (/^step\d+$/i.test(rawId)) {
    const n = rawId.match(/(\d+)/);
    return n ? `step${Number(n[1])}` : `step${index1}`;
  }
  return `step${index1}`;
}

function normalizeIntro(node) {
  if (node.type !== "reveal") return node;
  const id = node.id === "reveal" ? "intro" : node.id;
  if (node.content && typeof node.content === "object") {
    return {
      ...node,
      id,
      phase: "Lesson",
      content: { ...node.content },
    };
  }
  return {
    id,
    type: "reveal",
    phase: "Lesson",
    content: {
      tag: node.tag || "LESSON",
      title: node.title,
      body: node.body,
      usecase: node.usecase,
    },
  };
}

/** Structural tokens only (see inpact_engine_shared evaluate + identifier whitelist). */
const STRUCTURAL_RE = new RegExp(
  [
    "useState\\s*<\\s*number\\s*>",
    "useState\\s*<\\s*string\\s*>",
    "useState\\s*<\\s*boolean\\s*>",
    "useState\\s*<\\s*[^>]+\\s*>",
    "React\\.ChangeEvent\\s*<\\s*HTMLInputElement\\s*>",
    "JSX\\.Element",
    "\\buseState\\b",
    "\\buseEffect\\b",
    "\\buseRef\\b",
    "\\buseMemo\\b",
    "\\buseCallback\\b",
    "\\buseContext\\b",
    "\\buseReducer\\b",
    "\\buseLayoutEffect\\b",
    "\\bBrowserRouter\\b",
    "\\bRoutes\\b",
    "\\bRoute\\b",
    "\\bLink\\b",
    "\\bNavigate\\b",
    "\\buseNavigate\\b",
    "\\buseParams\\b",
    "\\buseLocation\\b",
    "\\buseSearchParams\\b",
    "\\boutlet\\b",
    "\\bcreateContext\\b",
    "\\bcreateSlice\\b",
    "\\bconfigureStore\\b",
    "\\bcreateApi\\b",
    "\\bimport\\b",
    "\\bexport\\s+default\\b",
    "\\bexport\\b",
    "onClick\\s*=",
    "onChange\\s*=",
    "\\{count\\}",
    "\\{[^}]+\\}",
  ].join("|"),
  "gi"
);

function inferAnswerKeywords(node) {
  const blob = [
    node.paal,
    node.expected,
    node.hint,
    node.example_code,
    node.seed_code,
    node.starter_code,
  ]
    .filter(Boolean)
    .join("\n");

  const found = new Set();
  let m;
  const re = new RegExp(STRUCTURAL_RE.source, "gi");
  while ((m = re.exec(blob)) !== null) {
    const s = m[0].replace(/\s+/g, "");
    if (s.length >= 2 && s.length < 80) found.add(s);
  }

  // Literal braces for JSX interpolation checks
  if (/\{count\}/.test(blob)) found.add("{count}");
  if (/\{[^}\s]+\}/.test(blob) && node.paal?.includes("{")) {
    const br = blob.match(/\{[a-zA-Z_][\w]*\}/);
    if (br) found.add(br[0]);
  }

  let arr = [...found];

  // Pad with safe structural tokens from text (lowercase phrases the matcher catches)
  if (arr.length < 4) {
    const low = blob.toLowerCase();
    const pad = [];
    if (low.includes("import")) pad.push("import");
    if (low.includes("export")) pad.push("export");
    if (low.includes("usestate")) pad.push("useState");
    if (low.includes("return")) pad.push("return");
    if (low.includes("onclick")) pad.push("onClick");
    for (const p of pad) {
      if (!arr.some((x) => x.toLowerCase().includes(p.toLowerCase()))) arr.push(p);
    }
  }

  if (arr.length < 3) {
    arr = ["import", "export", "return"];
  }

  // Cap length for readability
  return arr.slice(0, 12);
}

function normalizeQuestion(node, stepIndex, totalSteps) {
  const opts = Array.isArray(node.mc_options) ? node.mc_options : [];
  let correct = node.mc_correct_option;
  if (!correct) {
    const idx =
      node.mc_answer ??
      node.correct_answer_index ??
      node.mc_correct_index;
    if (typeof idx === "number" && opts[idx]) correct = opts[idx];
  }
  if (!correct && opts[0]) correct = opts[0];

  const id = normalizeStepId(node.id, stepIndex);

  return {
    ...node,
    id,
    phase: `Step ${stepIndex} of ${totalSteps}`,
    mc_correct_option: correct,
    mc_options: opts,
    answer_keywords: inferAnswerKeywords(node),
  };
}

function stripDeprecatedMcFields(node) {
  const o = { ...node };
  delete o.mc_answer;
  delete o.correct_answer_index;
  delete o.mc_correct_index;
  return o;
}

function sideStringToLabel(sid) {
  const id = sid === "reveal" ? "intro" : sid;
  if (id === "intro") return "Lesson";
  if (id === "objectives") return "Objectives";
  const m = /^step-?(\d+)$/i.exec(id);
  if (m) return `Step ${Number(m[1])}`;
  return id;
}

function normalizeSideItems(sideItems) {
  if (!Array.isArray(sideItems)) return [];
  if (sideItems.length && typeof sideItems[0] === "string") {
    return sideItems.map((sid) => {
      const id = sid === "reveal" ? "intro" : sid;
      return { id, label: sideStringToLabel(sid) };
    });
  }
  return sideItems.map((item) => ({
    ...item,
    id: item.id === "reveal" ? "intro" : item.id,
    label: item.label || sideStringToLabel(item.id === "reveal" ? "reveal" : item.id),
  }));
}

function serializeValue(v, indent) {
  if (v === null) return "null";
  if (typeof v === "string") return JSON.stringify(v);
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  if (Array.isArray(v)) {
    if (v.length === 0) return "[]";
    const inner = v.map((x) => " ".repeat(indent + 2) + serializeValue(x, indent + 2)).join(",\n");
    return `[\n${inner}\n${" ".repeat(indent)}]`;
  }
  if (typeof v === "object") {
    const keys = Object.keys(v);
    if (keys.length === 0) return "{}";
    const parts = keys.map((k) => {
      const key = /^[a-zA-Z_$][\w$]*$/.test(k) ? k : JSON.stringify(k);
      return `${" ".repeat(indent + 2)}${key}: ${serializeValue(v[k], indent + 2)}`;
    });
    return `{\n${parts.join(",\n")}\n${" ".repeat(indent)}}`;
  }
  return String(v);
}

function nodesToJsArray(nodes, indent) {
  const inner = nodes
    .map((n) => " ".repeat(indent + 2) + serializeValue(n, indent + 2))
    .join(",\n");
  return `[\n${inner}\n${" ".repeat(indent)}]`;
}

function buildEngineFile({ lessonNum, config }) {
  const { title, shortName } = config;
  const nodes = config.NODES;
  const questions = nodes.filter((n) => n.type === "question");
  const total = questions.length;

  let q = 0;
  const mapped = nodes.map((node) => {
    if (node.type === "reveal") {
      return stripDeprecatedMcFields(normalizeIntro(node));
    }
    if (node.type === "objectives") {
      return { ...node, phase: "Objectives" };
    }
    if (node.type === "question") {
      q += 1;
      return stripDeprecatedMcFields(normalizeQuestion(node, q, total));
    }
    return node;
  });

  const sideItems = normalizeSideItems(config.sideItems);

  const header = `/**
 * React · TS lesson (imported from new-Pall).
 * lesson_${String(lessonNum).padStart(3, "0")}_*.js — regenerated by scripts/import-new-pall-react-ts-lessons.mjs
 */
`;

  const body = `import createINPACTEngine from "../inpact_engine_shared";

const NODES = ${nodesToJsArray(mapped, 0)};

const sideItems = ${nodesToJsArray(sideItems, 0)};

export default createINPACTEngine({
  NODES,
  sideItems,
  lessonNum: ${lessonNum},
  title: ${JSON.stringify(title)},
  shortName: ${JSON.stringify(shortName)},
});
`;

  return header + body;
}

function main() {
  if (!fs.existsSync(NEW_PALL_DIR)) {
    console.error("NEW_PALL_DIR not found:", NEW_PALL_DIR);
    process.exit(1);
  }

  const files = fs
    .readdirSync(NEW_PALL_DIR)
    .filter((f) => /^lesson_\d+_.+\.js$/i.test(f))
    .sort();

  if (files.length === 0) {
    console.error("No lesson_*.js files in", NEW_PALL_DIR);
    process.exit(1);
  }

  console.log(`Found ${files.length} lessons under ${NEW_PALL_DIR}`);
  let ok = 0;
  let fail = 0;

  for (const file of files) {
    const m = file.match(/^lesson_(\d+)_/);
    if (!m) continue;
    const n = parseInt(m[1], 10);
    if (n < 1 || n > 999) continue;

    const abs = path.join(NEW_PALL_DIR, file);
    try {
      const config = loadLessonConfig(abs);
      if (!config.NODES || !Array.isArray(config.NODES)) {
        throw new Error("missing NODES");
      }
      const outName = `inpact_ts${String(n).padStart(2, "0")}_engine.jsx`;
      const outPath = path.join(ENGINES_DIR, outName);

      const jsx = buildEngineFile({ lessonNum: n, config });

      if (DRY) {
        console.log("[dry-run] would write", outPath, `(${config.NODES.length} nodes)`);
      } else {
        fs.writeFileSync(outPath, jsx, "utf8");
        console.log("wrote", outPath);
      }
      ok++;
    } catch (e) {
      console.error(`FAIL ${file}:`, e.message);
      fail++;
    }
  }

  console.log(`Done. ok=${ok} fail=${fail}${DRY ? " (dry-run)" : ""}`);
  if (fail > 0) {
    console.error(
      "\nIncomplete source files: add a closing `export default createINPACTEngine({ NODES, sideItems, lessonNum, title, shortName });` to each failed lesson in new-Pall, then re-run."
    );
  }
  if (ok === 0) process.exit(1);
}

main();
