/**
 * Adapter: AI lesson config (schema) → createINPACTEngine config (NODES, sideItems, etc.).
 * No executable evaluate() — use declarative evaluation only; shared engine uses answer_keywords.
 */

/** Filenames used as editor tabs in multi-file seedCode (object keys). */
function seedTabNamesFromStep(seedCode) {
  if (typeof seedCode !== "object" || seedCode === null || Array.isArray(seedCode)) return [];
  return Object.keys(seedCode).filter((k) => /\.(tsx?|jsx?|vue|[cm]?js)$/i.test(k));
}

function learnerTextReferencesAnyTab(text, tabNames) {
  if (typeof text !== "string" || !text.trim()) return false;
  const lower = text.toLowerCase();
  return tabNames.some((n) => lower.includes(n.toLowerCase()));
}

/** Prefer App.vue / App.tsx / App.jsx / App.ts / App.js, else first tab name. */
function primaryMultiFileTab(tabNames) {
  if (!tabNames.length) return null;
  const rank = (n) => {
    if (/^app\.vue$/i.test(n)) return 0;
    if (/^app\.tsx$/i.test(n)) return 1;
    if (/^app\.jsx$/i.test(n)) return 2;
    if (/^app\.ts$/i.test(n)) return 3;
    if (/^app\.js$/i.test(n)) return 4;
    if (/^app\./i.test(n)) return 5;
    return 50;
  };
  const sorted = [...tabNames].sort((a, b) => rank(a) - rank(b));
  return sorted.find((n) => /^app\./i.test(n)) ?? sorted[0];
}

/** When the task clearly targets the API slice but the text never names a tab, prefix with api.ts (not App). */
function apiLikelyTabForInstruction(text, tabNames) {
  if (typeof text !== "string" || !tabNames.length) return null;
  const lower = text.toLowerCase();
  if (
    !/\b(getposts|getpost|createapi|endpoints|builder\.query|builder\.mutation|reducerpath|fetchbasequery|tagtypes|providestags|invalidatestags|rtk query)\b/.test(
      lower
    )
  ) {
    return null;
  }
  return tabNames.find((n) => /^api\./i.test(n)) || tabNames.find((n) => /api/i.test(n)) || null;
}

/**
 * If the learner text does not already name a tab file, prefix with `In **PrimaryTab**,`.
 * Keeps cached JSON lessons clear in the multi-file editor (import steps, etc.).
 */
export function prefixMultiFileLearnerText(text, seedCode) {
  const tabs = seedTabNamesFromStep(seedCode);
  if (!tabs.length) return text;
  if (typeof text !== "string" || !text.trim()) return text;
  if (learnerTextReferencesAnyTab(text, tabs)) return text;
  const primary = apiLikelyTabForInstruction(text, tabs) || primaryMultiFileTab(tabs);
  if (!primary) return text;
  const trimmed = text.trimStart();
  if (/^in\s+\*\*/i.test(trimmed)) return text;
  return `In **${primary}**, ${trimmed}`;
}

/**
 * Derive answerShape and defaultHtml from track so CSS lessons get HTML+CSS tabs and Angular (+ Mobile Angular) get TS+HTML+CSS tabs.
 */
function getAnswerShapeForTrack(track) {
  if (!track) return { answerShape: "default", defaultHtml: undefined };
  const t = String(track).toLowerCase();
  if (t === "css") return { answerShape: "css-tabs", defaultHtml: '<div class="demo">Demo</div>' };
  if (t === "angular" || t === "mobile-angular") return { answerShape: "angular-tabs", defaultHtml: undefined };
  return { answerShape: "default", defaultHtml: undefined };
}

function inferMultiFileLesson(lesson) {
  const title = String(lesson?.title || "").toLowerCase();
  if (/(redux toolkit|rtk query|createSlice|createAsyncThunk)/i.test(title)) return true;
  if (/\bcss modules\b/.test(title)) return true;
  const text = (lesson?.steps || [])
    .map((s) => `${s.title || ""}\n${s.instruction || ""}\n${s.expectedOutcome || ""}\n${s.seedCode || ""}`)
    .join("\n")
    .toLowerCase();
  if (/\bmodule\.css\b/.test(text)) return true;
  return /(\bstore\b.*\bselector\b.*\bcomponent\b)|(\bselector\b.*\bstore\b.*\bcomponent\b)|\bstore\.ts\b|\bselectors?\.ts\b/.test(text);
}

/** Build full HTML document from css-tabs answer JSON for the Output tab. */
function cssTabsGetOutputPreview(answer) {
  let html = "";
  let css = "";
  try {
    const p = JSON.parse(answer || "{}");
    html = p.html ?? "";
    css = p.css ?? "";
  } catch {
    css = answer || "";
  }
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${css}</style></head><body>${html || '<div class="demo">Demo</div>'}</body></html>`;
}

/**
 * @param {import("../schema.js").z.infer<typeof import("../schema.js").lessonConfigSchema>} lesson
 * @param {{ track?: string, getOutputPreview?: (code: string) => string, language?: string, answerShape?: string, defaultHtml?: string, defaultSeedCode?: string, skipIntroAndObjectives?: boolean, lessonNumFallback?: number }} options - Pass track to get correct tabs (css-tabs, angular-tabs). Use lessonNumFallback when lesson JSON omits lessonNum (e.g. list index + 1).
 * @returns {{ NODES: object[], sideItems: { id: string, label: string }[], lessonNum: number, title: string, shortName: string, language: string, getOutputPreview: (code: string) => string, answerShape: string, defaultHtml?: string, defaultSeedCode?: string }}
 */
export function aiLessonToEngineConfig(lesson, options = {}) {
  const trackOpts = getAnswerShapeForTrack(options.track);
  const {
    getOutputPreview: optionGetOutputPreview,
    language = "javascript",
    answerShape: optionAnswerShape,
    defaultHtml: optionDefaultHtml,
    defaultSeedCode,
    skipIntroAndObjectives = false,
    lessonNumFallback,
  } = options;
  const answerShape = optionAnswerShape ?? lesson.answerShape ?? (inferMultiFileLesson(lesson) ? "multi-file" : trackOpts.answerShape);
  const defaultHtml = optionDefaultHtml ?? trackOpts.defaultHtml;
  const getOutputPreview = optionGetOutputPreview ?? (answerShape === "css-tabs" ? cssTabsGetOutputPreview : undefined);

  const algoRevealTypes = ["lesson", "example", "reasoning", "dryRun", "discovery", "reflection", "scale-problem", "concept-bridge", "reveal-idea", "flow-explainer", "complete"];
  const isAlgoLesson = lesson.steps.some(
    (s) => algoRevealTypes.includes(s.type) || s.type === "flowchart"
  );

  const algorithmFamily = lesson.algorithmFamily || (options.track === "algorithms" ? "array-hashmap" : null);
  const stepNodes = lesson.steps.map((step) => {
    if (algoRevealTypes.includes(step.type)) {
      const content = step.content ?? { body: "", title: step.title ?? step.phase };
      let exampleArray = content.exampleArray;
      let target = content.target;
      let prompt = content.prompt;
      let successMessage = content.successMessage;
      if (algorithmFamily === "array-hashmap" && (step.type === "discovery" || step.type === "scale-problem") && !Array.isArray(exampleArray)) {
        const id = (step.id || "").toLowerCase();
        const phase = (step.phase || "").toLowerCase();
        if (id.includes("discovery-1") || phase.includes("try it")) {
          exampleArray = [1, 2, 3];
          target = 3;
          prompt = prompt || "Which two numbers add to 3?";
          successMessage = successMessage || "Nice! 1 and 2 add to 3.";
        } else if (id.includes("discovery-2") || phase.includes("bigger array")) {
          exampleArray = [2, 7, 11, 15, 3];
          target = 9;
          prompt = prompt || "Which two numbers add to 9?";
          successMessage = successMessage || "Well done! 2 and 7 add to 9.";
        } else if (id.includes("discovery-3") || phase.includes("one more")) {
          exampleArray = [1, 3, 5, 7, 9, 11, 2, 4, 6, 8];
          target = 12;
          prompt = prompt || "Which two numbers add to 12?";
          successMessage = successMessage || "Great! You checked pairs until you found a match.";
        }
      }
      return {
        id: step.id,
        type: step.type,
        phase: step.phase,
        title: step.title,
        content: {
          body: content.body ?? "",
          title: content.title ?? step.phase,
          visualMetaphor: content.visualMetaphor,
          mentalModel: content.mentalModel,
          conceptBridge: content.conceptBridge,
          prompt,
          exampleArray,
          target,
          successMessage,
          showMeFirst: content.showMeFirst,
          illustratedExample: content.illustratedExample,
          commonConfusions: content.commonConfusions,
        },
      };
    }
    if (step.type === "flowchart") {
      return {
        id: step.id,
        type: "flowchart",
        phase: step.phase,
        title: step.title,
        content: step.content ?? { body: "", title: "Flowchart" },
        flowchart: step.flowchart ?? { nodes: [], edges: [] },
      };
    }
    const required = step.evaluation?.required ?? step.answer_keywords ?? [];
    const keywords = Array.isArray(required) ? required.map((k) => (typeof k === "string" ? k : String(k))) : [];
    const instruction =
      answerShape === "multi-file" ? prefixMultiFileLearnerText(step.instruction, step.seedCode) : step.instruction;
    const hint =
      answerShape === "multi-file" ? prefixMultiFileLearnerText(step.hint, step.seedCode) : step.hint;
    return {
      id: step.id,
      type: "question",
      phase: step.phase,
      title: step.title,
      paal: instruction,
      hint,
      seed_code: step.seedCode,
      example_code: step.analogousExample,
      expected: step.expectedOutcome,
      successCriteria: step.successCriteria,
      feedback_correct: step.feedbackCorrect,
      feedback_partial: step.feedbackPartial,
      feedback_wrong: step.feedbackWrong,
      answer_keywords: keywords,
      correctThreshold: step.evaluation?.correctThreshold ?? 0.6,
      partialThreshold: step.evaluation?.partialThreshold ?? 0.4,
      introduces_concepts: Array.isArray(step.introducesConcepts)
        ? step.introducesConcepts.map((id) => (typeof id === "string" ? id : String(id)))
        : undefined,
    };
  });

  const NODES = skipIntroAndObjectives
    ? stepNodes
    : [
        {
          id: "intro",
          type: "reveal",
          phase: "Lesson",
          content: {
            tag: lesson.intro.tag,
            title: lesson.intro.title,
            body: lesson.intro.body,
            usecase: lesson.intro.usecase,
          },
        },
        {
          id: "objectives",
          type: "objectives",
          phase: "Objectives",
          items: lesson.objectives,
        },
        ...stepNodes,
      ];

  const stepSideItems = lesson.steps.map((s) => ({ id: s.id, label: s.title || s.content?.title || s.id }));
  const sideItems = skipIntroAndObjectives
    ? stepSideItems
    : (lesson.sideItems?.length > 0 ? lesson.sideItems : [{ id: "intro", label: "Intro" }, { id: "objectives", label: "Objectives" }, ...stepSideItems]);

  // Algorithm lessons must not fall back to React boilerplate when a question step has empty seedCode
  const algoDefaultSeedCode = "// Your solution here\nfunction solution() {\n  // Your code here\n  return;\n}";
  const effectiveDefaultSeedCode = isAlgoLesson ? (defaultSeedCode ?? algoDefaultSeedCode) : defaultSeedCode;

  const out = {
    NODES,
    sideItems,
    lessonNum: lesson.lessonNum ?? lessonNumFallback ?? 1,
    title: lesson.title,
    shortName: lesson.shortName ?? lesson.title,
    language,
    getOutputPreview,
    answerShape,
    defaultHtml,
    defaultSeedCode: effectiveDefaultSeedCode,
    /** When true, code check uses AI (DeepSeek) via onValidateCode instead of keyword matching. */
    validateWithAI: true,
  };
  if (skipIntroAndObjectives && lesson.intro) {
    out.lessonIntro = lesson.intro;
    out.lessonObjectives = Array.isArray(lesson.objectives) ? lesson.objectives : [];
  }
  return out;
}
