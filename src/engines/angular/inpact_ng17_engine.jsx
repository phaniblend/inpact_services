import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "LESSON #17 (Angular)", title: "List Rendering", body: "Render a list of products with proper key props. Use an array of objects (e.g. id, name, price) and map over it to render a div or li for each. Keys help React track list items across updates.", usecase: "Same concept as React — implemented with Angular (signals, standalone components)." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: [
      "Define an array of items (e.g. products with id, name, price)",
      "Use .map() to render one element per item",
      "Add key={item.id} (or stable unique key) to the mapped element"
  ] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Set up the initial structure and state needed for this lesson in Angular.", answer_keywords: ["component", "signal", "import"], seed_code: "import { Component, signal } from '@angular/core';\nimport { CommonModule } from '@angular/common';\n\n@Component({\n  selector: 'app-root',\n  standalone: true,\n  imports: [CommonModule],\n  template: `<!-- Step 1: add template -->`,\n})\nexport class AppComponent {\n  // Step 1\n}", feedback_correct: "✅ Step 1 done.", feedback_partial: "Add required setup.", feedback_wrong: "Set up structure", expected: "Initial setup" },
  { id: "step2", type: "question", phase: "Step 2 of 3", paal: "Implement the core logic or template for this lesson.", answer_keywords: ["template", "bind", "logic"], seed_code: "import { Component, signal } from '@angular/core';\nimport { CommonModule } from '@angular/common';\n\n@Component({\n  selector: 'app-root',\n  standalone: true,\n  imports: [CommonModule],\n  template: `<!-- Step 1: add template -->`,\n})\nexport class AppComponent {\n  // Step 1\n}", feedback_correct: "✅ Step 2 done.", feedback_partial: "Core logic in place.", feedback_wrong: "Implement core", expected: "Core implementation" },
  { id: "step3", type: "question", phase: "Step 3 of 3", paal: "Wire everything together, handle edge cases, and export the component.", answer_keywords: ["export", "class"], seed_code: "import { Component, signal } from '@angular/core';\nimport { CommonModule } from '@angular/common';\n\n@Component({\n  selector: 'app-root',\n  standalone: true,\n  imports: [CommonModule],\n  template: `<!-- Step 1: add template -->`,\n})\nexport class AppComponent {\n  // Step 1\n}", feedback_correct: "✅ Lesson #17 (Angular) complete.", feedback_partial: "Export and finish.", feedback_wrong: "Export component", expected: "Complete" },
];

const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }, { label: "Step 2", id: "step2" }, { label: "Step 3", id: "step3" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: 17, title: "List Rendering", shortName: "LIST RENDERING" });
