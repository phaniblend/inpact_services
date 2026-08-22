/**
 * Parse Socratic algorithm lesson markdown (sections 1–9) into steps for the engine.
 * Sections: 1. HOOK, 2. CHALLENGE, 3. DISCOVER, 4. VISUALIZE, 5. DRY RUN, 6. BRIDGE, 7. BUILD, 8. VERIFY, 9. REFLECT.
 */

const SECTION_HEADER_REGEX = /^##\s*(\d+)\.\s*(.+)$/gm;

const SECTION_IDS = [
  "hook",
  "challenge",
  "discover",
  "visualize",
  "dryRun",
  "bridge",
  "build",
  "verify",
  "reflect",
];

/**
 * Split raw markdown into sections by ## N. TITLE.
 * @param {string} raw
 * @returns {{ id: string, title: string, body: string }[]}
 */
export function parseSocraticSections(raw) {
  if (!raw || typeof raw !== "string") return [];
  const matches = [];
  let match;
  SECTION_HEADER_REGEX.lastIndex = 0;
  while ((match = SECTION_HEADER_REGEX.exec(raw)) !== null) {
    const num = parseInt(match[1], 10);
    if (num < 1 || num > 9) continue;
    const title = match[2].trim().replace(/\s*\([^)]*\)\s*$/, "").trim();
    matches.push({ num, title, index: match.index });
  }

  const sections = [];
  for (let i = 0; i < matches.length; i++) {
    const start = matches[i].index;
    const end = i + 1 < matches.length ? matches[i + 1].index : raw.length;
    let body = raw.slice(start, end);
    const headerLine = body.match(/^##\s*\d+\.\s*.+[\r\n]*/m);
    if (headerLine) body = body.slice(headerLine[0].length).trim();
    const id = SECTION_IDS[matches[i].num - 1];
    sections.push({
      id,
      num: matches[i].num,
      title: matches[i].title ?? id,
      body,
    });
  }
  return sections;
}

const CODE_BLOCK_REGEX = /```(?:[\w+-]*)\n?([\s\S]*?)```/g;

/**
 * Extract code blocks from a section (e.g. BUILD). Returns the last block as "full" and all blocks.
 * @param {string} body
 * @returns {{ full: string, blocks: string[] }}
 */
export function extractCodeBlocks(body) {
  const blocks = [];
  let m;
  CODE_BLOCK_REGEX.lastIndex = 0;
  while ((m = CODE_BLOCK_REGEX.exec(body)) !== null) {
    blocks.push(m[1].trim());
  }
  return {
    blocks,
    full: blocks.length > 0 ? blocks[blocks.length - 1] : "",
  };
}

/**
 * Map parsed Socratic sections to engine steps (lesson, example, reasoning, dryRun, question).
 * BUILD becomes one question step with extracted seed code.
 * @param {{ id: string, title: string, body: string }[]} sections
 * @param {{ lessonTitle: string, language: string }} opts
 * @returns {object[]} steps (schema-compatible)
 */
export function socraticSectionsToSteps(sections, opts = {}) {
  const { lessonTitle = "", language = "JavaScript" } = opts;
  const steps = [];

  const phaseLabels = {
    hook: "Hook",
    challenge: "Challenge",
    discover: "Discover",
    visualize: "Visualize",
    dryRun: "Dry Run",
    bridge: "Bridge",
    build: "Build",
    verify: "Verify",
    reflect: "Reflect",
  };

  for (const sec of sections) {
    const phase = phaseLabels[sec.id] ?? sec.title;
    if (sec.id === "build") {
      const { full: buildCode } = extractCodeBlocks(sec.body);
      steps.push({
        type: "question",
        id: "build",
        phase: "Implement",
        title: "Build",
        instruction: `Implement ${lessonTitle} in ${language} as shown in the lesson. You can refer to the BUILD section above for the complete solution, then try writing it yourself in the editor.`,
        seedCode: buildCode || `// Implement ${lessonTitle}\n// Use the steps from the lesson above.`,
        successCriteria: ["Correct algorithm logic", "Matches the dry run behavior"],
        feedbackCorrect: "Your implementation matches the algorithm from the lesson.",
        feedbackPartial: "You're on the right track; check the dry run and BUILD section again.",
        feedbackWrong: "Review the BUILD section and dry run, then try again.",
        answer_keywords: ["function", "return"],
        evaluation: { mode: "keyword_match", required: [] },
      });
      continue;
    }

    const contentType = sec.id === "dryRun" ? "dryRun" : sec.id === "hook" || sec.id === "challenge" ? "lesson" : "reasoning";
    steps.push({
      type: contentType,
      id: sec.id,
      phase,
      title: phase,
      content: { body: sec.body, title: phase },
    });
  }

  return steps;
}

/**
 * Try to parse AI response as JSON (raw object or wrapped in "json" or inside ```json ... ```).
 * @param {string} raw
 * @returns {{ lesson?: { title?: string, track?: string, sections?: Array<{ title: string, content?: string }> } } | null}
 */
function parseAlgoJson(raw) {
  if (!raw || typeof raw !== "string") return null;
  let obj = null;
  const trimmed = raw.trim();
  if (trimmed.startsWith("{")) {
    try {
      obj = JSON.parse(trimmed);
    } catch (_) {}
  }
  if (!obj && trimmed.includes("```")) {
    const jsonMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      try {
        obj = JSON.parse(jsonMatch[1].trim());
      } catch (_) {}
    }
  }
  // AI sometimes returns literal "json" or "json\n" before the object — parse from first "{"
  if (!obj && trimmed.includes("{")) {
    const start = trimmed.indexOf("{");
    try {
      obj = JSON.parse(trimmed.slice(start));
    } catch (_) {}
  }
  if (!obj || typeof obj !== "object") return null;
  const lesson = obj.lesson ?? obj.json?.lesson ?? null;
  if (!lesson || !Array.isArray(lesson.sections)) return null;
  return { lesson };
}

/**
 * Map JSON lesson.sections to parser sections (id, title, body).
 * @param {{ title?: string, content?: string }[]} jsonSections
 * @returns {{ id: string, title: string, body: string }[]}
 */
function jsonSectionsToParserSections(jsonSections) {
  return jsonSections.map((sec, i) => {
    const title = sec.title ?? `Section ${i + 1}`;
    const body = sec.content ?? sec.body ?? "";
    const id = SECTION_IDS[i] ?? `section-${i + 1}`;
    return { id, title, body };
  });
}

/**
 * Parse raw Socratic lesson markdown into engine-ready steps.
 * Handles both markdown (## 1. HOOK ...) and JSON (e.g. { "lesson": { "sections": [...] } }) from the AI.
 * @param {string} raw - Full AI response (markdown or JSON)
 * @param {{ lessonTitle?: string, language?: string }} opts
 * @returns {object[]} steps for lessonConfigSchema
 */
export function parseSocraticMarkdownToSteps(raw, opts = {}) {
  const sections = parseSocraticSections(raw);
  if (sections.length > 0) return socraticSectionsToSteps(sections, opts);

  const parsed = parseAlgoJson(raw);
  if (parsed?.lesson?.sections?.length) {
    const parserSections = jsonSectionsToParserSections(parsed.lesson.sections);
    return socraticSectionsToSteps(parserSections, opts);
  }

  return [
    {
      type: "problem",
      id: "content",
      phase: "Lesson",
      title: "Lesson",
      content: { body: raw || "No content generated.", title: "Lesson" },
    },
  ];
}
