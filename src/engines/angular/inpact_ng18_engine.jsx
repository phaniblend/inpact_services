import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "LESSON #18 (Angular)", title: "PropTypes / TypeScript Interface", body: "Add TypeScript interfaces to a UserCard component. Define an interface for the props (e.g. name: string, age: number, avatar?: string) and use it to type the component. If using JS, use PropTypes instead.", usecase: "Same concept as React — implemented with Angular (signals, standalone components)." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: [
      "Define an interface or PropTypes for UserCard props",
      "Apply the type to the component function",
      "Render name, age, and optional avatar"
  ] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Set up the initial structure and state needed for this lesson in Angular.", answer_keywords: ["component", "signal", "import"], seed_code: "import { Component, signal } from '@angular/core';\nimport { CommonModule } from '@angular/common';\n\n@Component({\n  selector: 'app-root',\n  standalone: true,\n  imports: [CommonModule],\n  template: `<!-- Step 1: add template -->`,\n})\nexport class AppComponent {\n  // Step 1\n}", feedback_correct: "✅ Step 1 done.", feedback_partial: "Add required setup.", feedback_wrong: "Set up structure", expected: "Initial setup" },
  { id: "step2", type: "question", phase: "Step 2 of 3", paal: "Implement the core logic or template for this lesson.", answer_keywords: ["template", "bind", "logic"], seed_code: "import { Component, signal } from '@angular/core';\nimport { CommonModule } from '@angular/common';\n\n@Component({\n  selector: 'app-root',\n  standalone: true,\n  imports: [CommonModule],\n  template: `<!-- Step 1: add template -->`,\n})\nexport class AppComponent {\n  // Step 1\n}", feedback_correct: "✅ Step 2 done.", feedback_partial: "Core logic in place.", feedback_wrong: "Implement core", expected: "Core implementation" },
  { id: "step3", type: "question", phase: "Step 3 of 3", paal: "Wire everything together, handle edge cases, and export the component.", answer_keywords: ["export", "class"], seed_code: "import { Component, signal } from '@angular/core';\nimport { CommonModule } from '@angular/common';\n\n@Component({\n  selector: 'app-root',\n  standalone: true,\n  imports: [CommonModule],\n  template: `<!-- Step 1: add template -->`,\n})\nexport class AppComponent {\n  // Step 1\n}", feedback_correct: "✅ Lesson #18 (Angular) complete.", feedback_partial: "Export and finish.", feedback_wrong: "Export component", expected: "Complete" },
];

const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }, { label: "Step 2", id: "step2" }, { label: "Step 3", id: "step3" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: 18, title: "PropTypes / TypeScript Interface", shortName: "PROPTYPES / TYPESCRIPT I" });
