import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "ANGULAR #13", title: "Standalone components (Angular 14+)", body: `standalone: true, bootstrapApplication, importProvidersFrom.`, usecase: "No NgModules, tree-shakeable." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["standalone: true", "bootstrapApplication", "importProvidersFrom"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Create a standalone component and bootstrap the app with bootstrapApplication. Provide Router using importProvidersFrom.", answer_keywords: ["standalone", "bootstrapApplication", "importProvidersFrom", "provideRouter"], seed_code: `@Component({ standalone: true, imports: [CommonModule] })
bootstrapApplication(AppComponent, { providers: [importProvidersFrom(RouterModule.forRoot(...))] })`, feedback_correct: "✅ standalone: true; bootstrapApplication; importProvidersFrom for NgModule providers.", feedback_wrong: "standalone: true; bootstrapApplication with providers; importProvidersFrom.", expected: "Standalone" },
];
const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: "ANG-F13", title: "Standalone components", shortName: "ANG — STANDALONE" });
