import createINPACTEngine from "../inpact_engine_shared";

const TITLE = "Generic useFetch<T> (Angular)";
const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "LESSON #69 (Angular)", title: TITLE, body: "Type HttpClient.get<T>(url) so the response is typed; use toSignal(http.get<User[]>(url)) for a typed signal, or a generic service method get<T>(url): Observable<T> that components use with their type.", usecase: "Angular HttpClient.get<T> and toSignal return typed data for type-safe fetch patterns." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["this.http.get<T>(url) returns Observable<T>; toSignal(obs, { initialValue: null }) gives Signal<T | null>", "Define interface User { id: number; name: string }; getUsers(): Observable<User[]>", "Component: users = toSignal(this.api.getUsers(), { initialValue: [] as User[] })", "Type the component's data signal as signal<User[] | null>"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Create an interface User { id: number; name: string }. In a service inject HttpClient and add getUsers(): Observable<User[]> { return this.http.get<User[]>('/api/users'); }.", answer_keywords: ["Observable", "get", "User"], seed_code: `import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface User {
  id: number;
  name: string;
}

@Injectable({ providedIn: 'root' })
export class UserApiService {
  private http = inject(HttpClient);
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>('/api/users');
  }
}`, feedback_correct: "✅ Generic get<User[]>.", feedback_partial: "http.get<User[]>.", feedback_wrong: "Observable", expected: "http.get<User[]>() and Observable" },
  { id: "step2", type: "question", phase: "Step 2 of 3", paal: "Create a component that injects UserApiService. Use users = toSignal(this.api.getUsers(), { initialValue: [] as User[] }). Template: *ngFor=\"let u of users()\" and {{ u.name }}.", answer_keywords: ["toSignal", "users", "User"], seed_code: `import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { UserApiService, User } from './user-api.service';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule],
  template: \`<div *ngFor="let u of users()">{{ u.name }}</div>\`,
})
export class UserListComponent {
  private api = inject(UserApiService);
  users = toSignal(this.api.getUsers(), { initialValue: [] as User[] });
}`, feedback_correct: "✅ toSignal with User[].", feedback_partial: "users().", feedback_wrong: "toSignal", expected: "toSignal(api.getUsers(), { initialValue: [] as User[] })" },
  { id: "step3", type: "question", phase: "Step 3 of 3", paal: "Add a generic method in service: getById<T>(url: string): Observable<T> { return this.http.get<T>(url); }. Use it in a component with getById<User>('/api/users/1'). Export service and component.", answer_keywords: ["getById", "export"], seed_code: `import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UserApiService {
  private http = inject(HttpClient);
  getById<T>(url: string): Observable<T> {
    return this.http.get<T>(url);
  }
}`, feedback_correct: "✅ Generic useFetch<T> (Angular) complete.", feedback_partial: "getById<T>.", feedback_wrong: "Export", expected: "getById<T>(url): Observable<T>" },
];

const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }, { label: "Step 2", id: "step2" }, { label: "Step 3", id: "step3" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: 69, title: TITLE, shortName: "A — GENERIC FETCH" });
