import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "LESSON #5 (Vue)", title: "Conditional Rendering with Ternary", body: "A status card that shows different content based on a boolean. isLoggedIn = true → \"Welcome back!\" + Logout button isLoggedIn = false → \"Please sign in\" + Login button One state variable. Two completely different UIs.", usecase: "Same concept as React — implemented with Vue 3 (Composition API, ref, reactive)." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: [
      "Use a ternary operator inside JSX: condition ? A : B",
      "Understand when to use ternary vs && for conditional rendering",
      "Render different text based on a boolean state",
      "Render different button labels based on the same boolean",
      "Wire a toggle function to flip the boolean on click",
      "Explain why if/else doesn't work directly inside JSX return"
  ] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Set up the initial structure and state needed for this lesson in Vue.", answer_keywords: ["ref", "script", "setup"], seed_code: "<script setup>\nimport { ref } from 'vue'\n// Step 1\n</script>\n\n<template>\n  <div><!-- Step 1 --></div>\n</template>", feedback_correct: "✅ Step 1 done.", feedback_partial: "Add required setup.", feedback_wrong: "Set up structure", expected: "Initial setup" },
  { id: "step2", type: "question", phase: "Step 2 of 3", paal: "Implement the core logic or template for this lesson.", answer_keywords: ["template", "bind", "logic"], seed_code: "<script setup>\nimport { ref } from 'vue'\n// Step 1\n</script>\n\n<template>\n  <div><!-- Step 1 --></div>\n</template>", feedback_correct: "✅ Step 2 done.", feedback_partial: "Core logic in place.", feedback_wrong: "Implement core", expected: "Core implementation" },
  { id: "step3", type: "question", phase: "Step 3 of 3", paal: "Wire everything together, handle edge cases, and export the component.", answer_keywords: ["script", "template"], seed_code: "<script setup>\nimport { ref } from 'vue'\n// Step 1\n</script>\n\n<template>\n  <div><!-- Step 1 --></div>\n</template>", feedback_correct: "✅ Lesson #5 (Vue) complete.", feedback_partial: "Export and finish.", feedback_wrong: "Export component", expected: "Complete" },
];

const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }, { label: "Step 2", id: "step2" }, { label: "Step 3", id: "step3" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: 5, title: "Conditional Rendering with Ternary", shortName: "CONDITIONAL RENDERING WI" });
