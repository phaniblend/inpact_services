import createINPACTEngine from "../inpact_engine_shared";

const TITLE = "Race Condition Fix (Angular)";
const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "LESSON #86 (Angular)", title: TITLE, body: "Avoid race conditions when fetching data in Angular: use switchMap so that when the user changes the query (or id) the previous request is cancelled and only the latest one updates the signal; or track request id and ignore stale responses.", usecase: "Angular RxJS switchMap cancels in-flight HTTP requests when the source emits a new value." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["searchTerm$.pipe(switchMap(q => this.http.get('/api?q='+q))).subscribe(...) so new search cancels old", "Or toSignal(searchTerm$.pipe(debounceTime(300), switchMap(...)))", "Never assign result of request N to state if a request N+1 has started; use switchMap to enforce", "takeUntilDestroyed to clean up"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Create a component with searchSubject = new Subject<string>(). Use searchSubject.pipe(switchMap(q => this.http.get('/api/search?q='+q))).subscribe(res => this.results.set(res)). So typing a new query cancels the previous request.", answer_keywords: ["switchMap", "Subject", "http.get"], seed_code: `import { Component, signal, inject } from '@angular/core';
import { Subject } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-race-fix',
  standalone: true,
  template: \`<p>{{ results() | json }}</p>\`,
})
export class RaceFixComponent {
  private http = inject(HttpClient);
  searchSubject = new Subject<string>();
  results = signal<unknown>(null);
  constructor() {
    this.searchSubject.pipe(switchMap(q => this.http.get('/api/search?q='+q))).subscribe(res => this.results.set(res));
  }
}`, feedback_correct: "✅ switchMap for request cancellation.", feedback_partial: "switchMap.", feedback_wrong: "searchSubject", expected: "searchSubject.pipe(switchMap(http.get))" },
  { id: "step2", type: "question", phase: "Step 2 of 3", paal: "Add an input (input)=\"searchSubject.next($any($event.target).value)\". Add takeUntilDestroyed(inject(DestroyRef)) to the pipe so subscription is cleaned up.", answer_keywords: ["takeUntilDestroyed", "DestroyRef", "input"], seed_code: `import { Component, signal, inject, DestroyRef } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Subject } from 'rxjs';
import { switchMap, takeUntilDestroyed } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-race-fix',
  standalone: true,
  template: \`
    <input (input)="searchSubject.next($any($event.target).value)" />
    <p>{{ results() | json }}</p>
  \`,
})
export class RaceFixComponent {
  private http = inject(HttpClient);
  private destroyRef = inject(DestroyRef);
  searchSubject = new Subject<string>();
  results = toSignal(
    this.searchSubject.pipe(
      switchMap(q => this.http.get('/api/search?q='+q)),
      takeUntilDestroyed(this.destroyRef)
    ),
    { initialValue: null }
  );
}`, feedback_correct: "✅ takeUntilDestroyed.", feedback_partial: "DestroyRef.", feedback_wrong: "takeUntilDestroyed", expected: "takeUntilDestroyed and input binding" },
  { id: "step3", type: "question", phase: "Step 3 of 3", paal: "Use distinctUntilChanged() before switchMap so identical consecutive queries don't trigger duplicate requests. Export the component.", answer_keywords: ["distinctUntilChanged", "export"], seed_code: `import { Component, inject, DestroyRef } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Subject } from 'rxjs';
import { switchMap, takeUntilDestroyed, distinctUntilChanged } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-race-fix',
  standalone: true,
  template: \`
    <input (input)="searchSubject.next($any($event.target).value)" />
    <p>{{ results() | json }}</p>
  \`,
})
export class RaceFixComponent {
  private http = inject(HttpClient);
  private destroyRef = inject(DestroyRef);
  searchSubject = new Subject<string>();
  results = toSignal(
    this.searchSubject.pipe(
      distinctUntilChanged(),
      switchMap(q => this.http.get('/api/search?q='+q)),
      takeUntilDestroyed(this.destroyRef)
    ),
    { initialValue: null }
  );
}`, feedback_correct: "✅ Race Condition Fix (Angular) complete.", feedback_partial: "distinctUntilChanged.", feedback_wrong: "Export", expected: "distinctUntilChanged and export" },
];

const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }, { label: "Step 2", id: "step2" }, { label: "Step 3", id: "step3" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: 86, title: TITLE, shortName: "A — RACE FIX" });
