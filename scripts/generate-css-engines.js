/**
 * Generates CSS engine files C05–C100 (96 files).
 * Run: node scripts/generate-css-engines.js
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { CSS_CURRICULUM } from "../src/engines/css/inpact_css_index.js";
import { CSS_LESSON_DATA } from "./css-lessons-c05-c100.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function esc(s) {
  if (typeof s !== "string") return "";
  return s
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/`/g, "\\`")
    .replace(/\$/g, "\\$");
}

const curriculumSlice = CSS_CURRICULUM.slice(4, 100); // C05–C100

for (let i = 0; i < curriculumSlice.length; i++) {
  const num = i + 5;
  const pad = String(num).padStart(2, "0");
  const { id, shortName, title } = curriculumSlice[i];
  const data = CSS_LESSON_DATA[i];
  if (!data) {
    console.warn(`No lesson data for C${pad}, skipping.`);
    continue;
  }

  const body = `Senior fullstack devs need a solid grasp of ${title}. This lesson covers the key concepts, common values, and patterns you'll use in production.`;
  const usecase = `When implementing layouts, fixing bugs, or matching design specs, you'll often rely on ${title}.`;
  const objectives = [
    `Understand how ${title} works and when to use it`,
    `Apply ${title} in a minimal example`,
    `Combine with related properties for real-world layouts`,
  ];

  const step1Paal = `Implement ${title}: create a .demo element (or use the default HTML) and apply the main property. Get the visual or behavior described in the lesson.`;
  const step2Paal = `Extend your .demo with a second property or value related to ${title}. Reinforce the pattern.`;

  const step1Keywords = ["demo", ...data.step1Expected.split(/[\s:;,.]+/).filter(Boolean).slice(0, 4)];
  const step2Keywords = ["demo", ...data.step2Expected.split(/[\s:;,.]+/).filter(Boolean).slice(0, 4)];

  const content = `import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  {
    id: "intro",
    type: "reveal",
    phase: "CSS — Senior Fullstack",
    content: {
      tag: "CSS ${shortName}",
      title: "${esc(title)}",
      body: \`${esc(body)}\`,
      usecase: "${esc(usecase)}",
    },
  },
  {
    id: "objectives",
    type: "objectives",
    phase: "What You'll Take Away",
    items: ${JSON.stringify(objectives)},
  },
  {
    id: "step1",
    type: "question",
    phase: "Step 1 of 2",
    paal: \`${esc(step1Paal)}\`,
    hint: "${esc(data.step1Hint)}",
    answer_keywords: ${JSON.stringify(step1Keywords)},
    seed_code: \`/* Step 1: ${esc(title)} */
.demo {
}\`,
    feedback_correct: "✅ You applied the main property. Well done.",
    feedback_partial: "Add the main property for this topic to .demo.",
    feedback_wrong: "Use .demo { } and apply the property shown in the hint.",
    expected: \`${esc(data.step1Expected)}\`,
  },
  {
    id: "step2",
    type: "question",
    phase: "Step 2 of 2",
    paal: \`${esc(step2Paal)}\`,
    hint: "${esc(data.step2Hint)}",
    answer_keywords: ${JSON.stringify(step2Keywords)},
    seed_code: \`/* Step 2: extend ${esc(title)} */
.demo {
}\`,
    feedback_correct: "✅ You extended the demo. Topic covered.",
    feedback_partial: "Add a second property or value to .demo.",
    feedback_wrong: "Extend .demo with another property from the hint.",
    expected: \`${esc(data.step2Expected)}\`,
  },
];

const sideItems = [
  { id: "intro", label: "Lesson" },
  { id: "objectives", label: "Objectives" },
  { id: "step1", label: "Step 1" },
  { id: "step2", label: "Step 2" },
];

function getOutputPreview(answer) {
  let html = "";
  let css = "";
  try {
    const p = JSON.parse(answer || "{}");
    html = p.html ?? "";
    css = p.css ?? "";
  } catch (_) {
    css = answer || "";
  }
  return \`<!DOCTYPE html><html><head><meta charset="utf-8"><style>\${css}</style></head><body>\${html || "<div class=\\"demo\\">Demo</div>"}</body></html>\`;
}

export default createINPACTEngine({
  NODES,
  sideItems,
  lessonNum: ${num},
  title: "${esc(title)}",
  shortName: "${shortName}",
  language: "css",
  answerShape: "css-tabs",
  defaultHtml: "<div class=\\"demo\\">Demo</div>",
  getOutputPreview,
});
`;

  const outPath = path.join(__dirname, "..", "src", "engines", "css", `inpact_c${pad}_engine.jsx`);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, content, "utf8");
  console.log(`Wrote ${outPath}`);
}

console.log(`Done. Generated ${curriculumSlice.length} CSS engines (C05–C100).`);
