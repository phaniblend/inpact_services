import createINPACTEngine from "../inpact_engine_shared";

const TITLE = "Bundle Analysis (Angular)";
const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "LESSON #88 (Angular)", title: TITLE, body: "Analyze Angular bundle size: use ng build --stats-json and then tools like webpack-bundle-analyzer or source-map-explorer to see which modules contribute to chunk size; use lazy loading and tree-shaking to reduce initial bundle.", usecase: "Angular CLI stats and bundle analyzers help find heavy dependencies and optimize imports." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["Run ng build --configuration=production --stats-json to generate stats.json", "Use npx webpack-bundle-analyzer stats.json or Angular budget thresholds in angular.json", "Lazy load routes with loadComponent; avoid barrel imports that pull in whole libraries", "Check for duplicate dependencies and use path mapping"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "In angular.json add a production configuration that outputs stats: set outputHashing to none and ensure options.statsJson or similar is available. Run ng build --stats-json (or --configuration=production) and confirm stats.json is generated.", answer_keywords: ["stats-json", "ng build", "production"], seed_code: `// angular.json snippet - budgets and stats
// "configurations": { "production": { "budgets": [{ "type": "initial", "maximumWarning": "500kb" }] } }
// CLI: ng build --configuration=production --stats-json`, feedback_correct: "✅ Build with stats.", feedback_partial: "stats-json.", feedback_wrong: "ng build", expected: "ng build --stats-json or budgets in angular.json" },
  { id: "step2", type: "question", phase: "Step 2 of 3", paal: "Add budget in angular.json: budgets: [{ type: 'initial', maximumWarning: '500kb', maximumError: '1mb' }]. So build fails or warns when bundle exceeds size.", answer_keywords: ["budgets", "maximumWarning", "initial"], seed_code: `// angular.json
"budgets": [
  { "type": "initial", "maximumWarning": "500kb", "maximumError": "1mb" },
  { "type": "anyComponentStyle", "maximumWarning": "2kb" }
]`, feedback_correct: "✅ Budget thresholds.", feedback_partial: "budgets.", feedback_wrong: "maximumWarning", expected: "budgets with type initial and maximumWarning" },
  { id: "step3", type: "question", phase: "Step 3 of 3", paal: "Document: use dynamic import() for heavy libraries (e.g. loadComponent or import('lib') in route) so they go to lazy chunk. Export a small component that uses a lazy-loaded module.", answer_keywords: ["dynamic import", "lazy", "export"], seed_code: `import { Component } from '@angular/core';

@Component({
  selector: 'app-bundle-demo',
  standalone: true,
  template: \`<p>Use loadComponent and lazy routes to split bundle.</p>\`,
})
export class BundleDemoComponent {}`, feedback_correct: "✅ Bundle Analysis (Angular) complete.", feedback_partial: "lazy.", feedback_wrong: "Export", expected: "Budgets + lazy loading strategy" },
];

const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }, { label: "Step 2", id: "step2" }, { label: "Step 3", id: "step3" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: 88, title: TITLE, shortName: "A — BUNDLE ANALYSIS" });
