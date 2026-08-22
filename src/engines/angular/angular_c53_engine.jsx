import createINPACTEngine from "../inpact_engine_shared";

const TITLE = "Lazy Loading Routes (Angular)";
const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "LESSON #53 (Angular)", title: TITLE, body: "Load route components on demand using loadComponent in the route config: loadComponent: () => import('./path/to/comp').then(m => m.Comp) so the bundle is split and fetched when the route is visited.", usecase: "Angular Router loadComponent enables lazy loading of route components and reduces initial bundle size." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["Route: { path: 'lazy', loadComponent: () => import('./lazy/lazy.comp').then(m => m.LazyComp) }", "No need to add LazyComp in imports of a module; router loads it", "Use loadChildren for lazy child routes: loadChildren: () => import('./r').then(m => m.routes)", "Provide routes with provideRouter(routes)"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Define a route with loadComponent: loadComponent: () => import('./lazy.component').then(m => m.LazyComponent). Path: 'lazy'.", answer_keywords: ["loadComponent", "import", "then"], seed_code: `import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: 'lazy', loadComponent: () => import('./lazy.component').then(m => m.LazyComponent) }
];`, feedback_correct: "✅ loadComponent route.", feedback_partial: "loadComponent.", feedback_wrong: "loadComponent", expected: "loadComponent: () => import(...).then(m => m.LazyComponent)" },
  { id: "step2", type: "question", phase: "Step 2 of 3", paal: "Create LazyComponent as a standalone component in lazy.component.ts. Export it. Ensure the route path matches so navigating to /lazy loads the component.", answer_keywords: ["LazyComponent", "standalone", "export"], seed_code: `import { Component } from '@angular/core';

@Component({
  selector: 'app-lazy',
  standalone: true,
  template: \`<p>Lazy loaded</p>\`,
})
export class LazyComponent {}`, feedback_correct: "✅ LazyComponent.", feedback_partial: "standalone.", feedback_wrong: "LazyComponent", expected: "Standalone LazyComponent and export" },
  { id: "step3", type: "question", phase: "Step 3 of 3", paal: "In app config use provideRouter(routes). Add <router-outlet></router-outlet> in app template. Use routerLink=\"lazy\" or navigate to 'lazy' to trigger load. Export routes.", answer_keywords: ["provideRouter", "router-outlet", "routerLink"], seed_code: `import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'lazy' },
  { path: 'lazy', loadComponent: () => import('./lazy.component').then(m => m.LazyComponent) }
];`, feedback_correct: "✅ Lazy Loading Routes (Angular) complete.", feedback_partial: "routes.", feedback_wrong: "Export", expected: "provideRouter(routes) and router-outlet" },
];

const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }, { label: "Step 2", id: "step2" }, { label: "Step 3", id: "step3" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: 53, title: TITLE, shortName: "A — LAZY ROUTES" });
