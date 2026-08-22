import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "LESSON #37 (Angular)", title: "useClickOutside", body: "Detect clicks outside a referenced element — dropdowns/modals", usecase: "Same concept as React — implemented with Angular (signals, standalone components)." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: [
      "Explain the purpose of this hook/pattern and when it should be used in real React applications",
      "Implement the solution step‑by‑step inside a React component or custom hook",
      "Integrate the solution into a working UI example to verify behaviour",
      "Handle common edge cases (cleanup, dependency management, or state consistency)",
      "Export and reuse the solution in other components or projects"
  ] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Set up the initial structure and state needed for this lesson in Angular.", answer_keywords: ["component", "signal", "import"], seed_code: "import { Component, signal } from '@angular/core';\nimport { CommonModule } from '@angular/common';\n\n@Component({\n  selector: 'app-root',\n  standalone: true,\n  imports: [CommonModule],\n  template: `<!-- Step 1: add template -->`,\n})\nexport class AppComponent {\n  // Step 1\n}", feedback_correct: "✅ Step 1 done.", feedback_partial: "Add required setup.", feedback_wrong: "Set up structure", expected: "Initial setup" },
  { id: "step2", type: "question", phase: "Step 2 of 3", paal: "Implement the core logic or template for this lesson.", answer_keywords: ["template", "bind", "logic"], seed_code: "import { Component, signal } from '@angular/core';\nimport { CommonModule } from '@angular/common';\n\n@Component({\n  selector: 'app-root',\n  standalone: true,\n  imports: [CommonModule],\n  template: `<!-- Step 1: add template -->`,\n})\nexport class AppComponent {\n  // Step 1\n}", feedback_correct: "✅ Step 2 done.", feedback_partial: "Core logic in place.", feedback_wrong: "Implement core", expected: "Core implementation" },
  { id: "step3", type: "question", phase: "Step 3 of 3", paal: "Wire everything together, handle edge cases, and export the component.", answer_keywords: ["export", "class"], seed_code: "import { Component, signal } from '@angular/core';\nimport { CommonModule } from '@angular/common';\n\n@Component({\n  selector: 'app-root',\n  standalone: true,\n  imports: [CommonModule],\n  template: `<!-- Step 1: add template -->`,\n})\nexport class AppComponent {\n  // Step 1\n}", feedback_correct: "✅ Lesson #37 (Angular) complete.", feedback_partial: "Export and finish.", feedback_wrong: "Export component", expected: "Complete" },
];

const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }, { label: "Step 2", id: "step2" }, { label: "Step 3", id: "step3" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: 37, title: "useClickOutside", shortName: "USECLICKOUTSIDE" });
