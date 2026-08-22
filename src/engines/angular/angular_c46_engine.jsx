import createINPACTEngine from "../inpact_engine_shared";

const TITLE = "useReducer vs useState (Angular)";
const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "LESSON #46 (Angular)", title: TITLE, body: "Model complex state with a reducer pattern in Angular: use a signal holding an object and a dispatch method that applies actions (e.g. INCREMENT, ADD) and updates the signal with the new state.", usecase: "Angular signals plus a reducer function replicate React useReducer for predictable state updates." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["state = signal(initialState); dispatch(action) { this.state.update(s => reducer(s, action)); }", "Reducer: (state, action) => { switch (action.type) { case 'INC': return { ...state, count: state.count + 1 }; ... } }", "Use typed actions: type Action = { type: 'INC' } | { type: 'ADD'; payload: number }", "Template reads state().count and calls dispatch({ type: 'INC' })"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Create a reducer: function counterReducer(s: { count: number }, a: { type: string; payload?: number }) { switch (a.type) { case 'INC': return { count: s.count + 1 }; case 'ADD': return { count: s.count + (a.payload ?? 0) }; default: return s; } }. Create state = signal({ count: 0 }).", answer_keywords: ["reducer", "signal", "count"], seed_code: `import { Component, signal } from '@angular/core';

function counterReducer(s: { count: number }, a: { type: string; payload?: number }) {
  switch (a.type) {
    case 'INC': return { count: s.count + 1 };
    case 'ADD': return { count: s.count + (a.payload ?? 0) };
    default: return s;
  }
}

@Component({
  selector: 'app-reducer',
  standalone: true,
  template: \`<p>{{ state().count }}</p>\`,
})
export class ReducerComponent {
  state = signal({ count: 0 });
}`, feedback_correct: "✅ Reducer and state signal.", feedback_partial: "reducer switch.", feedback_wrong: "counterReducer", expected: "reducer and state = signal({ count: 0 })" },
  { id: "step2", type: "question", phase: "Step 2 of 3", paal: "Add dispatch(action: { type: string; payload?: number }) { this.state.update(s => counterReducer(s, action)); }. Template: button (click)=\"dispatch({ type: 'INC' })\".", answer_keywords: ["dispatch", "update", "INC"], seed_code: `import { Component, signal } from '@angular/core';

function counterReducer(s: { count: number }, a: { type: string; payload?: number }) {
  switch (a.type) {
    case 'INC': return { count: s.count + 1 };
    case 'ADD': return { count: s.count + (a.payload ?? 0) };
    default: return s;
  }
}

@Component({
  selector: 'app-reducer',
  standalone: true,
  template: \`<p>{{ state().count }}</p><button (click)="dispatch({ type: 'INC' })">+1</button>\`,
})
export class ReducerComponent {
  state = signal({ count: 0 });
  dispatch(action: { type: string; payload?: number }) {
    this.state.update(s => counterReducer(s, action));
  }
}`, feedback_correct: "✅ dispatch and update.", feedback_partial: "state.update.", feedback_wrong: "dispatch", expected: "dispatch and state.update(s => reducer(s, action))" },
  { id: "step3", type: "question", phase: "Step 3 of 3", paal: "Add (click)=\"dispatch({ type: 'ADD', payload: 10 })\". Export the component.", answer_keywords: ["ADD", "payload", "export"], seed_code: `import { Component, signal } from '@angular/core';

function counterReducer(s: { count: number }, a: { type: string; payload?: number }) {
  switch (a.type) {
    case 'INC': return { count: s.count + 1 };
    case 'ADD': return { count: s.count + (a.payload ?? 0) };
    default: return s;
  }
}

@Component({
  selector: 'app-reducer',
  standalone: true,
  template: \`
    <p>{{ state().count }}</p>
    <button (click)="dispatch({ type: 'INC' })">+1</button>
    <button (click)="dispatch({ type: 'ADD', payload: 10 })">+10</button>
  \`,
})
export class ReducerComponent {
  state = signal({ count: 0 });
  dispatch(action: { type: string; payload?: number }) {
    this.state.update(s => counterReducer(s, action));
  }
}`, feedback_correct: "✅ useReducer vs useState (Angular) complete.", feedback_partial: "ADD payload.", feedback_wrong: "Export", expected: "dispatch({ type: 'ADD', payload: 10 })" },
];

const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }, { label: "Step 2", id: "step2" }, { label: "Step 3", id: "step3" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: 46, title: TITLE, shortName: "A — REDUCER" });
