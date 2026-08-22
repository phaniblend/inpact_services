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

// ─── ENGINE ANG07: CHANGE DETECTION & SIGNALS ─────────────────────────────────
// Covers: Default vs OnPush change detection, Zone.js, markForCheck vs
// detectChanges, ChangeDetectorRef, Signals (signal/computed/effect),
// toSignal/toObservable, zoneless Angular (v17+)

const NODES = [
  {
    id: "intro", type: "reveal", phase: "Lesson",
    content: {
      tag: "ANG07 — CHANGE DETECTION & SIGNALS",
      title: "Change Detection & Performance",
      body: `Optimise a real-time flight board that updates hundreds of rows:

  • Currently re-renders the ENTIRE component tree on every WebSocket message
  • Switch the flight list to OnPush change detection
  • Only mark specific rows dirty when their data changes
  • Refactor the flight count to use a Signal instead of a property
  • Create a computed() signal for filtered flights
  • Use effect() to sync a signal value to localStorage
  • Explain how Signals differ from Zone.js-based detection`,
      usecase: "Change detection is the senior Angular question. OnPush is table stakes for any performance-sensitive role. Signals are in United's JD specifically — Angular 17+. If you can explain the difference between markForCheck and detectChanges, you're demonstrating architect-level thinking.",
    },
  },

  {
    id: "objectives", type: "objectives", phase: "Objectives",
    items: [
      "Explain Angular's default change detection and why it can be slow at scale",
      "Explain OnPush — what triggers it, what doesn't, and why it's faster",
      "Distinguish markForCheck() vs detectChanges() — when to use each",
      "Explain what Zone.js does and how Angular uses it",
      "Create a signal with signal(), update with set() and update()",
      "Create a computed() signal and explain when it recalculates",
      "Create an effect() and explain its cleanup and when it runs",
      "Convert between Observables and Signals with toSignal() and toObservable()",
      "Explain zoneless Angular and why it's the future",
    ],
  },

  {
    id: "step1", type: "question", phase: "Step 1 of 8",
    paal: "Apply OnPush change detection to FlightRowComponent. Explain in a comment what triggers change detection in OnPush mode vs Default mode.",
    hint: "ChangeDetectionStrategy.OnPush is set in the @Component decorator. OnPush only checks when: @Input reference changes, an event fires FROM this component, async pipe emits, or markForCheck() is called.",
    answer_keywords: ["changedetectionstrategy", "onpush", "@component"],
    seed_code: `import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

// Step 1: Add OnPush to FlightRowComponent
// Add a comment listing what DOES and DOES NOT trigger CD in OnPush

@Component({
  selector: 'ua-flight-row',
  template: \`<div>{{ flight.flightNumber }} — {{ flight.status }}</div>\`
  // add changeDetection here
})
export class FlightRowComponent {
  @Input() flight!: Flight;
}`,
    analogy: {
      title: "Default vs OnPush — the performance difference",
      code: `// DEFAULT: Angular checks EVERY component on EVERY event
// A single WebSocket message → Angular walks the entire tree
// 500 flight rows → 500 checks, even if only 1 changed
@Component({ changeDetection: ChangeDetectionStrategy.Default })

// OnPush: Angular SKIPS this component unless:
// 1. An @Input() reference changes (new object, not mutation)
// 2. An event fires FROM this component (click, keyup, etc.)
// 3. An async pipe subscription emits a new value
// 4. markForCheck() is explicitly called
// 5. A Signal read inside the template emits a new value (v17+)
@Component({
  selector: 'ua-flight-row',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // With OnPush: only the 1 row whose @Input changed gets checked
  // 499 rows are skipped entirely → 499x fewer checks
})

// COMMON TRAP: mutating an object doesn't trigger OnPush
// this.flight.status = 'DELAYED'  ← same reference, OnPush won't see it
// Must pass a NEW object: this.flight = { ...this.flight, status: 'DELAYED' }`,
      explain: "Default change detection checks every component on every browser event, timer, HTTP response, or Promise. At scale with hundreds of rows, this is expensive. OnPush is a contract: 'only check me when something I own actually changed.' The key insight: OnPush requires immutable data patterns — you can't mutate objects, you must create new references.",
    },
    evaluate: (ans) => {
      const a = ans.toLowerCase().replace(/\s+/g, "");
      const hasStrategy = a.includes("changedetectionstrategy") || a.includes("onpush");
      const hasDecorator = a.includes("changedetection");
      if (hasStrategy && hasDecorator) return "correct";
      if (hasStrategy) return "partial";
      return "wrong";
    },
    feedback_correct: "✅ Correct. ChangeDetectionStrategy.OnPush in the decorator. Interview answer: 'OnPush skips a component unless an @Input reference changes, an event fires from it, async pipe emits, or markForCheck() is called. It requires immutable data — mutations are invisible to it.'",
    feedback_partial: "Good — you have OnPush. Make sure it's set as changeDetection: ChangeDetectionStrategy.OnPush inside the @Component decorator.",
    feedback_wrong: `@Component({\n  selector: 'ua-flight-row',\n  template: \`<div>{{ flight.flightNumber }}</div>\`,\n  changeDetection: ChangeDetectionStrategy.OnPush\n  // Triggers: new @Input reference, event from component, async pipe, markForCheck()\n  // Does NOT trigger: mutating the flight object directly\n})`,
    expected: `@Component({\n  changeDetection: ChangeDetectionStrategy.OnPush\n})`,
    type_input: "code",
  },

  {
    id: "step2", type: "question", phase: "Step 2 of 7",
    paal: "The flight list receives WebSocket updates via a service subscription in ngOnInit. With OnPush enabled, the view isn't updating. Fix it using markForCheck(). Explain why detectChanges() would be the wrong choice here.",
    hint: "markForCheck() marks this component and all its ancestors as dirty for the NEXT change detection run. detectChanges() runs synchronously right now on this subtree only.",
    answer_keywords: ["markforcheck", "changedetectorref", "cdr", "ngoninit"],
    seed_code: `import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FlightListComponent implements OnInit {

  flights: Flight[] = [];

  constructor(
    private flightService: FlightService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.flightService.getLiveUpdates().subscribe(flights => {
      this.flights = flights;
      // Step 2: view not updating — fix it here
      // Use markForCheck() and explain why NOT detectChanges()
    });
  }
}`,
    analogy: {
      title: "markForCheck vs detectChanges — the critical distinction",
      code: `// markForCheck(): schedule a future check
// Marks this component + ancestors as dirty
// Angular checks them on the NEXT change detection cycle
this.cdr.markForCheck();
// Use when: external data arrives (WebSocket, service subscription)
// Safe: won't cause ExpressionChangedAfterChecked error

// detectChanges(): run change detection RIGHT NOW
// Synchronously checks this component + descendants
this.cdr.detectChanges();
// Use when: you need the DOM updated immediately (e.g., before measuring)
// RISK: can cause ExpressionChangedAfterChecked in lifecycle hooks

// WHY markForCheck() here:
// WebSocket update arrives outside Angular's zone
// markForCheck() says "check me next cycle" → safe, efficient
// detectChanges() is synchronous and heavier — not needed here

// Pattern:
ngOnInit(): void {
  this.service.getLiveUpdates().subscribe(data => {
    this.data = data;
    this.cdr.markForCheck(); // ← tell Angular this component is dirty
  });
}`,
      explain: "markForCheck() is the right choice here because the data arrived via a subscription outside Angular's normal change detection flow. It schedules a check for the next cycle — safe and efficient. detectChanges() runs synchronously immediately on the component subtree — useful for specific cases but heavier and can cause lifecycle errors.",
    },
    evaluate: (ans) => {
      const a = ans.toLowerCase().replace(/\s+/g, "");
      const hasCdr = a.includes("changedetectorref") || a.includes("cdr");
      const hasMark = a.includes("markforcheck");
      if (hasCdr && hasMark) return "correct";
      if (hasMark) return "partial";
      return "wrong";
    },
    feedback_correct: "✅ Correct. ChangeDetectorRef.markForCheck() schedules the component to be checked on the next cycle. Interview line: 'markForCheck for external data arriving — schedules a future check. detectChanges for synchronous immediate DOM updates.'",
    feedback_partial: "You have markForCheck — make sure ChangeDetectorRef is injected via the constructor as private cdr: ChangeDetectorRef.",
    feedback_wrong: `constructor(private cdr: ChangeDetectorRef) {}\n\nngOnInit(): void {\n  this.service.getLiveUpdates().subscribe(flights => {\n    this.flights = flights;\n    this.cdr.markForCheck(); // schedule check for next CD cycle\n  });\n}`,
    expected: `this.flights = flights;\nthis.cdr.markForCheck();`,
    type_input: "code",
  },

  {
    id: "step3", type: "question", phase: "Step 3 of 7",
    paal: "Refactor the flight count from a regular class property to a Signal. Show how to declare it with signal(), update it with set() and update(), and read it in the template.",
    hint: "signal(initialValue) creates a writable signal. .set(newValue) replaces the value. .update(fn) transforms it. In templates, call it as a function: {{ count() }}.",
    answer_keywords: ["signal(", "set(", "update(", "count()"],
    seed_code: `import { Component, signal } from '@angular/core';

// Step 3: Refactor count from a plain property to a Signal
// Before: count = 0; this.count++; {{ count }}
// After: use signal(), set(), update(), and template syntax

@Component({
  selector: 'ua-flight-board',
  template: \`
    <!-- display count using signal syntax -->
    <p>Total flights: ???</p>
    <button (click)="increment()">Add Flight</button>
    <button (click)="reset()">Reset</button>
  \`
})
export class FlightBoardComponent {
  // Step 3: declare count as a Signal, add increment() and reset()
}`,
    analogy: {
      title: "Signals — fine-grained reactivity without Zone.js",
      code: `// Before: plain property — Angular doesn't know when it changes
count = 0;
increment() { this.count++; } // Zone.js detects this change globally

// After: Signal — Angular knows EXACTLY which template parts to update
count = signal(0);            // initial value = 0
increment() {
  this.count.update(c => c + 1); // transform current value
}
reset() {
  this.count.set(0);             // replace value directly
}

// Template: call the signal as a function to read its value
// <p>Total flights: {{ count() }}</p>
//                          ↑ () is required — signals are functions

// WHY Signals are better than properties:
// Angular tracks exactly which template expressions read which signals
// Only those specific DOM nodes update — no component-tree scanning
// Works WITHOUT Zone.js (zoneless Angular)`,
      explain: "Signals are Angular's new reactive primitive (v16+, stable v17+). Unlike plain properties, Angular tracks which templates READ a signal — when the signal changes, only those template expressions update. This is fine-grained reactivity: no Zone.js needed, no change detection tree walk, just precise updates.",
    },
    evaluate: (ans) => {
      const a = ans.toLowerCase().replace(/\s+/g, "");
      const hasSignal = a.includes("signal(");
      const hasUpdate = a.includes(".set(") || a.includes(".update(");
      const hasRead = a.includes("count()") || a.includes("()");
      if (hasSignal && hasUpdate && hasRead) return "correct";
      if (hasSignal && hasUpdate) return "partial";
      return "wrong";
    },
    feedback_correct: "✅ Correct. signal(0) creates it, .set() replaces, .update() transforms, count() reads in template. Interview line: 'Signals give Angular fine-grained reactivity — only the DOM nodes that read the signal update, no component tree scan needed.'",
    feedback_partial: "Good — you have signal(). Make sure you show both .set() or .update() for writing AND count() (with parens) for reading in the template.",
    feedback_wrong: `count = signal(0);\n\nincrement() { this.count.update(c => c + 1); }\nreset() { this.count.set(0); }\n\n// Template: {{ count() }}`,
    expected: `count = signal(0);\nincrement() { this.count.update(c => c + 1); }\nreset() { this.count.set(0); }\n// Template: {{ count() }}`,
    type_input: "code",
  },

  {
    id: "step4", type: "question", phase: "Step 4 of 7",
    paal: "Create a computed() signal called filteredFlights that derives from a flights signal and a filter signal. It should only include flights where status matches the filter value.",
    hint: "computed() takes a function that reads other signals. It recalculates only when its signal dependencies change. Read signals inside the function — Angular tracks them automatically.",
    answer_keywords: ["computed(", "flights()", "filter()", "filteredflights"],
    seed_code: `import { Component, signal, computed } from '@angular/core';

// Step 4: computed() signal for filtered flights
// flights = signal<Flight[]>([])
// statusFilter = signal<string>('ALL')
// filteredFlights = derived from both

@Component({ selector: 'ua-flight-board', template: '' })
export class FlightBoardComponent {
  flights = signal<Flight[]>([]);
  statusFilter = signal<string>('ALL');

  // create filteredFlights computed signal here
}`,
    analogy: {
      title: "computed() — derived state that stays in sync automatically",
      code: `// computed() = a signal that derives from other signals
// Recalculates ONLY when its dependencies change (memoized)

flights = signal<Flight[]>([]);
statusFilter = signal<string>('ALL');

filteredFlights = computed(() => {
  const filter = this.statusFilter(); // read signal → tracked as dependency
  const all = this.flights();          // read signal → tracked as dependency
  return filter === 'ALL'
    ? all
    : all.filter(f => f.status === filter);
  // Re-runs only when statusFilter OR flights changes
  // If only count changes — filteredFlights does NOT recalculate
});

// Template:
// <li *ngFor="let f of filteredFlights()">{{ f.flightNumber }}</li>
//                           ↑ call as function

// React equivalent: useMemo(() => ..., [flights, statusFilter])
// But computed() tracks dependencies automatically — no deps array`,
      explain: "computed() creates a derived signal — it reads other signals inside its function, and Angular automatically tracks those as dependencies. It only recalculates when a dependency changes. It's memoized — same inputs = cached output. No dependency array needed (unlike React's useMemo).",
    },
    evaluate: (ans) => {
      const a = ans.toLowerCase().replace(/\s+/g, "");
      const hasComputed = a.includes("computed(");
      const readsBoth = (a.includes("flights()") || a.includes("this.flights()")) &&
                        (a.includes("filter()") || a.includes("statusfilter()"));
      const hasFilter = a.includes(".filter(") || a.includes("filter(f");
      if (hasComputed && readsBoth && hasFilter) return "correct";
      if (hasComputed && readsBoth) return "partial";
      return "wrong";
    },
    feedback_correct: "✅ Correct. computed() reads both signals — Angular auto-tracks them as dependencies. Only recalculates when either changes. Interview line: 'Unlike React useMemo, computed() tracks dependencies automatically — no deps array to maintain.'",
    feedback_partial: "Good — you have computed(). Make sure the function reads BOTH the flights() signal AND the statusFilter() signal, and applies the filter logic.",
    feedback_wrong: `filteredFlights = computed(() => {\n  const filter = this.statusFilter();\n  const all = this.flights();\n  return filter === 'ALL' ? all : all.filter(f => f.status === filter);\n});`,
    expected: `filteredFlights = computed(() => {\n  const f = this.statusFilter();\n  return f === 'ALL' ? this.flights() : this.flights().filter(x => x.status === f);\n});`,
    type_input: "code",
  },

  {
    id: "step5", type: "question", phase: "Step 5 of 7",
    paal: "Use effect() to sync the statusFilter signal to localStorage whenever it changes. Show the cleanup function returned from effect() to cancel any pending work.",
    hint: "effect() runs when any signal it reads changes. It runs once on init, then again when dependencies change. Return a cleanup function for teardown.",
    answer_keywords: ["effect(", "localstorage", "statusfilter()", "return"],
    seed_code: `import { Component, signal, effect } from '@angular/core';

// Step 5: effect() to sync statusFilter to localStorage
// Also show the cleanup function pattern

@Component({ selector: 'ua-flight-board', template: '' })
export class FlightBoardComponent {
  statusFilter = signal<string>(
    localStorage.getItem('statusFilter') ?? 'ALL'
  );

  constructor() {
    // create the effect here
  }
}`,
    analogy: {
      title: "effect() — side effects that react to signal changes",
      code: `constructor() {
  effect(() => {
    const filter = this.statusFilter(); // read signal → tracked as dep
    localStorage.setItem('statusFilter', filter);
    // Runs once on init, then every time statusFilter changes

    // Return a cleanup function (optional):
    return () => {
      console.log('effect cleanup — filter was:', filter);
      // Called before the effect re-runs OR when component destroys
      // Use for: clearing timers, cancelling requests, cleanup
    };
  });
}

// WHERE to create effects:
// Constructor or field initializer — NOT in ngOnInit
// Angular requires effects to run in an injection context

// REACT EQUIVALENT:
useEffect(() => {
  localStorage.setItem('statusFilter', filter);
  return () => { /* cleanup */ };
}, [filter]);  // ← deps array
// Angular effect() tracks deps automatically — no array needed`,
      explain: "effect() runs once on init, then re-runs whenever any signal it reads changes. It must be created in a constructor or field initializer — not in ngOnInit. The cleanup function runs before each re-run and on component destroy. Effects are for side effects only — never update signals inside an effect (creates infinite loops).",
    },
    evaluate: (ans) => {
      const a = ans.toLowerCase().replace(/\s+/g, "");
      const hasEffect = a.includes("effect(");
      const hasRead = a.includes("statusfilter()") || a.includes("this.statusfilter()");
      const hasStorage = a.includes("localstorage");
      if (hasEffect && hasRead && hasStorage) return "correct";
      if (hasEffect && hasRead) return "partial";
      return "wrong";
    },
    feedback_correct: "✅ Correct. effect() reads statusFilter() — auto-tracked dep — and syncs to localStorage. Interview line: 'Effects must be created in the constructor. Never update a signal inside an effect — that causes infinite loops.'",
    feedback_partial: "Good — you have effect(). Make sure it reads this.statusFilter() inside the function AND calls localStorage.setItem with the value.",
    feedback_wrong: `constructor() {\n  effect(() => {\n    const filter = this.statusFilter();\n    localStorage.setItem('statusFilter', filter);\n    return () => { /* cleanup on re-run or destroy */ };\n  });\n}`,
    expected: `constructor() {\n  effect(() => {\n    localStorage.setItem('statusFilter', this.statusFilter());\n  });\n}`,
    type_input: "code",
  },

  {
    id: "step6", type: "question", phase: "Step 6 of 7",
    paal: "Convert the existing flights$ Observable (from FlightService) to a Signal using toSignal(). Also show toObservable() going the other direction. Explain when you'd use each.",
    hint: "toSignal() is from @angular/core/rxjs-interop. It subscribes automatically and unsubscribes on component destroy. Must be called in injection context.",
    answer_keywords: ["tosignal", "toobservable", "flights$"],
    seed_code: `import { Component } from '@angular/core';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';

// Step 6: Bridge between Observables and Signals
// Convert flights$ Observable → Signal
// Convert statusFilter Signal → Observable for use with debounceTime

@Component({ selector: 'ua-flight-board', template: '' })
export class FlightBoardComponent {
  // flights$ is an Observable<Flight[]> from the service

  // Step 6: convert to signal AND back

}`,
    analogy: {
      title: "toSignal and toObservable — bridging the two worlds",
      code: `import { toSignal, toObservable } from '@angular/core/rxjs-interop';

// Observable → Signal
// Auto-subscribes, auto-unsubscribes on destroy
// Must be called in injection context (constructor/field)
readonly flights = toSignal(this.flightService.flights$, {
  initialValue: []  // value before first emission
});
// Template: {{ flights().length }} — no async pipe needed!

// Signal → Observable
// Useful when you need RxJS operators on a signal
readonly filter$ = toObservable(this.statusFilter);

// Then pipe it through RxJS:
readonly debouncedFilter$ = this.filter$.pipe(
  debounceTime(300),
  distinctUntilChanged()
);

// WHEN TO USE EACH:
// toSignal: consuming an Observable in a Signal-based template
// toObservable: applying RxJS operators (debounce, switchMap) to a Signal`,
      explain: "toSignal() bridges RxJS into the Signals world — auto-subscribes and returns a Signal you can read in templates without async pipe. toObservable() goes the other direction — lets you apply RxJS operators to a Signal. This interop layer means you don't have to choose one or the other.",
    },
    evaluate: (ans) => {
      const a = ans.toLowerCase().replace(/\s+/g, "");
      const hasToSignal = a.includes("tosignal");
      const hasToObs = a.includes("toobservable");
      if (hasToSignal && hasToObs) return "correct";
      if (hasToSignal) return "partial";
      return "wrong";
    },
    feedback_correct: "✅ Correct. toSignal() converts Observable → Signal (no async pipe needed). toObservable() converts Signal → Observable (enables RxJS operators). Interview line: 'These two functions let you mix Signals and Observables freely — migrate incrementally.'",
    feedback_partial: "You have toSignal — now also show toObservable() converting a Signal back to an Observable for RxJS operator use.",
    feedback_wrong: `readonly flights = toSignal(this.flightService.flights$, { initialValue: [] });\n\n// Signal → Observable for RxJS operators:\nreadonly filter$ = toObservable(this.statusFilter);\nreadonly debounced$ = this.filter$.pipe(debounceTime(300));`,
    expected: `readonly flights = toSignal(this.flightService.flights$, { initialValue: [] });\nreadonly filter$ = toObservable(this.statusFilter);`,
    type_input: "code",
  },

  {
    id: "step7", type: "question", phase: "Step 7 of 7",
    paal: "Explain Zone.js: what it does, how Angular uses it, and what 'zoneless Angular' means. Write a code comment that describes the Zone.js patching mechanism and how Signals eliminate the need for it.",
    hint: "Zone.js monkey-patches async APIs (setTimeout, Promise, fetch, DOM events) to notify Angular when async work completes. Signals make this unnecessary.",
    answer_keywords: ["zone.js", "monkeypatches", "async", "signals", "zoneless"],
    seed_code: `// Step 7: Explain Zone.js and how Signals eliminate it
// Write your explanation as code comments — this is a verbal interview question
// Cover: what Zone.js patches, how Angular uses it, why Signals change things

// Zone.js:

// How Angular uses it:

// Signals eliminate this because:

// Zoneless Angular (v17+):
`,
    analogy: {
      title: "Zone.js — the global async spy Angular is replacing",
      code: `// Zone.js patches async APIs at startup:
// setTimeout → patched setTimeout (notifies Angular when done)
// Promise.then → patched (notifies Angular)
// fetch / XHR → patched (notifies Angular)
// addEventListener → patched (notifies Angular)

// Angular hooks into these notifications:
// "An async thing just finished → run change detection on the whole tree"
// This is why Angular 'just works' with Promises and setTimeout

// THE PROBLEM:
// Zone.js triggers full-tree change detection on EVERY async event
// A setTimeout(() => {}, 0) triggers a full component tree scan
// Third-party libs that use async = unintended CD triggers

// SIGNALS ELIMINATE THIS:
// Signals don't need Zone.js notifications
// Angular knows exactly which templates read which signals
// When signal changes → only those template nodes update
// No tree scan, no Zone.js needed

// ZONELESS ANGULAR (v17+ experimental):
// provideExperimentalZonelessChangeDetection()
// No Zone.js loaded at all → smaller bundle, better performance
// Works entirely via Signals + async pipe`,
      explain: "Zone.js is a global monkey-patching library that intercepts all async operations and notifies Angular when they complete, triggering change detection. It's why Angular 'just works' with setTimeout and Promises without you doing anything. Signals are fine-grained — Angular tracks dependencies precisely, so Zone.js notifications are no longer needed. Zoneless Angular is the direction of the framework.",
    },
    evaluate: (ans) => {
      const a = ans.toLowerCase().replace(/\s+/g, "");
      const hasZone = a.includes("zone.js") || a.includes("zone");
      const hasPatching = a.includes("patch") || a.includes("monkey") || a.includes("async");
      const hasSignals = a.includes("signal");
      if (hasZone && hasPatching && hasSignals) return "correct";
      if (hasZone && (hasPatching || hasSignals)) return "partial";
      return "wrong";
    },
    feedback_correct: "✅ Correct. Zone.js patches async APIs to trigger CD. Signals eliminate the need — Angular tracks deps precisely. Interview line: 'Zoneless Angular removes Zone.js entirely — smaller bundle, no unintended CD triggers, pure Signals-based reactivity.'",
    feedback_partial: "Good — you have Zone.js covered. Make sure you also explain how Signals remove the need for it and what zoneless Angular means.",
    feedback_wrong: `// Zone.js: patches setTimeout, Promise, fetch, DOM events\n// Notifies Angular when async work finishes → triggers full CD\n\n// Signals: Angular tracks which templates read which signals\n// No Zone.js needed — only those DOM nodes update\n\n// Zoneless: provideExperimentalZonelessChangeDetection()\n// Smaller bundle, no unintended CD triggers`,
    expected: `// Zone.js patches async APIs → Angular runs full CD after each\n// Signals: fine-grained tracking → only dependents update\n// Zoneless Angular: no Zone.js, pure signal-based reactivity`,
    type_input: "code",
  },

  {
    id: "anchor1", type: "anchor", phase: "Anchor Card",
    rule: "OnPush only checks when: @Input reference changes, event fires from component, async pipe emits, markForCheck() is called, or a Signal changes.",
    when: "Any performance-sensitive component with many instances — use OnPush. With OnPush, always pass new object references, never mutate.",
    mistake: "Mutating an @Input() object directly with OnPush — Angular doesn't see the change. Must pass a new object reference: { ...oldFlight, status: 'DELAYED' }.",
  },

  {
    id: "anchor2", type: "anchor", phase: "Anchor Card",
    rule: "signal() = writable. computed() = derived (memoized). effect() = side effect. Must create in constructor, not ngOnInit.",
    when: "Local reactive state → signal(). State derived from other signals → computed(). Sync to external system (localStorage, analytics) → effect().",
    mistake: "Creating effects in ngOnInit — they must be in the constructor or a field initializer to run in the injection context. Also: never set a signal inside an effect — infinite loop.",
  },

  {
    id: "wfs", type: "wfs", phase: "Write From Scratch",
    rubric: [
      "ChangeDetectionStrategy.OnPush in @Component decorator",
      "Four triggers for OnPush: @Input ref change, component event, async pipe, markForCheck()",
      "markForCheck() vs detectChanges() — and when to use each",
      "signal(initialValue), .set(), .update(), read with () in template",
      "computed() — reads other signals, auto-tracks deps, memoized",
      "effect() — runs in constructor, reads signals, returns cleanup function",
      "toSignal() converts Observable to Signal — no async pipe needed",
      "toObservable() converts Signal to Observable — enables RxJS operators",
      "Zone.js: patches async APIs, triggers full CD — what it does",
      "Signals eliminate Zone.js need — zoneless Angular direction",
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
  { id: "step1", label: "OnPush" },
  { id: "step2", label: "markForCheck" },
  { id: "step3", label: "signal()" },
  { id: "step4", label: "computed()" },
  { id: "step5", label: "effect()" },
  { id: "step6", label: "toSignal/toObservable" },
  { id: "step7", label: "Zone.js & Zoneless" },
  { id: "anchor1", label: "Anchor 1" },
  { id: "anchor2", label: "Anchor 2" },
  { id: "wfs", label: "Write From Scratch" },
];

export default function AngularA07ChangeDetection({ onNextLesson }) {
  const [nodeIndex, setNodeIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [showAnalogy, setShowAnalogy] = useState(false);
  const [showExpected, setShowExpected] = useState(false);
  const [completedNodes, setCompletedNodes] = useState([]);
  const [wfsChecked, setWfsChecked] = useState([]);
  const [mainTab, setMainTab] = useState("editor");

  const node = NODES[nodeIndex];
  useEffect(() => { setMainTab("editor"); }, [nodeIndex]);
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
  const setCurrentAnswer = (val) => setAnswers((prev) => ({ ...prev, [node.id]: val }));

  function next() {
    if (!completedNodes.includes(node.id)) setCompletedNodes((p) => [...p, node.id]);
    setNodeIndex((i) => i + 1);
    setResult(null); setShowAnalogy(false); setShowExpected(false);
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
        <div style={s.pre}>{"Close this panel. Open a blank file.\nWrite the full change detection + Signals layer from memory — OnPush, markForCheck, signal/computed/effect, toSignal/toObservable, Zone.js explanation."}</div>
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
            <div style={s.feedback("correct")}>{"✅ Engine ANG07 Complete — Change Detection & Signals mastered.\nOne engine left: ANG08 — Module Federation"}</div>
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
        <h1 style={{ ...s.h1, textAlign: "center" }}>Engine ANG07 Complete</h1>
        <p style={{ color: "#4a5568", fontSize: "13px" }}>Change Detection & Signals — mastered.</p>
        {onNextLesson && <div style={{ ...s.btnRow, justifyContent: "center", marginTop: "24px" }}><button style={s.btn("primary")} onClick={onNextLesson}>FINAL ENGINE →</button></div>}
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
        <div style={s.engineTag}>ANG07 — CHANGE DETECTION & SIGNALS</div>
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
