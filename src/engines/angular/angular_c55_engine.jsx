import createINPACTEngine from "../inpact_engine_shared";

const TITLE = "HOC withAuth (Angular)";
const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "LESSON #55 (Angular)", title: TITLE, body: "Wrap a route or component with auth checks in Angular using a route guard (CanActivateFn) that injects AuthService and returns true/false or UrlTree; optionally a wrapper component that injects auth and projects content only when logged in.", usecase: "Angular route guards and optional wrapper components replicate React HOC withAuth for protected content." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["Guard: export const authGuard: CanActivateFn = () => inject(AuthService).user() !== null", "Apply to route: { path: 'admin', canActivate: [authGuard], loadComponent: ... }", "Redirect: return inject(Router).createUrlTree(['/login']) when not authenticated", "Optional: WithAuthComponent that *ngIf=\"auth.user()\" and ng-content"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Create authGuard: CanActivateFn = () => inject(AuthService).user() !== null. AuthService has user = signal<User | null>(null).", answer_keywords: ["CanActivateFn", "inject", "AuthService"], seed_code: `import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = () => inject(AuthService).user() !== null;`, feedback_correct: "✅ authGuard.", feedback_partial: "CanActivateFn.", feedback_wrong: "authGuard", expected: "CanActivateFn and inject(AuthService).user()" },
  { id: "step2", type: "question", phase: "Step 2 of 3", paal: "In the guard when user is null return inject(Router).createUrlTree(['/login']). Otherwise return true.", answer_keywords: ["Router", "createUrlTree", "login"], seed_code: `import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  if (auth.user() === null) return inject(Router).createUrlTree(['/login']);
  return true;
};`, feedback_correct: "✅ Redirect when not auth.", feedback_partial: "createUrlTree.", feedback_wrong: "Router", expected: "createUrlTree(['/login']) when !user()" },
  { id: "step3", type: "question", phase: "Step 3 of 3", paal: "Create a wrapper component WithAuthComponent that injects AuthService and shows <ng-content></ng-content> only when auth.user() is truthy; otherwise show a login link. Export guard and component.", answer_keywords: ["ng-content", "user()", "export"], seed_code: `import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-with-auth',
  standalone: true,
  imports: [CommonModule],
  template: \`
    <ng-container *ngIf="auth.user(); else login"> <ng-content></ng-content> </ng-container>
    <ng-template #login><a routerLink="/login">Login</a></ng-template>
  \`,
})
export class WithAuthComponent {
  auth = inject(AuthService);
}`, feedback_correct: "✅ HOC withAuth (Angular) complete.", feedback_partial: "WithAuthComponent.", feedback_wrong: "Export", expected: "*ngIf auth.user() and ng-content" },
];

const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }, { label: "Step 2", id: "step2" }, { label: "Step 3", id: "step3" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: 55, title: TITLE, shortName: "A — WITH AUTH" });
