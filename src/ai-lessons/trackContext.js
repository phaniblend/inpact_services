/**
 * Central track-to-context mapping for AI lesson generation and validation.
 * Ensures prompts and validation are language- and framework-aware (e.g. React TypeScript vs React JavaScript).
 * User click on a lesson card determines the track; track drives all generation and validation context.
 */

/**
 * @typedef {Object} TrackContext
 * @property {string} track - Original track id (e.g. "react-ts", "react-js")
 * @property {string} framework - Framework name for prompts (e.g. "React", "Angular")
 * @property {string} language - Language name (e.g. "TypeScript", "JavaScript")
 * @property {string} fileMode - File extension / mode (e.g. "TSX", "JSX", "TS")
 * @property {string} syntaxRules - Instructions for code generation (language-specific)
 * @property {string} validationRules - Instructions for code validation (language-specific)
 */

const DEFAULT_SYNTAX_JS = `Use JavaScript only. No TypeScript types or interfaces. Code must be valid JS/JSX.`;
const EXECUTION_CORRECTNESS_COMMON = `Execution correctness: Function and method calls must pass every required argument implied by the learner's definitions or the step. Omitting required parameters (except optional ones marked with ? in TypeScript) is always wrong for runnable code.`;

const DEFAULT_VALIDATION_JS = `Validate as JavaScript/JSX. Accept valid JS only. Do not require TypeScript syntax or type annotations.
${EXECUTION_CORRECTNESS_COMMON}`;

const REACT_VALIDATION_EXTRA = `React/JSX: onClick={handler} passes only the synthetic event. If handler needs more than one user-supplied value, the learner must wrap it, e.g. onClick={() => handler(a, b)}. Too few arguments in inline handlers is wrong.`;

const DEFAULT_SYNTAX_TS = `Use TypeScript only. All code must be valid TypeScript/TSX: use type annotations or rely on correct inference; prefer interfaces/types for props and state where appropriate. No plain JavaScript without types unless the step explicitly allows it.`;
const DEFAULT_VALIDATION_TS = `Validate as TypeScript/TSX. Expect type-safe code. Accept idiomatic TypeScript (explicit or inferred types). Do not wrongly reject inferred typing when it is correct.
- Component return type: When the step asks to "create a functional component named X that returns a JSX element" (or similar), accept BOTH function ComponentName() { return <...> } and function ComponentName(): JSX.Element { return <...> }, and arrow forms like \`const X = (): JSX.Element => { ... }\`. Prefer explicit \`: JSX.Element\` (or \`JSX.Element | null\` when needed) on the function; avoid \`React.FC\` in new code. Do NOT require an explicit return type unless the step explicitly asks for it. Inferred return type from return <...> is valid TypeScript. Mark as "correct" when the component has the required name and returns JSX when inference or explicit typing is satisfied.
- Props without using them in the body: If the step types props (e.g. \`SomeProps\`) but does not ask to read props in JSX yet, accept \`const C = (_props: SomeProps): JSX.Element => { return <h1>...</h1>; }\` or \`const C = (): JSX.Element => { ... }\` when props are unused, unless the step requires a parameter. Do not require \`React.FC<SomeProps>\`.
- Do not accept plain JavaScript that ignores types when the lesson is TypeScript, except for the component shape above (creating a component that returns JSX is valid with or without explicit return type).
- When the step asks to define an interface or type, it must be at module level (outside any component or function); defining it inside the component is incorrect — mark wrong or partial and give pinpointing feedback (where it is, that it must be outside, and what to do).
${EXECUTION_CORRECTNESS_COMMON}
- JSX and frameworks: template/event bindings must supply enough arguments for helpers. Vue/Angular template expressions and React inline handlers follow the same arity rule.`;

/** Per-track language & quality rules (combined with universal prompt block in codeValidation.js). */
const CHECKLIST_PYTHON_LANG = `Python 3: meaningful indentation; imports, def/class, and colons must be valid. Required imports or names from the step must appear. Call sites must match each def’s required parameters (after skipping self and defaulted parameters).`;

const CHECKLIST_JAVA_LANG = `Java: valid compilation-level syntax for the lesson; packages/imports, generics, and modifiers when specified. Method and constructor calls must pass every required argument.`;

const CHECKLIST_CPP_LANG = `C++: valid syntax for the standard you assume (C++17+ unless the step says otherwise); headers, classes, pointers/references, and memory usage must match the step. Call sites must pass every required argument implied by declarations.`;

const CHECKLIST_VUE_LANG = `Vue: template, script, and style (if any) must work together; template event bindings must call defined methods with correct argument counts.`;

const CHECKLIST_NODE_LANG = `Node.js: idiomatic CommonJS or ESM as the step teaches (do not mix incorrectly). Callback signatures (e.g. err-first) and Promise/async usage must match the APIs the step references.`;

const CHECKLIST_EXPRESS_LANG = `Express: app.METHOD routing, middleware order, req/res/next, and body parsing when the success criteria depend on request bodies or status codes.`;

const CHECKLIST_CSS_LANG = `CSS: only valid rules; selectors and properties named in success criteria must be present and syntactically sound. Shorthand vs longhand is fine if behavior matches the step.`;

const CHECKLIST_ALGO_LANG = `Algorithms: grade logic and completeness for the stated lesson, not buzzwords. If criteria mention boundaries, empty inputs, or complexity goals, the code or explanation must reflect them.`;

const CHECKLIST_PLAIN_JS = `Plain JavaScript: valid ES syntax for the environment implied by the step (browser vs Node); module system consistent with seed and instruction.`;

const CHECKLIST_STANDALONE_TS = `TypeScript modules: exports, types, and inference appropriate to the step; no invalid any-casts to hide mistakes when the step expects type safety.`;

const CHECKLIST_FE_ENG = `Frontend engineering: valid JavaScript/CSS/HTML as required; performance, accessibility, or API usage only when success criteria mention them.`;

const CHECKLIST_NARRATIVE_LANG = `Non-code steps: each success criterion must be clearly satisfied with technically accurate prose or structured reasoning. Vague or incorrect claims fail.`;

/** Track id -> context. Extend as new tracks are added. */
const TRACK_CONTEXT_MAP = {
  "react-js": {
    framework: "React",
    language: "JavaScript",
    fileMode: "JSX",
    syntaxRules: DEFAULT_SYNTAX_JS,
    validationRules: `${DEFAULT_VALIDATION_JS}\n${REACT_VALIDATION_EXTRA}`,
  },
  "react-ts": {
    framework: "React",
    language: "TypeScript",
    fileMode: "TSX",
    syntaxRules: DEFAULT_SYNTAX_TS,
    validationRules: `${DEFAULT_VALIDATION_TS}\n${REACT_VALIDATION_EXTRA}`,
  },
  angular: {
    framework: "Angular",
    language: "TypeScript",
    fileMode: "TS",
    syntaxRules: `Use TypeScript and Angular conventions. Components, services, and templates must be valid Angular/TS. ${DEFAULT_SYNTAX_TS}`,
    validationRules: `${DEFAULT_VALIDATION_TS} Angular: single-file TS with optional inline template (template: \`...\`) and styles (styles: [\`...\`]). Judge the merged behavior implied by decorator + class + template string. Do not claim "empty template" when template: contains real markup.
- Imports: symbols the step requires (e.g. RouterModule, FormsModule, specific decorators) must appear and be used coherently with components/services in the submission.
- Template event bindings: methods with required parameters must receive them in the template; (click)="fn()" is wrong when fn(a,b) needs two values unless parameters are optional.`,
  },
  "mobile-angular": {
    framework: "Ionic + Angular + Capacitor",
    language: "TypeScript",
    fileMode: "TS",
    syntaxRules: `Use TypeScript with Ionic Angular and Capacitor conventions. Prefer Ionic UI components (Ion*), Angular standalone components, and Capacitor plugin APIs where relevant. ${DEFAULT_SYNTAX_TS}`,
    validationRules: `${DEFAULT_VALIDATION_TS} Mobile Angular: Ionic (Ion*) components and Capacitor APIs when the step teaches native or mobile UI. Prefer standalone patterns the lesson uses.
- Imports must reflect the step (Ionic modules, Angular router, Capacitor plugins) and be wired correctly.
- Template bindings: required method parameters must be passed from the template; parity with core Angular rules.`,
  },
  vue: {
    framework: "Vue",
    language: "JavaScript",
    fileMode: "Vue (JS)",
    syntaxRules: DEFAULT_SYNTAX_JS,
    validationRules: `${DEFAULT_VALIDATION_JS}\n${CHECKLIST_VUE_LANG}`,
  },
  js: {
    framework: "JavaScript",
    language: "JavaScript",
    fileMode: "JS",
    syntaxRules: DEFAULT_SYNTAX_JS,
    validationRules: `${DEFAULT_VALIDATION_JS}\n${CHECKLIST_PLAIN_JS}`,
  },
  ts: {
    framework: "TypeScript",
    language: "TypeScript",
    fileMode: "TS",
    syntaxRules: DEFAULT_SYNTAX_TS,
    validationRules: `${DEFAULT_VALIDATION_TS}\n${CHECKLIST_STANDALONE_TS}`,
  },
  node: {
    framework: "Node.js",
    language: "JavaScript",
    fileMode: "JS",
    syntaxRules: DEFAULT_SYNTAX_JS,
    validationRules: `${DEFAULT_VALIDATION_JS}\n${CHECKLIST_NODE_LANG}`,
  },
  express: {
    framework: "Express",
    language: "JavaScript",
    fileMode: "JS",
    syntaxRules: DEFAULT_SYNTAX_JS,
    validationRules: `${DEFAULT_VALIDATION_JS}\n${CHECKLIST_NODE_LANG}\n${CHECKLIST_EXPRESS_LANG}`,
  },
  python: {
    framework: "Python",
    language: "Python",
    fileMode: "PY",
    syntaxRules: "Use Python 3 only. Valid Python syntax.",
    validationRules: `Validate as Python 3. Accept valid Python only.\n${EXECUTION_CORRECTNESS_COMMON}\n${CHECKLIST_PYTHON_LANG}`,
  },
  "algo-js": {
    framework: "Algorithms",
    language: "JavaScript",
    fileMode: "JS",
    syntaxRules: `Algorithm lessons: teach the pattern/concept in plain JavaScript. ${DEFAULT_SYNTAX_JS} Use functions, arrays, and standard JS; no React or DOM unless the algorithm lesson requires it.`,
    validationRules: `${DEFAULT_VALIDATION_JS}\n${CHECKLIST_ALGO_LANG}`,
  },
  "algo-ts": {
    framework: "Algorithms",
    language: "TypeScript",
    fileMode: "TS",
    syntaxRules: `Algorithm lessons: teach the pattern/concept in TypeScript. ${DEFAULT_SYNTAX_TS} Use functions, arrays, and types; no React or DOM unless the algorithm lesson requires it.`,
    validationRules: `${DEFAULT_VALIDATION_TS}\n${CHECKLIST_ALGO_LANG}`,
  },
  "algo-python": {
    framework: "Algorithms",
    language: "Python",
    fileMode: "PY",
    syntaxRules: "Algorithm lessons: teach the pattern/concept in Python 3. Use functions, lists, dicts; valid Python 3 syntax only.",
    validationRules: `Validate as Python 3. Accept valid Python only.\n${EXECUTION_CORRECTNESS_COMMON}\n${CHECKLIST_PYTHON_LANG}\n${CHECKLIST_ALGO_LANG}`,
  },
  "algo-java": {
    framework: "Algorithms",
    language: "Java",
    fileMode: "JAVA",
    syntaxRules: "Algorithm lessons: teach the pattern/concept in Java. Use classes/methods, arrays/collections; valid Java syntax. Prefer Java 11+ style.",
    validationRules: `Validate as Java. Accept valid Java only. Do not require a specific IDE or build tool.\n${EXECUTION_CORRECTNESS_COMMON}\n${CHECKLIST_JAVA_LANG}\n${CHECKLIST_ALGO_LANG}`,
  },
  "algo-cpp": {
    framework: "Algorithms",
    language: "C++",
    fileMode: "CPP",
    syntaxRules:
      "Algorithm lessons: teach the pattern/concept in C++. Use classes, structs, pointers or references as appropriate; valid ISO C++ syntax.",
    validationRules: `Validate as C++. Accept valid C++ only. Do not require a specific compiler vendor.\n${EXECUTION_CORRECTNESS_COMMON}\n${CHECKLIST_CPP_LANG}\n${CHECKLIST_ALGO_LANG}`,
  },
  css: {
    framework: "CSS",
    language: "CSS",
    fileMode: "CSS",
    syntaxRules: "Use valid CSS. No JavaScript or preprocessor unless specified.",
    validationRules: `Validate as CSS. Accept valid CSS only.\n${CHECKLIST_CSS_LANG}`,
  },
  sd: { framework: "System Design", language: "N/A", fileMode: "N/A", syntaxRules: "", validationRules: `Evaluate design and explanation quality.\n${CHECKLIST_NARRATIVE_LANG}` },
  pe: { framework: "Production Engineering", language: "N/A", fileMode: "N/A", syntaxRules: "", validationRules: `Evaluate production/SRE reasoning and practices.\n${CHECKLIST_NARRATIVE_LANG}` },
  sec: { framework: "Security", language: "N/A", fileMode: "N/A", syntaxRules: "", validationRules: `Evaluate security reasoning; if code appears, it must be both secure in intent and valid for the language.\n${CHECKLIST_NARRATIVE_LANG}` },
  el: { framework: "Engineering Leadership", language: "N/A", fileMode: "N/A", syntaxRules: "", validationRules: `Evaluate leadership and communication content.\n${CHECKLIST_NARRATIVE_LANG}` },
  fe: { framework: "Frontend Engineering", language: "JavaScript", fileMode: "JS", syntaxRules: DEFAULT_SYNTAX_JS, validationRules: `${DEFAULT_VALIDATION_JS}\n${CHECKLIST_FE_ENG}` },
};

/**
 * Get full context for a track. Used by generation prompts and validation.
 * @param {string} track - Track id from UI (e.g. "react-ts", "react-js")
 * @returns {TrackContext}
 */
export function getTrackContext(track) {
  if (!track || typeof track !== "string") {
    return {
      track: "general",
      framework: "General",
      language: "JavaScript",
      fileMode: "JS",
      syntaxRules: DEFAULT_SYNTAX_JS,
      validationRules: DEFAULT_VALIDATION_JS,
    };
  }
  const t = track.toLowerCase().trim();
  const ctx = TRACK_CONTEXT_MAP[t];
  if (ctx) {
    return { track: t, ...ctx };
  }
  if (t.includes("ts") || t.includes("typescript")) {
    return {
      track: t,
      framework: "General",
      language: "TypeScript",
      fileMode: "TS",
      syntaxRules: DEFAULT_SYNTAX_TS,
      validationRules: DEFAULT_VALIDATION_TS,
    };
  }
  return {
    track: t,
    framework: "General",
    language: "JavaScript",
    fileMode: "JS",
    syntaxRules: DEFAULT_SYNTAX_JS,
    validationRules: DEFAULT_VALIDATION_JS,
  };
}

/**
 * Get language for validation API (e.g. "typescript", "javascript").
 * @param {string} track
 * @returns {string}
 */
export function getLanguageForValidation(track) {
  const ctx = getTrackContext(track);
  return ctx.language.toLowerCase().replace(/\s/g, "");
}

/** API / picker value → canonical id used for algorithm validation routing. */
export function normalizeValidationLanguage(input) {
  if (input == null || input === "") return null;
  const s = String(input)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "");
  const map = {
    js: "javascript",
    javascript: "javascript",
    ts: "typescript",
    tsx: "typescript",
    typescript: "typescript",
    py: "python",
    python: "python",
    java: "java",
    cpp: "cpp",
    "c++": "cpp",
    cxx: "cpp",
  };
  return map[s] ?? null;
}

const ALGO_RULE_TRACK_BY_LANG = {
  javascript: "algo-js",
  typescript: "algo-ts",
  python: "algo-python",
  java: "algo-java",
  cpp: "algo-cpp",
};

/**
 * Build { language, framework, validationRules } for AI validation prompts, plus guard hints.
 * @param {{ track?: string, explicitLanguage?: string, codeValidationProfile?: "algorithm" }} opts
 * @returns {{ languageOrContext: string|{ language: string, framework: string, validationRules: string }, validationLanguageForGuards: string|undefined, skipFrameworkGuards: boolean }}
 */
export function getValidationPromptContext(opts) {
  const { track, explicitLanguage, codeValidationProfile } = opts;
  const trackCtx = track ? getTrackContext(track) : null;

  if (codeValidationProfile === "algorithm") {
    const norm =
      normalizeValidationLanguage(explicitLanguage) ||
      (track ? normalizeValidationLanguage(getLanguageForValidation(track)) : null) ||
      "typescript";
    const ruleTrack = ALGO_RULE_TRACK_BY_LANG[norm];
    if (!ruleTrack) {
      throw new Error(`Unsupported algorithm validation language: ${explicitLanguage || norm}`);
    }
    const ctx = getTrackContext(ruleTrack);
    return {
      languageOrContext: {
        language: ctx.language.toLowerCase().replace(/\s/g, ""),
        framework: ctx.framework,
        validationRules: ctx.validationRules,
      },
      validationLanguageForGuards: norm,
      skipFrameworkGuards: true,
    };
  }

  if (trackCtx && track) {
    return {
      languageOrContext: {
        language: getLanguageForValidation(track),
        framework: trackCtx.framework,
        validationRules: trackCtx.validationRules,
      },
      validationLanguageForGuards: normalizeValidationLanguage(getLanguageForValidation(track)) || undefined,
      skipFrameworkGuards: false,
    };
  }

  const lang = normalizeValidationLanguage(explicitLanguage) || "javascript";
  return {
    languageOrContext: lang,
    validationLanguageForGuards: lang,
    skipFrameworkGuards: false,
  };
}

export default getTrackContext;
