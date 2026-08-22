import createINPACTEngine from "../inpact_engine_shared";

const TITLE = "Micro-frontend Shell (Angular)";
const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "LESSON #85 (Angular)", title: TITLE, body: "Build a shell app that loads remote Angular or web components: use dynamic import() for route loadComponent pointing to a remote URL (Module Federation or script tag), or createCustomElement and define a tag for a micro-frontend.", usecase: "Angular Module Federation, loadComponent with import(), or custom elements enable micro-frontend shells." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["Route: loadComponent: () => import('remote/app').then(m => m.RemoteComponent) for Module Federation", "Or load script and mount: fetch script, create custom element from Angular component with createCustomElement", "Shell has router-outlet; remote routes load into outlet", "Shared dependencies (e.g. Angular core) via shared config"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Create a shell route that lazy-loads a remote: { path: 'remote', loadComponent: () => import('./remote/remote.component').then(m => m.RemoteComponent) }. RemoteComponent is standalone.", answer_keywords: ["loadComponent", "import", "then"], seed_code: `// Shell routes
import { Routes } from '@angular/router';

export const shellRoutes: Routes = [
  { path: 'remote', loadComponent: () => import('./remote/remote.component').then(m => m.RemoteComponent) }
];`, feedback_correct: "✅ loadComponent dynamic import.", feedback_partial: "loadComponent.", feedback_wrong: "RemoteComponent", expected: "loadComponent: () => import(...).then(m => m.RemoteComponent)" },
  { id: "step2", type: "question", phase: "Step 2 of 3", paal: "Create RemoteComponent with template <p>Remote micro-frontend</p>. Export it. Shell app has <router-outlet></router-outlet> and provideRouter(shellRoutes). Navigating to /remote loads the component.", answer_keywords: ["router-outlet", "provideRouter", "RemoteComponent"], seed_code: `import { Component } from '@angular/core';

@Component({
  selector: 'app-remote',
  standalone: true,
  template: \`<p>Remote micro-frontend</p>\`,
})
export class RemoteComponent {}`, feedback_correct: "✅ RemoteComponent.", feedback_partial: "standalone.", feedback_wrong: "router-outlet", expected: "Standalone RemoteComponent" },
  { id: "step3", type: "question", phase: "Step 3 of 3", paal: "Document or add a second remote route that uses a URL (e.g. Module Federation: loadComponent: () => import('remoteApp/Component').then(m => m.RemoteComponent)). Export shell routes.", answer_keywords: ["Module Federation", "remoteApp", "export"], seed_code: `import { Routes } from '@angular/router';

export const shellRoutes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'remote' },
  { path: 'remote', loadComponent: () => import('./remote/remote.component').then(m => m.RemoteComponent) }
];
// For Module Federation: loadComponent: () => import('remoteApp/Component').then(m => m.RemoteComponent)`, feedback_correct: "✅ Micro-frontend Shell (Angular) complete.", feedback_partial: "remoteApp.", feedback_wrong: "Export", expected: "Routes with loadComponent and export" },
];

const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }, { label: "Step 2", id: "step2" }, { label: "Step 3", id: "step3" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: 85, title: TITLE, shortName: "A — MICRO SHELL" });
