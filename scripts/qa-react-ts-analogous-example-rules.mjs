import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { inferReactTsAnalogousExample } from "../src/engines/reactTsAnalogousExamples.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

const inDir = path.join(rootDir, "content", "generated", "react-ts");

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function stripToSnippet(s, maxLen = 220) {
  const t = String(s || "").trim();
  if (t.length <= maxLen) return t;
  return t.slice(0, maxLen).trimEnd() + "...";
}

function looksLikeCodeSnippet(exampleCode) {
  if (typeof exampleCode !== "string") return false;
  const t = exampleCode.trim();
  if (!t) return false;
  const lowered = t.toLowerCase();
  if (/^like\s+/i.test(t) || /^example[:\s]/i.test(lowered) || /^before\s+/i.test(lowered)) return false;
  return (
    /\bconst\b/.test(t) ||
    /\bfunction\b/.test(t) ||
    /\breturn\b/.test(t) ||
    /\buseState\b/.test(t) ||
    /\bonClick\b/.test(t) ||
    /\bonChange\b/.test(t) ||
    /=>/.test(t) ||
    /<\s*[A-Za-z]/.test(t) ||
    /\bReact\./.test(t) ||
    /:\s*React\./.test(t)
  );
}

// Mirrors `buildAnalogousExample()` behavior in `src/engines/inpact_engine_shared.jsx`.
function buildAnalogousExample(taskTextLower, fallbackCode) {
  const text = taskTextLower;
  if (
    text.includes("functional update") ||
    (/\bincrement\b/.test(text) && /\bdecrement\b/.test(text)) ||
    (/\bsetcount\b/.test(text) && /\bprev\b/.test(text))
  ) {
    return `// Analogous pattern (not your exact answer)
const [value, setValue] = useState<number>(1);

const double = () => {
  setValue((prev) => prev * 2);
};

const halve = () => {
  setValue((prev) => Math.max(0, Math.floor(prev / 2)));
};`;
  }

  const hasOnChange = /\bonchange\b/.test(text) || /\bonchange\s*=\s*\{/.test(text);
  const hasControlledInputPhrase = /\bcontrolled\s+input\b/.test(text);
  const hasStandaloneInputWord = /\binput\b/.test(text);
  if (hasStandaloneInputWord && (hasOnChange || hasControlledInputPhrase)) {
    return `// Analogous pattern (not your exact answer)
const [query, setQuery] = useState<string>("");

const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setQuery(e.target.value);
};`;
  }

  if (typeof fallbackCode === "string" && fallbackCode.trim()) {
    return fallbackCode.trim();
  }

  return `// Analogous pattern
// 1) define typed state
// 2) define handler with clear intent
// 3) wire handler in JSX`;
}

function inferNodeFromGeneratedStep(step) {
  const paal = step?.instruction || "";
  const hint = step?.hint || "";
  const expected = step?.expectedOutcome || "";
  const example_code = typeof step?.example_code === "string" ? step.example_code : step?.analogousExample || "";

  const think = step?.thinkPrompt;
  const thinkQuestion = typeof think === "string" ? think : think && typeof think === "object" ? think.question : "";

  return {
    type: "question",
    paal,
    hint,
    expected,
    example_code,
    think_prompt: thinkQuestion || "",
    mc_options: Array.isArray(step?.options) ? step.options : think && typeof think === "object" ? think.options : [],
    mc_correct_option: step?.correctOption || (think && typeof think === "object" ? think.correctAnswer : ""),
    mc_anchor: step?.anchor || "",
  };
}

function detectRequiredHookFromImportStep(step) {
  const correct = String(step?.correctOption || "");
  if (/use\s*state/i.test(correct)) return "useState";
  if (/use\s*effect/i.test(correct)) return "useEffect";
  if (/use\s*ref/i.test(correct)) return "useRef";
  return null;
}

function parseTaskTextForRules(step) {
  const paal = String(step?.instruction || "");
  const hint = String(step?.hint || "");
  const expected = String(step?.expectedOutcome || "");
  const textLower = `${paal}\n${hint}\n${expected}`.toLowerCase();
  return { paal, hint, expected, textLower };
}

function runRulesForStep(lessonNum, stepIndex1Based, step, output) {
  const { paal, hint, expected, textLower } = parseTaskTextForRules(step);
  const problems = [];

  // Rule 1: no natural-language analogies in the example.
  if (/\blike\s+/.test(String(output || "").trim())) {
    problems.push({
      rule: "No natural-language analogies in ANALOGOUS EXAMPLE",
      details: `Output contains "Like ...": ${stripToSnippet(output)}`,
    });
  }

  // Import rule: required useState should not be repeated.
  const isImportFocused =
    /\bimport\b/.test(textLower) && /\bfrom\s*['"]react['"]\b/.test(textLower || "") || /\buse\s*state\b/.test(textLower);
  if (isImportFocused) {
    const requiredHook = detectRequiredHookFromImportStep(step);
    if (requiredHook) {
      if (requiredHook === "useState" && /\buse\s*state\b/.test(String(output || ""))) {
        problems.push({
          rule: "Import steps must not repeat the required hook import",
          details: `Required hook was useState but example still mentions useState. Output: ${stripToSnippet(
            output
          )}`,
        });
      }
    }
  }

  // Wiring steps must avoid inline callbacks.
  // Rule is wording-agnostic: if the task is about wiring via onClick/onChange,
  // the example should wire handler references (no inline `=>` callbacks).
  const isWiringStepBySignal = /\bonclick\b/.test(textLower) || /\bonchange\b/.test(textLower);
  if (isWiringStepBySignal) {
    const out = String(output || "");
    if (/(onClick|onChange)\s*=\s*\{[\s\S]{0,80}=>/i.test(out)) {
      problems.push({
        rule: "Wiring steps must use handler references (no inline callbacks)",
        details: `Output uses inline callback next to onClick/onChange. Output: ${stripToSnippet(out)}`,
      });
    }
  }

  // Toggle handler formatting rule.
  const isToggleHandlerStep =
    /\btoggle\w*\b/.test(textLower) && /\bfunction\b/.test(textLower) && (/\bboolean\b/.test(textLower) || /\bseeme\b/.test(textLower));
  if (isToggleHandlerStep && !/\bonclick\b/.test(textLower)) {
    const out = String(output || "");
    if (!/const\s+toggleVisibility\s*=\s*\(\)\s*:\s*void\s*=>/i.test(out)) {
      problems.push({
        rule: "Toggle handler example formatting uses `const toggleVisibility = (): void =>`",
        details: `Toggle handler example not in expected format. Output: ${stripToSnippet(out)}`,
      });
    }
    if (!/set\w+\(\(prev\)\s*=>\s*!prev/i.test(out)) {
      problems.push({
        rule: "Toggle handler example must use `setX((prev) => !prev)`",
        details: `Toggle handler example not using prev=>!prev. Output: ${stripToSnippet(out)}`,
      });
    }
  }

  // Component-definition rule.
  const isComponentDefinitionStep =
    /\bfunction\s+component\b/.test(textLower) || /\breac?t\.fc\b/.test(textLower) || /\breact\.fc\b/.test(textLower);
  if (isComponentDefinitionStep) {
    const out = String(output || "");
    if (!/\bJSX\.Element\b/.test(out) && !/\)\s*:\s*JSX\.Element/.test(out)) {
      problems.push({
        rule: "Component-definition steps return an explicit JSX.Element (avoid React.FC)",
        details: `Expected a JSX.Element return type in the example. Output: ${stripToSnippet(output)}`,
      });
    }
  }

  // Increment/decrement handler rule (handler-only, not wiring).
  const isHandlerOnlyIncDec =
    // Must include inc/dec semantics (avoid matching "add parentheses")
    /\b(increment\w*|decrement\w*|increase\w*|decrease\w*|subtract\w*)\b/.test(textLower) &&
    /\b(handler|function)\b/.test(textLower) &&
    // Must be handler-only (not wiring to buttons/inputs)
    !/\bbutton\b/.test(textLower) &&
    !/\bonclick\b/.test(textLower) &&
    !/\bwire\b/.test(textLower) &&
    !/\bconnect\b/.test(textLower) &&
    // Should refer to a value being updated (reduce false positives)
    (/\bcount\b/.test(textLower) || /\bcounter\b/.test(textLower) || /\bstate\b/.test(textLower) || /\bvalue\b/.test(textLower));
  if (isHandlerOnlyIncDec) {
    const out = String(output || "");
    if (!/set\w+\(\(p\)\s*=>/i.test(out) && !/set\w+\(\(prev\)\s*=>/i.test(out)) {
      problems.push({
        rule: "Increment/decrement handler-only example uses a functional update setter",
        details: `Output missing functional-setter pattern. Output: ${stripToSnippet(out)}`,
      });
    }
  }

  return problems;
}

const lessonFiles = fs
  .readdirSync(inDir)
  .filter((f) => /^0\d{2}_.+_lesson\.json$/.test(f))
  .sort();

const results = [];
for (const file of lessonFiles) {
  const fullPath = path.join(inDir, file);
  const raw = readJson(fullPath);
  const config = raw?.config;
  if (!config) continue;
  const lessonNum = Number(config.lessonNum || 0);
  if (!lessonNum) continue;

  const steps = Array.isArray(config.steps) ? config.steps : [];
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    if (!step || step.type !== "question") continue;
    const node = inferNodeFromGeneratedStep(step);

    // Curated example_code exists on step; but UI only uses it if it "looks like code"
    // and for import-focused tasks we prefer inferred/analogous patterns.
    const taskTextForExample = `${node.paal || ""}\n${node.hint || ""}\n${node.expected || ""}\n${node.think_prompt || ""}`.toLowerCase();
    const isImportFocusedTask = /\bimport\b/.test(taskTextForExample) && /\breact\b/.test(taskTextForExample);

    // Match runtime behavior: for React-TS we prioritize deterministic inferred examples
    // over curated/generated snippets so pedagogy rules stay stable.
    const inferred = inferReactTsAnalogousExample(node);
    let fallbackCode = inferred || "";
    if (!fallbackCode && !isImportFocusedTask && node.example_code && looksLikeCodeSnippet(node.example_code)) {
      fallbackCode = node.example_code;
    }

    const built = buildAnalogousExample(node.paal.toLowerCase() + "\n" + node.hint.toLowerCase() + "\n" + node.expected.toLowerCase(), fallbackCode);
    const problems = runRulesForStep(lessonNum, i + 1, step, built);
    results.push({
      lessonNum,
      stepNum: i + 1,
      stepId: step.id,
      title: step.title,
      inferredExample: stripToSnippet(built),
      problems,
    });
  }
}

const failures = results.filter((r) => r.problems.length > 0);
const total = results.length;
const passed = total - failures.length;

console.log(`QA Analogous Example Rules: total steps=${total}, passed=${passed}, failed=${failures.length}`);

for (const f of failures) {
  console.log(`\nLesson ${f.lessonNum} Step ${f.stepNum} (${f.stepId}) — ${f.title || ""}`.trim());
  console.log(`Example shown: ${f.inferredExample}`);
  for (const p of f.problems) {
    console.log(`- FAIL: ${p.rule}`);
    console.log(`  ${p.details}`);
  }
}

if (failures.length === 0) {
  console.log("\nAll tested steps passed the listed rules.");
}

