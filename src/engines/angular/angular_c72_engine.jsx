import createINPACTEngine from "../inpact_engine_shared";

const TITLE = "useSyncExternalStore (Angular)";
const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "LESSON #72 (Angular)", title: TITLE, body: "Subscribe to external store (e.g. a BehaviorSubject or Redux-like store) in Angular using toSignal(store$.asObservable()) so the component gets reactive updates; the store can be a service with getState() and subscribe().", usecase: "Angular toSignal over an external Observable replicates useSyncExternalStore for store subscription." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["Store service: private state = new BehaviorSubject(initial); getState() { return this.state.getValue(); } subscribe(cb) { return this.state.subscribe(cb); }", "Component: data = toSignal(store.getState$(), { initialValue: store.getState() })", "Or data = toSignal(store.state.asObservable())", "Update store: store.dispatch(action) and state.next(newState)"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Create StoreService with private state = new BehaviorSubject<number>(0). getValue() { return this.state.getValue(); }. setValue(n: number) { this.state.next(n); }. asObservable() { return this.state.asObservable(); }. providedIn: 'root'.", answer_keywords: ["BehaviorSubject", "getValue", "next"], seed_code: `import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class StoreService {
  private state = new BehaviorSubject<number>(0);
  getValue() { return this.state.getValue(); }
  setValue(n: number) { this.state.next(n); }
  asObservable() { return this.state.asObservable(); }
}`, feedback_correct: "✅ Store with BehaviorSubject.", feedback_partial: "BehaviorSubject.", feedback_wrong: "state.next", expected: "BehaviorSubject and getValue/setValue" },
  { id: "step2", type: "question", phase: "Step 2 of 3", paal: "Create a component that injects StoreService. Use value = toSignal(store.asObservable(), { initialValue: store.getValue() }). Template: {{ value() }} and a button (click)=\"store.setValue(store.getValue() + 1)\".", answer_keywords: ["toSignal", "asObservable", "value"], seed_code: `import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { StoreService } from './store.service';

@Component({
  selector: 'app-sync-store',
  standalone: true,
  template: \`
    <p>{{ value() }}</p>
    <button (click)="store.setValue(store.getValue() + 1)">+1</button>
  \`,
})
export class SyncStoreComponent {
  store = inject(StoreService);
  value = toSignal(this.store.asObservable(), { initialValue: this.store.getValue() });
}`, feedback_correct: "✅ toSignal from store.", feedback_partial: "toSignal.", feedback_wrong: "value()", expected: "toSignal(store.asObservable())" },
  { id: "step3", type: "question", phase: "Step 3 of 3", paal: "Ensure initialValue matches store.getState() so there's no hydration mismatch. Export StoreService and the component.", answer_keywords: ["initialValue", "export"], seed_code: `import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { StoreService } from './store.service';

@Component({
  selector: 'app-sync-store',
  standalone: true,
  template: \`
    <p>{{ value() }}</p>
    <button (click)="store.setValue(store.getValue() + 1)">+1</button>
  \`,
})
export class SyncStoreComponent {
  store = inject(StoreService);
  value = toSignal(this.store.asObservable(), { initialValue: this.store.getValue() });
}`, feedback_correct: "✅ useSyncExternalStore (Angular) complete.", feedback_partial: "initialValue.", feedback_wrong: "Export", expected: "initialValue: store.getValue() and export" },
];

const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }, { label: "Step 2", id: "step2" }, { label: "Step 3", id: "step3" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: 72, title: TITLE, shortName: "A — SYNC EXTERNAL STORE" });
