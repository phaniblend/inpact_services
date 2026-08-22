import { useState, useEffect } from "react";
import InpactLogo from "../../components/InpactLogo.jsx";
import CodeEditor from "../CodeEditor";
import LessonEditorOutputTabs from "../LessonEditorOutputTabs";

if (typeof document !== "undefined" && !document.getElementById("dm-sans-font")) {
  const link = document.createElement("link");
  link.id = "dm-sans-font";
  link.rel = "stylesheet";
  link.href = "https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap";
  document.head.appendChild(link);
}

// ─── ENGINE ANG04: RxJS ESSENTIALS ───────────────────────────────────────────
// Covers: Observable vs Promise, Subject/BehaviorSubject/ReplaySubject,
// switchMap vs mergeMap vs concatMap vs exhaustMap,
// debounceTime vs throttleTime, combineLatest vs forkJoin vs zip,
// takeUntil cleanup, cold vs hot observables, retry logic

const NODES = [
  {
    id: "intro", type: "reveal", phase: "Lesson",
    content: {
      tag: "ANG04 — RxJS ESSENTIALS",
      title: "Real-Time Board",
      body: `Build the RxJS layer for a live flight status board that:

  • Polls the flight API every 30 seconds using an Observable stream
  • Has a search input that debounces 300ms before hitting the API
  • Cancels in-flight requests when a new search is typed (no stale results)
  • Loads origin airport AND destination airport data in parallel
  • Broadcasts the selected flight to multiple components via a shared Subject
  • Retries failed API calls up to 3 times before showing an error
  • Cleans up all subscriptions when components are destroyed`,
      usecase: "RxJS is where Angular interviews separate mid-level from senior. switchMap vs mergeMap is the most common hard question. If you can explain the four flattening operators cold and give a real use case for each — you're in senior territory.",
    },
  },

  {
    id: "objectives", type: "objectives", phase: "Objectives",
    items: [
      "Explain Observable vs Promise — lazy vs eager, cancellable, multiple values",
      "Distinguish Subject, BehaviorSubject, and ReplaySubject — and when to use each",
      "Explain switchMap, mergeMap, concatMap, exhaustMap — and give a real use case for each",
      "Use debounceTime vs throttleTime and explain the difference",
      "Combine observables with combineLatest, forkJoin, and zip — and explain when each fires",
      "Implement the takeUntil cleanup pattern",
      "Explain cold vs hot observables with examples",
      "Implement retry logic for failed HTTP calls",
    ],
  },

  {
    id: "step1", type: "question", phase: "Step 1 of 8",
    paal: "Create a search input stream: start with a BehaviorSubject for the search term, pipe it through debounceTime(300) and distinctUntilChanged, then switchMap to the flight search API call.",
    hint: "BehaviorSubject holds the current value. debounceTime waits 300ms after typing stops. switchMap cancels the previous inner Observable when a new value arrives.",
    answer_keywords: ["behaviorsubject", "debounceTime", "distinctUntilChanged", "switchmap"],
    seed_code: `import { BehaviorSubject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

// Step 1: Build the search stream
// searchTerm$ should be a BehaviorSubject<string>
// Pipe: debounceTime(300) → distinctUntilChanged → switchMap to API call

`,
    analogy: {
      title: "The search typeahead pattern — most common RxJS interview scenario",
      code: `// The classic: user types → debounce → cancel old request → new request

private searchTerm$ = new BehaviorSubject<string>('');

readonly flights$ = this.searchTerm$.pipe(
  debounceTime(300),          // wait 300ms after last keystroke
  distinctUntilChanged(),     // skip if value didn't change
  switchMap(term =>           // cancel previous, start new
    this.flightService.search(term)
  )
);

// WHY switchMap (not mergeMap)?
// User types "L" → request fires
// User types "LA" → switchMap CANCELS "L" request, fires "LA"
// Without switchMap: "L" response could arrive AFTER "LA" = stale data

// Update the subject from the template:
onSearch(term: string) { this.searchTerm$.next(term); }`,
      explain: "switchMap is the correct operator for search typeahead because it cancels the previous in-flight HTTP request when a new value arrives. mergeMap would let all requests run concurrently — you'd get stale results if an older request resolves after a newer one.",
    },
    evaluate: (ans) => {
      const a = ans.toLowerCase().replace(/\s+/g, "");
      const hasBehav = a.includes("behaviorsubject");
      const hasDebounce = a.includes("debouncetime");
      const hasSwitch = a.includes("switchmap");
      if (hasBehav && hasDebounce && hasSwitch) return "correct";
      if (hasBehav && (hasDebounce || hasSwitch)) return "partial";
      return "wrong";
    },
    feedback_correct: "✅ Correct. BehaviorSubject + debounceTime + switchMap is the canonical search typeahead pattern. Interview answer: 'switchMap cancels the previous inner Observable — preventing stale results from an older slower request resolving after a newer one.'",
    feedback_partial: "Good start — make sure all three are present: BehaviorSubject for the source, debounceTime(300), and switchMap to the API call.",
    feedback_wrong: `private searchTerm$ = new BehaviorSubject<string>('');\n\nreadonly flights$ = this.searchTerm$.pipe(\n  debounceTime(300),\n  distinctUntilChanged(),\n  switchMap(term => this.flightService.search(term))\n);`,
    expected: `private searchTerm$ = new BehaviorSubject<string>('');\n\nreadonly flights$ = this.searchTerm$.pipe(\n  debounceTime(300),\n  distinctUntilChanged(),\n  switchMap(term => this.flightService.search(term))\n);`,
    type_input: "code",
  },

  {
    id: "step2", type: "question", phase: "Step 2 of 8",
    paal: "Explain the four flattening operators by writing a code comment for each: switchMap, mergeMap, concatMap, exhaustMap. Give a one-line real use case for each.",
    hint: "Think about what happens to the PREVIOUS inner Observable when a new outer value arrives. That's the key distinction.",
    answer_keywords: ["switchmap", "mergemap", "concatmap", "exhaustmap"],
    seed_code: `// Step 2: Explain all four flattening operators
// For each: what happens to the previous inner Observable?
// And: what real UI scenario would you use it for?

// switchMap:

// mergeMap:

// concatMap:

// exhaustMap:
`,
    analogy: {
      title: "The four flattening operators — what each does to the previous request",
      code: `// switchMap: CANCELS previous inner observable
// → Search typeahead, autocomplete
// New value arrives → old HTTP request cancelled
switchMap(term => http.get('/search?q=' + term))

// mergeMap: KEEPS all inner observables running concurrently
// → File uploads, analytics events, fire-and-forget
// All requests run in parallel, all responses processed
mergeMap(file => http.post('/upload', file))

// concatMap: QUEUES — waits for previous to complete
// → Sequential operations, ordered processing
// Next request only starts after current one completes
concatMap(item => http.post('/queue', item))

// exhaustMap: IGNORES new values while inner is active
// → Login button, form submit (prevent double-submit)
// If a request is in flight, new clicks are ignored
exhaustMap(() => http.post('/login', credentials))`,
      explain: "This is the most-asked hard RxJS question. The key: think about what happens to the PREVIOUS inner observable. switchMap cancels it. mergeMap keeps it. concatMap queues after it. exhaustMap ignores new values until it completes. Memorise the use cases: search = switchMap, upload = mergeMap, queue = concatMap, login = exhaustMap.",
    },
    evaluate: (ans) => {
      const a = ans.toLowerCase().replace(/\s+/g, "");
      const hasAll = ["switchmap","mergemap","concatmap","exhaustmap"].every(k => a.includes(k));
      const hasSome = ["switchmap","mergemap","concatmap","exhaustmap"].filter(k => a.includes(k)).length >= 3;
      if (hasAll) return "correct";
      if (hasSome) return "partial";
      return "wrong";
    },
    feedback_correct: "✅ Correct. The four operators differentiated by what happens to the previous inner Observable. Interview line to memorise: switch=cancel, merge=keep, concat=queue, exhaust=ignore.",
    feedback_partial: "Good — you have most of them. Make sure all four are covered: switchMap, mergeMap, concatMap, exhaustMap — each with a use case.",
    feedback_wrong: `// switchMap: cancels previous → search typeahead\n// mergeMap: keeps all running → file uploads\n// concatMap: queues next after current → sequential ops\n// exhaustMap: ignores new while active → login button`,
    expected: `// switchMap: cancels previous → search typeahead\n// mergeMap: keeps all running → file uploads\n// concatMap: queues → sequential processing\n// exhaustMap: ignores new while active → login/submit`,
    type_input: "code",
  },

  {
    id: "step3", type: "question", phase: "Step 3 of 8",
    paal: "Load origin airport data AND destination airport data in parallel, then combine them. Both are HTTP calls. Use forkJoin to wait for both to complete, then map the results.",
    hint: "forkJoin waits for ALL observables to complete, then emits once. Like Promise.all(). Use it when you need all results before proceeding.",
    answer_keywords: ["forkjoin", "origin", "destination"],
    seed_code: `import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';

// Step 3: Load origin AND destination airports in parallel
// Both: this.airportService.getAirport(code) → Observable<Airport>
// Combine with forkJoin, map to { origin, destination }

loadAirports(originCode: string, destCode: string) {
  // implement here
}`,
    analogy: {
      title: "forkJoin vs combineLatest vs zip",
      code: `// forkJoin: wait for ALL to COMPLETE, emit once
// Like Promise.all() — use for parallel HTTP calls
forkJoin({
  origin: airportService.getAirport('LAX'),
  destination: airportService.getAirport('ORD')
}).pipe(
  map(({ origin, destination }) => ({ origin, destination }))
)
// Emits: { origin: Airport, destination: Airport } — once

// combineLatest: emits when ANY source emits (after all emitted once)
// Use for: combining live streams, form state + filter state
combineLatest([filters$, pagination$])
// Emits every time filters OR pagination changes

// zip: pairs emissions by index — 1st with 1st, 2nd with 2nd
// Rarely used — mainly for pairing synchronized streams
zip(stream1$, stream2$)`,
      explain: "forkJoin = Promise.all — wait for all HTTP calls to complete, get one combined result. combineLatest = live combination — re-emits whenever any source emits. zip = index-paired. For parallel HTTP calls that you need all results from: always forkJoin.",
    },
    evaluate: (ans) => {
      const a = ans.toLowerCase().replace(/\s+/g, "");
      const hasForkJoin = a.includes("forkjoin");
      const hasBoth = a.includes("origin") && a.includes("destination");
      if (hasForkJoin && hasBoth) return "correct";
      if (hasForkJoin) return "partial";
      return "wrong";
    },
    feedback_correct: "✅ Correct. forkJoin for parallel HTTP calls — waits for all to complete, emits once with combined results. Interview line: 'forkJoin is Promise.all for Observables.'",
    feedback_partial: "Good — you have forkJoin. Now make sure both origin and destination airport calls are inside it.",
    feedback_wrong: `loadAirports(originCode: string, destCode: string) {\n  return forkJoin({\n    origin: this.airportService.getAirport(originCode),\n    destination: this.airportService.getAirport(destCode)\n  });\n}`,
    expected: `return forkJoin({\n  origin: this.airportService.getAirport(originCode),\n  destination: this.airportService.getAirport(destCode)\n});`,
    type_input: "code",
  },

  {
    id: "step4", type: "question", phase: "Step 4 of 8",
    paal: "Create a selectedFlight$ Subject that broadcasts the currently selected flight to multiple components. Use a Subject (not BehaviorSubject) since no initial value is needed. Add selectFlight() and getSelectedFlight() methods.",
    hint: "Subject has no initial value — it only broadcasts future emissions. BehaviorSubject has an initial value and replays the last value to new subscribers.",
    answer_keywords: ["subject", "selectedflight$", "next", "assObservable"],
    seed_code: `import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

// Step 4: FlightSelectionService
// Broadcast selected flight to any subscriber
// Subject (no initial value needed)

@Injectable({ providedIn: 'root' })
export class FlightSelectionService {
  // add Subject, selectFlight(), getSelectedFlight() methods
}`,
    analogy: {
      title: "Subject vs BehaviorSubject vs ReplaySubject",
      code: `// Subject: no initial value, no replay
// Late subscribers miss past emissions
private subject$ = new Subject<Flight>();
// Use: event bus, one-time actions, fire-and-forget

// BehaviorSubject: HAS initial value, replays last value
// Late subscribers immediately get the current value
private selected$ = new BehaviorSubject<Flight | null>(null);
// Use: current state, currently selected item, loading flag

// ReplaySubject: replays N past values to new subscribers
private history$ = new ReplaySubject<Flight>(5); // last 5
// Use: notification history, chat message buffer

// Best practice: expose as Observable (not the Subject itself)
getSelectedFlight(): Observable<Flight> {
  return this.subject$.asObservable(); // prevents external .next() calls
}`,
      explain: "The three Subject types differ in what late subscribers receive. Subject: nothing from the past. BehaviorSubject: the current value immediately. ReplaySubject: the last N values. Always expose subjects as Observables via .asObservable() to prevent components from calling .next() directly — that's the service's job.",
    },
    evaluate: (ans) => {
      const a = ans.toLowerCase().replace(/\s+/g, "");
      const hasSubject = a.includes("new subject") || a.includes("subject<");
      const hasNext = a.includes(".next(");
      const hasObservable = a.includes("asobservable") || a.includes("observable");
      if (hasSubject && hasNext && hasObservable) return "correct";
      if (hasSubject && (hasNext || hasObservable)) return "partial";
      return "wrong";
    },
    feedback_correct: "✅ Correct. Subject for broadcasting without an initial value. .asObservable() prevents external callers from pushing values — they can only subscribe. Interview line: 'I always expose Subjects as Observables to enforce encapsulation.'",
    feedback_partial: "Good — you have the Subject. Make sure selectFlight() calls .next() and getSelectedFlight() returns .asObservable().",
    feedback_wrong: `private selectedFlight$ = new Subject<Flight>();\n\nselectFlight(flight: Flight): void {\n  this.selectedFlight$.next(flight);\n}\n\ngetSelectedFlight(): Observable<Flight> {\n  return this.selectedFlight$.asObservable();\n}`,
    expected: `private selectedFlight$ = new Subject<Flight>();\n\nselectFlight(flight: Flight): void { this.selectedFlight$.next(flight); }\n\ngetSelectedFlight(): Observable<Flight> { return this.selectedFlight$.asObservable(); }`,
    type_input: "code",
  },

  {
    id: "step5", type: "question", phase: "Step 5 of 8",
    paal: "Implement the takeUntil cleanup pattern in a component. Create a destroy$ Subject, use takeUntil on all subscriptions in ngOnInit, and complete the Subject in ngOnDestroy.",
    hint: "Every subscription that should stop when the component is destroyed should be piped through takeUntil(this.destroy$).",
    answer_keywords: ["destroy$", "takeuntil", "ngondestroy", "complete"],
    seed_code: `import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

// Step 5: Implement takeUntil cleanup pattern
// Subscribe to selectedFlight$ and flightUpdates$ with cleanup

@Component({ selector: 'ua-flight-board', template: '' })
export class FlightBoardComponent implements OnInit, OnDestroy {
  // implement here
}`,
    analogy: {
      title: "takeUntil — the canonical Angular subscription cleanup",
      code: `export class FlightBoardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    // Any subscription piped through takeUntil auto-cancels
    this.selectionService.getSelectedFlight()
      .pipe(takeUntil(this.destroy$))
      .subscribe(flight => this.selectedFlight = flight);

    this.flightService.getLiveUpdates()
      .pipe(takeUntil(this.destroy$))
      .subscribe(updates => this.flights = updates);
    // Both subscriptions cancelled when destroy$ emits
  }

  ngOnDestroy(): void {
    this.destroy$.next();     // signal: stop all subscriptions
    this.destroy$.complete(); // close the Subject itself
  }
}

// Alternative: async pipe in template (even better — no cleanup needed)`,
      explain: "destroy$.next() sends a value through the Subject — takeUntil sees this and unsubscribes every piped Observable. destroy$.complete() closes the Subject. This is the standard pattern for multiple subscriptions. For single subscriptions in templates, prefer async pipe — no cleanup needed at all.",
    },
    evaluate: (ans) => {
      const a = ans.toLowerCase().replace(/\s+/g, "");
      const hasDestroy = a.includes("destroy$");
      const hasTakeUntil = a.includes("takeuntil");
      const hasCleanup = a.includes("ngondestroy") && a.includes("complete");
      if (hasDestroy && hasTakeUntil && hasCleanup) return "correct";
      if (hasDestroy && hasTakeUntil) return "partial";
      return "wrong";
    },
    feedback_correct: "✅ Correct. destroy$.next() triggers takeUntil on all piped subscriptions simultaneously. destroy$.complete() closes the Subject. This pattern handles multiple subscriptions cleanly.",
    feedback_partial: "Good — you have the pattern started. Make sure ngOnDestroy calls both destroy$.next() AND destroy$.complete().",
    feedback_wrong: `private destroy$ = new Subject<void>();\n\nngOnInit(): void {\n  this.service.getData().pipe(takeUntil(this.destroy$)).subscribe(...);\n}\n\nngOnDestroy(): void {\n  this.destroy$.next();\n  this.destroy$.complete();\n}`,
    expected: `private destroy$ = new Subject<void>();\n\nngOnInit(): void {\n  this.selectionService.getSelectedFlight().pipe(takeUntil(this.destroy$)).subscribe(f => this.selected = f);\n}\n\nngOnDestroy(): void {\n  this.destroy$.next();\n  this.destroy$.complete();\n}`,
    type_input: "code",
  },

  {
    id: "step6", type: "question", phase: "Step 6 of 8",
    paal: "Implement retry logic for the flight API call: retry up to 3 times on error, wait 1 second between retries, then catchError to return an empty array if all retries fail.",
    hint: "Use retryWhen or retry(3). For delay between retries use retryWhen with delayWhen. catchError should return of([]) to emit an empty array.",
    answer_keywords: ["retry", "catcherror", "of([])"],
    seed_code: `import { Observable, of, timer } from 'rxjs';
import { retry, catchError, retryWhen, delayWhen } from 'rxjs/operators';

// Step 6: Add retry logic to an HTTP call
// Retry up to 3 times, 1 second between retries
// On final failure: return empty array

getFlights(): Observable<Flight[]> {
  return this.http.get<Flight[]>('/api/flights').pipe(
    // add retry and error handling here
  );
}`,
    analogy: {
      title: "retry vs retryWhen — and catchError",
      code: `// Simple retry — immediately, N times
getFlights(): Observable<Flight[]> {
  return this.http.get<Flight[]>('/api/flights').pipe(
    retry(3),                    // retry up to 3 times immediately
    catchError(err => {
      console.error('All retries failed', err);
      return of([]);             // fallback: emit empty array
    })
  );
}

// retryWhen — with delay between retries
getFlights(): Observable<Flight[]> {
  return this.http.get<Flight[]>('/api/flights').pipe(
    retryWhen(errors =>
      errors.pipe(
        delayWhen(() => timer(1000)), // wait 1s between retries
        take(3)                       // max 3 retries
      )
    ),
    catchError(() => of([]))
  );
}

// catchError MUST return an Observable — of([]) wraps the fallback`,
      explain: "retry(3) immediately retries 3 times. retryWhen gives you control over the retry timing — use delayWhen with timer() to add delays. catchError is the safety net — it MUST return an Observable (of() wraps any value). of([]) means 'emit an empty array and complete'.",
    },
    evaluate: (ans) => {
      const a = ans.toLowerCase().replace(/\s+/g, "");
      const hasRetry = a.includes("retry");
      const hasCatch = a.includes("catcherror");
      const hasFallback = a.includes("of([]") || a.includes("of([])");
      if (hasRetry && hasCatch && hasFallback) return "correct";
      if (hasRetry && hasCatch) return "partial";
      return "wrong";
    },
    feedback_correct: "✅ Correct. retry(3) for immediate retries, retryWhen for timed retries, catchError with of([]) as fallback. Interview line: 'catchError must return an Observable — of() wraps any value into an Observable.'",
    feedback_partial: "Good — you have retry and catchError. Make sure catchError returns of([]) — an Observable emitting an empty array as the fallback.",
    feedback_wrong: `return this.http.get<Flight[]>('/api/flights').pipe(\n  retry(3),\n  catchError(err => {\n    console.error(err);\n    return of([]);\n  })\n);`,
    expected: `return this.http.get<Flight[]>('/api/flights').pipe(\n  retry(3),\n  catchError(() => of([]))\n);`,
    type_input: "code",
  },

  {
    id: "step7", type: "question", phase: "Step 7 of 8",
    paal: "Explain cold vs hot Observables by writing a code example of each. HTTP calls are cold. A WebSocket connection or a fromEvent are hot. Explain the difference in one comment per example.",
    hint: "Cold: each subscriber gets its own independent execution. Hot: all subscribers share one execution that's already running.",
    answer_keywords: ["cold", "hot", "http", "fromevent"],
    seed_code: `// Step 7: Cold vs Hot Observables
// Write one example of each with a comment explaining the behavior

// COLD Observable:

// HOT Observable:
`,
    analogy: {
      title: "Cold vs Hot — the key mental model",
      code: `// COLD: execution starts fresh for EACH subscriber
// Each subscriber gets its own independent stream
const cold$ = this.http.get('/api/flights');
// Sub A subscribes → makes its own HTTP request
// Sub B subscribes → makes ANOTHER separate HTTP request
// Like a Netflix movie — each viewer starts from beginning

// HOT: execution is ALREADY RUNNING, subscribers tap in
// All subscribers share the same stream
const hot$ = fromEvent(document, 'click');
// Clicks happen regardless of subscribers
// Sub A subscribes → starts receiving future clicks
// Sub B subscribes later → also receives future clicks
// Like live TV — you join what's already broadcasting

// shareReplay converts cold → hot:
const shared$ = this.http.get('/api/data').pipe(shareReplay(1));
// Now multiple subscribers share ONE HTTP call`,
      explain: "Cold observables create a new execution per subscriber — HTTP calls are cold by default (each subscribe = new request). Hot observables are already running — subscribers tap into the existing stream. shareReplay(1) converts a cold observable to hot by multicasting and caching.",
    },
    evaluate: (ans) => {
      const a = ans.toLowerCase().replace(/\s+/g, "");
      const hasCold = a.includes("cold");
      const hasHot = a.includes("hot");
      const hasExample = a.includes("http") || a.includes("fromevent") || a.includes("websocket") || a.includes("subject");
      if (hasCold && hasHot && hasExample) return "correct";
      if (hasCold && hasHot) return "partial";
      return "wrong";
    },
    feedback_correct: "✅ Correct. Cold = new execution per subscriber (HTTP calls). Hot = shared execution already running (DOM events, WebSockets, Subjects). Interview line: 'shareReplay(1) converts cold to hot — one HTTP call shared across all subscribers.'",
    feedback_partial: "Good — you have both concepts. Now add a concrete code example showing the difference (HTTP call for cold, fromEvent or Subject for hot).",
    feedback_wrong: `// COLD: new HTTP request per subscriber\nconst cold$ = this.http.get('/api/flights');\n// Each subscribe() = separate request\n\n// HOT: already running, tap in\nconst hot$ = fromEvent(document, 'click');\n// Events fire regardless of subscribers`,
    expected: `// COLD: new HTTP call per subscriber\nconst cold$ = http.get('/api/flights');\n\n// HOT: shared execution, tap in mid-stream\nconst hot$ = fromEvent(document, 'click');`,
    type_input: "code",
  },

  {
    id: "step8", type: "question", phase: "Step 8 of 8",
    paal: "Build a live polling stream: poll the flight API every 30 seconds using interval(30000) and switchMap. Stop polling when the component is destroyed using takeUntil.",
    hint: "interval(30000) emits a number every 30 seconds. switchMap each emission to the HTTP call. takeUntil(destroy$) stops everything on destroy.",
    answer_keywords: ["interval", "switchmap", "takeuntil", "destroy$"],
    seed_code: `import { interval } from 'rxjs';
import { switchMap, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

// Step 8: Poll API every 30 seconds, stop on component destroy

private destroy$ = new Subject<void>();

startPolling(): void {
  // implement polling stream here
}

ngOnDestroy(): void {
  this.destroy$.next();
  this.destroy$.complete();
}`,
    analogy: {
      title: "Polling with interval + switchMap + takeUntil",
      code: `private destroy$ = new Subject<void>();

startPolling(): void {
  interval(30000)                        // emits 0, 1, 2... every 30s
    .pipe(
      switchMap(() =>                    // each tick → new HTTP call
        this.flightService.getFlights()  // (cancels if previous still pending)
      ),
      takeUntil(this.destroy$)           // auto-stop on component destroy
    )
    .subscribe(flights => {
      this.flights = flights;
    });
}

ngOnDestroy(): void {
  this.destroy$.next();     // stops the interval + any pending HTTP call
  this.destroy$.complete();
}

// Note: startWith(0) can be added to fire immediately on subscribe
// interval(30000).pipe(startWith(0), switchMap(...))`,
      explain: "interval() emits incrementing numbers on a timer. switchMap maps each tick to an HTTP call — and cancels any previous call still in flight (in case the API is slow). takeUntil(destroy$) stops the entire chain when the component is destroyed. This is a complete, memory-safe polling implementation.",
    },
    evaluate: (ans) => {
      const a = ans.toLowerCase().replace(/\s+/g, "");
      const hasInterval = a.includes("interval");
      const hasSwitch = a.includes("switchmap");
      const hasTakeUntil = a.includes("takeuntil");
      if (hasInterval && hasSwitch && hasTakeUntil) return "correct";
      if (hasInterval && (hasSwitch || hasTakeUntil)) return "partial";
      return "wrong";
    },
    feedback_correct: "✅ Perfect. interval + switchMap + takeUntil is the complete polling pattern. Interview line: 'switchMap here cancels any pending HTTP call before the next poll fires — preventing request pile-up if the API is slow.'",
    feedback_partial: "Good — you have some of the pattern. Make sure all three are present: interval(30000), switchMap to the HTTP call, and takeUntil(this.destroy$).",
    feedback_wrong: `startPolling(): void {\n  interval(30000).pipe(\n    switchMap(() => this.flightService.getFlights()),\n    takeUntil(this.destroy$)\n  ).subscribe(flights => { this.flights = flights; });\n}`,
    expected: `interval(30000).pipe(\n  switchMap(() => this.flightService.getFlights()),\n  takeUntil(this.destroy$)\n).subscribe(flights => { this.flights = flights; });`,
    type_input: "code",
  },

  {
    id: "anchor1", type: "anchor", phase: "Anchor Card",
    rule: "switch=cancel, merge=keep, concat=queue, exhaust=ignore.",
    when: "Search typeahead → switchMap. File upload → mergeMap. Sequential ops → concatMap. Login/submit → exhaustMap.",
    mistake: "Using mergeMap for search — multiple requests run in parallel, older slow responses overwrite newer fast ones. Always switchMap for typeahead.",
  },

  {
    id: "anchor2", type: "anchor", phase: "Anchor Card",
    rule: "forkJoin=parallel complete. combineLatest=any emission. BehaviorSubject=current state. Subject=event bus.",
    when: "Parallel HTTP calls → forkJoin. Live combined streams → combineLatest. Current selected item → BehaviorSubject. One-time event broadcast → Subject.",
    mistake: "Using forkJoin with infinite observables — it never emits because forkJoin waits for all to COMPLETE. Only use forkJoin with finite observables like HTTP calls.",
  },

  {
    id: "wfs", type: "wfs", phase: "Write From Scratch",
    rubric: [
      "BehaviorSubject + debounceTime + switchMap search typeahead pattern",
      "All four flattening operators with use cases: switchMap, mergeMap, concatMap, exhaustMap",
      "forkJoin for parallel HTTP calls — and explain it's like Promise.all",
      "combineLatest vs forkJoin vs zip — when each emits",
      "Subject vs BehaviorSubject vs ReplaySubject — what late subscribers receive",
      "takeUntil + destroy$ cleanup pattern — why both .next() and .complete()",
      "retry(3) + catchError returning of([]) for error handling",
      "Cold vs hot observable — HTTP vs fromEvent, shareReplay converts cold to hot",
      "interval + switchMap + takeUntil polling pattern",
    ],
  },
];

const s = {
  wrap: { fontFamily: "'DM Sans', sans-serif", background: "#0f1117", minHeight: "100vh", minWidth: "1000px", overflow: "hidden", color: "#e2e8f0", display: "flex", flexDirection: "column" },
  topbar: { display: "flex", alignItems: "center", gap: "12px", padding: "0 24px", height: "96px", background: "#1a1d2e", borderBottom: "1px solid #2d3748", flexShrink: 0 },
  logo: { fontWeight: 700, fontSize: "13px", letterSpacing: "0.15em", color: "#7c3aed", marginRight: "8px" },
  engineTag: { fontWeight: 700, fontSize: "10px", letterSpacing: "0.12em", color: "#4a5568", textTransform: "uppercase" },
  progressTrack: { flex: 1, height: "4px", background: "#2d3748", borderRadius: "2px", overflow: "hidden" },
  progressFill: (pct) => ({ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg,#7c3aed,#06b6d4)", borderRadius: "2px", transition: "width 0.4s ease" }),
  progressLabel: { fontSize: "11px", color: "#4a5568", fontWeight: 600, minWidth: "32px", textAlign: "right" },
  body: { display: "flex", flex: 1, overflow: "hidden" },
  sidebar: { width: "200px", flexShrink: 0, background: "#13151f", borderRight: "1px solid #2d3748", padding: "20px 12px", overflowY: "auto" },
  sidebarLabel: { fontSize: "9px", fontWeight: 700, letterSpacing: "0.2em", color: "#4a5568", textTransform: "uppercase", marginBottom: "12px", paddingLeft: "8px" },
  sideItem: (active, done) => ({ display: "flex", alignItems: "center", gap: "8px", padding: "7px 8px", borderRadius: "6px", marginBottom: "2px", cursor: "pointer", background: active ? "rgba(124,58,237,0.15)" : "transparent", border: active ? "1px solid rgba(124,58,237,0.3)" : "1px solid transparent" }),
  sideItemDot: (active, done) => ({ width: "6px", height: "6px", borderRadius: "50%", flexShrink: 0, background: done ? "#10b981" : active ? "#7c3aed" : "#2d3748" }),
  sideItemText: (active, done) => ({ fontSize: "11px", color: done ? "#10b981" : active ? "#c4b5fd" : "#4a5568", fontWeight: active ? 600 : 400, flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }),
  main: { flex: 1, overflowY: "auto", padding: "32px 40px", maxWidth: "720px" },
  phase: { fontSize: "10px", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#7c3aed", marginBottom: "10px" },
  h1: { fontSize: "26px", fontWeight: 700, color: "#f1f5f9", marginBottom: "20px", lineHeight: 1.3 },
  tag: (color) => ({ display: "inline-block", padding: "2px 10px", borderRadius: "4px", fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", background: color === "purple" ? "rgba(124,58,237,0.2)" : "rgba(6,182,212,0.2)", color: color === "purple" ? "#c4b5fd" : "#67e8f9", border: `1px solid ${color === "purple" ? "rgba(124,58,237,0.4)" : "rgba(6,182,212,0.4)"}`, marginBottom: "14px" }),
  pre: { fontFamily: "'Courier New', monospace", fontSize: "13px", background: "#1a1d2e", border: "1px solid #2d3748", borderRadius: "8px", padding: "16px 20px", lineHeight: 1.7, color: "#94a3b8", whiteSpace: "pre-wrap", marginBottom: "20px" },
  usecase: { fontSize: "13px", color: "#64748b", borderLeft: "2px solid #7c3aed", paddingLeft: "14px", lineHeight: 1.7, marginBottom: "24px" },
  objList: { listStyle: "none", display: "flex", flexDirection: "column", gap: "8px", marginBottom: "28px" },
  objItem: { display: "flex", gap: "10px", alignItems: "flex-start", fontSize: "13px", color: "#94a3b8", lineHeight: 1.5 },
  objDot: { width: "6px", height: "6px", borderRadius: "50%", background: "#7c3aed", flexShrink: 0, marginTop: "6px" },
  paalLabel: { fontSize: "9px", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#7c3aed", marginBottom: "8px" },
  paalText: { fontSize: "16px", fontWeight: 600, color: "#f1f5f9", lineHeight: 1.5, marginBottom: "6px" },
  hint: { fontSize: "12px", color: "#4a5568", fontStyle: "italic", marginBottom: "16px" },
  textarea: { width: "100%", minHeight: "140px", background: "#1a1d2e", border: "1px solid #2d3748", borderRadius: "8px", padding: "14px", color: "#e2e8f0", fontFamily: "'Courier New', monospace", fontSize: "13px", lineHeight: 1.6, resize: "vertical", outline: "none", marginBottom: "12px" },
  btnRow: { display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "8px" },
  btn: (variant) => ({ padding: "10px 20px", borderRadius: "6px", border: "none", fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: "12px", cursor: "pointer", letterSpacing: "0.05em", ...(variant === "primary" ? { background: "linear-gradient(135deg,#7c3aed,#06b6d4)", color: "#fff" } : { background: "#1a1d2e", border: "1px solid #2d3748", color: "#94a3b8" }) }),
  feedback: (type) => ({ padding: "14px 18px", borderRadius: "8px", fontSize: "13px", lineHeight: 1.7, whiteSpace: "pre-wrap", marginBottom: "16px", ...(type === "correct" ? { background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", color: "#6ee7b7" } : type === "partial" ? { background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)", color: "#fcd34d" } : { background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#fca5a5" }) }),
  analogyCard: { background: "#13151f", border: "1px solid #2d3748", borderRadius: "10px", padding: "20px", marginBottom: "20px" },
  analogyTitle: { fontSize: "10px", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "#7c3aed", marginBottom: "10px" },
  anchorCard: { background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.3)", borderRadius: "12px", padding: "20px 24px", marginBottom: "24px" },
  anchorTitle: { fontSize: "10px", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "#7c3aed", marginBottom: "12px" },
  anchorRule: { fontSize: "18px", fontWeight: 700, color: "#f1f5f9", marginBottom: "16px", lineHeight: 1.4 },
  anchorRow: { display: "flex", gap: "12px", marginBottom: "10px", alignItems: "flex-start" },
  anchorLabel: { fontSize: "9px", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "#4a5568", minWidth: "60px", paddingTop: "2px" },
  anchorValue: { fontSize: "13px", color: "#94a3b8", lineHeight: 1.5 },
  wfsRubric: { display: "flex", flexDirection: "column", gap: "8px", marginBottom: "24px" },
  rubricItem: (checked) => ({ display: "flex", gap: "10px", alignItems: "flex-start", padding: "10px 14px", borderRadius: "6px", cursor: "pointer", background: checked ? "rgba(16,185,129,0.08)" : "#1a1d2e", border: `1px solid ${checked ? "rgba(16,185,129,0.3)" : "#2d3748"}` }),
  rubricText: (checked) => ({ fontSize: "13px", color: checked ? "#6ee7b7" : "#64748b", lineHeight: 1.5, textDecoration: checked ? "line-through" : "none" }),
  completeBanner: { textAlign: "center", padding: "60px 20px" },
};

const sideItems = [
  { id: "intro", label: "Lesson" },
  { id: "objectives", label: "Objectives" },
  { id: "step1", label: "Search + switchMap" },
  { id: "step2", label: "4 Flattening Ops" },
  { id: "step3", label: "forkJoin parallel" },
  { id: "step4", label: "Subject broadcast" },
  { id: "step5", label: "takeUntil cleanup" },
  { id: "step6", label: "retry + catchError" },
  { id: "step7", label: "Cold vs Hot" },
  { id: "step8", label: "Polling stream" },
  { id: "anchor1", label: "Anchor 1" },
  { id: "anchor2", label: "Anchor 2" },
  { id: "wfs", label: "Write From Scratch" },
];

export default function AngularA04RxJS({ onNextLesson }) {
  const [nodeIndex, setNodeIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [showAnalogy, setShowAnalogy] = useState(false);
  const [showExpected, setShowExpected] = useState(false);
  const [completedNodes, setCompletedNodes] = useState([]);
  const [wfsChecked, setWfsChecked] = useState([]);
  const [mainTab, setMainTab] = useState("editor");

  const node = NODES[nodeIndex];
  useEffect(() => { setMainTab("lesson"); }, [nodeIndex]);
  const progress = Math.round((completedNodes.length / NODES.length) * 100);

  const currentAnswer = (() => {
    if (answers[node.id] !== undefined) return answers[node.id];
    if (node.type === "question") {
      for (let i = nodeIndex - 1; i >= 0; i--) {
        const prev = NODES[i];
        if (prev.type === "question" && answers[prev.id] !== undefined) {
          return answers[prev.id];
        }
      }
    }
    return node.seed_code || "";
  })();

  const setCurrentAnswer = (val) =>
    setAnswers((prev) => ({
      ...prev,
      [node.id]: val,
    }));

  function next() {
    if (!completedNodes.includes(node.id)) setCompletedNodes((p) => [...p, node.id]);
    setNodeIndex((i) => i + 1);
    setResult(null);
    setShowAnalogy(false);
    setShowExpected(false);
  }

  function evaluate() {
    if (!currentAnswer.trim()) return;
    let res;
    if (node.evaluate) {
      res = node.evaluate(currentAnswer);
    } else {
      const a = currentAnswer.toLowerCase();
      const hits = (node.answer_keywords || []).filter((k) => a.includes(k.toLowerCase())).length;
      res = hits === node.answer_keywords.length ? "correct" : hits >= node.answer_keywords.length * 0.6 ? "partial" : "wrong";
    }
    setResult(res);
    if (res === "correct" && !completedNodes.includes(node.id)) setCompletedNodes((p) => [...p, node.id]);
  }

  function getFeedback() {
    if (!result) return null;
    const fb = node[`feedback_${result}`];
    return typeof fb === "function" ? fb(currentAnswer) : fb;
  }

  function renderReveal() {
    const c = node.content;
    return (
      <div>
        <div style={s.phase}>{node.phase}</div>
        <div style={s.tag("purple")}>{c.tag}</div>
        <h1 style={s.h1}>{c.title}</h1>
        <div style={s.pre}>{c.body}</div>
        <div style={s.usecase}>{c.usecase}</div>
        <div style={s.btnRow}><button style={s.btn("primary")} onClick={next}>LET'S BUILD IT →</button></div>
      </div>
    );
  }

  function renderObjectives() {
    return (
      <div>
        <div style={s.phase}>{node.phase}</div>
        <h1 style={s.h1}>By the end of this engine, you will be able to:</h1>
        <ul style={s.objList}>
          {node.items.map((item, i) => <li key={i} style={s.objItem}><div style={s.objDot} />{item}</li>)}
        </ul>
        <div style={s.btnRow}><button style={s.btn("primary")} onClick={next}>START →</button></div>
      </div>
    );
  }

  function renderQuestion() {
    const feedback = getFeedback();
    const editorContent = (
      <div>
        <div style={s.phase}>{node.phase}</div>
        {showAnalogy && node.analogy ? (
          <div style={s.analogyCard}>
            <div style={s.analogyTitle}>💡 ANALOGY — {node.analogy.title}</div>
            <pre style={{ ...s.pre, marginBottom: "12px" }}>{node.analogy.code}</pre>
            <div style={{ fontSize: "13px", color: "#64748b", lineHeight: 1.7, borderLeft: "2px solid #7c3aed", paddingLeft: "14px", marginBottom: "20px" }}>{node.analogy.explain}</div>
            <button style={{ ...s.btn("primary"), width: "100%" }} onClick={() => setShowAnalogy(false)}>GOT IT — LET ME TRY →</button>
          </div>
        ) : (
          <>
            <div style={{ fontSize: "11px", color: "#00d4ff", fontWeight: 600, letterSpacing: "0.05em", marginBottom: "8px" }}>CODE BUILT SO FAR — edit below</div>
            <div style={s.hint}>💡 {node.hint}</div>
            <CodeEditor value={currentAnswer} onChange={setCurrentAnswer} height="320px" />
            {feedback && <div style={s.feedback(result)}>{feedback}</div>}
            {showExpected && node.expected && (
              <div style={{ ...s.pre, borderLeft: "2px solid #10b981", marginBottom: "16px" }}>
                <div style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.15em", color: "#10b981", marginBottom: "8px" }}>MODEL ANSWER</div>
                {node.expected}
              </div>
            )}
            <div style={s.btnRow}>
              <button style={s.btn("primary")} onClick={evaluate} disabled={!currentAnswer.trim()}>CHECK →</button>
              {node.analogy && <button style={s.btn("secondary")} onClick={() => setShowAnalogy(true)}>SEE ANALOGY</button>}
              {result && result !== "correct" && <button style={s.btn("secondary")} onClick={() => setShowExpected(true)}>SHOW ANSWER</button>}
              {result === "correct" && <button style={s.btn("primary")} onClick={next}>NEXT →</button>}
              {result && result !== "correct" && <button style={{ ...s.btn("secondary"), marginLeft: "auto" }} onClick={next}>SKIP →</button>}
            </div>
          </>
        )}
      </div>
    );
    return (
      <LessonEditorOutputTabs node={node} nodes={NODES} mainTab={mainTab} setMainTab={setMainTab} answer={currentAnswer || ""}>
        {editorContent}
      </LessonEditorOutputTabs>
    );
  }

  function renderAnchor() {
    return (
      <div>
        <div style={s.phase}>{node.phase}</div>
        <h1 style={s.h1}>Save this to memory</h1>
        <div style={s.anchorCard}>
          <div style={s.anchorTitle}>⚓ ANCHOR CARD</div>
          <div style={s.anchorRule}>{node.rule}</div>
          <div>
            <div style={s.anchorRow}><div style={s.anchorLabel}>WHEN</div><div style={s.anchorValue}>{node.when}</div></div>
            <div style={s.anchorRow}><div style={s.anchorLabel}>MISTAKE</div><div style={s.anchorValue}>{node.mistake}</div></div>
          </div>
        </div>
        <div style={s.btnRow}><button style={s.btn("primary")} onClick={next}>GOT IT →</button></div>
      </div>
    );
  }

  function renderWFS() {
    const allChecked = wfsChecked.length === node.rubric.length;
    return (
      <div>
        <div style={s.phase}>{node.phase}</div>
        <h1 style={s.h1}>Write From Scratch</h1>
        <div style={s.pre}>{"Close this panel. Open a blank file.\nWrite the full RxJS layer from memory — search stream, four operators with use cases, forkJoin, Subject types, takeUntil, retry, cold vs hot, polling."}</div>
        <div style={{ ...s.paalLabel, marginBottom: "12px" }}>SELF-CHECK RUBRIC</div>
        <div style={s.wfsRubric}>
          {node.rubric.map((item, i) => {
            const checked = wfsChecked.includes(i);
            return (
              <div key={i} style={s.rubricItem(checked)} onClick={() => setWfsChecked((p) => checked ? p.filter((x) => x !== i) : [...p, i])}>
                <div style={{ width: 16, height: 16, flexShrink: 0, marginTop: 2 }}>
                  {checked ? <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> : <div style={{ width: 14, height: 14, border: "1px solid #4a5568", borderRadius: "3px" }} />}
                </div>
                <div style={s.rubricText(checked)}>{item}</div>
              </div>
            );
          })}
        </div>
        {allChecked && (
          <div>
            <div style={s.feedback("correct")}>{"✅ Engine ANG04 Complete — RxJS Essentials mastered.\nNext: ANG05 — NgRx State Management"}</div>
            <div style={s.btnRow}><button style={s.btn("primary")} onClick={onNextLesson ?? next}>NEXT ENGINE →</button></div>
          </div>
        )}
      </div>
    );
  }

  function renderComplete() {
    return (
      <div style={s.completeBanner}>
        <div style={{ fontSize: "48px", marginBottom: "24px" }}>🎯</div>
        <h1 style={{ ...s.h1, textAlign: "center" }}>Engine ANG04 Complete</h1>
        <p style={{ color: "#4a5568", fontSize: "13px" }}>RxJS Essentials — mastered.</p>
        {onNextLesson && <div style={{ ...s.btnRow, justifyContent: "center", marginTop: "24px" }}><button style={s.btn("primary")} onClick={onNextLesson}>NEXT ENGINE →</button></div>}
      </div>
    );
  }

  function renderNode() {
    if (nodeIndex >= NODES.length) return renderComplete();
    switch (node.type) {
      case "reveal": return renderReveal();
      case "objectives": return renderObjectives();
      case "question": return renderQuestion();
      case "anchor": return renderAnchor();
      case "wfs": return renderWFS();
      default: return renderReveal();
    }
  }

  return (
    <div style={s.wrap}>
      <div style={s.topbar}>
        <div style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
          <InpactLogo height={80} style={{ marginRight: "8px" }} />
        </div>
        <div style={s.engineTag}>ANG04 — RxJS ESSENTIALS</div>
        <div style={s.progressTrack}><div style={s.progressFill(progress)} /></div>
        <div style={s.progressLabel}>{progress}%</div>
      </div>
      <div style={s.body}>
        <div style={s.sidebar}>
          <div style={s.sidebarLabel}>PROGRESS</div>
          {sideItems.map((item, i) => {
            const isActive = NODES[nodeIndex]?.id === item.id;
            const isDone = completedNodes.includes(item.id);
            return (
              <div key={item.id} style={s.sideItem(isActive, isDone)} onClick={() => setNodeIndex(i)} role="button" tabIndex={0}>
                <div style={s.sideItemDot(isActive, isDone)} />
                <div style={s.sideItemText(isActive, isDone)}>{item.label}</div>
                {isDone && <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
              </div>
            );
          })}
        </div>
        <div style={s.main}>{renderNode()}</div>
      </div>
    </div>
  );
}
