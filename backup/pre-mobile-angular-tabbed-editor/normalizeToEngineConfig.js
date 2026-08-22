/**
 * Adapter: AI lesson config (schema) → createINPACTEngine config (NODES, sideItems, etc.).
 * No executable evaluate() — use declarative evaluation only; shared engine uses answer_keywords.
 */

/**
 * Derive answerShape and defaultHtml from track so CSS lessons get HTML+CSS tabs and Angular gets Template+TS+CSS tabs.
 */
function getAnswerShapeForTrack(track) {
  if (!track) return { answerShape: "default", defaultHtml: undefined };
  const t = String(track).toLowerCase();
  if (t === "css") return { answerShape: "css-tabs", defaultHtml: '<div class="demo">Demo</div>' };
  if (t === "angular") return { answerShape: "angular-tabs", defaultHtml: undefined };
  return { answerShape: "default", defaultHtml: undefined };
}

/** Build full HTML document from css-tabs answer JSON for the Output tab. */
function cssTabsGetOutputPreview(answer) {
  let html = "";
  let css = "";
  try {
    const p = JSON.parse(answer || "{}");
    html = p.html ?? "";
    css = p.css ?? "";
  } catch (_) {
    css = answer || "";
  }
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${css}</style></head><body>${html || '<div class="demo">Demo</div>'}</body></html>`;
}

/**
 * @param {import("../schema.js").z.infer<typeof import("../schema.js").lessonConfigSchema>} lesson
 * @param {{ track?: string, getOutputPreview?: (code: string) => string, language?: string, answerShape?: string, defaultHtml?: string, defaultSeedCode?: string, skipIntroAndObjectives?: boolean }} options - Pass track to get correct tabs (css-tabs, angular-tabs).
 * @returns {{ NODES: object[], sideItems: { id: string, label: string }[], problemNum: number, title: string, shortName: string, language: string, getOutputPreview: (code: string) => string, answerShape: string, defaultHtml?: string, defaultSeedCode?: string }}
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
  } = options;
  const answerShape = optionAnswerShape ?? trackOpts.answerShape;
  const defaultHtml = optionDefaultHtml ?? trackOpts.defaultHtml;
  const getOutputPreview = optionGetOutputPreview ?? (answerShape === "css-tabs" ? cssTabsGetOutputPreview : (code) => "");

  const algoRevealTypes = ["problem", "example", "reasoning", "dryRun", "discovery", "reflection", "scale-problem", "concept-bridge", "reveal-idea", "flow-explainer", "complete"];
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
    return {
      id: step.id,
      type: "question",
      phase: step.phase,
      title: step.title,
      paal: step.instruction,
      hint: step.hint,
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
    problemNum: lesson.problemNum ?? 1,
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
