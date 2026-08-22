import createINPACTEngine from "../inpact_engine_shared";

const TITLE = "useFetch (Angular)";
const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "LESSON #31 (Angular)", title: TITLE, body: "Fetch data in Angular using HttpClient: inject(HttpClient), get<T>(url) returning Observable, and subscribe or async pipe in the template; manage loading and error with signals.", usecase: "Angular's HttpClient and async pipe (or toSignal) replace React useFetch-style data fetching." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["Inject HttpClient; in ngOnInit or effect call this.http.get<T>(url).subscribe(...)", "Store result in signal: data = signal<T | null>(null); loading = signal(true); error = signal<Error | null>(null)", "Or use toSignal(this.http.get<T>(url)) for reactive stream-to-signal", "Provide HttpClient via provideHttpClient() in app config"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Create a component that injects HttpClient. Add data = signal<any>(null), loading = signal(true). In ngOnInit call this.http.get('https://api.example.com/data').subscribe({ next: (res) => { this.data.set(res); this.loading.set(false); }, error: (e) => { this.loading.set(false); } }).", answer_keywords: ["HttpClient", "get", "subscribe"], seed_code: `import { Component, signal, OnInit, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-fetch',
  standalone: true,
  template: \`<p *ngIf="loading()">Loading...</p><pre *ngIf="data()">{{ data() | json }}</pre>\`,
})
export class FetchComponent implements OnInit {
  private http = inject(HttpClient);
  data = signal<any>(null);
  loading = signal(true);
  ngOnInit() {
    this.http.get('https://api.example.com/data').subscribe({
      next: (res) => { this.data.set(res); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }
}`, feedback_correct: "✅ HttpClient get and signals.", feedback_partial: "http.get subscribe.", feedback_wrong: "HttpClient", expected: "inject(HttpClient) and get().subscribe" },
  { id: "step2", type: "question", phase: "Step 2 of 3", paal: "Add error = signal<Error | null>(null). In subscribe error callback set error.set(e). In template show *ngIf=\"error()\" with error message. Import CommonModule.", answer_keywords: ["error", "signal", "ngIf"], seed_code: `import { Component, signal, OnInit, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-fetch',
  standalone: true,
  imports: [CommonModule],
  template: \`
    <p *ngIf="loading()">Loading...</p>
    <p *ngIf="error()">Error: {{ error()?.message }}</p>
    <pre *ngIf="data()">{{ data() | json }}</pre>
  \`,
})
export class FetchComponent implements OnInit {
  private http = inject(HttpClient);
  data = signal<any>(null);
  loading = signal(true);
  error = signal<Error | null>(null);
  ngOnInit() {
    this.http.get('https://api.example.com/data').subscribe({
      next: (res) => { this.data.set(res); this.loading.set(false); },
      error: (e) => { this.error.set(e); this.loading.set(false); }
    });
  }
}`, feedback_correct: "✅ Error handling.", feedback_partial: "error.set.", feedback_wrong: "error signal", expected: "error = signal and error.set(e)" },
  { id: "step3", type: "question", phase: "Step 3 of 3", paal: "Use toSignal from @angular/core/rxjs-interop: data = toSignal(this.http.get('...'), { initialValue: null }). Template uses data() with async handling. Export the component.", answer_keywords: ["toSignal", "initialValue"], seed_code: `import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-fetch',
  standalone: true,
  imports: [CommonModule],
  template: \`<pre *ngIf="data()">{{ data() | json }}</pre>\`,
})
export class FetchComponent {
  private http = inject(HttpClient);
  data = toSignal(this.http.get('https://api.example.com/data'), { initialValue: null });
}`, feedback_correct: "✅ useFetch (Angular) complete.", feedback_partial: "toSignal.", feedback_wrong: "toSignal", expected: "toSignal(this.http.get(...), { initialValue: null })" },
];

const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }, { label: "Step 2", id: "step2" }, { label: "Step 3", id: "step3" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: 31, title: TITLE, shortName: "A — HTTP FETCH" });
