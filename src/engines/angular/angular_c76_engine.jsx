import createINPACTEngine from "../inpact_engine_shared";

const TITLE = "Mini Redux (Angular)";
const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "LESSON #76 (Angular)", title: TITLE, body: "Implement a minimal Redux-like store in Angular: a service with a BehaviorSubject for state, dispatch(action) that runs a reducer and calls state.next(newState), and components use toSignal(store.state$) to read state.", usecase: "Angular service with reducer and BehaviorSubject replicates a mini Redux pattern." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["type State = { count: number }; type Action = { type: 'INC' } | { type: 'SET'; payload: number }", "reducer(state, action): State; private state = new BehaviorSubject(initialState)", "dispatch(action) { this.state.next(this.reducer(this.state.getValue(), action)); }", "getState() and state$ = state.asObservable(); toSignal(store.state$) in components"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Define State = { count: number }, Action = { type: 'INC' } | { type: 'SET'; payload: number }, and reducer(state: State, action: Action): State. Create StoreService with private state = new BehaviorSubject<State>({ count: 0 }).", answer_keywords: ["reducer", "BehaviorSubject", "State"], seed_code: `import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

type State = { count: number };
type Action = { type: 'INC' } | { type: 'SET'; payload: number };

function reducer(s: State, a: Action): State {
  if (a.type === 'INC') return { count: s.count + 1 };
  if (a.type === 'SET') return { count: a.payload };
  return s;
}

@Injectable({ providedIn: 'root' })
export class MiniReduxService {
  private state = new BehaviorSubject<State>({ count: 0 });
  dispatch(action: Action) {
    this.state.next(reducer(this.state.getValue(), action));
  }
  getState() { return this.state.getValue(); }
  state$ = this.state.asObservable();
}`, feedback_correct: "✅ Mini Redux store.", feedback_partial: "reducer and dispatch.", feedback_wrong: "state.next", expected: "reducer, BehaviorSubject, dispatch" },
  { id: "step2", type: "question", phase: "Step 2 of 3", paal: "Component: inject store, use count = toSignal(store.state$.pipe(map(s => s.count)), { initialValue: store.getState().count }). Template: {{ count() }} and buttons that call store.dispatch({ type: 'INC' }) and store.dispatch({ type: 'SET', payload: 0 }).", answer_keywords: ["toSignal", "dispatch", "map"], seed_code: `import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { MiniReduxService } from './mini-redux.service';

@Component({
  selector: 'app-mini-redux',
  standalone: true,
  template: \`
    <p>{{ count() }}</p>
    <button (click)="store.dispatch({ type: 'INC' })">+1</button>
    <button (click)="store.dispatch({ type: 'SET', payload: 0 })">Reset</button>
  \`,
})
export class MiniReduxComponent {
  store = inject(MiniReduxService);
  count = toSignal(this.store.state$.pipe(map(s => s.count)), { initialValue: this.store.getState().count });
}`, feedback_correct: "✅ toSignal and dispatch.", feedback_partial: "store.dispatch.", feedback_wrong: "count()", expected: "toSignal(store.state$.pipe(map)) and dispatch" },
  { id: "step3", type: "question", phase: "Step 3 of 3", paal: "Add select<T>(fn: (s: State) => T): Observable<T> in the store using state$.pipe(map(fn)). Use it in component: count = toSignal(store.select(s => s.count)). Export store and component.", answer_keywords: ["select", "Observable", "export"], seed_code: `import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

type State = { count: number };
type Action = { type: 'INC' } | { type: 'SET'; payload: number };
function reducer(s: State, a: Action): State {
  if (a.type === 'INC') return { count: s.count + 1 };
  if (a.type === 'SET') return { count: a.payload };
  return s;
}

@Injectable({ providedIn: 'root' })
export class MiniReduxService {
  private state = new BehaviorSubject<State>({ count: 0 });
  dispatch(action: Action) { this.state.next(reducer(this.state.getValue(), action)); }
  getState() { return this.state.getValue(); }
  state$ = this.state.asObservable();
  select<T>(fn: (s: State) => T) { return this.state$.pipe(map(fn)); }
}`, feedback_correct: "✅ Mini Redux (Angular) complete.", feedback_partial: "select.", feedback_wrong: "Export", expected: "select(fn) and export" },
];

const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }, { label: "Step 2", id: "step2" }, { label: "Step 3", id: "step3" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: 76, title: TITLE, shortName: "A — MINI REDUX" });
