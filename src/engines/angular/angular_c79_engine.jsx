import createINPACTEngine from "../inpact_engine_shared";

const TITLE = "Polling Hook (Angular)";
const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "LESSON #79 (Angular)", title: TITLE, body: "Poll an API at an interval in Angular: use interval(ms).pipe(switchMap(() => this.http.get(url))), takeUntilDestroyed(), and toSignal so the component gets fresh data every N seconds and cleans up on destroy.", usecase: "Angular interval + switchMap + HttpClient and takeUntilDestroyed implement polling." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["interval(5000).pipe(switchMap(() => this.http.get(url)), takeUntilDestroyed(this.destroyRef))", "toSignal(obs, { initialValue: null }) so component has signal with latest data", "Start polling in constructor or ngOnInit; stop when component destroyed", "Optional: pause/resume with a subject or signal"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Create a component that injects HttpClient and DestroyRef. Use interval(3000).pipe(switchMap(() => this.http.get('/api/status')), takeUntilDestroyed(this.destroyRef)). Subscribe and set a signal data = signal(null).", answer_keywords: ["interval", "switchMap", "takeUntilDestroyed"], seed_code: `import { Component, signal, inject, DestroyRef } from '@angular/core';
import { interval } from 'rxjs';
import { switchMap, takeUntilDestroyed } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-polling',
  standalone: true,
  template: \`<p>{{ data() | json }}</p>\`,
})
export class PollingComponent {
  private http = inject(HttpClient);
  private destroyRef = inject(DestroyRef);
  data = signal<unknown>(null);
  constructor() {
    interval(3000).pipe(
      switchMap(() => this.http.get('/api/status')),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(res => this.data.set(res));
  }
}`, feedback_correct: "✅ interval and switchMap.", feedback_partial: "interval.", feedback_wrong: "takeUntilDestroyed", expected: "interval.pipe(switchMap(http.get), takeUntilDestroyed)" },
  { id: "step2", type: "question", phase: "Step 2 of 3", paal: "Use toSignal instead of subscribe: data = toSignal(interval(3000).pipe(switchMap(() => this.http.get('/api/status')), takeUntilDestroyed(this.destroyRef)), { initialValue: null }).", answer_keywords: ["toSignal", "data", "initialValue"], seed_code: `import { Component, inject, DestroyRef } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { interval } from 'rxjs';
import { switchMap, takeUntilDestroyed } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-polling',
  standalone: true,
  template: \`<p>{{ data() | json }}</p>\`,
})
export class PollingComponent {
  private http = inject(HttpClient);
  private destroyRef = inject(DestroyRef);
  data = toSignal(
    interval(3000).pipe(switchMap(() => this.http.get('/api/status')), takeUntilDestroyed(this.destroyRef)),
    { initialValue: null }
  );
}`, feedback_correct: "✅ toSignal for polling.", feedback_partial: "toSignal.", feedback_wrong: "data()", expected: "toSignal(interval.pipe(switchMap, takeUntilDestroyed))" },
  { id: "step3", type: "question", phase: "Step 3 of 3", paal: "Add a signal polling = signal(true). Use it in the pipe: switchMap(() => polling() ? this.http.get('/api/status') : EMPTY). So polling can be paused. Export the component.", answer_keywords: ["polling", "EMPTY", "export"], seed_code: `import { Component, inject, DestroyRef } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { interval, EMPTY } from 'rxjs';
import { switchMap, takeUntilDestroyed } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-polling',
  standalone: true,
  template: \`<p>{{ data() | json }}</p>\`,
})
export class PollingComponent {
  private http = inject(HttpClient);
  private destroyRef = inject(DestroyRef);
  polling = signal(true);
  data = toSignal(
    interval(3000).pipe(
      switchMap(() => this.polling() ? this.http.get('/api/status') : EMPTY),
      takeUntilDestroyed(this.destroyRef)
    ),
    { initialValue: null }
  );
}`, feedback_correct: "✅ Polling Hook (Angular) complete.", feedback_partial: "polling signal.", feedback_wrong: "Export", expected: "polling flag and EMPTY when paused" },
];

const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }, { label: "Step 2", id: "step2" }, { label: "Step 3", id: "step3" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: 79, title: TITLE, shortName: "A — POLLING" });
