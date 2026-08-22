import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "LESSON #1 (Vue)", title: "Counter App", body: "Build a very simple React page that displays a number starting at 0 and lets the user change it using buttons: [ + ] increases the number by 1 [ - ] decreases the number by 1 [ Reset ] brings the number back to 0 Example: Start → 0 Click + → 1 Click + → 2 Click - → 1 Click Reset → 0", usecase: "Same concept as React — implemented with Vue 3 (Composition API, ref, reactive)." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: [
      "Use the useState hook to store and manage a changing value inside a React component",
      "Destructure the return value of useState into a state variable and a setter function",
      "Explain why calling the setter triggers a re-render but reassigning a variable does not",
      "Define named callback functions (increment, decrement, reset) inside a React component",
      "Assign a callback function to a button's onClick event handler",
      "Use the functional update form setCount(prev => prev + 1) when new state depends on old state",
      "Distinguish between setCount(0) and setCount(prev => prev + 1) — and know when to use each",
      "Structure a complete React component: import → state → handlers → return JSX",
      "Export a React component using the export default function syntax"
  ] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Set up the initial structure and state needed for this lesson in Vue.", answer_keywords: ["ref", "script", "setup"], seed_code: "<script setup>\nimport { ref } from 'vue'\n// Step 1\n</script>\n\n<template>\n  <div><!-- Step 1 --></div>\n</template>", feedback_correct: "✅ Step 1 done.", feedback_partial: "Add required setup.", feedback_wrong: "Set up structure", expected: "Initial setup" },
  { id: "step2", type: "question", phase: "Step 2 of 3", paal: "Implement the core logic or template for this lesson.", answer_keywords: ["template", "bind", "logic"], seed_code: "<script setup>\nimport { ref } from 'vue'\n// Step 1\n</script>\n\n<template>\n  <div><!-- Step 1 --></div>\n</template>", feedback_correct: "✅ Step 2 done.", feedback_partial: "Core logic in place.", feedback_wrong: "Implement core", expected: "Core implementation" },
  { id: "step3", type: "question", phase: "Step 3 of 3", paal: "Wire everything together, handle edge cases, and export the component.", answer_keywords: ["script", "template"], seed_code: "<script setup>\nimport { ref } from 'vue'\n// Step 1\n</script>\n\n<template>\n  <div><!-- Step 1 --></div>\n</template>", feedback_correct: "✅ Lesson #1 (Vue) complete.", feedback_partial: "Export and finish.", feedback_wrong: "Export component", expected: "Complete" },
];

const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }, { label: "Step 2", id: "step2" }, { label: "Step 3", id: "step3" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: 1, title: "Counter App", shortName: "COUNTER APP" });
