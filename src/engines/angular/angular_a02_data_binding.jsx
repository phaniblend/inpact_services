import { useState, useEffect } from "react";
import InpactLogo from "../../components/InpactLogo.jsx";
import CodeEditor from "../CodeEditor";
import AngularTabbedEditor from "./AngularTabbedEditor";
import LessonEditorOutputTabs from "../LessonEditorOutputTabs";
import { mergeAngularTsWithHtml, mergeAngularCssIntoTS } from "./angularTabMerge.js";

if (typeof document !== "undefined" && !document.getElementById("dm-sans-font")) {
  const link = document.createElement("link");
  link.id = "dm-sans-font";
  link.rel = "stylesheet";
  link.href = "https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap";
  document.head.appendChild(link);
}

// ─── ENGINE ANG02: DATA BINDING ───────────────────────────────────────────────
// Covers: interpolation vs property binding, event binding, two-way [(ngModel)],
// *ngIf vs [hidden], *ngFor + trackBy, async pipe, pure vs impure pipes

const NODES = [
  {
    id: "intro",
    type: "reveal",
    phase: "Lesson",
    content: {
      tag: "ANG02 — DATA BINDING",
      title: "Search Form",
      body: `Build the template for a FlightSearchComponent that:

  • Displays the title using interpolation
  • Binds an image src dynamically from a component property
  • Has an origin input with two-way binding to 'origin'
  • Shows a spinner ONLY when isLoading is true (remove from DOM when false)
  • Shows 'No results' hidden with CSS only when hasResults is true
  • Renders flights list using *ngFor with a trackBy function
  • Has a Search button that calls search() on click
  • Displays flight status through a pure custom pipe`,
      usecase:
        "Data binding questions come up in every Angular screen. If you can explain the difference between () [] [()] and {{}} without hesitating, you've already separated yourself from 80% of candidates.",
    },
  },

  {
    id: "objectives",
    type: "objectives",
    phase: "Objectives",
    items: [
      "Name and write the syntax for all 4 types of Angular data binding",
      "Explain the difference between {{interpolation}} and [property] binding",
      "Explain how [(ngModel)] works internally as [ngModel] + (ngModelChange)",
      "Distinguish *ngIf (removes from DOM) vs [hidden] (CSS only)",
      "Use *ngFor with trackBy and explain the performance reason",
      "Use async pipe and explain why it's preferred over manual subscribe",
      "Define pure vs impure pipes and explain why impure pipes are dangerous",
      "Explain what FormsModule is needed for",
    ],
  },

  {
    id: "step1",
    type: "question",
    phase: "Step 1 of 7",
    paal: "Display the component's 'title' property as a heading using interpolation. Bind 'logoUrl' to an image's src using property binding.",
    hint: "Interpolation uses {{ }}. Property binding uses [src]. They look similar but serve different purposes.",
    answer_keywords: ["{{title}}", "[src]", "logourl"],
    seed_code: `<!-- Step 1: Display title and bind logo image -->
<!-- component has: title = 'Search Flights', logoUrl = '/assets/logo.png' -->

<div class="search-header">
  <!-- display title using interpolation -->

  <!-- bind logoUrl to the image src -->

</div>`,
    analogy: {
      title: "Interpolation vs Property Binding",
      code: `<!-- Interpolation: always produces a STRING -->
<h1>{{ title }}</h1>

<!-- Property Binding: binds the ACTUAL VALUE (any type) -->
<img [src]="logoUrl">
<button [disabled]="isLoading">  <!-- boolean, not string -->

<!-- WHY IT MATTERS: -->
<img src="{{ nullableUrl }}">   <!-- renders src="null" (bad) -->
<img [src]="nullableUrl">       <!-- no src attr if null (good) -->`,
      explain:
        "Interpolation converts everything to a string — {{null}} renders 'null' on screen. Property binding passes the actual value — [src]=\"null\" sets no attribute at all. Rule: use interpolation for text content, property binding for HTML attributes.",
    },
    evaluate: (ans) => {
      const a = ans.toLowerCase().replace(/\s+/g, "");
      const hasInterp = a.includes("{{title}}");
      const hasPropBinding = a.includes("[src]") && a.includes("logourl");
      if (hasInterp && hasPropBinding) return "correct";
      if (hasInterp || hasPropBinding) return "partial";
      return "wrong";
    },
    feedback_correct: "✅ Correct. {{title}} for text content, [src]=\"logoUrl\" for the attribute. Interview answer: 'I use interpolation for displaying text, property binding for HTML attributes — especially when the value might be null.'",
    feedback_partial: "You have one of them — make sure you use {{title}} for the heading AND [src]=\"logoUrl\" for the image.",
    feedback_wrong: `<h1>{{ title }}</h1>\n<img [src]="logoUrl" alt="Logo">`,
    expected: `<h1>{{ title }}</h1>\n<img [src]="logoUrl" alt="UA Logo">`,
    type_input: "code",
  },

  {
    id: "step2",
    type: "question",
    phase: "Step 2 of 7",
    paal: "Add a Search button that calls search() on click, and an input that calls onKeyUp($event) on keyup. Use event binding syntax.",
    hint: "Event binding uses parentheses: (click), (keyup). $event is the native DOM event object.",
    answer_keywords: ["(click)", "search()", "(keyup)", "$event"],
    seed_code: `<!-- Step 2: Event binding -->
<div class="search-controls">
  <!-- input that calls onKeyUp($event) on keyup -->

  <!-- button that calls search() on click -->

</div>`,
    analogy: {
      title: "Event binding — Angular vs React",
      code: `// React: camelCase, inline JSX
<button onClick={() => search()}>Search</button>
<input onKeyUp={(e) => onKeyUp(e)} />

// Angular: parentheses syntax
<button (click)="search()">Search</button>
<input (keyup)="onKeyUp($event)" />

// Bonus — pseudo-event filter (only fires on Enter):
<input (keyup.enter)="search()" />`,
      explain:
        "Parentheses = event binding in Angular. $event gives you the native DOM event. (keyup.enter) is a shortcut that only fires on Enter key — great for search inputs and a good thing to mention in interviews.",
    },
    evaluate: (ans) => {
      const a = ans.toLowerCase().replace(/\s+/g, "");
      const hasClick = a.includes("(click)") && a.includes("search()");
      const hasKeyup = a.includes("(keyup)") && a.includes("$event");
      if (hasClick && hasKeyup) return "correct";
      if (hasClick || hasKeyup) return "partial";
      return "wrong";
    },
    feedback_correct: "✅ Correct. (click)=\"search()\" and (keyup)=\"onKeyUp($event)\". Interview tip: mention (keyup.enter) as a useful pseudo-event filter.",
    feedback_partial: "Good start — make sure you have BOTH: (click)=\"search()\" on the button AND (keyup)=\"onKeyUp($event)\" on the input.",
    feedback_wrong: `<input (keyup)="onKeyUp($event)" placeholder="Origin" />\n<button (click)="search()">Search</button>`,
    expected: `<input (keyup)="onKeyUp($event)" placeholder="Origin" />\n<button (click)="search()">Search</button>`,
    type_input: "code",
  },

  {
    id: "step3",
    type: "question",
    phase: "Step 3 of 7",
    paal: "Add an origin input with two-way binding to the 'origin' component property. Show the current value of origin below it using interpolation.",
    hint: "Two-way binding uses [(ngModel)]. You need FormsModule imported for this to work.",
    answer_keywords: ["[(ngmodel)]", "origin", "{{origin}}"],
    seed_code: `<!-- Step 3: Two-way binding -->
<!-- component has: origin = '' property -->
<!-- FormsModule must be imported -->

<div class="origin-field">
  <!-- input with two-way binding to origin -->

  <!-- display current origin value below -->

</div>`,
    analogy: {
      title: "How [(ngModel)] works internally",
      code: `// [(ngModel)] is syntactic sugar — banana in a box
// These two are identical:

<input [(ngModel)]="origin">

<input [ngModel]="origin"
       (ngModelChange)="origin = $event">

// [ ] = property binding (model → view)
// ( ) = event binding (view → model)
// [( )] = both directions simultaneously`,
      explain:
        "[(ngModel)] is called 'banana in a box'. Internally it's [ngModel] + (ngModelChange) combined. Key interview point: you MUST import FormsModule for ngModel to work. Forgetting this is the #1 Angular beginner mistake.",
    },
    evaluate: (ans) => {
      const a = ans.toLowerCase().replace(/\s+/g, "");
      const hasTwoWay = a.includes("[(ngmodel)]") && a.includes("origin");
      const hasDisplay = a.includes("{{origin}}");
      if (hasTwoWay && hasDisplay) return "correct";
      if (hasTwoWay) return "partial";
      return "wrong";
    },
    feedback_correct: "✅ Correct. [(ngModel)]=\"origin\" — banana in a box. Interview answer: 'Internally it's [ngModel] + (ngModelChange) combined. Requires FormsModule.'",
    feedback_partial: "Good — you have two-way binding. Now also display the current value using {{origin}} so we can see it updating live.",
    feedback_wrong: `<input [(ngModel)]="origin" placeholder="Enter origin city">\n<p>You typed: {{ origin }}</p>`,
    expected: `<input [(ngModel)]="origin" placeholder="Enter origin city">\n<p>You typed: {{ origin }}</p>`,
    type_input: "code",
  },

  {
    id: "step4",
    type: "question",
    phase: "Step 4 of 7",
    paal: "Show a loading spinner ONLY when isLoading is true — remove it from DOM completely when false. Show a 'No results' message that stays in DOM but is CSS-hidden when hasResults is true.",
    hint: "*ngIf removes the element from DOM. [hidden] just sets display:none. Choose the right one for each.",
    answer_keywords: ["*ngif", "isloading", "[hidden]", "hasresults"],
    seed_code: `<!-- Step 4: *ngIf vs [hidden] -->
<!-- component has: isLoading = false, hasResults = true -->

<div class="results-area">
  <!-- spinner: remove from DOM when not loading -->

  <!-- no-results: stays in DOM, just hidden when results exist -->

  <div class="results-list">Results go here...</div>
</div>`,
    analogy: {
      title: "*ngIf vs [hidden] — when to use each",
      code: `<!-- *ngIf: REMOVES element from DOM entirely -->
<div *ngIf="isLoading">
  <app-spinner></app-spinner>  <!-- destroyed when false -->
</div>

<!-- [hidden]: stays in DOM, just CSS display:none -->
<div [hidden]="hasResults">
  No flights found.
</div>

<!-- WHEN TO USE WHICH:
  *ngIf  → heavy components, lifecycle matters, security
  [hidden] → simple elements, fast toggle, preserve state

  TRAP: *ngIf on a component resets its state every toggle
  TRAP: [hidden] elements still run change detection -->`,
      explain:
        "This is a favourite interview question. *ngIf completely removes the element — the component is destroyed and recreated each toggle. [hidden] just adds display:none — component stays alive. Use *ngIf when you don't want the component running. Use [hidden] when you need to preserve component state.",
    },
    evaluate: (ans) => {
      const a = ans.toLowerCase().replace(/\s+/g, "");
      const hasNgIf = a.includes("*ngif") && a.includes("isloading");
      const hasHidden = a.includes("[hidden]") && a.includes("hasresults");
      if (hasNgIf && hasHidden) return "correct";
      if (hasNgIf || hasHidden) return "partial";
      return "wrong";
    },
    feedback_correct: "✅ Perfect. *ngIf=\"isLoading\" destroys/recreates the spinner. [hidden]=\"hasResults\" keeps the no-results div alive but invisible. Interview answer ready.",
    feedback_partial: "You have one correct — make sure *ngIf is on the spinner (isLoading) and [hidden] is on the no-results message (hasResults).",
    feedback_wrong: `<div *ngIf="isLoading">\n  <span class="spinner">Searching...</span>\n</div>\n<div [hidden]="hasResults">\n  No flights found.\n</div>`,
    expected: `<div *ngIf="isLoading">\n  <span class="spinner">Searching...</span>\n</div>\n<div [hidden]="hasResults">\n  No flights found.\n</div>`,
    type_input: "code",
  },

  {
    id: "step5",
    type: "question",
    phase: "Step 5 of 7",
    paal: "Render a flights list using *ngFor. Each flight has flightNumber, origin, destination. Add trackBy using a trackByFlight method to prevent unnecessary DOM re-renders.",
    hint: "trackBy takes index and item, returns a unique identifier. It's a method on the component class.",
    answer_keywords: ["*ngfor", "let flight of", "trackby", "flightnumber"],
    seed_code: `<!-- Step 5: *ngFor with trackBy -->
<!-- component has: flights: Flight[], trackByFlight(index, flight) method -->

<ul class="flight-list">
  <!-- render each flight, track by flightNumber -->

</ul>`,
    analogy: {
      title: "trackBy — why it matters at scale",
      code: `<!-- WITHOUT trackBy: Angular re-renders entire list on any change -->
<li *ngFor="let flight of flights">
  {{ flight.flightNumber }}
</li>

<!-- WITH trackBy: only changed items re-render -->
<li *ngFor="let flight of flights; trackBy: trackByFlight">
  {{ flight.flightNumber }}
</li>

// Component class:
trackByFlight(index: number, flight: Flight): string {
  return flight.flightNumber;  // ← like React's key prop
}`,
      explain:
        "trackBy is Angular's equivalent of React's key prop. Without it, when the flights array changes, Angular tears down and rebuilds every DOM node even if 90% of flights are unchanged. With trackBy, Angular only touches nodes that actually changed. At United's scale — this matters.",
    },
    evaluate: (ans) => {
      const a = ans.toLowerCase().replace(/\s+/g, "");
      // Match against space-stripped string: "let flight of" → "letflightof"
      const hasNgFor = a.includes("*ngfor") && a.includes("letflightof");
      const hasTrackBy = a.includes("trackby");
      const showsData = a.includes("flightnumber") || a.includes("flight.origin") || a.includes("flight.destination");
      if (hasNgFor && hasTrackBy && showsData) return "correct";
      if (hasNgFor && hasTrackBy) return "partial";
      return "wrong";
    },
    feedback_correct: "✅ Correct. trackBy: trackByFlight tells Angular to use flightNumber as the identity key. Interview line: 'Without trackBy, Angular destroys and recreates every list item on each change.'",
    feedback_partial: "Good — you have *ngFor and trackBy. Now display some flight data inside the li element.",
    feedback_wrong: `<li *ngFor="let flight of flights; trackBy: trackByFlight">\n  {{ flight.flightNumber }} — {{ flight.origin }} → {{ flight.destination }}\n</li>`,
    expected: `<li *ngFor="let flight of flights; trackBy: trackByFlight">\n  {{ flight.flightNumber }} — {{ flight.origin }} → {{ flight.destination }}\n</li>`,
    type_input: "code",
  },

  {
    id: "step6",
    type: "question",
    phase: "Step 6 of 7",
    paal: "In the template only: the component already has flights$ and isLoading$. Write template markup that (1) shows a spinner when isLoading$ is true, and (2) unwraps flights$ with the async pipe using 'as flights' and uses *ngFor over that local variable. No TypeScript — template only.",
    hint: "Use *ngIf=\"isLoading$ | async\" for the spinner. Use *ngIf=\"flights$ | async as flights\" to unwrap; then *ngFor over flights inside that block.",
    answer_keywords: ["async", "flights$", "|", "as flights"],
    seed_code: `<!-- Step 6: template only — component already has flights$ and isLoading$ -->
<!-- Write only HTML/template below; no .ts code -->

<div class="async-results">
  <!-- 1) spinner while isLoading$ | async is true -->

  <!-- 2) *ngIf="flights$ | async as flights" then *ngFor over flights -->

</div>`,
    analogy: {
      title: "async pipe vs manual subscribe",
      code: `// BAD — manual subscribe (memory leak risk)
ngOnInit() {
  this.flights$.subscribe(f => { this.flights = f; });
}
// must manually unsubscribe in ngOnDestroy!

// GOOD — async pipe handles everything
<ng-container *ngIf="flights$ | async as flights">
  <li *ngFor="let flight of flights; trackBy: trackByFlight">
    {{ flight.flightNumber }}
  </li>
</ng-container>

// async pipe:
// 1. Auto-subscribes when component renders
// 2. Triggers change detection on new value
// 3. Auto-unsubscribes when component destroys
// 4. No takeUntil boilerplate needed`,
      explain:
        "The async pipe auto-subscribes and auto-unsubscribes — no memory leak risk. The 'as flights' syntax unwraps the Observable value into a local template variable for *ngFor to use.",
    },
    evaluate: (ans) => {
      const a = ans.toLowerCase().replace(/\s+/g, "");
      const hasAsync = a.includes("|async") || a.includes("| async");
      const hasFlights$ = a.includes("flights$");
      const hasAs = a.includes("asflights"); // normalized: "as flights" → "asflights"
      const hasLoading$ = a.includes("isloading$");
      if (hasAsync && hasFlights$ && hasAs && hasLoading$) return "correct";
      if (hasAsync && hasFlights$ && hasAs) return "partial";
      if (hasAsync && hasFlights$) return "partial";
      return "wrong";
    },
    feedback_correct: "✅ Perfect. Interview answer: 'I use async pipe over manual subscribe because it handles subscription lifecycle automatically — no takeUntil boilerplate, no memory leak risk.'",
    feedback_partial: "Good — you're using async pipe. If you're still partial: (1) use *ngIf=\"flights$ | async as flights\" to unwrap, and (2) for the spinner use isLoading$ | async (the component has an Observable, not a plain isLoading property).",
    feedback_wrong: `<div *ngIf="isLoading$ | async">Searching...</div>\n<ng-container *ngIf="flights$ | async as flights">\n  <li *ngFor="let flight of flights; trackBy: trackByFlight">\n    {{ flight.flightNumber }}\n  </li>\n</ng-container>`,
    expected: `<div *ngIf="isLoading$ | async">Searching...</div>\n<ng-container *ngIf="flights$ | async as flights">\n  <li *ngFor="let flight of flights; trackBy: trackByFlight">\n    {{ flight.flightNumber }}\n  </li>\n</ng-container>`,
    type_input: "code",
  },

  {
    id: "step7",
    type: "question",
    phase: "Step 7 of 7",
    paal: "Write a pure pipe called 'statusLabel' that transforms 'ON_TIME' to '✅ On Time', 'DELAYED' to '⚠️ Delayed', 'CANCELLED' to '❌ Cancelled'.",
    hint: "A pipe uses @Pipe decorator with name. It implements PipeTransform with a transform() method. pure: true is the default.",
    answer_keywords: ["@pipe", "pipetransform", "transform", "statuslabel"],
    seed_code: `// Step 7: Create the statusLabel pipe
import { Pipe, PipeTransform } from '@angular/core';

// Add @Pipe decorator and implement PipeTransform

`,
    analogy: {
      title: "Pure vs Impure pipe — the performance trap",
      code: `// PURE (default) — only re-runs when INPUT VALUE changes
@Pipe({ name: 'statusLabel', pure: true })
export class StatusLabelPipe implements PipeTransform {
  transform(status: string): string {
    const map: Record<string, string> = {
      ON_TIME: '✅ On Time',
      DELAYED: '⚠️ Delayed',
      CANCELLED: '❌ Cancelled'
    };
    return map[status] ?? status;
  }
}

// IMPURE (pure: false) — re-runs on EVERY change detection cycle
// Even if the input didn't change
// Use only when pipe must react to mutations inside objects/arrays
@Pipe({ name: 'filterFlights', pure: false })  // ← danger zone`,
      explain:
        "Pure pipes run only when the input reference changes — Angular caches results. Impure pipes run on every change detection cycle, even if nothing changed. At United's scale with hundreds of flights — an impure pipe would run hundreds of times per second.",
    },
    evaluate: (ans) => {
      const a = ans.toLowerCase().replace(/\s+/g, "");
      const hasPipe = a.includes("@pipe");
      const hasTransform = a.includes("pipetransform") && a.includes("transform(");
      const hasMapping = a.includes("on_time") || a.includes("delayed") || a.includes("cancelled");
      if (hasPipe && hasTransform && hasMapping) return "correct";
      if (hasPipe && hasTransform) return "partial";
      return "wrong";
    },
    feedback_correct: "✅ Correct. Pure pipes are cached — Angular only re-runs when input reference changes. Interview line: 'Impure pipes run on every change detection cycle — at scale, this tanks performance.'",
    feedback_partial: "You have the pipe structure — now add the status mapping: ON_TIME → '✅ On Time', DELAYED → '⚠️ Delayed', CANCELLED → '❌ Cancelled'.",
    feedback_wrong: `@Pipe({ name: 'statusLabel', pure: true })\nexport class StatusLabelPipe implements PipeTransform {\n  transform(status: string): string {\n    const map: Record<string, string> = {\n      ON_TIME: '✅ On Time',\n      DELAYED: '⚠️ Delayed',\n      CANCELLED: '❌ Cancelled'\n    };\n    return map[status] ?? status;\n  }\n}`,
    expected: `@Pipe({ name: 'statusLabel', pure: true })\nexport class StatusLabelPipe implements PipeTransform {\n  transform(status: string): string {\n    const map: Record<string, string> = {\n      ON_TIME: '✅ On Time',\n      DELAYED: '⚠️ Delayed',\n      CANCELLED: '❌ Cancelled'\n    };\n    return map[status] ?? status;\n  }\n}`,
    type_input: "code",
  },

  {
    id: "step_full",
    type: "question",
    phase: "Full component",
    editor: "tabbed",
    paal: "Put it together: write the full FlightSearchComponent in the tabs below — TypeScript class (properties, methods), HTML template (all bindings from the previous steps), and optional CSS.",
    hint: "Use the three tabs to edit .ts, .html, and .css. Combine what you practiced: interpolation, property/event/two-way binding, *ngIf, [hidden], *ngFor with trackBy, async pipe, and the statusLabel pipe.",
    seed_code: {
      ts: `import { Component } from '@angular/core';
import { of } from 'rxjs';

@Component({
  selector: 'app-flight-search',
  templateUrl: './flight-search.component.html',
  styleUrls: ['./flight-search.component.css'],
})
export class FlightSearchComponent {
  title = 'Search Flights';
  logoUrl = '/assets/logo.png';
  origin = '';
  isLoading = false;
  hasResults = true;
  flights: any[] = [];
  flights$ = of([]); // replace with your observable
  search(): void {}
  onKeyUp(event: Event): void {}
  trackByFlightId(index: number, flight: any): number { return flight?.id ?? index; }
}`,
      html: `<!-- Combine all bindings from the steps above -->`,
      css: `.search-header { margin-bottom: 1rem; }`,
    },
    expected: {
      ts: `import { Component } from '@angular/core';
import { of } from 'rxjs';

@Component({
  selector: 'app-flight-search',
  templateUrl: './flight-search.component.html',
  styleUrls: ['./flight-search.component.css'],
})
export class FlightSearchComponent {
  title = 'Search Flights';
  logoUrl = '/assets/logo.png';
  origin = '';
  isLoading = false;
  hasResults = true;
  flights: any[] = [];
  flights$ = of([]);
  search(): void {}
  onKeyUp(event: Event): void {}
  trackByFlightId(index: number, flight: any): number { return flight?.id ?? index; }
}`,
      html: `<div class="search-header"><h1>{{ title }}</h1><img [src]="logoUrl" alt="Logo"></div>
<div class="search-controls"><input (keyup)="onKeyUp($event)" [(ngModel)]="origin" placeholder="Origin"><button (click)="search()">Search</button></div>
<div *ngIf="isLoading">Loading...</div>
<div [hidden]="!hasResults">No results</div>
<div *ngFor="let flight of flights$ | async as flights; trackBy: trackByFlightId">{{ flight.destination }} — {{ flight.status | statusLabel }}</div>`,
      css: `.search-header { margin-bottom: 1rem; }\n.search-controls { display: flex; gap: 0.5rem; }`,
    },
    evaluate: (ans) => {
      if (!ans || typeof ans !== "object") return "wrong";
      const ts = (ans.ts || "").toLowerCase().replace(/\s+/g, "");
      const html = (ans.html || "").toLowerCase().replace(/\s+/g, "");
      const hasClass = ts.includes("flightsearchcomponent") || ts.includes("component");
      const hasInterp = html.includes("{{title}}");
      const hasBinding = (html.includes("[src]") && html.includes("logourl")) || html.includes("[src]");
      const hasNgModel = html.includes("ngmodel") && html.includes("origin");
      const hasClick = html.includes("(click)") && html.includes("search()");
      const hasNgIf = html.includes("ngif");
      const hasNgFor = html.includes("ngfor") || html.includes("async");
      const hasPipe = html.includes("statuslabel");
      const count = [hasClass, hasInterp, hasBinding, hasNgModel, hasClick, hasNgIf, hasNgFor, hasPipe].filter(Boolean).length;
      if (count >= 7) return "correct";
      if (count >= 5) return "partial";
      return "wrong";
    },
    feedback_correct: "✅ Full component with TS, template, and styles. You've combined all binding types in one place.",
    feedback_partial: "Good progress. Check that you have: component class, interpolation, property/event/two-way binding, *ngIf, *ngFor or async pipe, and the statusLabel pipe.",
    feedback_wrong: "Review the previous steps and combine: component class (TS), template with {{ }}, [ ], ( ), [( )], *ngIf, [hidden], *ngFor + async pipe, and statusLabel pipe.",
    type_input: "code",
  },

  {
    id: "anchor1",
    type: "anchor",
    phase: "Anchor Card",
    rule: "[] = in. () = out. [()] = both. {{ }} = text only.",
    when: "Any Angular template — brackets for DOM properties, parens for events, banana-in-box for two-way, mustache for text content.",
    mistake: "Using src=\"{{ url }}\" instead of [src]=\"url\" — interpolation creates string 'null' if url is null. Property binding omits the attribute entirely.",
  },

  {
    id: "anchor2",
    type: "anchor",
    phase: "Anchor Card",
    rule: "*ngIf removes from DOM. [hidden] hides with CSS. async pipe auto-unsubscribes.",
    when: "Use *ngIf when the component should not run. Use [hidden] to preserve state. Use async pipe instead of manual subscriptions.",
    mistake: "Using *ngIf on a stateful component that should preserve data — it gets destroyed and recreated each toggle.",
  },

  {
    id: "wfs",
    type: "wfs",
    phase: "Write From Scratch",
    rubric: [
      "{{interpolation}} for text, [property] binding for HTML attributes",
      "(click)=\"method()\" and (keyup)=\"method($event)\" event binding",
      "[(ngModel)]=\"property\" — and can explain it's [ngModel] + (ngModelChange)",
      "*ngIf=\"isLoading\" on spinner (removes from DOM)",
      "[hidden]=\"hasResults\" on no-results (CSS only, stays in DOM)",
      "*ngFor=\"let x of list; trackBy: trackByFn\" with trackBy method",
      "async pipe: *ngIf=\"data$ | async as data\" unwrapping pattern",
      "Pure @Pipe with PipeTransform and transform() method",
      "Can explain: why pure pipes are safe, why impure pipes are dangerous",
      "Can explain: why FormsModule is required for [(ngModel)]",
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
  main: { flex: 1, minHeight: 0, display: "flex", flexDirection: "column", overflow: "hidden", padding: "24px 40px 24px 40px", maxWidth: "720px" },
  mainScroll: { flex: 1, minHeight: 0, overflow: "auto", display: "flex", flexDirection: "column" },
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
  btn: (variant) => ({ padding: "10px 20px", borderRadius: "6px", border: "none", fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: "12px", cursor: "pointer", letterSpacing: "0.05em", ...(variant === "primary" ? { background: "linear-gradient(135deg,#7c3aed,#06b6d4)", color: "#fff" } : variant === "secondary" ? { background: "#1a1d2e", border: "1px solid #2d3748", color: "#94a3b8" } : { background: "transparent", border: "1px solid #2d3748", color: "#4a5568", fontSize: "11px" }) }),
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
  { id: "step1", label: "Interpolation vs []" },
  { id: "step2", label: "Event Binding ()" },
  { id: "step3", label: "Two-way [()]" },
  { id: "step4", label: "*ngIf vs [hidden]" },
  { id: "step5", label: "*ngFor + trackBy" },
  { id: "step6", label: "async pipe" },
  { id: "step7", label: "Pure Pipe" },
  { id: "step_full", label: "Full component (TS/HTML/CSS)" },
  { id: "anchor1", label: "Anchor 1" },
  { id: "anchor2", label: "Anchor 2" },
  { id: "wfs", label: "Write From Scratch" },
];

export default function AngularA02DataBinding({ onNextLesson }) {
  const [nodeIndex, setNodeIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [showAnalogy, setShowAnalogy] = useState(false);
  const [showExpected, setShowExpected] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [completedNodes, setCompletedNodes] = useState([]);
  const [wfsChecked, setWfsChecked] = useState([]);

  const node = NODES[nodeIndex];
  const progress = Math.round((completedNodes.length / NODES.length) * 100);

  // Per-node answer with carry-forward from last answered question step (or tabbed seed for tabbed steps)
  const currentAnswer = (() => {
    if (answers[node.id] !== undefined) return answers[node.id];
    if (node.type === "question") {
      if (node.editor === "tabbed") return node.seed_code || { ts: "", html: "", css: "" };
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

  const isTabbedStep = node.type === "question" && node.editor === "tabbed";
  const tabbedHasContent = isTabbedStep && currentAnswer && typeof currentAnswer === "object" &&
    ((currentAnswer.ts || "").trim() || (currentAnswer.html || "").trim() || (currentAnswer.css || "").trim());

  const [mainTab, setMainTab] = useState("editor");
  const getOutputPreview = (answer) => {
    let a = typeof answer === "string"
      ? (() => { try { const p = JSON.parse(answer); return p && typeof p === "object" ? p : { html: "", css: "" }; } catch (_) { return { html: "", css: "" }; } })()
      : (answer && typeof answer === "object" ? answer : { html: "", css: "" });
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${(a.css || "").trim()}</style></head><body>${(a.html || "").trim() || "<p>No HTML yet</p>"}</body></html>`;
  };

  useEffect(() => { setMainTab("lesson"); }, [nodeIndex]);

  function next() {
    if (!completedNodes.includes(node.id)) setCompletedNodes((p) => [...p, node.id]);
    setNodeIndex((i) => i + 1);
    setResult(null); setShowAnalogy(false); setShowExpected(false);
  }

  function evaluate() {
    let toEval;
    if (isTabbedStep) {
      if (!tabbedHasContent) return;
      const ts = (currentAnswer?.ts ?? "").trim();
      const html = (currentAnswer?.html ?? "").trim();
      const css = (currentAnswer?.css ?? "").trim();
      toEval = mergeAngularCssIntoTS(mergeAngularTsWithHtml(ts, html), css);
    } else {
      if (!(typeof currentAnswer === "string" && currentAnswer.trim())) return;
      toEval = currentAnswer;
    }
    let res;
    if (node.evaluate) {
      res = node.evaluate(toEval);
    } else {
      const a = typeof toEval === "string" ? toEval.toLowerCase() : "";
      const hits = (node.answer_keywords || []).filter((k) => a.includes(k.toLowerCase())).length;
      res = hits === node.answer_keywords.length ? "correct" : hits >= node.answer_keywords.length * 0.6 ? "partial" : "wrong";
    }
    setResult(res);
    if (node.hint || node[`feedback_${res}`]) setShowFeedbackModal(true);
    if (res === "correct" && !completedNodes.includes(node.id)) setCompletedNodes((p) => [...p, node.id]);
  }

  function getFeedback() {
    if (!result) return null;
    const fb = node[`feedback_${result}`];
    const toEval = isTabbedStep
      ? mergeAngularCssIntoTS(mergeAngularTsWithHtml((currentAnswer?.ts ?? "").trim(), (currentAnswer?.html ?? "").trim()), (currentAnswer?.css ?? "").trim())
      : currentAnswer;
    return typeof fb === "function" ? fb(toEval) : fb;
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
      <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0, overflow: "hidden", width: "100%" }}>
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
            <div style={{ flexShrink: 0, fontSize: "11px", color: "#00d4ff", fontWeight: 600, letterSpacing: "0.05em", marginBottom: "4px" }}>CODE BUILT SO FAR — edit below</div>
            <div style={{ flex: 1, minHeight: 280, overflow: "hidden", display: "flex", flexDirection: "column" }}>
              {isTabbedStep ? (
                <AngularTabbedEditor value={currentAnswer} onChange={setCurrentAnswer} height="100%" />
              ) : (
                <CodeEditor value={currentAnswer} onChange={setCurrentAnswer} height="100%" />
              )}
            </div>
            <div style={{ flexShrink: 0, paddingTop: "12px", borderTop: "1px solid #e2e8f0", marginTop: "8px" }}>
              {(node.hint || feedback) && (
                <button type="button" style={{ ...s.btn("secondary"), marginBottom: "12px" }} onClick={() => setShowFeedbackModal(true)}>💡 VIEW HINT & FEEDBACK</button>
              )}
              {showExpected && node.expected && (
                <div style={{ ...s.pre, borderLeft: "2px solid #10b981", marginBottom: "16px" }}>
                  <div style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.15em", color: "#10b981", marginBottom: "8px" }}>MODEL ANSWER</div>
                  {typeof node.expected === "object" && node.expected !== null ? (
                    <>
                      <div style={{ fontSize: "10px", fontWeight: 700, color: "#94a3b8", marginBottom: "6px" }}>TypeScript</div>
                      <pre style={{ margin: "0 0 12px 0", whiteSpace: "pre-wrap" }}>{node.expected.ts}</pre>
                      <div style={{ fontSize: "10px", fontWeight: 700, color: "#94a3b8", marginBottom: "6px" }}>HTML</div>
                      <pre style={{ margin: "0 0 12px 0", whiteSpace: "pre-wrap" }}>{node.expected.html}</pre>
                      <div style={{ fontSize: "10px", fontWeight: 700, color: "#94a3b8", marginBottom: "6px" }}>CSS</div>
                      <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>{node.expected.css}</pre>
                    </>
                  ) : (
                    node.expected
                  )}
                </div>
              )}
              <div style={s.btnRow}>
                <button style={s.btn("primary")} onClick={evaluate} disabled={isTabbedStep ? !tabbedHasContent : !currentAnswer.trim()}>CHECK →</button>
                {node.analogy && <button style={s.btn("secondary")} onClick={() => setShowAnalogy(true)}>SEE ANALOGY</button>}
                {result && result !== "correct" && <button style={s.btn("secondary")} onClick={() => setShowExpected(true)}>SHOW ANSWER</button>}
                {result === "correct" && <button style={s.btn("primary")} onClick={next}>NEXT →</button>}
                {result && result !== "correct" && <button style={{ ...s.btn("secondary"), marginLeft: "auto" }} onClick={next}>SKIP →</button>}
              </div>
            </div>
            {showFeedbackModal && (node.hint || feedback) && (
              <div
                style={{ position: "fixed", inset: 0, zIndex: 10000, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(15,23,42,0.5)", padding: "24px", boxSizing: "border-box" }}
                onClick={() => setShowFeedbackModal(false)}
                role="dialog"
                aria-modal="true"
                aria-labelledby="feedback-modal-title"
              >
                <div
                  style={{ background: "#ffffff", borderRadius: "12px", padding: "24px", maxWidth: "520px", width: "100%", maxHeight: "80vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.2)", border: "1px solid #e2e8f0" }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div id="feedback-modal-title" style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.05em", color: "#64748b", marginBottom: "16px" }}>HINT & FEEDBACK</div>
                  {node.hint && <div style={{ ...s.hint, marginBottom: feedback ? "16px" : 0 }}>💡 {node.hint}</div>}
                  {feedback && <div style={s.feedback(result)}>{feedback}</div>}
                  <div style={{ marginTop: "20px", display: "flex", justifyContent: "flex-end" }}>
                    <button type="button" style={s.btn("primary")} onClick={() => setShowFeedbackModal(false)}>Close</button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    );
    return (
      <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <LessonEditorOutputTabs
          node={node}
          nodes={NODES}
          mainTab={mainTab}
          setMainTab={setMainTab}
          answer={isTabbedStep ? (currentAnswer && typeof currentAnswer === "object" ? JSON.stringify(currentAnswer) : "") : (currentAnswer || "")}
          getOutputPreview={isTabbedStep ? getOutputPreview : undefined}
        >
          {editorContent}
        </LessonEditorOutputTabs>
      </div>
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
        <div style={s.pre}>{`Close this panel. Open a blank file.\nWrite the FlightSearch template from memory — all 4 binding types, *ngIf, [hidden], *ngFor with trackBy, async pipe, and the statusLabel pipe.`}</div>
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
            <div style={s.feedback("correct")}>{`✅ Engine ANG02 Complete — Data Binding mastered.\nNext: ANG03 — Services & Dependency Injection`}</div>
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
        <h1 style={{ ...s.h1, textAlign: "center" }}>Engine ANG02 Complete</h1>
        <p style={{ color: "#4a5568", fontSize: "13px" }}>Data Binding — mastered.</p>
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
        <div style={s.engineTag}>ANG02 — DATA BINDING</div>
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
        <div style={s.main}>
          <div style={s.mainScroll}>{renderNode()}</div>
        </div>
      </div>
    </div>
  );
}
