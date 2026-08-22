import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "LESSON #66", title: "Discriminated Union Props", body: "Button: variant=link requires href, variant=action requires onClick", usecase: "Discriminated unions." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["Explain the purpose of this hook/pattern and when it should be used in real React applications", "Implement the solution step‑by‑step inside a React component or custom hook", "Integrate the solution into a working UI example to verify behaviour", "Handle common edge cases (cleanup, dependency management, or state consistency)", "Export and reuse the solution in other components or projects"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Set up the initial structure and state needed for this lesson.", answer_keywords: ["import", "state", "function"], seed_code: "import { useState } from 'react'\n\nexport default function App() {\n  // Step 1\n}", feedback_correct: "✅ Step 1 done.", feedback_partial: "Add required setup.", feedback_wrong: "Set up structure", expected: "Initial setup" },
  { id: "step2", type: "question", phase: "Step 2 of 3", paal: "Implement the core logic or UI for this lesson.", answer_keywords: ["return", "render", "logic"], seed_code: "import { useState } from 'react'\n\nexport default function App() {\n  // Step 2\n}", feedback_correct: "✅ Step 2 done.", feedback_partial: "Core logic in place.", feedback_wrong: "Implement core", expected: "Core implementation" },
  { id: "step3", type: "question", phase: "Step 3 of 3", paal: "Wire everything together, handle edge cases, and export the component.", answer_keywords: ["export", "default"], seed_code: "import { useState } from 'react'\n\nexport default function App() {\n  // Step 3\n}", feedback_correct: "✅ Lesson #66 complete.", feedback_partial: "Export and finish.", feedback_wrong: "Export component", expected: "Complete" },
];

const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }, { label: "Step 2", id: "step2" }, { label: "Step 3", id: "step3" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: 66, title: "Discriminated Union Props", shortName: "DISCRIMINATED UNION PROP" });
