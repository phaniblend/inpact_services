import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  {
    id: "intro", type: "reveal", phase: "Lesson",
    content: {
      tag: "NODE.JS #12",
      title: "Module system deep dive",
      body: `require() resolution algorithm. Module caching. Circular deps. ESM in Node (import/export, type: module).`,
      usecase: "Debugging load order, choosing CJS vs ESM.",
    },
  },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["Understand require() resolution", "Know module caching and circular deps", "Use ESM in Node"] },
  {
    id: "step1", type: "question", phase: "Step 1 of 3",
    paal: "Explain the require() resolution order (node_modules, paths). What happens with circular dependencies? How do you enable ESM?",
    answer_keywords: ["require", "resolution", "node_modules", "circular", "ESM", "type module", "import"],
    seed_code: `// Resolution: current dir -> parent node_modules -> ...
// Circular: half-initialized exports; avoid or use dynamic require
// ESM: "type": "module" in package.json or .mjs`,
    feedback_correct: "✅ Resolution order; circular = partial exports; type:module or .mjs for ESM.",
    feedback_wrong: "require looks up node_modules; circular deps can see undefined; use type:module for ESM.",
    expected: "Module resolution and ESM",
  },
];

const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: "NODE-F12", title: "Module system", shortName: "NODE — MODULES" });
