import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "ANGULAR #15", title: "Angular CLI & workspace", body: `schematics, builders, workspace config, library creation, multi-project workspace.`, usecase: "Monorepos and custom tooling." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["Workspace and projects", "Generate library", "Custom schematics/builders"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Create a library in the workspace with ng generate library. How do you add a custom schematic?", answer_keywords: ["ng generate", "library", "workspace", "schematic", "builder"], seed_code: `ng generate library my-lib --buildable
// Schematics: collection in angular.json; run with ng generate my-schematic:name`, feedback_correct: "✅ ng generate library; schematics in collection; multi-project angular.json.", feedback_wrong: "ng generate library; schematics extend CLI; workspace has multiple projects.", expected: "CLI & workspace" },
];
const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: "ANG-F15", title: "Angular CLI & workspace", shortName: "ANG — CLI" });
