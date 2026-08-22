import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "SECURITY ENG #5", title: "Dependency security", body: `SCA (Software Composition Analysis), SBOM, npm audit, Snyk, license compliance.`, usecase: "Knowing what's in your supply chain." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["SCA and SBOM", "npm audit, Snyk", "License compliance"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "What is an SBOM? How do you fix vulnerable dependencies? What is license compliance?", answer_keywords: ["SBOM", "SCA", "npm audit", "Snyk", "license"], seed_code: `// SBOM: list of all deps and transitive; required for some compliance
// npm audit fix; Snyk/Dependabot for alerts and PRs
// License: GPL viral; MIT/BSD permissive; audit with license-checker`, feedback_correct: "✅ SBOM = bill of materials; audit fix / Snyk; check licenses.", feedback_wrong: "SBOM; npm audit/Snyk; license compliance.", expected: "Dependency security" },
];
const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: "SEC-05", title: "Dependency security", shortName: "SEC — DEPS" });
