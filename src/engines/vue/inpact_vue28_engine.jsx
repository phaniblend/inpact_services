import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "LESSON #28 (Vue)", title: "Star Rating Component", body: "Build a clickable 5-star rating component. State holds the current rating (1–5). Clicking a star sets the rating to that star's index. Show filled vs empty stars.", usecase: "Same concept as React — implemented with Vue 3 (Composition API, ref, reactive)." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: [
      "Use useState for rating (number 0–5 or 1–5)",
      "Render 5 clickable elements (stars or buttons)",
      "Filled for index <= rating, empty otherwise",
      "onClick sets rating to that star's value"
  ] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Set up the initial structure and state needed for this lesson in Vue.", answer_keywords: ["ref", "script", "setup"], seed_code: "<script setup>\nimport { ref } from 'vue'\n// Step 1\n</script>\n\n<template>\n  <div><!-- Step 1 --></div>\n</template>", feedback_correct: "✅ Step 1 done.", feedback_partial: "Add required setup.", feedback_wrong: "Set up structure", expected: "Initial setup" },
  { id: "step2", type: "question", phase: "Step 2 of 3", paal: "Implement the core logic or template for this lesson.", answer_keywords: ["template", "bind", "logic"], seed_code: "<script setup>\nimport { ref } from 'vue'\n// Step 1\n</script>\n\n<template>\n  <div><!-- Step 1 --></div>\n</template>", feedback_correct: "✅ Step 2 done.", feedback_partial: "Core logic in place.", feedback_wrong: "Implement core", expected: "Core implementation" },
  { id: "step3", type: "question", phase: "Step 3 of 3", paal: "Wire everything together, handle edge cases, and export the component.", answer_keywords: ["script", "template"], seed_code: "<script setup>\nimport { ref } from 'vue'\n// Step 1\n</script>\n\n<template>\n  <div><!-- Step 1 --></div>\n</template>", feedback_correct: "✅ Lesson #28 (Vue) complete.", feedback_partial: "Export and finish.", feedback_wrong: "Export component", expected: "Complete" },
];

const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }, { label: "Step 2", id: "step2" }, { label: "Step 3", id: "step3" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: 28, title: "Star Rating Component", shortName: "STAR RATING COMPONENT" });
