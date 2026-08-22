/**
 * Generates 100 Angular and 100 Vue lesson engines from react_100_problems_improved.md.
 * Same lessons/titles/descriptions/objectives as React JS/TS, with framework-specific seed code.
 * Run: node scripts/generate-angular-vue-engines.js
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const improvedPath = path.join(__dirname, "../react_100_problems_improved.md");
const md = fs.readFileSync(improvedPath, "utf8");

const blocks = md.split(/\n---\s*\n/).filter(B => B.trim());
const lessons = [];

for (const block of blocks) {
  const numMatch = block.match(/^## P(\d+)\s*—\s*(.+?)(?:\n|$)/m);
  if (!numMatch) continue;
  const num = parseInt(numMatch[1], 10);
  const title = numMatch[2].trim();
  const descMatch = block.match(/\*\*description:\*\*\s*(.+?)(?=\n\*\*Learning|\n\n|\n\d{2}\.)/s);
  const description = descMatch ? descMatch[1].trim().replace(/\s+/g, " ") : "";
  const objStart = block.indexOf("**Learning objectives:**");
  let objectives = [];
  if (objStart !== -1) {
    const afterObj = block.slice(objStart);
    for (const line of afterObj.split(/\n/)) {
      const m = line.match(/^\s*(\d{2})\.\s+(.+)$/);
      if (m) objectives.push(m[2].trim());
    }
  }
  lessons[num] = { num, title, description, objectives };
}

const angularDir = path.join(__dirname, "../src/engines/angular");
const vueDir = path.join(__dirname, "../src/engines/vue");
fs.mkdirSync(angularDir, { recursive: true });
fs.mkdirSync(vueDir, { recursive: true });

const angularSeed = `import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  template: \`<!-- Step 1: add template -->\`,
})
export class AppComponent {
  // Step 1
}`;

const vueSeed = `<script setup>
import { ref } from 'vue'
// Step 1
</script>

<template>
  <div><!-- Step 1 --></div>
</template>`;

const genericObjectives = [
  "Explain the purpose of this hook/pattern and when it should be used in real applications",
  "Implement the solution step‑by‑step inside a component or service",
  "Integrate the solution into a working UI example to verify behaviour",
  "Handle common edge cases (cleanup, dependency management, or state consistency)",
  "Export and reuse the solution in other components or projects",
];

for (let n = 1; n <= 100; n++) {
  const p = lessons[n];
  if (!p) continue;
  const items = p.objectives && p.objectives.length > 0 ? p.objectives : genericObjectives;
  const itemsStr = items.map(o => "      " + JSON.stringify(o)).join(",\n");
  const shortName = p.title.toUpperCase().replace(/\s+/g, " ").slice(0, 24);

  // Angular engine
  const angularContent = `import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "LESSON #${n} (Angular)", title: ${JSON.stringify(p.title)}, body: ${JSON.stringify(p.description)}, usecase: "Same concept as React — implemented with Angular (signals, standalone components)." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: [
${itemsStr}
  ] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Set up the initial structure and state needed for this lesson in Angular.", answer_keywords: ["component", "signal", "import"], seed_code: ${JSON.stringify(angularSeed)}, feedback_correct: "✅ Step 1 done.", feedback_partial: "Add required setup.", feedback_wrong: "Set up structure", expected: "Initial setup" },
  { id: "step2", type: "question", phase: "Step 2 of 3", paal: "Implement the core logic or template for this lesson.", answer_keywords: ["template", "bind", "logic"], seed_code: ${JSON.stringify(angularSeed)}, feedback_correct: "✅ Step 2 done.", feedback_partial: "Core logic in place.", feedback_wrong: "Implement core", expected: "Core implementation" },
  { id: "step3", type: "question", phase: "Step 3 of 3", paal: "Wire everything together, handle edge cases, and export the component.", answer_keywords: ["export", "class"], seed_code: ${JSON.stringify(angularSeed)}, feedback_correct: "✅ Lesson #${n} (Angular) complete.", feedback_partial: "Export and finish.", feedback_wrong: "Export component", expected: "Complete" },
];

const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }, { label: "Step 2", id: "step2" }, { label: "Step 3", id: "step3" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: ${n}, title: ${JSON.stringify(p.title)}, shortName: ${JSON.stringify(shortName)} });
`;
  const ngPath = path.join(angularDir, `inpact_ng${String(n).padStart(2, "0")}_engine.jsx`);
  fs.writeFileSync(ngPath, angularContent, "utf8");

  // Vue engine
  const vueContent = `import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "LESSON #${n} (Vue)", title: ${JSON.stringify(p.title)}, body: ${JSON.stringify(p.description)}, usecase: "Same concept as React — implemented with Vue 3 (Composition API, ref, reactive)." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: [
${itemsStr}
  ] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Set up the initial structure and state needed for this lesson in Vue.", answer_keywords: ["ref", "script", "setup"], seed_code: ${JSON.stringify(vueSeed)}, feedback_correct: "✅ Step 1 done.", feedback_partial: "Add required setup.", feedback_wrong: "Set up structure", expected: "Initial setup" },
  { id: "step2", type: "question", phase: "Step 2 of 3", paal: "Implement the core logic or template for this lesson.", answer_keywords: ["template", "bind", "logic"], seed_code: ${JSON.stringify(vueSeed)}, feedback_correct: "✅ Step 2 done.", feedback_partial: "Core logic in place.", feedback_wrong: "Implement core", expected: "Core implementation" },
  { id: "step3", type: "question", phase: "Step 3 of 3", paal: "Wire everything together, handle edge cases, and export the component.", answer_keywords: ["script", "template"], seed_code: ${JSON.stringify(vueSeed)}, feedback_correct: "✅ Lesson #${n} (Vue) complete.", feedback_partial: "Export and finish.", feedback_wrong: "Export component", expected: "Complete" },
];

const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }, { label: "Step 2", id: "step2" }, { label: "Step 3", id: "step3" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: ${n}, title: ${JSON.stringify(p.title)}, shortName: ${JSON.stringify(shortName)} });
`;
  const vuePath = path.join(vueDir, `inpact_vue${String(n).padStart(2, "0")}_engine.jsx`);
  fs.writeFileSync(vuePath, vueContent, "utf8");
}

console.log("Generated 100 Angular engines in src/engines/angular/");
console.log("Generated 100 Vue engines in src/engines/vue/");
