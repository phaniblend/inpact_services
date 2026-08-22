/**
 * ID Module — generates one standalone assistance module (a "building block" tutorial,
 * not part of a numbered curriculum track) using the house-style prompt in
 * scripts/prompts/assist-module-gemini-prompt.txt, following the exact same NODES schema
 * the real INPACT lessons use (see D:\IPAAL\src\engines\react-js\inpact_p01_engine.jsx).
 *
 * Server-side only (reads the prompt file from disk) — imported by server/id-router.js.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";
import vm from "vm";
import { transformSync } from "esbuild";
import { callGemini, extractSingleTypescriptBlock } from "./geminiClient.js";

const nodeRequire = createRequire(import.meta.url);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..", "..");
const PROMPT_PATH = path.join(rootDir, "scripts", "prompts", "assist-module-gemini-prompt.txt");
const TARGET_DIR = path.join(rootDir, "src", "engines", "assist");

function slugify(tag) {
  return String(tag)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function buildModuleSpecBlock({ moduleTag, concept, build, keyTeaching, newConcepts }) {
  return [
    `Module tag: ${moduleTag}`,
    `Concept: ${concept}`,
    `Build: ${build}`,
    `Key teaching: ${keyTeaching}`,
    newConcepts ? `New concepts: ${newConcepts}` : null,
  ]
    .filter(Boolean)
    .join("\n");
}

/** Permissive stand-ins for the two imports every generated module makes (`react`,
 * `../inpact_engine_shared`) — just enough surface that top-level module evaluation doesn't
 * crash on them, never real rendering. Anything else gets a no-op Proxy so an unanticipated
 * import doesn't fail validation for reasons unrelated to the module's own logic. */
function sandboxRequire(specifier) {
  if (specifier === "react") {
    const noop = () => undefined;
    return { __esModule: true, useState: () => [undefined, noop], useEffect: noop, useMemo: (fn) => fn(), useCallback: (fn) => fn, useRef: () => ({ current: undefined }), useContext: noop, default: { createElement: noop, Fragment: Symbol("Fragment") } };
  }
  if (specifier === "react/jsx-runtime" || specifier === "react/jsx-dev-runtime") {
    const stub = () => null;
    return { __esModule: true, jsx: stub, jsxs: stub, jsxDEV: stub, Fragment: Symbol("Fragment") };
  }
  if (specifier.includes("inpact_engine_shared")) {
    return { __esModule: true, default: () => ({}) };
  }
  // Anything else the model imports is unexpected — the master prompt only ever shows react and
  // the shared engine import, so a bare import of something else (msw, axios, lodash, ...) means
  // the model reached for a real library it doesn't actually need, usually while writing a
  // "testing" or "API call" themed lesson. Rather than mocking it permissively (which would let a
  // genuinely unresolvable import — one that was never `npm install`ed — sail through undetected,
  // exactly the failure mode found live: a draft imported 'msw/node', a package not in package.json
  // or node_modules at all, which would break Vite's bundling the moment this file is loaded by the
  // eager glob), actually check whether it resolves as a real installed package first. Only mock it
  // permissively if it does; throw a clear error if it doesn't, so this is caught before the write,
  // not discovered later by a human reviewing the draft in ID Studio.
  try {
    nodeRequire.resolve(specifier);
  } catch {
    throw new Error(
      `Generated module imports "${specifier}", which isn't installed in this project (not in package.json/node_modules). Assist modules should only ever import react and ../inpact_engine_shared.`
    );
  }
  const inert = () => inert;
  return new Proxy(inert, { get: () => inert });
}

/** Throws with a clear message if `code` isn't valid JSX/TSX, or if evaluating its top-level
 * module body throws at runtime. Two distinct failure classes, both real, both seen live:
 * (1) syntax — e.g. a literal newline inside a regular string instead of `\n` — caught by
 * esbuild's own parser (already a direct dependency via Vite).
 * (2) runtime reference errors — e.g. Gemini writes `${identifier}` inside a nested example-code
 * string meant to *display* as JSX text, when only `{identifier}` (no `$`) is safe there; the
 * unescaped `$` makes it a real template-literal interpolation that fires the moment the NODES
 * array literal is constructed, throwing `ReferenceError` at module load — which is exactly the
 * eager-glob blast radius (every file in src/engines/assist/ loads at once) this whole validation
 * step exists to keep out of the app. Syntax checking alone can't catch this: `${identifier}` is
 * syntactically fine, just wrong. Caught here by actually running the transpiled module's
 * top-level body in a sandboxed context with `react`/`inpact_engine_shared` stubbed out — cheap
 * because nothing in a real generated module does meaningful work outside a component's render,
 * so nothing legitimate should throw when only the top-level body executes. */
export function assertValidModule(code) {
  transformSync(code, { loader: "tsx", jsx: "automatic" }); // (1) syntax

  const { code: cjs } = transformSync(code, { loader: "tsx", jsx: "automatic", format: "cjs" });
  const moduleObj = { exports: {} };
  const context = vm.createContext({ module: moduleObj, exports: moduleObj.exports, require: sandboxRequire, console });
  try {
    new vm.Script(cjs, { filename: "generated-module-check.js" }).runInContext(context, { timeout: 2000 });
  } catch (err) {
    throw new Error(`Module throws at load time (not just a syntax issue): ${err?.message ?? err}`);
  }
}

/**
 * Generates one module and writes it to src/engines/assist/. Does NOT register it in the
 * Module Library — that's a separate, explicit "publish" step (Generate -> Review -> Publish),
 * same discipline SpecForge follows.
 *
 * Validated *before* it's written to disk — every file in src/engines/assist/ is loaded eagerly
 * by Assist Me's import.meta.glob, so one syntactically broken file there doesn't just fail that
 * one tutorial, it fails Vite's build for the entire app. A generation that can't be made valid
 * within one retry is a hard failure, on purpose — better than silently corrupting the app.
 */
export async function generateAssistModule(spec) {
  if (!fs.existsSync(PROMPT_PATH)) {
    throw new Error(`Prompt not found at ${PROMPT_PATH}`);
  }
  const masterPrompt = fs.readFileSync(PROMPT_PATH, "utf8");
  const filled = masterPrompt.replace("{{MODULE_SPEC}}", buildModuleSpecBlock(spec));

  let code;
  let lastError;
  for (let attempt = 0; attempt < 2; attempt++) {
    const prompt =
      attempt === 0
        ? filled
        : `${filled}\n\n---\n\nYour previous attempt was not valid JavaScript/JSX — it failed to parse with: ${lastError}\nReturn the corrected module as a single fenced code block, following every rule above exactly.`;

    const raw = await callGemini(prompt);
    const candidate = extractSingleTypescriptBlock(raw);
    if (!candidate.trim()) {
      lastError = "No parseable code block returned by draft generation.";
      continue;
    }
    try {
      assertValidModule(candidate);
      code = candidate;
      break;
    } catch (err) {
      lastError = err?.message ?? String(err);
    }
  }
  if (!code) {
    throw new Error(`Generated module failed to produce valid code after retry — not written to disk. Last error: ${lastError}`);
  }

  // .tsx, not .jsx: the master prompt generates TypeScript+JSX (interfaces, type annotations —
  // "JSX.Element is globally available in .tsx" is baked into its own rules), and Vite's react
  // plugin only applies the TS-aware transform to .tsx/.ts files. A generated file with real TS
  // syntax saved as .jsx passes esbuild's permissive validation (loader: "tsx" tolerates it) but
  // then breaks Vite's actual dev transform for the *whole app* — discovered live, the same
  // blast-radius failure mode as the raw-newline bug, just from the opposite direction: this file
  // was syntactically valid, just saved under the wrong extension for what it contains.
  const slug = slugify(spec.moduleTag);
  const fileName = `inpact_assist_${slug}_engine.tsx`;
  fs.mkdirSync(TARGET_DIR, { recursive: true });
  const outPath = path.join(TARGET_DIR, fileName);
  fs.writeFileSync(outPath, code, "utf8");

  return { fileName, filePath: outPath, code, slug };
}
