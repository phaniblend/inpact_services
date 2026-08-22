import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "ANGULAR #6", title: "Routing & lazy loading", body: `RouterModule, route guards (CanActivate/CanDeactivate), lazy loaded modules, resolvers.`, usecase: "SPA navigation and code splitting." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["Configure routes", "Guards and resolvers", "Lazy load modules"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Define a route with path and loadComponent (lazy). Add a guard that returns true only if user is logged in.", answer_keywords: ["RouterModule", "loadComponent", "canActivate", "guard", "lazy"], seed_code: `{ path: 'admin', loadComponent: () => import('./admin') }
canActivate: [AuthGuard]  // inject service, return true/false or UrlTree`, feedback_correct: "✅ loadComponent for lazy; canActivate guard; return boolean or UrlTree.", feedback_wrong: "loadComponent for lazy load; canActivate guard for auth.", expected: "Routing and guards" },
];
const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: "ANG-F06", title: "Routing & lazy loading", shortName: "ANG — ROUTING" });
