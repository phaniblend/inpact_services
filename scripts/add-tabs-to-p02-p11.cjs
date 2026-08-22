/**
 * Adds LessonEditorOutputTabs to P02-P11 engines.
 * Transformations per file:
 *  1. Upgrade the LessonEditorOutputTabs import to include the default export.
 *  2. Add `const [mainTab, setMainTab] = useState("editor");` after completedNodes.
 *  3. Wrap renderQuestion() in renderNode with LessonEditorOutputTabs.
 */

const fs = require("fs");
const path = require("path");

const DIR = path.join(__dirname, "../src/engines");
const FILES = [
  "inpact_p02_engine.jsx",
  "inpact_p03_engine.jsx",
  "inpact_p04_engine.jsx",
  "inpact_p05_engine.jsx",
  "inpact_p06_engine.jsx",
  "inpact_p07_engine.jsx",
  "inpact_p08_engine.jsx",
  "inpact_p09_engine.jsx",
  "inpact_p10_engine.jsx",
  "inpact_p11_engine.jsx",
];

let successCount = 0;
let failCount = 0;

for (const file of FILES) {
  const filePath = path.join(DIR, file);
  let content = fs.readFileSync(filePath, "utf8");
  // Normalise line endings to LF for reliable regex, we'll restore later if needed
  const hasCRLF = content.includes("\r\n");
  content = content.replace(/\r\n/g, "\n");
  const original = content;
  const errors = [];

  // ── 1. Upgrade import ────────────────────────────────────────────────────
  if (content.includes("import LessonEditorOutputTabs,") || content.includes("import LessonEditorOutputTabs from")) {
    // already upgraded
  } else if (content.includes('import { EditorTaskBlock } from "./LessonEditorOutputTabs"')) {
    content = content.replace(
      'import { EditorTaskBlock } from "./LessonEditorOutputTabs"',
      'import LessonEditorOutputTabs, { EditorTaskBlock } from "./LessonEditorOutputTabs"'
    );
  } else {
    // No LessonEditorOutputTabs import at all — add after CodeEditor import
    content = content.replace(
      /^(import CodeEditor from .*)$/m,
      '$1\nimport LessonEditorOutputTabs, { EditorTaskBlock } from "./LessonEditorOutputTabs";'
    );
  }

  // ── 2. Add mainTab state ─────────────────────────────────────────────────
  if (content.includes("mainTab")) {
    // already there
  } else {
    // Find completedNodes useState line (any initial value) and insert mainTab after it
    const completedNodesRe = /^([ \t]*const \[completedNodes, setCompletedNodes\] = useState\([^)]*\);?)$/m;
    if (completedNodesRe.test(content)) {
      content = content.replace(
        completedNodesRe,
        '$1\n  const [mainTab, setMainTab] = useState("editor");'
      );
    } else {
      // Fallback: insert after last useState before "const node ="
      const lastUseStateRe = /([ \t]*const \[[^\]]+, [^\]]+\] = useState\([^)]*\);?\n)(?=[ \t]*const node =)/;
      if (lastUseStateRe.test(content)) {
        content = content.replace(
          lastUseStateRe,
          '$1  const [mainTab, setMainTab] = useState("editor");\n'
        );
      } else {
        errors.push("Could not find insertion point for mainTab state");
      }
    }
  }

  // ── 3. Reset mainTab in the nodeIndex useEffect ──────────────────────────
  // Add setMainTab("editor") at the start of the first useEffect in the component
  if (!content.includes('setMainTab("editor")')) {
    // The main useEffect starts with e.g. `  useEffect(() => {\n    setResult(null);`
    const firstEffectRe = /([ \t]*useEffect\(\(\) => \{\n)([ \t]*setResult)/;
    if (firstEffectRe.test(content)) {
      content = content.replace(
        firstEffectRe,
        '$1$2'  // leave as-is — we'll just skip adding inside and add a standalone one
      );
      // Add a dedicated standalone reset effect before the main useEffect
      content = content.replace(
        /([ \t]*useEffect\(\(\) => \{)/,
        '  useEffect(() => { setMainTab("editor"); }, [nodeIndex]);\n\n$1'
      );
    } else {
      // Just add standalone effect before first useEffect
      content = content.replace(
        /([ \t]*useEffect\()/,
        '  useEffect(() => { setMainTab("editor"); }, [nodeIndex]);\n\n$1'
      );
    }
  }

  // ── 4. Wrap renderQuestion() in renderNode ───────────────────────────────
  const OLD_CASE = `case "question": return renderQuestion();`;
  const NEW_CASE = `case "question": return (
        <LessonEditorOutputTabs node={node} nodes={NODES} mainTab={mainTab} setMainTab={setMainTab} answer={answer || ""} showTaskInEditor={false}>
          {renderQuestion()}
        </LessonEditorOutputTabs>
      );`;

  if (content.includes(OLD_CASE)) {
    content = content.replace(OLD_CASE, NEW_CASE);
  } else {
    errors.push(`Could not find renderNode question case`);
  }

  if (errors.length > 0) {
    console.error(`❌ ${file}: ${errors.join("; ")}`);
    failCount++;
  } else if (content !== original) {
    // Restore CRLF if the file originally had it
    const out = hasCRLF ? content.replace(/\n/g, "\r\n") : content;
    fs.writeFileSync(filePath, out, "utf8");
    console.log(`✅ ${file}`);
    successCount++;
  } else {
    console.log(`⏭  ${file}: no changes needed`);
  }
}

console.log(`\nDone: ${successCount} updated, ${failCount} failed`);
