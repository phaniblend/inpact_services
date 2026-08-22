import createINPACTEngine from "../inpact_engine_shared";

const TITLE = "useMemo for Expensive Computation (Angular)";
const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "LESSON #49 (Angular)", title: TITLE, body: "Cache expensive derived values in Angular using computed(): the computation runs only when its signal dependencies change and the result is memoized.", usecase: "Angular computed() is the equivalent of React useMemo for signal-based derived state." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["expensive = computed(() => { ... heavy work using this.someSignal(); return result; })", "Use expensive() in template; recomputes only when someSignal changes", "Don't put side effects in computed; keep it pure", "For async or external data use toSignal or resource()"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Create a component with list = signal([1,2,3,4,5]). Add sorted = computed(() => [...this.list()].sort((a,b) => b - a)). Display sorted() in template.", answer_keywords: ["computed", "sorted", "list"], seed_code: `import { Component, signal, computed } from '@angular/core';

@Component({
  selector: 'app-memo',
  standalone: true,
  template: \`<p>{{ sorted() }}</p>\`,
})
export class MemoComponent {
  list = signal([1, 2, 3, 4, 5]);
  sorted = computed(() => [...this.list()].sort((a, b) => b - a));
}`, feedback_correct: "✅ computed sorted.", feedback_partial: "computed.", feedback_wrong: "sorted", expected: "computed(() => [...list()].sort(...))" },
  { id: "step2", type: "question", phase: "Step 2 of 3", paal: "Add total = computed(() => this.list().reduce((s, x) => s + x, 0)). Use both sorted() and total() in template.", answer_keywords: ["total", "reduce", "computed"], seed_code: `import { Component, signal, computed } from '@angular/core';

@Component({
  selector: 'app-memo',
  standalone: true,
  template: \`<p>Sorted: {{ sorted() }} Total: {{ total() }}</p>\`,
})
export class MemoComponent {
  list = signal([1, 2, 3, 4, 5]);
  sorted = computed(() => [...this.list()].sort((a, b) => b - a));
  total = computed(() => this.list().reduce((s, x) => s + x, 0));
}`, feedback_correct: "✅ total computed.", feedback_partial: "reduce.", feedback_wrong: "total", expected: "computed(() => list().reduce(...))" },
  { id: "step3", type: "question", phase: "Step 3 of 3", paal: "Add a button that updates list with list.update(l => [...l, l.length + 1]). Verify sorted and total update only when list changes. Export the component.", answer_keywords: ["update", "list", "export"], seed_code: `import { Component, signal, computed } from '@angular/core';

@Component({
  selector: 'app-memo',
  standalone: true,
  template: \`
    <p>Sorted: {{ sorted() }} Total: {{ total() }}</p>
    <button (click)="list.update(l => [...l, l.length + 1])">Add</button>
  \`,
})
export class MemoComponent {
  list = signal([1, 2, 3, 4, 5]);
  sorted = computed(() => [...this.list()].sort((a, b) => b - a));
  total = computed(() => this.list().reduce((s, x) => s + x, 0));
}`, feedback_correct: "✅ useMemo for Expensive Computation (Angular) complete.", feedback_partial: "list.update.", feedback_wrong: "Export", expected: "list.update and export" },
];

const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }, { label: "Step 2", id: "step2" }, { label: "Step 3", id: "step3" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: 49, title: TITLE, shortName: "A — COMPUTED" });
