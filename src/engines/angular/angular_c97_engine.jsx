import createINPACTEngine from "../inpact_engine_shared";

const TITLE = "Design Auth Flow (Angular)";
const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "LESSON #97 (Angular)", title: TITLE, body: "Design an auth flow in Angular: AuthService with login/logout and user signal; route guard that redirects to /login when unauthenticated; login component that calls service and navigates to return URL; optional HTTP interceptor for token.", usecase: "Angular auth uses AuthService, CanActivateFn guard, Router.navigateByUrl, and optional interceptors." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["AuthService: user = signal<User|null>(null); login(creds); logout(); token in memory or storage", "authGuard: CanActivateFn = () => inject(AuthService).user() ? true : inject(Router).createUrlTree(['/login'])", "LoginComponent: form submit -> auth.login() -> router.navigateByUrl(returnUrl)", "Optional: HTTP_INTERCEPTORS that add Authorization header"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Define AuthService with user = signal<User|null>(null), login(username: string, password: string) that sets user.set({ name: username }), and logout() that sets user.set(null). providedIn: 'root'.", answer_keywords: ["AuthService", "user", "login", "logout"], seed_code: `import { Injectable, signal } from '@angular/core';

export interface User { name: string; }
@Injectable({ providedIn: 'root' })
export class AuthService {
  user = signal<User | null>(null);
  login(username: string, _password: string) {
    this.user.set({ name: username });
  }
  logout() {
    this.user.set(null);
  }
}`, feedback_correct: "✅ AuthService with user.", feedback_partial: "login logout.", feedback_wrong: "user.set", expected: "user signal, login(), logout()" },
  { id: "step2", type: "question", phase: "Step 2 of 3", paal: "Create authGuard: CanActivateFn = () => { const auth = inject(AuthService); if (auth.user()) return true; return inject(Router).createUrlTree(['/login'], { queryParams: { returnUrl: inject(Router).url } }); }. Apply to protected routes.", answer_keywords: ["CanActivateFn", "createUrlTree", "returnUrl"], seed_code: `import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = () => {
  if (inject(AuthService).user()) return true;
  return inject(Router).createUrlTree(['/login'], { queryParams: { returnUrl: inject(Router).url } });
};`, feedback_correct: "✅ authGuard with redirect.", feedback_partial: "createUrlTree.", feedback_wrong: "returnUrl", expected: "authGuard and createUrlTree to /login" },
  { id: "step3", type: "question", phase: "Step 3 of 3", paal: "LoginComponent: inject AuthService and Router; on submit call auth.login(username, password) then router.navigateByUrl(returnUrl || '/'). Read returnUrl from ActivatedRoute.queryParams. Export AuthService and guard.", answer_keywords: ["navigateByUrl", "queryParams", "export"], seed_code: `import { Component, inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from './auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  template: \`
    <form (ngSubmit)="onSubmit()">
      <input [(ngModel)]="username" name="username" />
      <input type="password" [(ngModel)]="password" name="password" />
      <button type="submit">Login</button>
    </form>
  \`,
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  username = '';
  password = '';
  onSubmit() {
    this.auth.login(this.username, this.password);
    const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    this.router.navigateByUrl(returnUrl);
  }
}`, feedback_correct: "✅ Design Auth Flow (Angular) complete.", feedback_partial: "navigateByUrl.", feedback_wrong: "Export", expected: "Login submit and navigateByUrl(returnUrl)" },
];

const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }, { label: "Step 2", id: "step2" }, { label: "Step 3", id: "step3" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: 97, title: TITLE, shortName: "A — AUTH FLOW" });
