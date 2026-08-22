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
- Component return type: When the step asks to "create a functional component named X that returns a JSX element" (or similar), accept BOTH function ComponentName() { return <...> } and function ComponentName(): JSX.Element { return <...> }. Do NOT require an explicit : JSX.Element or React.FC unless the step explicitly asks for it. Inferred return type from return <...> is valid TypeScript. Mark as "correct" when the component has the required name and returns JSX, whether or not the learner added a return type annotation.
- Do not accept plain JavaScript that ignores types when the lesson is TypeScript, except for the component shape above (creating a component that returns JSX is valid with or without explicit return type).
- When the step asks to define an interface or type, it must be at module level (outside any component or function); defining it inside the component is incorrect — mark wrong or partial and give pinpointing feedback (where it is, that it must be outside, and what to do).
${EXECUTION_CORRECTNESS_COMMON}
- JSX and frameworks: template/event bindings must supply enough arguments for helpers. Vue/Angular template expressions and React inline handlers follow the same arity rule.`;

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
    validationRules: `${DEFAULT_VALIDATION_TS} Angular: the code is a single TS file; the component may have inline template (template: \`...\`) and/or styles (styles: [\`...\`]). Judge the actual template and styles content present in the code. Do not report "template is empty" or "missing template" if the @Component decorator clearly contains a non-empty template string (e.g. template: \`<div class="status-card">...</div>\`). Only fail for missing required elements (e.g. div with a required class) when that element is truly absent from the template string in the code.
- Template event bindings: If the class defines a method with one or more required parameters (e.g. updateStatus(a, b) or updateStatus = (a, b) =>), a template call such as (click)="updateStatus()" without passing those arguments is incorrect — mark wrong or partial and say they must pass one argument per required parameter (literals, properties, or $event as appropriate). Empty parentheses are only valid when the method truly has zero required parameters.`,
  },
  "mobile-angular": {
    framework: "Ionic + Angular + Capacitor",
    language: "TypeScript",
    fileMode: "TS",
    syntaxRules: `Use TypeScript with Ionic Angular and Capacitor conventions. Prefer Ionic UI components (Ion*), Angular standalone components, and Capacitor plugin APIs where relevant. ${DEFAULT_SYNTAX_TS}`,
    validationRules: `${DEFAULT_VALIDATION_TS} Mobile Angular: prefer Ionic components/services where the step expects mobile UI behavior (IonTabs, IonModal, IonInput, IonRefresher, etc.) and Capacitor plugin APIs for native features (camera, geolocation, push, preferences, network).
- Template event bindings must pass one argument per required component method parameter; (click)="handler()" is wrong when handler(a, b) requires two values.`,
  },
  vue: {
    framework: "Vue",
    language: "JavaScript",
    fileMode: "Vue (JS)",
    syntaxRules: DEFAULT_SYNTAX_JS,
    validationRules: DEFAULT_VALIDATION_JS,
  },
  js: {
    framework: "JavaScript",
    language: "JavaScript",
    fileMode: "JS",
    syntaxRules: DEFAULT_SYNTAX_JS,
    validationRules: DEFAULT_VALIDATION_JS,
  },
  ts: {
    framework: "TypeScript",
    language: "TypeScript",
    fileMode: "TS",
    syntaxRules: DEFAULT_SYNTAX_TS,
    validationRules: DEFAULT_VALIDATION_TS,
  },
  node: {
    framework: "Node.js",
    language: "JavaScript",
    fileMode: "JS",
    syntaxRules: DEFAULT_SYNTAX_JS,
    validationRules: DEFAULT_VALIDATION_JS,
  },
  express: {
    framework: "Express",
    language: "JavaScript",
    fileMode: "JS",
    syntaxRules: DEFAULT_SYNTAX_JS,
    validationRules: DEFAULT_VALIDATION_JS,
  },
  python: {
    framework: "Python",
    language: "Python",
    fileMode: "PY",
    syntaxRules: "Use Python 3 only. Valid Python syntax.",
    validationRules: `Validate as Python 3. Accept valid Python only.\n${EXECUTION_CORRECTNESS_COMMON}`,
  },
  "algo-js": {
    framework: "Algorithms",
    language: "JavaScript",
    fileMode: "JS",
    syntaxRules: `Algorithm lessons: teach the pattern/concept in plain JavaScript. ${DEFAULT_SYNTAX_JS} Use functions, arrays, and standard JS; no React or DOM unless the algorithm lesson requires it.`,
    validationRules: DEFAULT_VALIDATION_JS,
  },
  "algo-ts": {
    framework: "Algorithms",
    language: "TypeScript",
    fileMode: "TS",
    syntaxRules: `Algorithm lessons: teach the pattern/concept in TypeScript. ${DEFAULT_SYNTAX_TS} Use functions, arrays, and types; no React or DOM unless the algorithm lesson requires it.`,
    validationRules: DEFAULT_VALIDATION_TS,
  },
  "algo-python": {
    framework: "Algorithms",
    language: "Python",
    fileMode: "PY",
    syntaxRules: "Algorithm lessons: teach the pattern/concept in Python 3. Use functions, lists, dicts; valid Python 3 syntax only.",
    validationRules: `Validate as Python 3. Accept valid Python only.\n${EXECUTION_CORRECTNESS_COMMON}`,
  },
  "algo-java": {
    framework: "Algorithms",
    language: "Java",
    fileMode: "JAVA",
    syntaxRules: "Algorithm lessons: teach the pattern/concept in Java. Use classes/methods, arrays/collections; valid Java syntax. Prefer Java 11+ style.",
    validationRules: `Validate as Java. Accept valid Java only. Do not require a specific IDE or build tool.\n${EXECUTION_CORRECTNESS_COMMON}`,
  },
  css: {
    framework: "CSS",
    language: "CSS",
    fileMode: "CSS",
    syntaxRules: "Use valid CSS. No JavaScript or preprocessor unless specified.",
    validationRules: "Validate as CSS. Accept valid CSS only.",
  },
  sd: { framework: "System Design", language: "N/A", fileMode: "N/A", syntaxRules: "", validationRules: "Evaluate design and explanation only." },
  pe: { framework: "Production Engineering", language: "N/A", fileMode: "N/A", syntaxRules: "", validationRules: "Evaluate explanation and practices only." },
  sec: { framework: "Security", language: "N/A", fileMode: "N/A", syntaxRules: "", validationRules: "Evaluate security reasoning and code only." },
  el: { framework: "Engineering Leadership", language: "N/A", fileMode: "N/A", syntaxRules: "", validationRules: "Evaluate content only." },
  fe: { framework: "Frontend Engineering", language: "JavaScript", fileMode: "JS", syntaxRules: DEFAULT_SYNTAX_JS, validationRules: DEFAULT_VALIDATION_JS },
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

export default getTrackContext;
