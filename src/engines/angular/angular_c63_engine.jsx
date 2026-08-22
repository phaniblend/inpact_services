import createINPACTEngine from "../inpact_engine_shared";

const TITLE = "Debounced Search (Angular)";
const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "LESSON #63 (Angular)", title: TITLE, body: "Build a search input that triggers an API or filter after the user stops typing: use a Subject and pipe(debounceTime(300)), then toSignal or subscribe to update results signal; bind input to the Subject.", usecase: "Angular RxJS debounceTime and Subject (or form valueChanges) implement debounced search." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["searchSubject = new Subject<string>(); (input)=\"searchSubject.next($event.target.value)\"", "debouncedSearch = toSignal(searchSubject.pipe(debounceTime(300)), { initialValue: '' })", "effect(() => { const q = debouncedSearch(); if (q) fetch or filter and set results.set(...) })", "Or use FormsModule and control.valueChanges.pipe(debounceTime(300))"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Create a component with searchSubject = new Subject<string>() and (input)=\"searchSubject.next($any($event.target).value)\". Add debouncedSearch = toSignal(this.searchSubject.pipe(debounceTime(300)), { initialValue: '' }). Display {{ debouncedSearch() }}.", answer_keywords: ["Subject", "debounceTime", "toSignal"], seed_code: `import { Component } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-debounced-search',
  standalone: true,
  template: \`
    <input (input)="searchSubject.next($any($event.target).value)" placeholder="Search" />
    <p>Debounced: {{ debouncedSearch() }}</p>
  \`,
})
export class DebouncedSearchComponent {
  searchSubject = new Subject<string>();
  debouncedSearch = toSignal(this.searchSubject.pipe(debounceTime(300)), { initialValue: '' });
}`, feedback_correct: "✅ Subject and debounced toSignal.", feedback_partial: "debounceTime.", feedback_wrong: "debouncedSearch", expected: "Subject, pipe(debounceTime(300)), toSignal" },
  { id: "step2", type: "question", phase: "Step 2 of 3", paal: "Add results = signal<string[]>([]). In an effect, read debouncedSearch() and when it changes filter a static list or call a service and set results.set(...). Display *ngFor=\"let r of results()\".", answer_keywords: ["effect", "results", "set"], seed_code: `import { Component, signal, effect } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { CommonModule } from '@angular/common';

const ALL = ['Apple', 'Banana', 'Apricot'];
@Component({
  selector: 'app-debounced-search',
  standalone: true,
  imports: [CommonModule],
  template: \`
    <input (input)="searchSubject.next($any($event.target).value)" />
    <ul><li *ngFor="let r of results()">{{ r }}</li></ul>
  \`,
})
export class DebouncedSearchComponent {
  searchSubject = new Subject<string>();
  debouncedSearch = toSignal(this.searchSubject.pipe(debounceTime(300)), { initialValue: '' });
  results = signal<string[]>(ALL);
  constructor() {
    effect(() => {
      const q = this.debouncedSearch().toLowerCase();
      this.results.set(q ? ALL.filter(x => x.toLowerCase().includes(q)) : ALL);
    });
  }
}`, feedback_correct: "✅ effect and results.", feedback_partial: "effect.", feedback_wrong: "results.set", expected: "effect that sets results from debouncedSearch()" },
  { id: "step3", type: "question", phase: "Step 3 of 3", paal: "Use HttpClient to fetch from an API in the effect (inject HttpClient). Use switchMap in the pipe so in-flight requests are cancelled: searchSubject.pipe(debounceTime(300), switchMap(q => this.http.get(...))). Export the component.", answer_keywords: ["HttpClient", "switchMap", "export"], seed_code: `import { Component, signal, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Subject } from 'rxjs';
import { debounceTime, switchMap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-debounced-search',
  standalone: true,
  template: \`
    <input (input)="searchSubject.next($any($event.target).value)" />
    <p>Search: {{ debouncedSearch() }}</p>
  \`,
})
export class DebouncedSearchComponent {
  private http = inject(HttpClient);
  searchSubject = new Subject<string>();
  debouncedSearch = toSignal(this.searchSubject.pipe(debounceTime(300)), { initialValue: '' });
}`, feedback_correct: "✅ Debounced Search (Angular) complete.", feedback_partial: "switchMap.", feedback_wrong: "Export", expected: "debounceTime and optional switchMap" },
];

const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }, { label: "Step 2", id: "step2" }, { label: "Step 3", id: "step3" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: 63, title: TITLE, shortName: "A — DEBOUNCED SEARCH" });
