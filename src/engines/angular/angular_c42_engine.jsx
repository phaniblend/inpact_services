import createINPACTEngine from "../inpact_engine_shared";

const TITLE = "Auth Context (Angular)";
const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "LESSON #42 (Angular)", title: TITLE, body: "Provide authentication state (user, isAuthenticated, login, logout) via an injectable AuthService; use signals or BehaviorSubject and inject the service where needed.", usecase: "Angular uses a root-level AuthService instead of React Context for auth state." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["AuthService: user = signal<User | null>(null); login(u); logout()", "providedIn: 'root' so same instance app-wide", "Guards: inject(AuthService); canActivate = () => authService.user() !== null", "Components: inject(AuthService) and *ngIf=\"authService.user()\" for protected UI"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Create AuthService with user = signal<{ name: string } | null>(null), login(name: string) { this.user.set({ name }); }, logout() { this.user.set(null); }. providedIn: 'root'.", answer_keywords: ["AuthService", "user", "login", "logout"], seed_code: `import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
  user = signal<{ name: string } | null>(null);
  login(name: string) { this.user.set({ name }); }
  logout() { this.user.set(null); }
}`, feedback_correct: "✅ AuthService with user signal.", feedback_partial: "login logout.", feedback_wrong: "AuthService", expected: "user signal, login(), logout()" },
  { id: "step2", type: "question", phase: "Step 2 of 3", paal: "Create a component that injects AuthService. Show *ngIf=\"auth.user()\" with Welcome {{ auth.user()?.name }} and a Logout button; *ngIf=\"!auth.user()\" show a simple login form that calls auth.login(name).", answer_keywords: ["inject", "ngIf", "auth.user"], seed_code: `import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-auth-ui',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: \`
    <div *ngIf="auth.user()">
      Welcome {{ auth.user()?.name }} <button (click)="auth.logout()">Logout</button>
    </div>
    <div *ngIf="!auth.user()">
      <input [(ngModel)]="name" />
      <button (click)="auth.login(name)">Login</button>
    </div>
  \`,
})
export class AuthUIComponent {
  auth = inject(AuthService);
  name = '';
}`, feedback_correct: "✅ Auth UI with login/logout.", feedback_partial: "*ngIf auth.user().", feedback_wrong: "auth.login", expected: "*ngIf and auth.login/auth.logout" },
  { id: "step3", type: "question", phase: "Step 3 of 3", paal: "Add a route guard: canActivate = () => inject(AuthService).user() !== null. Export AuthService and the component.", answer_keywords: ["canActivate", "guard", "export"], seed_code: `import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = () => inject(AuthService).user() !== null;`, feedback_correct: "✅ Auth Context (Angular) complete.", feedback_partial: "canActivate.", feedback_wrong: "Export", expected: "Guard using inject(AuthService).user()" },
];

const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }, { label: "Step 2", id: "step2" }, { label: "Step 3", id: "step3" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: 42, title: TITLE, shortName: "A — AUTH CONTEXT" });
