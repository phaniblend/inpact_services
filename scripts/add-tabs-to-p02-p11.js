/**
 * Adds LessonEditorOutputTabs to P02-P11 engines.
 * Transformations per file:
 *  1. Upgrade the LessonEditorOutputTabs import to include the default export.
 *  2. Add `const [mainTab, setMainTab] = useState("editor");` after completedNodes.
 *  3. Add a useEffect that resets mainTab on nodeIndex change.
 *  4. Wrap renderQuestion() in renderNode with LessonEditorOutputTabs.
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
  const original = content;
  const errors = [];

  // ── 1. Upgrade import ────────────────────────────────────────────────────
  if (content.includes('import LessonEditorOutputTabs,')) {
    // already upgraded
  } else if (content.includes('import { EditorTaskBlock } from "./LessonEditorOutputTabs"')) {
    content = content.replace(
      'import { EditorTaskBlock } from "./LessonEditorOutputTabs"',
      'import LessonEditorOutputTabs, { EditorTaskBlock } from "./LessonEditorOutputTabs"'
    );
  } else if (content.includes("import { EditorTaskBlock } from './LessonEditorOutputTabs'")) {
    content = content.replace(
      "import { EditorTaskBlock } from './LessonEditorOutputTabs'",
      "import LessonEditorOutputTabs, { EditorTaskBlock } from './LessonEditorOutputTabs'"
    );
  } else {
    // No existing import — add after CodeEditor import
    content = content.replace(
      /^(import CodeEditor from .*)$/m,
      '$1\nimport LessonEditorOutputTabs, { EditorTaskBlock } from "./LessonEditorOutputTabs";'
    );
  }

  // ── 2. Add mainTab state after completedNodes ────────────────────────────
  if (!content.includes("mainTab")) {
    // Find the line with completedNodes useState and insert after it
    const completedNodesPattern = /^(\s*const \[completedNodes, setCompletedNodes\] = useState\(\[?\]?\);)/m;
    if (completedNodesPattern.test(content)) {
      content = content.replace(
        completedNodesPattern,
        '$1\n    const [mainTab, setMainTab] = useState("editor");'
      );
    } else {
      errors.push("Could not find completedNodes useState");
    }
  }

  // ── 3. Add useEffect to reset mainTab on nodeIndex change ───────────────
  if (!content.includes("setMainTab(") || !content.includes("useEffect")) {
    errors.push("Unusual state/effect structure – skipping effect insertion");
  } else if (!content.includes("setMainTab(\"editor\")")) {
    // Insert a new dedicated useEffect just before the first useEffect in the component
    // Find `useEffect(` that is inside the component (indented)
    const useEffectPattern = /^(  useEffect\()/m;
    if (useEffectPattern.test(content)) {
      content = content.replace(
        useEffectPattern,
        '  useEffect(() => { setMainTab("editor"); }, [nodeIndex]);\n\n$1'
      );
    } else {
      errors.push("Could not find useEffect to insert after");
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
    errors.push(`Could not find '${OLD_CASE}'`);
  }

  if (errors.length > 0) {
    console.error(`❌ ${file}: ${errors.join("; ")}`);
    failCount++;
  } else if (content !== original) {
    fs.writeFileSync(filePath, content, "utf8");
    console.log(`✅ ${file}`);
    successCount++;
  } else {
    console.log(`⏭  ${file}: no changes needed`);
  }
}

console.log(`\nDone: ${successCount} updated, ${failCount} failed`);
