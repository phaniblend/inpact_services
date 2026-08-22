import createINPACTEngine from "../inpact_engine_shared";

const TITLE = "Request Deduplication (Angular)";
const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "LESSON #78 (Angular)", title: TITLE, body: "Ensure multiple subscribers to the same HTTP request get one shared result: use shareReplay(1) on the Observable so the request runs once and later subscribers get the cached value.", usecase: "Angular HttpClient plus RxJS shareReplay(1) deduplicates in-flight or repeated requests." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["getUser(id): Observable<User> { return this.http.get<User>(url).pipe(shareReplay(1)); }", "Multiple components calling getUser(1) share the same request/result", "Or cache in a Map and return cached observable if present", "Use shareReplay({ bufferSize: 1, refCount: true }) for cache with ref count"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Create a service with getData(): Observable<string> { return this.http.get<string>('/api/data').pipe(shareReplay(1)); }. Inject HttpClient. Two components that call getData() and subscribe should trigger only one HTTP request.", answer_keywords: ["shareReplay", "getData", "Observable"], seed_code: `import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class DataService {
  private http = inject(HttpClient);
  getData(): Observable<string> {
    return this.http.get<string>('/api/data').pipe(shareReplay(1));
  }
}`, feedback_correct: "✅ shareReplay(1).", feedback_partial: "shareReplay.", feedback_wrong: "getData", expected: "http.get().pipe(shareReplay(1))" },
  { id: "step2", type: "question", phase: "Step 2 of 3", paal: "Create two components that both inject the service and use toSignal(service.getData(), { initialValue: null }). Both should see the same result and only one request should be made (verify in network or with a tap).", answer_keywords: ["toSignal", "getData", "service"], seed_code: `import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { DataService } from './data.service';

@Component({
  selector: 'app-dedup-a',
  standalone: true,
  template: \`<p>{{ data() }}</p>\`,
})
export class DedupAComponent {
  private service = inject(DataService);
  data = toSignal(this.service.getData(), { initialValue: null });
}`, feedback_correct: "✅ toSignal from shared observable.", feedback_partial: "getData().", feedback_wrong: "toSignal", expected: "toSignal(service.getData())" },
  { id: "step3", type: "question", phase: "Step 3 of 3", paal: "Add cache by key: private cache = new Map<number, Observable<User>>(); getUserId(id: number) { if (!this.cache.has(id)) this.cache.set(id, this.http.get<User>('/user/'+id).pipe(shareReplay(1))); return this.cache.get(id)!; }. Export the service.", answer_keywords: ["cache", "Map", "export"], seed_code: `import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';

interface User { id: number; name: string; }
@Injectable({ providedIn: 'root' })
export class DataService {
  private http = inject(HttpClient);
  private cache = new Map<number, Observable<User>>();
  getUserId(id: number): Observable<User> {
    if (!this.cache.has(id)) this.cache.set(id, this.http.get<User>('/user/'+id).pipe(shareReplay(1)));
    return this.cache.get(id)!;
  }
}`, feedback_correct: "✅ Request Deduplication (Angular) complete.", feedback_partial: "cache Map.", feedback_wrong: "Export", expected: "Map cache and shareReplay per key" },
];

const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }, { label: "Step 2", id: "step2" }, { label: "Step 3", id: "step3" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: 78, title: TITLE, shortName: "A — REQUEST DEDUP" });
