import createINPACTEngine from "../inpact_engine_shared";

const TITLE = "useDebounce (Angular)";
const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "LESSON #32 (Angular)", title: TITLE, body: "Debounce user input or search using RxJS Subject and pipe(debounceTime(300)) so API or heavy work runs only after the user pauses typing.", usecase: "Angular uses RxJS debounceTime and Subject or form valueChanges for debounced values." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["Create a Subject or use FormControl valueChanges; pipe(debounceTime(ms))", "Subscribe and update a signal, or use toSignal(obs.pipe(debounceTime(300)))", "Emit on input: subject.next(value) or bind form control", "Unsubscribe in ngOnDestroy or use takeUntilDestroyed()"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Create a component with searchTerm = signal(''). Add an input (input)=\"onInput($event)\". In onInput use a private Subject: searchSubject.next($any($event.target).value).", answer_keywords: ["Subject", "next", "input"], seed_code: `import { Component, signal, inject } from '@angular/core';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-debounce',
  standalone: true,
  template: \`<input (input)="onInput($event)" placeholder="Search" />\`,
})
export class DebounceComponent {
  searchTerm = signal('');
  private searchSubject = new Subject<string>();
  onInput(e: Event) {
    this.searchSubject.next((e.target as HTMLInputElement).value);
  }
}`, feedback_correct: "✅ Subject and next.", feedback_partial: "Subject.", feedback_wrong: "searchSubject.next", expected: "Subject and (input)=\"onInput($event)\"" },
  { id: "step2", type: "question", phase: "Step 2 of 3", paal: "In ngOnInit subscribe to searchSubject.pipe(debounceTime(300)).subscribe(v => this.searchTerm.set(v)). Inject DestroyRef and use takeUntilDestroyed() in the pipe to avoid leaks.", answer_keywords: ["debounceTime", "subscribe", "set"], seed_code: `import { Component, signal, OnInit, inject, DestroyRef } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-debounce',
  standalone: true,
  template: \`<input (input)="onInput($event)" /> <span>Debounced: {{ searchTerm() }}</span>\`,
})
export class DebounceComponent implements OnInit {
  private destroyRef = inject(DestroyRef);
  searchTerm = signal('');
  private searchSubject = new Subject<string>();
  onInput(e: Event) { this.searchSubject.next((e.target as HTMLInputElement).value); }
  ngOnInit() {
    this.searchSubject.pipe(debounceTime(300), takeUntilDestroyed(this.destroyRef)).subscribe(v => this.searchTerm.set(v));
  }
}`, feedback_correct: "✅ debounceTime and takeUntilDestroyed.", feedback_partial: "debounceTime.", feedback_wrong: "debounceTime(300)", expected: "pipe(debounceTime(300)) and searchTerm.set(v)" },
  { id: "step3", type: "question", phase: "Step 3 of 3", paal: "Use toSignal: debouncedSearch = toSignal(searchSubject.pipe(debounceTime(300)), { initialValue: '' }). Display debouncedSearch() in template. Export the component.", answer_keywords: ["toSignal", "debouncedSearch"], seed_code: `import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-debounce',
  standalone: true,
  template: \`<input (input)="onInput($event)" /> <span>Debounced: {{ debouncedSearch() }}</span>\`,
})
export class DebounceComponent {
  private searchSubject = new Subject<string>();
  debouncedSearch = toSignal(this.searchSubject.pipe(debounceTime(300)), { initialValue: '' });
  onInput(e: Event) { this.searchSubject.next((e.target as HTMLInputElement).value); }
}`, feedback_correct: "✅ useDebounce (Angular) complete.", feedback_partial: "toSignal.", feedback_wrong: "Export", expected: "toSignal(pipe(debounceTime(300)))" },
];

const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }, { label: "Step 2", id: "step2" }, { label: "Step 3", id: "step3" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: 32, title: TITLE, shortName: "A — DEBOUNCE" });
