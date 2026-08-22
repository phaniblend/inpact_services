import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "ANGULAR #3", title: "Services & dependency injection", body: `@Injectable, providedIn, hierarchical injectors, injection tokens.`, usecase: "Shared state and API access." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["@Injectable and providedIn", "Hierarchical injectors", "Injection tokens"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Create a service with providedIn: 'root'. Inject it in a component. Use an InjectionToken for a config value.", answer_keywords: ["Injectable", "providedIn", "inject", "InjectionToken"], seed_code: `@Injectable({ providedIn: 'root' }) export class ApiService {}
// constructor(private api: ApiService) or inject(ApiService)
// const TOKEN = new InjectionToken<string>('config')`, feedback_correct: "✅ @Injectable providedIn; inject() or constructor; InjectionToken.", feedback_wrong: "providedIn: 'root'; inject service; InjectionToken for config.", expected: "DI and tokens" },
];
const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: "ANG-F03", title: "Services & DI", shortName: "ANG — DI" });
